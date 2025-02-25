"use server"

type ConfigPayload = {
    label: string;
    latitude: string;
    longitude: string;
    userID: string,
}
  
export async function fetchClasssConfigurationsByProfessorID(authToken: string, userId: string) {
    console.log("got this->" + authToken);
    console.log("got this->" + userId);

    if (!authToken || !userId) {
        throw new Error("Unauthorized: Missing auth token or user ID");
    }
    
    // Fixed URL string (removed extra $ sign and redundant /api)
    const newUrl = `${process.env.API_BASE_URL}/class-configurations/professor/${userId}`;

    console.log(newUrl);

    const response = await fetch(newUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message || "Failed to fetch configurations");
    }

    return response.json();
}

export async function deleteClassroomConfiguration(authToken: string, id: string) {
    console.log("Deleting configuration with ID->" + id);

    if (!authToken) {
        console.log("auth token missing");
        throw new Error("Unauthorized: Missing auth token");
    }

    const response = await fetch(`${process.env.API_BASE_URL}/class-configurations/delete/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message || 'Failed to delete configuration');
    }
}

export async function createClassroomConfig(newConfig: ConfigPayload, authToken: string) {
    
    const api_url = `${process.env.API_BASE_URL}/class-configurations/create`;

    console.log(JSON.stringify(newConfig));

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(newConfig),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            throw new Error(errorData.message || 'Failed to create configuration');
        }

        return response.json();
    } catch (err) {
        console.log(err);
        throw new Error(err instanceof Error ? err.message : 'Failed to create configuration');
    }
};


export async function fetchClassroomConfig(classConfigId: string, authToken: string) {
    // Fixed URL to use the correct endpoint pattern without redundant /api
    const apiUrl = `${process.env.API_BASE_URL}/class-configurations/config/${classConfigId}`;

    console.log('fetching using this url->' + apiUrl);

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch configuration");
        return response.json();
    } catch (err) {
        console.log(err);
        throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
};

export async function updateClassroomConfig(classConfigId: string, configData: ConfigPayload, authToken: string) {
    const apiUrl = `${process.env.API_BASE_URL}/class-configurations/update/${classConfigId}`;

    try {
        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(configData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.log(errorData);
            throw new Error(errorData?.message || "Failed to update configuration");
        }
    } catch (err) {
        console.log(err);
        throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
};