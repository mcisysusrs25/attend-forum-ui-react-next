"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSessionAuthToken, getUserId } from "@/app/utils/authSession";
import { getSubjectBySubjectCode, updateSubject } from "@/app/api/subject";

export default function EditSubjectPage() {
  const router = useRouter();
  const { subjectCode } = useParams(); // Expecting subjectCode instead of id
  const [subjectCode1, setSubjectCode1] = useState("");
  const [title, setTitle] = useState("");
  const [professorID, setProfessorID] = useState(""); // To bind professor ID
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authToken = getSessionAuthToken();
    if (!authToken) {
      console.log("No auth token found, redirecting to login");
      router.push("/auth/login");
      return;
    }

    const fetchSubject = async () => {
      try {
        setLoading(true);
        const subjectCodeParam = Array.isArray(subjectCode) ? subjectCode[0] : subjectCode;
        if (!subjectCodeParam) return;

        const subject = await getSubjectBySubjectCode(subjectCodeParam, authToken);
        
        if (subject?.data) {
          setSubjectCode1(subject.data.subjectCode);
          setTitle(subject.data.title);
          setProfessorID(subject.data.professorID);
        } else {
          setError("Subject not found.");
        }
      } catch (err) {
        console.error("Error fetching subject:", err);
        setError("Failed to load subject details.");
      } finally {
        setLoading(false);
      }
    };

    if (subjectCode) {
      fetchSubject();
    }
  }, [subjectCode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const authToken = getSessionAuthToken();
    const userID = getUserId();

    if (!authToken || !userID) {
      setError("User is not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      await updateSubject(subjectCode1,title, authToken);
      setSuccess("Subject updated successfully!");
      router.push('/subjects');
    } catch (err) {
      console.error("Error updating subject:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading subject details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-2xl font-bold mb-4">Edit Subject</h2>

        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-500">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject Code
            </label>
            <input
              type="text"
              value={subjectCode}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Professor ID
            </label>
            <input
              type="text"
              value={professorID}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-indigo-700 text-white rounded hover:bg-blue-600 transition-colors duration-300"
          >
            Update Subject
          </button>
        </form>
      </div>
    </div>
  );
}
