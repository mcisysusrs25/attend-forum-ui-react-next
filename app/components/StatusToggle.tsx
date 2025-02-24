// need to revise and check either it is neeeded or not. 

"use client"

import { Switch } from '@headlessui/react'
import { useState } from 'react'

interface StatusToggleProps {
  sessionId: string
  initialStatus: string
  onStatusChange: (newStatus: string) => void
  disabled?: boolean
}

const getNextStatus = (currentStatus: string): string => {
  const statusFlow = {
    'new': 'active',
    'active': 'completed',
    'completed': 'completed' // Completed is final state
  }
  return statusFlow[currentStatus as keyof typeof statusFlow] || currentStatus
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  sessionId,
  initialStatus,
  onStatusChange,
  disabled = false
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState(initialStatus)

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true)
      setError(null)
      
      const newStatus = getNextStatus(currentStatus)
      
      const response = await fetch(`http://localhost:5000/api/sessions/updateStatus/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setCurrentStatus(newStatus)
      onStatusChange(newStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={currentStatus !== 'new'}
        onChange={handleStatusChange}
        disabled={disabled || isUpdating || currentStatus === 'completed'}
        className={`
          ${currentStatus !== 'new' ? 'bg-blue-600' : 'bg-gray-200'}
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="sr-only">Enable status change</span>
        <span
          className={`
            ${currentStatus !== 'new' ? 'translate-x-6' : 'translate-x-1'}
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          `}
        />
      </Switch>
      
      <span className={`
        px-2 py-1 rounded-full text-xs font-medium
        ${isUpdating ? 'animate-pulse' : ''}
        ${currentStatus === 'active' ? 'bg-green-100 text-green-800' : 
          currentStatus === 'completed' ? 'bg-purple-100 text-purple-800' : 
          'bg-yellow-100 text-yellow-800'}
      `}>
        {isUpdating ? 'Updating...' : currentStatus}
      </span>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
}

export default StatusToggle