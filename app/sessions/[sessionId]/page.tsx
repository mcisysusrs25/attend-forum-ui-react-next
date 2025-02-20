// app/sessions/[sessionId]/page.tsx
"use client"

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Session {
  _id: string
  sessionTitle: string
  sessionDescription: string
  sessionValidFrom: string
  sessionValidTo: string
  sessionStatus: string
  subjectCode: string
  createdBy: string
  sessionID: string
  __v: number
}

export default function SessionDetails() {
  const params = useParams()
  const sessionId = params.sessionId as string
  
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sessions/gsd/${sessionId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch session details')
        }
        const data = await response.json()
        setSession(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSessionDetails()
  }, [sessionId])

  if (loading) {
    return <div className="text-center py-8">Loading session details...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  if (!session) {
    return <div className="text-center py-8">Session not found</div>
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{session.sessionTitle}</h1>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Description:</span> {session.sessionDescription}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Subject Code:</span> {session.subjectCode}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Created By:</span> {session.createdBy}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Valid From:</span>{' '}
            {new Date(session.sessionValidFrom).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Valid To:</span>{' '}
            {new Date(session.sessionValidTo).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Status:</span>{' '}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                session.sessionStatus === 'active'
                  ? 'bg-green-100 text-green-800'
                  : session.sessionStatus === 'completed'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {session.sessionStatus}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Session ID:</span> {session.sessionID}
          </p>
        </div>
      </div>
    </div>
  )
}