"use server"

export async function fetchSessions(userType: string, userID: string, authToken: string) {
    try {
      let apiEndpoint = '';
  
      if (userType === 'professor') {
        apiEndpoint = `${process.env.API_BASE_URL}/sessions/getSessionsbyProfessor/${userID}`;
        console.log(apiEndpoint);
      } else if (userType === 'student') {
        apiEndpoint = `${process.env.API_BASE_URL}/student/sessions/${userID}`;
        console.log(apiEndpoint);
      } else {
        throw new Error('Invalid user type');
      }

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store',
      });
  
      // Check specifically for token expiration
      if (response.status === 401) {
        return {
          data: [],
          error: true,
          errorType: 'Token issue',
        };
      }
  
      // Handle other errors generically
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching sessions:', errorData); // Log the error details
        return {
          data: [],
          error: true,
          errorType: 'API Error',
        };
      }
  
      const data = await response.json();
      return {
        data: data.data,
        error: false,
      };
  
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
      return {
        data: [],
        error: true,
        errorType: error, // Can customize this if needed
      };
    }
  }
  

  
  export async function updateSessionStatus(sessionID: string, newStatus: string, authToken: string) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/sessions/updateStatus/${sessionID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update session status');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }
  
  export async function deleteSession(sessionID: string, authToken: string) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/sessions/delete/${sessionID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
  
  export async function markAttendance(sessionID: string, latitude: number, longitude: number, authToken: string) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/sessions/markAttendance/${sessionID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }


  export async function fetchBatchesByProfessorId(professorID: string, authToken: string) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/batches/getBatchByProfessorId`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ professorID }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch batches');
      }
  
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  }
  
  export async function fetchSubjectsByProfessorId(professorID: string, authToken: string) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/subjects/getsubjects/${professorID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        // throw new Error(errorData.message || 'Failed to fetch subjects');
      }
  
      const data = await response!.json();
      return data.data;

    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }
  
  // export async function addSession(sessionData: {
  //   sessionTitle: string;
  //   sessionDescription: string;
  //   sessionValidFrom: string;
  //   sessionValidTo: string;
  //   subjectCode: string;
  //   batchID: string;
  //   classConfigId : string,
  //   createdBy: string;
  // }, authToken: string) {

  //   console.log(sessionData);

  //   console.log("this is sending as " + sessionData.classConfigId);
  //   try {
  //     const response = await fetch(`${process.env.API_BASE_URL}/sessions/add`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //       body: JSON.stringify(sessionData),
  //     });
  
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to add session');
  //     }
  
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error('Error adding session:', error);
  //     throw error;
  //   }
  // }


  // export async function addSession(sessionData: {
  //   sessionTitle: string;
  //   sessionDescription: string;
  //   sessionValidFrom: string;
  //   sessionValidTo: string;
  //   subjectCode: string;
  //   batchID: string;
  //   classConfigId: string;
  //   createdBy: string;
  // }, authToken: string) {
  
  //   // Function to apply timezone offset
  //   function applyTimezoneOffset(datetime: string): string {
  //     const date = new Date(datetime);
  //     const offsetMinutes = date.getTimezoneOffset();
  //     const offsetHours = Math.abs(offsetMinutes) / 60;
  //     const offsetSign = offsetMinutes > 0 ? "-" : "+";
  //     const offsetString = `${offsetSign}${String(Math.floor(offsetHours)).padStart(2, "0")}:00`;
  
  //     return datetime + offsetString;  // Append the offset
  //   }
  
  //   // Apply timezone to session times
  //   sessionData.sessionValidFrom = applyTimezoneOffset(sessionData.sessionValidFrom);
  //   sessionData.sessionValidTo = applyTimezoneOffset(sessionData.sessionValidTo);
  
  //   console.log("Updated session data with timezone:", sessionData);
  
  //   try {
  //     const response = await fetch(`${process.env.API_BASE_URL}/sessions/add`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //       body: JSON.stringify(sessionData),
  //     });
  
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to add session');
  //     }
  
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error('Error adding session:', error);
  //     throw error;
  //   }
  // }
  

  export async function addSession(
    sessionData: {
      sessionTitle: string;
      sessionDescription: string;
      sessionValidFrom: string;
      sessionValidTo: string;
      subjectCode: string;
      batchID: string;
      classConfigId: string;
      createdBy: string;
    },
    authToken: string
  ) {
    // Function to apply timezone offset
    function applyTimezoneOffset(datetime: string): string {
      const date = new Date(datetime);
      const offsetMinutes = date.getTimezoneOffset();
      const offsetHours = Math.abs(offsetMinutes) / 60;
      const offsetSign = offsetMinutes > 0 ? "-" : "+";
      const offsetString = `${offsetSign}${String(Math.floor(offsetHours)).padStart(2, "0")}:00`;
  
      return datetime + offsetString; // Append the offset
    }
  
    // Check the TIME_SETTINGS environment variable
    const timeSettings = process.env.TIME_SETTINGS;
  
    // Apply timezone offset only if TIME_SETTINGS is set to "local_system"
    if (timeSettings === "local_system") {
      sessionData.sessionValidFrom = applyTimezoneOffset(sessionData.sessionValidFrom);
      sessionData.sessionValidTo = applyTimezoneOffset(sessionData.sessionValidTo);
    }
  
    console.log("Updated session data with timezone:", sessionData);
  
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/sessions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(sessionData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add session");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding session:", error);
      throw error;
    }
  }

export async function fetchSessionDetails(sessionId: string, authToken: string) {
  try {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${process.env.API_BASE_URL}/sessions/gsd/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch session details');
    }

    const sessionData = await response.json();
    return sessionData.data;
  } catch (error) {
    console.error('Error fetching session details:', error);
    throw error instanceof Error ? error : new Error('An error occurred');
  }
}

// Update session
export async function updateSession(
  sessionId: string,
  sessionData: {
    sessionTitle: string;
    sessionDescription: string;
    sessionValidFrom: string;
    sessionValidTo: string;
    subjectCode: string;
    batchID: string;
    classConfigId: string,
    createdBy: string;
  },
  authToken: string
) {
  try {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${process.env.API_BASE_URL}/sessions/updateSession/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update session');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating session:', error);
    throw error instanceof Error ? error : new Error('An error occurred');
  }
}

// Fetch batches for the professor
export async function fetchBatches(professorID: string, authToken: string) {
  try {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${process.env.API_BASE_URL}/batches/getBatchByProfessorId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ professorID }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch batches');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error instanceof Error ? error : new Error('An error occurred');
  }
}

// Fetch subjects for the professor
export async function fetchSubjects(professorID: string, authToken: string) {
  try {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${process.env.API_BASE_URL}/subjects/getsubjects/${professorID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch subjects');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error instanceof Error ? error : new Error('An error occurred');
  }
}
  



