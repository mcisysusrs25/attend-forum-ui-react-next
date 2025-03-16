"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, getSessionAuthToken, getUserType } from '../utils/authSession';
import QRCode from 'qrcode';
import Image from 'next/image';
import { fetchSessions, updateSessionStatus, deleteSession } from '@/app/api/session';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface Session {
  _id: string;
  sessionTitle: string;
  sessionDescription: string;
  sessionValidFrom: string;
  sessionValidTo: string;
  sessionStatus: string;
  subjectCode: string;
  classConfigId: string;
  createdBy: string;
  sessionID: string;
  __v: number;
}

export default function AttendancePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const [userType, setUserType] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setUserType(getUserType());
    setAuthToken(getSessionAuthToken());
    setUserID(getUserId());
  }, []);

  useEffect(() => {
    if (!isMounted || !authToken || !userID) {
      if (isMounted && (!authToken || !userID)) {
        router.push('/auth/login');
      }
      return;
    }

    const loadSessions = async () => {
      try {
        setLoading(true);
        const { data, error, errorType } = await fetchSessions(userType!, userID, authToken);

        if (error && errorType === 'Token issue') {
          alert(errorType + ":" + "We are redirecting you to the login page. Please login and use the application.");
          sessionStorage.clear();
          router.push('/auth/login');
        }
        // Filter sessions to only show completed ones
        const completedSessions = data.filter((session: Session) => session.sessionStatus === 'completed');
        setSessions(completedSessions);
        setFilteredSessions(completedSessions);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [authToken, userID, userType, router, isMounted]);

  useEffect(() => {
    let filtered = sessions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.sessionDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected months
    if (selectedMonths.length > 0) {
      filtered = filtered.filter(session => {
        const sessionMonth = new Date(session.sessionValidFrom).toLocaleString('default', { month: 'long', year: 'numeric' });
        return selectedMonths.includes(sessionMonth);
      });
    }

    setFilteredSessions(filtered);
  }, [searchQuery, selectedMonths, sessions]);

  const handleMonthSelection = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const getUniqueMonths = () => {
    const months = sessions.map(session =>
      new Date(session.sessionValidFrom).toLocaleString('default', { month: 'long', year: 'numeric' })
    );
    return [...new Set(months)];
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSessions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions');
    XLSX.writeFile(workbook, 'sessions.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Completed Sessions Report', 10, 10);
    doc.setFontSize(12);
    let yPosition = 20;
    filteredSessions.forEach((session, index) => {
      doc.text(`Session ${index + 1}: ${session.sessionTitle}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Description: ${session.sessionDescription}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Start Date: ${new Date(session.sessionValidFrom).toLocaleDateString()}`, 10, yPosition);
      yPosition += 10;
      doc.text(`End Date: ${new Date(session.sessionValidTo).toLocaleDateString()}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Subject: ${session.subjectCode}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Instructor: ${session.createdBy}`, 10, yPosition);
      yPosition += 20; // Add extra space between sessions
    });
    doc.save('sessions.pdf');
  };

  const SkeletonLoading = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 cursor-pointer animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isMounted) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-md max-w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-4 mb-8">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-md"
          />
          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center"
            >
              <span className="mr-2">Select Months</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {showMonthDropdown && (
              <div className="absolute mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2">
                {getUniqueMonths().map((month) => (
                  <div key={month} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMonths.includes(month)}
                      onChange={() => handleMonthSelection(month)}
                      className="mr-2"
                    />
                    <span>{month}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 border border-gray-300 rounded-lg flex items-center bg-blue-500 text-white hover:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2v10h8V5H5zm8 12v-2h2v2h-2zm0-4v-2h2v2h-2zm0-4V7h2v2h-2z"
                clipRule="evenodd"
              />
            </svg>
            Export to Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 border border-gray-300 rounded-lg flex items-center bg-red-500 text-white hover:bg-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 2v10h8V5H5zm8 12v-2h2v2h-2zm0-4v-2h2v2h-2zm0-4V7h2v2h-2z"
                clipRule="evenodd"
              />
            </svg>
            Export to PDF
          </button>
        </div>

        <div className="mb-4 text-lg font-semibold">
          Total Completed Sessions: {filteredSessions.length}
        </div>

        {filteredSessions.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-lg font-medium">
              No completed sessions found
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonLoading />
        ) : (
          <div className="space-y-6">
            {filteredSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden group h-[250px] flex flex-col justify-between"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                          {session.sessionTitle}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${session.sessionStatus === 'completed'
                            ? 'bg-primary-completed text-primary-white border'
                            : 'bg-primary-completed text-primary-white border'
                            }`}
                        >
                          {session.sessionStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {session.sessionDescription}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-700">Subject:</span> {session.subjectCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-700">Instructor:</span> {session.createdBy}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-700">Starts:</span> {new Date(session.sessionValidFrom).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-700">Ends:</span> {new Date(session.sessionValidTo).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/history/${session.sessionID}`);
                      }}
                      className="px-4 py-2 border border-gray-300 text-primary rounded-lg text-sm font-medium"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Attendance QR Code</h2>
                  <p className="text-gray-500 mt-1">Scan to mark your attendance</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-dashed border-gray-200">
                  {qrCodeDataUrl && (
                    <Image
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      width={400}
                      height={400}
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}