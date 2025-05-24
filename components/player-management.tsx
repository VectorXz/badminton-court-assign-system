"use client"

import { useState, useEffect } from "react"
import { useBadmintonStore } from "@/lib/store"
import type { Player, PlayerRank } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Trash2, Plus, Check, CheckCircle2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export function PlayerManagement() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useBadmintonStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerRank, setNewPlayerRank] = useState<PlayerRank>("Beginner")
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName, newPlayerRank)
      setNewPlayerName("")
      setNewPlayerRank("Beginner")
    }
  }

  const handleEditPlayer = () => {
    if (editingPlayer && editingPlayer.name.trim()) {
      updatePlayer(editingPlayer)
      setEditingPlayer(null)
      setIsEditDialogOpen(false)
    }
  }

  const startEditPlayer = (player: Player) => {
    setEditingPlayer({ ...player })
    setIsEditDialogOpen(true)
  }

  const handleDeletePlayer = (id: string) => {
    if (confirm("Are you sure you want to delete this player?")) {
      deletePlayer(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Add Frequent Players */}
      <QuickAddPlayers />

      {/* Add Player Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
              />
            </div>
            <div className="w-full sm:w-40">
              <Select value={newPlayerRank} onValueChange={(value) => setNewPlayerRank(value as PlayerRank)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Mid">Mid</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddPlayer} className="flex items-center gap-2">
              <Plus size={16} />
              Add Player
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle>Players List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Games Played</TableHead>
                <TableHead>Last Game</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No players added yet
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player, index) => (
                  <TableRow key={player.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          player.rank === "Beginner"
                            ? "bg-blue-100 text-blue-800"
                            : player.rank === "Mid"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {player.rank}
                      </span>
                    </TableCell>
                    <TableCell>{player.gameCount}</TableCell>
                    <TableCell>{player.lastGameTime ? formatDate(player.lastGameTime) : "Never played"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => startEditPlayer(player)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePlayer(player.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Player</DialogTitle>
              </DialogHeader>
              {editingPlayer && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="edit-name">Name</label>
                    <Input
                      id="edit-name"
                      value={editingPlayer.name}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-rank">Rank</label>
                    <Select
                      value={editingPlayer.rank}
                      onValueChange={(value) => setEditingPlayer({ ...editingPlayer, rank: value as PlayerRank })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Mid">Mid</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleEditPlayer}>Save Changes</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

// Frequent players component
function QuickAddPlayers() {
  const { players, addPlayer } = useBadmintonStore()
  const [frequentPlayers, setFrequentPlayers] = useState<
    { name: string; rank: PlayerRank; selected: boolean; alreadyAdded: boolean }[]
  >([
    { name: "ใหม่", rank: "Mid", selected: false, alreadyAdded: false },
    { name: "เบ๊บ", rank: "Mid", selected: false, alreadyAdded: false },
    { name: "ปาล์ม", rank: "Mid", selected: false, alreadyAdded: false },
    { name: "ปราย ญ", rank: "Beginner", selected: false, alreadyAdded: false },
    { name: "บาส", rank: "Pro", selected: false, alreadyAdded: false },
    { name: "โรส", rank: "Beginner", selected: false, alreadyAdded: false },
    { name: "มิ้ง", rank: "Beginner", selected: false, alreadyAdded: false },
    { name: "ปราย ช", rank: "Pro", selected: false, alreadyAdded: false },
    { name: "มีน", rank: "Pro", selected: false, alreadyAdded: false },
    { name: "อิง", rank: "Mid", selected: false, alreadyAdded: false },
    { name: "บีม", rank: "Pro", selected: false, alreadyAdded: false },
  ])

  // Check which players are already added whenever the players list changes
  useEffect(() => {
    setFrequentPlayers((currentFrequentPlayers) =>
      currentFrequentPlayers.map((frequentPlayer) => {
        const isAlreadyAdded = players.some((player) => player.name.toLowerCase() === frequentPlayer.name.toLowerCase())
        return {
          ...frequentPlayer,
          alreadyAdded: isAlreadyAdded,
          // Deselect if already added
          selected: isAlreadyAdded ? false : frequentPlayer.selected,
        }
      }),
    )
  }, [players])

  const togglePlayerSelection = (index: number) => {
    // Don't allow toggling if player is already added
    if (frequentPlayers[index].alreadyAdded) return

    setFrequentPlayers((currentPlayers) => {
      const updatedPlayers = [...currentPlayers]
      updatedPlayers[index] = {
        ...updatedPlayers[index],
        selected: !updatedPlayers[index].selected,
      }
      return updatedPlayers
    })
  }

  const addSelectedPlayers = () => {
    const playersToAdd = frequentPlayers.filter((player) => player.selected && !player.alreadyAdded)

    if (playersToAdd.length === 0) {
      alert("Please select at least one player that hasn't been added yet")
      return
    }

    playersToAdd.forEach((player) => {
      addPlayer(player.name, player.rank)
    })

    // Reset selections (already added status will be updated by the useEffect)
    setFrequentPlayers((currentPlayers) =>
      currentPlayers.map((player) => ({
        ...player,
        selected: false,
      })),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Frequent Players</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
          {frequentPlayers.map((player, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 border rounded-md p-2 ${
                player.alreadyAdded
                  ? "bg-gray-100 border-gray-200 opacity-70 cursor-not-allowed"
                  : player.selected
                    ? "bg-blue-50 border-blue-200 cursor-pointer"
                    : "cursor-pointer hover:bg-gray-50"
              }`}
              onClick={() => togglePlayerSelection(index)}
            >
              {player.alreadyAdded ? (
                <div className="h-4 w-4 flex items-center justify-center text-green-600">
                  <CheckCircle2 size={16} />
                </div>
              ) : (
                <Checkbox
                  checked={player.selected}
                  onCheckedChange={() => togglePlayerSelection(index)}
                  disabled={player.alreadyAdded}
                />
              )}
              <div>
                <div className={`font-medium ${player.alreadyAdded ? "text-gray-500" : ""}`}>{player.name}</div>
                <div className="text-xs">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-full ${
                      player.alreadyAdded
                        ? "bg-gray-200 text-gray-600"
                        : player.rank === "Beginner"
                          ? "bg-blue-100 text-blue-800"
                          : player.rank === "Mid"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {player.rank}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={addSelectedPlayers}
          className="w-full flex items-center justify-center gap-2"
          variant="outline"
          disabled={!frequentPlayers.some((player) => player.selected && !player.alreadyAdded)}
        >
          <Check size={16} />
          Add Selected Players
        </Button>
      </CardContent>
    </Card>
  )
}
