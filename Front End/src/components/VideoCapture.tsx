import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Play, Pause, Square, AlertTriangle } from 'lucide-react';
import { ActivityType, PostureData, PostureStatus } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface VideoCaptureProps {
  mode: 'webcam' | 'upload';
  activity: ActivityType;
  onPostureUpdate: (data: PostureData) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

// Mock posture detection logic (in real app, this would call the backend)
const analyzePosture = (activity: ActivityType): PostureData => {
  const warnings: string[] = [];
  let status: PostureStatus = 'good';
  
  // Simulate random posture analysis
  const random = Math.random();
  
  if (activity === 'squat') {
    if (random < 0.3) {
      status = 'bad';
      warnings.push('Knee extends beyond toe');
    } else if (random < 0.5) {
      status = 'warning';
      warnings.push('Back angle could be improved');
    }
  } else if (activity === 'desk-sitting') {
    if (random < 0.2) {
      status = 'bad';
      warnings.push('Neck angle > 30°');
    } else if (random < 0.4) {
      status = 'warning';
      warnings.push('Back not straight');
    }
  }
  
  return {
    timestamp: Date.now(),
    status,
    warnings,
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    keyPoints: [] // Would contain actual keypoints from MediaPipe
  };
};

export const VideoCapture: React.FC<VideoCaptureProps> = ({
  mode,
  activity,
  onPostureUpdate,
  isAnalyzing,
  setIsAnalyzing
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [hasCamera, setHasCamera] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    if (mode === 'webcam') {
      checkCameraAccess();
    }
    return () => {
      stopAnalysis();
    };
  }, [mode]);

  const checkCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      console.error('Camera access denied:', error);
      setHasCamera(false);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use live monitoring.",
        variant: "destructive"
      });
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      setUploadedVideo(file);
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.load();
    }
  };

  const startAnalysis = () => {
    if (!videoRef.current) return;
    
    setIsAnalyzing(true);
    
    // Start the video
    videoRef.current.play();
    
    // Analyze posture every 500ms
    intervalRef.current = setInterval(() => {
      const postureData = analyzePosture(activity);
      onPostureUpdate(postureData);
      drawOverlay(postureData);
    }, 500);

    toast({
      title: "Analysis Started",
      description: `Monitoring ${activity} posture in real-time.`,
    });
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const drawOverlay = (postureData: PostureData) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size to match video
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    // Draw status indicator
    const statusColor = postureData.status === 'good' ? '#22c55e' : 
                       postureData.status === 'warning' ? '#f59e0b' : '#ef4444';
    
    ctx.fillStyle = statusColor;
    ctx.fillRect(10, 10, 200, 40);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Status: ${postureData.status.toUpperCase()}`, 20, 32);
    
    // Draw warnings
    if (postureData.warnings.length > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.fillRect(10, 60, 300, postureData.warnings.length * 25 + 10);
      
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      postureData.warnings.forEach((warning, index) => {
        ctx.fillText(`⚠ ${warning}`, 20, 80 + index * 25);
      });
    }
    
    // Draw mock skeleton/keypoints
    if (postureData.status !== 'good') {
      drawMockSkeleton(ctx, canvas.width, canvas.height, postureData.status);
    }
  };

  const drawMockSkeleton = (ctx: CanvasRenderingContext2D, width: number, height: number, status: PostureStatus) => {
    // Draw simple mock skeleton points
    const color = status === 'warning' ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = color;
    
    // Mock keypoints for demonstration
    const points = [
      { x: width * 0.5, y: height * 0.2 }, // Head
      { x: width * 0.5, y: height * 0.35 }, // Neck
      { x: width * 0.5, y: height * 0.6 }, // Torso
      { x: width * 0.4, y: height * 0.8 }, // Left knee
      { x: width * 0.6, y: height * 0.8 }, // Right knee
    ];
    
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <Card className="relative overflow-hidden bg-black">
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          {/* Status Badge */}
          {isAnalyzing && (
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-red-500 text-white border-red-500">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                ANALYZING
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {mode === 'webcam' ? (
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {hasCamera ? 'Camera Ready' : 'No Camera Access'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => document.getElementById('video-upload')?.click()}
                disabled={isAnalyzing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              {uploadedVideo && (
                <span className="text-sm text-muted-foreground">
                  {uploadedVideo.name}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAnalyzing ? (
            <Button
              onClick={startAnalysis}
              disabled={(mode === 'webcam' && !hasCamera) || (mode === 'upload' && !uploadedVideo)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          ) : (
            <Button onClick={stopAnalysis} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop Analysis
            </Button>
          )}
        </div>
      </div>

      {/* Video Progress (for uploaded videos) */}
      {mode === 'upload' && uploadedVideo && duration > 0 && (
        <div className="space-y-2">
          <Progress value={(currentTime / duration) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.floor(currentTime)}s</span>
            <span>{Math.floor(duration)}s</span>
          </div>
        </div>
      )}
    </div>
  );
};