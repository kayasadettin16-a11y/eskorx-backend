import { Match, Post, LeaderboardUser } from "../types";

export const MOCK_MATCHES: Match[] = [
  {
    id: "match-lol-1",
    game: "LoL",
    tournament: "LCK Summer 2026",
    stage: "Grand Final",
    teamA: { name: "T1", logo: "🐯", score: 2, odds: 1.65 },
    teamB: { name: "Gen.G", logo: "🦖", score: 2, odds: 2.15 },
    timer: "34:12 (Harita 5)",
    mapInfo: "Map 5 (Inhibitor Push)",
    isLive: true,
    stats: {
      killsA: 18,
      killsB: 15,
      dragonsA: 3,
      dragonsB: 2,
      goldDiff: "+4.2k T1 Önde",
    },
    h2h: [
      { date: "24-05-2026", tournament: "MSI 2026", score: "3 - 1", winner: "T1" },
      { date: "12-04-2026", tournament: "LCK Spring Finals", score: "3 - 2", winner: "Gen.G" },
      { date: "15-02-2026", tournament: "LCK Season", score: "2 - 1", winner: "T1" },
      { date: "22-01-2026", tournament: "LCK Season", score: "2 - 0", winner: "Gen.G" },
      { date: "05-11-2025", tournament: "Worlds 2025 Semis", score: "3 - 0", winner: "T1" },
    ],
    rosters: {
      teamA: [
        { name: "Zeus", role: "Top", avatar: "👤" },
        { name: "Oner", role: "Jungle", avatar: "👤" },
        { name: "Faker", role: "Mid", avatar: "👑" },
        { name: "Gumayusi", role: "ADC", avatar: "👤" },
        { name: "Keria", role: "Support", avatar: "👤" },
      ],
      teamB: [
        { name: "Kiin", role: "Top", avatar: "👤" },
        { name: "Canyon", role: "Jungle", avatar: "👤" },
        { name: "Chovy", role: "Mid", avatar: "👑" },
        { name: "Peyz", role: "ADC", avatar: "👤" },
        { name: "Lehends", role: "Support", avatar: "👤" },
      ],
    },
  },
  {
    id: "match-cs2-1",
    game: "CS2",
    tournament: "PGL Major Copenhagen 2026",
    stage: "Playoffs - Semis",
    teamA: { name: "Natus Vincere", logo: "⚡", score: 12, odds: 1.85 },
    teamB: { name: "G2 Esports", logo: "⚔️", score: 11, odds: 1.95 },
    timer: "Raund 24",
    mapInfo: "de_inferno",
    isLive: true,
    stats: {
      killsA: 82,
      killsB: 79,
      roundHistory: "W-L-W-W-L-W-L-L-W-W-W-L",
    },
    h2h: [
      { date: "10-06-2026", tournament: "IEM Dallas", score: "2 - 1", winner: "Natus Vincere" },
      { date: "15-04-2026", tournament: "EPL Season 23", score: "2 - 0", winner: "G2 Esports" },
      { date: "02-03-2026", tournament: "IEM Katowice", score: "2 - 1", winner: "Natus Vincere" },
    ],
    rosters: {
      teamA: [
        { name: "jL", role: "Rifler", avatar: "👤" },
        { name: "iM", role: "Rifler", avatar: "👤" },
        { name: "Aleksib", role: "IGL", avatar: "👤" },
        { name: "w0nderful", role: "AWPer", avatar: "👤" },
        { name: "b1t", role: "Rifler", avatar: "👤" },
      ],
      teamB: [
        { name: "m0NESY", role: "AWPer", avatar: "👑" },
        { name: "NiKo", role: "Rifler", avatar: "👤" },
        { name: "huNter-", role: "Rifler", avatar: "👤" },
        { name: "Snax", role: "IGL", avatar: "👤" },
        { name: "malbsMd", role: "Rifler", avatar: "👤" },
      ],
    },
  },
  {
    id: "match-val-1",
    game: "Valorant",
    tournament: "VCT Masters Tokyo 2026",
    stage: "Group Stage",
    teamA: { name: "Sentinels", logo: "👺", score: 1, odds: 1.72 },
    teamB: { name: "Fnatic", logo: "🦊", score: 0, odds: 2.10 },
    timer: "Map 2 (Icebox)",
    mapInfo: "Map 2 (Icebox) - Round 8",
    isLive: true,
    stats: {
      killsA: 34,
      killsB: 29,
      roundHistory: "W-W-L-W-L-W-W",
    },
    h2h: [
      { date: "22-04-2026", tournament: "VCT Kickoff", score: "3 - 2", winner: "Sentinels" },
      { date: "18-11-2025", tournament: "Red Bull Home Ground", score: "2 - 1", winner: "Fnatic" },
    ],
    rosters: {
      teamA: [
        { name: "Zekken", role: "Duelist", avatar: "👤" },
        { name: "TenZ", role: "Controller", avatar: "👑" },
        { name: "Sacy", role: "Initiator", avatar: "👤" },
        { name: "Johnqt", role: "Sentinel/IGL", avatar: "👤" },
        { name: "Zellsis", role: "Flex", avatar: "👤" },
      ],
      teamB: [
        { name: "Derke", role: "Duelist", avatar: "👤" },
        { name: "Boaster", role: "IGL", avatar: "👑" },
        { name: "Chronicle", role: "Flex", avatar: "👤" },
        { name: "Leo", role: "Initiator", avatar: "👤" },
        { name: "Alfajer", role: "Sentinel", avatar: "👤" },
      ],
    },
  },
  {
    id: "match-dota-1",
    game: "Dota 2",
    tournament: "Riyadh Masters 2026",
    stage: "Playoffs - Quarterfinals",
    teamA: { name: "Team Spirit", logo: "🐉", score: 0, odds: 1.50 },
    teamB: { name: "Team Liquid", logo: "🐴", score: 1, odds: 2.45 },
    timer: "22:15 (Game 2)",
    mapInfo: "Game 2 (Liquid Lead)",
    isLive: true,
    stats: {
      killsA: 12,
      killsB: 24,
      goldDiff: "+8.5k Liquid Önde",
    },
    h2h: [
      { date: "18-05-2026", tournament: "DreamLeague S23", score: "2 - 0", winner: "Team Spirit" },
      { date: "10-04-2026", tournament: "BetBoom Dacha", score: "2 - 1", winner: "Team Liquid" },
    ],
    rosters: {
      teamA: [
        { name: "Yatoro", role: "Carry", avatar: "👤" },
        { name: "Larl", role: "Mid", avatar: "👤" },
        { name: "Collapse", role: "Offlane", avatar: "👑" },
        { name: "Mira", role: "Support", avatar: "👤" },
        { name: "Miposhka", role: "Hard Support", avatar: "👤" },
      ],
      teamB: [
        { name: "miCKe", role: "Carry", avatar: "👤" },
        { name: "Nisha", role: "Mid", avatar: "👑" },
        { name: "33", role: "Offlane", avatar: "👤" },
        { name: "Boxi", role: "Support", avatar: "👤" },
        { name: "Insania", role: "Hard Support", avatar: "👤" },
      ],
    },
  },
  {
    id: "match-fifa-1",
    game: "FIFA",
    tournament: "FC Pro World Championship 2026",
    stage: "Group A Match",
    teamA: { name: "Tekkz", logo: "🎮", score: 3, odds: 1.90 },
    teamB: { name: "Nicolas99fc", logo: "🏆", score: 2, odds: 1.80 },
    timer: "78. Dakika",
    mapInfo: "Single Match",
    isLive: true,
    stats: {
      killsA: 3, // Goals A
      killsB: 2, // Goals B
    },
    h2h: [
      { date: "11-01-2026", tournament: "FC Pro Open", score: "4 - 3", winner: "Tekkz" },
    ],
    rosters: {
      teamA: [{ name: "Tekkz", role: "Pro Player", avatar: "👑" }],
      teamB: [{ name: "Nicolas99fc", role: "Pro Player", avatar: "👑" }],
    },
  },
  {
    id: "match-mlbb-1",
    game: "Mobile Legends",
    tournament: "M6 World Championship",
    stage: "Group B Decider",
    teamA: { name: "EVOS Legends", logo: "🦁", score: 1, odds: 1.70 },
    teamB: { name: "RRQ Hoshi", logo: "👑", score: 1, odds: 2.05 },
    timer: "15:40 (Game 3)",
    mapInfo: "Game 3 (Turtle Fight)",
    isLive: true,
    stats: {
      killsA: 14,
      killsB: 16,
      goldDiff: "+1.1k RRQ Önde",
    },
    h2h: [
      { date: "05-06-2026", tournament: "MPL ID Season 17", score: "3 - 2", winner: "RRQ Hoshi" },
    ],
    rosters: {
      teamA: [
        { name: "Branz", role: "Gold Lane", avatar: "👤" },
        { name: "Anavel", role: "Jungler", avatar: "👑" },
        { name: "Claw", role: "Mid", avatar: "👤" },
        { name: "Fluffy", role: "EXP Lane", avatar: "👤" },
        { name: "DreamS", role: "Roamer", avatar: "👤" },
      ],
      teamB: [
        { name: "Skylar", role: "Gold Lane", avatar: "👑" },
        { name: "Sutsujin", role: "Jungler", avatar: "👤" },
        { name: "Clayyy", role: "Mid", avatar: "👤" },
        { name: "Donn", role: "EXP Lane", avatar: "👤" },
        { name: "Idok", role: "Roamer", avatar: "👤" },
      ],
    },
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: "post-1",
    user: "Can 'CasterCan' Yılmaz",
    avatar: "🎙️",
    content: "T1 vs Gen.G serisi inanılmaz heyecanlı gidiyor! Faker yine o efsanevi Azir oyunlarından birini yaptı. Sizce 5. haritada kim şampiyon olacak? #LCK #T1 #GenG",
    timestamp: "2 dakika önce",
    gameTag: "LoL",
    likesCount: 142,
    commentsCount: 3,
    repostsCount: 15,
    isLiked: false,
    commentsList: [
      { id: "c-1", user: "Batuhan_Valo", avatar: "🐺", content: "Faker yaşlanmıyor abicim, son haritada T1 kupayı kaldırır!", timestamp: "1 dakika önce" },
      { id: "c-2", user: "GenGFanBoy", avatar: "🦖", content: "Chovy bu sefer izin vermez, GenG 3-2 alır kupayı.", timestamp: "30 saniye önce" }
    ]
  },
  {
    id: "post-2",
    user: "ESkorX AI",
    avatar: "🤖",
    content: "🤖 CS2 ANALİZİ: Natus Vincere ve G2 arasındaki Inferno maçı taktiksel olarak son zamanların en iyi mücadelesi. jL'in savunma kurgusu kusursuz işlerken, m0NESY'nin AWP vuruşları G2'yu oyunda tutuyor. Skor 12-11 ve NavI şampiyonluk puanında!",
    timestamp: "10 dakika önce",
    gameTag: "CS2",
    likesCount: 320,
    commentsCount: 2,
    repostsCount: 45,
    isLiked: true,
    isAiGenerated: true,
    commentsList: [
      { id: "c-3", user: "CS_Caster", avatar: "⚔️", content: "Harika bir analiz, tam bir taktik savaşı izliyoruz.", timestamp: "8 dakika önce" }
    ]
  },
  {
    id: "post-3",
    user: "TenZ_Official",
    avatar: "🎮",
    content: "Just played Icebox with the team. Ready to take down Fnatic in the next map. GG's and keep supporting us! #VCTMasters #SentinelsWin",
    timestamp: "25 dakika önce",
    gameTag: "Valorant",
    likesCount: 1250,
    commentsCount: 84,
    repostsCount: 210,
    isLiked: false,
    commentsList: []
  }
];

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, username: "SanalAnalist", avatar: "👑", credits: 14500, winRate: "%78", badges: ["🥇", "🔮"], rankChange: "same" },
  { rank: 2, username: "FakerFan_99", avatar: "🔥", credits: 12200, winRate: "%72", badges: ["🥈", "⚡"], rankChange: "up" },
  { rank: 3, username: "ClutchMaster", avatar: "🎯", credits: 11050, winRate: "%68", badges: ["🥉"], rankChange: "down" },
  { rank: 4, username: "ValorantKral", avatar: "🦅", credits: 9800, winRate: "%65", badges: [], rankChange: "up" },
  { rank: 5, username: "DotaGurusu", avatar: "🐉", credits: 8400, winRate: "%61", badges: [], rankChange: "same" },
  { rank: 6, username: "EsporSevdalisi", avatar: "😎", credits: 7900, winRate: "%58", badges: [], rankChange: "down" }
];

export const TRENDING_TOPICS = [
  { tag: "#ESkorX", count: "12.4K Post" },
  { tag: "#LCKFinals", count: "8.1K Post" },
  { tag: "#FakerAzir", count: "5.5K Post" },
  { tag: "#CS2Major", count: "4.8K Post" },
  { tag: "#SentinelsWin", count: "3.2K Post" }
];

export const MOCK_STORIES = [
  { id: "s-1", user: "FakerFan_99", avatar: "🔥", prediction: "T1 Kazanır" },
  { id: "s-2", user: "SanalAnalist", avatar: "👑", prediction: "NavI Kazanır" },
  { id: "s-3", user: "ClutchMaster", avatar: "🎯", prediction: "Sentinels" },
  { id: "s-4", user: "ValorantKral", avatar: "🦅", prediction: "Fnatic" },
  { id: "s-5", user: "CasterCan", avatar: "🎙️", prediction: "T1 Kazanır" },
  { id: "s-6", user: "DotaGurusu", avatar: "🐉", prediction: "Spirit" }
];
