"use client"; // Ensures this component runs on the client side

import { getCurrentEnv } from '@/app/utils/nodeEnv';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Define the base URL as a variable
const apiUrl = getCurrentEnv("dev"); 
console.log(apiUrl);


const Register = () => {
    const router = useRouter();
    const [role, setRole] = useState('student'); // Default to 'student'
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentID, setStudentID] = useState('');
    const [professorName, setProfessorName] = useState('');
    const [professorEmail, setProfessorEmail] = useState('');
    const [professorID, setProfessorID] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
    
        try {
            // Create registration payload
            const payload = role === 'student' ? {
                firstName,
                lastName,
                studentEmail,
                studentID,
            } : {
                professorName,
                email: professorEmail,
                professorID,
            };
    
            // Log the payload for debugging
            console.log('Registration payload:', JSON.stringify(payload, null, 2));
    
            // Set the appropriate URL based on the role
            const url = role === 'student' ? `${apiUrl}/students/addSelf/register` : `${apiUrl}/professor/add`;
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error data:', errorData);
                throw new Error(errorData.error || 'Network response was not ok');
            }
    
            const data = await response.json();
            console.log('Registration success data:', data);
    
            // Clear previous session storage
            sessionStorage.clear();
    
            // Store unified user data in session storage
            const userData = role === 'student' ? {
                userID: data.data.student.studentID,
                fullName: data.data.student.fullName,
                email: data.data.student.studentEmail,
                token: data.data.token,
            } : {
                userID: data.data.professor.professorID,
                fullName: data.data.professor.professorName,
                email: data.data.professor.email,
                token: data.data.token,
            };
    
            // Store user data in session storage
            sessionStorage.setItem('userData', JSON.stringify(userData));
    
            // Set success message
            setMessage({ type: 'success', text: `Registration successful! Welcome, ${userData.fullName}.` });
    
            // Reset form fields
            resetFields();
             // Add a small delay to ensure cookie is set before navigation
             setTimeout(() => {
                router.push('/dashboard');
            }, 100);
        } catch (error) {
            console.error('Error during registration:', error);
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to register. Please try again.' });
        } finally {
            setLoading(false);
        }
    };
    
    
    const resetFields = () => {
        setFirstName('');
        setLastName('');
        setStudentEmail('');
        setStudentID('');
        setProfessorName('');
        setProfessorEmail('');
        setProfessorID('');
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-lg bg-white">
            <h1 className="text-2xl font-bold text-center mb-4">Register</h1>
            <div className="flex justify-center mb-4">
                <button 
                    className={`mr-2 px-4 py-2 rounded ${role === 'student' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setRole('student')}
                >
                    Student
                </button>
                <button 
                    className={`px-4 py-2 rounded ${role === 'professor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setRole('professor')}
                >
                    Professor
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {role === 'student' ? (
                    <>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="email"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="Student Email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="text"
                            value={studentID}
                            onChange={(e) => setStudentID(e.target.value)}
                            placeholder="Student ID"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={professorName}
                            onChange={(e) => setProfessorName(e.target.value)}
                            placeholder="Professor Name"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="email"
                            value={professorEmail}
                            onChange={(e) => setProfessorEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="text"
                            value={professorID}
                            onChange={(e) => setProfessorID(e.target.value)}
                            placeholder="Professor ID"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {message && (
                <p className={`mt-4 text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                </p>
            )}

<Link href={'/auth/login'}>
            <button className='mt-4 text-center p-3'>Already have an account ? Login</button>
            </Link>
        </div>
    );
};

export default Register;
