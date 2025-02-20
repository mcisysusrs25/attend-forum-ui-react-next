"use client"

import React, { useState } from 'react';
import { Clock, Users, UserCheck, UserX, GraduationCap, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const sessions = [
    {
      id: "S1",
      title: "Advanced Data Structures and Algorithms",
      description: "Deep dive into advanced data structures including AVL trees, Red-Black trees, and complex graph algorithms with practical implementations.",
      status: "active",
      startDateTime: "2024-03-20T14:00:00",
      endDateTime: "2024-03-20T16:00:00",
      totalStudents: 45,
      attendedStudents: 42,
      remainingStudents: 3,
      professorName: "Dr. Sarah Williams",
      professorId: "PROF2024-056",
      batchTitle: "Computer Science - Batch 2024"
    },
    {
      id: "S2",
      title: "Machine Learning Fundamentals",
      description: "Introduction to core machine learning concepts covering supervised learning, unsupervised learning, and practical implementation using Python.",
      status: "completed",
      startDateTime: "2024-03-18T10:00:00",
      endDateTime: "2024-03-18T12:00:00",
      totalStudents: 38,
      attendedStudents: 35,
      remainingStudents: 3,
      professorName: "Dr. James Anderson",
      professorId: "PROF2024-042",
      batchTitle: "Data Science - Batch 2024"
    }
  ];

  const formatDateTime = (dateTimeStr: string | number | Date) => {
    return new Date(dateTimeStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSessions = activeFilter === 'all' 
    ? sessions 
    : sessions.filter(session => session.status === activeFilter);

  return (
    <div className="pt-16"> {/* Add padding top to account for navbar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
        </div>

        {/* Sessions Cards */}
        <div className="space-y-6">
          {filteredSessions.map((session) => (
            <div 
              key={session.id} 
              className={`w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 ${
                session.status === 'active' ? 'border-blue-500' : session.status === 'new' ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{session.title}</h2>
                    <p className="text-gray-600 mb-3">{session.description}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    session.status === 'active' 
                      ? 'bg-blue-100 text-blue-800' 
                      : session.status === 'new' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>

                {/* Time and Batch Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <span>Start: {formatDateTime(session.startDateTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    <span>End: {formatDateTime(session.endDateTime)}</span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-gray-600">Total: {session.totalStudents} students</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-gray-600">Attended: {session.attendedStudents}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <UserX className="h-5 w-5 mr-2 text-red-500" />
                    <span className="text-gray-600">Remaining: {session.remainingStudents}</span>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-4">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    See Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
