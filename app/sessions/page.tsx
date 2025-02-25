"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, getSessionAuthToken, getUserType } from '../utils/authSession';
import QRCode from 'qrcode';
import Image from 'next/image';
import { fetchSessions, updateSessionStatus, deleteSession, markAttendance } from '@/app/api/session';

interface Session {
  _id: string;
  sessionTitle: string;
  sessionDescription: string;
  sessionValidFrom: string;
  sessionValidTo: string;
  sessionStatus: string;
  subjectCode: string;
  createdBy: string;
  sessionID: string;
  __v: number;
}

export default function AttendancePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'completed' | 'new'>('active');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState('');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Fetch user data with useEffect to prevent hydration errors
  const [userType, setUserType] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);

  // Set isMounted flag when the component mounts on the client side
  useEffect(() => {
    setIsMounted(true);
    setUserType(getUserType());
    setAuthToken(getSessionAuthToken());
    setUserID(getUserId());
  }, []);

  // Read the hash on component mount (only on client-side)
  useEffect(() => {
    if (isMounted) {
      const hash = window.location.hash.substring(1); // Remove the '#' from the hash
      if (hash === 'active' || hash === 'completed' || hash === 'new') {
        setFilter(hash as 'active' | 'completed' | 'new');
      }
    }
  }, [isMounted]);

  // Fetch sessions on component mount
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
        // const data = await fetchSessions(userType!, userID, authToken);

        const { data, error, errorType } = await fetchSessions(userType!, userID, authToken);
        console.log("got this error" + error);
        console.log("got this error type" + errorType);
        if (error && (errorType == 'Token issue')) {
          alert(errorType + ":" + "We are rediecting you to the login page. Please login and Use the Application");
          sessionStorage.clear();
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          router.push('/auth/login');
        }
        setSessions(data);
        setFilteredSessions(data.filter((session: Session) => session.sessionStatus === filter));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [filter, authToken, userID, userType, router, isMounted]);

  // Filter sessions when the filter changes
  useEffect(() => {
    if (sessions.length > 0) {
      setFilteredSessions(sessions.filter((session) => session.sessionStatus === filter));
    }
  }, [filter, sessions]);

  // Update the URL hash when the filter changes
  const handleFilterChange = (newFilter: 'active' | 'completed' | 'new') => {
    setFilter(newFilter);
    if (isMounted) {
      window.location.hash = newFilter;
    }
  };

  // Generate QR code
  const openQRModal = async (sessionID: string) => {
    const url = `${window.location.origin}/sessions/attendance/${sessionID}`;
    try {
      const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H', width: 256 });
      setQRCodeDataUrl(dataUrl);
      setShowQRModal(true);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  // Copy link to clipboard
  const copyLinkToClipboard = (sessionID: string) => {
    const link = `${window.location.origin}/sessions/attendance/${sessionID}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link to clipboard.');
    });
  };

  // Mark attendance
  const handleMarkAttendance = async (sessionID: string) => {
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await markAttendance(sessionID, latitude, longitude, authToken!);
          alert('Attendance marked successfully!');
          setShowAttendanceModal(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setAttendanceError('Geolocation access denied. Please enable location services to mark attendance.');
        }
      );
    } catch (error) {
      console.error('Attendance error:', error);
      setAttendanceError(error instanceof Error ? error.message : 'An error occurred while marking attendance.');
    }
  };

  // Update session status with confirmation
  const handleStatusChange = async (sessionID: string, newStatus: string) => {
    const isConfirmed = window.confirm(
      newStatus === 'completed'
        ? 'Are you sure you want to mark this session as completed?'
        : 'Are you sure you want to activate this session?'
    );

    if (isConfirmed) {
      try {
        await updateSessionStatus(sessionID, newStatus, authToken!);
        setSessions(prevSessions =>
          prevSessions.map(session =>
            session.sessionID === sessionID
              ? { ...session, sessionStatus: newStatus }
              : session
          )
        );
      } catch (error) {
        console.error('Status update error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    }
  };

  // Delete session
  const handleDeleteClick = async (session: Session) => {
    const isConfirmed = window.confirm(
      session.sessionStatus === 'active'
        ? 'This session is active. Are you sure you want to delete it?'
        : 'Are you sure you want to delete this session?'
    );

    if (isConfirmed) {
      try {
        await deleteSession(session.sessionID, authToken!);
        setSessions(prevSessions =>
          prevSessions.filter(s => s.sessionID !== session.sessionID)
        );
      } catch (error) {
        console.error('Delete error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    }
  };

  // Open attendance modal for a specific session
  const openAttendanceModal = (sessionID: string) => {
    setCurrentSessionId(sessionID);
    setShowAttendanceModal(true);
  };

  // Skeleton Loading Component
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

  // Safely render client-side content only after mounting
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
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8">
          {/* Filter Buttons */}
          {['active', 'completed', ...(userType === 'professor' ? ['new'] : [])].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status as 'active' | 'completed' | 'new')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm ${filter === status
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* No sessions message */}
        {filteredSessions.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-lg font-medium">
              No {filter} sessions found
            </div>
          </div>
        )}

        {/* Session Cards or Skeleton Loading */}
        {loading ? (
          <SkeletonLoading />
        ) : (
          <div className="space-y-6">
            {filteredSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden group"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start gap-8">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {session.sessionTitle}
                        </h3>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center ${session.sessionStatus === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : session.sessionStatus === 'completed'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                        >
                          {session.sessionStatus}
                        </span>
                      </div>

                      <p className="text-gray-600">
                        {session.sessionDescription}
                      </p>

                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-700">Subject Code:</span><br />
                            {session.subjectCode}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-700">Created By:</span><br />
                            {session.createdBy}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-700">Valid From:</span><br />
                            {new Date(session.sessionValidFrom).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-700">Valid To:</span><br />
                            {new Date(session.sessionValidTo).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 pt-2">
                        <span className="font-semibold text-gray-700">Session ID:</span> {session.sessionID}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-3">
                      {userType === 'professor' && (
                        <>
                          {session.sessionStatus === 'new' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`sessions/update-session/${session.sessionID}`);
                              }}
                              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-sm hover:shadow font-medium text-sm min-w-[120px]"
                            >
                              Edit
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(session);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow font-medium text-sm min-w-[120px]"
                          >
                            Delete
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(session.sessionID, session.sessionStatus === 'active' ? 'completed' : 'active');
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow font-medium text-sm min-w-[120px]"
                          >
                            {session.sessionStatus === 'active' ? 'Mark as Completed' : 'Activate Session'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLinkToClipboard(session.sessionID);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-sm hover:shadow font-medium text-sm min-w-[120px]"
                          >
                            Copy Link
                          </button>
                        </>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQRModal(session.sessionID);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow font-medium text-sm min-w-[120px]"
                      >
                        Show QR
                      </button>

                      {userType === 'student' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAttendanceModal(session.sessionID);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-sm hover:shadow font-medium text-sm min-w-[120px]"
                        >
                          Mark My Attendance
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/sessions/${session.sessionID}`);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm hover:shadow font-medium text-sm min-w-[120px]"
                      >
                        See Details
                      </button>
                    </div>
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
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
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

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Instructions Box */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Instructions:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-blue-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Login or register to mark your attendance
                  </li>
                  <li className="flex items-center gap-2 text-blue-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Enable camera when prompted to scan QR code
                  </li>
                  <li className="flex items-center gap-2 text-blue-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    Position your camera to scan the QR code
                  </li>
                </ul>
              </div>

              {/* QR Code Container */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-dashed border-gray-200">
                  {qrCodeDataUrl && (
                    <Image
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      width={288}
                      height={288}
                      className="object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
                  <p className="text-gray-500 mt-1">Allow access to your location to mark attendance</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {attendanceError && (
                <div className="bg-red-50 p-4 rounded-lg text-red-700">
                  {attendanceError}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkAttendance(currentSessionId)}
                  className="ml-4 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Allow & Mark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}