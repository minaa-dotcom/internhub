"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CompanySidebar } from "../../../../components/sidebar/CompanySidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import API_URL from "@/lib/api"
import { Briefcase, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PostInternshipPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    company_name: "",
    title: "",
    department: "",
    location: "",
    work_type: "on-site",
    duration: "",
    stipend: "",
    description: "",
    requirements: "",
    skills_required: "",
    positions_available: "1",
    deadline: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.organization_name) {
          setForm(prev => ({ ...prev, company_name: payload.organization_name }))
        }
      } catch {}
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/api/internship-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, positions_available: parseInt(form.positions_available) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to post internship")
      router.push("/dashboard/company")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="flex min-h-screen bg-blue-50">
      <CompanySidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard/company" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <Briefcase className="h-6 w-6" /> Post New Internship
              </h1>
              <p className="text-sm text-muted-foreground">Fill in the details below to publish a new position</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700 text-base">Company & Position Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Company Name *</label>
                    <input name="company_name" value={form.company_name} onChange={handleChange} required className={inputClass} placeholder="e.g. Acme Corp" />
                  </div>
                  <div>
                    <label className={labelClass}>Position Title *</label>
                    <input name="title" value={form.title} onChange={handleChange} required className={inputClass} placeholder="e.g. Frontend Developer Intern" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Department</label>
                    <input name="department" value={form.department} onChange={handleChange} className={inputClass} placeholder="e.g. Engineering" />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="e.g. Kuala Lumpur" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Work Type</label>
                    <select name="work_type" value={form.work_type} onChange={handleChange} className={inputClass}>
                      <option value="on-site">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Duration</label>
                    <input name="duration" value={form.duration} onChange={handleChange} className={inputClass} placeholder="e.g. 3 months" />
                  </div>
                  <div>
                    <label className={labelClass}>Positions Available</label>
                    <input type="number" min="1" name="positions_available" value={form.positions_available} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Stipend / Allowance</label>
                    <input name="stipend" value={form.stipend} onChange={handleChange} className={inputClass} placeholder="e.g. RM1,500/month" />
                  </div>
                  <div>
                    <label className={labelClass}>Application Deadline</label>
                    <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 mt-4">
              <CardHeader>
                <CardTitle className="text-blue-700 text-base">Description & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={labelClass}>Job Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className={inputClass} placeholder="Describe the role, responsibilities, and what the intern will learn..." />
                </div>
                <div>
                  <label className={labelClass}>Requirements</label>
                  <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} className={inputClass} placeholder="e.g. Currently enrolled in a degree program, GPA 3.0+..." />
                </div>
                <div>
                  <label className={labelClass}>Skills Required</label>
                  <input name="skills_required" value={form.skills_required} onChange={handleChange} className={inputClass} placeholder="e.g. React, Node.js, SQL (comma separated)" />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-3 justify-end">
              <Link href="/dashboard/company" className="px-6 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                Cancel
              </Link>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60">
                <Send className="h-4 w-4" />
                {submitting ? "Publishing..." : "Publish Internship"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
