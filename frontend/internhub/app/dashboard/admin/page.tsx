"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../components/sidebar/AdminSidebar"
import API_URL from "@/lib/api"
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

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
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
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">New company registered</p>
                    <p className="text-xs text-gray-600">TechCorp Inc. - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">45 new student applications</p>
                    <p className="text-xs text-gray-600">Various universities - Today</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">System maintenance scheduled</p>
                    <p className="text-xs text-gray-600">Tomorrow at 2:00 AM</p>
                  </div>
                </div>
              </div>
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
