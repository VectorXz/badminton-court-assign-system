"use client"

import { useState } from "react"
import { useBadmintonStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react"

export function ResetButtons() {
  const { hardReset, gameReset } = useBadmintonStore()
  const [isHardResetDialogOpen, setIsHardResetDialogOpen] = useState(false)
  const [isGameResetDialogOpen, setIsGameResetDialogOpen] = useState(false)

  const handleHardReset = () => {
    hardReset()
    setIsHardResetDialogOpen(false)
  }

  const handleGameReset = () => {
    gameReset()
    setIsGameResetDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Hard Reset Button */}
      <Dialog open={isHardResetDialogOpen} onOpenChange={setIsHardResetDialogOpen}>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          onClick={() => setIsHardResetDialogOpen(true)}
        >
          <Trash2 size={16} />
          Hard Reset
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle />
              Hard Reset Confirmation
            </DialogTitle>
            <DialogDescription className="pt-2">This will permanently delete ALL data including:</DialogDescription>
          </DialogHeader>

          {/* Moved outside of DialogDescription */}
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>All players</li>
            <li>All courts</li>
            <li>All active sessions</li>
            <li>All session history</li>
          </ul>

          <div className="mt-4 font-semibold text-red-600">This action cannot be undone!</div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsHardResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleHardReset}>
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Reset Button */}
      <Dialog open={isGameResetDialogOpen} onOpenChange={setIsGameResetDialogOpen}>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
          onClick={() => setIsGameResetDialogOpen(true)}
        >
          <RotateCcw size={16} />
          Game Reset
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle />
              Game Reset Confirmation
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will reset all game data while keeping players and courts:
            </DialogDescription>
          </DialogHeader>

          {/* Moved outside of DialogDescription */}
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Reset all player game counts to zero</li>
            <li>Clear all player last game times</li>
            <li>End all active sessions</li>
            <li>Delete all session history</li>
          </ul>

          <div className="mt-4 font-semibold text-orange-600">
            Player and court data will be preserved, but all game history will be lost!
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsGameResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleGameReset}>
              Reset Game Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
