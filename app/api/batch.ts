// api/batch.ts - Server Component
"use server"

export async function fetchBatches(authToken : string, userID : String) {

    console.log("got this->" + authToken);
    console.log("got this->" + userID);

    if (!authToken || !userID) {
        throw new Error("Unauthorized: Missing auth token or user ID");
    }
    
    
    const response = await fetch(`${process.env.API_BASE_URL}/batches/getBatchByProfessorId`, {
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

    return response.json();
}

export async function deleteBatch(batchId: string, authToken : string, userID : string) {

    if (!authToken) {
        throw new Error("Unauthorized: Missing auth token");
    }

    const response = await fetch(`${process.env.API_BASE_URL}/batches/delete/${batchId}`, {
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

    return response.json();
}
export async function createBatch(batchLabel: string, students: string[], authToken:string, userID: string) {
    

    console.log(authToken);
    console.log(userID);

    if (!authToken || !userID) {
        throw new Error("User is not authenticated. Please log in again.");
    }

    const apiUrl = `${process.env.API_BASE_URL}/batches/create`;

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

    return response.json();
}

export async function editBatch(batchID: string, studentsToAdd: string[], studentsToRemove: string[], authToken: string, userID: string) {
    console.log("Auth Token: " + authToken);
    console.log("User ID: " + userID);

    if (!authToken || !userID) {
        throw new Error("Unauthorized: Missing auth token or user ID");
    }

    const apiUrl = `${process.env.API_BASE_URL}/batches/edit`;

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            batchID,
            studentsToAdd,
            studentsToRemove,
            updatedBy: userID, // Optional: Track who made the update
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update batch");
    }

    return response.json();
}



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
  