import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoCapture } from '@/components/VideoCapture';
import { PostureAnalysis } from '@/components/PostureAnalysis';
import { StatsPanel } from '@/components/StatsPanel';
import { ActivitySelector } from '@/components/ActivitySelector';
import { Camera, Upload, Activity, Settings } from 'lucide-react';

export type ActivityType = 'squat' | 'desk-sitting';
export type PostureStatus = 'good' | 'warning' | 'bad' | 'neutral';

export interface PostureData {
  timestamp: number;
  status: PostureStatus;
  warnings: string[];
  confidence: number;
  keyPoints?: any[];
}

const Index = () => {
  const [currentActivity, setCurrentActivity] = useState<ActivityType>('squat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [postureData, setPostureData] = useState<PostureData[]>([]);
  const [currentPosture, setCurrentPosture] = useState<PostureData | null>(null);

  const handlePostureUpdate = (data: PostureData) => {
    setCurrentPosture(data);
    setPostureData(prev => [...prev.slice(-49), data]); // Keep last 50 readings
  };

  const getStatusColor = (status: PostureStatus) => {
    switch (status) {
      case 'good': return 'bg-posture-good';
      case 'warning': return 'bg-posture-warning';
      case 'bad': return 'bg-posture-bad';
      default: return 'bg-posture-neutral';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">PostureGuard AI</h1>
                <p className="text-sm text-muted-foreground">Real-time posture monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentPosture && (
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(currentPosture.status)} border-0 text-foreground`}
                >
                  {currentPosture.status.toUpperCase()}
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ActivitySelector 
              currentActivity={currentActivity}
              onActivityChange={setCurrentActivity}
            />
            
            <StatsPanel postureData={postureData} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6 shadow-card">
              <Tabs defaultValue="webcam" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="webcam" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Live Camera
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Video
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="webcam" className="space-y-6">
                  <VideoCapture
                    mode="webcam"
                    activity={currentActivity}
                    onPostureUpdate={handlePostureUpdate}
                    isAnalyzing={isAnalyzing}
                    setIsAnalyzing={setIsAnalyzing}
                  />
                </TabsContent>

                <TabsContent value="upload" className="space-y-6">
                  <VideoCapture
                    mode="upload"
                    activity={currentActivity}
                    onPostureUpdate={handlePostureUpdate}
                    isAnalyzing={isAnalyzing}
                    setIsAnalyzing={setIsAnalyzing}
                  />
                </TabsContent>
              </Tabs>

              {/* Real-time Analysis Panel */}
              {isAnalyzing && (
                <PostureAnalysis 
                  currentPosture={currentPosture}
                  activity={currentActivity}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
