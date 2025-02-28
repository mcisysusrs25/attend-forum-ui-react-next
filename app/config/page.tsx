"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionAuthToken, getUserId } from "../utils/authSession";
import { deleteClassroomConfiguration, fetchClasssConfigurationsByProfessorID } from "@/app/api/config";
import { MapPin, Edit, Trash2, Plus, AlertTriangle, Loader2 } from "lucide-react";

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
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

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
        setDeleteInProgress(id);
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
        setDeleteInProgress(null);
      }
    }
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-xl rounded-xl">


      {isLoading && configurations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
          <p className="text-lg">Loading your configurations...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-red-500">
          <AlertTriangle size={40} className="mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={() => setFetchTrigger(prev => prev + 1)}
            className="mt-4 text-indigo-600 hover:text-indigo-800 underline"
          >
            Try again
          </button>
        </div>
      ) : configurations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <MapPin size={40} className="mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No configurations yet</p>
          <p className="text-gray-400 mb-6 text-center max-w-md">Add your first classroom location to start tracking attendance with geolocation</p>
          <button
            onClick={() => router.push('/config/add')}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Your First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {configurations.map((config) => (
            <div 
              key={config._id} 
              className="border border-gray-200 p-6 rounded-xl flex justify-between items-center hover:shadow-md transition-shadow duration-300 bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <MapPin size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gray-800 mb-1">{config.label}</h3>
                  <p className="text-gray-600 flex items-center gap-1">
                    <span>Lat: {config.latitude.toFixed(5)}</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span>Long: {config.longitude.toFixed(5)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">ID: {config.classConfigId}</p>
                  {config.createdAt && (
                    <p className="text-xs text-gray-400">
                      Created: {new Date(config.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  className="bg-indigo-700 py-2 px-3 rounded-md text-white hover:bg-indigo-600  flex items-center gap-1 font-medium"
                  onClick={() => router.push(`config/edit/${config.classConfigId}`)}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  className="text-white bg-red-700 px-3 py-2 rounded-md hover:bg-red-600 flex items-center gap-1 font-medium"
                  onClick={() => handleDelete(config.classConfigId!)}
                  disabled={deleteInProgress === config.classConfigId}
                >
                  {deleteInProgress === config.classConfigId ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
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