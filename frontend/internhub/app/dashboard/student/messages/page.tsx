"use client"

import { useState, useEffect, useRef } from "react"
import { StudentSidebar } from "../../../../components/sidebar/StudentSidebar"
import { Card, CardContent } from "@/components/ui/card"
import API_URL from "@/lib/api"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Search, 
  Send,
  User,
  Loader2,
  AlertCircle,
  Plus,
  X
} from "lucide-react"

interface Conversation {
  other_user_id: string
  other_user_email: string
  other_user_name: string
  other_user_role: string
  last_message: string
  last_message_at: string
  unread_count: number
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  receiver_id: string
  receiver_name: string
  message: string
  subject: string
  is_read: boolean
  created_at: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [newMessageForm, setNewMessageForm] = useState({
    receiver_email: "",
    receiver_name: "",
    receiver_role: "student",
    subject: "",
    message: ""
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = useRef<string>("")

  useEffect(() => {
    fetchConversations()
    // Get current user ID from token
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      currentUserId.current = payload.id
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.other_user_id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch conversations')
      
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      setMessages(data.messages || [])
      
      // Refresh conversations to update unread count
      fetchConversations()
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: selectedConversation.other_user_id,
          receiver_email: selectedConversation.other_user_email,
          receiver_name: selectedConversation.other_user_name,
          receiver_role: selectedConversation.other_user_role,
          subject: "Reply",
          message: newMessage
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      setNewMessage("")
      fetchMessages(selectedConversation.other_user_id)
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const sendNewMessage = async () => {
    if (!newMessageForm.receiver_email || !newMessageForm.message) {
      alert('Please fill in all required fields')
      return
    }

    setSending(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
      
      // For now, use email as ID (will need proper user lookup in production)
      const receiverId = newMessageForm.receiver_email
      
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          receiver_email: newMessageForm.receiver_email,
          receiver_name: newMessageForm.receiver_name || newMessageForm.receiver_email,
          receiver_role: newMessageForm.receiver_role,
          subject: newMessageForm.subject || "New Message",
          message: newMessageForm.message
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to send message. Status:', response.status)
        console.error('Error response:', errorText)
        throw new Error('Failed to send message')
      }
      
      setShowNewMessageModal(false)
      setNewMessageForm({
        receiver_email: "",
        receiver_name: "",
        receiver_role: "student",
        subject: "",
        message: ""
      })
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please check the console for details.')
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-orange-500'
      case 'advisor': return 'bg-green-500'
      case 'student': return 'bg-blue-500'
      case 'company': return 'bg-purple-500'
      case 'university': return 'bg-indigo-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <StudentSidebar />

      <main className="flex-1 flex flex-col h-screen w-full">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />
                Messages
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Communicate with mentors, advisors, and peers
              </p>
            </div>
            <Button
              onClick={() => setShowNewMessageModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.other_user_id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedConversation?.other_user_id === conv.other_user_id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${getRoleColor(conv.other_user_role)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-bold">
                          {conv.other_user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm truncate">{conv.other_user_name}</p>
                          {conv.unread_count > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{conv.other_user_role}</p>
                        <p className="text-xs text-gray-600 truncate mt-1">{conv.last_message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.last_message_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50 hidden md:flex">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getRoleColor(selectedConversation.other_user_role)} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">
                        {selectedConversation.other_user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{selectedConversation.other_user_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{selectedConversation.other_user_role}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId.current
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isOwn ? 'bg-blue-600 text-white' : 'bg-white'} rounded-lg p-3 shadow-sm`}>
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-75">{msg.sender_name}</p>
                          )}
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !sending && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-700">New Message</h2>
                <button onClick={() => setShowNewMessageModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    value={newMessageForm.receiver_email}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, receiver_email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={newMessageForm.receiver_name}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, receiver_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Recipient Role</label>
                  <select
                    value={newMessageForm.receiver_role}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, receiver_role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="advisor">Advisor</option>
                    <option value="company">Company</option>
                    <option value="university">University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={newMessageForm.subject}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message *</label>
                  <textarea
                    value={newMessageForm.message}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={sendNewMessage}
                    disabled={sending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Send
                  </Button>
                  <Button
                    onClick={() => setShowNewMessageModal(false)}
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
