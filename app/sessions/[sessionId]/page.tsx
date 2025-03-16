"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, Users, BookOpen, User, Calendar, Activity, Download } from 'lucide-react';
import { fetchSessionDetails, updateAttendance } from '@/app/api/sessionDetails';
import { getSessionAuthToken } from '@/app/utils/authSession';

export default function SessionDetails() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const authToken = getSessionAuthToken();

  useEffect(() => {
    if (!sessionId || !authToken) {
      router.push('/auth/login');
      return;
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

  // Define proper types for our data
interface Student {
  studentID: string;
  attendanceStatus: 'Present' | 'Absent' | 'Excused';
}

interface Session {
  sessionID: string;
  sessionTitle: string;
  sessionDescription: string;
  sessionValidFrom: string;
  sessionValidTo: string;
  sessionStatus: string;
  subjectCode: string;
  createdBy: string;
  batchID: string;
  sessionCreatedDateTime: string;
  students: Student[];
}

const handleDownload = (format: 'excel' | 'pdf') => {
  if (!session) return;
  
  // Basic information
  const reportDate = new Date().toLocaleDateString();
  const institutionName = "Youngstown State University";
  
  // Prepare the data
  const studentData = session.students.map((student, index) => [
    index + 1,
    student.studentID,
    student.attendanceStatus
  ]);
  
  // Calculate attendance statistics
  const totalStudents = session.students.length;
  const presentStudents = session.students.filter(s => s.attendanceStatus === 'Present').length;
  const absentStudents = session.students.filter(s => s.attendanceStatus === 'Absent').length;
  const attendancePercentage = totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(2) : '0';
  
  // Export as Excel
  if (format === 'excel') {
    import('xlsx').then((XLSX) => {
      const workbook = XLSX.utils.book_new();
      
      // Create summary sheet
      const summaryData = [
        [`${institutionName} - ATTENDANCE REPORT`],
        [''],
        ['Session Information:'],
        ['Title:', session.sessionTitle],
        ['Subject:', session.subjectCode],
        ['Session ID:', session.sessionID],
        ['Date Range:', `${new Date(session.sessionValidFrom).toLocaleDateString()} to ${new Date(session.sessionValidTo).toLocaleDateString()}`],
        [''],
        ['Attendance Summary:'],
        ['Total Students:', totalStudents.toString()],
        ['Present:', presentStudents.toString()],
        ['Absent:', absentStudents.toString()],
        ['Attendance Rate:', `${attendancePercentage}%`]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Create attendance sheet
      const headerRow = ['S.No', 'Student ID', 'Status'];
      const attendanceSheet = XLSX.utils.aoa_to_sheet([headerRow, ...studentData]);
      
      // Add sheets to workbook
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
      
      // Generate filename and save
      const fileName = `Attendance_${session.subjectCode}_${session.sessionID}_${reportDate.replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }).catch(error => {
      console.error('Error generating Excel file:', error);
    });
  } 
  // Export as PDF
  else if (format === 'pdf') {
    // First import jsPDF
    import('jspdf').then(async ({ default: jsPDF }) => {
      try {
        // Then import and set up the autotable plugin
        const autoTable = await import('jspdf-autotable').then(
          module => module.default || module
        );
        
        // Create the document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(16);
        doc.text(`${institutionName} - ATTENDANCE REPORT`, 14, 20);
        
        // Add session info
        doc.setFontSize(12);
        doc.text(`Session: ${session.sessionTitle} (${session.sessionID})`, 14, 30);
        doc.text(`Subject: ${session.subjectCode}`, 14, 38);
        doc.text(`Date: ${new Date(session.sessionValidFrom).toLocaleDateString()}`, 14, 46);
        
        // Add attendance summary
        doc.text('Attendance Summary:', 14, 58);
        doc.text(`Total Students: ${totalStudents}`, 20, 66);
        doc.text(`Present: ${presentStudents} (${attendancePercentage}%)`, 20, 74);
        doc.text(`Absent: ${absentStudents}`, 20, 82);
        
        // Use the autoTable function directly
        autoTable(doc, {
          startY: 94,
          head: [['S.No', 'Student ID', 'Status']],
          body: studentData,
          theme: 'grid'
        });
        
        // Add footer
        doc.setFontSize(10);
        doc.text(`Generated on: ${reportDate}`, 14, doc.internal.pageSize.height - 10);
        
        // Save the file
        const fileName = `Attendance_${session.subjectCode}_${session.sessionID}_${reportDate.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);
        
      } catch (error) {
        console.error('Error generating PDF:', error);
        
        // Fallback to basic PDF without table
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`${institutionName} - ATTENDANCE REPORT`, 14, 20);
        doc.setFontSize(12);
        doc.text(`Session: ${session.sessionTitle}`, 14, 30);
        doc.text(`Subject: ${session.subjectCode}`, 14, 38);
        doc.text(`Total Students: ${totalStudents}`, 14, 48);
        doc.text(`Present: ${presentStudents} (${attendancePercentage}%)`, 14, 56);
        doc.text(`Absent: ${absentStudents}`, 14, 64);
        doc.text(`Generated on: ${reportDate}`, 14, 72);
        doc.save(`Attendance_Basic_${reportDate.replace(/\//g, '-')}.pdf`);
      }
    }).catch(error => {
      console.error('Error loading jsPDF:', error);
    });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto px-4">
      <button
          type="button"
          onClick={() => router.push("/sessions")}
          className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 "
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Sessions
        </button>


        {/* Session Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl min-h-[200px]">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors duration-200"
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
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors duration-200"
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
                
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleDownload('excel')}
                      className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors duration-200"
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
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1 text-gray-900">{session.sessionDescription}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subject Code</p>
                    <p className="mt-1 text-gray-900">{session.subjectCode}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created By</p>
                    <p className="mt-1 text-gray-900">{session.createdBy}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valid From</p>
                    <p className="mt-1 text-gray-900">{new Date(session.sessionValidFrom).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valid To</p>
                    <p className="mt-1 text-gray-900">{new Date(session.sessionValidTo).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading attendance data...</p>
              </div>
            </div>
          ) : error || !session ? (
            <div className="h-[200px]"></div> // Empty placeholder to maintain layout
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-gray-900">Student Attendance</h2>
                </div>
                
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={showAttendancePanel}
                        onChange={() => setShowAttendancePanel(!showAttendancePanel)}
                        className="form-checkbox h-5 w-5 text-primary rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
                    </label>

                    {showAttendancePanel && (
                      <button
                        onClick={handleMarkAsPresent}
                        disabled={selectedStudents.length === 0}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
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
                          <tr key={student.studentID} className="hover:bg-gray-50 transition-colors duration-150">
                            {showAttendancePanel && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                {student.attendanceStatus === 'Absent' && (
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.studentID)}
                                    onChange={() => handleCheckboxChange(student.studentID)}
                                    className="form-checkbox h-5 w-5 text-white rounded"
                                  />
                                )}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.studentID}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-6 py-3 rounded-full text-xs font-medium ${student.attendanceStatus === 'Present'
                                  ? 'bg-green-200 text-green-700'
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

      </div>
    </div>
  );
}