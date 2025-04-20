"use client"

import { useBadmintonStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatDuration } from "@/lib/utils"

export function SessionHistory() {
  const { sessionHistory } = useBadmintonStore()

  // Calculate summary statistics
  const totalGames = sessionHistory.length
  const totalShuttlecocks = sessionHistory.reduce((sum, session) => sum + session.shuttlecockCount, 0)
  const averageShuttlecocks = totalGames > 0 ? (totalShuttlecocks / totalGames).toFixed(1) : "0"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Statistics */}
        {sessionHistory.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-600 mb-1">Total Games</div>
              <div className="text-2xl font-bold">{totalGames}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-green-600 mb-1">Total Shuttlecocks</div>
              <div className="text-2xl font-bold">{totalShuttlecocks}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-sm text-purple-600 mb-1">Avg. Shuttlecocks/Game</div>
              <div className="text-2xl font-bold">{averageShuttlecocks}</div>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Court</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Shuttlecocks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessionHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No session history yet
                </TableCell>
              </TableRow>
            ) : (
              sessionHistory.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.courtName}</TableCell>
                  <TableCell>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="text-blue-600">
                        {session.players.team1[0].name}, {session.players.team1[1].name}
                      </div>
                      <div className="text-red-600">
                        {session.players.team2[0].name}, {session.players.team2[1].name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(session.startTime)}</TableCell>
                  <TableCell>{formatDuration(session.startTime, session.endTime)}</TableCell>
                  <TableCell>{session.shuttlecockCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
