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
  startSession: (courtId: string) => void
  endSession: (courtId: string, shuttlecockCount: number) => void
  incrementShuttlecock: (courtId: string) => void
  decrementShuttlecock: (courtId: string) => void

  // Auto-assign players
  autoAssignPlayers: (courtId: string) => void

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
        if (activeSessions.some((session) => session.courtId === id && session.isActive)) {
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

        if (session && !session.isActive) {
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
                  startTime: new Date().toISOString(),
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

        // Take the 4 players with lowest game count
        const selectedPlayers = availablePlayers.slice(0, 4)

        // Now distribute them to balance teams by rank
        // Sort by rank strength (Beginner = 1, Mid = 2, Pro = 3)
        const rankValue = (rank: PlayerRank): number => {
          if (rank === "Beginner") return 1
          if (rank === "Mid") return 2
          return 3
        }

        // Calculate total rank value for each player
        selectedPlayers.forEach((player) => {
          ;(player as any).rankValue = rankValue(player.rank)
        })

        // Sort by rank value
        selectedPlayers.sort((a, b) => (a as any).rankValue - (b as any).rankValue)

        // Distribute in a way that balances total rank value
        // [0, 3] and [1, 2] distribution for most balanced teams
        const team1 = [selectedPlayers[0], selectedPlayers[3]]
        const team2 = [selectedPlayers[1], selectedPlayers[2]]

        // Assign the selected players to the court
        const session = activeSessions.find((s) => s.courtId === courtId)

        if (session) {
          // Update existing session
          set((state) => ({
            activeSessions: state.activeSessions.map((s) => {
              if (s.courtId === courtId) {
                return {
                  ...s,
                  players: {
                    team1: [team1[0].id, team1[1].id] as [string, string],
                    team2: [team2[0].id, team2[1].id] as [string, string],
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
                  team1: [team1[0].id, team1[1].id] as [string, string],
                  team2: [team2[0].id, team2[1].id] as [string, string],
                },
                startTime: "",
                endTime: null,
                shuttlecockCount: 0,
                isActive: false,
              },
            ],
          }))
        }
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
