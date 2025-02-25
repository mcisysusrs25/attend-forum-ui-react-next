"use client"

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Define navigation items for professors and students
const professorNavigation = [
  { name: 'My Sessions', href: '/sessions' },
  { name: 'My Subjects', href: '/subjects' },
  { name: 'My Batches', href: '/batches' },
  { name: 'Class Configuration', href: '/config' },
]

const studentNavigation = [
  { name: 'My Sessions', href: '/sessions' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
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

  useEffect(() => {
    const fullName = sessionStorage.getItem('userFullName');
    const email = sessionStorage.getItem('userEmail');
    const userID = sessionStorage.getItem('userID');
    const userType = sessionStorage.getItem('userType');

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
  }, [router]);

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

  const currentPage = navigation.find((item) => pathname === item.href)?.name || 'sessions';

  return (
    <div className="min-h-full">
      {/* Sticky Navbar */}
      <Disclosure as="nav" className="bg-gray-800 sticky top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <Image alt="Your Company" src="/logo.png" className="size-8" height={44} width={44} />
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            pathname === item.href
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                          aria-current={pathname === item.href ? 'page' : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile menu button */}
                <div className="-mr-2 flex md:hidden">
                  <DisclosureButton className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>

                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <MenuButton className="flex items-center max-w-xs rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                          <span className="sr-only">Open user menu</span>
                          <div className="size-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-2 flex flex-col items-start">
                            <span className="text-sm text-white">{user.fullName}</span>
                            <span className="text-xs text-gray-400">{user.email}</span>
                          </div>
                        </MenuButton>
                      </div>
                      <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
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
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <DisclosurePanel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="shrink-0">
                    <div className="size-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.fullName}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <DisclosureButton
                      key={item.name}
                      as={Link}
                      href={item.href}
                      onClick={item.onClick}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </DisclosureButton>
                  ))}
                </div>
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Dynamic Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{currentPage}</h1>

          {/* Conditionally add an "Add" button for My Sessions, My Subjects, My Batches */}
          {user.userType === 'professor' && ['My Sessions', 'My Subjects', 'My Batches'].includes(currentPage) && (
            <Link
              href={{
                'My Sessions': '/sessions/add-session',
                'My Subjects': '/subjects/add-subject',
                'My Batches': '/batches/add-batch'
              }[currentPage] || '#'}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add {currentPage.split(' ')[1]}
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Your page content */}
      </main>
    </div>
  );
}