"use client"

import { StudentSidebar } from "../../../components/sidebar/StudentSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, FileText, Calendar, CheckCircle, Clock, Users, Briefcase } from "lucide-react"

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-blue-50">
      <StudentSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
            Student Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here's your internship overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">
                Messages
              </CardTitle>
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold">5</p>
              <p className="text-xs text-gray-500 mt-1">Unread</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">
                Reports
              </CardTitle>
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold">3</p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">
                Tasks
              </CardTitle>
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold">8/12</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">
                Schedule
              </CardTitle>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold">4</p>
              <p className="text-xs text-gray-500 mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-blue-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Mentor - John Smith</p>
                    <p className="text-xs text-gray-600 truncate">Project update needed...</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Advisor - Dr. Jane</p>
                    <p className="text-xs text-gray-600 truncate">Weekly report reminder</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-blue-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Upcoming Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">MAR</span>
                      <span className="text-lg font-bold">10</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Team Meeting</p>
                    <p className="text-xs text-gray-600">10:00 AM - 11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">MAR</span>
                      <span className="text-lg font-bold">12</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Report Submission</p>
                    <p className="text-xs text-gray-600">Due by 5:00 PM</p>
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
