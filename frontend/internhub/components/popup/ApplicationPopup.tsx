"use client";

import { useState, FormEvent, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Upload, X, AlertCircle, Loader2, Building2, MapPin, Timer, ChevronRight } from "lucide-react";

import type { Application, FormErrors } from "../../app/types/Application";
import API_URL from "@/lib/api";

interface InternshipPost {
  id: string;
  company_id: string;
  company_name: string;
  title: string;
  department: string;
  location: string;
  work_type: string;
  duration: string;
  stipend: string;
  positions_available: number;
  description: string;
  deadline: string;
}

interface ApplyInternshipDialogProps {
  onSubmit: (application: Application) => void;
  triggerText?: string;
  companyId?: string;
  internshipTitle?: string;
}

export default function ApplyInternshipDialog({
  onSubmit,
  triggerText = "Apply Internship",
  companyId,
  internshipTitle,
}: ApplyInternshipDialogProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<"select" | "form">(companyId ? "form" : "select");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [cvFileName, setCvFileName] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Company selection state
  const [posts, setPosts] = useState<InternshipPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<InternshipPost | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(companyId || "");
  const [activeTitle, setActiveTitle] = useState<string>(internshipTitle || "");

  useEffect(() => {
    if (open && !companyId) {
      fetchPosts();
      setStep("select");
    }
  }, [open, companyId]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/internship-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSelectPost = (post: InternshipPost) => {
    setSelectedPost(post);
    setActiveCompanyId(post.company_id);
    setActiveTitle(`${post.title} at ${post.company_name}`);
    setStep("form");
  };

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setOpen(false);
        setIsSubmitted(false);
        setSubmittedData(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  function validate(formData: FormData): FormErrors {
    const newErrors: FormErrors = {};
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const department = formData.get("department") as string;
    const academicYear = formData.get("academic_year") as string;
    const email = formData.get("email") as string;
    const githubLink = formData.get("github_link") as string;
    const linkedinLink = formData.get("linkedin_link") as string;
    const cv = formData.get("cv") as File | null;
    const resume = formData.get("resume") as File | null;

    if (!firstName || firstName.length < 2) newErrors.first_name = "First name must be at least 2 characters";
    if (!lastName || lastName.length < 2) newErrors.last_name = "Last name must be at least 2 characters";
    if (!department) newErrors.department = "Department is required";
    if (!academicYear) newErrors.academic_year = "Academic year is required";
    if (!email || !email.includes("@") || !email.includes(".")) newErrors.email = "Enter a valid email address";
    if (!githubLink || !githubLink.startsWith("http")) newErrors.github_link = "Enter a valid GitHub URL";
    if (!linkedinLink || !linkedinLink.startsWith("http")) newErrors.linkedin_link = "Enter a valid LinkedIn URL";
    if (!cv || cv.size === 0) newErrors.cv = "CV file is required";
    else {
      if (cv.type !== "application/pdf") newErrors.cv = "CV must be a PDF file";
      if (cv.size > 2 * 1024 * 1024) newErrors.cv = "CV must be less than 2MB";
    }
    if (!resume || resume.size === 0) newErrors.resume = "Resume file is required";
    else {
      if (resume.type !== "application/pdf") newErrors.resume = "Resume must be a PDF file";
      if (resume.size > 2 * 1024 * 1024) newErrors.resume = "Resume must be less than 2MB";
    }
    return newErrors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const localToken = localStorage.getItem("accessToken") || localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!localToken) { setIsError(true); setErrorMessage("Authentication required. Please log in again."); return; }

    setIsSubmitting(true); setIsError(false); setErrorMessage("");
    const formData = new FormData(formElement);
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); setIsSubmitting(false); return; }
    setErrors({});

    const apiFormData = new FormData();
    apiFormData.append("first_name", formData.get("first_name") as string);
    apiFormData.append("last_name", formData.get("last_name") as string);
    apiFormData.append("department", formData.get("department") as string);
    apiFormData.append("academic_year", formData.get("academic_year") as string);
    apiFormData.append("email", formData.get("email") as string);
    apiFormData.append("github_link", formData.get("github_link") as string);
    apiFormData.append("linkedin_link", formData.get("linkedin_link") as string);
    apiFormData.append("company_id", activeCompanyId);
    const cvFile = formData.get("cv") as File;
    if (cvFile) apiFormData.append("cv", cvFile, cvFile.name);
    const resumeFile = formData.get("resume") as File;
    if (resumeFile) apiFormData.append("resume", resumeFile, resumeFile.name);

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localToken}` },
        body: apiFormData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Application submission failed");

      const application: Application = {
        id: data.application_id || Date.now(),
        student: `${formData.get("first_name")} ${formData.get("last_name")}`,
        firstName: formData.get("first_name") as string,
        lastName: formData.get("last_name") as string,
        company: selectedPost?.company_name || "Company",
        fieldOfStudy: formData.get("department") as string,
        year: formData.get("academic_year") as string,
        github: formData.get("github_link") as string,
        linkedin: formData.get("linkedin_link") as string,
        cv: formData.get("cv") as File,
        resume: formData.get("resume") as File,
        email: formData.get("email") as string,
        status: "Pending",
        submittedAt: new Date().toISOString(),
        company_id: activeCompanyId,
      };

      const studentName = `${formData.get("first_name")} ${formData.get("last_name")}`;
      if (formElement) { try { formElement.reset(); } catch {} }
      setCvFileName(""); setResumeFileName("");
      onSubmit(application);
      setSubmittedData({ studentName, applicationId: data.application_id });
      setIsSubmitted(true);
    } catch (error) {
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "cv" | "resume") => {
    const file = e.target.files?.[0];
    if (file) { if (fileType === "cv") setCvFileName(file.name); else setResumeFileName(file.name); }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setIsSubmitted(false); setIsError(false); setErrors({});
      setCvFileName(""); setResumeFileName(""); setErrorMessage("");
      setSubmittedData(null); setSelectedPost(null);
      setStep(companyId ? "form" : "select");
    }, 300);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) handleClose();
  };

  // Group posts by company
  const companies = posts.reduce((acc: Record<string, { name: string; posts: InternshipPost[] }>, post) => {
    if (!acc[post.company_id]) acc[post.company_id] = { name: post.company_name, posts: [] };
    acc[post.company_id].posts.push(post);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 rounded-xl shadow-2xl"
        aria-describedby="application-dialog-description"
        onInteractOutside={(e) => { if (isSubmitted) e.preventDefault(); }}
      >
        <span id="application-dialog-description" className="sr-only">Student internship application form.</span>

        {/* Step 1: Select Company */}
        {step === "select" && !isSubmitted && !isError && (
          <div>
            <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-xl">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-gray-800">Select a Company to Apply</DialogTitle>
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full hover:bg-orange-200">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600 mt-1 text-sm">Choose an active internship position below</p>
            </DialogHeader>

            <div className="p-6 space-y-4">
              {loadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : Object.keys(companies).length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active internship positions available</p>
                </div>
              ) : (
                Object.entries(companies).map(([cid, company]) => (
                  <div key={cid} className="border border-blue-100 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{company.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.posts.length} position{company.posts.length !== 1 ? "s" : ""} available</p>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {company.posts.map(post => (
                        <button
                          key={post.id}
                          onClick={() => handleSelectPost(post)}
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex justify-between items-center group"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{post.title}</p>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                              {post.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{post.location}</span>}
                              {post.duration && <span className="flex items-center gap-0.5"><Timer className="h-3 w-3" />{post.duration}</span>}
                              <span className="capitalize">{post.work_type}</span>
                              {post.stipend && <span className="text-green-600">{post.stipend}</span>}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 flex-shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Application Form */}
        {step === "form" && !isSubmitted && !isError && (
          <>
            <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!companyId && (
                    <Button variant="ghost" size="icon" onClick={() => setStep("select")} className="h-8 w-8 rounded-full hover:bg-orange-200">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </Button>
                  )}
                  <DialogTitle className="text-xl font-bold text-gray-800">Submit Student Application</DialogTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full hover:bg-orange-200">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {activeTitle && (
                <p className="text-gray-600 mt-2 text-sm">
                  Applying for: <span className="font-semibold text-orange-600">{activeTitle}</span>
                </p>
              )}
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-700 font-medium">Student First Name *</Label>
                  <Input id="first_name" name="first_name" placeholder="John" className={`border-gray-300 focus:border-orange-500 ${errors.first_name ? "border-red-500" : ""}`} />
                  {errors.first_name && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-700 font-medium">Student Last Name *</Label>
                  <Input id="last_name" name="last_name" placeholder="Doe" className={`border-gray-300 focus:border-orange-500 ${errors.last_name ? "border-red-500" : ""}`} />
                  {errors.last_name && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.last_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Student Email *</Label>
                  <Input id="email" name="email" type="email" placeholder="student@university.edu" className={`border-gray-300 focus:border-orange-500 ${errors.email ? "border-red-500" : ""}`} />
                  {errors.email && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-700 font-medium">Department *</Label>
                  <Input id="department" name="department" placeholder="Computer Engineering" className={`border-gray-300 focus:border-orange-500 ${errors.department ? "border-red-500" : ""}`} />
                  {errors.department && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.department}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year" className="text-gray-700 font-medium">Academic Year *</Label>
                  <select id="academic_year" name="academic_year" className={`w-full h-10 px-3 border rounded-md focus:border-orange-500 ${errors.academic_year ? "border-red-500" : "border-gray-300"}`}>
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                  {errors.academic_year && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.academic_year}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github_link" className="text-gray-700 font-medium">GitHub Link *</Label>
                  <Input id="github_link" name="github_link" placeholder="https://github.com/username" className={`border-gray-300 focus:border-orange-500 ${errors.github_link ? "border-red-500" : ""}`} />
                  {errors.github_link && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.github_link}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="linkedin_link" className="text-gray-700 font-medium">LinkedIn Link *</Label>
                  <Input id="linkedin_link" name="linkedin_link" placeholder="https://linkedin.com/in/username" className={`border-gray-300 focus:border-orange-500 ${errors.linkedin_link ? "border-red-500" : ""}`} />
                  {errors.linkedin_link && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.linkedin_link}</p>}
                </div>
              </div>

              {/* CV Upload */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2"><Upload className="h-4 w-4 text-orange-500" />Student CV (PDF) *</Label>
                <Input type="file" name="cv" accept=".pdf" onChange={(e) => handleFileChange(e, "cv")} className="hidden" id="cv-upload" />
                <label htmlFor="cv-upload" className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${errors.cv ? "border-red-300 bg-red-50" : "border-orange-300 bg-orange-50 hover:bg-orange-100"}`}>
                  <Upload className={`w-7 h-7 mb-2 ${errors.cv ? "text-red-500" : "text-orange-500"}`} />
                  <p className="text-sm text-gray-600"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-gray-500">PDF only (MAX. 2MB)</p>
                </label>
                {cvFileName && <p className="text-sm text-gray-700 bg-orange-50 p-2 rounded border border-orange-200">{cvFileName}</p>}
                {errors.cv && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.cv}</p>}
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2"><Upload className="h-4 w-4 text-orange-500" />Student Resume (PDF) *</Label>
                <Input type="file" name="resume" accept=".pdf" onChange={(e) => handleFileChange(e, "resume")} className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload" className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${errors.resume ? "border-red-300 bg-red-50" : "border-orange-300 bg-orange-50 hover:bg-orange-100"}`}>
                  <Upload className={`w-7 h-7 mb-2 ${errors.resume ? "text-red-500" : "text-orange-500"}`} />
                  <p className="text-sm text-gray-600"><span className="font-semibold">Click to upload</span></p>
                  <p className="text-xs text-gray-500">PDF only (MAX. 2MB)</p>
                </label>
                {resumeFileName && <p className="text-sm text-gray-700 bg-orange-50 p-2 rounded border border-orange-200">{resumeFileName}</p>}
                {errors.resume && <p className="flex items-center gap-1 text-red-500 text-sm"><AlertCircle className="h-4 w-4" />{errors.resume}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg">
                {isSubmitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Submitting...</> : "Submit Application"}
              </Button>
            </form>
          </>
        )}

        {/* Success */}
        {isSubmitted && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <DialogHeader className="sr-only"><DialogTitle>Application Submitted Successfully</DialogTitle></DialogHeader>
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-2">The application has been submitted successfully.</p>
            {submittedData && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 w-full max-w-md text-sm text-green-800">
                <p><span className="font-semibold">Student:</span> {submittedData.studentName}</p>
                <p><span className="font-semibold">Application ID:</span> {submittedData.applicationId}</p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <Button onClick={handleClose} className="bg-gradient-to-r from-orange-500 to-orange-600">Close</Button>
              <Button variant="outline" onClick={() => { setIsSubmitted(false); setSubmittedData(null); setCvFileName(""); setResumeFileName(""); setStep("select"); }}>Submit Another</Button>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <DialogHeader className="sr-only"><DialogTitle>Submission Failed</DialogTitle></DialogHeader>
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Submission Failed</h3>
            <p className="text-gray-600 mb-6 text-center">{errorMessage}</p>
            <div className="flex gap-3">
              <Button onClick={() => setIsError(false)} className="bg-gradient-to-r from-orange-500 to-orange-600">Try Again</Button>
              <Button variant="outline" onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}