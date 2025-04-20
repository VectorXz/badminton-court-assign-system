"use client"

import { useState } from "react"
import { useBadmintonStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"

export function CourtManagement() {
  const { courts, addCourt, deleteCourt } = useBadmintonStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCourtName, setNewCourtName] = useState("")

  const handleAddCourt = () => {
    if (newCourtName.trim()) {
      addCourt(newCourtName)
      setNewCourtName("")
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteCourt = (id: string) => {
    if (confirm("Are you sure you want to delete this court?")) {
      deleteCourt(id)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Courts Management</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Court
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Court</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Court Name</label>
                <Input
                  id="name"
                  value={newCourtName}
                  onChange={(e) => setNewCourtName(e.target.value)}
                  placeholder="Enter court name"
                />
              </div>
              <Button onClick={handleAddCourt}>Add Court</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Court Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No courts added yet
                </TableCell>
              </TableRow>
            ) : (
              courts.map((court) => (
                <TableRow key={court.id}>
                  <TableCell>{court.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCourt(court.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
