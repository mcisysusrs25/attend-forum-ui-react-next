// utils/authSession.ts
export function getSessionAuthToken(): string | null {
    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: string });
  
      return cookies['authToken'] || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
  
  export function getUserId(): string | null {
    try {
      // Try localStorage first
      let userId = localStorage.getItem('userID');
      console.log('localStorage userID:', userId);
  
      // If not in localStorage, try sessionStorage
      if (!userId) {
        userId = sessionStorage.getItem('userID');
        console.log('sessionStorage userID:', userId);
      }
  
      // Log all storage contents for debugging
      console.log('All localStorage keys:', Object.keys(localStorage));
      console.log('All sessionStorage keys:', Object.keys(sessionStorage));
  
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }