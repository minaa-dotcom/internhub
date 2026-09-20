"use client"

import { AdminSidebar } from "../../../../components/sidebar/AdminSidebar"
import { Card, CardContent } from "@/components/ui/card"
import { UserCog } from "lucide-react"

export default function AdminStudentsPage() {
  return (
    <div className="flex min-h-screen bg-purple-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-2">
            <UserCog className="h-6 w-6 sm:h-8 sm:w-8" />
            Student Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage all students in the system
          </p>
        </div>

        <Card className="border-purple-200">
          <CardContent className="p-8 text-center">
            <UserCog className="h-16 w-16 mx-auto mb-4 text-purple-300" />
            <p className="text-gray-600">Student management features coming soon</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
