'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/api/register';
import { loginUser } from '@/app/api/login';
import { fetchInstitutions } from '@/app/api/institutions'; // Assuming you have an API function for this

// Map of institutions to their email domains
const institutionEmailDomains: Record<string, string> = {
  "Youngstown State University": "ysu.edu",
  "Ohio State University": "osu.edu",
  "University of Michigan": "umich.edu",
  // Add more institutions and their domains as needed
};

const AuthPage = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [professorName, setProfessorName] = useState('');
  const [email, setEmail] = useState('');
  const [professorID, setProfessorID] = useState('');
  const [institution, setInstitution] = useState('');
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [idError, setIdError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Fetch institutions from API
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const data = await fetchInstitutions();
        setInstitutions(data); 
      } catch (error) {
        console.error('Error fetching institutions:', error);
      }
    };
    loadInstitutions();
  }, []);

  // Validate and format Professor ID as user types
  const handleProfessorIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setProfessorID(value);
    validateProfessorID(value);
  };

  // Validate Professor ID format - must start with Y00 followed by 6 digits
  const validateProfessorID = (id: string) => {
    if (!isLogin) {
      if (!id) {
        setIdError('');
        return;
      }
      
      if (id.length > 9) {
        setIdError('ID must be exactly 9 characters long');
        return;
      }
      
      if (!id.startsWith('Y00')) {
        setIdError('ID must start with Y00');
        return;
      }
      
      const numbersPattern = /^Y00\d{6}$/;
      if (!numbersPattern.test(id)) {
        setIdError('ID must be in format Y00 followed by 6 digits (e.g., Y00123456)');
        return;
      }
      
      setIdError('');
    } else {
      setIdError('');
    }
  };

  // Handle institution change and validate email if already entered
  const handleInstitutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInstitution = e.target.value;
    setInstitution(selectedInstitution);
    
    // Re-validate email if it's already entered
    if (email) {
      validateEmail(email, selectedInstitution);
    }
  };

  // Handle email change and validate against selected institution
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail, institution);
  };

  // Validate email against institution domain
  const validateEmail = (emailToValidate: string, selectedInstitution: string) => {
    if (!isLogin && selectedInstitution && emailToValidate) {
      const domain = institutionEmailDomains[selectedInstitution];
      
      if (domain && !emailToValidate.toLowerCase().endsWith(`@${domain}`)) {
        setEmailError(`Email must end with @${domain} for ${selectedInstitution}`);
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };

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
    
    // Validate Professor ID format for registration
    if (!isLogin) {
      const idPattern = /^Y00\d{6}$/;
      if (!idPattern.test(professorID)) {
        setMessage({ 
          type: 'error', 
          text: 'Professor ID must start with Y00 followed by 6 digits (e.g., Y00123456)' 
        });
        return;
      }
    }

    if (!isLogin && !institution) {
      setMessage({ type: 'error', text: 'Please select your institution' });
      return;
    }
    
    // Check email domain validation for registration
    if (!isLogin && institution) {
      const domain = institutionEmailDomains[institution];
      if (domain && !email.toLowerCase().endsWith(`@${domain}`)) {
        setMessage({ 
          type: 'error', 
          text: `Your email must end with @${domain} for ${institution}` 
        });
        return;
      }
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
        router.push('/sessions');
      } else {
        const payload = { professorName, email, professorID, institution };
        const data = await registerUser('professor', payload);
        sessionStorage.clear();
        const userData = {
          userID: data.data.professor.professorID,
          fullName: data.data.professor.professorName,
          email: data.data.professor.email,
          token: data.data.token,
        };
        sessionStorage.setItem('userData', JSON.stringify(userData));
        setMessage({ type: 'success', text: `Registration successful! Redirecting to login...` });
        setRegistrationComplete(true);
        
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
      setInstitution('');
      setEmailError('');
      setIdError('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="bg-secondary p-6">
          <h1 className="text-center text-2xl font-bold text-white">Faculty Portal</h1>
          <p className="mt-2 text-center text-white">{isLogin ? 'Sign in to your account' : 'Create your account'}</p>
        </div>
        
        <div className="p-8">
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              className={`w-1/2 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
                isLogin ? 'bg-white text-primary shadow-md' : 'text-gray-500 hover:text-gray-700'
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
                !isLogin ? 'bg-white text-primary shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setIsLogin(false);
                resetFields();
              }}
            >
              Register
            </button>
          </div>
          
          {message && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === 'success' ? 'bg-primary text-primary' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={professorName}
                    onChange={(e) => setProfessorName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="block w-full rounded-lg border px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">Select Your Institution</label>
                  <select
                    value={institution}
                    onChange={handleInstitutionChange}
                    className="block w-full rounded-lg border px-4 py-3"
                    required
                  >
                    <option value="">Select an institution</option>
                    {institutions.map((inst, index) => (
                      <option key={index} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="professor@university.edu"
                className={`block w-full rounded-lg border px-4 py-3 ${emailError ? 'border-red-500' : ''}`}
                required
              />
              {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
              {!isLogin && institution && institutionEmailDomains[institution] && (
                <p className="mt-1 text-xs text-gray-500">
                  For {institution}, use an email ending with @{institutionEmailDomains[institution]}
                </p>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Professor ID</label>
              <input
                type="text"
                value={professorID}
                onChange={handleProfessorIDChange}
                placeholder="Y00123456"
                className={`block w-full rounded-lg border px-4 py-3 ${idError ? 'border-red-500' : ''}`}
                required
              />
              {idError && <p className="mt-1 text-xs text-red-600">{idError}</p>}
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  ID must start with Y00 followed by 6 digits (e.g., Y00123456)
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || (!isLogin && (!!emailError || !!idError))} 
              className={`w-full py-3 text-white rounded-lg ${
                loading || (!isLogin && (!!emailError || !!idError)) 
                  ? 'bg-primary' 
                  : 'bg-primary hover:bg-secondary'
              }`}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;