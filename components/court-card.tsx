"use client"

import { useState } from "react"
import { useBadmintonStore } from "@/lib/store"
import type { Court } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Minus, Plus, Play, Square, Users, RefreshCw, UserPlus, Pause } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ElapsedTimer } from "@/components/elapsed-timer"

interface CourtCardProps {
  court: Court
}

export function CourtCard({ court }: CourtCardProps) {
  const {
    players,
    activeSessions,
    assignPlayerToCourt,
    removePlayerFromCourt,
    changePlayerInCourt,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    incrementShuttlecock,
    decrementShuttlecock,
    autoAssignPlayers,
    autoFillPlayers,
  } = useBadmintonStore()

  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState(false)

  // Find active session for this court
  const session = activeSessions.find((s) => s.courtId === court.id)

  // Get available players (not assigned to any court)
  const assignedPlayerIds = activeSessions
    .flatMap((session) => [...session.players.team1, ...session.players.team2])
    .filter((id) => id !== "")

  const availablePlayers = players.filter((player) => !assignedPlayerIds.includes(player.id))

  // Get player details for display
  const getPlayerById = (id: string) => players.find((p) => p.id === id)

  const team1Player1 = session?.players.team1[0] ? getPlayerById(session.players.team1[0]) : null
  const team1Player2 = session?.players.team1[1] ? getPlayerById(session.players.team1[1]) : null
  const team2Player1 = session?.players.team2[0] ? getPlayerById(session.players.team2[0]) : null
  const team2Player2 = session?.players.team2[1] ? getPlayerById(session.players.team2[1]) : null

  const handleEndSession = () => {
    if (session) {
      endSession(court.id, session.shuttlecockCount)
      setEndSessionDialogOpen(false)
    }
  }

  // Check if there are any empty slots
  const hasEmptySlots =
    session &&
    (!session.players.team1[0] || !session.players.team1[1] || !session.players.team2[0] || !session.players.team2[1])

  // Determine if player slots should be disabled
  const disablePlayerSlots = session?.isActive && !session?.isPaused

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className={`${session?.isActive ? (session?.isPaused ? "bg-yellow-100" : "bg-green-100") : "bg-gray-100"}`}
      >
        <CardTitle className="flex justify-between items-center">
          <span>{court.name}</span>
          {session?.isActive ? (
            session?.isPaused ? (
              <span className="text-sm font-normal bg-yellow-500 text-white px-2 py-1 rounded-full">Paused</span>
            ) : (
              <span className="text-sm font-normal bg-green-500 text-white px-2 py-1 rounded-full">Active</span>
            )
          ) : (
            <span className="text-sm font-normal bg-gray-500 text-white px-2 py-1 rounded-full">Inactive</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium mb-2 text-blue-700">Team 1</h3>
            <div className="space-y-3">
              <PlayerSlot
                player={team1Player1}
                disabled={disablePlayerSlots}
                onSelect={(playerId) => assignPlayerToCourt(court.id, playerId, "team1", 0)}
                onRemove={() => removePlayerFromCourt(court.id, "team1", 0)}
                onChange={() => changePlayerInCourt(court.id, "team1", 0)}
                availablePlayers={availablePlayers}
              />
              <PlayerSlot
                player={team1Player2}
                disabled={disablePlayerSlots}
                onSelect={(playerId) => assignPlayerToCourt(court.id, playerId, "team1", 1)}
                onRemove={() => removePlayerFromCourt(court.id, "team1", 1)}
                onChange={() => changePlayerInCourt(court.id, "team1", 1)}
                availablePlayers={availablePlayers}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-red-50">
            <h3 className="font-medium mb-2 text-red-700">Team 2</h3>
            <div className="space-y-3">
              <PlayerSlot
                player={team2Player1}
                disabled={disablePlayerSlots}
                onSelect={(playerId) => assignPlayerToCourt(court.id, playerId, "team2", 0)}
                onRemove={() => removePlayerFromCourt(court.id, "team2", 0)}
                onChange={() => changePlayerInCourt(court.id, "team2", 0)}
                availablePlayers={availablePlayers}
              />
              <PlayerSlot
                player={team2Player2}
                disabled={disablePlayerSlots}
                onSelect={(playerId) => assignPlayerToCourt(court.id, playerId, "team2", 1)}
                onRemove={() => removePlayerFromCourt(court.id, "team2", 1)}
                onChange={() => changePlayerInCourt(court.id, "team2", 1)}
                availablePlayers={availablePlayers}
              />
            </div>
          </div>
        </div>

        {session?.isActive && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Shuttlecocks Used</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decrementShuttlecock(court.id)}
                  disabled={session.shuttlecockCount <= 0}
                >
                  <Minus size={16} />
                </Button>
                <span className="w-8 text-center">{session.shuttlecockCount}</span>
                <Button variant="outline" size="icon" onClick={() => incrementShuttlecock(court.id)}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">Started: {formatDate(session.startTime)}</div>
            {session.isPaused ? (
              <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                <div className="font-mono text-sm">Session paused</div>
                <div className="text-xs text-gray-500 mt-1">Paused at: {formatDate(session.pauseTime || "")}</div>
              </div>
            ) : (
              <div className="mt-2 bg-green-50 p-2 rounded border border-green-200">
                <ElapsedTimer startTime={session.startTime} />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-between flex-wrap">
          {!session?.isActive ? (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => autoAssignPlayers(court.id)}
                disabled={availablePlayers.length < 4}
              >
                <Users size={16} />
                Auto Assign
              </Button>

              {hasEmptySlots && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={() => autoFillPlayers(court.id)}
                  disabled={availablePlayers.length < 1}
                >
                  <UserPlus size={16} />
                  Auto Fill
                </Button>
              )}

              <Button
                className="flex items-center gap-2"
                onClick={() => startSession(court.id)}
                disabled={
                  !session ||
                  !session.players.team1[0] ||
                  !session.players.team1[1] ||
                  !session.players.team2[0] ||
                  !session.players.team2[1]
                }
              >
                <Play size={16} />
                Start Session
              </Button>
            </>
          ) : session.isPaused ? (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                onClick={() => resumeSession(court.id)}
                disabled={
                  !session.players.team1[0] ||
                  !session.players.team1[1] ||
                  !session.players.team2[0] ||
                  !session.players.team2[1]
                }
              >
                <Play size={16} />
                Resume Session
              </Button>

              <Dialog open={endSessionDialogOpen} onOpenChange={setEndSessionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex-1 flex items-center justify-center gap-2">
                    <Square size={16} />
                    End Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>End Session</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="mb-4">Are you sure you want to end this session?</p>
                    <p className="mb-4">
                      <strong>Shuttlecocks used:</strong> {session.shuttlecockCount}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEndSessionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleEndSession}>
                        End Session
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                onClick={() => pauseSession(court.id)}
              >
                <Pause size={16} />
                Pause Session
              </Button>

              <Dialog open={endSessionDialogOpen} onOpenChange={setEndSessionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex-1 flex items-center justify-center gap-2">
                    <Square size={16} />
                    End Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>End Session</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="mb-4">Are you sure you want to end this session?</p>
                    <p className="mb-4">
                      <strong>Shuttlecocks used:</strong> {session.shuttlecockCount}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEndSessionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleEndSession}>
                        End Session
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface PlayerSlotProps {
  player: any
  disabled: boolean
  onSelect: (playerId: string) => void
  onRemove: () => void
  onChange: () => void
  availablePlayers: any[]
}

function PlayerSlot({ player, disabled, onSelect, onRemove, onChange, availablePlayers }: PlayerSlotProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  if (player) {
    return (
      <div className="flex items-center justify-between bg-white p-2 rounded border">
        <div>
          <div className="font-medium">{player.name}</div>
          <div className="text-xs">
            <span
              className={`inline-block px-1.5 py-0.5 rounded-full ${
                player.rank === "Beginner"
                  ? "bg-blue-100 text-blue-800"
                  : player.rank === "Mid"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
              }`}
            >
              {player.rank}
            </span>
            <span className="ml-2 text-gray-500">{player.gameCount} games</span>
          </div>
        </div>
        {!disabled && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onChange}
              disabled={availablePlayers.length === 0}
              title="Change player"
              className="px-2"
            >
              <RefreshCw size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove} className="px-2">
              Remove
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white p-2 rounded border">
      <Select disabled={disabled} onValueChange={onSelect} open={isSelectOpen} onOpenChange={setIsSelectOpen}>
        <SelectTrigger>
          <SelectValue placeholder="Select player" />
        </SelectTrigger>
        <SelectContent>
          {availablePlayers.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No available players</div>
          ) : (
            availablePlayers.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{player.name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        player.rank === "Beginner"
                          ? "bg-blue-100 text-blue-800"
                          : player.rank === "Mid"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {player.rank}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{player.gameCount} games</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
