"use client";

import { useState, useEffect } from "react";
import ApplyInternshipDialog from "../../../../components/popup/ApplicationPopup";
import { UniversitySidebar } from "@/components/sidebar/UniversitySideBar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Users, CheckCircle, XCircle, Clock, Search, Filter,
  ChevronLeft, ChevronRight, Eye, Mail, GraduationCap,
  Github, Linkedin, FileText, Download, Calendar,
  Building2, UserCircle, Loader2, AlertCircle, BookOpen, User, X
} from "lucide-react";
import type { Application, ApplicationStatus, BackendApplication} from "../../../types/Application";
import API_URL from "@/lib/api";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalApps, setTotalApps] = useState(0);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const limit = 7; // Show 7 applications per page

  useEffect(() => { fetchApps(); }, [page, statusFilter, search]);

  // Auto-refresh every 30 seconds to show new applications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApps();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [page, statusFilter, search]);

  const fetchApps = async () => {
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) { setError("Authentication required"); setLoading(false); return; }

      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (statusFilter !== "all") params.append('status', statusFilter.toUpperCase());
      if (search) params.append('search', search);

      const res = await fetch(`${API_URL}/api/applications/university?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setApps(data.applications.map((app: BackendApplication) => ({
        id: app.id,
        student: `${app.first_name} ${app.last_name}`,
        firstName: app.first_name,
        lastName: app.last_name,
        company: "Tech Corp Inc.",
        fieldOfStudy: app.department,
        year: app.academic_year,
        github: app.github_link,
        linkedin: app.linkedin_link,
        cv: app.cv_url,
        resume: app.resume_url,
        email: app.email,
        status: app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase() : "Pending",
        submittedAt: app.created_at,
        company_id: app.company_id,
      })));
      setTotalPages(data.pagination.pages);
      setTotalApps(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally { setLoading(false); }
  };

  // Add application with proper status formatting and refresh data
  const addApplication = async (app: Application) => {
    const formattedApp = {
      ...app,
      status: (app.status === "Pending" ? "Pending" :
              app.status === "Accepted" ? "Accepted" :
              app.status === "Rejected" ? "Rejected" :
              app.status || "Pending") as ApplicationStatus,
    };
    // Add to UI immediately for instant feedback
    setApps(prev => [formattedApp, ...prev]);
    setTotalApps(prev => prev + 1);
    
    // Refresh data from server to ensure consistency
    setTimeout(() => {
      fetchApps();
    }, 500);
  };

  const viewApplication = (app: Application) => {
    setSelectedApp(app);
    setIsViewOpen(true);
  };

  const downloadFile = async (url: string, name: string) => {
    try {
      // Files are served statically, so we can directly open them
      const link = document.createElement('a');
      link.href = `${API_URL}${url}`;
      link.download = name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { 
      console.error("Download error:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'pending') return <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    if (s === 'accepted') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
    if (s === 'rejected') return <Badge className="bg-rose-100 text-rose-700 border-rose-200 px-3 py-1"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1">{status || "Pending"}</Badge>;
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const stats = {
    total: totalApps,
    accepted: apps.filter(a => a.status?.toLowerCase() === "accepted").length,
    pending: apps.filter(a => a.status?.toLowerCase() === "pending").length,
    rejected: apps.filter(a => a.status?.toLowerCase() === "rejected").length,
  };

  // Calculate the starting serial number for current page
  const getSerialNumber = (index: number) => {
    return (page - 1) * limit + index + 1;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <UniversitySidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Applications</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Manage and review internship applications</p>
          </div>
          <ApplyInternshipDialog onSubmit={addApplication} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 sm:p-6 flex justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="hidden sm:flex p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 sm:p-6 flex justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
              </div>
              <div className="hidden sm:flex p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 sm:p-6 flex justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="hidden sm:flex p-3 bg-amber-50 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 sm:p-6 flex justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
              </div>
              <div className="hidden sm:flex p-3 bg-rose-50 rounded-xl">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {/* Enhanced Filters Section */}
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-gray-700 shadow-sm hover:border-blue-200"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative min-w-[200px]">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full pl-12 pr-10 py-3 border-2 border-blue-100 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium shadow-sm hover:border-blue-200 cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">⏳ Pending</option>
                    <option value="ACCEPTED">✅ Accepted</option>
                    <option value="REJECTED">❌ Rejected</option>
                  </select>
                </div>
              </div>

              {/* Filter Summary Badge */}
              {(search || statusFilter !== "all") && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    <Filter className="h-4 w-4" />
                    <span>
                      {search && `"${search}"`}
                      {search && statusFilter !== "all" && " • "}
                      {statusFilter !== "all" && statusFilter}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setPage(1);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-blue-100">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-blue-600">{apps.length}</span> of{" "}
                <span className="font-semibold text-blue-600">{totalApps}</span> applications
                {statusFilter !== "all" && (
                  <span className="ml-1">
                    • Filtered by <span className="font-semibold text-blue-600">{statusFilter.toLowerCase()}</span> status
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading/Error/Table/Cards */}
        {loading ? (
          <Card><CardContent className="p-8 sm:p-12 flex flex-col items-center"><Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange-500 mb-4" /><p className="text-sm sm:text-base">Loading...</p></CardContent></Card>
        ) : error ? (
          <Card><CardContent className="p-8 sm:p-12 flex flex-col items-center">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mb-4" />
            <p className="text-base sm:text-lg font-semibold mb-2">Failed to load</p>
            <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchApps} className="bg-orange-500">Try Again</Button>
          </CardContent></Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden lg:block border-none shadow-sm overflow-hidden">
              <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {/* Added Serial Number column */}
                  <TableHead className="font-semibold w-16">StudentId</TableHead>
                  <TableHead className="font-semibold">Student</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No applications found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  apps.map((app, index) => (
                    <TableRow key={app.id} className="hover:bg-orange-50/30">
                      {/* Serial Number with styling */}
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
                            {getSerialNumber(index)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          
                          <div>
                            <p className="font-medium text-gray-900">{app.firstName} {app.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium">{app.fieldOfStudy}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewApplication(app)} 
                          className="hover:bg-orange-100 hover:text-orange-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                    Next<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {apps.length === 0 ? (
                <Card>
                  <CardContent className="p-8 flex flex-col items-center">
                    <Users className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No applications found</p>
                  </CardContent>
                </Card>
              ) : (
                apps.map((app, index) => (
                  <Card key={app.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {app.firstName[0]}{app.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{app.firstName} {app.lastName}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{app.email}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-blue-600">#{getSerialNumber(index)}</span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Department</span>
                          <span className="font-medium text-gray-900 text-xs">{app.fieldOfStudy}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status</span>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => viewApplication(app)} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* View Modal - Mobile Optimized */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden rounded-2xl w-[95vw] sm:w-full">
            <DialogHeader className="sr-only">
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="flex flex-col max-h-[90vh] overflow-y-auto">

                {/* Student Header - Simplified on Mobile */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <h3 className="text-lg sm:text-xl font-bold">{selectedApp.firstName} {selectedApp.lastName}</h3>
                  <p className="text-sm text-blue-100 mt-1">{selectedApp.email}</p>
                  <div className="mt-2">{getStatusBadge(selectedApp.status)}</div>
                </div>

                {/* Academic Information - Simplified on Mobile */}
                <div className="p-4 sm:p-6 bg-white border-b">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 hidden sm:flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Academic Information
                  </h4>
                  <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedApp.fieldOfStudy}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Academic Year</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedApp.year}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg sm:hidden">
                    <p className="text-xs text-gray-500 mb-1">Submitted</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatDate(selectedApp.submittedAt)}</p>
                  </div>
                </div>

                {/* Professional Profiles - Hidden on Mobile */}
                {(selectedApp.github || selectedApp.linkedin) && (
                  <div className="p-4 sm:p-6 bg-white border-b hidden sm:block">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Profiles</h4>
                    <div className="flex gap-3">
                      {selectedApp.github && (
                        <a 
                          href={selectedApp.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                      {selectedApp.linkedin && (
                        <a 
                          href={selectedApp.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Download Documents Section - Simplified on Mobile */}
                <div className="p-4 sm:p-6 bg-white">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 hidden sm:block">Download Documents</h4>
                  
                  <div className="space-y-3">
                    {selectedApp.cv && (
                      <Button 
                        onClick={() => downloadFile(selectedApp.cv as string, `${selectedApp.firstName}_${selectedApp.lastName}_CV.pdf`)} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Download CV
                      </Button>
                    )}
                    
                    {selectedApp.resume && (
                      <Button 
                        onClick={() => downloadFile(selectedApp.resume as string, `${selectedApp.firstName}_${selectedApp.lastName}_Resume.pdf`)} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base"
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Download Resume
                      </Button>
                    )}
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t flex justify-end">
                  <Button variant="outline" onClick={() => setIsViewOpen(false)} className="px-4 sm:px-6 py-2 text-sm">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}