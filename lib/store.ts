"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Player, Court, CourtSession, SessionHistoryItem, PlayerRank } from "./types"

interface BadmintonStore {
  players: Player[]
  courts: Court[]
  activeSessions: CourtSession[]
  sessionHistory: SessionHistoryItem[]

  // Player actions
  addPlayer: (name: string, rank: PlayerRank) => void
  updatePlayer: (player: Player) => void
  deletePlayer: (id: string) => void

  // Court actions
  addCourt: (name: string) => void
  deleteCourt: (id: string) => void

  // Game management actions
  assignPlayerToCourt: (courtId: string, playerId: string, team: "team1" | "team2", position: 0 | 1) => void
  removePlayerFromCourt: (courtId: string, team: "team1" | "team2", position: 0 | 1) => void
  changePlayerInCourt: (courtId: string, team: "team1" | "team2", position: 0 | 1) => void
  startSession: (courtId: string) => void
  pauseSession: (courtId: string) => void // New action
  resumeSession: (courtId: string) => void // New action
  endSession: (courtId: string, shuttlecockCount: number) => void
  incrementShuttlecock: (courtId: string) => void
  decrementShuttlecock: (courtId: string) => void

  // Auto-assign players
  autoAssignPlayers: (courtId: string) => void
  autoFillPlayers: (courtId: string) => void

  // Reset actions
  hardReset: () => void
  gameReset: () => void
}

