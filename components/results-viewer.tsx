'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ResultsViewer() {
  const [allResults, setAllResults] = useState<any[]>([])
  const [selectedTest, setSelectedTest] = useState<string | null>(null)

  useEffect(() => {
    const results: any[] = []
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith('aptitude_results_')) {
        const studentResults = JSON.parse(localStorage.getItem(key) || '[]')
        results.push(...studentResults)
      }
    })
    setAllResults(results)
  }, [])

  const testNames = Array.from(new Set(allResults.map((r) => r.testName)))
  const filteredResults = selectedTest
    ? allResults.filter((r) => r.testName === selectedTest)
    : allResults

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Results Analysis</CardTitle>
          <CardDescription>View and analyze student test results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {testNames.length === 0 ? (
            <p className="text-muted-foreground">No results available yet</p>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Filter by Test</label>
                <select
                  value={selectedTest || ''}
                  onChange={(e) => setSelectedTest(e.target.value || null)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="">All Tests</option>
                  {testNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {filteredResults.map((result, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{result.testName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.completedAt).toLocaleDateString()}{' '}
                          {new Date(result.completedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{result.score}%</p>
                        <p className="text-xs text-muted-foreground">
                          {result.passed ? (
                            <span className="text-green-600">Passed</span>
                          ) : (
                            <span className="text-red-600">Failed</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
