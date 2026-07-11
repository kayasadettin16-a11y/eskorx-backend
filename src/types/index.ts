export interface Team {
  id?: number;
  name: string;
  logo: string; // Emoji, SVG, or URL
  score: number;
  odds: number;
}

export interface MatchStats {
  killsA?: number;
  killsB?: number;
  assistsA?: number;
  assistsB?: number;
  dragonsA?: number;
  dragonsB?: number;
  goldDiff?: string;
  roundHistory?: string;
  mapScores?: string;
}

export interface Player {
  name: string;
  role: string;
  avatar: string;
}

export interface Roster {
  teamA: Player[];
  teamB: Player[];
}

export interface H2HMatch {
  date: string;
  tournament: string;
  score: string;
  winner: string;
}

export interface Match {
  id: string;
  game: "CS2" | "Valorant" | "LoL" | "Dota 2" | "FIFA" | "Mobile Legends";
  tournament: string;
  stage: string;
  teamA: Team;
  teamB: Team;
  timer?: string;
  mapInfo?: string;
  isLive: boolean;
  stats: MatchStats;
  h2h: H2HMatch[];
  rosters: Roster;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  gameTag?: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isAiGenerated?: boolean;
  commentsList: Comment[];
  sharedPrediction?: {
    teamName: string;
    stake: number;
    odds: number;
  };
}

export interface Prediction {
  id: string;
  match: Match;
  predictedTeam: "teamA" | "teamB";
  stake: number;
  odds: number;
  status: "pending" | "won" | "lost";
  potentialReward: number;
  timestamp: string;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  credits: number;
  winRate: string;
  badges: string[];
  rankChange: "up" | "down" | "same";
}
