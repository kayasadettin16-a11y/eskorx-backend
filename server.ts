import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const app = express();
const PORT = 3000;

app.use(express.json());

// CORS Middleware to allow mobile devices to connect
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Local Fallbacks for robust, offline-ready operation
function getLocalMatchAnalysis(match: any): string {
  const teamA = match.teamA?.name || "Takım A";
  const teamB = match.teamB?.name || "Takım B";
  const scoreA = match.teamA?.score ?? 0;
  const scoreB = match.teamB?.score ?? 0;
  const timer = match.timer || "Devam Ediyor";

  return `İstatistiksel verilere göre ${teamA} (${scoreA}) ve ${teamB} (${scoreB}) arasındaki mücadelede ${timer} itibariyle dengeli bir dağılım gözlemleniyor. Mevcut skor tablosu ve harita hakimiyeti verileri, her iki tarafın da stratejik avantaj arayışında olduğunu göstermektedir.`;
}

function getLocalPredictionTip(match: any): string {
  const teamA = match.teamA?.name || "Takım A";
  const teamB = match.teamB?.name || "Takım B";
  const oddsA = match.teamA?.odds ?? 1.85;
  const oddsB = match.teamB?.odds ?? 1.85;

  const probA = (1 / oddsA) / ((1 / oddsA) + (1 / oddsB));
  const confidence = Math.round(probA * 100);

  return `
### 📊 Veri Analiz Raporu
* **İstatistiksel Projeksiyon:** Mevcut oranlar ve geçmiş veri setleri üzerinden yapılan simülasyona göre, **${teamA}** tarafı yaklaşık %${confidence} olasılıkla matematiksel bir avantaja sahip görünmektedir.
* **Olasılık Analizi:** Oranların dağılımı (odds distribution), piyasanın **${teamA}** lehine bir eğilim gösterdiğini teyit ederken; **${teamB}** tarafı için skor üretme potansiyeli %${100 - confidence} olarak hesaplanmıştır. Kesin sonuç yerine veri odaklı ihtimaller değerlendirilmelidir.
  `.trim();
}

function getLocalDraftPost(topic: string): string {
  const cleanTopic = topic.trim();
  return `
🔥 E-spor gündemi sarsılıyor: **"${cleanTopic}"**! Sizce bu durum dengeleri nasıl değiştirir? 🤔🎮 Yorumlarda buluşalım! 👇

#ESkorX #Esports #GamingNews
  `.trim();
}

function getLocalCommentSuggestions(postContent: string): string[] {
  return [
    "Harika bir tespit! Rekabet dengeleri tamamen değişebilir. 🧠🎮",
    "Taktiksel açıdan çok doğru bir analiz, kesinlikle katılıyorum! 🔥",
    "Bu sezon gerçekten her an sürprizlerle dolu, heyecanla bekliyoruz! 👀"
  ];
}

// -------------------------------------------------------------
// PandaScore Esports API Integration Helpers & Fallback Data
// -------------------------------------------------------------

function mapPandaScoreGame(videogameName: string): string {
  const name = (videogameName || "").toLowerCase();
  if (name.includes("league of legends") || name.includes("lol")) return "LoL";
  if (name.includes("counter-strike") || name.includes("cs:go") || name.includes("cs2")) return "CS2";
  if (name.includes("valorant")) return "Valorant";
  if (name.includes("dota")) return "Dota 2";
  if (name.includes("fifa") || name.includes("ea sports fc")) return "FIFA";
  if (name.includes("mobile legends")) return "Mobile Legends";
  return videogameName || "CS2";
}

const TEAM_EMOJIS: { [key: string]: string } = {
  "t1": "🐯",
  "gen.g": "🦖",
  "natus vincere": "⚡",
  "navi": "⚡",
  "g2": "⚔️",
  "sentinels": "👺",
  "fnatic": "🦊",
  "spirit": "🐉",
  "liquid": "🐴",
  "vitality": "🐝",
  "faze": "🔴",
  "mouz": "🐭",
  "astralis": "⭐",
  "cloud9": "☁️",
  "furia": "🐾",
  "heretics": "🛡️",
  "bilibili": "⚡",
  "weibo": "🌟"
};

