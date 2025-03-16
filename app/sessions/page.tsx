"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, getSessionAuthToken, getUserType } from '../utils/authSession';
import QRCode from 'qrcode';
import Image from 'next/image';
import { fetchSessions, updateSessionStatus, deleteSession } from '@/app/api/session';

interface Session {
  _id: string;
  sessionTitle: string;
  sessionDescription: string;
  sessionValidFrom: string;
  sessionValidTo: string;
  sessionStatus: string;
  subjectCode: string;
  classConfigId: string,
  createdBy: string;
  sessionID: string;
  __v: number;
}

export default function AttendancePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'new'>('active');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

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
      if (hash === 'active' || hash === 'new') {
        setFilter(hash as 'active' | 'new');
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
        const { data, error, errorType } = await fetchSessions(userType!, userID, authToken);
        
        console.log(data);
        console.log("got this error" + error);
        console.log("got this error type" + errorType);
        if (error && (errorType == 'Token issue')) {
          alert(errorType + ":" + "We are rediecting you to the login page. Please login and Use the Application");
          sessionStorage.clear();
          router.push('/auth/login');
        }
        setSessions(data);
        setFilteredSessions(data.filter((session: Session) => session.sessionStatus === filter));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [filter, authToken, userID, userType, router, isMounted]);

  // Filter sessions when the filter changes
  useEffect(() => {
    if (sessions?.length > 0) {
      setFilteredSessions(sessions.filter((session) => session.sessionStatus === filter));
    }
  }, [filter, sessions]);

  // Update the URL hash when the filter changes
  const handleFilterChange = (newFilter: 'active'  | 'new') => {
    setFilter(newFilter);
    if (isMounted) {
      window.location.hash = newFilter;
    }
  };

  // Generate QR code
  const openQRModal = async (sessionID: string) => {
    const url = `https://mcisysusrs25.github.io/attendforumstudent/sessionDetails.html?sessionID=${sessionID}`;
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
    const link = `https://mcisysusrs25.github.io/attendforumstudent/sessionDetails.html?sessionID=${sessionID}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link to clipboard.');
    });
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
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle month selection change
  const handleMonthChange = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

// Get unique months from sessions
const getUniqueMonths = () => {
  const months = sessions.map(session => new Date(session.sessionValidFrom).toLocaleString('default', { month: 'long' }));
  
  // Array of month names for sorting
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return [...new Set(months)].sort((a, b) => {
    const aMonthIndex = monthNames.indexOf(a);
    const bMonthIndex = monthNames.indexOf(b);

    // Compare months based on their index in the monthNames array
    return aMonthIndex - bMonthIndex;
  });
};


  // Filter sessions based on search query and selected months
  useEffect(() => {
    let filtered = sessions.filter(session => session.sessionStatus === filter);

    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.sessionDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedMonths.length > 0) {
      filtered = filtered.filter(session =>
        selectedMonths.includes(new Date(session.sessionValidFrom).toLocaleString('default', { month: 'long' }))
      );
    }

    setFilteredSessions(filtered);
  }, [searchQuery, selectedMonths, sessions, filter]);

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
    <div className="bg-white shadow-lg rounded-md max-w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-4 mb-8">
          {/* Filter Buttons */}
          {['active', ...(userType === 'professor' ? ['new'] : [])].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status as 'active' | 'new')}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm ${filter === status
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Month Selection Dropdown */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700">Select Months</label>
          <div className="mt-1">
            {getUniqueMonths().map(month => (
              <div key={month} className="flex items-center">
                <input
                  type="checkbox"
                  id={month}
                  value={month}
                  checked={selectedMonths.includes(month)}
                  onChange={() => handleMonthChange(month)}
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor={month} className="ml-2 text-sm text-gray-700">{month}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Display count of filtered sessions */}
        <div className="mb-8 text-sm text-gray-700">
          {filteredSessions.length} sessions found
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${session.sessionStatus === 'active'
                          ? 'bg-primary-active text-primary-white border'
                          : session.sessionStatus === 'completed'
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
                  {userType === 'professor' && (
                    <>
                      {session.sessionStatus === 'new' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`sessions/update-session/${session.sessionID}`);
                          }}
                          className="px-4 py-2 border border-gray-300 text-primary rounded-lg text-sm font-medium"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(session);
                        }}
                        className="px-4 py-2 border border-gray-300 text-priary rounded-lg text-sm font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(session.sessionID, session.sessionStatus === 'active' ? 'completed' : 'active');
                        }}
                        className="px-4 py-2 border border-gray-300 text-primary rounded-lg text-sm font-medium"
                      >
                        {session.sessionStatus === 'active' ? 'Complete' : 'Activate'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyLinkToClipboard(session.sessionID);
                        }}
                        className="px-4 py-2 border border-gray-200 cursor-pointer text-primary rounded-lg text-sm font-medium"
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
                    className="px-4 py-2 border border-gray-300 text-primary rounded-lg text-sm font-medium"
                  >
                    Show QR
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/sessions/${session.sessionID}`);
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
            {/* Header */}
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

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* QR Code Container */}
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

              {/* Button */}
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