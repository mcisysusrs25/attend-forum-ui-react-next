"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionAuthToken, getUserId } from "@/app/utils/authSession";
import { fetchSubjects, deleteSubject } from "@/app/api/subject";
import { Edit2, Trash2, BookOpen } from "lucide-react";

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
        router.push("/auth/login");
        return;
      }

      try {
        const data = await fetchSubjects(userID, authToken);
        setSubjects(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDelete = async (subjectId: string) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this subject?"
    );
    if (!isConfirmed) return;

    const authToken = getSessionAuthToken();
    if (!authToken) {
      router.push("/auth/login");
      return;
    }

    try {
      await deleteSubject(subjectId, authToken);
      setSubjects((prev) =>
        prev.filter((subject) => subject.subjectCode !== subjectId)
      );
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (subjectId: string) => {
    router.push(`/subjects/edit/${subjectId}`);
  };

  const handleAddNew = () => {
    router.push("/subjects/new");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-8 rounded-xl shadow-sm bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-8 rounded-xl shadow-md bg-white max-w-md w-full">
          <p className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Subjects
          </p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white shadow-md rounded-md py-4 sm:px-2">
      <div className="mx-auto">
        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No subjects found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first subject
            </p>
            <button
              onClick={handleAddNew}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Add Subject
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="w-full bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-between p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Left Side: Subject Details */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                    {subject.subjectCode.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {subject.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Code: {subject.subjectCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      Added on{" "}
                      {new Date(subject.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subject.subjectCode)}
                    className="px-4 py-2 rounded-md bg-indigo-700 text-white hover:bg-indigo-800 transition"
                    aria-label="Edit subject"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.subjectCode)}
                    className="px-4 py-2 rounded-md bg-red-700 text-white hover:bg-red-800 transition"
                    aria-label="Delete subject"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
