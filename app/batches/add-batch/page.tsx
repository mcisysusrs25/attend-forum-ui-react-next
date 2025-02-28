"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "@/app/api/batch";
import { getSessionAuthToken, getUserId } from "@/app/utils/authSession";

export default function AddBatchPage() {
  const router = useRouter();
  const [batchLabel, setBatchLabel] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [students, setStudents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authToken = getSessionAuthToken();
  const userID = getUserId();

  useEffect(() => {
    if (!authToken) {
      router.push("/auth/login");
    }
  }, [router, authToken]);

  const handleAddStudents = () => {
    const newStudents = studentInput
      .split(",")
      .map((id) => id.trim().toUpperCase())
      .filter((id) => id && !students.includes(id));

    if (newStudents.length > 0) {
      setStudents((prev) => [...prev, ...newStudents]);
    }
    setStudentInput("");
  };

  const handleRemoveStudent = (id: string) => {
    setStudents((prev) => prev.filter((student) => student !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createBatch(batchLabel, students, authToken!, userID!);
      router.push("/batches");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setBatchLabel("");
    setStudentInput("");
    setStudents([]);
    setError(null);
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
    <div className="bg-white shadow-md rounded-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full">
          <button
            type="button"
            onClick={() => router.push("/batches")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Batches
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4 mt-4">Add New Batch</h2>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium text-gray-700">Student IDs (Comma-separated)</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                placeholder="e.g., MITSAM001, MITSAM002"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              <button
                type="button"
                onClick={handleAddStudents}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300"
              >
                Add
              </button>
            </div>
          </div>

          {students.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Added Students</h3>
              <table className="min-w-full bg-white border border-gray-300 rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Select</th>
                    <th className="py-2 px-4 border">Student ID</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((id) => (
                    <tr key={id} className="border-t">
                      <td className="py-2 px-4 text-center">
                        <input type="checkbox" className="h-4 w-4" />
                      </td>
                      <td className="py-2 px-4 text-center">{id}</td>
                      <td className="py-2 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(id)}
                          className="bg-red-600 py-2 px-4 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={students.length === 0}
              className={`mt-4 px-4 py-2 text-white rounded transition-colors duration-300 ${students.length === 0 ? "bg-indigo-700 cursor-not-allowed" : "bg-indigo-700 hover:bg-blue-600"
                }`}
            >
              Submit Batch
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-300"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}