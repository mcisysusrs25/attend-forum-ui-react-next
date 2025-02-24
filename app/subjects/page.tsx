"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';
import { getCurrentEnv } from '../utils/nodeEnv';

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

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   const apiUrl = getCurrentEnv("dev");
    console.log(apiUrl);
  

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);

      const authToken = getSessionAuthToken();
      const userID = getUserId();

      if (!authToken || !userID) {
        console.log("User is not authenticated");
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/subjects/getsubjects/${userID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch subjects');
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }

        setSubjects(data.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [router]);

  // Handle subject deletion
  const handleDelete = async (subjectId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this subject?');
    if (!isConfirmed) return;

    const authToken = getSessionAuthToken();
    if (!authToken) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/subjects/delete/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subject');
      }

      // Refresh the list after deletion
      setSubjects((prev) => prev.filter((subject) => subject._id !== subjectId));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Handle subject edit
  const handleEdit = (subjectId: string) => {
    router.push(`/subjects/edit/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8 text-red-500">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">

        {subjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No subjects found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{subject.title}</h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Code:</span> {subject.subjectCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Description:</span> {subject.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Credit Hours:</span> {subject.creditHours}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Term:</span> {subject.subjectTerm}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Created At:</span>{' '}
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(subject._id)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(subject._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}