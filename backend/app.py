#!/usr/bin/env python3
"""
PostureGuard AI - Flask Backend Server
Real-time posture detection API with MediaPipe integration
"""

import os
import cv2
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import mediapipe as mp
from datetime import datetime
import logging
from posture_analyzer import PostureAnalyzer
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
cors = CORS(app, origins=app.config['CORS_ORIGINS'])
socketio = SocketIO(app, cors_allowed_origins=app.config['CORS_ORIGINS'])

# Initialize posture analyzer
posture_analyzer = PostureAnalyzer()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Store session data
session_data = {}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/analyze-frame', methods=['POST'])
def analyze_frame():
    """Analyze a single video frame for posture"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1]  # Remove data:image/jpeg;base64,
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Get activity type
        activity = data.get('activity', 'squat')
        
        # Analyze posture
        result = posture_analyzer.analyze_posture(image, activity)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error analyzing frame: {str(e)}")
        return jsonify({'error': 'Failed to analyze frame'}), 500

@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    """Upload and analyze video file"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        activity = request.form.get('activity', 'squat')
        
        if video_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file temporarily
        temp_path = f"/tmp/{video_file.filename}"
        video_file.save(temp_path)
        
        # Process video
        results = posture_analyzer.analyze_video(temp_path, activity)
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'results': results,
            'total_frames': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return jsonify({'error': 'Failed to process video'}), 500

@app.route('/api/session-stats', methods=['GET'])
def get_session_stats():
    """Get current session statistics"""
    session_id = request.args.get('session_id', 'default')
    
    if session_id not in session_data:
        return jsonify({
            'total_frames': 0,
            'good_posture': 0,
            'warning_posture': 0,
            'bad_posture': 0,
            'average_confidence': 0,
            'session_duration': 0
        })
    
    data = session_data[session_id]
    return jsonify(data)

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'Connected to PostureGuard AI'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('start_session')
def handle_start_session(data):
    """Start a new posture monitoring session"""
    session_id = data.get('session_id', request.sid)
    activity = data.get('activity', 'squat')
    
    session_data[session_id] = {
        'activity': activity,
        'start_time': datetime.now(),
        'frames_analyzed': 0,
        'posture_history': [],
        'total_frames': 0,
        'good_posture': 0,
        'warning_posture': 0,
        'bad_posture': 0,
        'average_confidence': 0
    }
    
    emit('session_started', {
        'session_id': session_id,
        'activity': activity,
        'message': f'Started monitoring {activity} posture'
    })

@socketio.on('frame_data')
def handle_frame_data(data):
    """Process real-time frame data"""
    try:
        session_id = data.get('session_id', request.sid)
        image_data = data.get('image')
        activity = data.get('activity', 'squat')
        
        if not image_data:
            emit('error', {'message': 'No image data received'})
            return
        
        # Decode and process image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            emit('error', {'message': 'Invalid image data'})
            return
        
        # Analyze posture
        result = posture_analyzer.analyze_posture(image, activity)
        
        # Update session data
        if session_id in session_data:
            session = session_data[session_id]
            session['frames_analyzed'] += 1
            session['posture_history'].append(result)
            
            # Update statistics
            session['total_frames'] += 1
            if result['status'] == 'good':
                session['good_posture'] += 1
            elif result['status'] == 'warning':
                session['warning_posture'] += 1
            elif result['status'] == 'bad':
                session['bad_posture'] += 1
            
            # Calculate average confidence
            confidences = [r['confidence'] for r in session['posture_history']]
            session['average_confidence'] = sum(confidences) / len(confidences)
            
            # Keep only last 100 frames in history
            session['posture_history'] = session['posture_history'][-100:]
        
        # Send result back to client
        emit('posture_result', result)
        
    except Exception as e:
        logger.error(f"Error processing frame data: {str(e)}")
        emit('error', {'message': 'Failed to process frame'})

@socketio.on('stop_session')
def handle_stop_session(data):
    """Stop posture monitoring session"""
    session_id = data.get('session_id', request.sid)
    
    if session_id in session_data:
        session = session_data[session_id]
        session['end_time'] = datetime.now()
        session['duration'] = (session['end_time'] - session['start_time']).total_seconds()
        
        emit('session_stopped', {
            'session_id': session_id,
            'duration': session['duration'],
            'frames_analyzed': session['frames_analyzed'],
            'statistics': {
                'total_frames': session['total_frames'],
                'good_posture': session['good_posture'],
                'warning_posture': session['warning_posture'],
                'bad_posture': session['bad_posture'],
                'average_confidence': session['average_confidence']
            }
        })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting PostureGuard AI server on port {port}")
    
    # Initialize MediaPipe
    posture_analyzer.initialize()
    
    socketio.run(
        app,
        debug=debug,
        host='0.0.0.0',
        port=port,
        allow_unsafe_werkzeug=True
    )