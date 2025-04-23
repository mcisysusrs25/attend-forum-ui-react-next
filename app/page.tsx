"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  image: string;
}

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === 5 ? 0 : prev + 1)); // 6 images (0-5)
    }, 5000); // Change slide every 5 seconds for better viewing experience

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Custom testimonials (you can replace these with real ones)
  const testimonials = [
    {
      quote: "AttendForum has completely transformed how I manage class attendance. The geolocation feature ensures students are actually present.",
      author: "Dr. Sarah Johnson",
      role: "Professor of Computer Science",
      image: "/logo.svg" // Fallback to logo if no images available
    },
    {
      quote: "The analytics dashboard gives me valuable insights into attendance patterns. I can identify at-risk students before it becomes a problem.",
      author: "Prof. Michael Chang",
      role: "Department Chair, Business School",
      image: "/logo.svg"
    },
    {
      quote: "Setting up my classes takes minutes, not hours. The intuitive interface makes it easy to configure even complex class schedules.",
      author: "Dr. Emily Rodriguez",
      role: "Associate Professor, Engineering",
      image: "/logo.svg"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Hero Section */}
      <header className="relative mx-auto">
        {/* Sticky Navbar - Enhanced */}
        <nav className="sticky top-0 z-50 px-6 py-4 backdrop-blur-md bg-white/90 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-[#6768EE]/10 p-2 rounded-xl">
                <Image
                  src="/logo-color.png"
                  alt="AttendForum Logo"
                  width={32}
                  height={40}
                  className="mr-2"
                />
              </div>
              <div className="flex flex-col ml-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AttendForum</h1>
                <p className="text-sm text-[#6768EE]/80">The attendance app</p>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="#features" label="Home" />
              <NavLink href="#features" label="Features" />
              <NavLink href="#how-it-works" label="How it Works" />
              <NavLink href="https://mcisysusrs25.github.io/attendforumstudent/auth.html" label="Student Login" />
              <NavLink href="/auth/login" label="Faculty Login" />
            </div>
            
            <div className="hidden md:block">
              <Link href="/signup">
                <button className="bg-[#6768EE] text-white px-6 py-2.5 rounded-full hover:bg-[#5758DF] transition-all duration-300 shadow-lg hover:shadow-[#6768EE]/30 font-medium">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6 space-y-3 border-t border-gray-100">
              <a href="#features" className="block py-2 text-gray-700 hover:text-[#6768EE] transition">Home</a>
              <a href="#features" className="block py-2 text-gray-700 hover:text-[#6768EE] transition">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-700 hover:text-[#6768EE] transition">How it Works</a>
              <a href="https://mcisysusrs25.github.io/attendforumstudent/auth.html" className="block py-2 text-gray-700 hover:text-[#6768EE] transition">Student Login</a>
              <a href="/auth/login" className="block py-2 text-gray-700 hover:text-[#6768EE] transition">Faculty Login</a>
              <Link href="/signup">
                <button className="w-full mt-3 bg-[#6768EE] text-white px-6 py-2.5 rounded-full hover:bg-[#5758DF] transition font-medium">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </nav>

        {/* Hero Section - Enhanced Layout */}
        <div className="container mx-auto px-6 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span 
                className="inline-block px-4 py-1.5 rounded-full bg-[#6768EE]/10 text-[#6768EE] font-medium text-sm mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                The Future of Attendance Management
              </motion.span>
              
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Attendance Tracking <span className="text-[#6768EE]">Reimagined</span>
              </motion.h2>
              
              <motion.p
                className="text-xl text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Effortlessly manage class attendance with geolocation validation, real-time tracking, and customizable configurations. Save time and increase accuracy with our intuitive platform.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/auth/login">
                  <button className="bg-[#6768EE] text-white px-8 py-3.5 rounded-full hover:bg-[#5758DF] transition-all duration-300 shadow-lg hover:shadow-[#6768EE]/30 text-lg font-medium">
                    Login / Sign Up as Faculty
                  </button>
                </Link>
                <Link href="https://mcisysusrs25.github.io/attendforumstudent/auth.html">
                  <button className="bg-white text-[#6768EE] border border-[#6768EE] px-8 py-3.5 rounded-full hover:bg-[#6768EE]/5 transition-all duration-300 text-lg font-medium">
                    Sign up as Student
                  </button>
                </Link>
              </motion.div>
              
              <motion.div 
                className="mt-12 flex items-center gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#6768EE]">99.9%</span>
                  <span className="text-gray-500 text-sm">Accuracy Rate</span>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#6768EE]">98%</span>
                  <span className="text-gray-500 text-sm">Time Saved</span>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#6768EE]">100K+</span>
                  <span className="text-gray-500 text-sm">Users</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Carousel - Enhanced */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#6768EE]/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-100 rounded-full blur-xl"></div>
                
                <div className="relative">
                  {/* Glass effect frame */}
                  <div className="absolute inset-0 border border-white/20 rounded-2xl backdrop-blur-sm bg-white/10 shadow-2xl transform rotate-1"></div>
                  
                  <div className="carousel rounded-2xl shadow-2xl overflow-hidden relative bg-white border border-gray-100">
                    <div
                      className="carousel-inner flex transition-transform duration-700 ease-out"
                      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((index) => (
                        <div key={index} className="carousel-item w-full flex-shrink-0 relative">
                          <Image
                            src={`/dashboard-${index}.png`}
                            alt={`Dashboard Preview ${index}`}
                            width={800}
                            height={390}
                            className="w-full h-auto"
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-50"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Dot Indicators */}
                <div className="flex justify-center mt-6 space-x-2">
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-[#6768EE] w-8' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stats Section - New */}
      <section className="bg-[#6768EE]/5 py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="50+" label="Universities" />
            <StatItem number="2000+" label="Professors" />
            <StatItem number="35K+" label="Students" />
            <StatItem number="1M+" label="Sessions" />
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#6768EE]/10 text-[#6768EE] font-medium text-sm mb-4">
              Powerful Tools
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Features Designed for Educators</h2>
            <p className="text-lg text-gray-600">Comprehensive tools to simplify attendance tracking and enhance your classroom experience.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCardEnhanced
              icon="🏫"
              title="Class Configuration"
              description="Create custom class configurations with location data, labels, subjects, and batches."
              delay={0}
            />
            <FeatureCardEnhanced
              icon="📱"
              title="QR Attendance"
              description="Generate and share unique QR codes with students for quick and secure check-ins."
              delay={1}
            />
            <FeatureCardEnhanced
              icon="📍"
              title="Geolocation Validation"
              description="Verify student presence with precise geolocation data to prevent proxy attendance."
              delay={2}
            />
            <FeatureCardEnhanced
              icon="📊"
              title="Real-time Analytics"
              description="Monitor attendance trends and get insights with real-time data visualization."
              delay={3}
            />
            <FeatureCardEnhanced
              icon="🔔"
              title="Automated Notifications"
              description="Send automated alerts to students about upcoming sessions and missed classes."
              delay={4}
            />
            <FeatureCardEnhanced
              icon="📅"
              title="Scheduling"
              description="Plan and schedule recurring or one-time attendance sessions with ease."
              delay={5}
            />
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-indigo-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#6768EE]/10 text-[#6768EE] font-medium text-sm mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get up and running in minutes with our intuitive platform.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCardEnhanced
              number="1"
              title="Configure Your Class"
              description="Set up your class with location, subject details, and student batches."
              delay={0}
            />
            <StepCardEnhanced
              number="2"
              title="Create Attendance Session"
              description="Generate a new session for taking attendance with custom parameters."
              delay={1}
            />
            <StepCardEnhanced
              number="3"
              title="Share QR Code"
              description="Students scan the QR code with their device to check in."
              delay={2}
            />
            <StepCardEnhanced
              number="4"
              title="Track Results"
              description="View real-time attendance data and analytics on your dashboard."
              delay={3}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section - New */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#6768EE]/10 text-[#6768EE] font-medium text-sm mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Educators Say</h2>
            <p className="text-lg text-gray-600">Trusted by professors and educational institutions around the world.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                image={testimonial.image}
                delay={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-24 bg-gradient-to-r from-[#6768EE] to-indigo-700 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Attendance Management?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">Join thousands of educators who are saving time and improving accuracy with AttendForum.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/login">
                <button className="bg-white text-[#6768EE] px-8 py-3.5 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-black/10 text-lg font-semibold">
                  Start for free
                </button>
              </Link>
              <Link href="#how-it-works">
                <button className="bg-transparent text-white border border-white px-8 py-3.5 rounded-full hover:bg-white/10 transition-all duration-300 text-lg font-semibold">
                  Learn more
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-4">
              <div className="flex items-center mb-6">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Image
                    src="/logo-color.png"
                    alt="AttendForum Logo"
                    width={32}
                    height={40}
                    className="brightness-0 invert"
                  />
                </div>
                <div className="flex flex-col ml-3">
                  <h3 className="text-xl font-bold text-white tracking-tight">AttendForum</h3>
                  <p className="text-sm text-white/60">The attendance app</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing attendance tracking for educational institutions with innovative technology solutions.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><a href="/auth/login" className="text-gray-400 hover:text-white transition">Faculty Login</a></li>
                <li><a href="https://mcisysusrs25.github.io/attendforumstudent/auth.html" className="text-gray-400 hover:text-white transition">Student Login</a></li>
                <li><a href="/signup" className="text-gray-400 hover:text-white transition">Sign Up</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 mb-4 md:mb-0">© 2025 AttendForum Institution Portal. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component for nav links with hover effect
const NavLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <a
      href={href}
      className="px-3 py-2 rounded-lg text-gray-700 hover:text-[#6768EE] hover:bg-[#6768EE]/5 transition-all duration-200 font-medium text-sm"
    >
      {label}
    </a>
  );
};

// Enhanced premium feature card
const FeatureCardEnhanced = ({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) => {
  return (
    <motion.div
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
      whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#6768EE]/5 rounded-full group-hover:bg-[#6768EE]/10 transition-all duration-300"></div>
      <div className="text-4xl mb-6 bg-[#6768EE]/10 h-16 w-16 flex items-center justify-center rounded-2xl">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

// Enhanced premium step card
const StepCardEnhanced = ({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) => {
  return (
    <motion.div
      className="bg-white p-8 rounded-2xl shadow-lg relative border border-gray-100 overflow-hidden group z-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        borderColor: "rgba(103, 104, 238, 0.3)"
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6768EE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      
      {/* Connected line to next step (except for the last one) */}
      {number !== "4" && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200 z-0"></div>
      )}
      
      <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-[#6768EE] flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-[#6768EE]/30 transition-all duration-300 group-hover:scale-110">
        {number}
      </div>
      
      <div className="pt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Premium testimonial card
const Testimonial = ({ quote, author, role, image, delay }: TestimonialProps & { delay: number }) => {
  return (
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        y: -5
      }}
    >
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#6768EE]/5 rounded-full group-hover:bg-[#6768EE]/10 transition-all duration-300"></div>
      
      {/* Quote icon */}
      <svg className="w-10 h-10 text-[#6768EE]/20 mb-4" fill="currentColor" viewBox="0 0 32 32">
        <path d="M10 8c-4.418 0-8 3.582-8 8s3.582 8 8 8c4.418 0 8-3.582 8-8s-3.582-8-8-8zM10 22c-3.314 0-6-2.686-6-6s2.686-6 6-6c3.314 0 6 2.686 6 6s-2.686 6-6 6zM24 8c-4.418 0-8 3.582-8 8s3.582 8 8 8c4.418 0 8-3.582 8-8s-3.582-8-8-8zM24 22c-3.314 0-6-2.686-6-6s2.686-6 6-6c3.314 0 6 2.686 6 6s-2.686 6-6 6z"></path>
      </svg>
      
      <p className="text-gray-700 mb-6 relative z-10">{quote}</p>
      
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <div className="w-12 h-12 rounded-full bg-[#6768EE]/10 flex items-center justify-center">
            <Image src={image} alt={author} width={32} height={32} className="rounded-full" />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{author}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Stats item
const StatItem = ({ number, label }: { number: string, label: string }) => {
  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-3xl md:text-4xl font-bold text-[#6768EE] mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </motion.div>
  );
};

export default LandingPage;