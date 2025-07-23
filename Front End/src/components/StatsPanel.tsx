import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PostureData } from '@/pages/Index';
import { TrendingUp, TrendingDown, Target, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatsPanelProps {
  postureData: PostureData[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ postureData }) => {
  const stats = useMemo(() => {
    if (postureData.length === 0) {
      return {
        totalReadings: 0,
        goodPosture: 0,
        warningPosture: 0,
        badPosture: 0,
        averageConfidence: 0,
        currentStreak: 0,
        longestStreak: 0,
        improvement: 0
      };
    }

    const total = postureData.length;
    const good = postureData.filter(d => d.status === 'good').length;
    const warning = postureData.filter(d => d.status === 'warning').length;
    const bad = postureData.filter(d => d.status === 'bad').length;
    
    const avgConfidence = postureData.reduce((sum, d) => sum + d.confidence, 0) / total;
    
    // Calculate current streak of good posture
    let currentStreak = 0;
    for (let i = postureData.length - 1; i >= 0; i--) {
      if (postureData[i].status === 'good') {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    postureData.forEach(d => {
      if (d.status === 'good') {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    
    // Calculate improvement (compare first half vs second half)
    const halfPoint = Math.floor(total / 2);
    const firstHalf = postureData.slice(0, halfPoint);
    const secondHalf = postureData.slice(halfPoint);
    
    const firstHalfGood = firstHalf.filter(d => d.status === 'good').length / firstHalf.length;
    const secondHalfGood = secondHalf.filter(d => d.status === 'good').length / secondHalf.length;
    const improvement = ((secondHalfGood - firstHalfGood) * 100);
    
    return {
      totalReadings: total,
      goodPosture: good,
      warningPosture: warning,
      badPosture: bad,
      averageConfidence: avgConfidence,
      currentStreak,
      longestStreak,
      improvement
    };
  }, [postureData]);

  const goodPercentage = stats.totalReadings > 0 ? (stats.goodPosture / stats.totalReadings) * 100 : 0;
  const warningPercentage = stats.totalReadings > 0 ? (stats.warningPosture / stats.totalReadings) * 100 : 0;
  const badPercentage = stats.totalReadings > 0 ? (stats.badPosture / stats.totalReadings) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Posture Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {Math.round(goodPercentage)}%
          </div>
          <div className="text-sm opacity-90">
            Based on {stats.totalReadings} readings
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-posture-good" />
                <span className="text-sm">Good</span>
              </div>
              <span className="text-sm font-medium">{stats.goodPosture}</span>
            </div>
            <Progress value={goodPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-posture-warning" />
                <span className="text-sm">Warning</span>
              </div>
              <span className="text-sm font-medium">{stats.warningPosture}</span>
            </div>
            <Progress value={warningPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-posture-bad" />
                <span className="text-sm">Poor</span>
              </div>
              <span className="text-sm font-medium">{stats.badPosture}</span>
            </div>
            <Progress value={badPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Streaks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Streaks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm">Current</span>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              {stats.currentStreak}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Best</span>
            </div>
            <Badge variant="outline">
              {stats.longestStreak}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Confidence</span>
            </div>
            <span className="text-sm font-medium">
              {Math.round(stats.averageConfidence * 100)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stats.improvement >= 0 ? (
                <TrendingUp className="h-4 w-4 text-posture-good" />
              ) : (
                <TrendingDown className="h-4 w-4 text-posture-bad" />
              )}
              <span className="text-sm">Trend</span>
            </div>
            <Badge 
              variant="outline" 
              className={stats.improvement >= 0 ? 'text-posture-good border-posture-good' : 'text-posture-bad border-posture-bad'}
            >
              {stats.improvement >= 0 ? '+' : ''}{Math.round(stats.improvement)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {stats.totalReadings > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">
                {Math.round((Date.now() - postureData[0]?.timestamp) / 1000 / 60)}
              </div>
              <div className="text-sm text-muted-foreground">
                Minutes monitoring
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};