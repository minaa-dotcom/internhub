"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CompanySidebar } from "../../../../components/sidebar/CompanySidebar"
import { Card, CardContent } from "@/components/ui/card"
import API_URL from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserCheck, 
  Search, 
  Users,
  Mail,
  Briefcase,
  Phone,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Building2
} from "lucide-react"

interface Mentor {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  position: string
  phone: string
  expertise: string
  created_at: string
}

interface AcceptedIntern {
  id: string
  application_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  status: string
  created_at: string
  is_assigned?: boolean
  assigned_to_mentor?: string
}

export default function MentorsManagementPage() {
  const router = useRouter()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [acceptedInterns, setAcceptedInterns] = useState<AcceptedIntern[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [selectedInterns, setSelectedInterns] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for creating mentor
  const [mentorForm, setMentorForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    expertise: ""
  })

  useEffect(() => {
    fetchMentors()
    fetchAcceptedInterns()
  }, [])

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]))
      const companyId = tokenPayload.id || tokenPayload.userId

      const response = await fetch(`${API_URL}/api/mentors/company/${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch mentors')
      
      const data = await response.json()
      setMentors(data.mentors || [])
    } catch (error) {
      console.error('Error fetching mentors:', error)
      setError('Failed to load mentors')
    }
  }

  const fetchAcceptedInterns = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      // Fetch accepted interns
      const response = await fetch(`${API_URL}/api/applications/company?status=accepted&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch interns')
      
      const data = await response.json()
      
      // Fetch already assigned application IDs
      const assignedResponse = await fetch(`${API_URL}/api/mentors/assigned/application-ids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      let assignedIds: string[] = []
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json()
        assignedIds = assignedData.assignedApplicationIds || []
      }
      
      // Mark interns as assigned or not
      const internsWithStatus = (data.applications || []).map((intern: any) => ({
        ...intern,
        is_assigned: assignedIds.includes(intern.application_id || intern.id)
      }))
      
      setAcceptedInterns(internsWithStatus)
    } catch (error) {
      console.error('Error fetching interns:', error)
      setError('Failed to load interns')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }
      
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]))
      const company_id = tokenPayload.id || tokenPayload.userId

      const requestBody = {
        ...mentorForm,
        company_id: company_id,
        user_id: company_id
      }
      
      console.log('Creating mentor with data:', requestBody)

      const response = await fetch(`${API_URL}/api/mentors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = 'Failed to create mentor'
        try {
          const errorData = await response.json()
          console.error('Backend error:', errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          console.error('Response is not JSON:', response.statusText)
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      setSuccess('Mentor created successfully!')
      setShowCreateModal(false)
      setMentorForm({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        position: "",
        phone: "",
        expertise: ""
      })
      
      fetchMentors()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      console.error('Error creating mentor:', error)
      setError(error.message || 'Failed to create mentor')
    } finally {
      setCreating(false)
    }
  }

  const handleAssignInterns = async () => {
    if (!selectedMentor || selectedInterns.length === 0) return

    setAssigning(true)
    setError(null)

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      let successCount = 0
      let errors: string[] = []

      for (const internId of selectedInterns) {
        const intern = acceptedInterns.find(i => i.id === internId)
        if (!intern) continue

        try {
          const response = await fetch(`${API_URL}/api/mentors/assign`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              mentor_id: selectedMentor.id,
              application_id: intern.application_id || intern.id,
              student_name: `${intern.first_name} ${intern.last_name}`,
              student_email: intern.email
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            errors.push(`${intern.first_name} ${intern.last_name}: ${errorData.message || 'Failed'}`)
          } else {
            successCount++
          }
        } catch (err: any) {
          errors.push(`${intern.first_name} ${intern.last_name}: ${err.message}`)
        }
      }

      if (successCount > 0) {
        setSuccess(`Successfully assigned ${successCount} intern(s) to ${selectedMentor.first_name} ${selectedMentor.last_name}!`)
        // Refresh the list to update assigned status
        fetchAcceptedInterns()
      }

      if (errors.length > 0) {
        setError(`Some assignments failed:\n${errors.join('\n')}`)
      }

      setShowAssignModal(false)
      setSelectedInterns([])
      
      setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
    } catch (error: any) {
      console.error('Error assigning interns:', error)
      setError(error.message || 'Failed to assign interns')
    } finally {
      setAssigning(false)
    }
  }

  const filteredMentors = mentors.filter(mentor =>
    mentor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unassignedInterns = acceptedInterns.filter(intern => !intern.is_assigned)
  const assignedInternsCount = acceptedInterns.filter(intern => intern.is_assigned).length

  return (
    <div className="flex min-h-screen bg-blue-50">
      <CompanySidebar />

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
              Mentors Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Create mentors and assign accepted interns
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
            Create Mentor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Mentors</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">{mentors.length}</p>
                </div>
                <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Available Interns</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{unassignedInterns.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{assignedInternsCount} already assigned</p>
                </div>
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-50" />
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
                placeholder="Search mentors by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mentors List */}
        {loading ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm sm:text-base">Loading mentors...</p>
            </CardContent>
          </Card>
        ) : filteredMentors.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-4" />
              <p className="text-base sm:text-lg font-semibold mb-2">No mentors found</p>
              <p className="text-sm sm:text-base text-gray-500 text-center mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Create your first mentor to get started'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    setError(null)
                    setShowCreateModal(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mentor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg font-bold">
                          {mentor.first_name[0]}{mentor.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {mentor.first_name} {mentor.last_name}
                        </h3>
                        <p className="text-xs text-gray-500">{mentor.position}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{mentor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {mentor.department}
                    </div>
                    {mentor.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {mentor.phone}
                      </div>
                    )}
                    {mentor.expertise && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        {mentor.expertise}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push('/dashboard/company/mentors/myinterns')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Interns
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedMentor(mentor)
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

        {/* Create Mentor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Create New Mentor</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMentor} className="space-y-4">
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
                      value={mentorForm.first_name}
                      onChange={(e) => setMentorForm({...mentorForm, first_name: e.target.value})}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={mentorForm.last_name}
                      onChange={(e) => setMentorForm({...mentorForm, last_name: e.target.value})}
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
                    value={mentorForm.email}
                    onChange={(e) => setMentorForm({...mentorForm, email: e.target.value})}
                    required
                    placeholder="john.doe@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={mentorForm.department}
                      onChange={(e) => setMentorForm({...mentorForm, department: e.target.value})}
                      required
                      placeholder="Engineering"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={mentorForm.position}
                      onChange={(e) => setMentorForm({...mentorForm, position: e.target.value})}
                      required
                      placeholder="Senior Developer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={mentorForm.phone}
                    onChange={(e) => setMentorForm({...mentorForm, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="expertise">Expertise</Label>
                  <Input
                    id="expertise"
                    value={mentorForm.expertise}
                    onChange={(e) => setMentorForm({...mentorForm, expertise: e.target.value})}
                    placeholder="React, Node.js, Python"
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
                        Create Mentor
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

        {/* Assign Interns Modal */}
        {showAssignModal && selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Assign Interns</h2>
                  <p className="text-sm text-gray-600">
                    Mentor: {selectedMentor.first_name} {selectedMentor.last_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedInterns([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-semibold text-blue-600">{selectedInterns.length}</span> intern(s)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {unassignedInterns.length} available • {assignedInternsCount} already assigned
                </p>
              </div>

              {unassignedInterns.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No unassigned interns available</p>
                  <p className="text-sm text-gray-500 mt-2">
                    All accepted interns have been assigned to mentors
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                  {unassignedInterns.map((intern) => (
                    <div
                      key={intern.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedInterns(prev =>
                          prev.includes(intern.id)
                            ? prev.filter(id => id !== intern.id)
                            : [...prev, intern.id]
                        )
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedInterns.includes(intern.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {intern.first_name} {intern.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{intern.email}</p>
                        <p className="text-xs text-gray-500">{intern.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAssignInterns}
                  disabled={selectedInterns.length === 0 || assigning}
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
                      Assign {selectedInterns.length} Intern(s)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedInterns([])
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
  )
}
