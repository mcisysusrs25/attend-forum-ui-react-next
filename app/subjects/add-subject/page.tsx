"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';
import { addSubject } from '@/app/api/subject'; // Import the function

export default function AddSubjectPage() {
  const router = useRouter();
  const [subjectCode, setSubjectCode] = useState('');
  const [title, setTitle] = useState('');
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
      // Call the addSubject function
      await addSubject(
        {
          subjectCode,
          title,
          professorID: userID,
        },
        authToken
      );
      
      // Redirect after successful submission
      console.log("Subject added successfully, redirecting to subjects");
      router.push('/subjects');
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
      <div className="px-4 sm:px-6 lg:px-8 py-4">
      <button
          type="button"
          onClick={() => router.push("/subjects")}
          className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 "
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Subjects
        </button>
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
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary transition-colors duration-300"
          >
            Add Subject
          </button>
        </form>
      </div>
    </div>
  );
}