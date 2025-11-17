"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const difficulties = [
  {
    level: "EASY",
    label: "Easy",
    description: "20 questions • Beginner level • 20 minutes",
    color: "bg-green-500",
  },
  {
    level: "MEDIUM",
    label: "Medium",
    description: "25 questions • Intermediate level • 25 minutes",
    color: "bg-yellow-500",
  },
  {
    level: "HARD",
    label: "Hard",
    description: "30 questions • Advanced level • 30 minutes",
    color: "bg-red-500",
  },
];

export default function DifficultyPage() {
  const router = useRouter();

  const handleSelectDifficulty = (level: string) => {
    router.push(`/student/tests/general/start?difficulty=${level}`);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">General Aptitude Test</h1>
        <p className="text-muted-foreground">Select difficulty level</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((diff) => (
          <Card key={diff.level} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${diff.color}`} />
                <CardTitle>{diff.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{diff.description}</p>
              <Button
                className="w-full"
                onClick={() => handleSelectDifficulty(diff.level)}
              >
                Start
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
