import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ActivityType, PostureData } from '@/pages/Index';
import { AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

interface PostureAnalysisProps {
  currentPosture: PostureData | null;
  activity: ActivityType;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'good':
      return {
        color: 'text-posture-good',
        bgColor: 'bg-posture-good/10',
        icon: CheckCircle,
        label: 'Excellent Posture'
      };
    case 'warning':
      return {
        color: 'text-posture-warning',
        bgColor: 'bg-posture-warning/10',
        icon: AlertTriangle,
        label: 'Posture Warning'
      };
    case 'bad':
      return {
        color: 'text-posture-bad',
        bgColor: 'bg-posture-bad/10',
        icon: AlertTriangle,
        label: 'Poor Posture'
      };
    default:
      return {
        color: 'text-posture-neutral',
        bgColor: 'bg-posture-neutral/10',
        icon: Clock,
        label: 'Analyzing...'
      };
  }
};

const getActivityTips = (activity: ActivityType) => {
  if (activity === 'squat') {
    return {
      title: 'Squat Form Tips',
      tips: [
        'Keep your chest up and shoulders back',
        'Knees should track over your toes',
        'Descend until thighs are parallel to floor',
        'Keep your core engaged throughout',
        'Push through your heels to stand up'
      ]
    };
  } else {
    return {
      title: 'Desk Posture Tips',
      tips: [
        'Keep your monitor at eye level',
        'Sit back in your chair with back support',
        'Keep feet flat on the floor',
        'Shoulders should be relaxed',
        'Take breaks every 30 minutes'
      ]
    };
  }
};

export const PostureAnalysis: React.FC<PostureAnalysisProps> = ({
  currentPosture,
  activity
}) => {
  if (!currentPosture) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Waiting for posture data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(currentPosture.status);
  const StatusIcon = statusInfo.icon;
  const activityTips = getActivityTips(activity);

  return (
    <div className="mt-6 space-y-4">
      {/* Current Status */}
      <Card className={`border-2 ${statusInfo.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
              {statusInfo.label}
            </CardTitle>
            <Badge variant="outline" className={`${statusInfo.color} border-current`}>
              {Math.round(currentPosture.confidence * 100)}% confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analysis Confidence</span>
              <span>{Math.round(currentPosture.confidence * 100)}%</span>
            </div>
            <Progress 
              value={currentPosture.confidence * 100} 
              className="h-2"
            />
          </div>

          {/* Warnings */}
          {currentPosture.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Issues Detected:</h4>
              {currentPosture.warnings.map((warning, index) => (
                <Alert key={index} className="border-posture-warning/50 bg-posture-warning/10">
                  <AlertTriangle className="h-4 w-4 text-posture-warning" />
                  <AlertDescription className="text-sm">
                    {warning}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Success Message */}
          {currentPosture.status === 'good' && (
            <Alert className="border-posture-good/50 bg-posture-good/10">
              <CheckCircle className="h-4 w-4 text-posture-good" />
              <AlertDescription className="text-sm">
                Great job! Your {activity === 'squat' ? 'squat form' : 'posture'} is excellent.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Activity Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {activityTips.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {activityTips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground text-center">
        Last updated: {new Date(currentPosture.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};