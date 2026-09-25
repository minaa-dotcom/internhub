"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import { ADMIN_ENDPOINTS, getAuthHeaders } from "@/lib/apiConfig"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2,
  Search,
  Eye,
  Ban,
  CheckCircle,
  Edit,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Clock
} from "lucide-react"

interface Company {
  id: string
  email: string
  organization_name: string
  status: string
  created_at: string
  internship_posts_count: number
  active_posts_count: number
  mentors_count: number
  applications_count: number
  pending_applications: number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [editedName, setEditedName] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [currentPage, statusFilter, searchTerm])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${ADMIN_ENDPOINTS.COMPANIES}?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch companies')
      
      const data = await response.json()
      setCompanies(data.companies || [])
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (companyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'suspended' ? 'suspend' : 'activate'

    if (!confirm(`Are you sure you want to ${action} this company? This will affect all their internship posts.`)) {
      return
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.UPDATE_USER_STATUS(companyId), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      alert(`Company ${action}d successfully`)
      fetchCompanies()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleEditCompany = async () => {
    if (!selectedCompany || !editedName.trim()) return

    try {
      const response = await fetch(`${ADMIN_ENDPOINTS.USERS}/${selectedCompany.id}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ organization_name: editedName })
      })

      if (!response.ok) throw new Error('Failed to update company')
      
      alert('Company updated successfully')
      setShowEditModal(false)
      setSelectedCompany(null)
      setEditedName("")
      fetchCompanies()
    } catch (error) {
      console.error('Error updating company:', error)
      alert('Failed to update company')
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

  const getActivityLevel = (company: Company) => {
    if (company.active_posts_count >= 5) return { label: 'High', color: 'text-green-600' }
    if (company.active_posts_count >= 2) return { label: 'Medium', color: 'text-yellow-600' }
    if (company.active_posts_count >= 1) return { label: 'Low', color: 'text-orange-600' }
    return { label: 'Inactive', color: 'text-gray-600' }
  }

  return (
    <div className="flex min-h-screen bg-orange-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
            Company Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage companies, monitor internship posts, and track activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {companies.length}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {companies.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Posts</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {companies.reduce((sum, c) => sum + (c.active_posts_count || 0), 0)}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Mentors</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {companies.reduce((sum, c) => sum + (c.mentors_count || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-lg text-orange-900">Companies</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No companies found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-orange-100 border-b border-orange-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase">Company Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase">Email</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-orange-800 uppercase">Posts</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-orange-800 uppercase">Mentors</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-orange-800 uppercase">Applications</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase">Activity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-orange-800 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-orange-800 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {companies.map((company) => {
                        const activity = getActivityLevel(company)
                        return (
                          <tr key={company.id} className="hover:bg-orange-50 transition-colors">
                            <td className="px-4 py-4">
                              <p className="font-medium text-gray-900">{company.organization_name}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm text-gray-600 break-all">{company.email}</p>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-bold text-blue-600">{company.active_posts_count}</span>
                                <span className="text-xs text-gray-500">of {company.internship_posts_count}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-medium text-purple-600">{company.mentors_count || 0}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-bold text-gray-900">{company.applications_count || 0}</span>
                                {company.pending_applications > 0 && (
                                  <span className="text-xs text-yellow-600">({company.pending_applications} pending)</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-sm font-medium ${activity.color}`}>{activity.label}</span>
                            </td>
                            <td className="px-4 py-4">
                              {getStatusBadge(company.status)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-1">
                                <Button
                                  onClick={() => {
                                    setSelectedCompany(company)
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
                                    setSelectedCompany(company)
                                    setEditedName(company.organization_name)
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
                                  onClick={() => handleToggleStatus(company.id, company.status)}
                                  variant="ghost"
                                  size="sm"
                                  title={company.status === 'suspended' ? 'Activate' : 'Suspend'}
                                  className={company.status === 'suspended' ? 
                                    "text-green-600 hover:text-green-700 hover:bg-green-50" : 
                                    "text-red-600 hover:text-red-700 hover:bg-red-50"
                                  }
                                >
                                  {company.status === 'suspended' ? 
                                    <CheckCircle className="h-4 w-4" /> : 
                                    <Ban className="h-4 w-4" />
                                  }
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {companies.map((company) => {
                    const activity = getActivityLevel(company)
                    return (
                      <div key={company.id} className="p-4 hover:bg-orange-50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 break-words">{company.organization_name}</p>
                            <p className="text-xs text-gray-600 mt-1 break-all">{company.email}</p>
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-blue-50 p-2 rounded text-center">
                            <p className="text-xs text-gray-600">Posts</p>
                            <p className="text-sm font-bold text-blue-600">{company.active_posts_count}/{company.internship_posts_count}</p>
                          </div>
                          <div className="bg-purple-50 p-2 rounded text-center">
                            <p className="text-xs text-gray-600">Mentors</p>
                            <p className="text-sm font-bold text-purple-600">{company.mentors_count}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded text-center">
                            <p className="text-xs text-gray-600">Apps</p>
                            <p className="text-sm font-bold text-gray-900">{company.applications_count}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          {getStatusBadge(company.status)}
                          <span className={`text-xs font-medium ${activity.color}`}>• {activity.label} Activity</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            onClick={() => {
                              setSelectedCompany(company)
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
                              setSelectedCompany(company)
                              setEditedName(company.organization_name)
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
                            onClick={() => handleToggleStatus(company.id, company.status)}
                            variant="outline"
                            size="sm"
                            className={company.status === 'suspended' ? 
                              "text-green-600 border-green-300 text-xs" : 
                              "text-red-600 border-red-300 text-xs"
                            }
                          >
                            {company.status === 'suspended' ? 
                              <><CheckCircle className="h-3 w-3 mr-1" />Activate</> : 
                              <><Ban className="h-3 w-3 mr-1" />Suspend</>
                            }
                          </Button>
                        </div>
                      </div>
                    )
                  })}
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
              className="border-orange-300"
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
              className="border-orange-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Company Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Company Name</p>
                  <p className="font-medium break-words">{selectedCompany.organization_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium break-all">{selectedCompany.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  {getStatusBadge(selectedCompany.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedCompany.internship_posts_count}</p>
                    <p className="text-xs text-gray-500">{selectedCompany.active_posts_count} active</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mentors</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedCompany.mentors_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedCompany.applications_count}</p>
                    {selectedCompany.pending_applications > 0 && (
                      <p className="text-xs text-yellow-600">{selectedCompany.pending_applications} pending</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Activity</p>
                    <p className={`text-lg font-bold ${getActivityLevel(selectedCompany).color}`}>
                      {getActivityLevel(selectedCompany).label}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Registered Date</p>
                  <p className="font-medium">
                    {new Date(selectedCompany.created_at).toLocaleDateString('en-US', {
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
                    setSelectedCompany(null)
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Edit className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-700">Edit Company</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Name</p>
                  <p className="font-medium break-words">{selectedCompany.organization_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Company Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleEditCompany}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!editedName.trim()}
                  >
                    Update
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedCompany(null)
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
