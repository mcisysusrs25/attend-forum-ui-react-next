"use server"

export async function fetchSessionDetails(sessionId: string, authToken: string) {
    try {
      if (!authToken) {
        throw new Error('Unauthorized');
      }
  
      // Construct the API endpoint
      const apiEndpoint = `${process.env.API_BASE_URL}/sessions/gsd/${sessionId}`;

      console.log('Fetching session details from:', apiEndpoint); // Debug log
  
      // Make the API call
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store', // Ensure no caching
      });
  
      console.log('Response status:', response.status); // Debug log
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to fetch session details');
      }
  
      const sessionData = await response.json();
      console.log('Session data:', sessionData); // Debug log
  
      // Ensure the response has a `data` field
      if (!sessionData.data) {
        throw new Error('Invalid response format: missing data field');
      }
  
      return sessionData.data;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error instanceof Error ? error : new Error('An error occurred');
    }
  }

  export async function updateAttendance(
    sessionId: string,
    selectedStudents: string[],
    authToken: string
  ) {
    try {
      if (!authToken) {
        throw new Error('Unauthorized');
      }
  
      // Construct the payload
      const payload = {
        sessionID: sessionId,
        students: selectedStudents.map((studentID) => ({
          studentID,
          attendanceStatus: true, // Mark as present
        })),
      };
  
      // Construct the API endpoint
      const apiUrl = `${process.env.API_BASE_URL}/sessions/attendence/add`;
      console.log('Updating attendance at:', apiUrl); // Debug log
      console.log('Payload:', payload); // Debug log
  
      // Make the API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
  
      console.log('Response status:', response.status); // Debug log
  
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to update attendance');
      }
  
      // Parse and return the response data
      const responseData = await response.json();
      console.log('Update attendance response:', responseData); // Debug log
  
      return { success: true };
    } catch (err) {
      console.error('Error updating attendance:', err);
      throw err instanceof Error ? err : new Error('An error occurred');
    }
  }