"use client" // Mark this as a Client Component

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()

  // Conditionally render the Navbar
  const showNavbar = !pathname.startsWith('/auth')

  return <>{showNavbar && <Navbar />}</>
}