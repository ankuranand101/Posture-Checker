import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityType } from '@/pages/Index';
import { Dumbbell, MonitorSpeaker, CheckCircle } from 'lucide-react';

interface ActivitySelectorProps {
  currentActivity: ActivityType;
  onActivityChange: (activity: ActivityType) => void;
}

const activities = [
  {
    id: 'squat' as ActivityType,
    name: 'Squat Exercise',
    description: 'Monitor proper squat form',
    icon: Dumbbell,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    rules: [
      'Knee alignment check',
      'Back angle monitoring',
      'Depth analysis',
      'Balance assessment'
    ]
  },
  {
    id: 'desk-sitting' as ActivityType,
    name: 'Desk Posture',
    description: 'Monitor sitting posture',
    icon: MonitorSpeaker,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    rules: [
      'Neck angle monitoring',
      'Back straightness check',
      'Shoulder position',
      'Head alignment'
    ]
  }
];

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  currentActivity,
  onActivityChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isSelected = currentActivity === activity.id;
          
          return (
            <div
              key={activity.id}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onActivityChange(activity.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{activity.name}</h3>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Detection Rules:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {activity.rules.map((rule, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Information Panel */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 text-sm">How it works:</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Real-time pose detection using AI</li>
            <li>• Rule-based posture analysis</li>
            <li>• Instant feedback and corrections</li>
            <li>• Performance tracking over time</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};