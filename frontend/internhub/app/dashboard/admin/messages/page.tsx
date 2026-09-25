"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import { ADMIN_ENDPOINTS, getAuthHeaders } from "@/lib/apiConfig"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Mail,
  Search,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MailOpen,
  MailWarning,
  Users,
  TrendingUp,
  Clock,
  Filter,
  X
} from "lucide-react"

interface Message {
  id: string
  sender_id: string
  sender_email: string
  sender_name: string
  sender_role: string
  receiver_id: string
  receiver_email: string
  receiver_name: string
  receiver_role: string
  subject: string
  message: string
  is_read: boolean
  read_status: string
  created_at: string
}

interface MessageStats {
  total_messages: string
  unread_messages: string
  read_messages: string
  unique_senders: string
  unique_receivers: string
  last_24h: string
  last_7days: string
  from_companies: string
  from_universities: string
  from_students: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<MessageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])
  const [loadingConversation, setLoadingConversation] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [currentPage, statusFilter, roleFilter, searchTerm])

  const fetchStats = async () => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.MESSAGE_STATS, {
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (roleFilter) params.append('role_filter', roleFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${ADMIN_ENDPOINTS.MESSAGES}?${params}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      setMessages(data.messages || [])
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(ADMIN_ENDPOINTS.DELETE_MESSAGE(messageId), {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) throw new Error('Failed to delete message')
      
      alert('Message deleted successfully')
      fetchMessages()
      fetchStats()
      setShowViewModal(false)
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message')
    }
  }

  const handleViewConversation = async (message: Message) => {
    setShowConversationModal(true)
    setLoadingConversation(true)

    try {
      const response = await fetch(
        ADMIN_ENDPOINTS.CONVERSATION(message.sender_id, message.receiver_id),
        { headers: getAuthHeaders() }
      )

      if (!response.ok) throw new Error('Failed to fetch conversation')
      
      const data = await response.json()
      setConversationMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching conversation:', error)
      alert('Failed to load conversation')
    } finally {
      setLoadingConversation(false)
    }
  }

  const getStatusBadge = (isRead: boolean) => {
    return isRead ? (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300 flex items-center gap-1">
        <MailOpen className="h-3 w-3" />
        Read
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300 flex items-center gap-1">
        <MailWarning className="h-3 w-3" />
        Unread
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-700 border-blue-300',
      company: 'bg-green-100 text-green-700 border-green-300',
      university: 'bg-purple-100 text-purple-700 border-purple-300',
      admin: 'bg-red-100 text-red-700 border-red-300'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${colors[role] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (hours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex min-h-screen bg-orange-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-900 flex items-center gap-2">
            <Mail className="h-6 w-6 sm:h-8 sm:w-8" />
            Messages Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Monitor all system messages and communications
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.total_messages}
                    </p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {stats.unread_messages}
                    </p>
                  </div>
                  <MailWarning className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last 24h</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.last_24h}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {parseInt(stats.unique_senders) + parseInt(stats.unique_receivers)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by subject, message, sender or receiver..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="company">Company</option>
                  <option value="university">University</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>

                {(statusFilter || roleFilter || searchTerm) && (
                  <Button
                    onClick={() => {
                      setStatusFilter("")
                      setRoleFilter("")
                      setSearchTerm("")
                      setCurrentPage(1)
                    }}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-lg text-orange-900">Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 hover:bg-orange-50 transition-colors ${!message.is_read ? 'bg-yellow-50/30' : ''}`}
                  >
                    {/* Desktop View */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 items-start">
                      <div className="col-span-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {message.sender_name}
                            </p>
                            {getRoleBadge(message.sender_role)}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{message.sender_email}</p>
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-center">
                        <span className="text-gray-400">→</span>
                      </div>

                      <div className="col-span-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {message.receiver_name}
                            </p>
                            {getRoleBadge(message.receiver_role)}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{message.receiver_email}</p>
                        </div>
                      </div>

                      <div className="col-span-3">
                        <p className="font-medium text-sm text-gray-900 truncate mb-1">
                          {message.subject || "No Subject"}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {message.message}
                        </p>
                      </div>

                      <div className="col-span-2 flex flex-col items-end gap-2">
                        <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
                        {getStatusBadge(message.is_read)}
                        <div className="flex gap-1">
                          <Button
                            onClick={() => {
                              setSelectedMessage(message)
                              setShowViewModal(true)
                            }}
                            variant="ghost"
                            size="sm"
                            title="View Message"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleViewConversation(message)}
                            variant="ghost"
                            size="sm"
                            title="View Conversation"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteMessage(message.id)}
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{message.sender_name}</p>
                            {getRoleBadge(message.sender_role)}
                          </div>
                          <p className="text-xs text-gray-500">→ {message.receiver_name}</p>
                        </div>
                        {getStatusBadge(message.is_read)}
                      </div>

                      <div>
                        <p className="font-medium text-sm mb-1">{message.subject || "No Subject"}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{message.message}</p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => {
                              setSelectedMessage(message)
                              setShowViewModal(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleViewConversation(message)}
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-300"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteMessage(message.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

        {/* View Message Modal */}
        {showViewModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                </div>
                {getStatusBadge(selectedMessage.is_read)}
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">From</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedMessage.sender_name}</p>
                        {getRoleBadge(selectedMessage.sender_role)}
                      </div>
                      <p className="text-sm text-gray-600">{selectedMessage.sender_email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-1">To</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selectedMessage.receiver_name}</p>
                      {getRoleBadge(selectedMessage.receiver_role)}
                    </div>
                    <p className="text-sm text-gray-600">{selectedMessage.receiver_email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Subject</p>
                  <p className="font-medium text-lg">{selectedMessage.subject || "No Subject"}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Message</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleViewConversation(selectedMessage)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    View Conversation
                  </Button>
                  <Button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedMessage(null)
                    }}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Modal */}
        {showConversationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Full Conversation</h2>
                </div>
                <Button
                  onClick={() => {
                    setShowConversationModal(false)
                    setConversationMessages([])
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {loadingConversation ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {conversationMessages.map((msg, index) => (
                    <div 
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        index % 2 === 0 ? 'bg-blue-50 ml-0 mr-8' : 'bg-gray-50 ml-8 mr-0'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{msg.sender_name}</p>
                          {getRoleBadge(msg.sender_role)}
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(msg.created_at)}</p>
                      </div>
                      {msg.subject && (
                        <p className="font-medium text-sm mb-2">{msg.subject}</p>
                      )}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
