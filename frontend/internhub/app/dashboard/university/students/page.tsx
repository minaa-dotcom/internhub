"use client"

import { useState, useEffect } from "react"
import { UniversitySidebar } from "../../../../components/sidebar/UniversitySideBar"
import { Card, CardContent } from "@/components/ui/card"
import API_URL from "@/lib/api"
import { 
  Users, 
  Search, 
  Mail,
  BookOpen,
  Calendar,
  TrendingUp,
  ClipboardCheck,
  Award,
  Loader2,
  AlertCircle,
  Building2,
  Filter,
  Download,
  UserCheck
} from "lucide-react"

interface Student {
  id: string
  application_id: string
  student_name: string
  first_name: string
  last_name: string
  email: string
  department: string
  academic_year: string
  company_name: string
  status: string
  created_at: string
  advisor_name?: string
  progress_percentage?: number
  attendance_rate?: number
  overall_rating?: number
}

export default function UniversityStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 7

  useEffect(() => {
    fetchAllStudents()
  }, [])

  const fetchAllStudents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      // Fetch all accepted students
      const response = await fetch(`${API_URL}/api/applications/university?status=accepted&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch students. Status:', response.status)
        console.error('Error response:', errorText)
        throw new Error('Failed to fetch students')
      }
      
      const data = await response.json()

      
      // Transform and add mock performance data
      const transformedStudents = (data.applications || []).map((app: any) => ({
        id: app.id,
        application_id: app.application_id,
        student_name: `${app.first_name} ${app.last_name}`,
        first_name: app.first_name,
        last_name: app.last_name,
        email: app.email,
        department: app.department,
        academic_year: app.academic_year,
        company_name: app.company_name || 'Unknown Company',
        status: 'active',
        created_at: app.created_at,
        advisor_name: app.advisor_name || 'Not Assigned',
        progress_percentage: Math.floor(Math.random() * 100),
        attendance_rate: Math.floor(Math.random() * 30) + 70,
        overall_rating: (Math.random() * 2 + 3).toFixed(1).toString()
      }))
      
      setStudents(transformedStudents)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique departments
  const departments = Array.from(new Set(students.map(s => s.department)))

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const endIndex = startIndex + studentsPerPage
  const currentStudents = filteredStudents.slice(startIndex, endIndex)

  // Stats
  const stats = {
    totalStudents: students.length,
    avgProgress: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / students.length)
      : 0,
    avgAttendance: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / students.length)
      : 0,
    avgRating: students.length > 0
      ? (students.reduce((sum, s) => sum + parseFloat(String(s.overall_rating || '0')), 0) / students.length).toFixed(1)
      : '0.0'
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Department', 'Year', 'Company', 'Advisor', 'Progress %', 'Attendance %', 'Rating']
    const rows = filteredStudents.map(s => [
      s.student_name,
      s.email,
      s.department,
      s.academic_year,
      s.company_name,
      s.advisor_name || 'Not Assigned',
      s.progress_percentage || 0,
      s.attendance_rate || 0,
      s.overall_rating || 0
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <UniversitySidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              All Students
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              University-wide student performance overview
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
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

          <Card className="border-blue-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Avg Attendance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{stats.avgAttendance}%</p>
                </div>
                <ClipboardCheck className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Avg Rating</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-700">{stats.avgRating}/5.0</p>
                </div>
                <Award className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-blue-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {loading ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm sm:text-base">Loading students...</p>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-4" />
              <p className="text-base sm:text-lg font-semibold mb-2">No students found</p>
              <p className="text-sm sm:text-base text-gray-500 text-center">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View - Simplified */}
            <div className="lg:hidden space-y-3">
              {currentStudents.map((student, index) => (
                <Card key={student.application_id} className="border-blue-200">
                  <CardContent className="p-4">
                    {/* Student Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{student.student_name}</h3>
                        <p className="text-xs text-gray-500 truncate">{student.email}</p>
                      </div>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex-shrink-0">
                        {startIndex + index + 1}
                      </span>
                    </div>

                    {/* Essential Info Only */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Department:</span>
                        <span className="font-medium text-gray-900 truncate ml-2">{student.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Company:</span>
                        <span className="font-medium text-gray-900 truncate ml-2">{student.company_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-semibold text-blue-700">{student.progress_percentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Attendance:</span>
                        <span className={`font-semibold ${
                          (student.attendance_rate || 0) >= 80 ? 'text-green-700' : 
                          (student.attendance_rate || 0) >= 60 ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          {student.attendance_rate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-gray-900">{student.overall_rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="border-blue-200 hidden lg:block">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-blue-50 border-b border-blue-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Advisor</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Progress</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Attendance</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentStudents.map((student, index) => (
                      <tr key={student.application_id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            {startIndex + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {student.first_name[0]}{student.last_name[0]}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">{student.student_name}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{student.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{student.department}</p>
                              <p className="text-xs text-gray-500">{student.academic_year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {student.company_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{student.advisor_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold text-blue-700 mb-1">
                              {student.progress_percentage}%
                            </span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${student.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <span className={`text-sm font-semibold mb-1 ${
                              (student.attendance_rate || 0) >= 80 ? 'text-green-700' : 
                              (student.attendance_rate || 0) >= 60 ? 'text-yellow-700' : 'text-red-700'
                            }`}>
                              {student.attendance_rate}%
                            </span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (student.attendance_rate || 0) >= 80 ? 'bg-green-600' : 
                                  (student.attendance_rate || 0) >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${student.attendance_rate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-gray-900">
                              {student.overall_rating}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                        <span className="font-semibold">{filteredStudents.length}</span> students
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 sm:px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-gray-700"
                        >
                          <span className="hidden sm:inline">← Previous</span>
                          <span className="sm:hidden">←</span>
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                              page = i + 1;
                            } else if (currentPage <= 3) {
                              page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              page = totalPages - 4 + i;
                            } else {
                              page = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'border border-blue-200 text-gray-700 hover:bg-blue-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 sm:px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium text-gray-700"
                        >
                          <span className="hidden sm:inline">Next →</span>
                          <span className="sm:hidden">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="lg:hidden">
                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-xs text-gray-600 text-center">
                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                        <span className="font-semibold">{filteredStudents.length}</span> students
                      </div>
                      
                      <div className="flex items-center gap-2 w-full justify-center">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-gray-700"
                        >
                          ←
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                              page = i + 1;
                            } else if (currentPage <= 3) {
                              page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              page = totalPages - 4 + i;
                            } else {
                              page = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-all ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'border border-blue-200 text-gray-700 hover:bg-blue-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 border border-blue-300 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-gray-700"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
