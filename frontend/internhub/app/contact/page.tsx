"use client"

import Link from 'next/link'
import { Mail, Phone, Send, MessageSquare, HelpCircle, Briefcase } from 'lucide-react'

export default function ContactPage() {
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
              <Link href="/about" className="px-5 py-2.5 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium transition-all duration-300">
                About
              </Link>
              <Link href="/contact" className="px-5 py-2.5 rounded-xl text-orange-600 bg-orange-50 font-medium transition-all duration-300">
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
              Get in Touch
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Reach out to us via email or phone.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Email */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Email Us</h3>
              <p className="text-gray-600 mb-6 text-lg">Our team is here to help</p>
              <a 
                href="mailto:minasegirma40@gmail.com" 
                className="inline-block text-blue-600 hover:text-blue-700 font-semibold text-lg mb-4 hover:underline"
              >
                minasegirma40@gmail.com
              </a>
              <div className="mt-6">
                <a
                  href="mailto:minasegirma40@gmail.com"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                  Send Email
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Call Us</h3>
              <p className="text-gray-600 mb-6 text-lg">We're available to talk</p>
              <div className="space-y-3 mb-6">
                <a 
                  href="tel:+251909701943" 
                  className="block text-green-600 hover:text-green-700 font-semibold text-lg hover:underline"
                >
                  +251 909 701 943
                </a>
                <a 
                  href="tel:+251918356227" 
                  className="block text-green-600 hover:text-green-700 font-semibold text-lg hover:underline"
                >
                  +251 918 356 227
                </a>
              </div>
              <div className="mt-6">
                <a
                  href="tel:+251909701943"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </div>
          </div>

          {/* Additional Contact Options */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* FAQ */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">FAQ</h3>
                <p className="text-gray-600 mb-4">
                  Find quick answers to common questions
                </p>
                <Link href="/faq" className="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1">
                  Visit FAQ →
                </Link>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Live Support</h3>
                <p className="text-gray-600 mb-4">
                  Chat with us in real-time for immediate assistance
                </p>
                <a 
                  href="mailto:minasegirma40@gmail.com?subject=Live Support Request" 
                  className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1"
                >
                  Start Chat →
                </a>
              </div>
            </div>

            {/* Enterprise Support */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Enterprise Support</h3>
                <p className="text-gray-600 mb-4">
                  Custom packages for organizations
                </p>
                <a 
                  href="mailto:minasegirma40@gmail.com?subject=Enterprise Support Inquiry" 
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                >
                  Contact Sales →
                </a>
              </div>
            </div>
          </div>

          {/* Response Time Information */}
          <div className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Response Time</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-gray-800 mb-1">Email Support</p>
                  <p className="text-gray-600">We typically respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-gray-800 mb-1">Phone Support</p>
                  <p className="text-gray-600">Available Monday - Friday, 8am-6pm</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-bold text-gray-800 mb-1">Urgent Matters</p>
                  <p className="text-gray-600">Call for immediate assistance</p>
                </div>
              </div>
            </div>
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
