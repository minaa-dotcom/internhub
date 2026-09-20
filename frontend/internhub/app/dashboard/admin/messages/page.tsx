"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import API_URL from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react"

interface Message {
  id: string
  sender_email: string
  sender_name: string
  sender_role: string
  receiver_email: string
  receiver_name: string
  receiver_role: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [currentPage])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/api/admin/messages?page=${currentPage}&limit=7`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-orange-100 text-orange-700'
      case 'advisor': return 'bg-green-100 text-green-700'
      case 'student': return 'bg-blue-100 text-blue-700'
      case 'company': return 'bg-purple-100 text-purple-700'
      case 'university': return 'bg-indigo-100 text-indigo-700'
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
            <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />
            System Messages
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View all messages in the system
          </p>
        </div>

        {/* Messages Table */}
        <Card className="border-purple-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No messages found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-50 border-b border-purple-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-purple-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-purple-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 text-sm">{msg.sender_name}</p>
                            <p className="text-xs text-gray-600">{msg.sender_email}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(msg.sender_role)}`}>
                              {msg.sender_role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 text-sm">{msg.receiver_name}</p>
                            <p className="text-xs text-gray-600">{msg.receiver_email}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(msg.receiver_role)}`}>
                              {msg.receiver_role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {msg.subject}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              msg.is_read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {msg.is_read ? 'Read' : 'Unread'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button
                              onClick={() => setSelectedMessage(msg)}
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 hover:bg-purple-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{msg.sender_name}</p>
                          <p className="text-xs text-gray-600">{msg.sender_email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(msg.sender_role)}`}>
                            {msg.sender_role}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          msg.is_read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {msg.is_read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">To:</p>
                        <p className="font-medium text-gray-900 text-sm">{msg.receiver_name}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(msg.receiver_role)}`}>
                          {msg.receiver_role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2 truncate">{msg.subject}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                      <Button
                        onClick={() => setSelectedMessage(msg)}
                        variant="outline"
                        size="sm"
                        className="w-full text-purple-600 border-purple-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Message
                      </Button>
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

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-purple-700">Message Details</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">From</p>
                    <p className="font-medium">{selectedMessage.sender_name}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.sender_email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(selectedMessage.sender_role)}`}>
                      {selectedMessage.sender_role}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">To</p>
                    <p className="font-medium">{selectedMessage.receiver_name}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.receiver_email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(selectedMessage.receiver_role)}`}>
                      {selectedMessage.receiver_role}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Subject</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Message</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedMessage.is_read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedMessage.is_read ? 'Read' : 'Unread'}
                  </span>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => setSelectedMessage(null)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
