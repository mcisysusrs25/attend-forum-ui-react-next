"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserId, getSessionAuthToken } from '../utils/authSession'

interface Session {
  _id: string
  sessionTitle: string
  sessionDescription: string
  sessionValidFrom: string
  sessionValidTo: string
  sessionStatus: string
  subjectCode: string
  createdBy: string
  sessionID: string // Correct field to use
  __v: number
}

export default function AttendancePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'active' | 'completed' | 'new'>('active')

  // Authentication check
  useEffect(() => {
    const authToken = getSessionAuthToken()
    if (!authToken) {
      router.push('/auth/login')
      return
    }

    const fetchSessions = async () => {
      try {
        setLoading(true)
        setError(null)

        const userID = getUserId()
        if (!userID) {
          throw new Error('User ID not found')
        }

        const response = await fetch('http://localhost:5000/api/sessions/getSessionsbyProfessor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ professorID: userID }),
          cache: 'no-store',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch sessions')
        }

        const data = await response.json()

        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format')
        }

        setSessions(data.data)
        setFilteredSessions(data.data.filter((session: { sessionStatus: string }) => session.sessionStatus === filter))
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [filter, router])

  // Separate effect for filtering
  useEffect(() => {
    if (sessions.length > 0) {
      setFilteredSessions(sessions.filter((session) => session.sessionStatus === filter))
    }
  }, [filter, sessions])

  // Handle status change
  const handleStatusChange = async (sessionID: string, newStatus: string) => {
    try {
      const authToken = getSessionAuthToken()
      if (!authToken) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`http://localhost:5000/api/sessions/updateStatus/${sessionID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Refresh the page to reflect changes
      window.location.reload()
    } catch (err) {
      console.error('Status update error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Handle toggle click
  const handleToggleClick = (session: Session) => {
    const newStatus = session.sessionStatus === 'active' ? 'completed' : 'active'
    const action = session.sessionStatus === 'active' ? 'mark this session as completed' : 'activate this session'

    // Confirmation using alert
    const isConfirmed = window.confirm(`Are you sure you want to ${action}?`)
    if (isConfirmed) {
      handleStatusChange(session.sessionID, newStatus) // Use session.sessionID instead of session._id
    }
  }

  // Handle delete click
  const handleDeleteClick = async (session: Session) => {
    const isConfirmed = window.confirm(
      session.sessionStatus === 'active'
        ? 'This session is active. Are you sure you want to delete it?'
        : 'Are you sure you want to delete this session?'
    )

    if (isConfirmed) {
      try {
        const authToken = getSessionAuthToken()
        if (!authToken) {
          router.push('/auth/login')
          return
        }

        const response = await fetch(`http://localhost:5000/api/sessions/delete/${session.sessionID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete session')
        }

        // Refresh the page to reflect changes
        window.location.reload()
      } catch (err) {
        console.error('Delete error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }
  }

  // Handle edit click
  const handleEditClick = (sessionID: string) => {
    router.push(`sessions/update-session/${sessionID}`)
  }

  // Get toggle label based on status
  const getToggleLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Mark as Completed'
      case 'new':
        return 'Activate Session'
      default:
        return 'Toggle Status'
    }
  }

  // Handle see details click
  const handleSeeDetailsClick = (sessionID: string) => {
    router.push(`/sessions/${sessionID}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8 text-red-500">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          {['active', 'completed', 'new'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as 'active' | 'completed' | 'new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* No sessions message */}
        {filteredSessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {filter} sessions found
          </div>
        )}

        {/* Session Cards */}
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session._id}
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
                <div className="flex flex-col space-y-2">
                  {/* Edit Button (only for new sessions) */}
                  {session.sessionStatus === 'new' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(session.sessionID)
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300"
                    >
                      Edit
                    </button>
                  )}

                  {/* Delete Button (for all sessions) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(session)
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                  >
                    Delete
                  </button>

                  {/* Toggle Status Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleClick(session)
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                  >
                    {getToggleLabel(session.sessionStatus)}
                  </button>

                  {/* See Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSeeDetailsClick(session.sessionID)
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                  >
                    See Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}