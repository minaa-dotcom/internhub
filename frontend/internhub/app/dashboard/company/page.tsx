"use client"

import { useEffect, useState } from "react"
import { CompanySidebar } from "../../../components/sidebar/CompanySidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, CheckCircle, Clock, Users, Briefcase, TrendingUp, PlusCircle, MapPin, Timer, X } from "lucide-react"
import API_URL from "@/lib/api"
import Link from "next/link"

interface InternshipPost {
  id: string
  title: string
  department: string
  location: string
  work_type: string
  duration: string
  stipend: string
  positions_available: number
  description: string
  requirements: string
  skills_required: string
  deadline: string
  created_at: string
  status: string
}

export default function CompanyDashboard() {
  const [posts, setPosts] = useState<InternshipPost[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 })
  const [selectedPost, setSelectedPost] = useState<InternshipPost | null>(null)
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    fetchPosts()
    fetchStats()
    // Read company name from token
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.organization_name) setCompanyName(payload.organization_name)
      } catch {}
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/internship-posts/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setPosts(data.posts.filter((p: InternshipPost) => p.status === "active"))
    } catch (err) {
      console.error("Failed to fetch posts:", err)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/applications/company/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }

  const handleClose = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`${API_URL}/api/internship-posts/${id}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPosts()
    } catch (err) {
      console.error("Failed to close post:", err)
    }
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <CompanySidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
              {companyName ? `${companyName} Dashboard` : "Company Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">Manage your internship programs and applicants</p>
          </div>
          <Link href="/dashboard/company/post-internship"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            <PlusCircle className="h-4 w-4" /> Post New Internship
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><p className="text-xl sm:text-2xl font-bold">{stats.total}</p></CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Active Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><p className="text-xl sm:text-2xl font-bold">{posts.length}</p></CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><p className="text-xl sm:text-2xl font-bold">{stats.accepted}</p></CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><p className="text-xl sm:text-2xl font-bold">{stats.pending}</p></CardContent>
          </Card>
        </div>

        {/* Active Internship Positions */}
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg text-blue-700 flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Active Internship Positions
            </CardTitle>
            <Link href="/dashboard/company/post-internship"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Post New
            </Link>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-10">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No active positions yet</p>
                <Link href="/dashboard/company/post-internship"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  <PlusCircle className="h-4 w-4" /> Post Your First Internship
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                          {post.department && <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{post.department}</span>}
                          {post.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{post.location}</span>}
                          {post.duration && <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{post.duration}</span>}
                          <span className="capitalize">{post.work_type}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {post.stipend && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{post.stipend}</span>}
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{post.positions_available} position{post.positions_available !== 1 ? "s" : ""}</span>
                          {post.deadline && <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded">Deadline: {new Date(post.deadline).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <button onClick={() => setSelectedPost(post)}
                          className="text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50">
                          View
                        </button>
                        <button onClick={() => handleClose(post.id)}
                          className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-blue-200">
          <h2 className="text-base sm:text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Quick Actions
          </h2>
          <div className="flex gap-3 flex-wrap">
            <a href="/dashboard/company/application" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
              Review Applications
            </a>
            <a href="/dashboard/company/post-internship" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm">
              Post New Internship
            </a>
            <a href="/dashboard/company/mentors" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm">
              Manage Mentors
            </a>
          </div>
        </div>

      </main>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-blue-700">{selectedPost.title}</h2>
                <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4 text-sm">
                {selectedPost.department && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{selectedPost.department}</span>}
                {selectedPost.location && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{selectedPost.location}</span>}
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full capitalize">{selectedPost.work_type}</span>
                {selectedPost.duration && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{selectedPost.duration}</span>}
                {selectedPost.stipend && <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">{selectedPost.stipend}</span>}
              </div>
              {selectedPost.description && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedPost.description}</p>
                </div>
              )}
              {selectedPost.requirements && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Requirements</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedPost.requirements}</p>
                </div>
              )}
              {selectedPost.skills_required && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.skills_required.split(",").map(s => (
                      <span key={s} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPost.deadline && (
                <p className="text-sm text-orange-600">Application Deadline: {new Date(selectedPost.deadline).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
