"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSessionAuthToken } from "@/app/utils/authSession";

export default function EditConfigPage() {
  const router = useRouter();
  const { classConfigId } = useParams(); // Retrieve classConfigId from URL
  const [configData, setConfigData] = useState({ label: "", latitude: "", longitude: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Update API URL
  const apiUrl = `http://localhost:5000/api/class-configurations/update/${classConfigId}`;

  useEffect(() => {
    const authToken = getSessionAuthToken();
    if (!authToken) {
      router.push("/auth/login");
      return;
    }

    const fetchConfigDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/class-configurations/${classConfigId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch configuration");

        const data = await response.json();
        setConfigData(data.data); // Bind the fetched data to state
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchConfigDetails();
  }, [router, classConfigId]);

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

    try {
      const response = await fetch(apiUrl, {
        method: "PUT", // Use PUT method to update configuration
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update configuration");
      }

      // Redirect after successful update
      router.push("/config");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to get current location
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
        (error) => {
          setError("Unable to retrieve your location. Please allow location access.");
        }
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-4">Edit Configuration</h2>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Label Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input
              type="text"
              value={configData.label}
              onChange={(e) => setConfigData({ ...configData, label: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Latitude Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              type="text"
              value={configData.latitude}
              onChange={(e) => setConfigData({ ...configData, latitude: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Longitude Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              type="text"
              value={configData.longitude}
              onChange={(e) => setConfigData({ ...configData, longitude: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Button to Get Current Location */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Use Current Location
            </button>
            <button
              type="submit"
              className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
