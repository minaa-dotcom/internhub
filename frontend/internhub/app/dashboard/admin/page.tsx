"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../components/sidebar/AdminSidebar"
import { ADMIN_ENDPOINTS, getAuthHeaders } from "@/lib/apiConfig"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Building2, 
  GraduationCap, 
  MessageSquare,
  TrendingUp,
  Activity,
  UserCheck,
  Briefcase,
  BarChart3,
  PieChart,
  TrendingDown,
  Award,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Download
} from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    companies: 0,
    universities: 0,
    students: 0,
    mentors: 0,
    advisors: 0,
    messages: 0,
    applications: 0
  })
  const [activities, setActivities] = useState<any[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchRecentActivities()
    fetchAdvancedAnalytics()
    const interval = setInterval(() => {
      fetchStats()
      fetchRecentActivities()
      fetchAdvancedAnalytics()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchRecentActivities = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(ADMIN_ENDPOINTS.ACTIVITIES, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()
      if (data.success) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  const fetchAdvancedAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }

      const response = await fetch(`${ADMIN_ENDPOINTS.STATS.replace('/stats', '/analytics')}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const getActivityColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      red: 'bg-red-500'
    }
    return colors[color] || 'bg-gray-500'
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('No authentication token found')
        setStatsLoading(false)
        return
      }

      console.log('Fetching admin stats from:', ADMIN_ENDPOINTS.STATS)

      const response = await fetch(ADMIN_ENDPOINTS.STATS, {
        headers: getAuthHeaders()
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Error response:', errorData)
        
        if (response.status === 401) {
          setError('Session expired. Please login again.')
          return
        }
        
        if (response.status === 403) {
          setError('Access denied. Admin privileges required.')
          return
        }
        
        throw new Error(errorData.message || 'Failed to fetch stats')
      }
      
      const data = await response.json()
      console.log('Stats fetched successfully:', data)
      
      setStats({
        totalUsers: parseInt(data.stats.total_users) || 0,
        companies: parseInt(data.stats.companies) || 0,
        universities: parseInt(data.stats.universities) || 0,
        students: parseInt(data.stats.students) || 0,
        mentors: parseInt(data.stats.mentors) || 0,
        advisors: parseInt(data.stats.advisors) || 0,
        messages: parseInt(data.stats.messages) || 0,
        applications: parseInt(data.stats.applications) || 0
      })
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      setError(error.message || 'Failed to load statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-purple-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-900">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            System overview and management
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null)
                  fetchStats()
                  fetchRecentActivities()
                }}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="border-gray-200 animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-5 w-5 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">{/* Stats Grid */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-purple-700">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">+12% this month</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-orange-700">
                Companies
              </CardTitle>
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-orange-900">{stats.companies}</p>
              <p className="text-xs text-green-600 mt-1">+3 new</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">
                Universities
              </CardTitle>
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.universities}</p>
              <p className="text-xs text-green-600 mt-1">+2 new</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-700">
                Students
              </CardTitle>
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.students}</p>
              <p className="text-xs text-green-600 mt-1">+45 this week</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-indigo-700">
                Mentors
              </CardTitle>
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-indigo-900">{stats.mentors}</p>
              <p className="text-xs text-gray-500 mt-1">Active</p>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-teal-700">
                Advisors
              </CardTitle>
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-teal-900">{stats.advisors}</p>
              <p className="text-xs text-gray-500 mt-1">Active</p>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-pink-700">
                Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-pink-900">{stats.messages}</p>
              <p className="text-xs text-gray-500 mt-1">Total sent</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-yellow-700">
                Applications
              </CardTitle>
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.applications}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-purple-700 flex items-center gap-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-2" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.color)} mt-2 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activities</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-purple-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Server Load</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Database Usage</span>
                    <span className="font-medium">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Response Time</span>
                    <span className="font-medium text-green-600">Fast (120ms)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced System Analytics - Recommended Features */}
        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg text-purple-700 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                System Analytics & Recommended Features
              </CardTitle>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-3 py-1 text-xs font-medium bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors"
              >
                {showAnalytics ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {showAnalytics && (
              <div className="space-y-6">
                {/* Application Analytics */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Application Analytics
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-xs text-green-600">Accepted</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-2">
                        {analytics?.applications?.accepted || 0}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {analytics?.applications?.acceptanceRate || 0}% acceptance rate
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className="text-xs text-yellow-600">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900 mt-2">
                        {analytics?.applications?.pending || 0}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Awaiting review</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-xs text-red-600">Rejected</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900 mt-2">
                        {analytics?.applications?.rejected || 0}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {analytics?.applications?.rejectionRate || 0}% rejection rate
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommended Features */}
                <div>
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Recommended Features to Add
                  </h3>
                  <div className="space-y-3">
                    {/* Feature 1 */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="mt-0.5">
                        <PieChart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900">
                          📊 Interactive Charts & Graphs
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          Add visual charts showing application trends, user growth over time, and department-wise statistics using libraries like Chart.js or Recharts
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          High Priority
                        </span>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="mt-0.5">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-900">
                          📈 Real-time Notifications System
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          Implement real-time notifications for new applications, status changes, and messages using WebSocket or Server-Sent Events (SSE)
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Medium Priority
                        </span>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="mt-0.5">
                        <Download className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-purple-900">
                          📥 Bulk Operations & Data Export
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          Enable bulk actions (accept/reject multiple applications), export detailed reports in PDF/Excel format with filters and date ranges
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          High Priority
                        </span>
                      </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="mt-0.5">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-orange-900">
                          💬 Email Templates & Automation
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          Create customizable email templates for acceptance/rejection letters, automatic reminders for pending applications, and welcome emails
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                          Medium Priority
                        </span>
                      </div>
                    </div>

                    {/* Feature 5 */}
                    <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="mt-0.5">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-teal-900">
                          👥 Advanced User Management
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          Add user roles & permissions management, activity logs, account suspension/reactivation, and bulk user import from CSV/Excel
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">
                          High Priority
                        </span>
                      </div>
                    </div>

                    {/* Feature 6 */}
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="mt-0.5">
                        <Activity className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-indigo-900">
                          🔍 Advanced Search & Filters
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          Implement advanced search with multiple filters (date range, department, status, university), saved search filters, and full-text search
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                          Medium Priority
                        </span>
                      </div>
                    </div>

                    {/* Feature 7 */}
                    <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="mt-0.5">
                        <Calendar className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-pink-900">
                          📅 Interview Scheduling System
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          Built-in calendar for scheduling interviews, automatic email invites with calendar links, video call integration (Zoom/Google Meet)
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">
                          Low Priority
                        </span>
                      </div>
                    </div>

                    {/* Feature 8 */}
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="mt-0.5">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-900">
                          🎯 Smart Matching Algorithm
                        </h4>
                        <p className="text-xs text-gray-700 mt-1">
                          AI-powered matching between students and companies based on skills, interests, company requirements, and past acceptance patterns
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                          Future Enhancement
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Debug Tools Info */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    🛠️ Developer Tools
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-700 mb-2">
                      <strong>Chrome DevTools</strong> is essential for development and debugging:
                    </p>
                    <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                      <li><strong>Console:</strong> View errors, API responses, and debug logs (Press F12)</li>
                      <li><strong>Network Tab:</strong> Monitor API calls, response times, and failed requests</li>
                      <li><strong>Elements Tab:</strong> Inspect and modify HTML/CSS in real-time</li>
                      <li><strong>Application Tab:</strong> View localStorage, cookies, and session data</li>
                      <li><strong>Performance:</strong> Identify slow components and optimize loading times</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-3 font-medium">
                      💡 Tip: Press F12 or Right-click → Inspect to open DevTools in Chrome/Edge
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!showAnalytics && (
              <div className="text-center py-6 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click "Show Details" to view advanced analytics and recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
