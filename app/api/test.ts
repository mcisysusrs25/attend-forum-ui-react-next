// utils/api/batchApi.ts

"use server"
// const API_BASE_URL = "http://localhost:5000/api/batches";

export const fetchBatchDetails = async (batchID: string, authToken: string) => {
  const response = await fetch(`${process.env.API_BASE_URL}/batches/details/${batchID}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch batch details");

  return response.json();
};

export const updateBatch = async (
  batchID: string,
  studentsToAdd: string[],
  studentsToRemove: string[],
  authToken: string,
  userID: string
) => {
  const response = await fetch(`${process.env.API_BASE_URL}/batches/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      batchID,
      studentsToAdd,
      studentsToRemove,
      userID, // Include userID in the request payload
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update batch");
  }

  return response.json();
};
