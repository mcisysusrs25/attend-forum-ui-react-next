"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionAuthToken, getUserId } from '@/app/utils/authSession';
import { fetchBatchesByProfessorId, addSession } from '@/app/api/session';
import { fetchClasssConfigurationsByProfessorID } from '@/app/api/config';
import { fetchSubjects } from '@/app/api/subject';

interface Batch {
  _id: string;
  batchLabel: string;
  batchID: string;
  createdBy: string;
  students: string[];
  classConfigId: string;
}

interface Classroom {
  _id?: string;
  latitude: number;
  longitude: number;
  label: string;
  classConfigId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Subject {
  _id: string;
  subjectCode: string;
  title: string;
  description: string;
  creditHours: number;
  subjectTerm: string;
  professorID: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SessionData {
  sessionTitle: string;
  sessionDescription: string;
  sessionValidFrom: string;
  sessionValidTo: string;
  subjectCode: string;
  batchID: string;
  classConfigId: string;
  createdBy: string;
}

// Error state interfaces
interface DataErrors {
  batches: string | null;
  subjects: string | null;
  configurations: string | null;
}

interface ValidationErrors {
  subjectCode: string | null;
  batchID: string | null;
  classConfigId: string | null;
  sessionValidFrom: string | null;
  sessionValidTo: string | null;
  sessionTitle: string | null;
  sessionDescription: string | null;
}

export default function AddSessionPage() {
  const router = useRouter();
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionValidFrom, setSessionValidFrom] = useState('');
  const [sessionValidTo, setSessionValidTo] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [batchID, setBatchID] = useState('');
  const [classConfigId, setClassConfigId] = useState('');

  const [isDataNotConfigured, setIsDataNotConfigured] = useState(true);

  // Data states
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classConfigurations, setClassConfigurations] = useState<Classroom[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<Classroom | null>(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Error states
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [dataErrors, setDataErrors] = useState<DataErrors>({
    batches: null,
    subjects: null,
    configurations: null
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    subjectCode: null,
    batchID: null,
    classConfigId: null,
    sessionValidFrom: null,
    sessionValidTo: null,
    sessionTitle: null,
    sessionDescription: null
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingResources, setLoadingResources] = useState({
    batches: true,
    subjects: true,
    configurations: true
  });

  const authToken = getSessionAuthToken();
  const userID = getUserId();

  // Format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  // Set default times on initial load
  useEffect(() => {
    const now = new Date();
    const twentyMinsLater = new Date(now.getTime() + 20 * 60000);

    setSessionValidFrom(formatDateForInput(now));
    setSessionValidTo(formatDateForInput(twentyMinsLater));
  }, []);

  // Authentication check
  useEffect(() => {
    if (!authToken) {
      console.log('No auth token found, redirecting to login');
      router.push('/auth/login');
    }
  }, [authToken, router]);

  // Fetch data with error handling
  useEffect(() => {
    if (!authToken || !userID) return;

    const fetchData = async () => {
      setIsLoading(true);
      setGeneralError(null);

      // Reset data error states
      setDataErrors({
        batches: null,
        subjects: null,
        configurations: null
      });

      // Set loading states
      setLoadingResources({
        batches: true,
        subjects: true,
        configurations: true
      });

      // Fetch configurations
      fetchClasssConfigurationsByProfessorID(authToken, userID)
        .then(configData => {
          setClassConfigurations(configData?.data || []);
          setLoadingResources(prev => ({ ...prev, configurations: false }));
        })
        .catch(error => {
          console.error('Error fetching class configurations:', error);
          setDataErrors(prev => ({
            ...prev,
            configurations: 'Failed to load classroom configurations. Please try refreshing the page.'
          }));
          setLoadingResources(prev => ({ ...prev, configurations: false }));
        });

      // Fetch batches
      fetchBatchesByProfessorId(userID, authToken)
        .then(batchesData => {
          setBatches(batchesData);
          setLoadingResources(prev => ({ ...prev, batches: false }));
        })
        .catch(error => {
          console.error('Error fetching batches:', error);
          setDataErrors(prev => ({
            ...prev,
            batches: 'Failed to load batch data. Please try refreshing the page.'
          }));
          setLoadingResources(prev => ({ ...prev, batches: false }));
        });

      // Fetch subjects
      fetchSubjects(userID, authToken)
        .then(subjectsData => {
          setSubjects(subjectsData);
          setLoadingResources(prev => ({ ...prev, subjects: false }));
        })
        .catch(error => {
          console.error('Error fetching subjects:', error);
          setDataErrors(prev => ({
            ...prev,
            subjects: 'Failed to load subject data. Please try refreshing the page.'
          }));
          setLoadingResources(prev => ({ ...prev, subjects: false }));
        });
    };

    fetchData();
  }, [authToken, userID]);

  // Update loading state when all resources are loaded
  useEffect(() => {
    if (!loadingResources.batches && !loadingResources.subjects && !loadingResources.configurations) {
      setIsLoading(false);
    } 
    if (!batches.length || !subjects.length || !classConfigurations.length) {
      setIsDataNotConfigured(true);
    } else {
      setIsDataNotConfigured(false);
    }
  }, [loadingResources]);

  // Set selected entities based on selections
  useEffect(() => {
    if (subjectCode) {
      const subject = subjects.find(s => s.subjectCode === subjectCode);
      setSelectedSubject(subject || null);

      // Clear validation error when a selection is made
      setValidationErrors(prev => ({ ...prev, subjectCode: null }));
    } else {
      setSelectedSubject(null);
    }

    if (batchID) {
      const batch = batches.find(b => b.batchID === batchID);
      setSelectedBatch(batch || null);

      // Clear validation error when a selection is made
      setValidationErrors(prev => ({ ...prev, batchID: null }));
    } else {
      setSelectedBatch(null);
    }

    if (classConfigId) {
      const config = classConfigurations.find(c => c.classConfigId === classConfigId);
      setSelectedConfig(config || null);

      // Clear validation error when a selection is made
      setValidationErrors(prev => ({ ...prev, classConfigId: null }));
    } else {
      setSelectedConfig(null);
    }
  }, [subjectCode, batchID, classConfigId, subjects, batches, classConfigurations]);

  // Auto-generate session title and description
  useEffect(() => {
    if (selectedSubject && selectedBatch && selectedConfig && sessionValidFrom && sessionValidTo) {
      // Format dates for display
      const startDate = new Date(sessionValidFrom);
      const endDate = new Date(sessionValidTo);

      const formattedStart = startDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      const formattedEnd = endDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      // Generate title
      const newTitle = `${selectedSubject.title} - ${selectedBatch.batchLabel} - ${selectedConfig.label}`;
      setSessionTitle(newTitle);

      // Generate description
      const newDescription = `Session for ${selectedSubject.title} (${selectedSubject.subjectCode}) with ${selectedBatch.batchLabel} on ${formattedStart} to ${formattedEnd}.`;
      setSessionDescription(newDescription);

      // Clear validation errors for title and description
      setValidationErrors(prev => ({
        ...prev,
        sessionTitle: null,
        sessionDescription: null
      }));
    }
  }, [selectedSubject, selectedBatch, selectedConfig, sessionValidFrom, sessionValidTo]);

  // Clear time-related validation errors when times are updated
  useEffect(() => {
    if (sessionValidFrom && sessionValidTo) {
      setValidationErrors(prev => ({
        ...prev,
        sessionValidFrom: null,
        sessionValidTo: null
      }));
    }
  }, [sessionValidFrom, sessionValidTo]);

  // Validate form data
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      subjectCode: !subjectCode ? 'Please select a subject' : null,
      batchID: !batchID ? 'Please select a batch' : null,
      classConfigId: !classConfigId ? 'Please select a classroom configuration' : null,
      sessionValidFrom: !sessionValidFrom ? 'Please set a start time' : null,
      sessionValidTo: !sessionValidTo ? 'Please set an end time' : null,
      sessionTitle: !sessionTitle.trim() ? 'Session title is required' : null,
      sessionDescription: !sessionDescription.trim() ? 'Session description is required' : null,
    };

    // Check if start time is before end time
    if (sessionValidFrom && sessionValidTo) {
      const startDate = new Date(sessionValidFrom);
      const endDate = new Date(sessionValidTo);

      if (startDate >= endDate) {
        errors.sessionValidTo = 'End time must be after start time';
      }
    }

    // Update validation errors state
    setValidationErrors(errors);

    // Return true if no errors (all values are null)
    return Object.values(errors).every(error => error === null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error states
    setGeneralError(null);

    // Validate form
    if (!validateForm()) {
      // Scroll to the first error if there are any
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!authToken || !userID) {
      setGeneralError('User is not authenticated. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionData: SessionData = {
        sessionTitle,
        sessionDescription,
        sessionValidFrom,
        sessionValidTo,
        subjectCode,
        batchID,
        classConfigId,
        createdBy: userID,
      };

      await addSession(sessionData, authToken);

      // Set success and redirect after a short delay
      setSubmissionSuccess(true);

      setTimeout(() => {
        router.push('/sessions#new');
      }, 1500);

    } catch (error) {
      console.error('Error adding session:', error);

      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          setGeneralError('A session with these details already exists. Please check your entries.');
        } else if (error.message.includes('unauthorized')) {
          setGeneralError('Your session has expired. Please log in again.');
          setTimeout(() => router.push('/auth/login'), 2000);
        } else if (error.message.includes('network')) {
          setGeneralError('Network error. Please check your connection and try again.');
        } else {
          setGeneralError(`Failed to create session: ${error.message}`);
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleBacktoSessions(){
    router.push("/sessions")
  }


  // Loading state UI
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center mt-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900">Loading session data</h3>
            <p className="text-gray-500 mt-1">Please wait while we fetch your information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state UI
  if (isDataNotConfigured) {
    return (
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center mt-16">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{dataErrors.batches} </h3>
            <h3 className="text-lg font-medium text-gray-900">{dataErrors.configurations} </h3>
            <h3 className="text-lg font-medium text-gray-900">{dataErrors.subjects} </h3>

            <p className="text-gray-500 mt-1">Please Confgigure this before creating a sessioin</p>
            <button onClick={handleBacktoSessions} className='bg-primary px-4 py-2 mt-4 rounded-md text-white'>Back to Sessions</button>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/sessions")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Sessions
          </button>

          <h2 className="text-2xl font-bold text-gray-900">Add New Session</h2>
          <div className="w-32"></div> {/* Empty div for flex alignment */}
        </div>

        {/* General error message */}
        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{generalError}</p>
            </div>
            <button
              onClick={() => setGeneralError(null)}
              className="ml-auto flex-shrink-0 text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Success message */}
        {submissionSuccess && (
          <div className="mb-6 p-4 bg-primary-success border-l-4 border-primary rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-primary">Session created successfully! Redirecting to sessions page...</p>
              </div>
            </div>
          </div>
        )}

        {/* Data error messages */}
        {(dataErrors.batches || dataErrors.subjects || dataErrors.configurations) && (
          <div className="mb-6 p-4 bg-primary border-l-4 border-primary rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary">Data loading issues</h3>
                <div className="mt-2 text-sm text-primary">
                  <ul className="list-disc pl-5 space-y-1">
                    {dataErrors.batches && <li>{dataErrors.batches}</li>}
                    {dataErrors.subjects && <li>{dataErrors.subjects}</li>}
                    {dataErrors.configurations && <li>{dataErrors.configurations}</li>}
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-primary rounded-full p-1 mr-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">1</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Select Subject, Batch, and Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <div className="relative">
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    required
                    className={`block w-full border ${validationErrors.subjectCode ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 pr-8 bg-white focus:ring-primary focus:border-primary shadow-sm`}
                    disabled={isSubmitting || loadingResources.subjects}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject.subjectCode}>
                        {subject.title} ({subject.subjectCode})
                      </option>
                    ))}
                  </select>
                  {loadingResources.subjects && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {validationErrors.subjectCode && (
                  <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.subjectCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                <div className="relative">
                  <select
                    value={batchID}
                    onChange={(e) => setBatchID(e.target.value)}
                    required
                    className={`block w-full border ${validationErrors.batchID ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 pr-8 bg-white focus:ring-primary focus:border-primary shadow-sm`}
                    disabled={isSubmitting || loadingResources.batches}
                  >
                    <option value="">Select a batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch.batchID}>
                        {batch.batchLabel}
                      </option>
                    ))}
                  </select>
                  {loadingResources.batches && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {validationErrors.batchID && (
                  <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.batchID}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Location *</label>
                <div className="relative">
                  <select
                    value={classConfigId}
                    onChange={(e) => setClassConfigId(e.target.value)}
                    required
                    className={`block w-full border ${validationErrors.classConfigId ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 pr-8 bg-white focus:ring-primary focus:border-primary shadow-sm`}
                    disabled={isSubmitting || loadingResources.configurations}
                  >
                    <option value="">Select a class configuration</option>
                    {classConfigurations.length > 0 ? (
                      classConfigurations.map((config) => (
                        <option key={config._id} value={config.classConfigId}>
                          {config.label}
                        </option>
                      ))
                    ) : (
                      <option value="">No class configurations available</option>
                    )}
                  </select>
                  {loadingResources.configurations && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {validationErrors.classConfigId && (
                  <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.classConfigId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-primary rounded-full p-1 mr-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">2</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Set Session Timing</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Start Time *</label>
                <input
                  type="datetime-local"
                  value={sessionValidFrom}
                  onChange={(e) => setSessionValidFrom(e.target.value)}
                  required
                  className={`block w-full border ${validationErrors.sessionValidFrom ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 focus:ring-primary focus:border-primary shadow-sm`}
                  disabled={isSubmitting}
                />
                {validationErrors.sessionValidFrom && (
                  <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.sessionValidFrom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session End Time *</label>
                <input
                  type="datetime-local"
                  value={sessionValidTo}
                  onChange={(e) => setSessionValidTo(e.target.value)}
                  required
                  className={`block w-full border ${validationErrors.sessionValidTo ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 focus:ring-primary focus:border-primary shadow-sm`}
                  disabled={isSubmitting}
                />
                {validationErrors.sessionValidTo && (
                  <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.sessionValidTo}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-primary rounded-full p-1 mr-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">3</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Review Auto-Generated Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  required
                  className={`block w-full border ${validationErrors.sessionTitle ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 focus:ring-primary focus:border-primary shadow-sm`}
                  disabled={isSubmitting}
                />
                {validationErrors.sessionTitle ? (
                  <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.sessionTitle}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-generated based on your selections. You can edit if needed.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Description *</label>
                <textarea
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  required
                  className={`block w-full border ${validationErrors.sessionDescription ? 'border-red-300' : 'border-gray-300'} rounded-md p-2 focus:ring-primary focus:border-primary shadow-sm`}
                  rows={3}
                  disabled={isSubmitting}
                />
                {validationErrors.sessionDescription ? (
                  <p className="mt-1 text-sm text-red-600 error-message">{validationErrors.sessionDescription}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-generated based on your selections. You can edit if needed.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center py-4">
            <div className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push("/sessions")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Session...
                  </>
                ) : (
                  <>Add Session</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}