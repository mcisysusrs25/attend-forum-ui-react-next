"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionAuthToken, getUserId } from "../utils/authSession";
import { deleteClassroomConfiguration, fetchClasssConfigurationsByProfessorID } from "@/app/api/config";

interface Classroom {
  _id?: string;
  latitude: number;
  longitude: number;
  label: string;
  classConfigId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export default function ClassroomConfig() {
  const router = useRouter();
  const [configurations, setConfigurations] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  useEffect(() => {
    const loadConfigurations = async () => {
      setIsLoading(true);
      setError(null);
      
      const authToken = getSessionAuthToken();
      const userId = getUserId();
      
      if (!authToken || !userId) {
        router.push("/auth/login");
        return;
      }
      
      try {
        const result = await fetchClasssConfigurationsByProfessorID(authToken, userId);
        console.log(result);
        setConfigurations(result?.data || []);
      } catch (err) {
        console.error('Error fetching configurations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load classroom configurations');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigurations();
  }, [fetchTrigger, router]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this configuration?")) {
      try {
        setIsLoading(true);
        const authToken = getSessionAuthToken();
        if (!authToken) {
          router.push("/auth/login");
          return;
        }
        await deleteClassroomConfiguration(authToken, id);
        setFetchTrigger((prev) => prev + 1);
      } catch (error) {
        console.error('Error deleting configuration:', error);
        alert("Failed to delete configuration: " + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Classroom Geolocation Configurations</h2>
        <button
          onClick={() => router.push('/config/add')}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Add Configuration
        </button>
      </div>

      {isLoading && configurations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Loading configurations...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : configurations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No configurations yet. Add your first classroom location.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {configurations.map((config) => (
            <div key={config._id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-center">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-gray-800">{config.label}</h3>
                <p className="text-gray-600">Coordinates: {config.latitude}, {config.longitude}</p>
                <p className="text-xs text-gray-400">ID: {config.classConfigId}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => router.push(`config/edit/${config.classConfigId}`)}
                >
                  Edit
                </button>
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(config.classConfigId!)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}