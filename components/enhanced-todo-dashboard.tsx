"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  Calendar,
  Clock,
  MoreVertical,
  LogOut,
  Trash2,
  Edit,
  Search,
  Target,
  Zap,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Tag,
  Moon,
  Sun,
  BarChart3,
  FlameIcon as Fire,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  due_date: string | null
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  created_at: string
  user_id: string
}

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
}

const priorityIcons = {
  low: Target,
  medium: Zap,
  high: AlertCircle,
  urgent: Fire,
}

const categories = [
  { value: "personal", label: "Personal", color: "bg-purple-100 text-purple-800" },
  { value: "work", label: "Work", color: "bg-blue-100 text-blue-800" },
  { value: "health", label: "Health", color: "bg-green-100 text-green-800" },
  { value: "finance", label: "Finance", color: "bg-yellow-100 text-yellow-800" },
  { value: "learning", label: "Learning", color: "bg-indigo-100 text-indigo-800" },
  { value: "shopping", label: "Shopping", color: "bg-pink-100 text-pink-800" },
]

export default function EnhancedTodoDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium" as const,
    category: "personal",
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchUser()
    fetchTasks()
    requestNotificationPermission()

    // Set up real-time subscription
    const channel = supabase
      .channel("tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        fetchTasks()
      })
      .subscribe()

    // Check for due tasks every minute
    const interval = setInterval(checkDueTasks, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  const checkDueTasks = () => {
    const now = new Date()
    const in15Minutes = new Date(now.getTime() + 15 * 60000)

    tasks.forEach((task) => {
      if (task.due_date && !task.completed) {
        const dueDate = new Date(task.due_date)
        if (dueDate <= in15Minutes && dueDate > now) {
          showNotification(task)
        }
      }
    })
  }

  const showNotification = (task: Task) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔔 Task Reminder", {
        body: `"${task.title}" is due soon! Priority: ${task.priority.toUpperCase()}`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    }
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add tasks",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("tasks").insert([
      {
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date || null,
        completed: false,
        user_id: user.id,
        priority: newTask.priority,
        category: newTask.category,
      },
    ])

    if (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add task",
        variant: "destructive",
      })
    } else {
      setNewTask({ title: "", description: "", due_date: "", priority: "medium", category: "personal" })
      setIsDialogOpen(false)
      toast({
        title: "🎉 Success",
        description: "Task added successfully!",
      })
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } else {
      toast({
        title: "🗑️ Deleted",
        description: "Task deleted successfully",
      })
    }
  }

  const handleEditTask = async () => {
    if (!editingTask) return

    const { error } = await supabase
      .from("tasks")
      .update({
        title: editingTask.title,
        description: editingTask.description,
        due_date: editingTask.due_date,
        priority: editingTask.priority,
        category: editingTask.category,
      })
      .eq("id", editingTask.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    } else {
      setIsEditDialogOpen(false)
      setEditingTask(null)
      toast({
        title: "✨ Updated",
        description: "Task updated successfully",
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

    if (diffHours < 0) return "⚠️ Overdue"
    if (diffHours < 1) return "🔥 Due now"
    if (diffHours < 24) return `⏰ Due in ${diffHours}h`
    const diffDays = Math.ceil(diffHours / 24)
    return `📅 Due in ${diffDays}d`
  }

  const getDueDateColor = (dateString: string, completed: boolean) => {
    if (completed) return "default"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

    if (diffHours < 0) return "destructive"
    if (diffHours < 24) return "secondary"
    return "outline"
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesCategory = filterCategory === "all" || task.category === filterCategory

    let matchesTab = true
    if (activeTab === "pending") matchesTab = !task.completed
    if (activeTab === "completed") matchesTab = task.completed
    if (activeTab === "urgent") matchesTab = task.priority === "urgent" && !task.completed

    return matchesSearch && matchesPriority && matchesCategory && matchesTab
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    urgent: tasks.filter((t) => t.priority === "urgent" && !t.completed).length,
    overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && !t.completed).length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}
    >
      <header
        className={`shadow-lg border-b transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur-sm"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>TaskMaster Pro</h1>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Smart productivity companion
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)} className="p-2">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Welcome, {user?.email?.split("@")[0]}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/70 backdrop-blur-sm"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Total Tasks</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/70 backdrop-blur-sm"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/70 backdrop-blur-sm"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/70 backdrop-blur-sm"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <Fire className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/70 backdrop-blur-sm"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{completionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">🔥 Urgent</SelectItem>
                <SelectItem value="high">⚠️ High</SelectItem>
                <SelectItem value="medium">⚡ Medium</SelectItem>
                <SelectItem value="low">🎯 Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <DialogHeader>
                <DialogTitle className={darkMode ? "text-white" : ""}>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="What needs to be done?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add more details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🎯 Low</SelectItem>
                        <SelectItem value="medium">⚡ Medium</SelectItem>
                        <SelectItem value="high">⚠️ High</SelectItem>
                        <SelectItem value="urgent">🔥 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date & Time</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <Button onClick={addTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className={`grid w-full grid-cols-4 ${darkMode ? "bg-gray-800" : "bg-white/70"}`}>
            <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent ({stats.urgent})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {filteredTasks.map((task) => {
            const PriorityIcon = priorityIcons[task.priority]
            const categoryInfo = categories.find((c) => c.value === task.category)

            return (
              <Card
                key={task.id}
                className={`transition-all duration-200 hover:shadow-lg ${
                  task.completed ? "opacity-75" : ""
                } ${darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white/70 backdrop-blur-sm hover:bg-white/90"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) => updateTask(task.id, { completed: checked as boolean })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`font-semibold ${task.completed ? "line-through text-gray-500" : darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {task.title}
                          </h3>
                          <Badge className={`${priorityColors[task.priority]} text-xs`}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>

                        {task.description && (
                          <p
                            className={`text-sm mb-3 ${task.completed ? "line-through text-gray-400" : darkMode ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center flex-wrap gap-2">
                          {task.due_date && (
                            <Badge variant={getDueDateColor(task.due_date, task.completed)} className="text-xs">
                              {formatDueDate(task.due_date)}
                            </Badge>
                          )}

                          <Badge className={`${categoryInfo?.color} text-xs`}>
                            <Tag className="h-3 w-3 mr-1" />
                            {categoryInfo?.label}
                          </Badge>

                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingTask(task)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredTasks.length === 0 && (
            <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/70 backdrop-blur-sm"}`}>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {searchTerm || filterPriority !== "all" || filterCategory !== "all"
                    ? "No matching tasks found"
                    : "No tasks yet"}
                </h3>
                <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {searchTerm || filterPriority !== "all" || filterCategory !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "Create your first task to get started with TaskMaster Pro"}
                </p>
                {!searchTerm && filterPriority === "all" && filterCategory === "all" && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Task
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
            <DialogHeader>
              <DialogTitle className={darkMode ? "text-white" : ""}>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(value: any) => setEditingTask({ ...editingTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🎯 Low</SelectItem>
                        <SelectItem value="medium">⚡ Medium</SelectItem>
                        <SelectItem value="high">⚠️ High</SelectItem>
                        <SelectItem value="urgent">🔥 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={editingTask.category}
                      onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-due-date">Due Date & Time</Label>
                  <Input
                    id="edit-due-date"
                    type="datetime-local"
                    value={editingTask.due_date || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                  />
                </div>
                <Button onClick={handleEditTask} className="w-full">
                  Update Task
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
