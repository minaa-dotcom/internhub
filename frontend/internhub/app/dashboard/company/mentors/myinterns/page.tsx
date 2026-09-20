"use client"

import { useState, useEffect } from "react"
import { CompanySidebar } from "../../../../../components/sidebar/CompanySidebar"
import { Card, CardContent } from "@/components/ui/card"
import API_URL from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  UserCheck, 
  Search, 
  Users,
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
  Briefcase,
  FolderPlus,
  Edit,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle
} from "lucide-react"

interface AssignedIntern {
  id: string  // This is the assignment_id from mentor_assignments table
  application_id: string
  student_name: string
  student_email: string
  mentor_first_name?: string
  mentor_last_name?: string
  assigned_date: string
  status: string
}

interface InternProject {
  id: string
  assignment_id: string
  project_title: string
  project_description: string
  deadline: string
  status: string
  progress: number
  created_at: string
  updated_at: string
}

export default function MyInternsPage() {
  const [interns, setInterns] = useState<AssignedIntern[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIntern, setSelectedIntern] = useState<AssignedIntern | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [projects, setProjects] = useState<InternProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<InternProject | null>(null)
  const [projectForm, setProjectForm] = useState({
    project_title: '',
    project_description: '',
    deadline: ''
  })
  const [updateForm, setUpdateForm] = useState({
    status: '',
    progress: 0
  })

  useEffect(() => {
    fetchAssignedInterns()
  }, [])

  const fetchAssignedInterns = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        return
      }

      // Decode token to get user info
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      const userId = tokenPayload.id || tokenPayload.userId
      const userEmail = tokenPayload.email
      const userRole = tokenPayload.role
      
      console.log('User info from token:', { userId, userEmail, userRole })

      // Get company ID
      const companyId = userId

      // Check if user is a mentor by email
      const mentorResponse = await fetch(`${API_URL}/api/mentors/company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!mentorResponse.ok) {
        console.error('Failed to fetch mentors')
        setLoading(false)
        return
      }

      const mentorsData = await mentorResponse.json()
      console.log('All mentors:', mentorsData.mentors)
      
      // Find mentor by email
      const currentMentor = mentorsData.mentors?.find((mentor: any) => 
        mentor.email?.toLowerCase() === userEmail?.toLowerCase()
      )

      console.log('Current mentor found:', currentMentor)

      if (!currentMentor) {
        console.log('User is not a mentor (company admin), showing all interns')
        // If not a mentor, fetch all assigned interns (for company admin)
        const response = await fetch(`${API_URL}/api/mentors/all-interns`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch all interns. Status:', response.status)
          console.error('Error response:', errorText)
          setLoading(false)
          return
        }
        
        const data = await response.json()
        console.log('All assigned interns:', data.interns?.length || 0, 'interns')
        setInterns(data.interns || [])
      } else {
        console.log('User is mentor:', currentMentor.first_name, currentMentor.last_name, 'ID:', currentMentor.id)
        // Fetch interns assigned to this specific mentor
        const response = await fetch(`${API_URL}/api/mentors/${currentMentor.id}/interns`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch mentor interns. Status:', response.status)
          console.error('Error response:', errorText)
          setLoading(false)
          return
        }
        
        const data = await response.json()
        console.log('Mentor assigned interns:', data.interns?.length || 0, 'interns')
        console.log('Interns data:', data.interns)
        setInterns(data.interns || [])
      }
    } catch (error) {
      console.error('Error fetching interns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async (assignmentId: string) => {
    setLoadingProjects(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      
      console.log('Fetching projects for assignment:', assignmentId)
      
      const response = await fetch(`${API_URL}/api/mentors/projects/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Projects fetch response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch projects. Status:', response.status)
        console.error('Error response:', errorText)
        
        // Try to parse as JSON to get detailed error
        try {
          const errorJson = JSON.parse(errorText)
          console.error('Error details:', errorJson)
        } catch (e) {
          // Not JSON, just log the text
        }
        
        setLoadingProjects(false)
        return
      }

      const data = await response.json()
      console.log('Projects fetched:', data.projects?.length || 0)
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleAssignProject = async () => {
    if (!selectedIntern || !projectForm.project_title || !projectForm.deadline) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      
      const response = await fetch(`${API_URL}/api/mentors/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignment_id: selectedIntern.id,  // Use 'id' which is the assignment_id
          project_title: projectForm.project_title,
          project_description: projectForm.project_description,
          deadline: projectForm.deadline,
          status: 'assigned'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign project')
      }

      // Reset form and close modal
      setProjectForm({ project_title: '', project_description: '', deadline: '' })
      setShowProjectModal(false)
      
      // Refresh projects list
      if (selectedIntern) {
        await fetchProjects(selectedIntern.id)
      }
    } catch (error) {
      console.error('Error assigning project:', error)
      alert('Failed to assign project')
    }
  }

  const handleUpdateProject = async () => {
    if (!selectedProject) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      
      const response = await fetch(`${API_URL}/api/mentors/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: updateForm.status,
          progress: updateForm.progress
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      // Close modal and refresh projects
      setShowUpdateModal(false)
      setSelectedProject(null)
      
      if (selectedIntern) {
        await fetchProjects(selectedIntern.id)
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />
      case 'review':
        return <Eye className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'on_hold':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'review':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on_hold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredInterns = interns.filter(intern =>
    intern.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalInterns: interns.length,
    activeInterns: interns.filter(i => i.status === 'active').length
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <CompanySidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8" />
              My Assigned Interns
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              View and manage interns assigned to you
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Interns</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.totalInterns}</p>
                </div>
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Active Interns</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{stats.activeInterns}</p>
                </div>
                <UserCheck className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-50" />
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Interns Table */}
        {loading ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm sm:text-base">Loading assigned interns...</p>
            </CardContent>
          </Card>
        ) : filteredInterns.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-4" />
              <p className="text-base sm:text-lg font-semibold mb-2">No interns assigned</p>
              <p className="text-sm sm:text-base text-gray-500 text-center">Interns will appear here once they are assigned to you</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="font-semibold text-blue-700">Intern</TableHead>
                      <TableHead className="font-semibold text-blue-700">Email</TableHead>
                      <TableHead className="font-semibold text-blue-700">Mentor</TableHead>
                      <TableHead className="font-semibold text-blue-700">Assigned Date</TableHead>
                      <TableHead className="font-semibold text-blue-700">Status</TableHead>
                      <TableHead className="font-semibold text-blue-700 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInterns.map((intern) => (
                      <TableRow key={intern.id} className="hover:bg-blue-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {intern.student_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{intern.student_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{intern.student_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {intern.mentor_first_name} {intern.mentor_last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {new Date(intern.assigned_date).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            intern.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {intern.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => {
                              setSelectedIntern(intern)
                              setShowDetailsModal(true)
                              // Use 'id' which is the assignment_id from mentor_assignments table
                              fetchProjects(intern.id)
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

        {/* Intern Details Modal */}
        {showDetailsModal && selectedIntern && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto my-4">
              <div className="p-4 sm:p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Intern Details</h2>
                    <p className="text-gray-500 text-sm mt-1">{selectedIntern.student_name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedIntern(null)
                      setProjects([])
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Intern Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-lg mb-6 text-white">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold">
                        {selectedIntern.student_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-2xl font-bold">{selectedIntern.student_name}</h3>
                      <p className="text-blue-100 mt-1">{selectedIntern.student_email}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          selectedIntern.status === 'active' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {selectedIntern.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
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
                          <span className="text-gray-700">{selectedIntern.student_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">Assigned: {new Date(selectedIntern.assigned_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Mentor Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{selectedIntern.mentor_first_name} {selectedIntern.mentor_last_name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Projects Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Assigned Projects
                    </h3>
                    <Button
                      onClick={() => setShowProjectModal(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FolderPlus className="h-4 w-4 mr-1" />
                      Assign Project
                    </Button>
                  </div>

                  {loadingProjects ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  ) : projects.length === 0 ? (
                    <Card className="border-blue-200">
                      <CardContent className="p-8 text-center">
                        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No projects assigned yet</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Assign Project" to add a new project</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((project) => (
                        <Card key={project.id} className="border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">{project.project_title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{project.project_description}</p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                    {getStatusIcon(project.status)}
                                    {project.status.replace('_', ' ')}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    Due: {new Date(project.deadline).toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full transition-all"
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex sm:flex-col gap-2">
                                <Button
                                  onClick={() => {
                                    setSelectedProject(project)
                                    setUpdateForm({ status: project.status, progress: project.progress })
                                    setShowUpdateModal(true)
                                  }}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Update
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedIntern(null)
                      setProjects([])
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

        {/* Assign Project Modal */}
        {showProjectModal && selectedIntern && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[60]">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-blue-700">Assign New Project</h2>
                    <p className="text-sm text-gray-500 mt-1">For {selectedIntern.student_name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProjectModal(false)
                      setProjectForm({ project_title: '', project_description: '', deadline: '' })
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectForm.project_title}
                      onChange={(e) => setProjectForm({ ...projectForm, project_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Build REST API"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Description
                    </label>
                    <textarea
                      value={projectForm.project_description}
                      onChange={(e) => setProjectForm({ ...projectForm, project_description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the project requirements and objectives..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAssignProject}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Assign Project
                  </button>
                  <button
                    onClick={() => {
                      setShowProjectModal(false)
                      setProjectForm({ project_title: '', project_description: '', deadline: '' })
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Project Modal */}
        {showUpdateModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[60]">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-blue-700">Update Project</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedProject.project_title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUpdateModal(false)
                      setSelectedProject(null)
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progress: {updateForm.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={updateForm.progress}
                      onChange={(e) => setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${updateForm.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateProject}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Update Project
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateModal(false)
                      setSelectedProject(null)
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
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