export const useBadmintonStore = create<BadmintonStore>()(
  persist(
    (set, get) => ({
      players: [],
      courts: [],
      activeSessions: [],
      sessionHistory: [],

      // Player actions
      addPlayer: (name, rank) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: crypto.randomUUID(),
              name,
              rank,
              gameCount: 0,
              lastGameTime: null,
            },
          ],
        })),

      updatePlayer: (updatedPlayer) =>
        set((state) => ({
          players: state.players.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player)),
        })),

      deletePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((player) => player.id !== id),
        })),

      // Court actions
      addCourt: (name) =>
        set((state) => ({
          courts: [
            ...state.courts,
            {
              id: crypto.randomUUID(),
              name,
            },
          ],
        })),

      deleteCourt: (id) => {
        const { activeSessions } = get()
        // Check if court has active session
        if (activeSessions.some((session) => session.courtId === id && session.isActive && !session.isPaused)) {
          alert("Cannot delete court with active session")
          return
        }

        set((state) => ({
          courts: state.courts.filter((court) => court.id !== id),
          activeSessions: state.activeSessions.filter((session) => session.courtId !== id),
        }))
      },

      // Game management actions
      assignPlayerToCourt: (courtId, playerId, team, position) => {
        const { activeSessions, players } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        // Only allow assignment if session is not active or is paused
        if (session && session.isActive && !session.isPaused) {
          alert("Cannot assign players during an active session. Pause the session first.")
          return
        }

        // Check if player is already assigned to any court
        const isPlayerAssigned = activeSessions.some(
          (s) =>
            s.players.team1[0] === playerId ||
            s.players.team1[1] === playerId ||
            s.players.team2[0] === playerId ||
            s.players.team2[1] === playerId,
        )

        if (isPlayerAssigned) {
          alert("Player is already assigned to a court")
          return
        }

        if (session) {
          // Update existing session
          set((state) => ({
            activeSessions: state.activeSessions.map((s) => {
              if (s.courtId === courtId) {
                const newPlayers = { ...s.players }
                newPlayers[team][position] = playerId
                return { ...s, players: newPlayers }
              }
              return s
            }),
          }))
        } else {
          // Create new session
          const emptyPlayers = {
            team1: ["", ""] as [string, string],
            team2: ["", ""] as [string, string],
          }
          emptyPlayers[team][position] = playerId

          set((state) => ({
            activeSessions: [
              ...state.activeSessions,
              {
                id: crypto.randomUUID(),
                courtId,
                players: emptyPlayers,
                startTime: "",
                pauseTime: null,
                isPaused: false,
                endTime: null,
                shuttlecockCount: 0,
                isActive: false,
              },
            ],
          }))
        }
      },

      removePlayerFromCourt: (courtId, team, position) => {
        const { activeSessions } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        // Only allow removal if session is not active or is paused
        if (session && session.isActive && !session.isPaused) {
          alert("Cannot remove players during an active session. Pause the session first.")
          return
        }

        if (session) {
          set((state) => ({
            activeSessions: state.activeSessions.map((s) => {
              if (s.courtId === courtId) {
                const newPlayers = { ...s.players }
                newPlayers[team][position] = ""
                return { ...s, players: newPlayers }
              }
              return s
            }),
          }))
        }
      },

      changePlayerInCourt: (courtId, team, position) => {
        const { activeSessions, players } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        // Only allow changes if session is not active or is paused
        if (!session || (session.isActive && !session.isPaused)) {
          alert("Cannot change players during an active session. Pause the session first.")
          return
        }

        // Get all players who are not currently assigned to any court
        const assignedPlayerIds = activeSessions
          .flatMap((s) => [...s.players.team1, ...s.players.team2])
          .filter((id) => id !== "")

        // Get available players (not assigned to any court)
        const availablePlayers = players.filter((player) => !assignedPlayerIds.includes(player.id))

        if (availablePlayers.length === 0) {
          alert("No available players to swap with")
          return
        }

        // Get the current player's rank
        const currentPlayerId = session.players[team][position]
        if (!currentPlayerId) return

        const currentPlayer = players.find((p) => p.id === currentPlayerId)
        if (!currentPlayer) return

        // Get all players in the current session
        const team1Player0 = session.players.team1[0] ? players.find((p) => p.id === session.players.team1[0]) : null
        const team1Player1 = session.players.team1[1] ? players.find((p) => p.id === session.players.team1[1]) : null
        const team2Player0 = session.players.team2[0] ? players.find((p) => p.id === session.players.team2[0]) : null
        const team2Player1 = session.players.team2[1] ? players.find((p) => p.id === session.players.team2[1]) : null

        // Calculate the current team balance
        const rankValue = (rank: PlayerRank): number => {
          if (rank === "Beginner") return 1
          if (rank === "Mid") return 2
          return 3
        }

        // Calculate team strengths without the player being changed
        let team1Strength = 0
        let team2Strength = 0

        if (team === "team1") {
          // Removing from team1
          if (position === 0) {
            if (team1Player1) team1Strength += rankValue(team1Player1.rank)
          } else {
            if (team1Player0) team1Strength += rankValue(team1Player0.rank)
          }
          if (team2Player0) team2Strength += rankValue(team2Player0.rank)
          if (team2Player1) team2Strength += rankValue(team2Player1.rank)
        } else {
          // Removing from team2
          if (position === 0) {
            if (team2Player1) team2Strength += rankValue(team2Player1.rank)
          } else {
            if (team2Player0) team2Strength += rankValue(team2Player0.rank)
          }
          if (team1Player0) team1Strength += rankValue(team1Player0.rank)
          if (team1Player1) team1Strength += rankValue(team1Player1.rank)
        }

        // Find the best replacement player that balances the teams
        let bestPlayer = availablePlayers[0]
        let bestBalance = Number.MAX_VALUE

        for (const player of availablePlayers) {
          // Calculate new balance with this player
          let newTeam1Strength = team1Strength
          let newTeam2Strength = team2Strength

          if (team === "team1") {
            newTeam1Strength += rankValue(player.rank)
          } else {
            newTeam2Strength += rankValue(player.rank)
          }

          const balance = Math.abs(newTeam1Strength - newTeam2Strength)

          // If this creates better balance, select this player
          if (balance < bestBalance) {
            bestBalance = balance
            bestPlayer = player
          }
        }

        // Assign the best player to replace the current one
        set((state) => ({
          activeSessions: state.activeSessions.map((s) => {
            if (s.courtId === courtId) {
              const newPlayers = { ...s.players }
              newPlayers[team][position] = bestPlayer.id
              return { ...s, players: newPlayers }
            }
            return s
          }),
        }))
      },

      startSession: (courtId) => {
        const { activeSessions } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        if (session) {
          // Check if all player slots are filled
          const allPlayersFilled =
            session.players.team1[0] && session.players.team1[1] && session.players.team2[0] && session.players.team2[1]

          if (!allPlayersFilled) {
            alert("All player slots must be filled to start a session")
            return
          }

          set((state) => ({
            activeSessions: state.activeSessions.map((s) => {
              if (s.courtId === courtId) {
                return {
                  ...s,
                  isActive: true,
                  isPaused: false,
                  pauseTime: null,
                  startTime: new Date().toISOString(),
                }
              }
              return s
            }),
          }))
        }
      },

      // New pause session action
      pauseSession: (courtId) => {
        const { activeSessions } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        if (session && session.isActive && !session.isPaused) {
          set((state) => ({
            activeSessions: state.activeSessions.map((s) => {
              if (s.courtId === courtId) {
                return {
                  ...s,
                  isPaused: true,
                  pauseTime: new Date().toISOString(),
                }
              }
              return s
            }),
          }))
        }
      },

      // New resume session action
      resumeSession: (courtId) => {
        const { activeSessions } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        if (session && session.isActive && session.isPaused) {
          // Check if all player slots are filled before resuming
          const allPlayersFilled =
            session.players.team1[0] && session.players.team1[1] && session.players.team2[0] && session.players.team2[1]

          if (!allPlayersFilled) {
            alert("All player slots must be filled to resume the session")
            return
          }

          set((state) => ({
            activeSessions: state.activeSessions.map((s) => {
              if (s.courtId === courtId) {
                return {
                  ...s,
                  isPaused: false,
                  pauseTime: null,
                }
              }
              return s
            }),
          }))
        }
      },

      endSession: (courtId, shuttlecockCount) => {
        const { activeSessions, players, courts } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        if (session && session.isActive) {
          const endTime = new Date().toISOString()

          // Get player details for history
          const getPlayerById = (id: string) => players.find((p) => p.id === id)
          const court = courts.find((c) => c.id === courtId)

          if (!court) return

          // Create history entry
          const historyEntry: SessionHistoryItem = {
            id: crypto.randomUUID(),
            courtId,
            courtName: court.name,
            players: {
              team1: [getPlayerById(session.players.team1[0])!, getPlayerById(session.players.team1[1])!],
              team2: [getPlayerById(session.players.team2[0])!, getPlayerById(session.players.team2[1])!],
            },
            startTime: session.startTime,
            endTime,
            shuttlecockCount,
            totalPauseDuration: 0, // We'll calculate this in a future update if needed
          }

          // Update player stats
          const playerIds = [...session.players.team1, ...session.players.team2]

          set((state) => ({
            // Remove the session
            activeSessions: state.activeSessions.filter((s) => s.courtId !== courtId),

            // Add to history
            sessionHistory: [historyEntry, ...state.sessionHistory],

            // Update player stats
            players: state.players.map((player) => {
              if (playerIds.includes(player.id)) {
                return {
                  ...player,
                  gameCount: player.gameCount + 1,
                  lastGameTime: endTime,
                }
              }
              return player
            }),
          }))
        }
      },

      incrementShuttlecock: (courtId) => {
        set((state) => ({
          activeSessions: state.activeSessions.map((s) => {
            if (s.courtId === courtId && s.isActive) {
              return { ...s, shuttlecockCount: s.shuttlecockCount + 1 }
            }
            return s
          }),
        }))
      },

      decrementShuttlecock: (courtId) => {
        set((state) => ({
          activeSessions: state.activeSessions.map((s) => {
            if (s.courtId === courtId && s.isActive && s.shuttlecockCount > 0) {
              return { ...s, shuttlecockCount: s.shuttlecockCount - 1 }
            }
            return s
          }),
        }))
      },

      autoAssignPlayers: (courtId) => {
        const { players, activeSessions } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        // Only allow auto-assign if session is not active or is paused
        if (session && session.isActive && !session.isPaused) {
          alert("Cannot auto-assign players during an active session. Pause the session first.")
          return
        }

        // Get all players who are not currently assigned to any court
        const assignedPlayerIds = activeSessions
          .flatMap((session) => [...session.players.team1, ...session.players.team2])
          .filter((id) => id !== "")

        // First prioritize by game count, then by last game time
        const availablePlayers = players
          .filter((player) => !assignedPlayerIds.includes(player.id))
          .sort((a, b) => {
            // Primary sort: game count (lowest first)
            if (a.gameCount !== b.gameCount) {
              return a.gameCount - b.gameCount
            }

            // Secondary sort: last game time (oldest first)
            if (a.lastGameTime === null && b.lastGameTime === null) return 0
            if (a.lastGameTime === null) return -1
            if (b.lastGameTime === null) return 1
            return new Date(a.lastGameTime).getTime() - new Date(b.lastGameTime).getTime()
          })

        if (availablePlayers.length < 4) {
          alert("Not enough available players for auto-assignment")
          return
        }

        // Helper function to calculate rank value
        const rankValue = (rank: PlayerRank): number => {
          if (rank === "Beginner") return 1
          if (rank === "Mid") return 2
          return 3
        }

        // Helper function to generate combinations of n items from array
        const getCombinations = <T>(arr: T[], n: number): T[][] => {
          if (n === 1) return arr.map(item => [item])
          if (n === arr.length) return [arr]
          
          const result: T[][] = []
          for (let i = 0; i <= arr.length - n; i++) {
            const head = arr[i]
            const tailCombinations = getCombinations(arr.slice(i + 1), n - 1)
            for (const tail of tailCombinations) {
              result.push([head, ...tail])
            }
          }
          return result
        }

        // Helper function to generate all possible team splits for 4 players
        const getTeamSplits = (fourPlayers: Player[]) => {
          const [p1, p2, p3, p4] = fourPlayers
          return [
            { team1: [p1, p2], team2: [p3, p4] },
            { team1: [p1, p3], team2: [p2, p4] },
            { team1: [p1, p4], team2: [p2, p3] }
          ]
        }

        // Generate all possible combinations of 4 players
        // Limit to top 12 players to avoid performance issues with too many combinations
        const topPlayers = availablePlayers.slice(0, Math.min(12, availablePlayers.length))
        const playerCombinations = getCombinations(topPlayers, 4)

        // Generate all possible balanced team arrangements
        const balancedArrangements: Array<{
          team1: [Player, Player]
          team2: [Player, Player]
          balance: number
          totalGameCount: number
        }> = []

        for (const combination of playerCombinations) {
          const teamSplits = getTeamSplits(combination)
          
          for (const split of teamSplits) {
            const team1Strength = split.team1.reduce((sum, player) => sum + rankValue(player.rank), 0)
            const team2Strength = split.team2.reduce((sum, player) => sum + rankValue(player.rank), 0)
            const balance = Math.abs(team1Strength - team2Strength)
            const totalGameCount = combination.reduce((sum, player) => sum + player.gameCount, 0)
            
            balancedArrangements.push({
              team1: [split.team1[0], split.team1[1]] as [Player, Player],
              team2: [split.team2[0], split.team2[1]] as [Player, Player],
              balance,
              totalGameCount
            })
          }
        }

        if (balancedArrangements.length === 0) {
          alert("No balanced arrangements found")
          return
        }

        // Sort by balance (best balance first), then by total game count (lowest first)
        balancedArrangements.sort((a, b) => {
          if (a.balance !== b.balance) {
            return a.balance - b.balance
          }
          return a.totalGameCount - b.totalGameCount
        })

        // Get the best balance value
        const bestBalance = balancedArrangements[0].balance

        // Filter to only include arrangements with the best balance
        const bestArrangements = balancedArrangements.filter(arr => arr.balance === bestBalance)

        // If we have multiple best arrangements, further filter by lowest total game count
        const lowestGameCount = Math.min(...bestArrangements.map(arr => arr.totalGameCount))
        const finalCandidates = bestArrangements.filter(arr => arr.totalGameCount === lowestGameCount)

        // Randomly select one from the final candidates
        const randomIndex = Math.floor(Math.random() * finalCandidates.length)
        const selectedArrangement = finalCandidates[randomIndex]

        console.log(`Auto-assign: Found ${playerCombinations.length} player combinations, ${balancedArrangements.length} total arrangements, ${finalCandidates.length} optimal arrangements. Selected arrangement with balance ${selectedArrangement.balance} and total game count ${selectedArrangement.totalGameCount}.`)

        // Assign the selected players to the court
        if (session) {
          // Update existing session
          set((state) => ({
            activeSessions: state.activeSessions.map((s) => {
              if (s.courtId === courtId) {
                return {
                  ...s,
                  players: {
                    team1: [selectedArrangement.team1[0].id, selectedArrangement.team1[1].id] as [string, string],
                    team2: [selectedArrangement.team2[0].id, selectedArrangement.team2[1].id] as [string, string],
                  },
                }
              }
              return s
            }),
          }))
        } else {
          // Create new session
          set((state) => ({
            activeSessions: [
              ...state.activeSessions,
              {
                id: crypto.randomUUID(),
                courtId,
                players: {
                  team1: [selectedArrangement.team1[0].id, selectedArrangement.team1[1].id] as [string, string],
                  team2: [selectedArrangement.team2[0].id, selectedArrangement.team2[1].id] as [string, string],
                },
                startTime: "",
                pauseTime: null,
                isPaused: false,
                endTime: null,
                shuttlecockCount: 0,
                isActive: false,
              },
            ],
          }))
        }
      },

      autoFillPlayers: (courtId) => {
        const { players, activeSessions } = get()
        const session = activeSessions.find((s) => s.courtId === courtId)

        // Only allow auto-fill if session is not active or is paused
        if (session && session.isActive && !session.isPaused) {
          alert("Cannot auto-fill players during an active session. Pause the session first.")
          return
        }

        if (!session) {
          // If no session exists, just use the regular auto-assign
          get().autoAssignPlayers(courtId)
          return
        }

        // Count empty slots and collect existing players
        const existingPlayers = {
          team1: [
            session.players.team1[0] ? players.find((p) => p.id === session.players.team1[0]) : null,
            session.players.team1[1] ? players.find((p) => p.id === session.players.team1[1]) : null,
          ],
          team2: [
            session.players.team2[0] ? players.find((p) => p.id === session.players.team2[0]) : null,
            session.players.team2[1] ? players.find((p) => p.id === session.players.team2[1]) : null,
          ],
        }

        const emptySlots = [
          { team: "team1" as const, position: 0 as const, isEmpty: !session.players.team1[0] },
          { team: "team1" as const, position: 1 as const, isEmpty: !session.players.team1[1] },
          { team: "team2" as const, position: 0 as const, isEmpty: !session.players.team2[0] },
          { team: "team2" as const, position: 1 as const, isEmpty: !session.players.team2[1] },
        ].filter((slot) => slot.isEmpty)

        const emptySlotCount = emptySlots.length

        if (availablePlayers.length < emptySlotCount) {
          alert(`Not enough available players. Need ${emptySlotCount} but only ${availablePlayers.length} available.`)
          return
        }

        // Take only the number of players we need
        const playersToAssign = availablePlayers.slice(0, emptySlotCount)

        // Calculate rank values for balancing
        const rankValue = (rank: PlayerRank | undefined): number => {
          if (rank === "Beginner") return 1
          if (rank === "Mid") return 2
          if (rank === "Pro") return 3
          return 0 // For null/undefined
        }

        // Calculate current team strengths
        let team1Strength = existingPlayers.team1.reduce((sum, player) => sum + rankValue(player?.rank), 0)
        let team2Strength = existingPlayers.team2.reduce((sum, player) => sum + rankValue(player?.rank), 0)

        // Assign players to empty slots to balance teams
        const newPlayers = { ...session.players }

        // Sort players by rank for better distribution
        playersToAssign.sort((a, b) => rankValue(a.rank) - rankValue(b.rank))

        // Assign players to balance teams
        for (const player of playersToAssign) {
          // Find which team needs this player more to balance
          const team1NewStrength = team1Strength + rankValue(player.rank)
          const team2NewStrength = team2Strength + rankValue(player.rank)

          // Calculate which assignment would create better balance
          const balanceIfTeam1 = Math.abs(team1NewStrength - team2Strength)
          const balanceIfTeam2 = Math.abs(team1Strength - team2NewStrength)

          let assignedTeam: "team1" | "team2"
          let position: 0 | 1

          if (balanceIfTeam1 <= balanceIfTeam2) {
            // Assign to team1 if it creates better balance
            assignedTeam = "team1"
            // Find empty position in team1
            position = !newPlayers.team1[0] ? 0 : 1
            team1Strength = team1NewStrength
          } else {
            // Assign to team2
            assignedTeam = "team2"
            // Find empty position in team2
            position = !newPlayers.team2[0] ? 0 : 1
            team2Strength = team2NewStrength
          }

          // Make the assignment
          newPlayers[assignedTeam][position] = player.id

          // Remove this slot from empty slots
          const slotIndex = emptySlots.findIndex((slot) => slot.team === assignedTeam && slot.position === position)
          if (slotIndex >= 0) {
            emptySlots.splice(slotIndex, 1)
          }
        }

        // Update the session with new players
        set((state) => ({
          activeSessions: state.activeSessions.map((s) => {
            if (s.courtId === courtId) {
              return {
                ...s,
                players: newPlayers,
              }
            }
            return s
          }),
        }))
      },

      // Reset actions
      hardReset: () => {
        set({
          players: [],
          courts: [],
          activeSessions: [],
          sessionHistory: [],
        })
      },

      gameReset: () => {
        set((state) => ({
          // Keep players and courts, but reset game counts and last game times
          players: state.players.map((player) => ({
            ...player,
            gameCount: 0,
            lastGameTime: null,
          })),
          // Clear sessions and history
          activeSessions: [],
          sessionHistory: [],
        }))
      },
    }),
    {
      name: "badminton-store",
    },
  ),
)
