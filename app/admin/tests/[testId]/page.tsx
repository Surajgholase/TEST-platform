"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface TestDetail {
  id: string;
  users: { name: string; email: string };
  test_type: string;
  difficulty_level: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
}

interface TestAnswer {
  id: string;
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  questions: {
    question_text: string;
    correct_option: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
  };
}

interface AIReport {
  summary_text: string;
  strengths: string;
  weaknesses: string;
  suggestions: string;
}

export default function TestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [testDetail, setTestDetail] = useState<TestDetail | null>(null);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const fetchTestDetails = async () => {
    const supabase = createClient();

    // Fetch test details
    const { data: test } = await supabase
      .from("tests")
      .select("*, users(name, email)")
      .eq("id", testId)
      .single();

    if (test) {
      setTestDetail(test);
    }

    // Fetch test answers
    const { data: testAnswers } = await supabase
      .from("test_answers")
      .select("*, questions(*)")
      .eq("test_id", testId);

    if (testAnswers) {
      setAnswers(testAnswers);
    }

    // Fetch AI report
    const { data: report } = await supabase
      .from("ai_reports")
      .select("*")
      .eq("test_id", testId)
      .single();

    if (report) {
      setAiReport(report);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        Loading...
      </div>
    );
  }

  if (!testDetail) {
    return (
      <div className="p-8">
        <Button onClick={() => router.back()}>Back</Button>
        <p className="text-muted-foreground mt-4">Test not found</p>
      </div>
    );
  }

  const optionMap: Record<string, string> = {
    A: testDetail ? "option_a" : "",
    B: testDetail ? "option_b" : "",
    C: testDetail ? "option_c" : "",
    D: testDetail ? "option_d" : "",
  };

  return (
    <div className="p-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Test Details</h1>
        <p className="text-muted-foreground">
          {testDetail.users.name} ({testDetail.users.email})
        </p>
      </div>

      {/* Score Summary */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>Score Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-3xl font-bold">{Math.round(testDetail.score)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Correct</p>
            <p className="text-3xl font-bold text-green-600">
              {testDetail.correct_answers}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Wrong</p>
            <p className="text-3xl font-bold text-red-600">{testDetail.wrong_answers}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-3xl font-bold">
              {Math.round(testDetail.duration_seconds / 60)}m
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Report */}
      {aiReport && (
        <Card>
          <CardHeader>
            <CardTitle>AI Performance Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {aiReport.summary_text}
              </p>
            </div>
            {aiReport.strengths && (
              <div>
                <h3 className="font-semibold mb-2">Strengths</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {aiReport.strengths}
                </p>
              </div>
            )}
            {aiReport.weaknesses && (
              <div>
                <h3 className="font-semibold mb-2">Weaknesses</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {aiReport.weaknesses}
                </p>
              </div>
            )}
            {aiReport.suggestions && (
              <div>
                <h3 className="font-semibold mb-2">Suggestions</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {aiReport.suggestions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Question-by-Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((answer, idx) => {
            const q = answer.questions;
            return (
              <div key={answer.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  {answer.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      Q{idx + 1}. {q.question_text}
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <strong>Your answer:</strong> {answer.selected_option}
                        {q[optionMap[answer.selected_option as keyof typeof optionMap] as keyof typeof q] && (
                          <>
                            {" "}
                            -{" "}
                            {q[optionMap[answer.selected_option as keyof typeof optionMap] as keyof typeof q]}
                          </>
                        )}
                      </p>
                      {!answer.is_correct && (
                        <p>
                          <strong>Correct answer:</strong> {q.correct_option} -{" "}
                          {q[optionMap[q.correct_option as keyof typeof optionMap] as keyof typeof q]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
