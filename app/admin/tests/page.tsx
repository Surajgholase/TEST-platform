"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, BadgeIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TestRecord {
  id: string;
  user_id: string;
  users: { name: string; email: string };
  test_type: string;
  difficulty_level: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string;
}

export default function TestReportsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tests")
      .select("*, users(name, email)")
      .eq("completed_at", "!null")
      .order("completed_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setTests(data);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Reports</h1>
        <p className="text-muted-foreground">View all student test results</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Correct/Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{test.users.name}</p>
                        <p className="text-sm text-muted-foreground">{test.users.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{test.test_type === "GENERAL" ? "General" : "Company"}</TableCell>
                    <TableCell>{test.difficulty_level}</TableCell>
                    <TableCell>
                      <Badge className={getScoreBadgeColor(test.score)}>
                        {Math.round(test.score)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {test.correct_answers}/{test.total_questions}
                    </TableCell>
                    <TableCell>{formatDate(test.completed_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/tests/${test.id}`)}
                      >
                        <Eye className="h-4 w-4" />
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
