export enum EventStatus {
  UPCOMING = 'UPCOMING', // Event is scheduled but not yet open for betting/trading
  OPEN = 'OPEN', // Event is open for trading (e.g., 2 days before the match)
  LIVE = 'LIVE', // Event is currently happening
  COMPLETED = 'COMPLETED', // Event has ended, results are finalized
  CANCELLED = 'CANCELLED', // Event got canceled (e.g., rain in cricket)
  SUSPENDED = 'SUSPENDED', // Temporarily paused (e.g., technical issues, review delays)
}

export enum ContestStatus {
  OPEN = 'OPEN', // Contest is open for entries
  LIVE = 'LIVE', // Contest is locked for entries
  COMPLETED = 'COMPLETED', // Contest has ended, results are finalized
  CANCELLED = 'CANCELLED', // Contest got canceled (e.g., not enough participants)
}
