"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSessionAuthToken } from '../../utils/authSession';
import { Clock, Users, BookOpen, User, Calendar, Activity } from 'lucide-react';
import { getCurrentEnv } from '@/app/utils/nodeEnv';

interface Session {
  _id: string;
  sessionTitle: string;
  sessionDescription: string;
  sessionValidFrom: string;
  sessionValidTo: string;
  sessionStatus: string;
  subjectCode: string;
  createdBy: string;
  batchID: string;
  students: {
    studentID: string;
    attendanceStatus: string;
    _id: string;
  }[];
  sessionID: string;
  sessionCreatedDateTime: string;
  __v: number;
}

export default function SessionDetails() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);


const apiUrl = getCurrentEnv("dev"); 
console.log(apiUrl);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionDetails = async () => {
      try {
        const authToken = getSessionAuthToken();
        if (!authToken) {
          router.push('/auth/login');
          return;
        }

        const sessionResponse = await fetch(`${apiUrl}${sessionId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!sessionResponse.ok) {
          throw new Error('Failed to fetch session details');
        }

        const sessionData = await sessionResponse.json();
        setSession(sessionData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId, router]);

  const handleCheckboxChange = (studentID: string) => {
    if (selectedStudents.includes(studentID)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentID));
    } else {
      setSelectedStudents([...selectedStudents, studentID]);
    }
  };

  const handleMarkAsPresent = async () => {
    try {
      const authToken = getSessionAuthToken();
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      // Prepare the payload for the API
      const payload = {
        sessionID: sessionId,
        students: selectedStudents.map((studentID) => ({
          studentID,
          attendanceStatus: true, // Mark as present
        })),
      };

      const response = await fetch(`${apiUrl}/sessions/attendence/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <span className="text-2xl text-red-600">!</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <span className="mr-2">↻</span>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <span className="text-2xl text-gray-600">?</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Session not found</h3>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <span className="mr-2">←</span>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Session Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{session.sessionTitle}</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                session.sessionStatus === 'active'
                  ? 'bg-green-100 text-green-800'
                  : session.sessionStatus === 'completed'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {session.sessionStatus.charAt(0).toUpperCase() + session.sessionStatus.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-gray-900">{session.sessionDescription}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Subject Code</p>
                <p className="mt-1 text-gray-900">{session.subjectCode}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created By</p>
                <p className="mt-1 text-gray-900">{session.createdBy}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Valid From</p>
                <p className="mt-1 text-gray-900">{new Date(session.sessionValidFrom).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Valid To</p>
                <p className="mt-1 text-gray-900">{new Date(session.sessionValidTo).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Session ID</p>
                <p className="mt-1 text-gray-900">{session.sessionID}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Student Attendance</h2>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={showAttendancePanel}
                  onChange={() => setShowAttendancePanel(!showAttendancePanel)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
              </label>

              {showAttendancePanel && (
                <button
                  onClick={handleMarkAsPresent}
                  disabled={selectedStudents.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Mark as Present
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {showAttendancePanel && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                      )}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {session.students.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-150">
                        {showAttendancePanel && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.attendanceStatus === 'Absent' && (
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.studentID)}
                                onChange={() => handleCheckboxChange(student.studentID)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                              />
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.studentID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              student.attendanceStatus === 'Present'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.attendanceStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}