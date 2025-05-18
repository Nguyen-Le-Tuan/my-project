'use client';

import {useState, useEffect} from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer} from 'recharts';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import { TrendingUp, Target } from 'lucide-react';

interface ProgressData {
  topic: string;
  score: number; // Score out of 100
  date: string; // YYYY-MM-DD
}

const chartConfig = {
  score: {
    label: 'Score (%)',
    color: 'hsl(var(--chart-1))', // Use theme color variable
  },
  average: {
      label: 'Average',
      color: 'hsl(var(--chart-2))',
  }
} satisfies ChartConfig;

export default function ProgressTracker() {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [newTopic, setNewTopic] = useState<string>('');
  const [newScore, setNewScore] = useState<string>(''); // Keep as string for input control
  const { toast } = useToast();

  // Load data from local storage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('progressData');
    if (storedData) {
      try {
        setProgressData(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse progress data from local storage", e);
        localStorage.removeItem('progressData'); // Clear corrupted data
      }
    }
  }, []);

  // Save data to local storage when it changes
  useEffect(() => {
    localStorage.setItem('progressData', JSON.stringify(progressData));
  }, [progressData]);

  const handleAddProgress = (e: React.FormEvent) => {
     e.preventDefault();
     const scoreValue = parseInt(newScore, 10);
     if (!newTopic.trim()) {
       toast({ title: "Topic Required", description: "Please enter a topic name.", variant: "destructive" });
       return;
     }
     if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
       toast({ title: "Invalid Score", description: "Please enter a score between 0 and 100.", variant: "destructive" });
       return;
     }

     const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD

     const newData: ProgressData = {
       topic: newTopic.trim(),
       score: scoreValue,
       date: today,
     };

     // Check if topic already exists for today
     const existingIndex = progressData.findIndex(item => item.topic === newData.topic && item.date === newData.date);

     if (existingIndex !== -1) {
        // Update existing entry for today
        const updatedData = [...progressData];
        updatedData[existingIndex] = newData;
        setProgressData(updatedData);
         toast({ title: "Progress Updated", description: `Score for ${newData.topic} on ${newData.date} updated.` });
     } else {
        // Add new entry
        setProgressData(prevData => [...prevData, newData]);
        toast({ title: "Progress Added", description: `Score for ${newData.topic} added.` });
     }


     setNewTopic('');
     setNewScore('');
   };

  const overallAverage = progressData.length > 0
    ? progressData.reduce((sum, item) => sum + item.score, 0) / progressData.length
    : 0;

 // Prepare data for the chart - Show latest 5 entries or group by topic average?
 // Let's show average score per topic for simplicity and usefulness
 const topicAverages = progressData.reduce((acc, item) => {
    if (!acc[item.topic]) {
      acc[item.topic] = { totalScore: 0, count: 0 };
    }
    acc[item.topic].totalScore += item.score;
    acc[item.topic].count += 1;
    return acc;
 }, {} as Record<string, { totalScore: number; count: number }>);

 const chartData = Object.entries(topicAverages).map(([topic, data]) => ({
    topic,
    score: parseFloat((data.totalScore / data.count).toFixed(1)), // Average score for the topic
 }));

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Overall Progress</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{overallAverage.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground pt-1">
            Average score across all topics
          </p>
          <Progress value={overallAverage} className="mt-4 h-2 rounded-full" />
        </CardContent>
      </Card>

       <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>Add New Progress Entry</CardTitle>
            <CardDescription>Manually add a score for a topic you practiced.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProgress} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
               <div className="space-y-1">
                 <Label htmlFor="new-topic">Topic</Label>
                 <Input
                   id="new-topic"
                   value={newTopic}
                   onChange={(e) => setNewTopic(e.target.value)}
                   placeholder="e.g., Calculus Basics"
                   required
                   className="rounded-md shadow-sm"
                 />
               </div>
               <div className="space-y-1">
                 <Label htmlFor="new-score">Score (0-100)</Label>
                 <Input
                   id="new-score"
                   type="number"
                   min="0"
                   max="100"
                   value={newScore}
                   onChange={(e) => setNewScore(e.target.value)}
                   placeholder="e.g., 85"
                   required
                   className="rounded-md shadow-sm"
                 />
               </div>
               <Button type="submit" className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md shadow-sm">Add Score</Button>
             </form>
          </CardContent>
        </Card>


      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Progress by Topic</CardTitle>
          <CardDescription>Average scores for topics you've practiced.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                   <CartesianGrid vertical={false} strokeDasharray="3 3" />
                   <XAxis
                     dataKey="topic"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                     // tickFormatter={(value) => value.slice(0, 10) + (value.length > 10 ? '...' : '')} // Shorten long topic names
                     angle={-30} // Angle labels if needed
                     textAnchor="end" // Adjust anchor for angled labels
                     height={50} // Increase height to accommodate angled labels
                     interval={0} // Show all labels
                     style={{ fontSize: '0.75rem' }}
                   />
                  <YAxis domain={[0, 100]} unit="%" tickLine={false} axisLine={false} tickMargin={5} style={{ fontSize: '0.75rem' }}/>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="score" fill="var(--color-score)" radius={4}>
                     <LabelList
                        position="top"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: number) => `${value}%`} // Add % sign
                     />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No progress data yet. Add some scores to see your chart!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}