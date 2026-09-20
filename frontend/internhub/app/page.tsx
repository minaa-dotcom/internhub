// app/page.tsx - Landing Page with Background Image
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                InternHub
              </span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-100 hover:text-orange-700">
                Home
              </Link>
              <Link href="/about" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-100 hover:text-orange-700">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-100 hover:text-orange-700">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                href="/auth/login" 
                className="px-4 py-2 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                Login
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Section with Background Image */}
      <section 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Content Container with Expanded Padding */}
        <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 py-32 md:py-40 text-center">
          <h1 className="text-2xl md:text-7xl font-bold text-white mb-8 leading-tight">
           Internship Management <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">Platform</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            The ultimate platform connecting students, universities, and companies for successful internship experiences
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              href="/auth/signup" 
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold text-lg shadow-2xl hover:shadow-orange-500/30 transition-all duration-300"
            >
              Get Started Free
            </Link>
            <Link 
              href="/auth/login" 
              className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 font-semibold text-lg transition-all duration-300"
            >
              Explore Platform
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Choose Your Role
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Experience tailored features designed specifically for your needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-6 text-center">👨‍🎓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Student</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Find internship opportunities
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Track application progress
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Manage evaluations
                </li>
              </ul>
              <Link 
                href="/auth/login?role=student" 
                className="block w-full py-3 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 font-semibold"
              >
                Student Login →
              </Link>
            </div>

            {/* University Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-6 text-center">🏛️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">University</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Manage student applications
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Assign advisors
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Review evaluations
                </li>
              </ul>
              <Link 
                href="/auth/login?role=university" 
                className="block w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-center hover:from-orange-600 hover:to-orange-700 font-semibold"
              >
                University Login →
              </Link>
            </div>

            {/* Company Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="text-5xl mb-6 text-center">🏢</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Company</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Post internship opportunities
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Review applications
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Manage intern progress
                </li>
              </ul>
              <Link 
                href="/auth/login?role=company" 
                className="block w-full py-3 bg-green-500 text-white rounded-lg text-center hover:bg-green-600 font-semibold"
              >
                Company Login →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-700">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-700">Partner Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">30+</div>
              <div className="text-gray-700">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-700">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-bold text-white">InternHub</span>
              </Link>
              <p className="text-gray-400">Connecting talent with opportunity</p>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2024 InternHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}