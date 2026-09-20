"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  GraduationCap,
  UserCog,
  MessageSquare,
  Settings,
  BarChart3,
  Menu, 
  X, 
  LogOut,
  Shield
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "All Users",
      href: "/dashboard/admin/users",
      icon: <Users size={18} />,
    },
    {
      label: "Companies",
      href: "/dashboard/admin/companies",
      icon: <Building2 size={18} />,
    },
    {
      label: "Universities",
      href: "/dashboard/admin/universities",
      icon: <GraduationCap size={18} />,
    },
    {
      label: "Students",
      href: "/dashboard/admin/students",
      icon: <UserCog size={18} />,
    },
    {
      label: "Messages",
      href: "/dashboard/admin/messages",
      icon: <MessageSquare size={18} />,
    },
    {
      label: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: <BarChart3 size={18} />,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings size={18} />,
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('authToken')
    router.push('/auth/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white border-r border-purple-700 transform transition-transform duration-200 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-purple-700">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-300" />
              <div>
                <h1 className="text-2xl font-bold text-white">InternHub</h1>
                <p className="text-xs text-purple-300 mt-1">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "text-purple-100 hover:bg-purple-700/50"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-purple-700">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-red-300 hover:bg-red-900/30"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
