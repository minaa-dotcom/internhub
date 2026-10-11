"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react"
import API_URL from "@/lib/api"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`)
      const data = await response.json()

      if (response.ok) {
        if (data.alreadyVerified) {
          setStatus('already-verified')
          setMessage('Your email is already verified!')
        } else {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
        }
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to verify email. The link may be invalid or expired.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('An error occurred while verifying your email. Please try again.')
    }
  }

  const handleGoToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center">
            {/* Icon */}
            <div className="mb-6">
              {status === 'loading' && (
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              )}
              {status === 'already-verified' && (
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-blue-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {status === 'loading' && 'Verifying Your Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'already-verified' && 'Already Verified'}
              {status === 'error' && 'Verification Failed'}
            </h1>

            {/* Message */}
            <p className={`text-base mb-6 ${
              status === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {message}
            </p>

            {/* Action Buttons */}
            {(status === 'success' || status === 'already-verified') && (
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/signup')}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  Return to Signup
                </Button>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === 'loading' && (
              <p className="text-sm text-gray-500">
                Please wait while we verify your email address...
              </p>
            )}
          </div>

          {/* Help Text */}
          {status !== 'loading' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  {status === 'error' 
                    ? 'If you continue to have problems, please contact support or request a new verification email.'
                    : 'You can now log in to your InternHub account and start exploring internship opportunities!'
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

import { Suspense } from "react"
