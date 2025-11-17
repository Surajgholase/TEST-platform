import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await context.params;
    const supabase = await createClient();

    // Fetch test details
    const { data: test } = await supabase
      .from("tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Fetch test answers with question details
    const { data: answers } = await supabase
      .from("test_answers")
      .select("*, questions(*)")
      .eq("test_id", testId);

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from("ai_reports")
      .select("*")
      .eq("test_id", testId)
      .single();

    if (existingReport) {
      return NextResponse.json(existingReport);
    }

    // Prepare data for AI
    const categoryPerformance: Record<string, { correct: number; total: number }> = {};
    let correctByCategory: Record<string, string[]> = {};
    let wrongByCategory: Record<string, string[]> = {};

    answers?.forEach((answer) => {
      const category = answer.questions?.category || "Unknown";
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { correct: 0, total: 0 };
        correctByCategory[category] = [];
        wrongByCategory[category] = [];
      }
      categoryPerformance[category].total++;
      if (answer.is_correct) {
        categoryPerformance[category].correct++;
        correctByCategory[category].push(answer.questions?.question_text || "");
      } else {
        wrongByCategory[category].push(answer.questions?.question_text || "");
      }
    });

    // Build prompt for AI
    const scorePct = typeof test.score === "number" ? test.score : Number(test.score ?? 0);
    const durationMinutes = Math.round(Number(test.duration_seconds ?? 0) / 60);
    const prompt = `You are an aptitude test mentor. A student has just completed an aptitude test. Here's their performance data:

Test Results:
- Total Score: ${scorePct.toFixed(1)}%
- Correct Answers: ${test.correct_answers}/${test.total_questions}
- Difficulty Level: ${test.difficulty_level}
- Time Taken: ${durationMinutes} minutes

Category-wise Performance:
${Object.entries(categoryPerformance)
        .map(
          ([cat, perf]) =>
            `- ${cat}: ${perf.correct}/${perf.total} correct (${Math.round((perf.correct / perf.total) * 100)}%)`
        )
        .join("\n")}

Please provide:
1. A brief 3-4 line summary of their overall performance in simple English.
2. 3-4 bullet points of their strengths based on categories where they scored above 70%.
3. 3-4 bullet points of weaknesses based on categories where they scored below 50%.
4. 3-4 practical suggestions to improve their weak areas.

Format your response as JSON with keys: summary, strengths, weaknesses, suggestions`;

    // Call OpenAI API (or any LLM API)
    // For now, returning a demo response. Replace with actual API call
    const reportText = {
      summary: `Good effort! You scored ${scorePct.toFixed(1)}% on the ${test.difficulty_level} level test. You answered ${test.correct_answers} out of ${test.total_questions} questions correctly in ${durationMinutes} minutes. Your performance shows room for improvement in specific areas.`,
      strengths: `• Strong performance in ${Object.entries(categoryPerformance).find(([, p]) => (p.correct / p.total) * 100 > 75)?.[0] || "core concepts"}\n• Consistent accuracy in multiple question types\n• Good time management throughout the test`,
      weaknesses: `• Performance below average in ${Object.entries(categoryPerformance).find(([, p]) => (p.correct / p.total) * 100 < 50)?.[0] || "specific areas"}\n• Some gaps in concept understanding\n• Could benefit from more practice in weaker sections`,
      suggestions: `• Focus on strengthening fundamentals in weak areas\n• Practice more questions in problem categories\n• Allocate more time for difficult topics\n• Take regular mock tests to track progress`,
    };

    // Save report to database
    const { data: report, error } = await supabase
      .from("ai_reports")
      .insert({
        test_id: testId,
        summary_text: reportText.summary,
        strengths: reportText.strengths,
        weaknesses: reportText.weaknesses,
        suggestions: reportText.suggestions,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
