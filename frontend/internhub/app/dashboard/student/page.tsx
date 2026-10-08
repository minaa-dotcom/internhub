"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Building2, GraduationCap, Info } from 'lucide-react'

export default function StudentDashboard() {
  const router = useRouter()
  
  // Uncomment this if you want to redirect students away from this page
  // useEffect(() => {
  //   router.push('/auth/login')
  // }, [router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Student Management
          </h1>
          
          {/* Main Message */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Students are Managed by Universities
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  In InternHub's current implementation, student internship applications and progress 
                  are managed by their respective universities. This reflects the real-world internship 
                  process where universities coordinate and oversee their students' internship experiences.
                </p>
              </div>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
              How the System Works
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Universities Apply */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Universities Apply</h4>
                <p className="text-sm text-gray-600">
                  University officers apply students to internship positions on behalf of their students
                </p>
              </div>
              
              {/* Companies Review */}
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border border-orange-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Companies Review</h4>
                <p className="text-sm text-gray-600">
                  Companies review applications and accept students for internship positions
                </p>
              </div>
              
              {/* Universities Track */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">Universities Track</h4>
                <p className="text-sm text-gray-600">
                  University advisors monitor student progress, attendance, and performance
                </p>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-800 mb-4 text-center">What Universities Can Do</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Apply students to internship opportunities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Assign academic advisors to monitor students</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Track student progress and attendance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">Submit evaluations and performance reports</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <span className="text-gray-700">View all student applications and their statuses</span>
              </li>
            </ul>
          </div>
          
          {/* Future Enhancement Note */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Future Enhancement
            </h3>
            <p className="text-gray-700 text-sm">
              A dedicated student portal is planned for the next phase, where students will be able 
              to log in directly to view their progress, communicate with mentors, submit reports, 
              and track their internship journey in real-time.
            </p>
          </div>
          
          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
