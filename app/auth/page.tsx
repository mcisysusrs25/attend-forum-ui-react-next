"use client"

import { useState } from "react";
import Image from "next/image";

export default function ProfessorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => /@ysu\.edu$/.test(email);

  const handleLogin = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      alert("Please use a @ysu.edu email address");
      return;
    }
    console.log("Logging in with", { email, password });
    // Add authentication logic here
  };

  const handleCreateAccount = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      alert("Please use a @ysu.edu email address");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Creating account with", { firstName, lastName, email, password });
    setIsVerifyingOTP(true);
  };

  const handleVerifyOTP = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("OTP Verified! Redirecting to dashboard...");
      // Redirect logic here
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
        </div>
        {isVerifyingOTP ? (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">OTP Verification</h2>
            <p className="text-center mb-4">You have received an email with a OTP to verify your email address. Please enter it below:</p>
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </>
        ) : isCreatingAccount ? (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>
            <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
              >
                Create Account
              </button>
            </form>
            <p className="text-center mt-4">
              Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => setIsCreatingAccount(false)}>Login</span>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">Professor Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-sm text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </button>
            </form>
            <p className="text-center mt-4">
              New to AttendForum? <span className="text-blue-600 cursor-pointer" onClick={() => setIsCreatingAccount(true)}>Create Account</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
