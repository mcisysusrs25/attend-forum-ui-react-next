"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Example() {
  const router = useRouter()

  // Check if the user is logged in
  useEffect(() => {
    const authToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1]

    if (!authToken) {
      router.push('/auth/login') // Redirect to /auth if not logged in
    }
  }, [router])

  return (
    <>
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        {/* Dummy UI for Dashboard Preview */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Example Dashboard Card 1 */}
          <div className="rounded-lg border border-gray-200 p-6 shadow-md transition-transform transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-800">Upcoming Sessions</h2>
            <p className="mt-2 text-5xl font-bold text-indigo-600">12</p>
            <p className="mt-2 text-gray-600">Sessions Scheduled</p>
          </div>
          {/* Example Dashboard Card 2 */}
          <div className="rounded-lg border border-gray-200 p-6 shadow-md transition-transform transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-800">Your Progress</h2>
            <p className="mt-2 text-5xl font-bold text-indigo-600">85%</p>
            <p className="mt-2 text-gray-600">Completion Rate</p>
          </div>
          {/* Example Dashboard Card 3 */}
          <div className="rounded-lg border border-gray-200 p-6 shadow-md transition-transform transform hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-800">Community Forum</h2>
            <p className="mt-2 text-5xl font-bold text-indigo-600">250</p>
            <p className="mt-2 text-gray-600">Active Members</p>
          </div>
        </div>
      </main>
    </>
  )
}
