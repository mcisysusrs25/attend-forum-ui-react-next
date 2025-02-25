"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, Users, BookOpen, User, Calendar, Activity, Download } from 'lucide-react';
import { fetchSessionDetails, updateAttendance } from '@/app/api/sessionDetails';
import { getSessionAuthToken, getUserType, getUserId } from '@/app/utils/authSession';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';


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

  const [markSuccess, setMarkSuccess] = useState(false);
  const [openInfo, setOpenInfo] = useState(false)

  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const authToken = getSessionAuthToken();
  const [userType, setUserType] = useState("student");
  const [studentID, setStudentID] = useState<string | null>(null);

  // Fetch session details on component mount
  useEffect(() => {
    if (!sessionId || !authToken) {
      router.push('/auth/login');
      return;
    }

    const usertype = getUserType();
    setUserType(usertype!);

    if (usertype === "student") {
      const studentID = getUserId();
      setStudentID(studentID);
    }

    const loadSession = async () => {
      try {
        setLoading(true);
        const data = await fetchSessionDetails(sessionId, authToken);
        setSession(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, authToken, router]);

  // Handle checkbox changes for attendance
  const handleCheckboxChange = (studentID: string) => {
    if (selectedStudents.includes(studentID)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentID));
    } else {
      setSelectedStudents([...selectedStudents, studentID]);
    }
  };

  // Handle marking students as present
  const handleMarkAsPresent = async () => {
    try {
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      await updateAttendance(sessionId, selectedStudents, authToken);
      window.location.reload(); // Refresh the page to reflect changes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  const handleAttendenceExperiences = () => {
     setOpenInfo(true);
  };

  const handleMarkMyAttendance = async () => {
    
    try {
      if (!authToken || !studentID) {
        router.push('/auth/login');
        return;
      }

      // Get user's geolocation
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Call the API with geolocation data
          const response = await fetch('http://localhost:5000/api/student/sessions/mark-attendance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              sessionID: sessionId,
              studentID: studentID,
              lat: latitude,
              long: longitude,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to mark attendance');
          }

          const data = await response.json();
          if (data.success) {
            setMarkSuccess(true);
            window.location.reload(); // Refresh the page to reflect changes
          }
        },
        (error) => {
          window.location.reload();
          setError('Unable to retrieve your location. Please enable location services and try again.');
          console.error('Geolocation error:', error);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  // Handle downloading session info
  const handleDownload = (format: 'excel' | 'pdf') => {
    if (!session) return;

    const sessionData = [
      ['Session Title', session.sessionTitle],
      ['Description', session.sessionDescription],
      ['Valid From', new Date(session.sessionValidFrom).toLocaleString()],
      ['Valid To', new Date(session.sessionValidTo).toLocaleString()],
      ['Status', session.sessionStatus],
      ['Subject Code', session.subjectCode],
      ['Created By', session.createdBy],
      ['Batch ID', session.batchID],
      ['Session ID', session.sessionID],
      ['Created On', new Date(session.sessionCreatedDateTime).toLocaleString()],
    ];

    const studentData = session.students.map((student) => [
      student.studentID,
      student.attendanceStatus,
    ]);

    if (format === 'excel') {
      const workbook = XLSX.utils.book_new();
      const sessionSheet = XLSX.utils.aoa_to_sheet([['Session Information'], ...sessionData]);
      const studentSheet = XLSX.utils.aoa_to_sheet([['Student Attendance'], ['Student ID', 'Attendance Status'], ...studentData]);

      XLSX.utils.book_append_sheet(workbook, sessionSheet, 'Session Info');
      XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Attendance');

      XLSX.writeFile(workbook, `Session_${session.sessionID}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Session Information', 10, 10);
      sessionData.forEach(([label, value], index) => {
        doc.setFontSize(12);
        doc.text(`${label}: ${value}`, 10, 20 + index * 10);
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.text('Student Attendance', 10, 10);
      studentData.forEach(([studentID, status], index) => {
        doc.setFontSize(12);
        doc.text(`${studentID}: ${status}`, 10, 20 + index * 10);
      });

      doc.save(`Session_${session.sessionID}.pdf`);
    }
  };

  // Check if the current student's attendance is already marked
  const isAttendanceMarked = session?.students.find((student) => student.studentID === studentID)?.attendanceStatus === 'Present';
   
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push('/sessions')}
          className="flex items-center text-blue-500 mb-4"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Sessions
        </button>

        {/* Session Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl min-h-[200px]">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading session details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[200px]">
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
          ) : !session ? (
            <div className="flex justify-center items-center h-[200px]">
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
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{session.sessionTitle}</h1>
                {userType === "professor" && (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleDownload('excel')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Excel
                    </button>
                    <button
                      onClick={() => handleDownload('pdf')}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </button>
                  </div>
                )}
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
            </>
          )}
        </div>

        {/* Attendance Table Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl min-h-[200px]">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading attendance data...</p>
              </div>
            </div>
          ) : error || !session ? (
            <div className="h-[200px]"></div> // Empty placeholder to maintain layout
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Student Attendance</h2>
                </div>
                {userType === "professor" && (
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
                )}
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
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${student.attendanceStatus === 'Present'
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
            </>
          )}
        </div>

        {/* Floating Button for Students */}
        {userType === "student" && !isAttendanceMarked && (
          <div className="fixed inset-x-0 bottom-8 grid place-items-center">
            <button
              onClick={handleMarkMyAttendance}
              className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Mark My Attendance
            </button>
          </div>
        )}
      </div>

      <Dialog open={openInfo} onClose={setOpenInfo} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                  <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                    Deactivate account
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      To capture Your attendance we require your Location data. Please turn on the GPS, and Allow for this website to capture the data.
                      If you are within the 20M radius of the Classroom the Attendence will be captured.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => handleMarkMyAttendance()}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
              >
                Continue
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpenInfo(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
    </div>

    
  );

  
}