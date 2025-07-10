# PostureGuard AI - Real-time Posture Detection System

A comprehensive web application that detects bad posture using rule-based logic for squats and desk sitting activities. Features real-time analysis with webcam support and video upload capabilities.

## 🌟 Features

- **Real-time Posture Detection**: Live webcam monitoring with instant feedback
- **Video Upload Analysis**: Upload and analyze existing workout videos
- **Rule-based Logic**: 
  - **Squats**: Knee alignment, back angle, depth analysis
  - **Desk Sitting**: Neck angle, back straightness, shoulder position
- **Visual Feedback**: Real-time overlay with posture status and warnings
- **Performance Tracking**: Stats, streaks, and improvement trends
- **Beautiful UI**: Modern, responsive design with dark theme

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Lucide React** icons
- **React Query** for state management
- **Vite** build tool

### Backend
- **Flask** Python web framework
- **MediaPipe** for pose detection
- **OpenCV** for video processing
- **Socket.IO** for real-time communication
- **CORS** for cross-origin requests

## 📁 Project Structure

```
posture-guard-ai/
├── frontend/                 # React frontend (this directory)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── VideoCapture.tsx
│   │   │   ├── PostureAnalysis.tsx
│   │   │   ├── StatsPanel.tsx
│   │   │   └── ActivitySelector.tsx
│   │   ├── pages/           # Page components
│   │   │   └── Index.tsx
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   └── index.css        # Global styles
│   ├── public/              # Static files
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Flask backend
│   ├── app.py              # Main Flask application
│   ├── posture_analyzer.py # Posture detection logic
│   ├── models/             # Data models
│   ├── utils/              # Helper functions
│   ├── requirements.txt    # Python dependencies
│   └── config.py           # Configuration
├── docs/                   # Documentation
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Webcam (for live monitoring)

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   Open http://localhost:8080

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Start Flask server**:
   ```bash
   python app.py
   ```

The backend will run on http://localhost:5000

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
FLASK_PORT=5000
FLASK_DEBUG=true
CORS_ORIGINS=http://localhost:8080

# MediaPipe Configuration  
MEDIAPIPE_MODEL_COMPLEXITY=1
CONFIDENCE_THRESHOLD=0.7

# Posture Detection Rules
SQUAT_KNEE_TOE_THRESHOLD=10  # degrees
SQUAT_BACK_ANGLE_MIN=150     # degrees
DESK_NECK_ANGLE_MAX=30       # degrees
DESK_BACK_STRAIGHT_TOLERANCE=15  # degrees
```

## 📊 Posture Detection Rules

### Squat Analysis
- **Knee Alignment**: Flags if knee extends beyond toe line
- **Back Angle**: Warns if back angle < 150° (hunched forward)
- **Depth**: Monitors squat depth for proper form
- **Balance**: Checks weight distribution

### Desk Sitting Analysis  
- **Neck Angle**: Flags if neck angle > 30° (forward head)
- **Back Posture**: Warns if back isn't straight
- **Shoulder Position**: Monitors shoulder height and alignment
- **Head Position**: Tracks head alignment with spine

## 🔄 API Endpoints

### REST API
- `POST /api/analyze-frame` - Analyze single video frame
- `POST /api/upload-video` - Upload video for analysis
- `GET /api/session-stats` - Get session statistics

### WebSocket Events
- `connect` - Establish real-time connection
- `frame-data` - Send video frame for analysis
- `posture-result` - Receive posture analysis result
- `disconnect` - Close connection

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard:
   - `VITE_API_URL=https://your-backend-url.com`

### Backend Deployment (Railway/Render)

1. **Prepare for deployment**:
   ```bash
   # Create Procfile
   echo "web: python app.py" > Procfile
   ```

2. **Deploy to Railway**:
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Deploy to Render**:
   - Connect GitHub repository  
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `python app.py`

## 📱 Usage

### Live Camera Monitoring
1. Click "Live Camera" tab
2. Allow camera permissions
3. Select activity type (Squat/Desk Sitting)
4. Click "Start Analysis"
5. View real-time posture feedback

### Video Upload Analysis
1. Click "Upload Video" tab
2. Select video file from device
3. Choose activity type
4. Click "Start Analysis"
5. Review frame-by-frame analysis

### Understanding Feedback
- 🟢 **Good**: Excellent posture, keep it up!
- 🟡 **Warning**: Minor issues detected, adjust form
- 🔴 **Bad**: Poor posture, immediate correction needed
- ⚪ **Neutral**: Analyzing or transitioning

## 🧪 Testing

### Frontend Testing
```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
npm run lint        # Check code quality
```

### Backend Testing
```bash
python -m pytest tests/          # Run all tests
python -m pytest tests/test_api.py  # Test API endpoints
python -m pytest tests/test_posture.py  # Test posture logic
```

## 🛠️ Development

### Adding New Activities
1. Update `ActivityType` in `src/pages/Index.tsx`
2. Add rules in `backend/posture_analyzer.py`
3. Update UI components for new activity
4. Add activity-specific tips

### Customizing Detection Rules
Edit `backend/config.py` to adjust thresholds:
```python
POSTURE_RULES = {
    'squat': {
        'knee_toe_threshold': 10,
        'back_angle_min': 150,
        'depth_threshold': 90
    },
    'desk_sitting': {
        'neck_angle_max': 30,
        'back_straight_tolerance': 15
    }
}
```

## 🔗 Live Demo

- **Frontend**: [https://posture-guard-ai.vercel.app](https://posture-guard-ai.vercel.app)
- **Backend API**: [https://posture-guard-api.railway.app](https://posture-guard-api.railway.app)
- **Demo Video**: [https://youtu.be/demo-video](https://youtu.be/demo-video)

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Frontend Components](docs/components.md)
- [Posture Detection Logic](docs/posture-detection.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MediaPipe team for pose detection
- OpenCV community for computer vision tools
- Shadcn/ui for beautiful UI components
- Vercel & Railway for hosting platforms

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/posture-guard-ai/issues)
- Email: support@postureguard.ai
- Discord: [Join our community](https://discord.gg/postureguard)

---

**Built with ❤️ by the PostureGuard AI Team**
