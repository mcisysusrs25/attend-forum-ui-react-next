"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';

export default function AddSubjectPage() {
  const router = useRouter();
  const [subjectCode, setSubjectCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creditHours, setCreditHours] = useState(0);
  const [subjectTerm, setSubjectTerm] = useState('');
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

  // Handle form submission
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
      console.log("Sending request to add subject with data:", {
        subjectCode,
        title,
        description,
        creditHours,
        subjectTerm,
        professorID: userID, // Use the authenticated user's ID
      });

      const response = await fetch('http://localhost:5000/api/subjects/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          subjectCode,
          title,
          description,
          creditHours,
          subjectTerm,
          professorID: userID,
        }),
      });

      console.log("Received response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || 'Failed to add subject');
      }

      // Redirect after successful submission
      console.log("Subject added successfully, redirecting to subjects");
      router.push('/subjects'); // Redirect to the subject list or desired page
    } catch (err) {
      console.error('Error adding subject:', err);
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
          <p>Submitting subject...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-2xl font-bold mb-4">Add New Subject</h2>

        {error && (
          <div className="mb-4 text-red-500">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Hours</label>
            <input
              type="number"
              value={creditHours}
              onChange={(e) => setCreditHours(Number(e.target.value))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Term</label>
            <input
              type="text"
              value={subjectTerm}
              onChange={(e) => setSubjectTerm(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
          >
            Add Subject
          </button>
        </form>
      </div>
    </div>
  );
}