"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import API_URL from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Search, 
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  organization: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, searchTerm])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '7'
      })
      
      if (roleFilter) params.append('role', roleFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete user')
      
      alert('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) throw new Error('Failed to update role')
      
      alert('User role updated successfully')
      setShowEditModal(false)
      setSelectedUser(null)
      setNewRole("")
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'company': return 'bg-orange-100 text-orange-700'
      case 'university': return 'bg-blue-100 text-blue-700'
      case 'student': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex min-h-screen bg-purple-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            User Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage all system users
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
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        {/* Users Table */}
        <Card className="border-purple-200">
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
                    <thead className="bg-purple-50 border-b border-purple-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Organization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-purple-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-purple-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.organization || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setShowEditModal(true)
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(user.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      {user.organization && (
                        <p className="text-sm text-gray-600 mb-2">{user.organization}</p>
                      )}
                      <p className="text-xs text-gray-500 mb-3">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                            setShowEditModal(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-purple-600 border-purple-300"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 border-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
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
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="border-purple-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
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

        {/* Edit Role Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-purple-700 mb-4">Edit User Role</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">User</p>
                  <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                    <option value="university">University</option>
                    <option value="admin">Admin</option>
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
      </main>
    </div>
  )
}
