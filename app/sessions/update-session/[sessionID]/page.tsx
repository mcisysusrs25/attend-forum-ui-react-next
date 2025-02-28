"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';
import { fetchSessionDetails, updateSession, fetchBatches, fetchSubjects } from '@/app/api/session';
import { fetchClasssConfigurationsByProfessorID } from '@/app/api/config';

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


// Define Classroom Interface
interface Classroom {
  _id?: string;
  latitude: number;
  longitude: number;
  label: string;
  classConfigId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export default function UpdateSessionPage() {
  const router = useRouter();
  const params = useParams(); // Get params from the URL
  const sessionID = typeof params.sessionID === 'string' ? params.sessionID : Array.isArray(params.sessionID) ? params.sessionID[0] : '';
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionValidFrom, setSessionValidFrom] = useState('');
  const [sessionValidTo, setSessionValidTo] = useState('');
  const [subjectCode, setSubjectCode] = useState(''); // Selected subjectCode
  const [batchID, setBatchID] = useState(''); // Selected batchID
  const [batches, setBatches] = useState<Batch[]>([]); // List of batches
  const [subjects, setSubjects] = useState<Subject[]>([]); // List of subjects
  const [error, setError] = useState<string | null>(null);

  const [classConfigId, setClassConfigId] = useState(''); // Selected batchID
  const [configs, setConfigs] = useState<Classroom[]>([]); // List of batches
  
  // Loading state controls
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const authToken = getSessionAuthToken();
  const userID = getUserId();

  // Fetch session details
  useEffect(() => {
    if (!sessionID || !authToken || !userID) {
      router.push('/auth/login');
      return;
    }

    const loadSession = async () => {
      try {
        setLoadingSession(true);
        setError(null);

        const session = await fetchSessionDetails(sessionID, authToken);

        // Format the date and time for datetime-local input
        const formatDateTime = (dateTime: string) => {
          const date = new Date(dateTime);
          return date.toISOString().slice(0, 16); // Convert to "YYYY-MM-DDTHH:MM" format
        };

        // Bind session details to the form fields
        setSessionTitle(session.sessionTitle);
        setSessionDescription(session.sessionDescription);
        setSessionValidFrom(formatDateTime(session.sessionValidFrom));
        setSessionValidTo(formatDateTime(session.sessionValidTo));
        setSubjectCode(session.subjectCode);
        setBatchID(session.batchID);
        setClassConfigId(session.classConfigId);
        
        console.log("sessions confid it to test");
        console.log(session.classConfigId);

      } catch (error) {
        console.error('Error fetching session details:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, [sessionID, authToken, userID, router]);

  // Fetch batches for the professor
  useEffect(() => {
    if (!authToken || !userID) {
      return;
    }

    const loadBatches = async () => {
      try {
        setLoadingBatches(true);
        const data = await fetchBatches(userID, authToken);
        setBatches(data);
      } catch (error) {
        console.error('Error fetching batches:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoadingBatches(false);
      }
    };

    loadBatches();
  }, [authToken, userID]);

  // Fetch subjects for the professor
  useEffect(() => {
    if (!authToken || !userID) {
      return;
    }

    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const data = await fetchSubjects(userID, authToken);
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [authToken, userID]);


    // Fetch configs for the professor
    useEffect(() => {
      if (!authToken || !userID) {
        return;
      }
  
      const loadConfigs = async () => {
        try {
          setLoadingConfigs(true);
          const resultsConfig = await fetchClasssConfigurationsByProfessorID(authToken, userID);
          setConfigs(resultsConfig?.data || []);
          console.log(configs);
        } catch (error) {
          console.error('Error fetching Class configs:', error);
          setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
          setLoadingConfigs(false);
        }
      };
  
      loadConfigs();
    }, [authToken, userID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!authToken || !userID) {
      setError('User is not authenticated. Please log in again.');
      setSubmitting(false);
      return;
    }

    try {
      const sessionData = {
        sessionTitle,
        sessionDescription,
        sessionValidFrom,
        sessionValidTo,
        subjectCode,
        batchID,
        classConfigId,
        createdBy: userID,
      };

      await updateSession(sessionID, sessionData, authToken);

      // Redirect after successful submission
      router.push('/sessions#new');
    } catch (error) {
      console.error('Error updating session:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if any data is still loading
  const isLoading = loadingSession || loadingBatches || loadingSubjects || loadingConfigs;

  // Skeleton loading component
  const SkeletonForm = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-24 bg-gray-200 rounded w-full"></div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
      
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      
      <div className="h-10 bg-gray-200 rounded w-28 mt-4"></div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-2xl font-bold mb-4">Update Session</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-500">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <SkeletonForm />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Session Title</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
              >
                <option value="">Select a batch</option>
                {batches.map((batch) => (
                  <option key={batch.batchID} value={batch.batchID}>
                    {batch.batchLabel} (ID: {batch.batchID})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Select Class</label>
              <select
                value={classConfigId}
                onChange={(e) => setClassConfigId(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                disabled={submitting}
              >
                <option value="">Select a Class</option>
                {configs.map((config) => (
                  <option key={config.classConfigId} value={config.classConfigId}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={`mt-4 px-4 py-2 bg-indigo-700 text-white rounded hover:bg-blue-600 transition-colors duration-300 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Session'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}