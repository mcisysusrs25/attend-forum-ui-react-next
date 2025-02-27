'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/api/register';
import { loginUser } from '@/app/api/login';

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [professorName, setProfessorName] = useState('');
  const [email, setEmail] = useState('');
  const [professorID, setProfessorID] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [idError, setIdError] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Auto-uppercase Professor ID as user types
  const handleProfessorIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setProfessorID(value);
    validateProfessorID(value);
  };

  // Validate Professor ID format
  const validateProfessorID = (id: string) => {
    if (!isLogin && id && !/^[A-Z0-9-]+$/.test(id)) {
      setIdError('ID must contain only uppercase letters, numbers, and hyphens');
    } else {
      setIdError('');
    }
  };

  // Handle automatic switch to login after registration
  useEffect(() => {
    if (registrationComplete) {
      const timer = setTimeout(() => {
        setIsLogin(true);
        setRegistrationComplete(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registrationComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Additional validation before submission
    if (!isLogin && !/^[A-Z0-9-]+$/.test(professorID)) {
      setMessage({ type: 'error', text: 'Please ensure your Professor ID is in uppercase format' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const data = await loginUser(email, professorID, 'professor');
        const { user, token } = data?.data;
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userFullName', user.fullName);
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userID', user.id);
        sessionStorage.setItem('userType', user.userType);
        setMessage({ type: 'success', text: 'Login successful!' });
        router.push('/sessions');
      } else {
        const payload = { professorName, email, professorID };
        const data = await registerUser('professor', payload);
        sessionStorage.clear();
        const userData = {
          userID: data.data.professor.professorID,
          fullName: data.data.professor.professorName,
          email: data.data.professor.email,
          token: data.data.token,
        };
        sessionStorage.setItem('userData', JSON.stringify(userData));
        setMessage({ 
          type: 'success', 
          text: `Registration successful! Welcome, ${userData.fullName}. Redirecting to login...` 
        });
        setRegistrationComplete(true);
        
        // Pre-fill login fields for convenience
        setEmail(email);
        setProfessorID(professorID);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to process request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFields = () => {
    if (!registrationComplete) {
      setProfessorName('');
      setEmail('');
      setProfessorID('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h1 className="text-center text-2xl font-bold text-white">
            Faculty Portal
          </h1>
          <p className="mt-2 text-center text-blue-100">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        
        <div className="p-8">
          {!isLogin && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              <p className="font-medium">Registration Information</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Your Professor ID must be in UPPERCASE format</li>
                <li>After registration, you'll be automatically redirected to login</li>
                <li>Your credentials will be securely stored</li>
              </ul>
            </div>
          )}
          
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              className={`w-1/2 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
                isLogin ? 'bg-white text-blue-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setIsLogin(true);
                resetFields();
              }}
            >
              Login
            </button>
            <button
              className={`w-1/2 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
                !isLogin ? 'bg-white text-blue-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setIsLogin(false);
                resetFields();
              }}
            >
              Register
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="professorName" className="block text-xs font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="professorName"
                    type="text"
                    value={professorName}
                    onChange={(e) => setProfessorName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="professor@university.edu"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="professorID" className="block text-xs font-medium text-gray-700">
                Professor ID {!isLogin && <span className="text-blue-600 font-medium">(UPPERCASE ONLY)</span>}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="professorID"
                  type="text"
                  value={professorID}
                  onChange={handleProfessorIDChange}
                  placeholder="PROF-12345"
                  className={`block w-full rounded-lg border ${
                    idError ? 'border-red-300 ring-1 ring-red-500' : 'border-gray-300'
                  } px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              {idError && <p className="mt-1 text-xs text-red-600">{idError}</p>}
            </div>
            
            <button
              type="submit"
              disabled={loading || (!isLogin && !!idError)}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
          
          {message && (
            <div className={`mt-5 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} p-4`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}
          
          <div className="mt-6 text-center text-xs text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetFields();
              }}
              className="text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              {isLogin ? 'Register here' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;