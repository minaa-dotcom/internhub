"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { UniversitySidebar } from "../../../../../components/sidebar/UniversitySideBar"
import { Card, CardContent } from "@/components/ui/card"
import API_URL from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { 
  UserCheck, Search, Users, Mail, BookOpen, Calendar, TrendingUp,
  ClipboardCheck, Award, Loader2, AlertCircle, MessageSquare,
  Send, Github, Linkedin, Phone, Building2, CheckCircle, Eye, BarChart3
} from "lucide-react"

interface AssignedStudent {
  id: string
  assignment_id: string
  application_id: string
  student_name: string
  student_email: string
  department: string
  company_name: string
  assigned_date: string
  status: string
  advisor_first_name?: string
  advisor_last_name?: string
  academic_year?: string
  github_link?: string
  linkedin_link?: string
  phone?: string
  progress?: {
    week_number: number
    progress_percentage: number
    tasks_completed: number
    tasks_total: number
  }
  attendance_summary?: {
    total_days: number
    present: number
    absent: number
    attendance_rate: number
  }
  latest_evaluation?: {
    overall_rating: number
    evaluation_date: string
  }
  feedback?: string
  feedback_date?: string
}

export default function AdvisorDashboardPage() {
  const searchParams = useSearchParams()
  const advisorId = searchParams.get('advisorId')
  const advisorName = searchParams.get('advisorName') || 'Advisor'

  const [students, setStudents] = useState<AssignedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  useEffect(() => {
    fetchAssignedStudents()
  }, [advisorId])

  const fetchAssignedStudents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      if (!token) { setLoading(false); return }

      let url: string
      if (advisorId) {
        // Specific advisor — fetch only their students
        url = `${API_URL}/api/advisors/${advisorId}/students`
      } else {
        // No advisor ID — show all (university admin view)
        url = `${API_URL}/api/advisors/all-students`
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        console.error('Failed to fetch students. Status:', response.status)
        setLoading(false)
        return
      }

      const data = await response.json()
      setStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }


  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmitFeedback = async () => {
    if (!selectedStudent || !feedback.trim()) return

    setSubmittingFeedback(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      const response = await fetch(`${API_URL}/api/advisors/feedback/${selectedStudent.assignment_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback: feedback.trim()
        })
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      setFeedbackSuccess(true)
      setTimeout(() => {
        setFeedbackSuccess(false)
        setFeedback("")
      }, 2000)

      // Refresh student data
      fetchAssignedStudents()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    avgProgress: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.progress?.progress_percentage || 0), 0) / students.length)
      : 0,
    avgAttendance: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.attendance_summary?.attendance_rate || 0), 0) / students.length)
      : 0
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <UniversitySidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8" />
              {advisorId ? `${advisorName}'s Students` : 'All Assigned Students'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              View all students assigned to advisors
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Active Students</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{stats.activeStudents}</p>
                </div>
                <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Avg Progress</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">{stats.avgProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Avg Attendance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-700">{stats.avgAttendance}%</p>
                </div>
                <ClipboardCheck className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="border-blue-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {loading ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm sm:text-base">Loading assigned students...</p>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-4" />
              <p className="text-base sm:text-lg font-semibold mb-2">No students assigned</p>
              <p className="text-sm sm:text-base text-gray-500 text-center">Students will appear here once they are assigned to you</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="font-semibold text-blue-700">Student</TableHead>
                      <TableHead className="font-semibold text-blue-700">Email</TableHead>
                      <TableHead className="font-semibold text-blue-700">Department</TableHead>
                      <TableHead className="font-semibold text-blue-700">Advisor</TableHead>
                      <TableHead className="font-semibold text-blue-700">Progress</TableHead>
                      <TableHead className="font-semibold text-blue-700">Tasks</TableHead>
                      <TableHead className="font-semibold text-blue-700">Attendance</TableHead>
                      <TableHead className="font-semibold text-blue-700">Status</TableHead>
                      <TableHead className="font-semibold text-blue-700 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-blue-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {student.student_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{student.student_name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(student.assigned_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{student.student_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{student.department}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {student.advisor_first_name} {student.advisor_last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-[80px]">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-blue-700">
                                  {student.progress?.progress_percentage || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${student.progress?.progress_percentage || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-purple-700">
                              {student.progress?.tasks_completed || 0}/{student.progress?.tasks_total || 0}
                            </p>
                            <p className="text-xs text-gray-500">completed</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-green-700">
                              {student.attendance_summary?.attendance_rate || 0}%
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.attendance_summary?.present || 0}/{student.attendance_summary?.total_days || 0}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {student.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => {
                              setSelectedStudent(student)
                              setShowDetailsModal(true)
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Details Modal - Enhanced with Full Information */}
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto my-4">
              <div className="p-4 sm:p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Student Complete Profile</h2>
                    <p className="text-gray-500 text-sm mt-1">{selectedStudent.student_name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedStudent(null)
                      setFeedback("")
                      setFeedbackSuccess(false)
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Student Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-lg mb-6 text-white">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold">
                        {selectedStudent.student_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-2xl font-bold">{selectedStudent.student_name}</h3>
                      <p className="text-blue-100 mt-1">{selectedStudent.student_email}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          selectedStudent.status === 'active' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {selectedStudent.status}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-white/20">
                          {selectedStudent.department}
                        </span>
                        {selectedStudent.academic_year && (
                          <span className="text-xs px-3 py-1 rounded-full bg-white/20">
                            {selectedStudent.academic_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{selectedStudent.student_email}</span>
                        </div>
                        {selectedStudent.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{selectedStudent.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{selectedStudent.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">Assigned: {new Date(selectedStudent.assigned_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Company & Links
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{selectedStudent.company_name || 'Not assigned'}</span>
                        </div>
                        {selectedStudent.github_link && (
                          <a 
                            href={selectedStudent.github_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Github className="h-4 w-4" />
                            GitHub Profile
                          </a>
                        )}
                        {selectedStudent.linkedin_link && (
                          <a 
                            href={selectedStudent.linkedin_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Progress Section */}
                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        Progress
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Overall</span>
                            <span className="text-xs font-semibold text-blue-700">
                              {selectedStudent.progress?.progress_percentage || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${selectedStudent.progress?.progress_percentage || 0}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Week</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {selectedStudent.progress?.week_number || 1}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tasks Section */}
                  <Card className="border-purple-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2 text-sm">
                        <ClipboardCheck className="h-4 w-4" />
                        Tasks
                      </h4>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-700">
                          {selectedStudent.progress?.tasks_completed || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          of {selectedStudent.progress?.tasks_total || 0} completed
                        </p>
                        <div className="mt-2 text-xs text-purple-600">
                          {selectedStudent.progress?.tasks_total 
                            ? Math.round(((selectedStudent.progress?.tasks_completed || 0) / selectedStudent.progress.tasks_total) * 100)
                            : 0}% completion rate
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attendance Section */}
                  <Card className="border-green-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Attendance
                      </h4>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-700">
                          {selectedStudent.attendance_summary?.attendance_rate || 0}%
                        </p>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          <div className="bg-green-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Present</p>
                            <p className="text-sm font-semibold text-green-700">
                              {selectedStudent.attendance_summary?.present || 0}
                            </p>
                          </div>
                          <div className="bg-red-50 p-1 rounded">
                            <p className="text-xs text-gray-500">Absent</p>
                            <p className="text-sm font-semibold text-red-700">
                              {selectedStudent.attendance_summary?.absent || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Evaluation Section */}
                  <Card className="border-yellow-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4" />
                        Rating
                      </h4>
                      {selectedStudent.latest_evaluation ? (
                        <div className="text-center">
                          <p className="text-3xl font-bold text-yellow-600">
                            {selectedStudent.latest_evaluation.overall_rating}
                          </p>
                          <p className="text-sm text-gray-500">out of 5.0</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(selectedStudent.latest_evaluation.evaluation_date).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <p className="text-sm">No evaluation yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Advisor Feedback Section */}
                <Card className="border-blue-200 mb-6">
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Advisor Feedback on Company Work
                    </h4>
                    
                    {/* Previous Feedback Display */}
                    {selectedStudent.feedback && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold text-blue-700">Previous Feedback:</p>
                          {selectedStudent.feedback_date && (
                            <p className="text-xs text-gray-500">
                              {new Date(selectedStudent.feedback_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedStudent.feedback}</p>
                      </div>
                    )}

                    {/* Feedback Input */}
                    <div className="space-y-3">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write your feedback about the student's university work, performance, and progress..."
                        className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-sm"
                        disabled={submittingFeedback}
                      />
                      
                      {feedbackSuccess && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Feedback submitted successfully!
                        </div>
                      )}

                      <button
                        onClick={handleSubmitFeedback}
                        disabled={!feedback.trim() || submittingFeedback}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                      >
                        {submittingFeedback ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Feedback
                          </>
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium">
                    <BarChart3 className="h-4 w-4" />
                    View Full Analytics
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedStudent(null)
                      setFeedback("")
                      setFeedbackSuccess(false)
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
