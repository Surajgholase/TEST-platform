"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';

interface TestResult {
  id: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  duration_seconds: number;
}

interface AIReport {
  summary_text: string;
  strengths: string;
  weaknesses: string;
  suggestions: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const supabase = createClient();

        // Fetch test result
        const { data: test, error: testError } = await supabase
          .from("tests")
          .select("*")
          .eq("id", testId)
          .single();

        if (testError) throw testError;
        setTestResult(test);

        // Fetch AI report
        const { data: report, error: reportError } = await supabase
          .from("ai_reports")
          .select("*")
          .eq("test_id", testId)
          .single();

        if (!reportError && report) {
          setAiReport(report);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load results");
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-lg text-muted-foreground">Loading results...</div>
      </div>
    );
  }

  if (error || !testResult) {
    return (
      <div className="p-8">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">{error || "Results not found"}</p>
          <Button onClick={() => router.push("/student/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/student/dashboard")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold">Test Completed!</h1>
        <p className="text-xl text-muted-foreground">Here's your performance summary</p>
      </div>

      {/* Score Card */}
      <Card className="border-2 border-primary">
        <CardHeader className="text-center pb-2">
          <CardTitle>Your Score</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 pt-6">
          <div className="text-6xl font-bold text-primary">{Math.round(testResult.score)}%</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{testResult.correct_answers}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold">{testResult.wrong_answers}</p>
              <p className="text-sm text-muted-foreground">Wrong</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{formatDuration(testResult.duration_seconds)}</p>
              <p className="text-sm text-muted-foreground">Time Taken</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Report */}
      {aiReport && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">AI Performance Report</h2>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{aiReport.summary_text}</p>
            </CardContent>
          </Card>

          {aiReport.strengths && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{aiReport.strengths}</p>
              </CardContent>
            </Card>
          )}

          {aiReport.weaknesses && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-yellow-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{aiReport.weaknesses}</p>
              </CardContent>
            </Card>
          )}

          {aiReport.suggestions && (
            <Card>
              <CardHeader>
                <CardTitle>Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{aiReport.suggestions}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button onClick={() => router.push("/student/dashboard")} className="flex-1">
          Back to Dashboard
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/student/reports")}
          className="flex-1"
        >
          View All Reports
        </Button>
      </div>
    </div>
  );
}
