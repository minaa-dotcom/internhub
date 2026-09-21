// app/page.tsx - Landing Page with Background Image
import Link from 'next/link';

export default function LandingPage() {
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

      {/* Welcome Section with Background Image */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/workspace.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        {/* Content Container with Expanded Padding */}
        <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 py-32 md:py-40 text-center relative z-10">

          <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight drop-shadow-2xl">
            <span className="text-white">Empowering </span>
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Future Leaders
            </span>
            <br />
            <span className="text-white">Through </span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Meaningful Internships
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light">
            Where ambition meets opportunity. Connect with top companies, guide talented students, 
            and build the workforce of tomorrow — all in one seamless platform.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link 
              href="/auth/signup" 
              className="px-10 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-600 hover:via-orange-700 hover:to-amber-700 font-semibold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              🚀 Start Your Journey
            </Link>
            <Link 
              href="/auth/login" 
              className="px-10 py-4 bg-white/15 backdrop-blur-md border-2 border-white/40 text-white rounded-xl hover:bg-white/25 font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              ✨ Discover More
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse"></div>
              <span>Real-Time Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse"></div>
              <span>Smart Matching</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 animate-pulse"></div>
              <span>Seamless Collaboration</span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gradient-to-b from-orange-400 to-cyan-400 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Join Our Community
            </span>
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto text-lg">
            Choose your path and unlock powerful tools designed just for you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 border-blue-100 hover:border-blue-300 group">
              <div className="text-6xl mb-6 text-center transform group-hover:scale-110 transition-transform duration-300">👨‍🎓</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 text-center">For Students</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <span>Discover dream internships</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <span>Track your applications</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <span>Grow with mentorship</span>
                </li>
              </ul>
              <Link 
                href="/auth/login?role=student" 
                className="block w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-center hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Launch Student Portal ✨
              </Link>
            </div>

            {/* University Card */}
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 border-orange-100 hover:border-orange-300 group">
              <div className="text-6xl mb-6 text-center transform group-hover:scale-110 transition-transform duration-300">🏛️</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4 text-center">For Universities</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                  <span>Streamline applications</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                  <span>Empower advisors</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
                  <span>Monitor student success</span>
                </li>
              </ul>
              <Link 
                href="/auth/login?role=university" 
                className="block w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-center hover:from-orange-600 hover:to-amber-600 font-semibold shadow-lg hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Access University Hub 🎓
              </Link>
            </div>

            {/* Company Card */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 border-green-100 hover:border-green-300 group">
              <div className="text-6xl mb-6 text-center transform group-hover:scale-110 transition-transform duration-300">🏢</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 text-center">For Companies</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <span>Post opportunities instantly</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <span>Find top talent</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <span>Nurture future leaders</span>
                </li>
              </ul>
              <Link 
                href="/auth/login?role=company" 
                className="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-center hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Open Company Portal 🚀
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
            Trusted by Leading Organizations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">1,000+</div>
              <div className="text-gray-700 font-medium">Active Students</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">150+</div>
              <div className="text-gray-700 font-medium">Partner Companies</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">80+</div>
              <div className="text-gray-700 font-medium">Universities</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">98%</div>
              <div className="text-gray-700 font-medium">Success Rate</div>
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
              <Link href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 font-medium">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 font-medium">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-orange-400 transition-colors duration-300 font-medium">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-500">© 2024 InternHub. All rights reserved. Built with ❤️ for the future workforce.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}