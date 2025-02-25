"use server"
export async function registerUser(role: string, payload: any) {
    try {
      // Set the appropriate URL based on the role
      const url =
        role === 'student'
          ? `${process.env.API_BASE_URL}/students/addSelf/register`
          : `${process.env.API_BASE_URL}/professor/add`;
  
      // Send the request to the backend server
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }