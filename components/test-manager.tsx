'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface Test {
  id: string
  name: string
  description: string
  duration: number
  totalQuestions: number
  questionIds: string[]
  passingScore: number
  createdAt: string
}

interface TestManagerProps {
  tests: Test[]
  questions: any[]
  onUpdate: (tests: Test[]) => void
}

export function TestManager({ tests, questions, onUpdate }: TestManagerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Test>>({
    duration: 60,
    passingScore: 60,
  })
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const handleSave = () => {
    if (!formData.name || selectedQuestions.length === 0) {
      alert('Please enter test name and select questions')
      return
    }

    let updated: Test[]
    if (editingId) {
      updated = tests.map((t) =>
        t.id === editingId
          ? {
              ...t,
              name: formData.name || '',
              description: formData.description || '',
              duration: formData.duration || 60,
              passingScore: formData.passingScore || 60,
              questionIds: selectedQuestions,
            }
          : t
      )
    } else {
      updated = [
        ...tests,
        {
          id: Date.now().toString(),
          name: formData.name || '',
          description: formData.description || '',
          duration: formData.duration || 60,
          totalQuestions: selectedQuestions.length,
          questionIds: selectedQuestions,
          passingScore: formData.passingScore || 60,
          createdAt: new Date().toISOString(),
        },
      ]
    }
    onUpdate(updated)
    setShowDialog(false)
    setEditingId(null)
    setFormData({ duration: 60, passingScore: 60 })
    setSelectedQuestions([])
  }

  const handleDelete = (id: string) => {
    onUpdate(tests.filter((t) => t.id !== id))
  }

  const handleEdit = (test: Test) => {
    setEditingId(test.id)
    setFormData(test)
    setSelectedQuestions(test.questionIds)
    setShowDialog(true)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
          <CardDescription>Create and manage aptitude tests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Test
          </Button>

          <div className="space-y-2">
            {tests.map((test) => (
              <Card key={test.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>{test.totalQuestions} questions</span>
                      <span>{test.duration} minutes</span>
                      <span>Passing score: {test.passingScore}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(test)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(test.id)}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Test' : 'Create Test'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Name</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., General Aptitude Test"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Test description"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration || 60}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Passing Score (%)</label>
                <Input
                  type="number"
                  value={formData.passingScore || 60}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Select Questions</label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-start gap-2">
                    <Checkbox
                      checked={selectedQuestions.includes(q.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedQuestions([...selectedQuestions, q.id])
                        } else {
                          setSelectedQuestions(selectedQuestions.filter((id) => id !== q.id))
                        }
                      }}
                    />
                    <label className="text-sm flex-1 cursor-pointer">
                      {q.text}
                    </label>
                  </div>
                ))}
              </div>
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
                  setFormData({ duration: 60, passingScore: 60 })
                  setSelectedQuestions([])
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
