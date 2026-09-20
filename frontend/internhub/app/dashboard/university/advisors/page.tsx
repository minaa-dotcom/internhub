"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UniversitySidebar } from "../../../../components/sidebar/UniversitySideBar"
import { Card, CardContent } from "@/components/ui/card"
import RoleGuard from "@/components/RoleGuard"
import API_URL from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserCheck, 
  Search, 
  Users,
  Mail,
  BookOpen,
  Phone,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  UserPlus
} from "lucide-react"

interface Advisor {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  phone: string
  created_at: string
  assigned_students_count?: number
}

interface AcceptedStudent {
  id: string
  application_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  academic_year: string
  status: string
  created_at: string
  is_assigned: boolean
  company_name?: string
}

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
}

export default function AdvisorsManagementPage() {
  const router = useRouter()
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [acceptedStudents, setAcceptedStudents] = useState<AcceptedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false)
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [advisorStudents, setAdvisorStudents] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for creating advisor
  const [advisorForm, setAdvisorForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    phone: ""
  })

  useEffect(() => {
    fetchAdvisors()
    fetchAcceptedStudents()
  }, [])

  const fetchAdvisors = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        // Don't redirect - let RoleGuard handle it
        return
      }

      console.log('Fetching advisors from:', `${API_URL}/api/advisors`)

      const response = await fetch(`${API_URL}/api/advisors`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
          throw new Error('You do not have permission to view advisors. Please ensure you are logged in as a university user.')
        }
        
        throw new Error(errorData.message || 'Failed to fetch advisors')
      }
      
      const data = await response.json()
      console.log('Advisors fetched successfully:', data)
      setAdvisors(data.advisors || [])
    } catch (error) {
      console.error('Error fetching advisors:', error)
      alert(`Failed to load advisors: ${error.message || 'Please try again'}`)
    }
  }

  const fetchAcceptedStudents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found for students')
        setLoading(false)
        return
      }

      console.log('Fetching accepted students...')
      
      // Fetch accepted students from university applications
      const studentsResponse = await fetch(`${API_URL}/api/applications/university?status=accepted&limit=1000`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!studentsResponse.ok) {
        const errorData = await studentsResponse.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Failed to fetch students. Status:', studentsResponse.status)
        console.error('Error response:', errorData)
        
        if (studentsResponse.status === 401) {
          alert('Your session may have expired. Please try logging out and logging in again.')
          return
        }
        
        if (studentsResponse.status === 403) {
          // Don't set error here, let fetchAdvisors handle it
          setLoading(false)
          return
        }
        
        throw new Error(errorData.message || 'Failed to fetch students')
      }
      
      const studentsData = await studentsResponse.json()
      console.log('Students fetched:', studentsData)
      
      // Fetch already assigned application IDs
      const assignedResponse = await fetch(`${API_URL}/api/advisors/assigned/application-ids`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      let assignedIds: string[] = []
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json()
        assignedIds = assignedData.assignedApplicationIds || []
        console.log('Assigned application IDs:', assignedIds)
      } else {
        console.warn('Could not fetch assigned application IDs')
      }
      
      // Transform applications to student format and mark if assigned
      const students = (studentsData.applications || []).map((app: any) => ({
        id: app.id,
        application_id: app.id,
        first_name: app.first_name,
        last_name: app.last_name,
        email: app.email,
        department: app.department,
        academic_year: app.academic_year,
        status: app.status,
        created_at: app.created_at,
        company_name: app.company_name || '',
        is_assigned: assignedIds.includes(app.id)
      }))
      
      console.log(`Processed ${students.length} students, ${students.filter(s => !s.is_assigned).length} unassigned`)
      setAcceptedStudents(students)
    } catch (error) {
      console.error('Error fetching students:', error)
      alert(`Failed to load students: ${error.message || 'Please try again'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdvisor = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }
      
      // Get university_id from token
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]))
      const university_id = tokenPayload.id || tokenPayload.userId

      const requestBody = {
        ...advisorForm,
        university_id: university_id
      }
      
      console.log('Creating advisor with data:', requestBody)

      const response = await fetch(`${API_URL}/api/advisors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Backend error:', errorData)
        
        if (response.status === 401) {
          alert('Your session may have expired. Please try logging out and logging in again.')
          return
        }
        
        if (response.status === 403) {
          alert('You do not have permission to create advisors')
          return
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to create advisor')
      }

      const data = await response.json()
      
      setSuccess('Advisor created successfully!')
      setShowCreateModal(false)
      setAdvisorForm({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        phone: ""
      })
      
      // Refresh advisors list
      fetchAdvisors()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      console.error('Error creating advisor:', error)
      setError(error.message || 'Failed to create advisor')
    } finally {
      setCreating(false)
    }
  }

  const handleAssignStudents = async () => {
    if (!selectedAdvisor || selectedStudents.length === 0) return

    setAssigning(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('You must be logged in to assign students')
        return
      }

      // Assign each selected student to the advisor
      const assignmentPromises = selectedStudents.map(async (studentId) => {
        const student = acceptedStudents.find(s => s.application_id === studentId)
        if (!student) return null

        const response = await fetch(`${API_URL}/api/advisors/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            advisor_id: selectedAdvisor.id,
            application_id: student.application_id,
            student_name: `${student.first_name} ${student.last_name}`,
            student_email: student.email,
            department: student.department,
            company_name: student.company_name || ''
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
          
          if (response.status === 401) {
            alert('Your session may have expired. Please try logging out and logging in again.')
            throw new Error('Session expired')
          }
          
          if (response.status === 403) {
            alert('You do not have permission to assign students')
            throw new Error('Permission denied')
          }
          
          throw new Error(errorData.message || 'Failed to assign student')
        }

        return response.json()
      })

      await Promise.all(assignmentPromises)

      setSuccess(`Successfully assigned ${selectedStudents.length} student(s) to ${selectedAdvisor.first_name} ${selectedAdvisor.last_name}`)
      setShowAssignModal(false)
      setSelectedStudents([])
      setSelectedAdvisor(null)
      
      // Refresh data to update assigned status
      fetchAcceptedStudents()
      fetchAdvisors()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      console.error('Error assigning students:', error)
      if (error.message !== 'Session expired' && error.message !== 'Permission denied') {
        setError(error.message || 'Failed to assign students')
      }
    } finally {
      setAssigning(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unassignedStudents = acceptedStudents.filter(s => !s.is_assigned)

  return (
    <RoleGuard allowedRoles={['university', 'admin']}>
    <div className="flex min-h-screen bg-blue-50">
      <UniversitySidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Success/Error Messages */}
        {success && (
          <Card className="border-green-200 bg-green-50 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8" />
              Advisors Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Create advisors and assign accepted students
            </p>
          </div>
          <Button
            onClick={() => {
              setError(null)
              setShowCreateModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Advisor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Advisors</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">{advisors.length}</p>
                </div>
                <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Accepted Students</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{acceptedStudents.length}</p>
                </div>
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Unassigned</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-700">{unassignedStudents.length}</p>
                </div>
                <UserPlus className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 opacity-50" />
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
                placeholder="Search advisors by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Advisors List */}
        {loading ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm sm:text-base">Loading advisors...</p>
            </CardContent>
          </Card>
        ) : filteredAdvisors.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-4" />
              <p className="text-base sm:text-lg font-semibold mb-2">No advisors found</p>
              <p className="text-sm sm:text-base text-gray-500 text-center mb-4">
                Create your first advisor to start assigning students
              </p>
              <Button
                onClick={() => {
                  setError(null)
                  setShowCreateModal(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Advisor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredAdvisors.map((advisor) => (
              <Card key={advisor.id} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Advisor Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg font-bold">
                          {advisor.first_name[0]}{advisor.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {advisor.first_name} {advisor.last_name}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          Advisor
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Advisor Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{advisor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      {advisor.department}
                    </div>
                    {advisor.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {advisor.phone}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/dashboard/university/advisors/mystudent?advisorId=${advisor.id}&advisorName=${encodeURIComponent(advisor.first_name + ' ' + advisor.last_name)}`)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Students
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedAdvisor(advisor)
                        setShowAssignModal(true)
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Advisor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Create New Advisor</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAdvisor} className="space-y-4">
                {/* Error message in modal */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={advisorForm.first_name}
                      onChange={(e) => setAdvisorForm({...advisorForm, first_name: e.target.value})}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={advisorForm.last_name}
                      onChange={(e) => setAdvisorForm({...advisorForm, last_name: e.target.value})}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={advisorForm.email}
                    onChange={(e) => setAdvisorForm({...advisorForm, email: e.target.value})}
                    required
                    placeholder="john.doe@university.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={advisorForm.department}
                    onChange={(e) => setAdvisorForm({...advisorForm, department: e.target.value})}
                    required
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={advisorForm.phone}
                    onChange={(e) => setAdvisorForm({...advisorForm, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Advisor
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Students Modal */}
        {showAssignModal && selectedAdvisor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Assign Students</h2>
                  <p className="text-sm text-gray-600">
                    Assign to: {selectedAdvisor.first_name} {selectedAdvisor.last_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedStudents([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-semibold text-blue-600">{selectedStudents.length}</span> student(s)
                </p>
              </div>

              {unassignedStudents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No unassigned students available</p>
                  <p className="text-sm text-gray-500 mt-2">All accepted students have been assigned to advisors</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                  {unassignedStudents.map((student) => (
                    <div
                      key={student.application_id}
                      onClick={() => toggleStudentSelection(student.application_id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudents.includes(student.application_id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-xs text-gray-500">{student.department} • {student.academic_year}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedStudents.includes(student.application_id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedStudents.includes(student.application_id) && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleAssignStudents}
                  disabled={assigning || selectedStudents.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {assigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign {selectedStudents.length} Student(s)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedStudents([])
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
    </RoleGuard>
  )
}
