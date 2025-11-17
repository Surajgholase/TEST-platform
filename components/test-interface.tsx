'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface TestInterfaceProps {
  test: any
  questions: any[]
  onComplete: (result: any) => void
  onCancel: () => void
}

export function TestInterface({ test, questions, onComplete, onCancel }: TestInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(test.duration * 60)
  const [showExitDialog, setShowExitDialog] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [answers])

  const handleSubmit = () => {
    const score = calculateScore()
    const passed = score >= test.passingScore
    onComplete({
      testId: test.id,
      testName: test.name,
      answers,
      score,
      passed,
      totalQuestions: questions.length,
      completedAt: new Date().toISOString(),
    })
  }

  const calculateScore = () => {
    const correct = Object.entries(answers).filter(([qId, answer]) => {
      const question = questions.find((q) => q.id === qId)
      return question && answer === question.correctAnswer
    }).length
    return Math.round((correct / questions.length) * 100)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isTimeRunningOut = timeLeft < 60
  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between bg-card border rounded-lg p-4">
          <div>
            <h1 className="text-xl font-bold">{test.name}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono ${isTimeRunningOut ? 'bg-destructive text-destructive-foreground' : 'bg-muted'}`}>
            <Clock className="w-4 h-4" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentQ?.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQ?.id] || ''}
              onValueChange={(value) =>
                setAnswers({ ...answers, [currentQ?.id]: value })
              }
            >
              {currentQ?.type === 'multiple-choice' && currentQ?.options && (
                <div className="space-y-3">
                  {currentQ.options.map((option: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <label
                        htmlFor={`option-${idx}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </RadioGroup>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex-1" />
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={() => setShowExitDialog(true)}
          className="w-full"
        >
          Exit Test
        </Button>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved if you exit now. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Continue Test</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowExitDialog(false)
                onCancel()
              }}
              className="flex-1 bg-destructive"
            >
              Exit
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
