"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { TestInterface } from "@/components/student/test-interface";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

const QUESTIONS_PER_DIFFICULTY = {
  EASY: 20,
  MEDIUM: 25,
  HARD: 30,
};

export default function GeneralTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get("difficulty") || "EASY").toUpperCase();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [testId, setTestId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeTest = useCallback(async () => {
    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Fetch questions for this difficulty (general = company_id is null)
      const { data: fetchedQuestions, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("difficulty_level", difficulty)
        .is("company_id", null)
        .eq("is_active", true)
        .order("id", { ascending: false })
        .limit(QUESTIONS_PER_DIFFICULTY[difficulty as keyof typeof QUESTIONS_PER_DIFFICULTY]);

      if (questionsError) throw questionsError;

      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        setError("No questions available for this difficulty level");
        setLoading(false);
        return;
      }

      // Shuffle questions
      const shuffled = [...fetchedQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);

      // Create test record
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email,
            name: (user as any).user_metadata?.name || user.email,
            role: "STUDENT",
          });
      }

      const { data: testData, error: testError } = await supabase
        .from("tests")
        .insert({
          user_id: user.id,
          test_type: "GENERAL",
          difficulty_level: difficulty,
          total_questions: shuffled.length,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (testError) throw testError;

      setTestId(testData.id);
      setLoading(false);
    } catch (err) {
      const code = (err as any)?.code;
      const message = (err as any)?.message || (err instanceof Error ? err.message : JSON.stringify(err));
      console.error("Error initializing test:", message);
      if (code === "PGRST205" || String(message).includes("PGRST205")) {
        setError("Database not initialized or schema not exposed. Please run DB setup and expose 'public' schema in Supabase API settings.");
      } else {
        setError("Failed to load test");
      }
      setLoading(false);
    }
  }, [difficulty, router]);

  useEffect(() => {
    initializeTest();
  }, [initializeTest]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-lg text-muted-foreground">Loading test...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">No questions available</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <TestInterface
      questions={questions}
      testId={testId}
      testType="GENERAL"
      difficulty={difficulty}
    />
  );
}
