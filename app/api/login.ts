"use server"

export async function loginUser(email: string, userID: string, userType: string) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, userID, userType }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        // throw new Error(errorData.message || 'Failed to login');
      }
  
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Login error:', err);
      // throw err;
    }
  }