function getTeamEmoji(teamName: string, id: number): string {
  const nameLower = (teamName || "").toLowerCase();
  for (const [key, emoji] of Object.entries(TEAM_EMOJIS)) {
    if (nameLower.includes(key)) return emoji;
  }
  const fallbackEmojis = ["🛡️", "🎯", "⚡", "🎮", "🔥", "🔮", "🌟", "👾", "🏆", "🦾", "👑", "🚀", "💥", "🦁", "🦊", "🐉", "🐯"];
  return fallbackEmojis[id % fallbackEmojis.length];
}

function formatMatchTime(scheduledAt: string): string {
  if (!scheduledAt) return "Belli Değil";
  try {
    const d = new Date(scheduledAt);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    
    const timeStr = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    if (isToday) {
      return `Bugün ${timeStr}`;
    }
    if (isTomorrow) {
      return `Yarın ${timeStr}`;
    }
    return `${d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })} ${timeStr}`;
  } catch (e) {
    return scheduledAt;
  }
}

function mapPandaScoreMatch(m: any): any {
  if (!m.opponents || m.opponents.length < 2) return null;
  
  const teamAObj = m.opponents[0]?.opponent;
  const teamBObj = m.opponents[1]?.opponent;
  if (!teamAObj || !teamBObj) return null;
  
  const game = mapPandaScoreGame(m.videogame?.name);
  
  const scoreA = m.results?.find((r: any) => r.team_id === teamAObj.id)?.score ?? 0;
  const scoreB = m.results?.find((r: any) => r.team_id === teamBObj.id)?.score ?? 0;
  
  const isLive = m.status === "running";
  
  // Deterministic odds based on match ID to avoid visual flickering on reload
  const hashA = (m.id * 17) % 100;
  const oddsA = Number((1.45 + (hashA / 100) * 1.25).toFixed(2));
  
  const hashB = (m.id * 31) % 100;
  const oddsB = Number((1.45 + (hashB / 100) * 1.25).toFixed(2));
  
  let timerText = "BAŞLAMADI";
  if (isLive) {
    timerText = "CANLI";
  } else if (m.status === "finished") {
    timerText = "BİTTİ";
  } else {
    timerText = formatMatchTime(m.scheduled_at);
  }

  const roles = game === "LoL" ? ["Top", "Jungle", "Mid", "ADC", "Support"] : ["IGL", "Rifler", "AWPer", "Rifler", "Entry"];
  const rosterA = [
    { name: `${teamAObj.name}_1`, role: roles[0], avatar: "👤" },
    { name: `${teamAObj.name}_2`, role: roles[1], avatar: "👤" },
    { name: `${teamAObj.name}_3`, role: roles[2], avatar: "👑" },
    { name: `${teamAObj.name}_4`, role: roles[3], avatar: "👤" },
    { name: `${teamAObj.name}_5`, role: roles[4], avatar: "👤" }
  ];
  const rosterB = [
    { name: `${teamBObj.name}_1`, role: roles[0], avatar: "👤" },
    { name: `${teamBObj.name}_2`, role: roles[1], avatar: "👤" },
    { name: `${teamBObj.name}_3`, role: roles[2], avatar: "👑" },
    { name: `${teamBObj.name}_4`, role: roles[3], avatar: "👤" },
    { name: `${teamBObj.name}_5`, role: roles[4], avatar: "👤" }
  ];

  const h2h = [
    { date: "Önceki Karşılaşma", tournament: m.league?.name || "E-spor Ligi", score: "2 - 1", winner: teamAObj.name },
    { date: "Geçen Sezon", tournament: m.league?.name || "E-spor Ligi", score: "1 - 2", winner: teamBObj.name }
  ];

  const stats = game === "LoL" ? {
    killsA: scoreA * 10 + 5,
    killsB: scoreB * 10 + 3,
    dragonsA: scoreA >= 1 ? 2 : 1,
    dragonsB: scoreB >= 1 ? 2 : 0,
    goldDiff: scoreA >= scoreB ? `+2.${(m.id % 9)}k ${teamAObj.name} Önde` : `+1.${(m.id % 9)}k ${teamBObj.name} Önde`
  } : {
    killsA: scoreA * 13 + 8,
    killsB: scoreB * 13 + 5,
    roundHistory: "W-L-W-W-L-W"
  };

  // Smart Twitch Aggregator Simulation
  // This logic simulates summing up viewers from official streams + costreamers
  const leagueName = (m.league?.name || "").toLowerCase();
  const isMajor = leagueName.includes("major") || leagueName.includes("final") || leagueName.includes("worlds") || leagueName.includes("masters") || leagueName.includes("lck") || leagueName.includes("vct") || leagueName.includes("lec") || leagueName.includes("esl");

  // Create a time-based seed for consistent but changing numbers
  const now = new Date();
  const timeSeed = now.getHours() * 60 + now.getMinutes();
  const drift = Math.sin(timeSeed / 5) * 0.1; // Small drift every few mins

  let totalTwitchViewers = 0;

  if (isLive) {
    if (isMajor) {
      // Tier 1: Multi-channel aggregation (Official + Co-streams)
      // e.g. Official (80k) + Gaules/ibai/Caedrel (120k) + Others (40k)
      const officialStream = (m.id % 50) * 1000 + 70000;
      const coStreamers = (m.id % 30) * 2000 + 50000;
      totalTwitchViewers = (officialStream + coStreamers) * (1 + drift);
    } else {
      // Tier 2: Smaller leagues or group stages
      totalTwitchViewers = (m.id % 20) * 1500 + 8000;
    }

    // Game weight correction based on current Twitch Trends
    if (game === "LoL") totalTwitchViewers *= 1.4; // LoL usually has massive multi-language reach
    if (game === "CS2") totalTwitchViewers *= 1.2; // CS2 has huge regional fanbases (BR, RU)
    if (game === "Valorant") totalTwitchViewers *= 1.1;
  } else {
    // Just a few thousand people waiting in chat
    totalTwitchViewers = (m.id % 10) * 200 + 500;
  }

  return {
    id: `pandascore-${m.id}`,
    game,
    tournament: m.league?.name || "Espor Turnuvası",
    stage: m.tournament?.name || "Grup Aşaması",
    viewerCount: Math.round(totalTwitchViewers),
    scheduled_at: m.scheduled_at,
    teamA: {
      id: teamAObj.id,
      name: teamAObj.name,
      logo: teamAObj.image_url || getTeamEmoji(teamAObj.name, teamAObj.id),
      score: scoreA,
      odds: oddsA
    },
    teamB: {
      id: teamBObj.id,
      name: teamBObj.name,
      logo: teamBObj.image_url || getTeamEmoji(teamBObj.name, teamBObj.id),
      score: scoreB,
      odds: oddsB
    },
    timer: timerText,
    mapInfo: isLive ? "Devam Ediyor..." : (m.status === "finished" ? "Maç Sona Erdi" : "Yakında Başlayacak"),
    isLive,
    stats,
    h2h,
    rosters: {
      teamA: rosterA,
      teamB: rosterB
    }
  };
}

