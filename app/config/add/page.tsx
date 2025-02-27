 // components/AddClassroomConfig.tsx
 "use client";
  
 import { useState } from "react";
 import { useRouter } from "next/navigation";
 import { getSessionAuthToken, getUserId } from "@/app/utils/authSession";
import { createClassroomConfig } from "@/app/api/config";
 
 export default function AddClassroomConfig() {
   const router = useRouter();
   const [label, setLabel] = useState<string>("");
   const [latitude, setLatitude] = useState<number | string>("");
   const [longitude, setLongitude] = useState<number | string>("");
   const [error, setError] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(false);
 
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsLoading(true);
     setError(null);
 
     const authToken = getSessionAuthToken();
     const userId = getUserId();
 
     if (!authToken || !userId) {
       router.push("/auth/login");
       return;
     }
 
     const newConfig = {
       label,
       latitude: latitude.toString(),
       longitude: longitude.toString(),
       userID:userId
     };

     try {
       await createClassroomConfig(newConfig, authToken);
       router.push("/config");
     } catch (err) {
       console.error("Error creating configuration:", err);
       setError(err instanceof Error ? err.message : 'Failed to create configuration');
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleGetCurrentLocation = () => {
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (position) => {
           setLatitude(position.coords.latitude);
           setLongitude(position.coords.longitude);
         },
         (error) => {
           console.log(error);
           setError('Unable to retrieve location. Please enable location services.');
         }
       );
     } else {
       setError('Geolocation is not supported by this browser.');
     }
   };
 
   return (
     <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
       <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Classroom Configuration</h2>
       {error && <div className="text-red-500 mb-4">{error}</div>}
       <form onSubmit={handleSubmit}>
         <div className="mb-4">
           <label className="block text-gray-700" htmlFor="label">Label:</label>
           <input
             type="text"
             id="label"
             value={label}
             onChange={(e) => setLabel(e.target.value)}
             required
             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
           />
         </div>
         <div className="mb-4">
           <label className="block text-gray-700" htmlFor="latitude">Latitude:</label>
           <input
             type="number"
             id="latitude"
             value={latitude}
             onChange={(e) => setLatitude(e.target.value)}
             required
             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
           />
           <button
             type="button"
             onClick={handleGetCurrentLocation}
             className="mt-2 bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600"
           >
             Use Current Location
           </button>
         </div>
         <div className="mb-4">
           <label className="block text-gray-700" htmlFor="longitude">Longitude:</label>
           <input
             type="number"
             id="longitude"
             value={longitude}
             onChange={(e) => setLongitude(e.target.value)}
             required
             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
           />
         </div>
         <button
           type="submit"
           disabled={isLoading}
           className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
         >
           {isLoading ? 'Creating...' : 'Create Configuration'}
         </button>
       </form>
     </div>
   );
 }
 