"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';

export default function AddSessionPage() {
  const router = useRouter();
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionValidFrom, setSessionValidFrom] = useState('');
  const [sessionValidTo, setSessionValidTo] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
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
        subjectCode,
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
          subjectCode,
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
            <label className="block text-sm font-medium text-gray-700">Subject Code</label>
            <input
              type="text"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
          >
            Add Session
          </button>
        </form>
      </div>
    </div>
  );
}
