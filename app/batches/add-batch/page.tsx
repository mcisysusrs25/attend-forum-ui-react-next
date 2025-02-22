"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';

export default function AddBatchPage() {
  const router = useRouter();
  const [batchLabel, setBatchLabel] = useState('');
  const [students, setStudents] = useState('');
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
      // Convert comma-separated students string to an array
      const studentsArray = students.split(',').map((student) => student.trim());

      console.log("Sending request to add batch with data:", {
        batchLabel,
        createdBy: userID,
        students: studentsArray,
      });

      const response = await fetch('http://localhost:5000/api/batches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          batchLabel,
          createdBy: userID,
          students: studentsArray,
        }),
      });

      console.log("Received response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || 'Failed to add batch');
      }

      // Redirect after successful submission
      console.log("Batch added successfully, redirecting to batches");
      router.push('/batches'); // Redirect to the batch list or desired page
    } catch (err) {
      console.error('Error adding batch:', err);
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
          <p>Submitting batch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-2xl font-bold mb-4">Add New Batch</h2>

        {error && (
          <div className="mb-4 text-red-500">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Batch Label</label>
            <input
              type="text"
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Students (Comma-separated)</label>
            <textarea
              value={students}
              onChange={(e) => setStudents(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., MITSAM001, MITSAM002, MITSAM003"
            />
          </div>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
          >
            Add Batch
          </button>
        </form>
      </div>
    </div>
  );
}