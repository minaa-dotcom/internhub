"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import API_URL from "@/lib/api"
import { Mail, Lock, ArrowRight, Briefcase, GraduationCap, Building2, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

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

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  // Handle password change with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (value) {
      const validation = validatePassword(value)
      setPasswordError(validation.message)
    } else {
      setPasswordError("")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
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

    setIsLoading(true)

    // Open the window immediately on user gesture (before async) to avoid popup blocker
    const newTab = window.open("", "_blank")

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Login failed")
        newTab?.close()
        setIsLoading(false)
        return
      }
      localStorage.setItem("token", data.token)

      const userRole = data.user?.role || "university"
      let dashboardUrl = "/dashboard/university"
      if (userRole === "company") dashboardUrl = "/dashboard/company"
      else if (userRole === "admin") dashboardUrl = "/dashboard/admin"
      else if (userRole === "student") dashboardUrl = "/dashboard/student"

      if (newTab) {
        newTab.location.href = dashboardUrl
      } else {
        window.open(dashboardUrl, "_blank")
      }
      
      setIsLoading(false)
    } catch {
      setError("Something went wrong")
      newTab?.close()
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500 animate-gradient-xy"></div>
      
      {/* Animated Floating Shapes */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-rose-400/20 rounded-full blur-2xl animate-pulse"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:flex flex-col space-y-8 text-white">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100 drop-shadow-2xl">
              InternHub
            </h1>
            <p className="text-2xl font-light text-white/90 drop-shadow-lg">
              Your Gateway to Professional Excellence
            </p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="bg-orange-500/80 p-3 rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Companies</h3>
                <p className="text-white/80 text-sm">Find talented interns and manage internship programs</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="bg-purple-500/80 p-3 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">For Universities</h3>
                <p className="text-white/80 text-sm">Connect students with real-world opportunities</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="bg-rose-500/80 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-white/80 text-sm">Advanced security with role-based access control</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          {/* Glassmorphism Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-rose-500 p-4 rounded-2xl mb-4 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-gray-500 mt-2">Sign in to continue to InternHub</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors ${
                      emailError ? "text-red-500" : "text-gray-400 group-focus-within:text-orange-500"
                    }`} />
                  </div>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-300 ${
                      emailError 
                        ? "border-red-300 focus:ring-2 focus:ring-red-500" 
                        : "border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      passwordError ? "text-red-500" : "text-gray-400 group-focus-within:text-orange-500"
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className={`w-full pl-12 pr-20 py-3 bg-gray-50 border rounded-xl focus:outline-none transition-all duration-300 ${
                      passwordError 
                        ? "border-red-300 focus:ring-2 focus:ring-red-500" 
                        : "border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                {passwordError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> {passwordError}
                  </p>
                )}
                {password && !passwordError && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span>✓</span> Strong password
                  </p>
                )}
                {/* Password Requirements */}
                {password && passwordError && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
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

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Sign up here
                </a>
              </p>
            </div>
          </div>

          {/* Mobile Branding */}
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
