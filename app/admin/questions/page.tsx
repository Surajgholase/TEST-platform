"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Edit2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  id: string;
  question_text: string;
  difficulty_level: string;
  category: string;
  company_id: string | null;
  is_active: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, [difficultyFilter, categoryFilter]);

  const fetchQuestions = async () => {
    const supabase = createClient();

    let query = supabase.from("questions").select("*");

    if (difficultyFilter !== "ALL") {
      query = query.eq("difficulty_level", difficultyFilter);
    }
    if (categoryFilter !== "ALL") {
      query = query.eq("category", categoryFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setQuestions(data);
      const uniqueCategories = [...new Set(data.map((q) => q.category))];
      setCategories(uniqueCategories as string[]);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("questions").update({ is_active: false }).eq("id", id);
    fetchQuestions();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions Management</h1>
          <p className="text-muted-foreground">Manage your question bank</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Question Bank</DialogTitle>
              </DialogHeader>
              <CSVUploadForm onSuccess={fetchQuestions} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label className="text-sm mb-2 block">Difficulty</Label>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label className="text-sm mb-2 block">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="max-w-md truncate">{q.question_text}</TableCell>
                    <TableCell>{q.category}</TableCell>
                    <TableCell>{q.difficulty_level}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(q.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

function CSVUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",");

      const supabase = createClient();

      // Insert questions
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const row = Object.fromEntries(headers.map((h, idx) => [h.trim(), values[idx]?.trim()]));

        let companyId = null;
        if (row.company_name && row.company_name.trim()) {
          // Find or create company
          const { data: company } = await supabase
            .from("companies")
            .select("id")
            .eq("name", row.company_name)
            .single();

          if (!company) {
            const { data: newCompany } = await supabase
              .from("companies")
              .insert({ name: row.company_name })
              .select()
              .single();
            companyId = newCompany?.id;
          } else {
            companyId = company.id;
          }
        }

        await supabase.from("questions").insert({
          question_text: row.question_text,
          option_a: row.option_a,
          option_b: row.option_b,
          option_c: row.option_c,
          option_d: row.option_d,
          correct_option: row.correct_option,
          difficulty_level: row.difficulty_level,
          category: row.category,
          company_id: companyId,
        });
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={loading}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        CSV should have columns: question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level, category, company_name
      </p>
    </div>
  );
}
