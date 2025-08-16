import { DashboardTable } from "@/components/dashboard-table"

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Team Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your team members and their assigned tasks</p>
        </div>
        <DashboardTable />
      </div>
    </div>
  )
}
