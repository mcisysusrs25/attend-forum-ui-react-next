"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionAuthToken, getUserId } from "@/app/utils/authSession";
import { getCurrentEnv } from "../utils/nodeEnv";

interface Batch {
  _id: string;
  batchLabel: string;
  createdBy: string;
  students: string[];
  batchID: string;
  __v: number;
}

export default function BatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const apiUrl = getCurrentEnv("local");

  // Fetch batches on component mount & after delete
  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      setError(null);
      const authToken = getSessionAuthToken();
      const userID = getUserId();
      
      if (!authToken || !userID) {
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/batches/getBatchByProfessorId`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ professorID: userID }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch batches");
        }

        const data = await response.json();
        setBatches(data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [fetchTrigger, router, apiUrl]);

  // Filter batches based on search query
  const filteredBatches = batches.filter((batch) =>
    batch.batchLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle batch deletion
  const handleDelete = async (batchId: string) => {
    setSelectedBatch(batchId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedBatch) return;
    
    const authToken = getSessionAuthToken();
    if (!authToken) {
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/batches/delete/${selectedBatch}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete batch");
      }

      // Close modal and trigger re-fetch
      setShowDeleteModal(false);
      setSelectedBatch(null);
      setFetchTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setShowDeleteModal(false);
    }
  };

  // Handle batch edit
  const handleEdit = (batchId: string) => {
    router.push(`/batches/edit/${batchId}`);
  };

  // Add new batch
  const handleAddNew = () => {
    router.push("/batches/add");
  };

  // Format batch data for display purposes
  const getBatchDetails = (batch: Batch) => {
    return {
      studentCount: batch.students.length,
      batchInitials: batch.batchLabel
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2),
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading batches...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-6 mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Error Loading Batches</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => setFetchTrigger((prev) => prev + 1)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search batches..."
                className="pl-10 block w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none transition duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {filteredBatches.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery ? "No matching batches found" : "No batches yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? "Try adjusting your search term or clear the search box to see all batches."
                    : "Create your first batch to start organizing your students."}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition duration-200"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={handleAddNew}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create First Batch
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => {
                  const { studentCount, batchInitials } = getBatchDetails(batch);
                  
                  return (
                    <div
                      key={batch._id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="p-5 flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {batchInitials}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{batch.batchLabel}</h3>
                          <div className="flex items-center mt-1">
                            <svg className="h-5 w-5 text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-gray-500 text-sm">
                              {studentCount} {studentCount === 1 ? 'student' : 'students'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm mt-1">ID: {batch.batchID}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(batch.batchID)}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(batch.batchID)}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Batch
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this batch? This action cannot be undone.
                        All students associated with this batch will be unassigned.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}