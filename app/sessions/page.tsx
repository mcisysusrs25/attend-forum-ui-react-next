"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function AttendancePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'active' | 'completed' | 'new'>('active')

  // Check if the user is logged in
  useEffect(() => {
    const authToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1]

    if (!authToken) {
      router.push('/auth') // Redirect to /auth if not logged in
    }
  }, [router])

  // Fetch sessions only if the user is authenticated
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sessions/getSessionsbyProfessor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ professorID: 'P54321' }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch sessions')
        }

        const data = await response.json()
        setSessions(data.data)
        setFilteredSessions(data.data.filter((session: { sessionStatus: string }) => session.sessionStatus === 'active'))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    // Fetch sessions only if the user is authenticated
    const authToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1]

    if (authToken) {
      fetchSessions()
    }
  }, [])

  useEffect(() => {
    setFilteredSessions(sessions.filter((session) => session.sessionStatus === filter))
  }, [filter, sessions])

  // Add click handler for the entire card
  const handleCardClick = (sessionID: string) => {
    router.push(`/sessions/${sessionID}`)
  }

  if (loading) {
    return <div className="text-center py-8">Loading sessions...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'completed'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'new'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            New
          </button>
        </div>

        {/* Session Cards */}
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session._id}
              onClick={() => handleCardClick(session.sessionID)}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {session.sessionTitle}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span> {session.sessionDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
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
                {/* See Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()  // Prevent card click from triggering
                    handleCardClick(session.sessionID)
                  }}
                  className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                >
                  See Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}