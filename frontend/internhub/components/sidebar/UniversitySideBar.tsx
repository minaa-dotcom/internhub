"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, UserCheck, Menu, X } from "lucide-react"
import { useState } from "react"

export function UniversitySidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard/university",
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: "Applications",
      href: "/dashboard/university/application",
      icon: <FileText size={18} />,
    },
    {
      label: "Advisors",
      href: "/dashboard/university/advisors",
      icon: <Users size={18} />,
    },
    {
      label: "All Students",
      href: "/dashboard/university/students",
      icon: <Users size={18} />,
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
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
      <aside className={cn(
        "fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-blue-100 to-blue-50 p-6 shadow-xl border-r border-blue-200 overflow-y-auto z-40 transition-transform duration-300",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* University Logo/Title */}
        <div className="mb-8 mt-12 lg:mt-0">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
            University
          </h2>
          <div className="h-1 w-12 bg-blue-500 rounded-full mt-2"></div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== "/dashboard/university" && 
                            pathname?.startsWith(item.href))

            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start text-blue-800 hover:bg-blue-200/80 transition-all duration-200",
                  isActive && "bg-blue-500 text-white hover:bg-blue-600 font-semibold shadow-md"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href={item.href}>
                  <span className={cn(
                    "mr-2",
                    isActive ? "text-white" : "text-blue-600"
                  )}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>

        {/* Footer/User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800 truncate">University Admin</p>
              <p className="text-xs text-blue-600 truncate">admin@university.edu</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer div to push main content to the right on desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  )
}