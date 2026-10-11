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
  XCircle
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

        {/* System Analytics Section */}
        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg text-purple-700 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              System Analytics
            </CardTitle>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              {showAnalytics ? 'Hide Details' : 'View Details'}
              <BarChart3 className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            {showAnalytics ? (
              analyticsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading analytics...</p>
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Application Success Metrics */}
                  {analytics.applicationMetrics && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        Application Success Rates
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600">Acceptance Rate</p>
                          <p className="text-2xl font-bold text-green-600">
                            {analytics.applicationMetrics.acceptance_rate || 0}%
                          </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-200">
                          <p className="text-xs text-gray-600">Rejection Rate</p>
                          <p className="text-2xl font-bold text-red-600">
                            {analytics.applicationMetrics.rejection_rate || 0}%
                          </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600">This Week</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {analytics.applicationMetrics.applications_this_week || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200">
                          <p className="text-xs text-gray-600">This Month</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {analytics.applicationMetrics.applications_this_month || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Performing Companies */}
                  {analytics.topCompanies && analytics.topCompanies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4 text-orange-600" />
                        Top Companies (Most Applications)
                      </h3>
                      <div className="space-y-2">
                        {analytics.topCompanies.slice(0, 5).map((company: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-orange-600">#{index + 1}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{company.company_name}</p>
                                <p className="text-xs text-gray-600">{company.total_applications} applications</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">{company.acceptance_rate}% accepted</p>
                              <p className="text-xs text-gray-500">{company.pending_applications} pending</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Most Active Universities */}
                  {analytics.topUniversities && analytics.topUniversities.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        Most Active Universities
                      </h3>
                      <div className="space-y-2">
                        {analytics.topUniversities.slice(0, 5).map((university: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{university.university_name}</p>
                                <p className="text-xs text-gray-600">{university.total_applications} applications sent</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600">{university.success_rate}% success</p>
                              <p className="text-xs text-gray-500">{university.pending_applications} pending</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Department Distribution */}
                  {analytics.departmentDistribution && analytics.departmentDistribution.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-indigo-600" />
                        Applications by Department
                      </h3>
                      <div className="space-y-2">
                        {analytics.departmentDistribution.slice(0, 5).map((dept: any, index: number) => (
                          <div key={index} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium text-gray-900">{dept.department}</p>
                              <p className="text-sm font-semibold text-indigo-600">{dept.application_count} apps</p>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                {dept.accepted} accepted
                              </span>
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                <XCircle className="h-3 w-3 inline mr-1" />
                                {dept.rejected} rejected
                              </span>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {dept.pending} pending
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Growth Trends */}
                  {analytics.growthTrends && analytics.growthTrends.summary && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Platform Growth (Last 30 Days)
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Total New Users</p>
                          <p className="text-3xl font-bold text-green-600">
                            {analytics.growthTrends.summary.total_new_users_30d || 0}
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 mb-1">Avg. Daily Registrations</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {analytics.growthTrends.summary.avg_daily_registrations || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Response Time Metrics */}
                  {analytics.responseTimeMetrics && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        Application Response Times
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-xs text-gray-600">Avg. Response</p>
                          <p className="text-xl font-bold text-yellow-600">
                            {analytics.responseTimeMetrics.avg_response_hours || 0}h
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600">Within 24h</p>
                          <p className="text-xl font-bold text-green-600">
                            {analytics.responseTimeMetrics.responded_within_24h || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600">Total Responded</p>
                          <p className="text-xl font-bold text-blue-600">
                            {analytics.responseTimeMetrics.total_responded || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Platform Health */}
                  {analytics.platformHealth && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-600" />
                        Platform Health & Activity
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600">Active Users</p>
                          <p className="text-xl font-bold text-green-600">
                            {analytics.platformHealth.active_users || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600">Verified Users</p>
                          <p className="text-xl font-bold text-blue-600">
                            {analytics.platformHealth.verified_users || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs text-gray-600">Messages (24h)</p>
                          <p className="text-xl font-bold text-purple-600">
                            {analytics.platformHealth.messages_24h || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No analytics data available</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-purple-300" />
                <p className="text-gray-600 mb-4">Click "View Details" to see comprehensive analytics</p>
                <ul className="text-sm text-left max-w-md mx-auto space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Application success rates and trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Top performing companies and universities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Department-wise application distribution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Platform growth and engagement metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Response time analytics</span>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

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
      </main>
    </div>
  )
}
