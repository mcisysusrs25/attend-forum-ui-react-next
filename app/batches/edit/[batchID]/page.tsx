"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSessionAuthToken } from "@/app/utils/authSession";

export default function EditBatchPage() {
  const router = useRouter();
  const { batchID } = useParams(); // Get batchID from URL params
  const [batchLabel, setBatchLabel] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [students, setStudents] = useState<string[]>([]);
  const [initialStudents, setInitialStudents] = useState<string[]>([]); // Track original students
  const [removedStudents, setRemovedStudents] = useState<string[]>([]); // Track removed students
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = `http://localhost:5000/api/batches/details/${batchID}`;
  const updateApiUrl = `http://localhost:5000/api/batches/update`;

  useEffect(() => {
    const authToken = getSessionAuthToken();
    if (!authToken) {
      router.push("/auth/login");
      return;
    }

    const fetchBatchDetails = async () => {
      try {
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch batch details");

        const data = await response.json();
        setBatchLabel(data.data.batchLabel);
        setStudents(data.data.students);
        setInitialStudents(data.data.students); // Store original students for comparison
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchBatchDetails();
  }, [router, apiUrl]);

  // Add students
  const handleAddStudents = () => {
    const newStudents = studentInput
      .split(",")
      .map((id) => id.trim().toUpperCase())
      .filter((id) => id && !students.includes(id) && !removedStudents.includes(id)); // Prevent duplicates

    if (newStudents.length > 0) {
      setStudents((prev) => [...prev, ...newStudents]);
    }
    setStudentInput("");
  };

  // Mark student as removed (soft delete)
  const handleRemoveStudent = (id: string) => {
    setRemovedStudents((prev) => [...prev, id]);
  };

  // Restore a removed student
  const handleRestoreStudent = (id: string) => {
    setRemovedStudents((prev) => prev.filter((student) => student !== id));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const authToken = getSessionAuthToken();
    if (!authToken) {
      setError("User is not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    // Compute studentsToAdd and studentsToRemove
    const studentsToAdd = students.filter((id) => !initialStudents.includes(id));
    const studentsToRemove = initialStudents.filter((id) => removedStudents.includes(id));

    if (studentsToAdd.length === 0 && studentsToRemove.length === 0) {
      setError("No changes detected.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(updateApiUrl, {
        method: "POST", // Use POST method
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          batchID, // Include batchID in the payload
          studentsToAdd,
          studentsToRemove,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update batch");
      }

      // Redirect to batches page after successful update
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
          <p>Updating batch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-4">Edit Batch</h2>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        {/* Update Batch Button at the Top */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update Batch
        </button>

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
                placeholder="e.g., Y008888801, Y008888802"
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

          {/* Added and Deleted Students */}
          <div className="space-y-4">
            <div>
              <p className="text-green-600 font-semibold">
                Added: {students.filter((id) => !initialStudents.includes(id)).length} (
                {students.filter((id) => !initialStudents.includes(id)).join(", ")})
              </p>
            </div>
            <div>
              <p className="text-red-600 font-semibold">
                Deleted: {removedStudents.length} ({removedStudents.join(", ")})
              </p>
            </div>
          </div>

          {/* Students Table */}
          {students.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Added Students</h3>
              <table className="min-w-full bg-white border border-gray-300 rounded-md">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Student ID</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((id) => (
                    <tr key={id} className={`border-t ${removedStudents.includes(id) ? "bg-gray-200 text-gray-500" : ""}`}>
                      <td className="py-2 px-4 text-center">{id}</td>
                      <td className="py-2 px-4 text-center">
                        {removedStudents.includes(id) ? (
                          <button
                            type="button"
                            onClick={() => handleRestoreStudent(id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}