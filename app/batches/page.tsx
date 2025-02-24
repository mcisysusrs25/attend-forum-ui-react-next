"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';
import { getCurrentEnv } from '../utils/nodeEnv';

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

    const apiUrl = getCurrentEnv("dev");
    console.log(apiUrl);


    // Fetch batches on component mount
    useEffect(() => {
        const fetchBatches = async () => {
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
                const response = await fetch(`${apiUrl}/batches/getBatchByProfessorId`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ professorID: userID }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch batches');
                }

                const data = await response.json();
                if (!data || !Array.isArray(data.data)) {
                    throw new Error('Invalid response format');
                }

                setBatches(data.data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, [router]);

    // Handle batch deletion
    const handleDelete = async (batchId: string) => {
        const isConfirmed = window.confirm('Are you sure you want to delete this batch?');
        if (!isConfirmed) return;

        const authToken = getSessionAuthToken();
        if (!authToken) {
            router.push('/auth/login');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/batches/delete/${batchId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete batch');
            }

            // Refresh the list after deletion
            setBatches((prev) => prev.filter((batch) => batch._id !== batchId));
        } catch (err) {
            console.error('Delete error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    // Handle batch edit
    const handleEdit = (batchId: string) => {
        router.push(`/batches/edit/${batchId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading batches...</p>
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
                {/* <h2 className="text-2xl font-bold mb-6">Batches</h2> */}

                {batches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No batches found</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batches.map((batch) => (
                            <div
                                key={batch._id}
                                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3 flex-1">
                                        <h3 className="text-xl font-bold text-gray-900">{batch.batchLabel}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-600">👥</span>
                                            <span className="text-sm text-gray-600">
                                                {batch.students.length} students
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(batch._id)}
                                            className="p-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(batch._id)}
                                            className="p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-300"
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