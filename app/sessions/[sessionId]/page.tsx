"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, Users, BookOpen, User, Calendar, Activity, Download } from 'lucide-react';
import { fetchSessionDetails, updateAttendance } from '@/app/api/sessionDetails';
import { getSessionAuthToken, getUserType, getUserId } from '@/app/utils/authSession';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-none rounded-lg p-6 w-11/12 max-w-md">
        <div className="text-center">
          {children}
        </div>
        <div className="mt-4 flex justify-center">
        </div>
      </div>
    </div>
  );
};

export default function SessionDetails() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [successAttenenceResult, setSuccessAttenenceResult] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const authToken = getSessionAuthToken();
  const [userType, setUserType] = useState("student");
  const [studentID, setStudentID] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setModalMessage("You have to be physically present in the class to mark your attendance. This process will capture your geolocation. To proceed, please allow location access and continue.");
    setIsModalOpen(true);

  }

  const handleMarkMyAttendance = async () => {
    console.log("Attendance marking initiated");
    setIsLoading(true);
    
    try {
      if (!authToken || !studentID) {
        router.push('/auth/login');
        return;
      }
      
      // Get current location
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            { 
              timeout: 10000,
              enableHighAccuracy: true,
              maximumAge: 0
            }
          );
        });
        
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Make API request with geolocation data
        const response = await fetch('http://localhost:5000/api/student/sessions/mark-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            sessionID: sessionId,
            studentID: studentID,
            lat: latitude,
            long: longitude,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          setModalMessage(errorData.message || "You are not within the allowed range. Please be in the classroom to mark your attendance.");
          return;
        }
        
        const data = await response.json();
        setModalMessage(data.message);
        setSuccessAttenenceResult(true);
        
      } catch (locationError) {
        console.error("Location error:", locationError);
        if (locationError instanceof GeolocationPositionError) {
          if (locationError.code === 1) {
            setModalMessage("Location access denied. Please enable location permissions in your browser settings.");
          } else if (locationError.code === 2) {
            setModalMessage("Location unavailable. Please try again in a different area.");
          } else if (locationError.code === 3) {
            setModalMessage("Location request timed out. Please try again.");
          } else {
            setModalMessage("Unable to retrieve your location. Please enable location services and try again.");
          }
        } else {
          setModalMessage("Unable to retrieve your location. Please enable location services and try again.");
        }
      }
    } catch (err) {
      console.error("General error:", err);
      setModalMessage(err instanceof Error ? err.message : "An error occurred while marking attendance.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDownload2 = (format: 'excel' | 'pdf') => {
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


  const handleDownload = (format: 'excel' | 'pdf') => {
    if (!session) return;
    
    const reportDate = new Date().toLocaleDateString();
    const reportTime = new Date().toLocaleTimeString();
    
    const institutionName = "Youngstown State University";
    const institutionAddress = "One University Plaza, Youngstown, OH 44555, USA";
    const institutionPhone = "+1 330-941-3000";
    const institutionEmail = "webmaster@ysu.edu";
    const institutionWebsite = "https://ysu.edu";
  
    // Simplified student data with only requested fields
    const studentData = session.students.map((student: any, index: number) => [
      index + 1,
      student.studentID,
      student.attendanceStatus
    ]);
  
    const totalStudents = session.students.length;
    const presentStudents = session.students.filter((s: any) => s.attendanceStatus === 'Present').length;
    const absentStudents = session.students.filter((s: any) => s.attendanceStatus === 'Absent').length;
    const attendancePercentage = totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(2) : '0';
  
    const attendanceStats = [
      ['Total Students', totalStudents.toString()],
      ['Present', presentStudents.toString()],
      ['Absent', absentStudents.toString()],
      ['Attendance Rate', `${attendancePercentage}%`]
    ];
  
    // Break session description into multiple lines for better display
    const wrapDescription = (text: string, maxLength: number = 80): string[] => {
      if (!text) return ['N/A'];
      
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        if ((currentLine + ' ' + word).length <= maxLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };
  
    const sessionInfo = [
      ['Session Title', session.sessionTitle],
      ['Description', wrapDescription(session.sessionDescription)[0]],
      ...wrapDescription(session.sessionDescription).slice(1).map(line => ['', line]),
      ['Valid From', new Date(session.sessionValidFrom).toLocaleString()],
      ['Valid To', new Date(session.sessionValidTo).toLocaleString()],
      ['Status', session.sessionStatus],
      ['Subject Code', session.subjectCode],
      ['Created By', session.createdBy],
      ['Batch ID', session.batchID],
      ['Session ID', session.sessionID],
      ['Created On', new Date(session.sessionCreatedDateTime).toLocaleString()],
    ];
  
    if (format === 'excel') {
      // Import XLSX if not already imported
      import('xlsx').then((XLSX) => {
        const workbook = XLSX.utils.book_new();
  
        const coverData = [
          [`${institutionName} - CLASSROOM ATTENDANCE REPORT`],
          [''],
          ['Institution Details:'],
          ['Address:', institutionAddress],
          ['Phone:', institutionPhone],
          ['Email:', institutionEmail],
          ['Website:', institutionWebsite],
          [''],
          ['Report Generated On:', `${reportDate} at ${reportTime}`],
          [''],
          ['SESSION INFORMATION'],
          ...sessionInfo,
          [''],
          ['ATTENDANCE STATISTICS'],
          ...attendanceStats
        ];
        const coverSheet = XLSX.utils.aoa_to_sheet(coverData);
        coverSheet['!cols'] = [{ wch: 25 }, { wch: 70 }]; // Wider second column for description
  
        // Simplified header row with only requested fields
        const headerRow = ['S.No', 'Student ID', 'Status'];
        const studentSheet = XLSX.utils.aoa_to_sheet([headerRow, ...studentData]);
        studentSheet['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 15 }];
  
        XLSX.utils.book_append_sheet(workbook, coverSheet, 'Report Summary');
        XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Attendance');
  
        const fileName = `${institutionName.replace(/\s+/g, '_')}_Attendance_${session.subjectCode}_${session.sessionID}_${reportDate.replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      }).catch(error => {
        console.error('Error generating Excel file:', error);
      });
    } else if (format === 'pdf') {
      // Import jsPDF
      import('jspdf').then((jsPDFModule) => {
        const jsPDF = jsPDFModule.default;
        
        // Create document instance
        const doc = new jsPDF();
        
        // Now import jspdf-autotable as a separate step
        import('jspdf-autotable').then(() => {
          // Document header
          doc.setFontSize(18).setFont('helvetica', 'bold')
            .text(institutionName, doc.internal.pageSize.width / 2, 15, { align: 'center' });
  
          doc.setFontSize(14).setFont('helvetica', 'normal')
            .text('CLASSROOM ATTENDANCE REPORT', doc.internal.pageSize.width / 2, 22, { align: 'center' });
  
          doc.setFontSize(10).text(institutionAddress, doc.internal.pageSize.width / 2, 28, { align: 'center' })
            .text(`Phone: ${institutionPhone} | Email: ${institutionEmail}`, doc.internal.pageSize.width / 2, 34, { align: 'center' })
            .text(`Website: ${institutionWebsite}`, doc.internal.pageSize.width / 2, 40, { align: 'center' });
  
          doc.setFontSize(10).setFont('helvetica', 'italic')
            .text(`Report generated on: ${reportDate} at ${reportTime}`, 14, 48);
  
          doc.setDrawColor(0).setLineWidth(0.5).line(14, 52, doc.internal.pageSize.width - 14, 52);
  
          // Session information section with wrapped description
          doc.setFontSize(12).setFont('helvetica', 'bold')
            .text('SESSION INFORMATION', 14, 60);
  
          doc.setFontSize(10).setFont('helvetica', 'normal');
          
          let yPosition = 70;
          const descriptionLines = wrapDescription(session.sessionDescription);
          
          // Handle each session information entry
          sessionInfo.forEach(([label, value], index) => {
            // Skip the description entries, we'll handle them separately
            if (label === 'Description' || label === '') {
              if (label === 'Description') {
                doc.text(`${label}:`, 14, yPosition);
                doc.text(`${value}`, 60, yPosition);
                yPosition += 7;
              } else if (label === '') {
                doc.text(`${value}`, 60, yPosition);
                yPosition += 7;
              }
            } else {
              doc.text(`${label}:`, 14, yPosition);
              doc.text(`${value}`, 60, yPosition);
              yPosition += 7;
            }
          });
  
          // Statistics section
          const statsYStart = yPosition + 10;
          doc.setFontSize(12).setFont('helvetica', 'bold')
            .text('ATTENDANCE STATISTICS', 14, statsYStart);
  
          doc.setFontSize(10).setFont('helvetica', 'normal');
          attendanceStats.forEach(([label, value], index) => {
            doc.text(`${label}:`, 14, statsYStart + 10 + index * 7);
            doc.text(`${value}`, 60, statsYStart + 10 + index * 7);
          });
  
          doc.addPage();
  
          // Student attendance details page
          doc.setFontSize(14).setFont('helvetica', 'bold')
            .text('CLASSROOM ATTENDANCE DETAILS', doc.internal.pageSize.width / 2, 15, { align: 'center' });
  
          doc.setFontSize(10).setFont('helvetica', 'normal')
            .text(`Session: ${session.sessionTitle} (${session.sessionID})`, 14, 25)
            .text(`Subject: ${session.subjectCode}`, 14, 32)
            .text(`Date: ${new Date(session.sessionValidFrom).toLocaleDateString()}`, 14, 39);
  
          // Generate simplified student attendance table
          try {
            (doc as any).autoTable({
              startY: 45,
              head: [['S.No', 'Student ID', 'Status']],
              body: studentData,
              theme: 'grid',
              headStyles: { fillColor: [70, 70, 70], textColor: [255, 255, 255], fontStyle: 'bold' },
              alternateRowStyles: { fillColor: [240, 240, 240] },
              columnStyles: { 
                0: { cellWidth: 15 }, 
                1: { cellWidth: 40 }, 
                2: { cellWidth: 30 }
              },
              didDrawPage: (data: any) => {
                const pageNumber = 1
                
                // Add footer with "For Official Use Only" text
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100, 100, 100);
                doc.text(
                  `FOR OFFICIAL USE ONLY - CONFIDENTIAL`,
                  doc.internal.pageSize.width / 2, 
                  doc.internal.pageSize.height - 15, 
                  { align: 'center' }
                );
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(
                  `Page ${pageNumber} - ${institutionName} - Generated on ${reportDate}`,
                  doc.internal.pageSize.width / 2, 
                  doc.internal.pageSize.height - 10, 
                  { align: 'center' }
                );
              }
            });
          } catch (tableError) {
            console.error('Error using autoTable, falling back to manual table:', tableError);
            
            // Fall back to a simple manual table if autoTable is not available
            const startY = 45;
            const colWidths = [15, 40, 30];
            const colStart = [14, 29, 69]; // Starting X position for each column
            const rowHeight = 8;
            
            // Draw header
            const headers = ['S.No', 'Student ID', 'Status'];
            doc.setFillColor(70, 70, 70);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.rect(14, startY, 85, rowHeight, 'F');
            
            headers.forEach((header, idx) => {
              doc.text(header, colStart[idx], startY + 5);
            });
            
            // Draw data rows
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            
            studentData.forEach((row, rowIdx) => {
              const yPos = startY + (rowIdx + 1) * rowHeight;
              
              // Add alternating row background
              if (rowIdx % 2 === 0) {
                doc.setFillColor(240, 240, 240);
                doc.rect(14, yPos, 85, rowHeight, 'F');
              }
              
              // Add cell content
              row.forEach((cell, cellIdx) => {
                doc.text(String(cell), colStart[cellIdx], yPos + 5);
              });
            });
            
            // Add "For Official Use Only" footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(
              `FOR OFFICIAL USE ONLY - CONFIDENTIAL`,
              doc.internal.pageSize.width / 2, 
              doc.internal.pageSize.height - 15, 
              { align: 'center' }
            );
            
            // Add page number at the bottom
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const pageNumber = 1
            doc.text(
              `Page ${pageNumber} - ${institutionName} - Generated on ${reportDate}`,
              doc.internal.pageSize.width / 2, 
              doc.internal.pageSize.height - 10, 
              { align: 'center' }
            );
          }
  
          const fileName = `${institutionName.replace(/\s+/g, '_')}_Attendance_${session.subjectCode}_${session.sessionID}_${reportDate.replace(/\//g, '-')}.pdf`;
          doc.save(fileName);
        }).catch(error => {
          console.error('Error with jspdf-autotable:', error);
          
          // Fallback to basic PDF without table if autoTable can't be loaded
          const doc = new jsPDF();
          doc.setFontSize(16);
          doc.text("Classroom Attendance Report", 14, 20);
          doc.setFontSize(12);
          doc.text(`${institutionName} - ${session.sessionTitle}`, 14, 30);
          doc.text(`Subject: ${session.subjectCode}`, 14, 40);
          doc.text(`Total Students: ${totalStudents}`, 14, 50);
          doc.text(`Present: ${presentStudents} (${attendancePercentage}%)`, 14, 60);
          doc.text(`Absent: ${absentStudents}`, 14, 70);
          doc.text(`Report generated on: ${reportDate} at ${reportTime}`, 14, 80);
          
          // Add "For Official Use Only" footer
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text(
            `FOR OFFICIAL USE ONLY - CONFIDENTIAL`,
            doc.internal.pageSize.width / 2, 
            doc.internal.pageSize.height - 15, 
            { align: 'center' }
          );
          
          const fileName = `${institutionName.replace(/\s+/g, '_')}_Attendance_${session.subjectCode}_${session.sessionID}_${reportDate.replace(/\//g, '-')}_basic.pdf`;
          doc.save(fileName);
        });
      }).catch(error => {
        console.error('Error loading jsPDF:', error);
        alert('Failed to generate PDF. Please try again or contact support.');
      });
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
              onClick={handleAttendenceExperiences}
              className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Mark My Attendance
            </button>
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 md:w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Notification</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-700">Processing your request...</p>
              </div>
            ) : (
              <p className="text-gray-700 text-center">{modalMessage}</p>
            )}

            {!isLoading && (
              <div className="mt-6 flex justify-center">
                {/* The onclick will close on click of OK if successAttendanceResult is true */}
                <button
                  onClick={() => {
                    if (successAttenenceResult) {
                      handleMarkMyAttendance();
                    }
                  }}
                  className="px-4 py-2 w-[200px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  OK
                </button>
              </div>
            )}

          </div>
        </Modal>

      </div>
    </div>
  );
}