"use client"

import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Sidebar from "./components/Navbar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { PlusIcon } from "@heroicons/react/24/solid"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  // Mapping routes to dynamic page titles
  const pageTitles: Record<string, string> = {
    "/sessions": "My Sessions",
    "/subjects": "My Subjects",
    "/batches": "My Batches",
    "/config": "My Classes",
  }

  const currentPage = pageTitles[pathname] || "Dashboard"

  // Mocked user (replace with actual user context)
  const user = { userType: "professor" } 

  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-auto`}>
        <div className="flex h-full">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            
            {/* Dynamic Header */}
            <header className="bg-white shadow-lg">
              <div className="px-4 py-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 min-w-0 truncate">
                  {currentPage}
                </h1>

                {/* Conditionally add an "Add" button for specific pages */}
                {user.userType === "professor" && ["My Sessions", "My Subjects", "My Batches", "My Classes"].includes(currentPage) && (
                  <Link
                    href={{
                      "My Sessions": "/sessions/add-session",
                      "My Subjects": "/subjects/add-subject",
                      "My Batches": "/batches/add-batch",
                      "My Classes": "/config/add",
                    }[currentPage] || "#"}
                    className="inline-flex items-center rounded-md bg-indigo-700 px-4 py-2 text-white text-sm font-medium shadow-sm hover:bg-indigo-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add {currentPage.split(" ")[1]}
                  </Link>
                )}
              </div>
            </header>

            {/* Page Content - Enable Scrolling */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full max-w-full p-4">
                {children}
              </div>
            </div>

          </div>
        </div>
      </body>
    </html>
  )
}
