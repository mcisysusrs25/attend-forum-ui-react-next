'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/api/register';
import { loginUser } from '@/app/api/login';
import { fetchInstitutions } from '@/app/api/institutions';

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
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="hidden lg:flex lg:w-1/2 bg-[#6768EE] flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Faculty Portal</h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Welcome to the premium faculty experience. Access your sessions, manage your courses, and connect with your students in one secure platform.
          </p>
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
            <blockquote className="text-white italic">
              "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
            </blockquote>
            <p className="text-indigo-200 mt-4">— Malcolm X</p>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold text-[#6768EE]">Faculty Portal</h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex rounded-xl bg-indigo-50 p-1">
                <button
                  className={`w-1/2 rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                    isLogin 
                      ? 'bg-[#6768EE] text-white shadow-lg' 
                      : 'text-gray-600 hover:text-[#6768EE]'
                  }`}
                  onClick={() => {
                    setIsLogin(true);
                    resetFields();
                  }}
                >
                  Login
                </button>
                <button
                  className={`w-1/2 rounded-lg py-3 text-sm font-medium transition-all duration-300 ${
                    !isLogin 
                      ? 'bg-[#6768EE] text-white shadow-lg' 
                      : 'text-gray-600 hover:text-[#6768EE]'
                  }`}
                  onClick={() => {
                    setIsLogin(false);
                    resetFields();
                  }}
                >
                  Register
                </button>
              </div>
            </div>
            
            <div className="p-8">
              {message && (
                <div 
                  className={`mb-6 rounded-lg p-4 text-sm font-medium ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    {message.type === 'success' ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {message.text}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={professorName}
                          onChange={(e) => setProfessorName(e.target.value)}
                          placeholder="Dr. Jane Smith"
                          className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#6768EE]/30 focus:border-[#6768EE] transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Institution</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <select
                          value={institution}
                          onChange={handleInstitutionChange}
                          className="block w-full pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#6768EE]/30 focus:border-[#6768EE] appearance-none bg-none transition-all duration-200"
                          required
                        >
                          <option value="">Select an institution</option>
                          {institutions.map((inst, index) => (
                            <option key={index} value={inst}>
                              {inst}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="professor@university.edu"
                      className={`block w-full pl-12 pr-4 py-3.5 border rounded-xl text-gray-900 transition-all duration-200 focus:ring-2 ${
                        emailError 
                          ? 'border-red-300 focus:ring-red-300/30 focus:border-red-300' 
                          : 'border-gray-200 focus:ring-[#6768EE]/30 focus:border-[#6768EE]'
                      }`}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 text-xs font-medium text-red-600 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {emailError}
                    </p>
                  )}
                  {!isLogin && institution && institutionEmailDomains[institution] && (
                    <p className="mt-2 text-xs text-indigo-600 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                      </svg>
                      For {institution}, use an email ending with @{institutionEmailDomains[institution]}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professor ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={professorID}
                      onChange={handleProfessorIDChange}
                      placeholder="Y00123456"
                      className={`block w-full pl-12 pr-4 py-3.5 border rounded-xl text-gray-900 transition-all duration-200 focus:ring-2 ${
                        idError 
                          ? 'border-red-300 focus:ring-red-300/30 focus:border-red-300' 
                          : 'border-gray-200 focus:ring-[#6768EE]/30 focus:border-[#6768EE]'
                      }`}
                      required
                    />
                  </div>
                  {idError && (
                    <p className="mt-2 text-xs font-medium text-red-600 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {idError}
                    </p>
                  )}
                  {!isLogin && (
                    <p className="mt-2 text-xs text-indigo-600 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                      </svg>
                      ID must start with Y00 followed by 6 digits (e.g., Y00123456)
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || (!isLogin && (!!emailError || !!idError))} 
                  className={`
                    w-full py-3.5 px-4 rounded-xl text-white font-medium 
                    transition-all duration-300 transform
                    ${
                      loading || (!isLogin && (!!emailError || !!idError)) 
                        ? 'bg-[#6768EE]/70 cursor-not-allowed'
                        : 'bg-[#6768EE] hover:bg-[#5758DF] active:scale-98 shadow-lg hover:shadow-[#6768EE]/30'
                    }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : isLogin ? "Sign In" : "Create Account"}
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  {isLogin ? "New to the faculty portal? " : "Already have an account? "}
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      resetFields();
                    }}
                    className="text-[#6768EE] font-medium hover:text-[#5758DF] hover:underline focus:outline-none"
                  >
                    {isLogin ? "Create an account" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;