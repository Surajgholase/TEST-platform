"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TestReport {
  id: string;
  test_type: string;
  difficulty_level: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  completed_at: string;
  company?: { name: string };
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="p-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold">My Test Reports</h1>
        <p className="text-muted-foreground">View your test history and performance</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No tests taken yet. Start a test to see reports here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Correct/Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.test_type === "GENERAL" ? "General" : "Company-wise"}
                    </TableCell>
                    <TableCell>{report.difficulty_level}</TableCell>
                    <TableCell>
                      <Badge className={getScoreBadgeColor(report.score)}>
                        {Math.round(report.score)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.correct_answers}/{report.total_questions}
                    </TableCell>
                    <TableCell>{formatDate(report.completed_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/student/tests/results/${report.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
