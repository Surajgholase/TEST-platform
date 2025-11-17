'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuestionManager } from '@/components/question-manager'
import { TestManager } from '@/components/test-manager'
import { ResultsViewer } from '@/components/results-viewer'
import { LogOut } from 'lucide-react'

interface AdminDashboardProps {
  user: { id: string; name: string; role: 'admin' | 'student' }
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [tests, setTests] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const savedTests = localStorage.getItem('aptitude_tests')
    const savedQuestions = localStorage.getItem('aptitude_questions')
    if (savedTests) setTests(JSON.parse(savedTests))
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions))
  }, [])

  const updateTests = (newTests: any[]) => {
    setTests(newTests)
    localStorage.setItem('aptitude_tests', JSON.stringify(newTests))
  }

  const updateQuestions = (newQuestions: any[]) => {
    setQuestions(newQuestions)
    localStorage.setItem('aptitude_questions', JSON.stringify(newQuestions))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            <QuestionManager questions={questions} onUpdate={updateQuestions} />
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <TestManager tests={tests} questions={questions} onUpdate={updateTests} />
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <ResultsViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
