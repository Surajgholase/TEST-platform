"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalQuestions: number;
  totalTests: number;
  avgScore: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalQuestions: 0,
    totalTests: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      try {
        // Get total students
        const { data: students } = await supabase
          .from("users")
          .select("id", { count: "exact" })
          .eq("role", "STUDENT");

        // Get total questions
        const { data: questions } = await supabase
          .from("questions")
          .select("id", { count: "exact" })
          .eq("is_active", true);

        // Get total tests
        const { data: tests } = await supabase
          .from("tests")
          .select("score", { count: "exact" });

        // Calculate average score
        let avgScore = 0;
        if (tests && tests.length > 0) {
          avgScore = tests.reduce((sum, t) => sum + (t.score || 0), 0) / tests.length;
        }

        setStats({
          totalStudents: students?.length || 0,
          totalQuestions: questions?.length || 0,
          totalTests: tests?.length || 0,
          avgScore: Math.round(avgScore * 10) / 10,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the admin panel</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            label="Total Students"
            value={stats.totalStudents}
          />
          <StatCard
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            label="Total Questions"
            value={stats.totalQuestions}
          />
          <StatCard
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            label="Total Tests"
            value={stats.totalTests}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
            label="Avg Score"
            value={`${stats.avgScore}%`}
          />
        </div>
      )}
    </div>
  );
}
