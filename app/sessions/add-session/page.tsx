"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';
import { fetchBatchesByProfessorId, fetchSubjectsByProfessorId, addSession } from '@/app/api/session';

interface Batch {
  _id: string;
  batchLabel: string;
  batchID: string;
  createdBy: string;
  students: string[];
}

interface Subject {
  _id: string;
  subjectCode: string;
  title: string;
  description: string;
  creditHours: number;
  subjectTerm: string;
  professorID: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SessionData {
  sessionTitle: string;
  sessionDescription: string;
  sessionValidFrom: string;
  sessionValidTo: string;
  subjectCode: string;
  batchID: string;
  createdBy: string;
}

export default function AddSessionPage() {
  const router = useRouter();
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionValidFrom, setSessionValidFrom] = useState('');
  const [sessionValidTo, setSessionValidTo] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [batchID, setBatchID] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authToken = getSessionAuthToken();
  const userID = getUserId();

  // Format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  // Set default times on initial load
  useEffect(() => {
    const now = new Date();
    const twentyMinsLater = new Date(now.getTime() + 20 * 60000);
    
    setSessionValidFrom(formatDateForInput(now));
    setSessionValidTo(formatDateForInput(twentyMinsLater));
  }, []);

  // Authentication check
  useEffect(() => {
    if (!authToken) {
      console.log('No auth token found, redirecting to login');
      router.push('/auth/login');
    }
  }, [authToken, router]);

  // Fetch batches for the professor
  useEffect(() => {
    if (!authToken || !userID) return;

    const fetchData = async () => {
      try {
        const batchesData = await fetchBatchesByProfessorId(userID, authToken);
        const subjectsData = await fetchSubjectsByProfessorId(userID, authToken);
        setBatches(batchesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    fetchData();
  }, [authToken, userID]);

  // Update selected objects when IDs change
  useEffect(() => {
    if (subjectCode) {
      const subject = subjects.find(s => s.subjectCode === subjectCode);
      setSelectedSubject(subject || null);
    } else {
      setSelectedSubject(null);
    }
    
    if (batchID) {
      const batch = batches.find(b => b.batchID === batchID);
      setSelectedBatch(batch || null);
    } else {
      setSelectedBatch(null);
    }
  }, [subjectCode, batchID, subjects, batches]);

  // Generate title and description when all required fields are selected
  useEffect(() => {
    if (selectedSubject && selectedBatch && sessionValidFrom && sessionValidTo) {
      // Format dates for display
      const startDate = new Date(sessionValidFrom);
      const endDate = new Date(sessionValidTo);
      
      const formattedStart = startDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      const formattedEnd = endDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      // Generate title
      const newTitle = `${selectedSubject.title} - ${selectedBatch.batchLabel}`;
      setSessionTitle(newTitle);
      
      // Generate description
      const newDescription = `Session for ${selectedSubject.title} (${selectedSubject.subjectCode}) with ${selectedBatch.batchLabel} on ${formattedStart} to ${formattedEnd}.`;
      setSessionDescription(newDescription);
    }
  }, [selectedSubject, selectedBatch, sessionValidFrom, sessionValidTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!authToken || !userID) {
      console.log('User is not authenticated');
      setError('User is not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const sessionData: SessionData = {
        sessionTitle,
        sessionDescription,
        sessionValidFrom,
        sessionValidTo,
        subjectCode,
        batchID,
        createdBy: userID,
      };

      await addSession(sessionData, authToken);

      // Redirect after successful submission
      console.log('Session added successfully, redirecting to sessions');
      router.push('/sessions#new');
    } catch (error) {
      console.error('Error adding session:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Submitting session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
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
          Back to List
        </button>

        <h2 className="text-2xl font-bold mb-4">Add New Session</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Step 1: Select Subject and Batch</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject.subjectCode}>
                      {subject.title} ({subject.subjectCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                <select
                  value={batchID}
                  onChange={(e) => setBatchID(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="">Select a batch</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch.batchID}>
                      {batch.batchLabel} (ID: {batch.batchID})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Step 2: Set Session Timing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Start Time *</label>
                <input
                  type="datetime-local"
                  value={sessionValidFrom}
                  onChange={(e) => setSessionValidFrom(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session End Time *</label>
                <input
                  type="datetime-local"
                  value={sessionValidTo}
                  onChange={(e) => setSessionValidTo(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Step 3: Review Auto-Generated Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  required
                  className="block w-full border border-gray-300 rounded-md p-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generated based on your selections. You can edit if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Description</label>
                <textarea
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  required
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md p-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generated based on your selections. You can edit if needed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/sessions')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
              disabled={!subjectCode || !batchID || !sessionValidFrom || !sessionValidTo}
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}