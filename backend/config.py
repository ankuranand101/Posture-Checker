#!/usr/bin/env python3
"""
PostureGuard AI - Configuration Settings
"""

import os
from typing import List

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'posture-guard-ai-secret-key-2024')
    DEBUG = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:8080').split(',')
    
    # MediaPipe Configuration
    MEDIAPIPE_MODEL_COMPLEXITY = int(os.environ.get('MEDIAPIPE_MODEL_COMPLEXITY', '1'))
    CONFIDENCE_THRESHOLD = float(os.environ.get('CONFIDENCE_THRESHOLD', '0.7'))
    TRACKING_CONFIDENCE = float(os.environ.get('TRACKING_CONFIDENCE', '0.5'))
    
    # Posture Detection Rules
    SQUAT_KNEE_TOE_THRESHOLD = float(os.environ.get('SQUAT_KNEE_TOE_THRESHOLD', '10'))
    SQUAT_BACK_ANGLE_MIN = float(os.environ.get('SQUAT_BACK_ANGLE_MIN', '150'))
    SQUAT_DEPTH_THRESHOLD = float(os.environ.get('SQUAT_DEPTH_THRESHOLD', '90'))
    
    DESK_NECK_ANGLE_MAX = float(os.environ.get('DESK_NECK_ANGLE_MAX', '30'))
    DESK_BACK_STRAIGHT_TOLERANCE = float(os.environ.get('DESK_BACK_STRAIGHT_TOLERANCE', '15'))
    DESK_SHOULDER_LEVEL_TOLERANCE = float(os.environ.get('DESK_SHOULDER_LEVEL_TOLERANCE', '10'))
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', '/tmp/uploads')
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}
    
    # Session Configuration
    SESSION_TIMEOUT = int(os.environ.get('SESSION_TIMEOUT', '3600'))  # 1 hour
    MAX_SESSIONS = int(os.environ.get('MAX_SESSIONS', '100'))
    
    # Analysis Configuration
    ANALYSIS_FRAME_SKIP = int(os.environ.get('ANALYSIS_FRAME_SKIP', '5'))  # Analyze every 5th frame
    MAX_KEYPOINTS_HISTORY = int(os.environ.get('MAX_KEYPOINTS_HISTORY', '100'))
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'posture_guard.log')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:8080', 'http://127.0.0.1:8080']


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    # Production-specific settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')
    
    # Enhanced security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000']


# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}