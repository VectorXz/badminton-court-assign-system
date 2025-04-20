import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerManagement } from "@/components/player-management"
import { CourtManagement } from "@/components/court-management"
import { GameManagement } from "@/components/game-management"
import { SessionHistory } from "@/components/session-history"
import { DataInitializer } from "@/components/data-initializer"
import { ResetButtons } from "@/components/reset-buttons"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold">Badminton Court Management System</h1>
        <div className="mt-4 sm:mt-0">
          <ResetButtons />
        </div>
      </div>

      {/* This component ensures data is initialized */}
      <DataInitializer />

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="games">Game Management</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="mt-0">
          <GameManagement />
        </TabsContent>

        <TabsContent value="players" className="mt-0">
          <PlayerManagement />
        </TabsContent>

        <TabsContent value="courts" className="mt-0">
          <CourtManagement />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <SessionHistory />
        </TabsContent>
      </Tabs>
    </main>
  )
}
