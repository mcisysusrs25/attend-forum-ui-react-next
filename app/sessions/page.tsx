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

  // Authentication check
  useEffect(() => {
    const authToken = getSessionAuthToken();
    if (!authToken) {
      router.push('/auth/login');
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userID = getUserId();
        if (!userID) {
          throw new Error('User ID not found');
        }

        const response = await fetch('http://localhost:5000/api/sessions/getSessionsbyProfessor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ professorID: userID }),
          // Add cache control headers
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch sessions');
        }

        const data = await response.json();
        
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }

        setSessions(data.data);
        // Initial filter application
        setFilteredSessions(data.data.filter((session: { sessionStatus: string }) => session.sessionStatus === filter));
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [filter, router]) // Added router to dependencies

  // Separate effect for filtering to avoid unnecessary API calls
  useEffect(() => {
    if (sessions.length > 0) {
      setFilteredSessions(sessions.filter(session => session.sessionStatus === filter));
    }
  }, [filter, sessions]);

  const handleCardClick = (sessionID: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    router.push(`/sessions/${sessionID}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
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
    );
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
              onClick={() => handleCardClick(session.sessionID)}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 cursor-pointer"
            >
              {/* Rest of your card content remains the same */}
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(session.sessionID);
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