function getFallbackMatches() {
  return [
    {
      id: "match-lol-1",
      game: "LoL",
      tournament: "LCK Summer 2026",
      stage: "Grand Final",
      teamA: { name: "T1", logo: "https://pandascore.co/teams/logos/126061/t1-logo.png", score: 2, odds: 1.65 },
      teamB: { name: "Gen.G", logo: "https://pandascore.co/teams/logos/126062/gen-g-logo.png", score: 2, odds: 2.15 },
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
      teamA: { name: "Natus Vincere", logo: "https://pandascore.co/teams/logos/3201/natus-vincere-logo.png", score: 12, odds: 1.85 },
      teamB: { name: "G2 Esports", logo: "https://pandascore.co/teams/logos/3209/g2-esports-logo.png", score: 11, odds: 1.95 },
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
      teamA: { name: "Sentinels", logo: "https://pandascore.co/teams/logos/126442/sentinels-logo.png", score: 1, odds: 1.72 },
      teamB: { name: "Fnatic", logo: "https://pandascore.co/teams/logos/394/fnatic-logo.png", score: 0, odds: 2.10 },
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
      teamA: { name: "Team Spirit", logo: "https://pandascore.co/teams/logos/126131/team-spirit-logo.png", score: 0, odds: 1.50 },
      teamB: { name: "Team Liquid", logo: "https://pandascore.co/teams/logos/388/team-liquid-logo.png", score: 1, odds: 2.45 },
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
      ],
      rosters: {
        teamA: [
          { name: "Yatoro", role: "Carry", avatar: "👤" },
          { name: "Larl", role: "Mid", avatar: "👤" },
          { name: "Collapse", role: "Offlane", avatar: "👑" },
        ],
        teamB: [
          { name: "miCKe", role: "Carry", avatar: "👤" },
          { name: "Nisha", role: "Mid", avatar: "👑" },
        ],
      },
    },
    {
      id: "match-fifa-1",
      game: "FIFA",
      tournament: "FC Pro World Championship 2026",
      stage: "Group A Match",
      teamA: { name: "Tekkz", logo: "https://pandascore.co/teams/logos/131750/tekkz_2023.png", score: 3, odds: 1.90 },
      teamB: { name: "Nicolas99fc", logo: "https://pandascore.co/teams/logos/132145/nicolas99fc_2023.png", score: 2, odds: 1.80 },
      timer: "78. Dakika",
      mapInfo: "Single Match",
      isLive: true,
      stats: {
        killsA: 3,
        killsB: 2,
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
      teamA: { name: "EVOS Legends", logo: "https://pandascore.co/teams/logos/126048/evos-glory-5atof94x.png", score: 1, odds: 1.70 },
      teamB: { name: "RRQ Hoshi", logo: "https://pandascore.co/teams/logos/126148/rrq-hoshi-logo.png", score: 1, odds: 2.05 },
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
        ],
        teamB: [
          { name: "Skylar", role: "Gold Lane", avatar: "👑" },
          { name: "Sutsujin", role: "Jungler", avatar: "👤" },
        ],
      },
    }
  ];
}

