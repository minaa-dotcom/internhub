"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import { ADMIN_ENDPOINTS, getAuthHeaders } from "@/lib/apiConfig"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap,
  Search,
  Eye,
  Ban,
  CheckCircle,
  Edit,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  FileText
} from "lucide-react"

interface University {
  id: string
  email: string
  organization_name: string
  status: string
  created_at: string
  applications_count: number
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [editedName, setEditedName] = useState("")

  useEffect(() => {
    fetchUniversities()
  }, [currentPage, statusFilter, searchTerm])

  const fetchUniversities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${ADMIN_ENDPOINTS.UNIVERSITIES}?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch universities')
      
      const data = await response.json()
      setUniversities(data.universities || [])
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (universityId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'suspended' ? 'suspend' : 'activate'

    if (!confirm(`Are you sure you want to ${action} this university?`)) {
      return
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.UPDATE_USER_STATUS(universityId), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      alert(`University ${action}d successfully`)
      fetchUniversities()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleEditUniversity = async () => {
    if (!selectedUniversity || !editedName.trim()) return

    try {
      // Update organization_name through a custom endpoint or direct user update
      const response = await fetch(`${ADMIN_ENDPOINTS.USERS}/${selectedUniversity.id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ organization_name: editedName })
      })

      if (!response.ok) throw new Error('Failed to update university')
      
      alert('University updated successfully')
      setShowEditModal(false)
      setSelectedUniversity(null)
      setEditedName("")
      fetchUniversities()
    } catch (error) {
      console.error('Error updating university:', error)
      alert('Failed to update university')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300">Active</span>
      case 'suspended':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-300">Suspended</span>
      case 'pending':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">Pending</span>
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-300">{status}</span>
    }
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
            University Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage universities, verify registrations, and monitor activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {universities.length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {universities.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-900">
                    {universities.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {universities.filter(u => u.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Universities Table */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg text-blue-900">Universities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : universities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No universities found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-100 border-b border-blue-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">University Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">Applications</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-800 uppercase">Created Date</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-blue-800 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {universities.map((university) => (
                        <tr key={university.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-900">{university.organization_name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600">{university.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">{university.applications_count || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {getStatusBadge(university.status)}
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600">
                              {new Date(university.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                onClick={() => {
                                  setSelectedUniversity(university)
                                  setShowViewModal(true)
                                }}
                                variant="ghost"
                                size="sm"
                                title="View Details"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedUniversity(university)
                                  setEditedName(university.organization_name)
                                  setShowEditModal(true)
                                }}
                                variant="ghost"
                                size="sm"
                                title="Edit"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleToggleStatus(university.id, university.status)}
                                variant="ghost"
                                size="sm"
                                title={university.status === 'suspended' ? 'Activate' : 'Suspend'}
                                className={university.status === 'suspended' ? 
                                  "text-green-600 hover:text-green-700 hover:bg-green-50" : 
                                  "text-red-600 hover:text-red-700 hover:bg-red-50"
                                }
                              >
                                {university.status === 'suspended' ? 
                                  <CheckCircle className="h-4 w-4" /> : 
                                  <Ban className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {universities.map((university) => (
                    <div key={university.id} className="p-4 hover:bg-blue-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 break-words">{university.organization_name}</p>
                          <p className="text-xs text-gray-600 mt-1 break-words">{university.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusBadge(university.status)}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FileText className="h-3 w-3" />
                          <span>{university.applications_count || 0} apps</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => {
                            setSelectedUniversity(university)
                            setShowViewModal(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedUniversity(university)
                            setEditedName(university.organization_name)
                            setShowEditModal(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-purple-600 border-purple-300 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleToggleStatus(university.id, university.status)}
                          variant="outline"
                          size="sm"
                          className={university.status === 'suspended' ? 
                            "text-green-600 border-green-300 text-xs" : 
                            "text-red-600 border-red-300 text-xs"
                          }
                        >
                          {university.status === 'suspended' ? 
                            <><CheckCircle className="h-3 w-3 mr-1" />Activate</> : 
                            <><Ban className="h-3 w-3 mr-1" />Suspend</>
                          }
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="border-blue-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="border-blue-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedUniversity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">University Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">University Name</p>
                  <p className="font-medium break-words">{selectedUniversity.organization_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium break-words">{selectedUniversity.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  {getStatusBadge(selectedUniversity.status)}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="font-medium">{selectedUniversity.applications_count || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Registered Date</p>
                  <p className="font-medium">
                    {new Date(selectedUniversity.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedUniversity(null)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUniversity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Edit className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-700">Edit University</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Name</p>
                  <p className="font-medium break-words">{selectedUniversity.organization_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New University Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter university name"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleEditUniversity}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!editedName.trim()}
                  >
                    Update
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedUniversity(null)
                      setEditedName("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
