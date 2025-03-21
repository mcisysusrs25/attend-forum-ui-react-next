

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSessionAuthToken, getUserId } from "@/app/utils/authSession";
import { fetchClassroomConfig, updateClassroomConfig } from "@/app/api/config";


export default function EditConfigPage() {
  const router = useRouter();
  const { classConfigId } = useParams();
  const [configData, setConfigData] = useState({ label: "", latitude: "", longitude: "", userID: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authToken = getSessionAuthToken();
    const userID = getUserId();
    

    if (!authToken && !userID) {
      router.push("/auth/login");
      return;
    }

    setConfigData({ label: "", latitude: "", longitude: "", userID: userID! });

    fetchClassroomConfig(classConfigId as string, authToken!)
      .then((data) => setConfigData(data.data))
      .catch((err) => setError(err.message));
  }, [router, classConfigId]);

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

    try {
      await updateClassroomConfig(classConfigId as string, configData, authToken);
      router.push("/config");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setConfigData({
            ...configData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => setError(error.message)
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Updating configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
      <button
            type="button"
            onClick={() => router.push("/config")}
            className="mb-8 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 "
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Classes
          </button>

        <h2 className="text-2xl font-bold mb-4">Edit Class Configuration</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input type="text" value={configData.label} onChange={(e) => setConfigData({ ...configData, label: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input type="text" value={configData.latitude} onChange={(e) => setConfigData({ ...configData, latitude: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input type="text" value={configData.longitude} onChange={(e) => setConfigData({ ...configData, longitude: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={handleGetCurrentLocation} className="mb-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary">Use Current Location</button>
            <button type="submit" className="mb-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary">Update Configuration</button>
          </div>
        </form>
      </div>
    </div>
  );
}