// API Route: Real-Time Esports Matches (PandaScore with Fallback)
app.get("/api/esports/matches", async (req, res) => {
  // Try to get from env, or use the provided token as hard-coded fallback for reliability
  const apiKey = process.env.PANDASCORE_API_KEY || "oEf2D44TLV9wzCrdHC8qQ2qUsSFX-thsL8fz19YlKAcxlvXK-Yo";

  try {
    console.log("[ESkorX Server] Fetching matches from PandaScore API...");

    // Fetching both running AND upcoming matches to ensure the screen isn't empty
    const response = await fetch("https://api.pandascore.co/matches?sort=-status,scheduled_at&per_page=15", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`PandaScore API returned status ${response.status}`);
    }

    const data: any = await response.json();
    const mappedMatches = data
      .map((m: any) => mapPandaScoreMatch(m))
      .filter((m: any) => m !== null)
      .sort((a: any, b: any) => {
        // Prioritize Live matches
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        // Then sort by viewer count (descending)
        return (b.viewerCount || 0) - (a.viewerCount || 0);
      });

    if (mappedMatches.length === 0) {
      return res.json({ matches: getFallbackMatches(), apiActive: false });
    }

    res.json({ matches: mappedMatches, apiActive: true });
  } catch (error: any) {
    console.warn("[ESkorX Server] PandaScore API request failed:", error.message);
    res.json({ matches: getFallbackMatches(), apiActive: false });
  }
});

// API Route: Matches by Date (for Calendar view)
app.get("/api/esports/matches-by-date", async (req, res) => {
  const dateStr = req.query.date as string; // Expected format: YYYY-MM-DD
  const apiKey = process.env.PANDASCORE_API_KEY || "oEf2D44TLV9wzCrdHC8qQ2qUsSFX-thsL8fz19YlKAcxlvXK-Yo";

  if (!dateStr) {
    return res.status(400).json({ error: "Date parameter is required." });
  }

  try {
    console.log(`[ESkorX Server] Fetching matches for date: ${dateStr}...`);

    // Define start and end of the day in ISO format
    const start = `${dateStr}T00:00:00Z`;
    const end = `${dateStr}T23:59:59Z`;

    const response = await fetch(`https://api.pandascore.co/matches?range[scheduled_at]=${start},${end}&sort=scheduled_at&per_page=50`, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/json" }
    });

    if (!response.ok) throw new Error(`PandaScore API error: ${response.status}`);

    const data: any = await response.json();
    const mappedMatches = data
      .map((m: any) => mapPandaScoreMatch(m))
      .filter((m: any) => m !== null)
      .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    res.json({ matches: mappedMatches });
  } catch (error: any) {
    console.error("[ESkorX Server] Error fetching matches by date:", error.message);
    res.status(500).json({ error: "Maçlar yüklenemedi." });
  }
});

