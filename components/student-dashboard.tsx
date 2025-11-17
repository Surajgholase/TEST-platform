'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestInterface } from '@/components/test-interface'
import { StudentResults } from '@/components/student-results'
import { LogOut } from 'lucide-react'

interface StudentDashboardProps {
  user: { id: string; name: string; role: 'admin' | 'student' }
  onLogout: () => void
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [tests, setTests] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [activeTest, setActiveTest] = useState<string | null>(null)
  const [completedTests, setCompletedTests] = useState<any[]>([])

  useEffect(() => {
    const savedTests = localStorage.getItem('aptitude_tests')
    const savedQuestions = localStorage.getItem('aptitude_questions')
    const savedResults = localStorage.getItem(`aptitude_results_${user.id}`)
    if (savedTests) setTests(JSON.parse(savedTests))
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions))
    if (savedResults) setCompletedTests(JSON.parse(savedResults))
  }, [user.id])

  const handleTestComplete = (result: any) => {
    const updated = [...completedTests, result]
    setCompletedTests(updated)
    localStorage.setItem(`aptitude_results_${user.id}`, JSON.stringify(updated))
    setActiveTest(null)
  }

  if (activeTest) {
    const test = tests.find((t) => t.id === activeTest)
    if (test) {
      return (
        <TestInterface
          test={test}
          questions={questions.filter((q) => test.questionIds.includes(q.id))}
          onComplete={handleTestComplete}
          onCancel={() => setActiveTest(null)}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="results">My Results</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-4">
              {tests.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No tests available yet
                  </CardContent>
                </Card>
              ) : (
                tests.map((test) => (
                  <Card key={test.id}>
                    <CardHeader>
                      <CardTitle>{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-4 text-sm">
                          <span>{test.totalQuestions} questions</span>
                          <span>{test.duration} minutes</span>
                          <span className="text-accent">Passing: {test.passingScore}%</span>
                        </div>
                        <Button
                          onClick={() => setActiveTest(test.id)}
                          className="gap-2"
                        >
                          Take Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <StudentResults results={completedTests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
