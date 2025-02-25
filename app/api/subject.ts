"use server"


// Define a Subject type
type Subject = {
  subjectCode: string;
  title: string;
  professorID: string;
};

export async function fetchSubjects(userID: string, authToken: string) {
    try {
      if (!authToken) {
        throw new Error('Unauthorized');
      }
  
      const response = await fetch(`${process.env.API_BASE_URL}/subjects/getsubjects/${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (!response.ok) {
        console.log("Error fetching data.");
        return []; // Return empty array to avoid undefined issues
      }
  
      const data = await response.json();
  
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return []; // Return empty array on failure
    }
  }
  
export async function deleteSubject(subjectId: string, authToken: string) {
  try {
    if (!authToken) {
      throw new Error('Unauthorized');
    }
    
    const url = `${process.env.API_BASE_URL}/subjects/delete/${subjectId}`;
    console.log("url being used " + url);
    const response = await fetch(`${process.env.API_BASE_URL}/subjects/delete/${subjectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete subject');
    }

    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error instanceof Error ? error : new Error('An error occurred');
  }
}

export async function addSubject(subjectData: Subject, authToken: string) {
    try {
      if (!authToken) {
        throw new Error('Unauthorized');
      }

      console.log("server data " + subjectData);
      
      const url = `${process.env.API_BASE_URL}/subjects/add`;
      console.log("url being used " + url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(subjectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add subject');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error instanceof Error ? error : new Error('An error occurred');
    }
  }

  export async function updateSubject(subjectCode: string, subjectTitle: string, authToken: string) {
    try {
      if (!authToken) {
        throw new Error('Unauthorized');
      }
  
      console.log("Updating subject: ", subjectCode, subjectTitle);
  
      const url = `${process.env.API_BASE_URL}/subjects/update/${subjectCode}`;
      console.log("URL being used: ", url);
  
      // Prepare the body to send only the updated title
      const updatedsubjectData = { title: subjectTitle };
      console.log(JSON.stringify(updatedsubjectData));
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedsubjectData),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update subject');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error instanceof Error ? error : new Error('An error occurred');
    }
  }
  
  export async function getSubjectBySubjectCode(subjectCode: string, authToken: string) {
    try {
      if (!authToken) {
        throw new Error('Unauthorized');
      }
  
      console.log("Fetching subject by code:", subjectCode);
  
      const url = `${process.env.API_BASE_URL}/subjects/${subjectCode}`;
      console.log("URL being used: ", url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch failed with status:', response.status, 'Message:', errorData.message);
        throw new Error(errorData.message || 'Failed to fetch subject');
      }
  
      const data = await response.json();
      console.log('Data fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error instanceof Error ? error : new Error('An error occurred');
    }
  }
  