"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';

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

export default function AddSessionPage() {
  const router = useRouter();
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionValidFrom, setSessionValidFrom] = useState('');
  const [sessionValidTo, setSessionValidTo] = useState('');
  const [subjectCode, setSubjectCode] = useState(''); // Selected subjectCode
  const [batchID, setBatchID] = useState(''); // Selected batchID
  const [batches, setBatches] = useState<Batch[]>([]); // List of batches
  const [subjects, setSubjects] = useState<Subject[]>([]); // List of subjects
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Authentication check
  useEffect(() => {
    const authToken = getSessionAuthToken();
    if (!authToken) {
      console.log("No auth token found, redirecting to login");
      router.push('/auth/login');
    }
  }, [router]);

  // Fetch batches for the professor
  useEffect(() => {
    const fetchBatches = async () => {
      const authToken = getSessionAuthToken();
      const userID = getUserId();

      if (!authToken || !userID) {
        console.log("User is not authenticated");
        setError('User is not authenticated. Please log in again.');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/batches/getBatchByProfessorId', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            professorID: userID
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch batches');
        }

        const data = await response.json();
        setBatches(data.data); // Set the fetched batches
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchBatches();
  }, [router]);

  // Fetch subjects for the professor
  useEffect(() => {
    const fetchSubjects = async () => {
      const authToken = getSessionAuthToken();
      const userID = getUserId();

      if (!authToken || !userID) {
        console.log("User is not authenticated");
        setError('User is not authenticated. Please log in again.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/subjects/getsubjects/${userID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch subjects');
        }

        const data = await response.json();
        setSubjects(data.data); // Set the fetched subjects
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchSubjects();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const authToken = getSessionAuthToken();
    const userID = getUserId();

    if (!authToken || !userID) {
      console.log("User is not authenticated");
      setError('User is not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      console.log("Sending request to add session with data:", {
        sessionTitle,
        sessionDescription,
        sessionValidFrom,
        sessionValidTo,
        subjectCode, // Include selected subjectCode
        batchID, // Include selected batchID
        createdBy: userID
      });

      const response = await fetch('http://localhost:5000/api/sessions/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sessionTitle,
          sessionDescription,
          sessionValidFrom,
          sessionValidTo,
          subjectCode, // Include selected subjectCode
          batchID, // Include selected batchID
          createdBy: userID
        }),
      });

      console.log("Received response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || 'Failed to add session');
      }

      // Redirect after successful submission
      console.log("Session added successfully, redirecting to sessions");
      router.push('/sessions'); // Redirect to the session list or desired page
    } catch (err) {
      console.error('Error adding session:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setSessionTitle('');
    setSessionDescription('');
    setSessionValidFrom('');
    setSessionValidTo('');
    setSubjectCode('');
    setBatchID('');
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
        <button onClick={() => router.push('/sessions')} className="flex items-center text-blue-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 18a1 1 0 01-.707-1.707L13.586 12H3a1 1 0 110-2h10.586l-4.293-4.293A1 1 0 0110 4a1 1 0 011 1v11a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          Back to List
        </button>

        <h2 className="text-2xl font-bold mb-4">Add New Session</h2>

        {error && (
          <div className="mb-4 text-red-500">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Session Title</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Valid From</label>
              <input
                type="datetime-local"
                value={sessionValidFrom}
                onChange={(e) => setSessionValidFrom(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valid To</label>
              <input
                type="datetime-local"
                value={sessionValidTo}
                onChange={(e) => setSessionValidTo(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Subject</label>
            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
            <label className="block text-sm font-medium text-gray-700">Select Batch</label>
            <select
              value={batchID}
              onChange={(e) => setBatchID(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select a batch</option>
              {batches.map((batch) => (
                <option key={batch.batchID} value={batch.batchID}>
                  {batch.batchLabel} (ID: {batch.batchID})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClearForm}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-300"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
            >
              Add Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
