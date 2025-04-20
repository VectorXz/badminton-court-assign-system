import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerManagement } from "@/components/player-management"
import { CourtManagement } from "@/components/court-management"
import { GameManagement } from "@/components/game-management"
import { SessionHistory } from "@/components/session-history"
import { DataInitializer } from "@/components/data-initializer"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Badminton Court Management System</h1>

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