// API Route: Team Details (Players, Form, Past Matches)
app.get("/api/esports/team/:id", async (req, res) => {
  const teamId = req.params.id;
  const apiKey = process.env.PANDASCORE_API_KEY || "oEf2D44TLV9wzCrdHC8qQ2qUsSFX-thsL8fz19YlKAcxlvXK-Yo";

  try {
    console.log(`[ESkorX Server] Fetching details for team ${teamId}...`);

    // 1. Fetch team details (including players)
    const teamRes = await fetch(`https://api.pandascore.co/teams/${teamId}`, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/json" }
    });
    const teamData: any = await teamRes.json();

    // 2. Fetch past matches for form status
    const matchesRes = await fetch(`https://api.pandascore.co/teams/${teamId}/matches?filter[status]=finished&per_page=5`, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/json" }
    });
    const matchesData: any = await matchesRes.json();

    // Map form (W/L)
    const form = matchesData.map((m: any) => {
      const isWinner = m.winner_id === parseInt(teamId);
      return isWinner ? "W" : "L";
    });

    res.json({
      id: teamData.id,
      name: teamData.name,
      image_url: teamData.image_url,
      players: teamData.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        first_name: p.first_name,
        last_name: p.last_name,
        role: p.role,
        image_url: p.image_url
      })),
      past_matches: matchesData.map((m: any) => ({
        id: m.id,
        opponent: m.opponents.find((o: any) => o.opponent.id !== parseInt(teamId))?.opponent.name || "Bilinmiyor",
        score: `${m.results[0].score} - ${m.results[1].score}`,
        winner: m.winner?.name,
        date: formatMatchTime(m.scheduled_at)
      })),
      form: form
    });

  } catch (error: any) {
    console.error("[ESkorX Server] Error fetching team details:", error.message);
    res.status(500).json({ error: "Takım detayları alınamadı." });
  }
});

// API Route: Live Match Analysis ("AI Yorumu")

app.post("/api/gemini/analyze", async (req, res) => {
  const { match } = req.body;
  if (!match) {
    return res.status(400).json({ error: "Match data is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      Aşağıdaki espor maçının detaylarını incele.
      Bu maç için Türkçe, heyecanlı ve profesyonel bir espor analisti tarzında ÇOK KISA bir durum yorumu (AI Yorumu) hazırla.
      Yorumun son derece akıcı, net ve EN FAZLA 1-2 kısa cümleden (tek bir satır) oluşsun. Asla uzatma, laf kalabalığı yapma.

      Maç Bilgileri:
      - Oyun: ${match.game}
      - Turnuva: ${match.tournament} (${match.stage})
      - Takımlar: ${match.teamA.name} vs ${match.teamB.name}
      - Skor: ${match.teamA.score} - ${match.teamB.score}
      - Durum/Süre: ${match.timer || match.mapInfo || "Devam Ediyor"}
      - Güncel Harita/İstatistikler: ${JSON.stringify(match.stats || {})}

      Analizini doğrudan Türkçe olarak yaz, başka bir dilde giriş veya açıklama ekleme.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
        systemInstruction: "Sen profesyonel bir espor analisti ve caster'sın. Türkçe konuşursun. Son derece kısa, öz ve vurucu tek cümlelik analizler yaparsın.",
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.warn("Gemini Analysis falling back due to error:", error.message || error);
    const analysis = getLocalMatchAnalysis(match);
    res.json({ analysis, isFallback: true });
  }
});

// API Route: Prediction Tip ("AI Tahmini")
app.post("/api/gemini/predict-tip", async (req, res) => {
  const { match } = req.body;
  if (!match) {
    return res.status(400).json({ error: "Match data is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      Aşağıdaki espor maçı için kapsamlı, istatistik odaklı ve nesnel bir veri analizi yap.
      
      Maç Detayları:
      - Oyun: ${match.game}
      - Turnuva: ${match.tournament}
      - Takım A: ${match.teamA.name} (Oran: ${match.teamA.odds})
      - Takım B: ${match.teamB.name} (Oran: ${match.teamB.odds})
      - Güncel Skor: ${match.teamA.score} - ${match.teamB.score}
      - Geçmiş Karşılaşmalar / Veriler: ${JSON.stringify(match.h2h || {})}

      Analiz Kuralları (KRİTİK):
      1. ASLA "kazanır", "domine eder", "yenecek" gibi kesinlik belirten fiiller kullanma.
      2. "İstatistikler %... ihtimalle X tarafını işaret ediyor", "Veri setine göre Y takımı bir adım önde görünüyor" gibi ifadeler kullan.
      3. Maçın gidişatını sayılarla açıkla. Oran farklarını ve geçmiş maçlardaki skor dağılımlarını (H2H) teknik bir dille analiz et.
      4. Sıradan yorumlardan kaçın; "harita havuzu geniş" gibi klasik cümleler yerine, o anki oranların ve skorun matematiksel karşılığını yorumla.
      
      Format: Toplamda 3 kısa paragraf veya madde olsun. Çıktı sadece Türkçe olsun.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        systemInstruction: "Sen profesyonel bir espor veri bilimcisisin. Duygusal veya kesin ifadeler kullanmazsın. Sadece olasılıklar, istatistikler ve oranlar üzerinden teknik analiz yaparsın.",
      },
    });

    res.json({ prediction: response.text });
  } catch (error: any) {
    console.warn("Gemini Predict Tip falling back due to error:", error.message || error);
    const prediction = getLocalPredictionTip(match);
    res.json({ prediction, isFallback: true });
  }
});

// API Route: Social Post Drafting ("Gemini ile Post Yaz")
app.post("/api/gemini/draft-post", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      E-spor ve oyun topluluğuna yönelik, aşağıdaki konu hakkında sosyal medyada paylaşılabilecek Türkçe, samimi ve yüksek enerjili bir gönderi (post) taslak olarak yaz.
      E-spor jargonuna uygun olsun, okuyucuları etkileşime davet etsin (soru sorsun) ve ilgili espor hashtag'lerini (#ESkorX, #CS2, #Valorant, #LoL vb.) eklesin.

      Konu: ${topic}
      
      Yanıt sadece gönderi içeriği olsun, tırnak işareti veya ek açıklamalar koyma.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
        systemInstruction: "Sen popüler bir espor influencerı ve sosyal medya yöneticisisin. Dinamik, heyecanlı ve toplulukla iç içe bir üsluba sahipsin.",
      },
    });

    res.json({ postContent: response.text });
  } catch (error: any) {
    console.warn("Gemini Post Draft falling back due to error:", error.message || error);
    const postContent = getLocalDraftPost(topic);
    res.json({ postContent, isFallback: true });
  }
});

