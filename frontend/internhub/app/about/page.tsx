"use client"

import Link from 'next/link'
import { Target, Users, Award, Zap, Heart, Shield, TrendingUp, Globe } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 bg-clip-text text-transparent">
                InternHub
              </span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className="px-5 py-2.5 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium transition-all duration-300">
                Home
              </Link>
              <Link href="/about" className="px-5 py-2.5 rounded-xl text-orange-600 bg-orange-50 font-medium transition-all duration-300">
                About
              </Link>
              <Link href="/contact" className="px-5 py-2.5 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium transition-all duration-300">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                href="/auth/login" 
                className="px-6 py-2.5 rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 bg-clip-text text-transparent">
              About InternHub
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to bridge the gap between ambitious students and forward-thinking companies, 
            creating meaningful internship experiences that shape tomorrow's workforce.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To empower students with real-world opportunities and equip companies with exceptional talent 
                through a seamless, efficient, and innovative internship management platform that transforms 
                the way organizations and educational institutions collaborate.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Vision</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become the leading internship management platform globally, where every student finds 
                their perfect opportunity, every company discovers outstanding talent, and every university 
                provides exceptional career preparation for their students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Our Core Values
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Excellence */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every feature, interaction, and experience we deliver.
              </p>
            </div>

            {/* Innovation */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate to provide cutting-edge solutions that meet evolving needs.
              </p>
            </div>

            {/* Integrity */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Integrity</h3>
              <p className="text-gray-600">
                We maintain the highest standards of honesty, transparency, and ethical conduct.
              </p>
            </div>

            {/* Collaboration */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Collaboration</h3>
              <p className="text-gray-600">
                We believe in the power of collaboration between students, universities, and companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                What We Do
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive internship management for all stakeholders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <div className="text-5xl mb-4">👨‍🎓</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">For Students</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                  <span>Discover and apply for internships effortlessly</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                  <span>Track application status in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                  <span>Connect with mentors and advisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                  <span>Build professional experience</span>
                </li>
              </ul>
            </div>

            {/* For Universities */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 shadow-lg border border-orange-100">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">For Universities</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                  <span>Manage student applications efficiently</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                  <span>Assign and monitor advisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                  <span>Track student progress and performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                  <span>Generate comprehensive reports</span>
                </li>
              </ul>
            </div>

            {/* For Companies */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">For Companies</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                  <span>Post internship opportunities instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                  <span>Review and manage applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                  <span>Assign mentors to interns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                  <span>Monitor intern progress and provide feedback</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                Our Impact
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">1,000+</div>
              <div className="text-gray-700 font-medium">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">150+</div>
              <div className="text-gray-700 font-medium">Partner Companies</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">80+</div>
              <div className="text-gray-700 font-medium">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">98%</div>
              <div className="text-gray-700 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Internship Management?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students, universities, and companies already using InternHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-gray-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white text-white rounded-xl hover:bg-white/20 font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <Link href="/" className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">I</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">InternHub</span>
              </Link>
              <p className="text-gray-400 text-lg">Connecting talent with opportunity</p>
            </div>
            <div className="flex gap-8">
              <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 font-medium">Home</Link>
              <Link href="/about" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 font-medium">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 font-medium">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-500">© 2024 InternHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
