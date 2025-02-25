"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';
import { fetchSubjects, deleteSubject } from '@/app/api/subject';
import {  Edit2, Trash2, BookOpen } from 'lucide-react';

interface Subject {
  _id: string;
  subjectCode: string;
  title: string;
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      const authToken = getSessionAuthToken();
      const userID = getUserId();
  
      if (!authToken || !userID) {
        alert(authToken);
        alert(userID);
        router.push('/auth/login');
        return;
      }
  
      try {
        const data = await fetchSubjects(userID, authToken);
        setSubjects(data || []); // Ensure it never sets undefined
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
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
      await deleteSubject(subjectId, authToken);
      // Refresh the list after deletion
      setSubjects((prev) => prev.filter((subject) => subject.subjectCode !== subjectId));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Handle subject edit
  const handleEdit = (subjectId: string) => {
    router.push(`/subjects/edit/${subjectId}`);
  };

  // Handle add new subject
  const handleAddNew = () => {
    router.push('/subjects/new');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 rounded-xl shadow-sm bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 rounded-xl shadow-md bg-white max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">Error Loading Subjects</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No subjects found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first subject</p>
            <button
              onClick={handleAddNew}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-sm"
            >
              Add Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="h-2 bg-indigo-600"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                      {subject.title}
                    </h3>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEdit(subject.subjectCode)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                        aria-label="Edit subject"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.subjectCode)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50"
                        aria-label="Delete subject"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="font-medium text-indigo-700">{subject.subjectCode.slice(0, 2)}</span>
                      </div>
                      <div>
                        <span className="block text-gray-800 font-medium">Code</span>
                        <span className="block text-gray-600">{subject.subjectCode}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 text-xs text-gray-500">
                      Added on {new Date(subject.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
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