"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Define TypeScript interfaces for props
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const LandingPage = () => {


  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === 5 ? 0 : prev + 1)); // 6 images (0-5)
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [])

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="mx-auto">
        {/* Sticky Navbar */}
        <nav className="sticky top-0 z-50 flex p-5 items-center justify-between shadow-md bg-white">
          <div className="flex items-center">
            <Image
              src="/logo-color.png"
              alt="Professor Portal Logo"
              width={32}
              height={40}
              className="mr-2"
            />
            <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-black">AttendForum</h1>
            <p>The attendance app</p>
            </div>
            
          </div>
          <div className="hidden md:flex items-center space-x-8 text-gray-700">
            <a href="#features" className="hover:text-indigo-600 transition">Home</a>
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition">How it Works</a>
            <a href="https://mcisysusrs25.github.io/attendforumstudent/auth.html" className="hover:text-indigo-600 transition">Student Login</a>
            <a href="/auth/login" className="hover:text-indigo-600 transition">Faculty Login</a>
          </div>
          <div>
            <Link href="/signup">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition shadow-md">
                Get Started
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Section - Column Layout */}
        <div className="flex flex-col items-center text-center p-6 mt-8">
          {/* Text Content */}
          <motion.div
            className="w-full max-w-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Attendance Tracking <span className="text-indigo-600">Reimagined</span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Effortlessly manage class attendance with geolocation validation, real-time tracking, and customizable configurations.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/auth/login">
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition shadow-md text-lg">
                  Login / Sign Up as Faculty
                </button>
              </Link>
              <Link href="https://mcisysusrs25.github.io/attendforumstudent/auth.html">
                <button className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-full hover:bg-blue-50 transition text-lg">
                  Sign up as Student
                </button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="w-full max-w-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="carousel rounded-lg shadow-2xl overflow-hidden relative">
              <div
                className="carousel-inner flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="carousel-item w-full flex-shrink-0">
                    <Image
                      src={`/dashboard-${index}.png`} // Replace with your image paths
                      alt={`Dashboard Preview ${index}`}
                      width={800}
                      height={390}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">Powerful Features for Educators</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🏫"
              title="Class Configuration"
              description="Create custom class configurations with location data, labels, subjects, and batches."
            />
            <FeatureCard
              icon="📱"
              title="QR Attendance"
              description="Generate and share unique QR codes with students for quick and secure check-ins."
            />
            <FeatureCard
              icon="📍"
              title="Geolocation Validation"
              description="Verify student presence with precise geolocation data to prevent proxy attendance."
            />
            <FeatureCard
              icon="📊"
              title="Real-time Analytics"
              description="Monitor attendance trends and get insights with real-time data visualization."
            />
            <FeatureCard
              icon="🔔"
              title="Automated Notifications"
              description="Send automated alerts to students about upcoming sessions and missed classes."
            />
            <FeatureCard
              icon="📅"
              title="Scheduling"
              description="Plan and schedule recurring or one-time attendance sessions with ease."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-4">
            <StepCard
              number="1"
              title="Configure Your Class"
              description="Set up your class with location, subject details, and student batches."
            />
            <StepCard
              number="2"
              title="Create Attendance Session"
              description="Generate a new session for taking attendance with custom parameters."
            />
            <StepCard
              number="3"
              title="Share QR Code"
              description="Students scan the QR code with their device to check in."
            />
            <StepCard
              number="4"
              title="Track Results"
              description="View real-time attendance data and analytics on your dashboard."
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Attendance Management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of educators who are saving time and improving accuracy with Professor Portal.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/auth/login">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-full hover:bg-gray-100 transition shadow-md text-lg font-semibold">
                Start for free
              </button>
            </Link>
          </div>
        </div>
      </section>

    {/* Footer */}
<footer className="bg-gray-900 text-white py-12">
  <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-3 gap-8">
    </div>

    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col items-center justify-center text-center">
      <p className="text-gray-500">© 2025 AttendForum Institution Portal. All rights reserved.</p>
    </div>
  </div>
</footer>

    </div>
  );
};

// Components
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-center"
      whileHover={{ y: -10 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 mt-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

export default LandingPage;