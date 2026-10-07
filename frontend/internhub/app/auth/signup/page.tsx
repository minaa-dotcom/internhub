"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import API_URL from "@/lib/api"
import Link from "next/link"
import { Mail, Lock, Building2, GraduationCap, UserPlus, ArrowRight, Briefcase } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("company")
  const [organizationName, setOrganizationName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  const showNameField = role === "university" || role === "company"
  const nameLabel = role === "university" ? "University Name" : "Company Name"
  const namePlaceholder = role === "university" ? "e.g. University of Malaya" : "e.g. Acme Corporation"

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Strong password validation
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters" }
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" }
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one special character" }
    }
    return { isValid: true, message: "" }
  }

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (value) {
      const validation = validatePassword(value)
      setPasswordError(validation.message)
    } else {
      setPasswordError("")
    }
    
    // Check confirm password match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
    } else {
      setConfirmPasswordError("")
    }
  }

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (value && value !== password) {
      setConfirmPasswordError("Passwords do not match")
    } else {
      setConfirmPasswordError("")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }
    
    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message)
      return
    }
    
    // Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    setIsLoading(true)
    
    try {
      const body: Record<string, string> = { email, password, role }
      if (showNameField) body.organization_name = organizationName.trim()
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { 
        setError(data.message || "Signup failed")
        setIsLoading(false)
        return 
      }
      router.push("/auth/login")
    } catch {
      setError("Something went wrong")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-rose-400 to-orange-400 animate-gradient-xy"></div>
      
      {/* Animated Floating Shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl animate-pulse"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Features */}
        <div className="hidden lg:flex flex-col space-y-8 text-white">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100 drop-shadow-2xl">
              Join InternHub
            </h1>
            <p className="text-2xl font-light text-white/90 drop-shadow-lg">
              Start Your Journey Today
            </p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-orange-500 to-rose-500 p-3 rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Registration</h3>
                <p className="text-white/80 text-sm">Quick and simple signup process in minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Powerful Features</h3>
                <p className="text-white/80 text-sm">Complete internship management tools</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-3 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Trusted Platform</h3>
                <p className="text-white/80 text-sm">Join hundreds of companies and universities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          {/* Glassmorphism Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-purple-500 to-rose-500 p-4 rounded-2xl mb-4 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-gray-500 mt-2">Get started with InternHub today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setRole("company"); setOrganizationName("") }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                      role === "company" 
                        ? "border-orange-500 bg-orange-50 text-orange-700" 
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                    <span className="text-sm font-medium">Company</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole("university"); setOrganizationName("") }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                      role === "university" 
                        ? "border-purple-500 bg-purple-50 text-purple-700" 
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <GraduationCap className="w-6 h-6" />
                    <span className="text-sm font-medium">University</span>
                  </button>
                </div>
              </div>

              {/* Organization Name */}
              {showNameField && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{nameLabel}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {role === "university" ? (
                        <GraduationCap className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                      ) : (
                        <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={namePlaceholder}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors ${
                      emailError ? "text-red-500" : "text-gray-400 group-focus-within:text-purple-500"
                    }`} />
                  </div>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-300 ${
                      emailError 
                        ? "border-red-300 focus:ring-2 focus:ring-red-500" 
                        : "border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    }`}
                    value={email}
                    onChange={handleEmailChange}
                  />
                  {email && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {emailError ? (
                        <span className="text-red-500 text-xl">✕</span>
                      ) : (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> {emailError}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${
                      passwordError ? "text-red-500" : "text-gray-400 group-focus-within:text-purple-500"
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                    className={`w-full pl-12 pr-20 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-300 ${
                      passwordError 
                        ? "border-red-300 focus:ring-2 focus:ring-red-500" 
                        : "border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    }`}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-xs">{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
                    <ul className="text-xs space-y-1">
                      <li className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                        {password.length >= 8 ? "✓" : "○"} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                        {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter (A-Z)
                      </li>
                      <li className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                        {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter (a-z)
                      </li>
                      <li className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
                        {/[0-9]/.test(password) ? "✓" : "○"} One number (0-9)
                      </li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : "text-gray-500"}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "○"} One special character (!@#$%...)
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${
                      confirmPasswordError ? "text-red-500" : "text-gray-400 group-focus-within:text-purple-500"
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-300 ${
                      confirmPasswordError 
                        ? "border-red-300 focus:ring-2 focus:ring-red-500" 
                        : "border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    }`}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  {confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {confirmPasswordError ? (
                        <span className="text-red-500 text-xl">✕</span>
                      ) : (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                  )}
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> {confirmPasswordError}
                  </p>
                )}
                {confirmPassword && !confirmPasswordError && password === confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span>✓</span> Passwords match
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  required
                  className="w-4 h-4 mt-1 text-purple-600 rounded focus:ring-purple-500"
                />
                <label className="text-xs text-gray-600">
                  I agree to the <a href="#" className="text-purple-600 hover:underline">Terms of Service</a> and <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-8 text-center text-white">
            <p className="text-sm opacity-80">© 2024 InternHub. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-size: 400% 400%;
            background-position: 0% 50%;
          }
          50% {
            background-size: 200% 200%;
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