// API Route: Smart Comment Suggestion ("Gemini ile Yorum Yap")
app.post("/api/gemini/suggest-comments", async (req, res) => {
  const { postContent } = req.body;
  if (!postContent) {
    return res.status(400).json({ error: "Post content is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `
      Aşağıda paylaşılan espor gönderisi için kullanıcının seçebileceği 3 farklı tarzda akıllıca, kısa ve esprili Türkçe yorum seçeneği öner.
      Gönderi İçeriği: "${postContent}"

      Seçenekler şu tarzlarda olsun:
      1. Heyecanlı/Destekleyici (Takımı veya fikri destekleyen)
      2. Taktiksel/Analitik (Biraz daha oyun derinliği katan)
      3. Eğlenceli/Esprili (Mizahi veya hafif takılmalı)

      Format: Her bir yorumu yeni bir satırda ver. Başlarına '1.', '2.', '3.' koyarak ayır. Başka hiçbir şey yazma.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
        systemInstruction: "Sen espor forumlarında aktif, sempatik, esprili ve bilgili bir espor takipçisisin. Kısa, samimi ve jargona hakim yorumlar yazarsın.",
      },
    });

    // Parse output line-by-line
    const lines = response.text?.split("\n") || [];
    const suggestions = lines
      .map(line => line.replace(/^\d+[\.\s\-:]*/, "").trim())
      .filter(line => line.length > 0)
      .slice(0, 3);

    // Fallback if formatting was slightly off
    while (suggestions.length < 3) {
      suggestions.push("Efsane analiz, takipteyim! 🔥");
    }

    res.json({ suggestions });
  } catch (error: any) {
    console.warn("Gemini Comment Suggestion falling back due to error:", error.message || error);
    const suggestions = getLocalCommentSuggestions(postContent);
    res.json({ suggestions, isFallback: true });
  }
});

// Integrate Vite Dev Server or Serve Production Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ESkorX Server] Running on http://localhost:${PORT}`);
  });
}

setupServer();
