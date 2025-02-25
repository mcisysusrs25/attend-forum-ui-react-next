// utils/authSession.ts

/**
 * Get the authentication token from sessionStorage or localStorage.
 * @returns {string | null} The auth token, or null if not found.
 */
export function getSessionAuthToken(): string | null {
  try {
    // Try sessionStorage first
    let authToken = sessionStorage.getItem('authToken');

    // If not in sessionStorage, try localStorage
    if (!authToken) {
      authToken = localStorage.getItem('authToken');
    }

    return authToken;
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

  export function getUserType(): string | null {
    try {
      // Try localStorage first
      let userType = localStorage.getItem('userType');
      console.log('localStorage userID:', userType);
  
      // If not in localStorage, try sessionStorage
      if (!userType) {
        userType = sessionStorage.getItem('userType');
        console.log('sessionStorage userType:', userType);
      }
  
      // Log all storage contents for debugging
      console.log('All localStorage keys:', Object.keys(localStorage));
      console.log('All sessionStorage keys:', Object.keys(sessionStorage));
  
      return userType;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }