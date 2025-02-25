"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionAuthToken, getUserId } from "@/app/utils/authSession";
import { getCurrentEnv } from "@/app/utils/nodeEnv";

export default function AddBatchPage() {
  const router = useRouter();
  const [batchLabel, setBatchLabel] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [students, setStudents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = `${getCurrentEnv("dev")}/batches/create`;

  useEffect(() => {
    const authToken = getSessionAuthToken();
    if (!authToken) {
      router.push("/auth/login");
    }
  }, [router]);

  // Add students to the table
  const handleAddStudents = () => {
    const newStudents = studentInput
      .split(",")
      .map((id) => id.trim().toUpperCase())
      .filter((id) => id && !students.includes(id)); // Prevent duplicates

    if (newStudents.length > 0) {
      setStudents((prev) => [...prev, ...newStudents]);
    }
    setStudentInput("");
  };

  // Remove a student from the table
  const handleRemoveStudent = (id: string) => {
    setStudents((prev) => prev.filter((student) => student !== id));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const authToken = getSessionAuthToken();
    const userID = getUserId();

    if (!authToken || !userID) {
      setError("User is not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          batchLabel,
          createdBy: userID,
          students,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to add batch");
      }

      router.push("/batches");
    } catch (err) {
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
          <p>Submitting batch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-4">Add New Batch</h2>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Label Input */}
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

          {/* Student ID Input */}
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

          {/* Students Table */}
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
                          className="text-red-500 hover:underline"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={students.length === 0}
            className={`mt-4 px-4 py-2 text-white rounded transition-colors duration-300 ${
              students.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Submit Batch
          </button>
        </form>
      </div>
    </div>
  );
}
