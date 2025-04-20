"use client"

import { useState } from "react"
import { useBadmintonStore } from "@/lib/store"
import type { Player, PlayerRank } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Trash2, UserPlus } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function PlayerManagement() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useBadmintonStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerRank, setNewPlayerRank] = useState<PlayerRank>("Beginner")
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName, newPlayerRank)
      setNewPlayerName("")
      setNewPlayerRank("Beginner")
      setIsAddDialogOpen(false)
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Players Management</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter player name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="rank">Rank</label>
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
              <Button onClick={handleAddPlayer}>Add Player</Button>
            </div>
          </DialogContent>
        </Dialog>
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
  )
}
