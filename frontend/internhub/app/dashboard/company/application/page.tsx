"use client"

import { useState, useEffect } from "react"
import { CompanySidebar } from "../../../../components/sidebar/CompanySidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RoleGuard from "@/components/RoleGuard"
import API_URL from "@/lib/api"
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  Star,
  Calendar,
  User,
  Mail,
  BookOpen,
  Github,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  FileText as FileIcon
} from "lucide-react"

interface Application {
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
  status: 'PENDING' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
  created_at: string
  university_id: string
  company_id: string
  university_name?: string
  feedback?: string
}

export default function CompanyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0
  })

  const itemsPerPage = 7

  // Fetch applications
  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [currentPage, statusFilter, departmentFilter])

  // Auto-refresh every 30 seconds to show new applications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications()
      fetchStats()
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, statusFilter, departmentFilter]);

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found')
        setLoading(false)
        // Don't redirect - let RoleGuard handle it
        return
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'ALL' && { status: statusFilter.toLowerCase() }),
        ...(departmentFilter !== 'ALL' && { department: departmentFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      console.log('Fetching applications from:', `${API_URL}/api/applications/company?${params}`)

      const response = await fetch(`${API_URL}/api/applications/company?${params}`, {
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
          throw new Error('You do not have permission to view applications. Please ensure you are logged in as a company user.')
        }
        
        throw new Error(errorData.message || 'Failed to fetch applications')
      }
      
      const data = await response.json()
      console.log('Applications fetched successfully:', data)
      setApplications(data.applications || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching applications:', error)
      alert(`Failed to load applications: ${error.message || 'Please try again'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found for stats')
        return
      }

      const response = await fetch(`${API_URL}/api/applications/company/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Error fetching stats:', errorData)
        
        if (response.status === 401 || response.status === 403) {
          // Don't redirect here, let fetchApplications handle it
          return
        }
        
        throw new Error(errorData.message || 'Failed to fetch stats')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Update application status
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('You must be logged in to update application status')
        return
      }

      console.log('Updating application:', applicationId, 'to status:', newStatus)

      const response = await fetch(`${API_URL}/api/applications/${applicationId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus.toLowerCase(),
          feedback: feedbackText || ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Error updating status:', errorData)
        
        if (response.status === 401) {
          alert('Your session may have expired. Please try logging out and logging in again.')
          return
        }
        
        if (response.status === 403) {
          alert('You do not have permission to update this application')
          return
        }
        
        throw new Error(errorData.message || 'Failed to update status')
      }
      
      console.log('Status updated successfully')
      
      // Refresh applications and stats
      await fetchApplications()
      await fetchStats()
      setShowDetailsModal(false)
      setSelectedApplication(null)
      setFeedbackText("")
      
    } catch (error) {
      console.error('Error updating status:', error)
      alert(`Failed to update application status: ${error instanceof Error ? error.message : 'Please try again'}`)
    }
  }

  // Download file
  const downloadFile = (fileUrl: string, fileName: string) => {
    const a = document.createElement('a')
    a.href = `${API_URL}${fileUrl}`
    a.download = fileName
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || 'PENDING';
    switch(normalizedStatus) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Clock className="h-3 w-3" /> Pending</span>
      case 'UNDER_REVIEW':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><AlertCircle className="h-3 w-3" /> Under Review</span>
      case 'SHORTLISTED':
        return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><Star className="h-3 w-3" /> Shortlisted</span>
      case 'ACCEPTED':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><CheckCircle className="h-3 w-3" /> Accepted</span>
      case 'REJECTED':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Rejected</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{status}</span>
    }
  }

  // Get status action buttons
  const getStatusActions = (application: Application) => {
    return (
      <div className="flex gap-2 mt-4 flex-wrap">
        {/* Accept Button - Available for PENDING, UNDER_REVIEW, and SHORTLISTED */}
        {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW' || application.status === 'SHORTLISTED') && (
          <button
            onClick={() => updateApplicationStatus(application.application_id, 'ACCEPTED')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <CheckCircle className="h-4 w-4" /> Accept
          </button>
        )}
        
        {/* Reject Button - Available for PENDING, UNDER_REVIEW, and SHORTLISTED */}
        {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW' || application.status === 'SHORTLISTED') && (
          <button
            onClick={() => updateApplicationStatus(application.application_id, 'REJECTED')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <XCircle className="h-4 w-4" /> Reject
          </button>
        )}
        
        {/* Additional Status Buttons */}
        {application.status === 'PENDING' && (
          <button
            onClick={() => updateApplicationStatus(application.application_id, 'UNDER_REVIEW')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <AlertCircle className="h-4 w-4" /> Review
          </button>
        )}
        
        {application.status === 'UNDER_REVIEW' && (
          <button
            onClick={() => updateApplicationStatus(application.application_id, 'SHORTLISTED')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Star className="h-4 w-4" /> Shortlist
          </button>
        )}
        
        {/* View Details Button - Always available */}
        <button
          onClick={() => {
            setSelectedApplication(application)
            setShowDetailsModal(true)
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Eye className="h-4 w-4" /> View Details
        </button>
        
        {/* Status Indicators for Final States */}
        {application.status === 'ACCEPTED' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
            <CheckCircle className="h-5 w-5" /> Application Accepted
          </div>
        )}
        
        {application.status === 'REJECTED' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
            <XCircle className="h-5 w-5" /> Application Rejected
          </div>
        )}
      </div>
    )
  }

  // Filter options
  const departments = ['ALL', 'Computer Science', 'Engineering', 'Business', 'Design', 'Marketing', 'paster']
  const statusOptions = ['ALL', 'PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']

  return (
    <RoleGuard allowedRoles={['company', 'admin']}>
      <div className="flex min-h-screen bg-blue-50">
        
        {/* Sidebar */}
        <CompanySidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
                Applications Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Review and manage all internship applications
              </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <Card className="border-blue-200">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <p className="text-xl sm:text-2xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-700">{stats.accepted}</p>
              <p className="text-xs text-gray-500">Accepted</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <p className="text-xl sm:text-2xl font-bold text-red-700">{stats.rejected}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-blue-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("ALL")
                    setDepartmentFilter("ALL")
                  }}
                  className="px-3 sm:px-4 py-2 text-sm border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table - Desktop */}
        <Card className="border-blue-200 hidden md:block">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-blue-700">Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Applicant</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Department</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Year</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Applied</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b border-blue-100 hover:bg-blue-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{app.first_name} {app.last_name}</p>
                              <p className="text-sm text-gray-500">{app.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{app.department}</td>
                          <td className="py-3 px-4 text-sm">{app.academic_year}</td>
                          <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedApplication(app)
                                  setShowDetailsModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              {app.status === 'PENDING' && (
                                <button
                                  onClick={() => updateApplicationStatus(app.application_id, 'UNDER_REVIEW')}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Start Review"
                                >
                                  <AlertCircle className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-blue-200 rounded-md disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-blue-200 rounded-md disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Applications Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <Card className="border-blue-200">
              <CardContent className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="border-blue-200">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No applications found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {applications.map((app) => (
                <Card key={app.id} className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {app.first_name[0]}{app.last_name[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{app.first_name} {app.last_name}</p>
                          <p className="text-xs text-gray-500 truncate">{app.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <BookOpen className="h-3 w-3" />
                        <span>{app.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedApplication(app)
                        setShowDetailsModal(true)
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </CardContent>
                </Card>
              ))}

              {/* Mobile Pagination */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-blue-200 rounded-md disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-blue-200 rounded-md disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Application Details Modal - Mobile Optimized */}
        {showDetailsModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                {/* Header - Simplified on Mobile */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-700">Application Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedApplication(null)
                      setFeedbackText("")
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Student Header - Mobile Optimized */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                    <h3 className="text-lg font-bold">{selectedApplication.first_name} {selectedApplication.last_name}</h3>
                    <p className="text-sm text-blue-100 mt-1">{selectedApplication.email}</p>
                    <div className="mt-2">{getStatusBadge(selectedApplication.status)}</div>
                  </div>

                  {/* Academic Info - Simplified on Mobile */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-3 text-sm sm:text-base hidden sm:flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Academic Information
                    </h4>
                    <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="font-medium text-sm">{selectedApplication.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Academic Year</p>
                        <p className="font-medium text-sm">{selectedApplication.academic_year}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Links - Hidden on Mobile */}
                  <div className="bg-blue-50 p-4 rounded-lg hidden sm:block">
                    <h4 className="font-semibold text-blue-700 mb-3">Profile Links</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Github className="h-5 w-5 text-gray-600" />
                        <a href={selectedApplication.github_link} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline text-sm truncate">
                          GitHub Profile
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-gray-600" />
                        <a href={selectedApplication.linkedin_link} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:underline text-sm truncate">
                          LinkedIn Profile
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Documents - Simplified on Mobile */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-3 text-sm sm:text-base hidden sm:flex items-center gap-2">
                      <FileIcon className="h-5 w-5" />
                      Documents
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => downloadFile(selectedApplication.cv_url, `CV_${selectedApplication.first_name}_${selectedApplication.last_name}.pdf`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download CV
                      </button>
                      <button
                        onClick={() => downloadFile(selectedApplication.resume_url, `Resume_${selectedApplication.first_name}_${selectedApplication.last_name}.pdf`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume
                      </button>
                    </div>
                  </div>

                  {/* Status and Actions - Simplified on Mobile */}
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-3 text-sm sm:text-base hidden sm:block">Review & Actions</h4>

                    {selectedApplication.feedback && (
                      <div className="mb-3 p-3 bg-white rounded border border-blue-200">
                        <p className="text-xs font-medium text-gray-700">Feedback:</p>
                        <p className="text-xs text-gray-600">{selectedApplication.feedback}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <textarea
                        placeholder="Add feedback (optional)"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={2}
                      />
                      
                      {/* Primary Action Buttons - Stacked on Mobile */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {selectedApplication.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedApplication.application_id, 'ACCEPTED')}
                            className="w-full bg-green-600 text-white px-4 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </button>
                        )}
                        
                        {selectedApplication.status !== 'REJECTED' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedApplication.application_id, 'REJECTED')}
                            className="w-full bg-red-600 text-white px-4 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        )}
                      </div>

                      {/* Secondary Action Buttons - Hidden on Mobile */}
                      <div className="hidden sm:flex gap-2 flex-wrap pt-2 border-t border-blue-200">
                        {selectedApplication.status === 'PENDING' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedApplication.application_id, 'UNDER_REVIEW')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                          >
                            <AlertCircle className="h-4 w-4" />
                            Start Review
                          </button>
                        )}
                        
                        {selectedApplication.status === 'UNDER_REVIEW' && (
                          <button
                            onClick={() => updateApplicationStatus(selectedApplication.application_id, 'SHORTLISTED')}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                          >
                            <Star className="h-4 w-4" />
                            Shortlist
                          </button>
                        )}
                        
                        {/* Status Indicators for Final States */}
                        {selectedApplication.status === 'ACCEPTED' && (
                          <div className="w-full p-4 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <CheckCircle className="h-6 w-6" />
                            This application has been accepted
                          </div>
                        )}
                        
                        {selectedApplication.status === 'REJECTED' && (
                          <div className="w-full p-4 bg-red-100 text-red-700 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <XCircle className="h-6 w-6" />
                            This application has been rejected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </RoleGuard>
  )
}