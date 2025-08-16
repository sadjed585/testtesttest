"use client"
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { User, AlertTriangle, Star } from "lucide-react"
import React from "react"

interface Person {
  id: string
  role: string
  fullName: string
  avatar?: string
  status: "online" | "offline"
  date: string
  task: string
  category: string
  warnings: number
}

interface NewsPost {
  id: string
  authorName: string
  content: string
  image?: string
  timestamp: Date
}

const initialData: Person[] = [
  {
    id: "1",
    role: "Minister of Culture and Media",
    fullName: "Sarah Johnson",
    status: "online",
    date: "2024-01-15",
    task: "Organize a poetry night",
    category: "Administration",
    warnings: 0,
  },
  {
    id: "2",
    role: "Deputy Minister",
    fullName: "Michael Chen",
    status: "offline",
    date: "2024-01-16",
    task: "Review cultural budget proposals",
    category: "Administration",
    warnings: 0,
  },
  {
    id: "3",
    role: "Weather Bulletin Journalist",
    fullName: "Emma Rodriguez",
    status: "online",
    date: "2024-01-15",
    task: "Report about the weather",
    category: "Journalism",
    warnings: 0,
  },
  {
    id: "4",
    role: "News Editor",
    fullName: "David Kim",
    status: "online",
    date: "2024-01-17",
    task: "Edit morning news bulletin",
    category: "Journalism",
    warnings: 0,
  },
  {
    id: "5",
    role: "Security Chief",
    fullName: "Lisa Thompson",
    status: "offline",
    date: "2024-01-16",
    task: "Conduct security briefing",
    category: "Security",
    warnings: 0,
  },
]

interface DashboardUser {
  characterName: string
  password: string
  role: string
}

