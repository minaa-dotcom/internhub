"use client"

import { useEffect, useState } from "react"
import { UniversitySidebar } from "@/components/sidebar/UniversitySideBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Building2, Briefcase, Calendar, MapPin, Timer, X, Send } from "lucide-react"
import API_URL from "@/lib/api"
import ApplyInternshipDialog from "@/components/popup/ApplicationPopup"
import type { Application } from "../../types/Application"

interface InternshipPost {
  id: string
  company_id: string
  company_name: string
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
}

interface CompanyGroup {
  company_name: string
  company_id: string
  posts: InternshipPost[]
}

export default function UniversityDashboard() {
  const [posts, setPosts] = useState<InternshipPost[]>([])
  const [selectedPost, setSelectedPost] = useState<InternshipPost | null>(null)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/internship-posts`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setPosts(data.posts)
    } catch (err) {
      console.error("Failed to fetch posts:", err)
    }
  }

  // Group posts by company
  const companies: CompanyGroup[] = posts.reduce((acc: CompanyGroup[], post) => {
    const existing = acc.find(c => c.company_id === post.company_id)
    if (existing) existing.posts.push(post)
    else acc.push({ company_name: post.company_name, company_id: post.company_id, posts: [post] })
    return acc
  }, [])

  const handleApplicationSubmit = (app: Application) => {
    // Optionally refresh or show notification
    console.log("Application submitted:", app)
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <UniversitySidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 w-full">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">University Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of internship activities</p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Active Companies</CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><p className="text-xl sm:text-2xl font-bold">{companies.length}</p></CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Open Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><p className="text-xl sm:text-2xl font-bold">{posts.length}</p></CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Deadlines Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold">
                {posts.filter(p => p.deadline && (new Date(p.deadline).getTime() - Date.now()) < 7 * 86400000).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Total Positions</CardTitle>
              <Send className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold">
                {posts.reduce((sum, p) => sum + (p.positions_available || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">

          {/* Active Companies */}
          <Card className="border-blue-200 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-blue-700 flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Active Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No active companies yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map(company => (
                    <div key={company.company_id} className="border border-blue-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">{company.company_name[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{company.company_name}</p>
                            <p className="text-xs text-gray-500">{company.posts.length} internship{company.posts.length !== 1 ? "s" : ""} posted</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="space-y-2">
                        {company.posts.map(post => (
                          <div key={post.id} className="bg-blue-50 rounded-lg px-3 py-2">
                            <div className="flex justify-between items-start gap-2">
                              <button onClick={() => setSelectedPost(post)} className="flex-1 text-left">
                                <p className="text-sm font-medium text-blue-700">{post.title}</p>
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                                  {post.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{post.location}</span>}
                                  {post.duration && <span className="flex items-center gap-0.5"><Timer className="h-3 w-3" />{post.duration}</span>}
                                  <span className="capitalize">{post.work_type}</span>
                                  {post.stipend && <span className="text-green-600">{post.stipend}</span>}
                                </div>
                              </button>
                              <ApplyInternshipDialog
                                onSubmit={handleApplicationSubmit}
                                companyId={post.company_id}
                                internshipTitle={`${post.title} at ${post.company_name}`}
                                triggerText="Apply"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Deadlines */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-blue-700 flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Application Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.filter(p => p.deadline).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {posts
                    .filter(p => p.deadline)
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .slice(0, 5)
                    .map(post => (
                      <div key={post.id} className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-xs sm:text-sm truncate">{post.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{post.company_name}</p>
                        <p className="text-xs text-orange-600 mt-1">{new Date(post.deadline).toLocaleDateString()}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-blue-200">
          <h2 className="text-base sm:text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Quick Actions
          </h2>
          <div className="flex gap-3 flex-wrap">
            <a href="/dashboard/university/application" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Review Applications</a>
            <a href="/dashboard/university/students" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm">View Students</a>
            <a href="/dashboard/university/advisors" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 text-sm">Manage Advisors</a>
          </div>
        </div>

      </main>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-bold text-blue-700">{selectedPost.title}</h2>
                  <p className="text-sm text-gray-500">{selectedPost.company_name}</p>
                </div>
                <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 my-3 text-sm">
                {selectedPost.department && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{selectedPost.department}</span>}
                {selectedPost.location && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{selectedPost.location}</span>}
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full capitalize">{selectedPost.work_type}</span>
                {selectedPost.duration && <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{selectedPost.duration}</span>}
                {selectedPost.stipend && <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">{selectedPost.stipend}</span>}
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{selectedPost.positions_available} position{selectedPost.positions_available !== 1 ? "s" : ""}</span>
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
                <p className="text-sm text-orange-600 mb-4">Application Deadline: {new Date(selectedPost.deadline).toLocaleDateString()}</p>
              )}
              <ApplyInternshipDialog
                onSubmit={handleApplicationSubmit}
                companyId={selectedPost.company_id}
                internshipTitle={`${selectedPost.title} at ${selectedPost.company_name}`}
                triggerText="Apply for This Position"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface InternshipPost {
  id: string
  company_id: string
  company_name: string
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
}

interface CompanyGroup {
  company_name: string
  company_id: string
  posts: InternshipPost[]
}
