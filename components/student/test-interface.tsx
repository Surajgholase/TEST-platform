"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

interface TestInterfaceProps {
  questions: Question[];
  testId: string;
  testType: string;
  difficulty: string;
}

export function TestInterface({
  questions,
  testId,
  testType,
  difficulty,
}: TestInterfaceProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(
    questions.length * 60 // 1 minute per question
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const question = questions[currentQuestion];
  const options = [
    { key: "A", label: "A", text: question?.option_a },
    { key: "B", label: "B", text: question?.option_b },
    { key: "C", label: "C", text: question?.option_c },
    { key: "D", label: "D", text: question?.option_d },
  ];

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Save answer to database when changed
  useEffect(() => {
    const saveAnswer = async () => {
      if (!answers[question?.id]) return;

      const supabase = createClient();
      await supabase
        .from("test_answers")
        .upsert({
          test_id: testId,
          question_id: question.id,
          selected_option: answers[question.id],
        }, { onConflict: "test_id,question_id" });
    };

    saveAnswer();
  }, [answers, question?.id, testId]);

  const handleSelectAnswer = (option: string) => {
    setAnswers({
      ...answers,
      [question.id]: option,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Calculate correct and wrong answers
      let correctCount = 0;
      let wrongCount = 0;

      for (const q of questions) {
        const selectedAnswer = answers[q.id];
        if (selectedAnswer === q.correct_option) {
          correctCount++;
        } else if (selectedAnswer) {
          wrongCount++;
        } else {
          wrongCount++;
        }
      }

      const score = (correctCount / questions.length) * 100;

      // Update test record
      const durationSeconds = (questions.length * 60) - timeLeft;
      await supabase
        .from("tests")
        .update({
          correct_answers: correctCount,
          wrong_answers: wrongCount,
          score: score,
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq("id", testId);

      // Mark test answers as correct/incorrect
      for (const q of questions) {
        const selectedAnswer = answers[q.id];
        await supabase
          .from("test_answers")
          .update({
            is_correct: selectedAnswer === q.correct_option,
          })
          .eq("test_id", testId)
          .eq("question_id", q.id);
      }

      // Redirect to results
      router.push(`/student/tests/results/${testId}`);
    } catch (error) {
      console.error("Error submitting test:", error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeWarning = timeLeft < 300; // 5 minutes

  return (
    <div className="p-8 space-y-6">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Question {currentQuestion + 1} of {questions.length}
          </h1>
        </div>
        <div
          className={`flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg ${
            isTimeWarning
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          <Clock className="h-5 w-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round((currentQuestion / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question and options */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">{question.question_text}</h2>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSelectAnswer(option.key)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  answers[question.id] === option.key
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-semibold mr-2">{option.label}.</span>
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Navigation buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion === questions.length - 1 && (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          )}
          {currentQuestion < questions.length - 1 && (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Submit Test?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to submit your test? You won't be able to make changes after submission.
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitTest}>
              Submit
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
