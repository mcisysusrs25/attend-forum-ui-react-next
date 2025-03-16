"use client"

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon, CalendarIcon, BookOpenIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { HistoryIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Define navigation items with icons for professors and students
const professorNavigation = [
  { name: 'Sessions', href: '/sessions', icon: CalendarIcon },
  { name: 'Subjects', href: '/subjects', icon: BookOpenIcon },
  { name: 'Batches', href: '/batches', icon: UserGroupIcon },
  { name: 'Classes', href: '/config', icon: Cog6ToothIcon },
  { name: 'History', href: '/history', icon: HistoryIcon },
]

const studentNavigation = [
  { name: 'My Sessions', href: '/sessions', icon: CalendarIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [user, setUser] = useState<{
    fullName: string | null;
    email: string | null;
    userID: string | null;
    userType: string | null;
  }>({
    fullName: null,
    email: null,
    userID: null,
    userType: null,
  });

  // Function to determine the base route from pathname
  const getBaseRoute = (path: string) => {
    // Split the path by '/' and take the first segment
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? `/${segments[0]}` : '';
  };

  // Load user data and sidebar state from sessionStorage
  useEffect(() => {
    const fullName = sessionStorage.getItem('userFullName');
    const email = sessionStorage.getItem('userEmail');
    const userID = sessionStorage.getItem('userID');
    const userType = sessionStorage.getItem('userType');

    // Load sidebar state
    const savedSidebarState = sessionStorage.getItem('sidebarOpen');
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === 'true');
    }

    // Load active tab state or determine it from current path
    const currentBaseRoute = getBaseRoute(pathname);
    const savedActiveTab = sessionStorage.getItem('activeTab');
    
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
    } else if (currentBaseRoute) {
      setActiveTab(currentBaseRoute);
      sessionStorage.setItem('activeTab', currentBaseRoute);
    }

    if (fullName && email && userID && userType) {
      setUser({
        fullName,
        email,
        userID,
        userType,
      });
    } else {
      router.push('/auth/login');
    }
  }, [pathname, router]);

  // Handle sidebar toggle and save state to sessionStorage
  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    sessionStorage.setItem('sidebarOpen', newState.toString());
  };

  // Handle navigation item click to set active tab
  const handleNavClick = (href: string) => {
    const baseRoute = getBaseRoute(href);
    setActiveTab(baseRoute);
    sessionStorage.setItem('activeTab', baseRoute);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/auth/login');
  };

  const userNavigation = [
    { name: 'See Profile', href: '/profile' },
    { name: 'Logout', href: '#', onClick: handleLogout }
  ]

  const navigation = user.userType === 'professor' ? professorNavigation : studentNavigation;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={classNames(
        sidebarOpen ? "w-64" : "w-20",
        "transition-width duration-300 ease-in-out bg-primary h-full shadow-xl relative"
      )}>
        {/* Toggle button */}
        <button 
          onClick={handleSidebarToggle}
          className="absolute -right-3 top-10 bg-secondary p-1 rounded-full text-white shadow-lg border-2 border-white z-10"
        >
          <svg 
            className={`h-4 w-4 transition-transform duration-300 ${sidebarOpen ? "rotate-180" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Logo and brand */}
        <div className={`flex ${sidebarOpen ? "justify-start px-6" : "justify-center px-2"} items-center h-16 border-b border-gray-700`}>
          <Image alt="Your Company" src="/logo.svg" className="h-10 w-10" height={44} width={44} />
          {sidebarOpen && (
            <span className="ml-3 text-white font-semibold text-lg opacity-90">
              AttendForum
              <p className='text-xs'>The attendance app</p>
            </span>
            
          )}
        </div>
        
        {/* User profile */}
        <div className={`flex ${sidebarOpen ? "justify-start px-4" : "justify-center"} items-center py-6 border-b border-gray-700`}>
          <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-white ring-2 ring-white">
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.fullName}</p>
              <p className="text-xs text-gray-300 truncate max-w-xs">{user.email}</p>
              <Menu as="div" className="relative mt-1">
                <MenuButton className="flex items-center text-xs text-white font-bold hover:text-primary">
                  <span>Account</span>
                  <ChevronDownIcon className="ml-1 h-3 w-3" />
                </MenuButton>
                <MenuItems className="absolute left-0 z-10 mt-1 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.name}
                        </Link>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === getBaseRoute(item.href) || pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={classNames(
                    isActive
                      ? 'bg-secondary text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    `group flex items-center ${sidebarOpen ? "justify-start" : "justify-center"} rounded-md px-3 py-3 text-sm font-medium transition-all duration-150`
                  )}
                >
                  <Icon className={`${sidebarOpen ? "mr-3" : ""} h-5 w-5 flex-shrink-0`} aria-hidden="true" />
                  {sidebarOpen && <span>{item.name}</span>}
                  {!sidebarOpen && (
                    <span className="absolute left-full ml-3 mt-0 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}