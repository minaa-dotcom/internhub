"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Settings, 
  Shield, 
  Mail, 
  Clock, 
  Database,
  Globe,
  Bell,
  Lock,
  FileText,
  Users,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Save,
  Loader2,
  Server,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Info
} from "lucide-react"

interface SystemSettings {
  // General Settings
  systemName: string
  systemEmail: string
  systemUrl: string
  maintenanceMode: boolean
  
  // Security Settings
  passwordMinLength: number
  passwordRequireSpecialChar: boolean
  passwordRequireNumbers: boolean
  passwordRequireUppercase: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  accountLockoutDuration: number
  
  // Email Settings
  emailNotifications: boolean
  emailHost: string
  emailPort: string
  emailFrom: string
  
  // Application Settings
  allowStudentRegistration: boolean
  allowCompanyRegistration: boolean
  allowUniversityRegistration: boolean
  requireEmailVerification: boolean
  autoApproveApplications: boolean
  maxApplicationsPerStudent: number
  internshipDurationMin: number
  internshipDurationMax: number
  
  // Data & Backup
  autoBackupEnabled: boolean
  backupFrequency: string
  dataRetentionDays: number
  
  // Notification Settings
  notifyOnNewApplication: boolean
  notifyOnStatusChange: boolean
  notifyAdminsOnNewUser: boolean
  
  // System Limits
  maxInternshipsPerCompany: number
  maxStudentsPerAdvisor: number
  maxInternsPerMentor: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: "InternHub",
    systemEmail: "admin@internhub.com",
    systemUrl: "http://localhost:3000",
    maintenanceMode: false,
    
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    accountLockoutDuration: 30,
    
    emailNotifications: true,
    emailHost: "smtp.gmail.com",
    emailPort: "587",
    emailFrom: "noreply@internhub.com",
    
    allowStudentRegistration: true,
    allowCompanyRegistration: true,
    allowUniversityRegistration: true,
    requireEmailVerification: false,
    autoApproveApplications: false,
    maxApplicationsPerStudent: 10,
    internshipDurationMin: 1,
    internshipDurationMax: 12,
    
    autoBackupEnabled: false,
    backupFrequency: "daily",
    dataRetentionDays: 365,
    
    notifyOnNewApplication: true,
    notifyOnStatusChange: true,
    notifyAdminsOnNewUser: true,
    
    maxInternshipsPerCompany: 50,
    maxStudentsPerAdvisor: 20,
    maxInternsPerMentor: 10
  })

  const [activeTab, setActiveTab] = useState("general")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('systemSettings', JSON.stringify(settings))
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      localStorage.removeItem('systemSettings')
      window.location.reload()
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "email", label: "Email", icon: Mail },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "limits", label: "System Limits", icon: Server },
    { id: "backup", label: "Data & Backup", icon: Database }
  ]

  return (
    <div className="flex min-h-screen bg-purple-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-2">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
              System Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Configure and manage system-wide settings
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">Settings saved successfully!</p>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-purple-200 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="InternHub"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Email
                  </label>
                  <input
                    type="email"
                    value={settings.systemEmail}
                    onChange={(e) => setSettings({...settings, systemEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="admin@internhub.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System URL
                  </label>
                  <input
                    type="url"
                    value={settings.systemUrl}
                    onChange={(e) => setSettings({...settings, systemUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://internhub.com"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">System will be inaccessible to users</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="32"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.passwordRequireSpecialChar}
                      onChange={(e) => setSettings({...settings, passwordRequireSpecialChar: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require special characters (!@#$%^&*)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.passwordRequireNumbers}
                      onChange={(e) => setSettings({...settings, passwordRequireNumbers: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require numbers (0-9)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.passwordRequireUppercase}
                      onChange={(e) => setSettings({...settings, passwordRequireUppercase: e.target.checked})}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Require uppercase letters (A-Z)</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session & Login Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Users will be logged out after this period of inactivity</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Account will be locked after this many failed attempts</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Lockout Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.accountLockoutDuration}
                    onChange={(e) => setSettings({...settings, accountLockoutDuration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">How long accounts remain locked after max failed attempts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Enable system-wide email notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.emailHost}
                      onChange={(e) => setSettings({...settings, emailHost: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={settings.emailPort}
                      onChange={(e) => setSettings({...settings, emailPort: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.emailFrom}
                    onChange={(e) => setSettings({...settings, emailFrom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="noreply@internhub.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address used for outgoing system emails</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> For production use, configure proper SMTP credentials in your environment variables (.env file)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Application Settings */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Allow Student Registration</p>
                    <p className="text-sm text-gray-600">Students can create new accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowStudentRegistration}
                      onChange={(e) => setSettings({...settings, allowStudentRegistration: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Allow Company Registration</p>
                    <p className="text-sm text-gray-600">Companies can create new accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowCompanyRegistration}
                      onChange={(e) => setSettings({...settings, allowCompanyRegistration: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Allow University Registration</p>
                    <p className="text-sm text-gray-600">Universities can create new accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowUniversityRegistration}
                      onChange={(e) => setSettings({...settings, allowUniversityRegistration: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Require Email Verification</p>
                    <p className="text-sm text-gray-600">Users must verify email before accessing system</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Internship Application Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Auto-Approve Applications</p>
                    <p className="text-sm text-gray-600">Applications are automatically accepted without review</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoApproveApplications}
                      onChange={(e) => setSettings({...settings, autoApproveApplications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Applications Per Student
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxApplicationsPerStudent}
                    onChange={(e) => setSettings({...settings, maxApplicationsPerStudent: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of concurrent applications per student</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Internship Duration (months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={settings.internshipDurationMin}
                      onChange={(e) => setSettings({...settings, internshipDurationMin: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Internship Duration (months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={settings.internshipDurationMax}
                      onChange={(e) => setSettings({...settings, internshipDurationMax: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Email Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">New Application Notifications</p>
                    <p className="text-sm text-gray-600">Notify companies when students apply</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnNewApplication}
                      onChange={(e) => setSettings({...settings, notifyOnNewApplication: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Status Change Notifications</p>
                    <p className="text-sm text-gray-600">Notify students when application status changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnStatusChange}
                      onChange={(e) => setSettings({...settings, notifyOnStatusChange: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">New User Notifications</p>
                    <p className="text-sm text-gray-600">Notify admins when new users register</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyAdminsOnNewUser}
                      onChange={(e) => setSettings({...settings, notifyAdminsOnNewUser: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Limits */}
        {activeTab === "limits" && (
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Resource Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Internships Per Company
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.maxInternshipsPerCompany}
                    onChange={(e) => setSettings({...settings, maxInternshipsPerCompany: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of internship posts per company</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Students Per Advisor
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxStudentsPerAdvisor}
                    onChange={(e) => setSettings({...settings, maxStudentsPerAdvisor: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum students that can be assigned to one advisor</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Interns Per Mentor
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxInternsPerMentor}
                    onChange={(e) => setSettings({...settings, maxInternsPerMentor: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum interns that can be assigned to one mentor</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === "backup" && (
          <div className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Automatic Backups</p>
                    <p className="text-sm text-gray-600">Enable scheduled database backups</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoBackupEnabled}
                      onChange={(e) => setSettings({...settings, autoBackupEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="3650"
                    value={settings.dataRetentionDays}
                    onChange={(e) => setSettings({...settings, dataRetentionDays: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Old backups will be automatically deleted after this period</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Important</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Backup functionality requires proper database access and storage configuration. 
                      Contact your system administrator for production setup.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
