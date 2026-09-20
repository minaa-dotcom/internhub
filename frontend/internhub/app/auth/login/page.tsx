"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import API_URL from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Open the window immediately on user gesture (before async) to avoid popup blocker
    const newTab = window.open("", "_blank")

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Login failed")
        newTab?.close()
        return
      }
      localStorage.setItem("token", data.token)

      const userRole = data.user?.role || "university"
      let dashboardUrl = "/dashboard/university"
      if (userRole === "company") dashboardUrl = "/dashboard/company"
      else if (userRole === "admin") dashboardUrl = "/dashboard/admin"
      else if (userRole === "student") dashboardUrl = "/dashboard/student"

      if (newTab) {
        newTab.location.href = dashboardUrl
      } else {
        window.open(dashboardUrl, "_blank")
      }
    } catch {
      setError("Something went wrong")
      newTab?.close()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-orange-600 text-center">Login</h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border p-2 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          className="w-full border p-2 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700"
        >
          Login
        </button>
      </form>
    </div>
  )
}