export function DashboardTable() {
  const [people, setPeople] = useState<Person[]>(initialData)
  const [editingField, setEditingField] = useState<{ id: string; field: "task" | "date" | "name" | "role" } | null>(
    null,
  )
  const [editValue, setEditValue] = useState("")
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null)
  const [showSignIn, setShowSignIn] = useState(true)
  const [signInData, setSignInData] = useState({ characterName: "", password: "" })
  const [signUpData, setSignUpData] = useState({ characterName: "", password: "", confirmPassword: "" })
  const [authError, setAuthError] = useState("")
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [employeeOfWeek, setEmployeeOfWeek] = useState<string | null>(null)
  const [saveLoginInfo, setSaveLoginInfo] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([])
  const [newsContent, setNewsContent] = useState("")
  const [newsImage, setNewsImage] = useState<string | null>(null)
  const newsImageInputRef = useRef<HTMLInputElement>(null)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  const isAdmin = currentUser?.role === "admin" || currentUser?.characterName === "Felix Brock"
  const canWarn = currentUser?.role === "administration" || isAdmin
  const canPostNews = currentUser?.role === "administration" || isAdmin

  useEffect(() => {
    const storedUsers = localStorage.getItem("dashboardUsers")
    if (!storedUsers) {
      const defaultUsers: DashboardUser[] = [{ characterName: "Felix Brock", password: "felix05", role: "admin" }]
      localStorage.setItem("dashboardUsers", JSON.stringify(defaultUsers))
    }

    const savedLoginInfo = localStorage.getItem("savedLoginInfo")
    if (savedLoginInfo) {
      const loginInfo = JSON.parse(savedLoginInfo)
      setSignInData(loginInfo)
      setSaveLoginInfo(true)
    }
  }, [])

  const getAllRegisteredCharacters = () => {
    const storedUsers = JSON.parse(localStorage.getItem("dashboardUsers") || "[]") as DashboardUser[]
    return storedUsers.filter((user) => user.characterName !== "Felix Brock") // Include all registered users except admin
  }

  const getNewMembers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("dashboardUsers") || "[]") as DashboardUser[]
    return storedUsers.filter((user) => user.role === "underreview")
  }

  const handleWarn = (personId: string, warnLevel: 1 | 2 | 3) => {
    if (!canWarn) return

    const person = people.find((p) => p.id === personId)
    if (!person) return

    // Toggle warning: if person already has this warning level, remove it; otherwise set it
    const newWarningLevel = person.warnings === warnLevel ? 0 : warnLevel

    setPeople((prev) => prev.map((p) => (p.id === personId ? { ...p, warnings: newWarningLevel } : p)))

    if (person.fullName === currentUser?.characterName) {
      const message = newWarningLevel === 0 ? `Warning W${warnLevel} removed!` : `You have been warned!`
      setWarningMessage(message)
      setShowWarningPopup(true)
      setTimeout(() => setShowWarningPopup(false), 3000)
    }
  }

  const WarningPopup = () => {
    if (!showWarningPopup) return null

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0 duration-300">
        <Card className="p-6 max-w-sm mx-4 bg-white/95 backdrop-blur-md border-red-200 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 text-red-700">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Warning!</h3>
              <p className="text-sm text-red-600">{warningMessage}</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const handleSignIn = () => {
    const storedUsers = JSON.parse(localStorage.getItem("dashboardUsers") || "[]") as DashboardUser[]
    const user = storedUsers.find(
      (u) => u.characterName === signInData.characterName && u.password === signInData.password,
    )

    if (user) {
      setCurrentUser(user)
      setAuthError("")

      if (saveLoginInfo) {
        localStorage.setItem("savedLoginInfo", JSON.stringify(signInData))
      } else {
        localStorage.removeItem("savedLoginInfo")
      }

      setSignInData({ characterName: "", password: "" })
    } else {
      setAuthError("Invalid character name or password")
    }
  }

  const handleSignUp = () => {
    if (!signUpData.characterName || !signUpData.password || !signUpData.confirmPassword) {
      setAuthError("Please fill in all fields")
      return
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setAuthError("Passwords do not match")
      return
    }

    const storedUsers = JSON.parse(localStorage.getItem("dashboardUsers") || "[]") as DashboardUser[]

    if (storedUsers.find((u) => u.characterName === signUpData.characterName)) {
      setAuthError("Character name already taken")
      return
    }

    const newUser: DashboardUser = {
      characterName: signUpData.characterName,
      password: signUpData.password,
      role: "underreview",
    }

    storedUsers.push(newUser)
    localStorage.setItem("dashboardUsers", JSON.stringify(storedUsers))
    setCurrentUser(newUser)
    setAuthError("")
    setSignUpData({ characterName: "", password: "", confirmPassword: "" })
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setShowSignIn(true)
  }

  const handleDragStart = (e: React.DragEvent, personId: string) => {
    if (!isAdmin) return
    setDraggedItem(personId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", personId)
  }

  const handleDragOver = (e: React.DragEvent, personId: string) => {
    if (!isAdmin || !draggedItem) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItem(personId)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetPersonId: string) => {
    if (!isAdmin || !draggedItem) return
    e.preventDefault()

    const draggedPerson = people.find((p) => p.id === draggedItem)
    const targetPerson = people.find((p) => p.id === targetPersonId)

    if (!draggedPerson || !targetPerson || draggedItem === targetPersonId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    setPeople((prev) => {
      const newPeople = [...prev]
      const draggedIndex = newPeople.findIndex((p) => p.id === draggedItem)
      const targetIndex = newPeople.findIndex((p) => p.id === targetPersonId)

      // Update category if different
      if (draggedPerson.category !== targetPerson.category) {
        newPeople[draggedIndex] = { ...draggedPerson, category: targetPerson.category }
      }

      // Reorder items
      const [removed] = newPeople.splice(draggedIndex, 1)
      newPeople.splice(targetIndex, 0, removed)

      return newPeople
    })

    setDraggedItem(null)
    setDragOverItem(null)
  }

  const activateNewMember = (characterName: string, newRole: string) => {
    // Update in people state - add to people list if not already there
    const existingPerson = people.find((p) => p.fullName === characterName)
    if (!existingPerson) {
      const newPerson: Person = {
        id: Date.now().toString(),
        role: newRole,
        fullName: characterName,
        status: "offline",
        date: new Date().toISOString().split("T")[0],
        task: "No task assigned",
        category:
          newRole === "administration" ? "Administration" : newRole === "journalism" ? "Journalism" : "Security",
        warnings: 0,
      }
      setPeople((prev) => [...prev, newPerson])
    }

    // Update user role in localStorage
    const storedUsers = JSON.parse(localStorage.getItem("dashboardUsers") || "[]") as DashboardUser[]
    const updatedUsers = storedUsers.map((user) =>
      user.characterName === characterName ? { ...user, role: newRole } : user,
    )
    localStorage.setItem("dashboardUsers", JSON.stringify(updatedUsers))
  }

  const handleEdit = (id: string, field: "task" | "date" | "name" | "role", currentValue: string) => {
    if (!isAdmin) return
    setEditingField({ id, field })
    setEditValue(currentValue)
  }

  const handleSave = () => {
    if (!editingField || !isAdmin) return

    setPeople((prev) =>
      prev.map((person) => {
        if (person.id === editingField.id) {
          if (editingField.field === "name") {
            return { ...person, fullName: editValue }
          } else if (editingField.field === "role") {
            return { ...person, role: editValue }
          } else {
            return { ...person, [editingField.field]: editValue }
          }
        }
        return person
      }),
    )
    setEditingField(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue("")
  }

  const addNewPerson = (category: string) => {
    if (!isAdmin) return

    // Get all registered users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem("dashboardUsers") || "[]") as DashboardUser[]
    const registeredNames = storedUsers.map((user) => user.characterName)

    if (registeredNames.length === 0) {
      alert("No registered users available. Users must sign up first before being added to roles.")
      return
    }

    // Show dropdown to select from registered names
    const selectedName = prompt(
      `Select a registered character name:\n${registeredNames.map((name, index) => `${index + 1}. ${name}`).join("\n")}\n\nEnter the number:`,
    )

    if (!selectedName) return

    const nameIndex = Number.parseInt(selectedName) - 1
    if (nameIndex < 0 || nameIndex >= registeredNames.length) {
      alert("Invalid selection. Please try again.")
      return
    }

    const characterName = registeredNames[nameIndex]

    // Check if this character is already in the people list
    const existingPerson = people.find((p) => p.fullName === characterName)
    if (existingPerson) {
      alert("This character is already assigned to a role.")
      return
    }

    const newPerson: Person = {
      id: Date.now().toString(),
      role: category.toLowerCase(),
      fullName: characterName,
      status: "offline",
      date: new Date().toISOString().split("T")[0],
      task: "No task assigned",
      category,
      warnings: 0,
    }

    setPeople((prev) => [...prev, newPerson])

    // Update the user's role in localStorage
    const updatedUsers = storedUsers.map((user) =>
      user.characterName === characterName ? { ...user, role: category.toLowerCase() } : user,
    )
    localStorage.setItem("dashboardUsers", JSON.stringify(updatedUsers))
  }

  const deletePerson = (id: string) => {
    if (!isAdmin) return
    setPeople((prev) => prev.filter((person) => person.id !== id))
  }

  const toggleStatus = (id: string) => {
    if (!isAdmin) return
    setPeople((prev) =>
      prev.map((person) =>
        person.id === id ? { ...person, status: person.status === "online" ? "offline" : "online" } : person,
      ),
    )
  }

  const handleAvatarChange = (id: string) => {
    if (!isAdmin) return
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            setPeople((prev) => prev.map((person) => (person.id === id ? { ...person, avatar: result } : person)))
          }
          reader.readAsDataURL(file)
        }
      }
      fileInputRef.current.click()
    }
  }

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const moveMemberUp = (personId: string, category: string) => {
    if (!isAdmin) return

    setPeople((prev) => {
      const categoryPeople = prev.filter((p) => p.category === category)
      const otherPeople = prev.filter((p) => p.category !== category)

      const currentIndex = categoryPeople.findIndex((p) => p.id === personId)
      if (currentIndex <= 0) return prev // Already at top or not found

      // Swap with previous item
      const newCategoryPeople = [...categoryPeople]
      const temp = newCategoryPeople[currentIndex]
      newCategoryPeople[currentIndex] = newCategoryPeople[currentIndex - 1]
      newCategoryPeople[currentIndex - 1] = temp

      return [...otherPeople, ...newCategoryPeople]
    })
  }

  const moveMemberDown = (personId: string, category: string) => {
    if (!isAdmin) return

    setPeople((prev) => {
      const categoryPeople = prev.filter((p) => p.category === category)
      const otherPeople = prev.filter((p) => p.category !== category)

      const currentIndex = categoryPeople.findIndex((p) => p.id === personId)
      if (currentIndex >= categoryPeople.length - 1 || currentIndex === -1) return prev // Already at bottom or not found

      // Swap with next item
      const newCategoryPeople = [...categoryPeople]
      const temp = newCategoryPeople[currentIndex]
      newCategoryPeople[currentIndex] = newCategoryPeople[currentIndex + 1]
      newCategoryPeople[currentIndex + 1] = temp

      return [...otherPeople, ...newCategoryPeople]
    })
  }

  const newMembers = getNewMembers()
  const registeredCharacters = getAllRegisteredCharacters() // Use the fixed function

  const roleOrder = ["Administration", "Journalism", "Security"]
  const orderedGroupedPeople = roleOrder.reduce(
    (acc, category) => {
      const categoryPeople = people.filter((p) => p.category === category)
      if (categoryPeople.length > 0) {
        acc[category] = categoryPeople
      }
      return acc
    },
    {} as Record<string, Person[]>,
  )

  const handlePostNews = () => {
    if (!newsContent.trim()) return

    const newPost: NewsPost = {
      id: Date.now().toString(),
      authorName: currentUser?.characterName || "Unknown",
      content: newsContent,
      image: newsImage || undefined,
      timestamp: new Date(),
    }

    setNewsPosts((prev) => [newPost, ...prev])
    setNewsContent("")
    setNewsImage(null)

    // Save to localStorage
    const updatedPosts = [newPost, ...newsPosts]
    localStorage.setItem("newsPosts", JSON.stringify(updatedPosts))
  }

  const handleNewsImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewsImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    const savedNews = localStorage.getItem("newsPosts")
    if (savedNews) {
      const parsedNews = JSON.parse(savedNews).map((post: any) => ({
        ...post,
        timestamp: new Date(post.timestamp),
      }))
      setNewsPosts(parsedNews)
    }
  }, [])

  const deleteAnnouncement = (postId: string) => {
    if (!canPostNews) return

    setNewsPosts((prev) => {
      const updatedPosts = prev.filter((post) => post.id !== postId)
      localStorage.setItem("newsPosts", JSON.stringify(updatedPosts))
      return updatedPosts
    })
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setShowImageModal(false)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-2xl backdrop-blur-sm bg-white/95">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#39AAF5" }}>
                Ministry Dashboard
              </h1>
              <p className="text-gray-600">Please sign in to continue</p>
            </div>

            {showSignIn ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center" style={{ color: "#39AAF5" }}>
                  Sign In
                </h2>
                <Input
                  placeholder="Character Name"
                  value={signInData.characterName}
                  onChange={(e) => setSignInData({ ...signInData, characterName: e.target.value })}
                  className="rounded-lg"
                  style={{ borderColor: "#39AAF5" }}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="rounded-lg"
                  style={{ borderColor: "#39AAF5" }}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveLogin"
                    checked={saveLoginInfo}
                    onChange={(e) => setSaveLoginInfo(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="saveLogin" className="text-sm text-gray-600">
                    Save my information
                  </label>
                </div>
                {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                <Button
                  onClick={handleSignIn}
                  className="w-full rounded-lg text-white"
                  style={{ backgroundColor: "#39AAF5" }}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setShowSignIn(false)}
                  variant="outline"
                  className="w-full rounded-lg"
                  style={{ borderColor: "#39AAF5", color: "#39AAF5" }}
                >
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center" style={{ color: "#39AAF5" }}>
                  Sign Up
                </h2>
                <Input
                  placeholder="Character Name"
                  value={signUpData.characterName}
                  onChange={(e) => setSignUpData({ ...signUpData, characterName: e.target.value })}
                  className="rounded-lg"
                  style={{ borderColor: "#39AAF5" }}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className="rounded-lg"
                  style={{ borderColor: "#39AAF5" }}
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className="rounded-lg"
                  style={{ borderColor: "#39AAF5" }}
                />
                {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                <Button
                  onClick={handleSignUp}
                  className="w-full rounded-lg text-white"
                  style={{ backgroundColor: "#39AAF5" }}
                >
                  Sign Up
                </Button>
                <Button
                  onClick={() => setShowSignIn(true)}
                  variant="outline"
                  className="w-full rounded-lg"
                  style={{ borderColor: "#39AAF5", color: "#39AAF5" }}
                >
                  Back to Sign In
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 relative overflow-hidden p-6"
      style={{ backgroundColor: "#39AAF5" }}
    >
      <div className="absolute inset-0 opacity-40">
        <div
          className="w-full h-full bg-blue-50/30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2339AAF5' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>
      <WarningPopup />

      <div className="relative z-10 space-y-8 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 animate-in slide-in-from-top-8 duration-700">
          <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 mb-6">
            <h1
              className="text-5xl md:text-6xl font-bold mb-3 leading-tight"
              style={{
                background: `linear-gradient(135deg, #39AAF5, #2196F3)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to the Recruitment Website
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: "#39AAF5" }}>
              of the Ministry of Culture and Media
            </h2>
          </div>
          <div className="flex justify-center">
            <div
              className="h-1 w-40 rounded-full shadow-lg"
              style={{ background: `linear-gradient(135deg, #39AAF5, #2196F3)` }}
            ></div>
          </div>
        </div>

        <Card className="w-full border-0 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95 mb-8 animate-in slide-in-from-left-6 duration-700">
          <div
            className="p-6 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, #39AAF5, #1976D2)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">News Room</h2>
              </div>

              {canPostNews && (
                <div className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <h3 className="text-lg font-semibold mb-4 text-white">Post News Update</h3>
                  <div className="space-y-4">
                    <textarea
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      placeholder="Share important news and updates..."
                      className="w-full p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                      rows={3}
                    />
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => newsImageInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                        className="text-white border-white/40 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Add Image
                      </Button>
                      <Button
                        onClick={handlePostNews}
                        disabled={!newsContent.trim()}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-sm rounded-xl transition-all duration-300 disabled:opacity-50"
                      >
                        Post News
                      </Button>
                    </div>
                    {newsImage && (
                      <div className="relative inline-block">
                        <img
                          src={newsImage || "/placeholder.svg"}
                          alt="News preview"
                          className="h-20 w-20 object-cover rounded-lg border-2 border-white/30"
                        />
                        <Button
                          onClick={() => setNewsImage(null)}
                          size="sm"
                          variant="outline"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500/80 hover:bg-red-600 text-white border-0"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                    <input
                      ref={newsImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleNewsImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {newsPosts.length === 0 ? (
                  <div className="text-center py-8 text-blue-100">
                    <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 inline-block">
                      <svg
                        className="h-16 w-16 mx-auto mb-4 text-blue-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                      <p className="text-lg">No news updates yet</p>
                      <p className="text-sm text-blue-300 mt-2">Administration users can post news updates here</p>
                    </div>
                  </div>
                ) : (
                  newsPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white/30">
                          <AvatarFallback className="bg-white/20 text-white font-semibold">
                            {post.authorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">{post.authorName}</span>
                            <Badge className="bg-white/20 text-white border-white/30 text-xs">Administration</Badge>
                            <span className="text-blue-200 text-sm">
                              {post.timestamp.toLocaleDateString()} at{" "}
                              {post.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-white/90 leading-relaxed mb-3">{post.content}</p>
                          {post.image && (
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt="News image"
                              className="max-w-sm max-h-48 object-cover rounded-lg border border-white/30 shadow-lg cursor-pointer hover:opacity-80 transition-opacity duration-200"
                              onClick={() => openImageModal(post.image!)}
                            />
                          )}
                        </div>
                        {canPostNews && (
                          <Button
                            onClick={() => deleteAnnouncement(post.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-400/40 hover:bg-red-500/20 hover:text-red-300 backdrop-blur-sm rounded-lg transition-all duration-300 p-2"
                            title="Delete announcement"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        {isAdmin && (
          <Card className="w-full border-0 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95 animate-in slide-in-from-bottom-6 duration-700">
            <div
              className="p-8 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, #39AAF5, #2196F3)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-yellow-400/20 rounded-full backdrop-blur-sm border border-yellow-300/30">
                    <Star className="h-8 w-8 text-yellow-300" />
                  </div>
                  <h2 className="text-2xl font-bold">Employee of the Week</h2>
                </div>

                {employeeOfWeek ? (
                  <div className="flex items-center gap-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-yellow-300/50 shadow-lg">
                        <AvatarImage src="/placeholder.svg" alt={employeeOfWeek} />
                        <AvatarFallback className="bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 font-bold text-xl">
                          {employeeOfWeek
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-2 -right-2 p-1 bg-yellow-400 rounded-full">
                        <Star className="h-6 w-6 text-yellow-800 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{employeeOfWeek}</h3>
                      <p className="text-blue-100 text-lg">Outstanding performance this week!</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmployeeOfWeek(null)}
                      className="text-white border-white/40 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300"
                    >
                      Clear Selection
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-blue-100">
                    <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 inline-block">
                      <Star className="h-16 w-16 mx-auto mb-4 text-blue-200" />
                      <p className="text-lg mb-4">No employee selected this week</p>
                      {registeredCharacters.length > 0 && (
                        <div className="mt-6">
                          <p className="text-sm mb-4 text-blue-200">Select Employee of the Week:</p>
                          <div className="flex flex-wrap gap-3 justify-center">
                            {registeredCharacters.map((character) => (
                              <Button
                                key={character.characterName}
                                variant="outline"
                                size="sm"
                                onClick={() => setEmployeeOfWeek(character.characterName)}
                                className="text-white border-white/40 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300"
                              >
                                {character.characterName}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {newMembers.length > 0 && (
          <Card className="w-full border-0 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95 animate-in slide-in-from-bottom-6 duration-700">
            <div className="p-6 border-b" style={{ background: `linear-gradient(135deg, #39AAF520, #E3F2FD)` }}>
              <h2 className="text-2xl font-bold" style={{ color: "#39AAF5" }}>
                New Members (Under Review)
              </h2>
              <p className="text-sm mt-2" style={{ color: "#39AAF5" }}>
                Pending approval from administration
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {newMembers.map((member) => (
                  <div
                    key={member.characterName}
                    className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-amber-300">
                        <AvatarFallback className="bg-amber-100 text-amber-800 font-semibold">
                          {member.characterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{member.characterName}</p>
                        <p className="text-sm text-amber-600">Status: Under Review</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => activateNewMember(member.characterName, "administration")}
                          size="sm"
                          className="text-white rounded-lg"
                          style={{ backgroundColor: "#39AAF5" }}
                        >
                          Administration
                        </Button>
                        <Button
                          onClick={() => activateNewMember(member.characterName, "journalism")}
                          size="sm"
                          className="text-white rounded-lg"
                          style={{ backgroundColor: "#39AAF5" }}
                        >
                          Journalism
                        </Button>
                        <Button
                          onClick={() => activateNewMember(member.characterName, "security")}
                          size="sm"
                          className="text-white rounded-lg"
                          style={{ backgroundColor: "#39AAF5" }}
                        >
                          Security
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <Card className="w-full border-0 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95 animate-in slide-in-from-bottom-6 duration-700">
          <div className="p-6 border-b" style={{ background: `linear-gradient(135deg, #39AAF520, #E3F2FD)` }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "#39AAF5" }}>
                Dashboard Management
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200/50">
                  <div className="p-1 rounded-lg" style={{ backgroundColor: "#39AAF520" }}>
                    <User className="h-5 w-5" style={{ color: "#39AAF5" }} />
                  </div>
                  <span className="font-medium" style={{ color: "#39AAF5" }}>
                    Welcome, {currentUser?.characterName || "Guest"}
                  </span>
                  <Badge
                    className={`px-3 py-1 rounded-full ${isAdmin ? "text-white shadow-md" : "border"}`}
                    style={{
                      backgroundColor: isAdmin ? "#39AAF5" : "#39AAF520",
                      color: isAdmin ? "white" : "#39AAF5",
                      borderColor: "#39AAF5",
                    }}
                  >
                    {isAdmin ? "Admin" : currentUser?.role || "Guest"}
                  </Badge>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300"
                  style={{ borderColor: "#39AAF5", color: "#39AAF5" }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b border-blue-200/50"
                  style={{ background: `linear-gradient(135deg, #39AAF520, #E3F2FD)` }}
                >
                  <th className="text-left p-4 font-bold" style={{ color: "#39AAF5" }}>
                    Role
                  </th>
                  <th className="text-left p-4 font-bold" style={{ color: "#39AAF5" }}>
                    Full Name
                  </th>
                  <th className="text-left p-4 font-bold" style={{ color: "#39AAF5" }}>
                    Status
                  </th>
                  <th className="text-left p-4 font-bold" style={{ color: "#39AAF5" }}>
                    Date
                  </th>
                  <th
                    className="text-left p-4 font-bold w-48"
                    style={{ color: "#39AAF5", fontFamily: "Arial, 'Segoe UI', Tahoma, sans-serif" }}
                  >
                    Task
                  </th>
                  <th className="text-left p-4 font-bold" style={{ color: "#39AAF5" }}>
                    Warnings
                  </th>
                  {isAdmin && (
                    <th className="text-left p-4 font-bold" style={{ color: "#39AAF5" }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {Object.entries(orderedGroupedPeople).map(([category, categoryPeople]) => (
                  <React.Fragment key={category}>
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3
                              className="text-lg font-bold px-4 py-2 rounded-xl border shadow-sm"
                              style={{ color: "#39AAF5", backgroundColor: "#39AAF520", borderColor: "#39AAF5" }}
                            >
                              {category}
                            </h3>
                            <Badge
                              className="text-white px-3 py-1 rounded-full shadow-md"
                              style={{ backgroundColor: "#39AAF5" }}
                            >
                              {categoryPeople.length} members
                            </Badge>
                          </div>
                          {isAdmin && (
                            <Button
                              onClick={() => addNewPerson(category)}
                              variant="outline"
                              size="sm"
                              className="rounded-xl transition-all duration-300"
                              style={{ backgroundColor: "#39AAF520", borderColor: "#39AAF5", color: "#39AAF5" }}
                            >
                              Add Member
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {categoryPeople.map((person, index) => (
                      <tr
                        key={person.id}
                        className={`border-b border-blue-100/50 hover:bg-blue-50/30 transition-all duration-200 animate-in slide-in-from-left-4 ${
                          dragOverItem === person.id ? "bg-blue-100" : ""
                        } ${draggedItem === person.id ? "opacity-50" : ""}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        draggable={isAdmin}
                        onDragStart={(e) => handleDragStart(e, person.id)}
                        onDragOver={(e) => handleDragOver(e, person.id)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, person.id)}
                      >
                        <td className="p-4">
                          {editingField?.id === person.id && editingField.field === "role" ? (
                            <div className="flex gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 text-sm rounded-lg"
                                style={{ borderColor: "#39AAF5" }}
                              />
                              <Button
                                onClick={handleSave}
                                size="sm"
                                className="h-8 px-2 rounded-lg text-white"
                                style={{ backgroundColor: "#39AAF5" }}
                              >
                                ✓
                              </Button>
                              <Button
                                onClick={handleCancel}
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 rounded-lg bg-transparent"
                              >
                                ✗
                              </Button>
                            </div>
                          ) : (
                            <span
                              className={`text-sm font-medium ${isAdmin ? "cursor-pointer hover:underline" : ""}`}
                              style={{ color: "#39AAF5" }}
                              onClick={() => isAdmin && handleEdit(person.id, "role", person.role)}
                            >
                              {person.role}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative group">
                              <Avatar
                                className="h-10 w-10 border-2 shadow-sm transition-all duration-300 group-hover:shadow-lg"
                                style={{ borderColor: "#39AAF5" }}
                              >
                                <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.fullName} />
                                <AvatarFallback
                                  className="font-bold"
                                  style={{ backgroundColor: "#39AAF520", color: "#39AAF5" }}
                                >
                                  {getInitials(person.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              {isAdmin && (
                                <div
                                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={() => handleAvatarChange(person.id)}
                                >
                                  <span className="text-white text-xs">📷</span>
                                </div>
                              )}
                            </div>
                            {editingField?.id === person.id && editingField.field === "name" ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8 text-sm rounded-lg"
                                  style={{ borderColor: "#39AAF5" }}
                                />
                                <Button
                                  onClick={handleSave}
                                  size="sm"
                                  className="h-8 px-2 rounded-lg text-white"
                                  style={{ backgroundColor: "#39AAF5" }}
                                >
                                  ✓
                                </Button>
                                <Button
                                  onClick={handleCancel}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 rounded-lg bg-transparent"
                                >
                                  ✗
                                </Button>
                              </div>
                            ) : (
                              <span
                                className={`font-medium ${isAdmin ? "cursor-pointer hover:underline" : ""}`}
                                style={{ color: "#39AAF5" }}
                                onClick={() => isAdmin && handleEdit(person.id, "name", person.fullName)}
                              >
                                {person.fullName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`px-3 py-1 rounded-full transition-all duration-300 ${
                              person.status === "online"
                                ? "bg-green-100 text-green-800 border border-green-300 shadow-sm"
                                : "bg-gray-100 text-gray-800 border border-gray-300"
                            } ${isAdmin ? "cursor-pointer hover:shadow-md transform hover:scale-105" : ""}`}
                            onClick={() => isAdmin && toggleStatus(person.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  person.status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                }`}
                              />
                              {person.status}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4">
                          {editingField?.id === person.id && editingField.field === "date" ? (
                            <div className="flex gap-2">
                              <Input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 text-sm rounded-lg"
                                style={{ borderColor: "#39AAF5" }}
                              />
                              <Button
                                onClick={handleSave}
                                size="sm"
                                className="h-8 px-2 rounded-lg text-white"
                                style={{ backgroundColor: "#39AAF5" }}
                              >
                                ✓
                              </Button>
                              <Button
                                onClick={handleCancel}
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 rounded-lg bg-transparent"
                              >
                                ✗
                              </Button>
                            </div>
                          ) : (
                            <span
                              className={`text-sm ${isAdmin ? "cursor-pointer hover:underline" : ""}`}
                              style={{ color: "#39AAF5" }}
                              onClick={() => isAdmin && handleEdit(person.id, "date", person.date)}
                            >
                              {person.date}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingField?.id === person.id && editingField.field === "task" ? (
                            <div className="flex gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-10 text-base rounded-lg w-full"
                                style={{
                                  borderColor: "#39AAF5",
                                  fontFamily: "Arial, 'Segoe UI', Tahoma, sans-serif",
                                  fontSize: "14px",
                                }}
                              />
                              <Button
                                onClick={handleSave}
                                size="sm"
                                className="h-10 px-3 rounded-lg text-white"
                                style={{ backgroundColor: "#39AAF5" }}
                              >
                                ✓
                              </Button>
                              <Button
                                onClick={handleCancel}
                                size="sm"
                                variant="outline"
                                className="h-10 px-3 rounded-lg bg-transparent"
                              >
                                ✗
                              </Button>
                            </div>
                          ) : (
                            <span
                              className={`text-base block w-full ${isAdmin ? "cursor-pointer hover:underline" : ""}`}
                              style={{
                                color: "#39AAF5",
                                fontFamily: "Arial, 'Segoe UI', Tahoma, sans-serif",
                                minHeight: "24px",
                                padding: "4px 0",
                              }}
                              onClick={() => isAdmin && handleEdit(person.id, "task", person.task)}
                            >
                              {person.task}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {[1, 2, 3].map((level) => (
                              <Button
                                key={level}
                                onClick={() => canWarn && handleWarn(person.id, level as 1 | 2 | 3)}
                                size="sm"
                                variant="outline"
                                disabled={!canWarn}
                                className={`h-8 w-8 p-0 rounded-lg transition-all duration-300 ${
                                  person.warnings >= level
                                    ? "bg-red-500 text-white border-red-500 shadow-md"
                                    : canWarn
                                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                                      : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                }`}
                              >
                                W{level}
                              </Button>
                            ))}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="p-4">
                            <Button
                              onClick={() => deletePerson(person.id)}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-300"
                            >
                              🗑️
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full size news image"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 p-0 backdrop-blur-sm"
            >
              ×
            </Button>
          </div>
        </div>
      )}
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" />
    </div>
  )
}
