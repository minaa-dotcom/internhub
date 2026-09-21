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
  Briefcase
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

  useEffect(() => {
    fetchStats()
    fetchRecentActivities()
    const interval = setInterval(() => {
      fetchStats()
      fetchRecentActivities()
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
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found for stats')
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
          console.error('Unauthorized - token may be invalid')
          alert('Your session may have expired. Please try logging out and logging in again.')
          return
        }
        
        if (response.status === 403) {
          console.error('Forbidden - insufficient permissions')
          alert('You do not have permission to view admin stats. Please ensure you are logged in as an admin user.')
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
    } catch (error) {
      console.error('Error fetching stats:', error)
      alert(`Failed to load admin stats: ${error.message || 'Please try again'}`)
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

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
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
