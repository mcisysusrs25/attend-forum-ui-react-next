// // fetch all the active sessions for students. 

// // http://localhost:5000/api/student/sessions/:studentID
// // http://localhost:5000/api/student/sessions/mark-attendance


// "use sever"

// export async function fetchStudentSessions(userType: string, userID: string, authToken: string) {
//     try {
//       let apiEndpoint = '';
  
//       if (userType === 'professor') {
//         apiEndpoint = `${process.env.API_BASE_URL}/sessions/getSessionsbyProfessor/${userID}`;
//       } else if (userType === 'student') {
//         apiEndpoint = `${process.env.API_BASE_URL}/sessions/getByStudentId/${userID}`;
//       } else {
//         throw new Error('Invalid user type');
//         console.log("invlaid user type");
//       }
  
//       const response = await fetch(apiEndpoint, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${authToken}`,
//         },
//         cache: 'no-store',
//       });
  
//       // Check specifically for token expiration
//       if (response.status === 401) {
//         return {
//           data: [],
//           error: true,
//           errorType: 'Token issue',
//         };
//       }
  
//       // Handle other errors generically
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Error fetching sessions:', errorData); // Log the error details
//         return {
//           data: [],
//           error: true,
//           errorType: 'API Error',
//         };
//       }
  
//       const data = await response.json();
//       return {
//         data: data.data,
//         error: false,
//       };
  
//     } catch (error) {
//       console.error('Error fetching sessions:', error);
//       throw error;
//       return {
//         data: [],
//         error: true,
//         errorType: error, // Can customize this if needed
//       };
//     }
//   }
  