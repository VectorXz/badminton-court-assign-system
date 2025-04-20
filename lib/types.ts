export type PlayerRank = "Beginner" | "Mid" | "Pro"

export interface Player {
  id: string
  name: string
  rank: PlayerRank
  gameCount: number
  lastGameTime: string | null
}

export interface Court {
  id: string
  name: string
}

export interface CourtSession {
  id: string
  courtId: string
  players: {
    team1: [string, string]
    team2: [string, string]
  }
  startTime: string
  endTime: string | null
  shuttlecockCount: number
  isActive: boolean
}

export interface SessionHistoryItem {
  id: string
  courtId: string
  courtName: string
  players: {
    team1: [Player, Player]
    team2: [Player, Player]
  }
  startTime: string
  endTime: string
  shuttlecockCount: number
}
