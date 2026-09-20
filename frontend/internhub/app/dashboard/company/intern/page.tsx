"use client"

import { useState, useEffect } from "react"
import { CompanySidebar } from "../../../../components/sidebar/CompanySidebar"
import { Card, CardContent } from "@/components/ui/card"
import API_URL from "@/lib/api"
import { 
  Users, 
  Search, 
  UserCheck,
  Mail,
  BookOpen,
  Calendar,
  Github,
  Linkedin,
  Download,
  CheckCircle,
  Loader2,
  AlertCircle,
  UserPlus
} from "lucide-react"

interface Student {
  id: string
  application_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  academic_year: string
  github_link: string
  linkedin_link: string
  cv_url: string
  resume_url: string
  status: string
  created_at: string
  advisor?: string
}

export default function AcceptedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [advisorName, setAdvisorName] = useState("")
  const [assigningAdvisor, setAssigningAdvisor] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 7

  useEffect(() => {
    fetchAcceptedStudents()
  }, [])

  const fetchAcceptedStudents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      console.log('Fetching accepted students with token:', token.substring(0, 20) + '...')
      
      // Use lowercase 'accepted' to match database format
      const response = await fetch(`${API_URL}/api/applications/company?status=accepted&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch students:', errorText)
        throw new Error('Failed to fetch students')
      }
      
      const data = await response.json()
      console.log('Accepted students data:', data)
      console.log('Number of accepted students:', data.applications?.length || 0)
      setStudents(data.applications || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignAdvisor = async () => {
    if (!selectedStudent || !advisorName.trim()) return

    setAssigningAdvisor(true)
    try {
      // For now, we'll store advisor in local state
      // In production, you'd want to save this to the database
      setStudents(prev => prev.map(student => 
        student.application_id === selectedStudent.application_id
          ? { ...student, advisor: advisorName }
          : student
      ))
      
      setShowAssignModal(false)
      setAdvisorName("")
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error assigning advisor:', error)
    } finally {
      setAssigningAdvisor(false)
    }
  }

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a')
      link.href = `${API_URL}${fileUrl}`
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const endIndex = startIndex + studentsPerPage
  const currentStudents = filteredStudents.slice(startIndex, endIndex)

  // Debug logging
  console.log('Pagination Debug:', {
    totalStudents: filteredStudents.length,
    studentsPerPage,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    currentStudentsCount: currentStudents.length
  })

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div className="flex min-h-screen bg-blue-50">
      <CompanySidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              Accepted Students
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage accepted interns and assign advisors
            </p>
          </div>
          <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md border border-blue-200">
            <p className="text-xs sm:text-sm text-gray-500">Total Accepted</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">{students.length}</p>
          </div>
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

        {/* Students Table */}
        {loading ? (
          <Card>
            <CardContent className="p-12 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p>Loading accepted students...</p>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-12 flex flex-col items-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mb-4" />
              <p className="text-lg font-semibold mb-2">No accepted students found</p>
              <p className="text-gray-500">Accept applications to see students here</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50 border-b border-blue-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Year</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Advisor</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentStudents.map((student) => (
                      <tr key={student.application_id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {student.first_name[0]}{student.last_name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {student.first_name} {student.last_name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Accepted
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {student.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            {student.department}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {student.academic_year}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.advisor ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">{student.advisor}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedStudent(student)
                                setShowAssignModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                              <UserPlus className="h-4 w-4" />
                              Assign
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student)
                                setShowDetailsModal(true)
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                            >
                              <Users className="h-4 w-4" />
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination - Always show for debugging */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Results info */}
                  <div className="text-sm text-gray-600">
                    {filteredStudents.length > 0 ? (
                      <>
                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                        <span className="font-semibold">{filteredStudents.length}</span> students
                      </>
                    ) : (
                      <span className="text-red-600">No students found (Total: {students.length}, Filtered: {filteredStudents.length})</span>
                    )}
                  </div>
                  
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-sm font-medium text-gray-700 transition-colors"
                      >
                        ← Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                              currentPage === page
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'border border-blue-200 text-gray-700 hover:bg-blue-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent text-sm font-medium text-gray-700 transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Details Modal */}
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-700">Student Details</h2>
                    <p className="text-gray-500 text-sm mt-1">Complete information about the accepted student</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedStudent(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Student Profile Section */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg mb-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-3xl font-bold">
                        {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Accepted Student</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="font-medium text-gray-900">{selectedStudent.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Academic Year</p>
                      <p className="font-medium text-gray-900">{selectedStudent.academic_year}</p>
                    </div>
                  </div>
                </div>

                {/* Advisor Information */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Advisor Assignment
                  </h4>
                  {selectedStudent.advisor ? (
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-700">{selectedStudent.advisor}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">No advisor assigned yet</p>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false)
                          setShowAssignModal(true)
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                      >
                        <UserPlus className="h-4 w-4" />
                        Assign Advisor
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Links */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-700 mb-3">Professional Profiles</h4>
                  <div className="flex gap-3">
                    <a
                      href={selectedStudent.github_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      GitHub Profile
                    </a>
                    <a
                      href={selectedStudent.linkedin_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      LinkedIn Profile
                    </a>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Documents
                  </h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadFile(selectedStudent.cv_url, `CV_${selectedStudent.first_name}_${selectedStudent.last_name}.pdf`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      Download CV
                    </button>
                    <button
                      onClick={() => downloadFile(selectedStudent.resume_url, `Resume_${selectedStudent.first_name}_${selectedStudent.last_name}.pdf`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      Download Resume
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedStudent(null)
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Advisor Modal */}
        {showAssignModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Assign Advisor</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Student:</p>
                <p className="font-semibold text-gray-900">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advisor Name
                </label>
                <input
                  type="text"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  placeholder="Enter advisor name"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={assignAdvisor}
                  disabled={!advisorName.trim() || assigningAdvisor}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {assigningAdvisor ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Assign
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setAdvisorName("")
                    setSelectedStudent(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
