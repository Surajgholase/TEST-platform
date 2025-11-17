'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Upload, Trash2, Edit2 } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'short-answer'
  options?: string[]
  correctAnswer: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

interface QuestionManagerProps {
  questions: Question[]
  onUpdate: (questions: Question[]) => void
}

export function QuestionManager({ questions, onUpdate }: QuestionManagerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Question>>({
    type: 'multiple-choice',
    difficulty: 'medium',
  })

  const handleSave = () => {
    if (!formData.text || !formData.correctAnswer) {
      alert('Please fill in all required fields')
      return
    }

    let updated: Question[]
    if (editingId) {
      updated = questions.map((q) =>
        q.id === editingId ? { ...q, ...formData } as Question : q
      )
    } else {
      updated = [
        ...questions,
        {
          id: Date.now().toString(),
          text: formData.text || '',
          type: formData.type || 'multiple-choice',
          options: formData.options || [],
          correctAnswer: formData.correctAnswer || '',
          difficulty: formData.difficulty || 'medium',
          category: formData.category || 'General',
        },
      ]
    }
    onUpdate(updated)
    setShowDialog(false)
    setEditingId(null)
    setFormData({ type: 'multiple-choice', difficulty: 'medium' })
  }

  const handleDelete = (id: string) => {
    onUpdate(questions.filter((q) => q.id !== id))
  }

  const handleEdit = (question: Question) => {
    setEditingId(question.id)
    setFormData(question)
    setShowDialog(true)
  }

  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result as string
      const lines = csv.split('\n').filter((line) => line.trim())
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

      const newQuestions = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim())
        return {
          id: Date.now().toString() + Math.random(),
          text: values[headers.indexOf('question')] || '',
          type: 'multiple-choice' as const,
          options: [values[headers.indexOf('option1')] || '', values[headers.indexOf('option2')] || '', values[headers.indexOf('option3')] || '', values[headers.indexOf('option4')] || ''],
          correctAnswer: values[headers.indexOf('correct')] || '',
          difficulty: (values[headers.indexOf('difficulty')] || 'medium') as 'easy' | 'medium' | 'hard',
          category: values[headers.indexOf('category')] || 'General',
        }
      })

      onUpdate([...questions, ...newQuestions])
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Question Bank</CardTitle>
          <CardDescription>Manage and organize test questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setShowDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
            <label>
              <Button variant="outline" className="gap-2" asChild>
                <span>
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </span>
              </Button>
              <input
                type="file"
                accept=".csv"
                onChange={handleUploadCSV}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2">
            {questions.map((question) => (
              <Card key={question.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{question.text}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-muted px-2 py-1 rounded">
                        {question.difficulty}
                      </span>
                      <span className="bg-muted px-2 py-1 rounded">
                        {question.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Question</label>
              <Textarea
                value={formData.text || ''}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter question text"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Reasoning, Verbal"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <select
                value={formData.difficulty || 'medium'}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Correct Answer</label>
              <Input
                value={formData.correctAnswer || ''}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                placeholder="Enter correct answer"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  setEditingId(null)
                  setFormData({ type: 'multiple-choice', difficulty: 'medium' })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
