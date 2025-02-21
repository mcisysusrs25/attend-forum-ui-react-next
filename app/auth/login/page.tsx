'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const BASE_URL = 'http://localhost:5000/api';

const Login = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        userID: '',
        userType: 'professor'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email || !formData.userID) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to login');
            }

            // Handle successful login
            const { user, token } = data.data;
            
            // Set the auth cookie
            document.cookie = `authToken=${token}; path=/; secure; samesite=strict`;
            
            // Store user data in sessionStorage
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('userFullName', user.fullName);
            sessionStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('userID', user.id);

            setMessage({ type: 'success', text: 'Login successful!' });
            
            // Reset form
            setFormData({
                email: '',
                userID: '',
                userType: 'professor'
            });

            // Add a small delay to ensure cookie is set before navigation
            setTimeout(() => {
                router.push('/dashboard');
            }, 100);

        } catch (error) {
            console.error('Login error:', error);
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to login. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-lg bg-white">
            <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="text"
                    name="userID"
                    value={formData.userID}
                    onChange={handleChange}
                    placeholder="User ID"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="professor">Professor</option>
                    <option value="student">Student</option>
                </select>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {message && (
                <p className={`mt-4 text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default Login;