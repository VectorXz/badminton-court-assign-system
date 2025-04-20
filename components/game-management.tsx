"use client"

import { useBadmintonStore } from "@/lib/store"
import { CourtCard } from "@/components/court-card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function GameManagement() {
  const { courts, players } = useBadmintonStore()

  if (courts.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No courts available</AlertTitle>
        <AlertDescription>Please add courts in the Courts Management tab before managing games.</AlertDescription>
      </Alert>
    )
  }

  if (players.length < 4) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not enough players</AlertTitle>
        <AlertDescription>
          You need at least 4 players to start a game. Please add more players in the Players Management tab.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </div>
  )
}
