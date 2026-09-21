"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import { ADMIN_ENDPOINTS, getAuthHeaders } from "@/lib/apiConfig"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Search, 
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Key,
  Shield,
  Activity,
  Eye,
  Ban,
  CheckCircle
} from "lucide-react"

interface User {
  id: string
  email: string
  organization_name?: string
  role: string
  status?: string
  created_at: string
}

interface ActivityItem {
  type: string
  icon: string
  color: string
  title: string
  description: string
  timestamp: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState("")
  const [tempPassword, setTempPassword] = useState("")

  useEffect(() => {
    fetchUsers()
    fetchRecentActivities()
    const interval = setInterval(() => {
      fetchUsers()
      fetchRecentActivities()
    }, 30000)
    return () => clearInterval(interval)
  }, [currentPage, roleFilter, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (roleFilter) params.append('role', roleFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${ADMIN_ENDPOINTS.USERS}?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users || [])
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.ACTIVITIES, {
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch activities')

      const data = await response.json()
      if (data.success) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.DELETE_USER(userId), {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to delete user')
      
      alert('User deleted successfully')
      fetchUsers()
      fetchRecentActivities()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return

    // Extra confirmation for admin role changes
    if (newRole === 'admin') {
      if (!confirm('⚠️ WARNING: You are about to grant ADMIN privileges. This gives full system access. Are you absolutely sure?')) {
        return
      }
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.UPDATE_USER_ROLE(selectedUser.id), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update role')
      
      alert('User role updated successfully')
      setShowEditModal(false)
      setSelectedUser(null)
      setNewRole("")
      fetchUsers()
      fetchRecentActivities()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'suspended' ? 'suspend' : 'activate'

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.UPDATE_USER_STATUS(userId), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      alert(`User ${action}d successfully`)
      fetchUsers()
      fetchRecentActivities()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return

    if (!confirm(`Reset password for ${selectedUser.email}? A temporary password will be generated.`)) {
      return
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.RESET_PASSWORD(selectedUser.id), {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to reset password')
      
      const data = await response.json()
      setTempPassword(data.tempPassword)
      setShowPasswordModal(true)
      fetchRecentActivities()
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'company': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'university': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'student': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusBadge = (status?: string) => {
    if (status === 'suspended') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-300">Suspended</span>
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-300">Active</span>
  }

  const getActivityColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      red: 'bg-red-500'
    }
    return colors[color] || 'bg-gray-500'
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  return (
    <div className="flex min-h-screen bg-purple-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            User Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage all system users, roles, and permissions
          </p>
        </div>

        {/* Filters */}
        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by email or organization..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="company">Company</option>
                <option value="university">University</option>
                <option value="student">Student</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Users Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900">Users</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-purple-100 border-b border-purple-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-800 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-800 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-purple-800 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-purple-800 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-purple-50 transition-colors">
                              <td className="px-4 py-4">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{user.email}</p>
                                  {user.organization_name && (
                                    <p className="text-xs text-gray-500 mt-0.5">{user.organization_name}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                  {user.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                {getStatusBadge(user.status)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    onClick={() => {
                                      setSelectedUser(user)
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
                                      setSelectedUser(user)
                                      setNewRole(user.role)
                                      setShowEditModal(true)
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    title="Change Role"
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                                    variant="ghost"
                                    size="sm"
                                    title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                    className={user.status === 'suspended' ? 
                                      "text-green-600 hover:text-green-700 hover:bg-green-50" : 
                                      "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                    }
                                  >
                                    {user.status === 'suspended' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedUser(user)
                                      handleResetPassword()
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    title="Reset Password"
                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  >
                                    <Key className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                    variant="ghost"
                                    size="sm"
                                    title="Delete User"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
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
                      {users.map((user) => (
                        <div key={user.id} className="p-4 hover:bg-purple-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm break-words">{user.email}</p>
                              {user.organization_name && (
                                <p className="text-xs text-gray-600 mt-1">{user.organization_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mb-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                            {getStatusBadge(user.status)}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              onClick={() => {
                                setSelectedUser(user)
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
                                setSelectedUser(user)
                                setNewRole(user.role)
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
                              onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                              variant="outline"
                              size="sm"
                              className={user.status === 'suspended' ? 
                                "text-green-600 border-green-300 text-xs" : 
                                "text-yellow-600 border-yellow-300 text-xs"
                              }
                            >
                              {user.status === 'suspended' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Ban className="h-3 w-3 mr-1" />}
                              {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedUser(user)
                                handleResetPassword()
                              }}
                              variant="outline"
                              size="sm"
                              className="text-orange-600 border-orange-300 text-xs"
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Reset
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 col-span-2 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
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
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-purple-300"
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
                  className="border-purple-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Recent Activity - Takes 1 column */}
          <div>
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-base text-purple-900 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mt-2" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.color)} mt-2 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-600 break-words">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activities</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium break-words">{selectedUser.email}</p>
                </div>

                {selectedUser.organization_name && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Organization</p>
                    <p className="font-medium">{selectedUser.organization_name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  {getStatusBadge(selectedUser.status)}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Joined</p>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>

                <Button
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedUser(null)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-bold text-purple-700">Change User Role</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Warning:</strong> Changing roles affects user permissions and access levels.
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">User</p>
                  <p className="font-medium break-words">{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Role</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                    <option value="university">University</option>
                    <option value="admin">⚠️ Admin (Full Access)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleUpdateRole}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Update Role
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedUser(null)
                      setNewRole("")
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

        {/* Password Reset Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-2 mb-4">
                <Key className="h-5 w-5 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Password Reset</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">✅ Password reset successfully!</p>
                  <p className="text-sm text-green-700">
                    Temporary password generated. Please share this securely with the user.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Temporary Password</label>
                  <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
                    <code className="text-sm font-mono text-gray-900 break-all">{tempPassword}</code>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ⚠️ User must change this password upon first login
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setTempPassword("")
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
