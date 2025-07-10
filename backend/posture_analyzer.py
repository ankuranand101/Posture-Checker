#!/usr/bin/env python3
"""
PostureGuard AI - Posture Analysis Engine
Rule-based posture detection using MediaPipe
"""

import cv2
import numpy as np
import mediapipe as mp
import math
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class PostureAnalyzer:
    """Main posture analysis engine using MediaPipe Pose"""
    
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = None
        
        # Pose detection configuration
        self.pose_config = {
            'static_image_mode': False,
            'model_complexity': 1,
            'enable_segmentation': False,
            'min_detection_confidence': 0.7,
            'min_tracking_confidence': 0.5
        }
        
        # Posture analysis rules
        self.rules = {
            'squat': {
                'knee_toe_threshold': 10,      # degrees
                'back_angle_min': 150,         # degrees
                'depth_threshold': 90,         # degrees
                'ankle_knee_ratio': 0.8        # ratio
            },
            'desk_sitting': {
                'neck_angle_max': 30,          # degrees
                'back_straight_tolerance': 15,  # degrees
                'shoulder_level_tolerance': 10, # degrees
                'head_forward_threshold': 20    # degrees
            }
        }
    
    def initialize(self):
        """Initialize MediaPipe Pose"""
        try:
            self.pose = self.mp_pose.Pose(**self.pose_config)
            logger.info("MediaPipe Pose initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize MediaPipe: {str(e)}")
            raise
    
    def analyze_posture(self, image: np.ndarray, activity: str) -> Dict[str, Any]:
        """
        Analyze posture in a single frame
        
        Args:
            image: Input image as numpy array
            activity: Type of activity ('squat' or 'desk_sitting')
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process image with MediaPipe
            results = self.pose.process(rgb_image)
            
            if not results.pose_landmarks:
                return {
                    'timestamp': datetime.now().isoformat(),
                    'status': 'neutral',
                    'warnings': ['No person detected in frame'],
                    'confidence': 0.0,
                    'keypoints': [],
                    'angles': {}
                }
            
            # Extract keypoints
            keypoints = self._extract_keypoints(results.pose_landmarks)
            
            # Calculate angles and distances
            angles = self._calculate_angles(keypoints)
            
            # Analyze posture based on activity
            if activity == 'squat':
                analysis = self._analyze_squat_posture(keypoints, angles)
            else:  # desk_sitting
                analysis = self._analyze_sitting_posture(keypoints, angles)
            
            return {
                'timestamp': datetime.now().isoformat(),
                'status': analysis['status'],
                'warnings': analysis['warnings'],
                'confidence': analysis['confidence'],
                'keypoints': keypoints,
                'angles': angles,
                'measurements': analysis.get('measurements', {})
            }
            
        except Exception as e:
            logger.error(f"Error analyzing posture: {str(e)}")
            return {
                'timestamp': datetime.now().isoformat(),
                'status': 'neutral',
                'warnings': ['Analysis error occurred'],
                'confidence': 0.0,
                'keypoints': [],
                'angles': {}
            }
    
    def analyze_video(self, video_path: str, activity: str) -> List[Dict[str, Any]]:
        """
        Analyze posture in a video file
        
        Args:
            video_path: Path to video file
            activity: Type of activity
            
        Returns:
            List of analysis results for each frame
        """
        results = []
        cap = cv2.VideoCapture(video_path)
        
        frame_count = 0
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Analyze every 5th frame to reduce processing
                if frame_count % 5 == 0:
                    analysis = self.analyze_posture(frame, activity)
                    analysis['frame_number'] = frame_count
                    analysis['timestamp_video'] = frame_count / fps
                    results.append(analysis)
                
                frame_count += 1
                
        finally:
            cap.release()
        
        return results
    
    def _extract_keypoints(self, pose_landmarks) -> List[Dict[str, float]]:
        """Extract keypoint coordinates from MediaPipe landmarks"""
        keypoints = []
        
        for i, landmark in enumerate(pose_landmarks.landmark):
            keypoints.append({
                'id': i,
                'name': self._get_landmark_name(i),
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            })
        
        return keypoints
    
    def _get_landmark_name(self, landmark_id: int) -> str:
        """Get human-readable name for landmark ID"""
        landmark_names = {
            0: 'nose', 1: 'left_eye_inner', 2: 'left_eye', 3: 'left_eye_outer',
            4: 'right_eye_inner', 5: 'right_eye', 6: 'right_eye_outer',
            7: 'left_ear', 8: 'right_ear', 9: 'mouth_left', 10: 'mouth_right',
            11: 'left_shoulder', 12: 'right_shoulder', 13: 'left_elbow', 14: 'right_elbow',
            15: 'left_wrist', 16: 'right_wrist', 17: 'left_pinky', 18: 'right_pinky',
            19: 'left_index', 20: 'right_index', 21: 'left_thumb', 22: 'right_thumb',
            23: 'left_hip', 24: 'right_hip', 25: 'left_knee', 26: 'right_knee',
            27: 'left_ankle', 28: 'right_ankle', 29: 'left_heel', 30: 'right_heel',
            31: 'left_foot_index', 32: 'right_foot_index'
        }
        return landmark_names.get(landmark_id, f'landmark_{landmark_id}')
    
    def _calculate_angles(self, keypoints: List[Dict]) -> Dict[str, float]:
        """Calculate key angles for posture analysis"""
        angles = {}
        
        try:
            # Create lookup for easy keypoint access
            kp_dict = {kp['name']: kp for kp in keypoints}
            
            # Calculate angles
            angles['neck_angle'] = self._calculate_angle(
                kp_dict['left_shoulder'], kp_dict['nose'], kp_dict['right_shoulder']
            )
            
            angles['back_angle'] = self._calculate_angle(
                kp_dict['left_hip'], kp_dict['left_shoulder'], kp_dict['nose']
            )
            
            angles['left_knee_angle'] = self._calculate_angle(
                kp_dict['left_hip'], kp_dict['left_knee'], kp_dict['left_ankle']
            )
            
            angles['right_knee_angle'] = self._calculate_angle(
                kp_dict['right_hip'], kp_dict['right_knee'], kp_dict['right_ankle']
            )
            
            angles['hip_angle'] = self._calculate_angle(
                kp_dict['left_knee'], kp_dict['left_hip'], kp_dict['left_shoulder']
            )
            
        except KeyError as e:
            logger.warning(f"Missing keypoint for angle calculation: {e}")
        
        return angles
    
    def _calculate_angle(self, point1: Dict, point2: Dict, point3: Dict) -> float:
        """Calculate angle between three points"""
        try:
            # Convert to numpy arrays
            p1 = np.array([point1['x'], point1['y']])
            p2 = np.array([point2['x'], point2['y']])
            p3 = np.array([point3['x'], point3['y']])
            
            # Calculate vectors
            v1 = p1 - p2
            v2 = p3 - p2
            
            # Calculate angle
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
            cos_angle = np.clip(cos_angle, -1.0, 1.0)  # Handle floating point errors
            angle = np.arccos(cos_angle)
            
            return math.degrees(angle)
            
        except Exception as e:
            logger.warning(f"Error calculating angle: {e}")
            return 0.0
    
    def _analyze_squat_posture(self, keypoints: List[Dict], angles: Dict) -> Dict[str, Any]:
        """Analyze squat-specific posture rules"""
        warnings = []
        status = 'good'
        confidence = 0.9
        measurements = {}
        
        try:
            kp_dict = {kp['name']: kp for kp in keypoints}
            
            # Rule 1: Knee alignment (knees shouldn't go beyond toes)
            left_knee = kp_dict.get('left_knee')
            left_ankle = kp_dict.get('left_ankle')
            right_knee = kp_dict.get('right_knee')
            right_ankle = kp_dict.get('right_ankle')
            
            if left_knee and left_ankle and left_knee['x'] > left_ankle['x']:
                warnings.append("Left knee extends beyond toe")
                status = 'warning' if status == 'good' else 'bad'
            
            if right_knee and right_ankle and right_knee['x'] > right_ankle['x']:
                warnings.append("Right knee extends beyond toe")
                status = 'warning' if status == 'good' else 'bad'
            
            # Rule 2: Back angle (should be relatively straight)
            back_angle = angles.get('back_angle', 0)
            measurements['back_angle'] = back_angle
            
            if back_angle < self.rules['squat']['back_angle_min']:
                warnings.append(f"Back too hunched (angle: {back_angle:.1f}°)")
                status = 'bad'
            
            # Rule 3: Knee angle (squat depth)
            left_knee_angle = angles.get('left_knee_angle', 0)
            right_knee_angle = angles.get('right_knee_angle', 0)
            avg_knee_angle = (left_knee_angle + right_knee_angle) / 2
            measurements['knee_angle'] = avg_knee_angle
            
            if avg_knee_angle > 120:  # Not deep enough
                warnings.append("Squat not deep enough")
                status = 'warning' if status == 'good' else status
            elif avg_knee_angle < 70:  # Too deep
                warnings.append("Squat too deep")
                status = 'warning' if status == 'good' else status
            
            # Rule 4: Hip hinge pattern
            hip_angle = angles.get('hip_angle', 0)
            measurements['hip_angle'] = hip_angle
            
            if hip_angle > 160:  # Not enough hip hinge
                warnings.append("Need more hip hinge movement")
                status = 'warning' if status == 'good' else status
            
            # Adjust confidence based on warnings
            if warnings:
                confidence = max(0.6, confidence - len(warnings) * 0.1)
            
        except Exception as e:
            logger.error(f"Error in squat analysis: {e}")
            warnings.append("Analysis error occurred")
            status = 'neutral'
            confidence = 0.5
        
        return {
            'status': status,
            'warnings': warnings,
            'confidence': confidence,
            'measurements': measurements
        }
    
    def _analyze_sitting_posture(self, keypoints: List[Dict], angles: Dict) -> Dict[str, Any]:
        """Analyze desk sitting posture rules"""
        warnings = []
        status = 'good'
        confidence = 0.9
        measurements = {}
        
        try:
            kp_dict = {kp['name']: kp for kp in keypoints}
            
            # Rule 1: Neck angle (forward head posture)
            neck_angle = angles.get('neck_angle', 0)
            measurements['neck_angle'] = neck_angle
            
            if neck_angle > self.rules['desk_sitting']['neck_angle_max']:
                warnings.append(f"Neck too far forward (angle: {neck_angle:.1f}°)")
                status = 'bad'
            
            # Rule 2: Back straightness
            back_angle = angles.get('back_angle', 0)
            measurements['back_angle'] = back_angle
            
            if abs(back_angle - 180) > self.rules['desk_sitting']['back_straight_tolerance']:
                warnings.append("Back not straight - sit up straight")
                status = 'warning' if status == 'good' else 'bad'
            
            # Rule 3: Shoulder level
            left_shoulder = kp_dict.get('left_shoulder')
            right_shoulder = kp_dict.get('right_shoulder')
            
            if left_shoulder and right_shoulder:
                shoulder_diff = abs(left_shoulder['y'] - right_shoulder['y'])
                measurements['shoulder_level_diff'] = shoulder_diff
                
                if shoulder_diff > 0.05:  # 5% of image height
                    warnings.append("Shoulders not level")
                    status = 'warning' if status == 'good' else status
            
            # Rule 4: Head alignment
            nose = kp_dict.get('nose')
            left_shoulder = kp_dict.get('left_shoulder')
            right_shoulder = kp_dict.get('right_shoulder')
            
            if nose and left_shoulder and right_shoulder:
                shoulder_center_x = (left_shoulder['x'] + right_shoulder['x']) / 2
                head_forward = abs(nose['x'] - shoulder_center_x)
                measurements['head_forward'] = head_forward
                
                if head_forward > 0.1:  # 10% of image width
                    warnings.append("Head too far forward")
                    status = 'warning' if status == 'good' else status
            
            # Adjust confidence based on warnings
            if warnings:
                confidence = max(0.6, confidence - len(warnings) * 0.1)
            
        except Exception as e:
            logger.error(f"Error in sitting analysis: {e}")
            warnings.append("Analysis error occurred")
            status = 'neutral'
            confidence = 0.5
        
        return {
            'status': status,
            'warnings': warnings,
            'confidence': confidence,
            'measurements': measurements
        }