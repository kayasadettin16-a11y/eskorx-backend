import React, { useState, useEffect, useRef } from "react";
import { 
  MOCK_MATCHES, 
  MOCK_POSTS, 
  MOCK_LEADERBOARD, 
  TRENDING_TOPICS, 
  MOCK_STORIES 
} from "../data/mockEsportsData";
import { Match, Post, Prediction, Comment } from "../types";
import { API_BASE_URL } from "../config";
import {
  Home as HomeIcon, 
  Radio, 
  Flame, 
  Target, 
  User, 
  Coins, 
  Sparkles, 
  TrendingUp, 
  Send, 
  Heart, 
  MessageSquare, 
  Share2, 
  Repeat, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Moon, 
  Sun, 
  Check, 
  Clock, 
  RefreshCw, 
  Gamepad2, 
  MapPin, 
  X,
  ThumbsUp,
  Sliders,
  CheckCircle2,
  Lock,
  Star,
  Calendar,
  Search,
  ChevronUp,
  ChevronDown
} from "lucide-react";

export default function AndroidEmulator() {
  // Mobile app States
  const [currentScreen, setCurrentScreen] = useState<"splash" | "onboarding" | "login" | "dashboard" | "match-detail">("splash");
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Home, 1: Live, 2: Feed, 3: Predict, 4: Profile
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [themeMode, setThemeMode] = useState<"dark" | "amoled">("amoled");

  // User auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Ziyaretçi");
  const [userAvatar, setUserAvatar] = useState("👤");

  // User accounts database (stored in localStorage)
  const [users, setUsers] = useState<{username: string; password: string; email: string; avatar: string}[]>(() => {
    try {
      const saved = localStorage.getItem("eskorx_registered_users");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { username: "admin", password: "123", email: "admin@eskorx.com", avatar: "🛡️" },
      { username: "GamerPlayer", password: "123", email: "gamer@eskorx.com", avatar: "🎮" }
    ];
  });

  const saveUsers = (newUsers: {username: string; password: string; email: string; avatar: string}[]) => {
    setUsers(newUsers);
    localStorage.setItem("eskorx_registered_users", JSON.stringify(newUsers));
  };

  // Auth Modes
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [profileAuthMode, setProfileAuthMode] = useState<"login" | "register">("login");

  // Registration input states
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedRegAvatar, setSelectedRegAvatar] = useState("🛡️");

  // Profile Tab Registration input states
  const [profileRegUsername, setProfileRegUsername] = useState("");
  const [profileRegEmail, setProfileRegEmail] = useState("");
  const [profileRegPassword, setProfileRegPassword] = useState("");
  const [profileSelectedRegAvatar, setProfileSelectedRegAvatar] = useState("🛡️");

  // Errors / feedback
  const [authError, setAuthError] = useState("");
  const [profileAuthError, setProfileAuthError] = useState("");

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("eskorx_favorites");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Akış (Calendar) tab states
  const [simulatedToday, setSimulatedToday] = useState<string>("2026-07-12");
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-12");
  const [dateMatches, setDateMatches] = useState<Match[]>([]);
  const [isDateMatchesLoading, setIsDateMatchesLoading] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(2026, 6, 11)); // Month is 0-indexed

  const toggleFavorite = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(matchId)
      ? favorites.filter(id => id !== matchId)
      : [...favorites, matchId];
    setFavorites(newFavorites);
    localStorage.setItem("eskorx_favorites", JSON.stringify(newFavorites));
  };

  // Login inputs state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [profileLoginUser, setProfileLoginUser] = useState("");
  const [profileLoginPass, setProfileLoginPass] = useState("");

  // Handle Email/Password Login
  const handleEmailLogin = () => {
    setAuthError("");
    const enteredUser = loginEmail.trim();
    const enteredPass = loginPassword;

    if (!enteredUser || !enteredPass) {
      setAuthError("Lütfen tüm alanları doldurun.");
      return;
    }

    const foundUser = users.find(
      u => u.username.toLowerCase() === enteredUser.toLowerCase() || (u.email && u.email.toLowerCase() === enteredUser.toLowerCase())
    );

    if (foundUser && foundUser.password === enteredPass) {
      setUsername(foundUser.username);
      setUserAvatar(foundUser.avatar || "🛡️");
      setIsLoggedIn(true);
      setCredits(prev => Math.max(prev, 1000));
      setCurrentScreen("dashboard");
      // reset inputs
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setAuthError("Kullanıcı adı veya şifre yanlış!");
    }
  };

  // Handle Email Registration
  const handleEmailRegister = () => {
    setAuthError("");
    const name = regUsername.trim();
    const email = regEmail.trim();
    const pass = regPassword;

    if (!name || !pass) {
      setAuthError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    // Check if username already exists
    const exists = users.some(u => u.username.toLowerCase() === name.toLowerCase());
    if (exists) {
      setAuthError("Bu kullanıcı adı zaten alınmış!");
      return;
    }

    const newUser = {
      username: name,
      email: email || `${name.toLowerCase()}@eskorx.com`,
      password: pass,
      avatar: selectedRegAvatar
    };

    const updated = [...users, newUser];
    saveUsers(updated);

    // Automatically log in
    setUsername(newUser.username);
    setUserAvatar(newUser.avatar);
    setIsLoggedIn(true);
    setCredits(prev => Math.max(prev, 1000));
    setCurrentScreen("dashboard");

    // Reset inputs & mode
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setAuthMode("login");
  };

  // Handle Profile Tab Login
  const handleProfileTabLogin = () => {
    setProfileAuthError("");
    const enteredUser = profileLoginUser.trim();
    const enteredPass = profileLoginPass;

    if (!enteredUser || !enteredPass) {
      setProfileAuthError("Lütfen tüm alanları doldurun.");
      return;
    }

    const foundUser = users.find(
      u => u.username.toLowerCase() === enteredUser.toLowerCase() || (u.email && u.email.toLowerCase() === enteredUser.toLowerCase())
    );

    if (foundUser && foundUser.password === enteredPass) {
      setUsername(foundUser.username);
      setUserAvatar(foundUser.avatar || "🛡️");
      setIsLoggedIn(true);
      setCredits(prev => Math.max(prev, 1000));
      // reset inputs
      setProfileLoginUser("");
      setProfileLoginPass("");
    } else {
      setProfileAuthError("Kullanıcı adı veya şifre yanlış!");
    }
  };

  // Handle Profile Tab Registration
  const handleProfileTabRegister = () => {
    setProfileAuthError("");
    const name = profileRegUsername.trim();
    const email = profileRegEmail.trim();
    const pass = profileRegPassword;

    if (!name || !pass) {
      setProfileAuthError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    const exists = users.some(u => u.username.toLowerCase() === name.toLowerCase());
    if (exists) {
      setProfileAuthError("Bu kullanıcı adı zaten alınmış!");
      return;
    }

    const newUser = {
      username: name,
      email: email || `${name.toLowerCase()}@eskorx.com`,
      password: pass,
      avatar: profileSelectedRegAvatar
    };

    const updated = [...users, newUser];
    saveUsers(updated);

    // Log in
    setUsername(newUser.username);
    setUserAvatar(newUser.avatar);
    setIsLoggedIn(true);
    setCredits(prev => Math.max(prev, 1000));
    
    // Reset
    setProfileRegUsername("");
    setProfileRegEmail("");
    setProfileRegPassword("");
    setProfileAuthMode("login");
  };
  
  // App Core Data states
  const [credits, setCredits] = useState(1000);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [apiActive, setApiActive] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const fetchMatches = async () => {
    setMatchesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/esports/matches`);
      const data = await response.json();
      if (data) {
        if (data.matches && Array.isArray(data.matches)) {
          setMatches(data.matches);
          setApiActive(!!data.apiActive);
        } else if (Array.isArray(data)) {
          setMatches(data);
        }
      }
    } catch (e) {
      console.error("Error fetching live matches:", e);
    } finally {
      setMatchesLoading(false);
    }
  };
  
  // Active prediction stake state
  const [betMatch, setBetMatch] = useState<Match | null>(null);
  const [betSide, setBetSide] = useState<"teamA" | "teamB">("teamA");
  const [stakeAmount, setStakeAmount] = useState(100);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);

  // Leaderboard states
  const [predictSubTab, setPredictSubTab] = useState<"matches" | "leaderboard">("matches");
  const [currentWeek, setCurrentWeek] = useState<number>(4);
  const [showSeasonResetToast, setShowSeasonResetToast] = useState(false);
  const [lastWeekWinners, setLastWeekWinners] = useState<{username: string; avatar: string; correct: number; total: number}[] | null>(() => {
    try {
      const saved = localStorage.getItem("eskorx_last_week_winners");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { username: "KralTahminci", avatar: "🔮", correct: 19, total: 25 },
      { username: "Analist_Ege", avatar: "⚡", correct: 16, total: 21 },
      { username: "ProPredictor", avatar: "🎯", correct: 14, total: 20 }
    ];
  });

  const [leaderboardParticipants, setLeaderboardParticipants] = useState<{username: string; avatar: string; correct: number; total: number; isBot: boolean}[]>(() => {
    try {
      const saved = localStorage.getItem("eskorx_leaderboard_participants");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { username: "KralTahminci", avatar: "🔮", correct: 17, total: 24, isBot: true },
      { username: "Analist_Ege", avatar: "⚡", correct: 14, total: 21, isBot: true },
      { username: "ProPredictor", avatar: "🎯", correct: 13, total: 19, isBot: true },
      { username: "CS2_Kralı", avatar: "🛡️", correct: 11, total: 18, isBot: true },
      { username: "LoL_Uzmanı", avatar: "🌟", correct: 10, total: 15, isBot: true },
      { username: "GamerGirl", avatar: "🔥", correct: 8, total: 14, isBot: true },
      { username: "E-SporTutkunu", avatar: "👾", correct: 7, total: 13, isBot: true }
    ];
  });

  // Selected game category for filters
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("Hepsi");
  const [liveSearchQuery, setLiveSearchQuery] = useState("");

  // Gemini AI action states
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>("");
  const [activeDetailTab, setActiveDetailTab] = useState<"stats" | "h2h" | "lineup" | "gemini">("stats");

  const [aiTipLoading, setAiTipLoading] = useState<string | null>(null);
  const [aiTipResult, setAiTipResult] = useState<Record<string, string>>({}); // matchId -> tip text

  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [postTopic, setPostTopic] = useState("");
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  const [smartCommentsLoading, setSmartCommentsLoading] = useState<string | null>(null); // postId
  const [suggestedComments, setSuggestedComments] = useState<string[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [customCommentText, setCustomCommentText] = useState("");

  // Team detail states
  const [teamDetail, setTeamDetail] = useState<any>(null);
  const [isTeamDetailLoading, setIsTeamDetailLoading] = useState(false);

  // Simulated live updates (Score flash animation)
  const [flashingTeamId, setFlashingTeamId] = useState<string | null>(null);

  // Splash Screen Lifecycle
  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen("onboarding");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Load real-time live esports matches on mount and periodically
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => {
      fetchMatches();
    }, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Auto-select Today when date rolls over
  useEffect(() => {
    setSelectedDate(simulatedToday);
  }, [simulatedToday]);

  // Fetch matches when selectedDate changes in Akış tab
  useEffect(() => {
    const fetchMatchesByDate = async () => {
      setIsDateMatchesLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/esports/matches-by-date?date=${selectedDate}`);
        const data = await response.json();
        if (data.matches) {
          setDateMatches(data.matches);
        }
      } catch (err) {
        console.error("Error fetching matches by date:", err);
      } finally {
        setIsDateMatchesLoading(false);
      }
    };

    if (activeTab === 2) {
      fetchMatchesByDate();
    }
  }, [selectedDate, activeTab]);

  // Periodic random score updates (Live matches & competitor activity)
  useEffect(() => {
    if (currentScreen !== "dashboard" && currentScreen !== "match-detail") return;

    const interval = setInterval(() => {
      // Pick a random live match
      const liveMatches = matches.filter(m => m.isLive);
      if (liveMatches.length === 0) return;
      const randomMatch = liveMatches[Math.floor(Math.random() * liveMatches.length)];
      
      setMatches(prevMatches => prevMatches.map(m => {
        if (m.id === randomMatch.id) {
          const isTeamA = Math.random() > 0.5;
          const currentScore = isTeamA ? m.teamA.score : m.teamB.score;
          
          // Max score caps
          if (m.game === "CS2" && currentScore >= 13) return m;
          if (m.game === "LoL" && currentScore >= 3) return m;

          // Trigger flash animation
          setFlashingTeamId(`${m.id}-${isTeamA ? 'A' : 'B'}`);
          setTimeout(() => setFlashingTeamId(null), 1000);

          return {
            ...m,
            teamA: {
              ...m.teamA,
              score: isTeamA ? m.teamA.score + 1 : m.teamA.score
            },
            teamB: {
              ...m.teamB,
              score: !isTeamA ? m.teamB.score + 1 : m.teamB.score
            }
          };
        }
        return m;
      }));

      // Simulate other leaderboard predictors doing predictions too!
      setLeaderboardParticipants(prev => {
        const luckyBotIndex = Math.floor(Math.random() * prev.length);
        const updated = prev.map((bot, idx) => {
          if (idx === luckyBotIndex) {
            const extraTotal = 1;
            const extraCorrect = Math.random() > 0.48 ? 1 : 0;
            return {
              ...bot,
              total: bot.total + extraTotal,
              correct: bot.correct + extraCorrect
            };
          }
          return bot;
        });
        localStorage.setItem("eskorx_leaderboard_participants", JSON.stringify(updated));
        return updated;
      });
    }, 15000); // every 15s

    return () => clearInterval(interval);
  }, [currentScreen, matches]);

  // Status Bar Clock State (Simulated for 12.07.2026 00:00)
  const [currentTime, setCurrentTime] = useState("00:00");
  const timeRefs = useRef({
    baseDate: new Date("2026-07-12T00:00:00"),
    realStartTime: new Date()
  });

  useEffect(() => {
    const updateTime = () => {
      const realNow = new Date();
      const diffMs = realNow.getTime() - timeRefs.current.realStartTime.getTime();
      const simulatedNow = new Date(timeRefs.current.baseDate.getTime() + diffMs);

      const hours = simulatedNow.getHours().toString().padStart(2, '0');
      const minutes = simulatedNow.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const year = simulatedNow.getFullYear();
      const month = (simulatedNow.getMonth() + 1).toString().padStart(2, '0');
      const day = simulatedNow.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      setSimulatedToday(prev => {
        if (prev !== dateStr) {
          return dateStr;
        }
        return prev;
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Onboarding Data
  const onboardingSteps = [
    {
      title: "Anlık Canlı Skorlar",
      description: "CS2, Valorant, LoL ve daha fazlasında canlı haritaları, öldürme sayılarını ve anlık durumları en düşük gecikmeyle takip et.",
      emoji: "📡"
    },
    {
      title: "E-Spor Sosyal Akışı",
      description: "E-spor topluluğunun nabzını tut! Paylaşımlar yap, smart AI yorumlar ile etkileşimi artır ve fikirlerini paylaş.",
      emoji: "🔥"
    },
    {
      title: "Tahmin Yap & Kazan",
      description: "Bedava ESKredit'lerini kullanarak favori takımlarına tahmin yap, haftalık liderlik tablosunda en yukarılara tırman!",
      emoji: "🎯"
    }
  ];

  // Call server-side Gemini API for Match Analysis
  const handleGetAiAnalysis = async (match: Match) => {
    setAiAnalysisLoading(true);
    setAiAnalysisResult("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match })
      });
      const data = await response.json();
      if (data.error) {
        setAiAnalysisResult(`Hata: ${data.error}`);
      } else {
        setAiAnalysisResult(data.analysis || "Analiz oluşturulamadı.");
      }
    } catch (err: any) {
      setAiAnalysisResult("Sunucu bağlantısı başarısız oldu.");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // Call server-side Gemini API for Prediction Tips
  const handleGetPredictionTip = async (match: Match) => {
    setAiTipLoading(match.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/predict-tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match })
      });
      const data = await response.json();
      if (data.error) {
        setAiTipResult(prev => ({ ...prev, [match.id]: `Hata: ${data.error}` }));
      } else {
        setAiTipResult(prev => ({ ...prev, [match.id]: data.prediction || "Tahmin alınamadı." }));
      }
    } catch (err) {
      setAiTipResult(prev => ({ ...prev, [match.id]: "Sunucu bağlantı hatası." }));
    } finally {
      setAiTipLoading(null);
    }
  };

  // Call server-side Gemini API to draft a post
  const handleDraftAiPost = async () => {
    if (!postTopic.trim()) return;
    setAiDraftLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/draft-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: postTopic })
      });
      const data = await response.json();
      if (data.error) {
        setNewPostText(`Yapay zeka taslak oluşturamadı: ${data.error}`);
      } else {
        setNewPostText(data.postContent || "");
      }
    } catch (err) {
      setNewPostText("Yapay zeka bağlantı hatası oluştu.");
    } finally {
      setAiDraftLoading(false);
    }
  };

  // Call server-side Gemini API for smart comment suggestions
  const handleGetSmartComments = async (post: Post) => {
    setSmartCommentsLoading(post.id);
    setSuggestedComments([]);
    setActiveCommentPostId(post.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/suggest-comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postContent: post.content })
      });
      const data = await response.json();
      if (data.suggestions) {
        setSuggestedComments(data.suggestions);
      } else {
        setSuggestedComments(["Harika analiz! 👍", "Katılıyorum, harika maçtı.", "Sonuç sürpriz oldu!"]);
      }
    } catch (err) {
      setSuggestedComments(["Efsane yorum! 🔥", "Tebrikler takıma!", "Harika paylaşımdı."]);
    } finally {
      setSmartCommentsLoading(null);
    }
  };

  // Fetch Team Details from Backend
  const handleGetTeamDetails = async (teamId: number | undefined) => {
    console.log("handleGetTeamDetails called with ID:", teamId);
    if (!teamId) {
      console.warn("No team ID provided for handleGetTeamDetails");
      return;
    }
    setIsTeamDetailLoading(true);
    setTeamDetail(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/esports/team/${teamId}`);
      const data = await response.json();
      console.log("Team details received:", data);
      if (data.error) {
        alert(data.error);
      } else {
        setTeamDetail(data);
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
    } finally {
      setIsTeamDetailLoading(false);
    }
  };

  // Handle local post reaction likes
  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    }));
  };

  // Handle local comments submission
  const handleAddComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      user: username,
      avatar: userAvatar,
      content: text,
      timestamp: "Şimdi"
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: [...p.commentsList, newComment]
        };
      }
      return p;
    }));
    
    // reset states
    setCustomCommentText("");
    setActiveCommentPostId(null);
    setSuggestedComments([]);
  };

  // Handle Prediction Submission
  const handleConfirmPrediction = () => {
    if (!betMatch) return;
    if (stakeAmount > credits) {
      alert("Yetersiz bakiye!");
      return;
    }

    const predictedTeamName = betSide === "teamA" ? betMatch.teamA.name : betMatch.teamB.name;
    const oddsValue = betSide === "teamA" ? betMatch.teamA.odds : betMatch.teamB.odds;
    const potentialReward = Math.round(stakeAmount * oddsValue);

    const newPred: Prediction = {
      id: `pred-${Date.now()}`,
      match: betMatch,
      predictedTeam: betSide,
      stake: stakeAmount,
      odds: oddsValue,
      status: "pending",
      potentialReward,
      timestamp: "Şimdi"
    };

    setUserPredictions([newPred, ...userPredictions]);
    setCredits(prev => prev - stakeAmount);

    // Auto add a social post about the prediction
    const newSocialPost: Post = {
      id: `post-pred-${Date.now()}`,
      user: username,
      avatar: userAvatar,
      content: `🎯 ESkorX'te bir tahminde bulundum! ${betMatch.teamA.name} vs ${betMatch.teamB.name} maçında tercihim: ${predictedTeamName} (${oddsValue} oran). Sizce kazanır mıyım? #ESkorX #Tahmin`,
      timestamp: "Şimdi",
      gameTag: betMatch.game,
      likesCount: 1,
      commentsCount: 0,
      repostsCount: 0,
      commentsList: [],
      sharedPrediction: {
        teamName: predictedTeamName,
        stake: stakeAmount,
        odds: oddsValue
      }
    };
    setPosts([newSocialPost, ...posts]);

    // Close Modal and clear
    setBetMatch(null);

    // Simulate Match Settlement after 12 seconds
    setTimeout(() => {
      setUserPredictions(prev => prev.map(p => {
        if (p.id === newPred.id) {
          // 50% random win/loss
          const isWin = Math.random() > 0.45;
          if (isWin) {
            setCredits(c => c + p.potentialReward);
            return { ...p, status: "won" };
          } else {
            return { ...p, status: "lost" };
          }
        }
        return p;
      }));
    }, 12000);
  };

  // Create Custom Post
  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      user: username,
      avatar: userAvatar,
      content: newPostText,
      timestamp: "Şimdi",
      gameTag: "Genel",
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      commentsList: []
    };
    setPosts([newPost, ...posts]);
    setNewPostText("");
    setPostTopic("");
    setShowCreatePostModal(false);
  };

  // Dynamic Leaderboard sorting based on current user stats and bots
  const userCorrect = userPredictions.filter(p => p.status === "won").length;
  const userTotal = userPredictions.filter(p => p.status === "won" || p.status === "lost").length;

  const currentLeaderboard = [
    ...leaderboardParticipants,
    {
      username: username,
      avatar: userAvatar,
      correct: userCorrect,
      total: userTotal,
      isBot: false
    }
  ].sort((a, b) => {
    if (b.correct !== a.correct) return b.correct - a.correct;
    const rateA = a.total > 0 ? a.correct / a.total : 0;
    const rateB = b.total > 0 ? b.correct / b.total : 0;
    if (rateB !== rateA) return rateB - rateA;
    return b.total - a.total;
  });

  const handleWeeklyReset = () => {
    // 1. Get current top 3
    const top3 = currentLeaderboard.slice(0, 3).map(p => ({
      username: p.username,
      avatar: p.avatar,
      correct: p.correct,
      total: p.total
    }));

    setLastWeekWinners(top3);
    localStorage.setItem("eskorx_last_week_winners", JSON.stringify(top3));

    // 2. Increment week count
    setCurrentWeek(prev => prev + 1);

    // 3. Reset bot scores
    const resetBots = leaderboardParticipants.map(bot => ({
      ...bot,
      correct: 0,
      total: 0
    }));
    setLeaderboardParticipants(resetBots);
    localStorage.setItem("eskorx_leaderboard_participants", JSON.stringify(resetBots));

    // 4. Reset user predictions
    setUserPredictions([]);

    // 5. Alert toast
    setShowSeasonResetToast(true);
    setTimeout(() => {
      setShowSeasonResetToast(false);
    }, 4000);
  };

  // Filtered live scores list
  const filteredMatches = matches.filter(m => {
    if (selectedGameFilter === "Hepsi") return true;
    return m.game === selectedGameFilter;
  });

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden select-none ${
        themeMode === "amoled" ? "bg-black" : "bg-[#0A0A0F]"
      }`}>

      {/* SCREEN ROUTER */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* 1. SPLASH SCREEN */}
        {currentScreen === "splash" && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#0A0A0F] to-[#12121A]">
            <div className="relative w-24 h-24 flex items-center justify-center bg-black/40 rounded-3xl border border-[#00E5FF]/20 shadow-[0_0_30px_rgba(0,229,255,0.15)] animate-pulse">
              <span className="text-3xl font-extrabold text-[#00E5FF] tracking-tighter">ESX</span>
              {/* Outer Cyan Ring */}
              <div className="absolute inset-0 border-2 border-dashed border-[#00E5FF]/40 rounded-3xl animate-spin [animation-duration:15s]"></div>
            </div>
            <h1 className="mt-5 text-xl font-extrabold text-white tracking-widest">ESkorX</h1>
            <p className="mt-1.5 text-[10px] text-gray-500 font-mono tracking-widest uppercase">Gemini AI E-sports</p>
            
            <div className="absolute bottom-10 flex flex-col items-center gap-1.5">
              <span className="text-[9px] text-[#7C4DFF] font-semibold animate-pulse">SUNUCUYA BAĞLANIYOR...</span>
              <div className="w-32 h-1 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] w-2/3 rounded-full animate-[loading_2.2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ONBOARDING SCREEN */}
        {currentScreen === "onboarding" && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#12121A] to-black">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-[#00E5FF]">ESkorX</span>
              <button 
                onClick={() => setCurrentScreen("login")}
                className="text-xs text-gray-500 font-bold hover:text-white"
              >
                Atla
              </button>
            </div>

            <div className="my-auto flex flex-col items-center text-center px-2">
              <span className="text-5xl mb-6 select-none leading-none animate-[bounce_2s_infinite]">
                {onboardingSteps[onboardingStep].emoji}
              </span>
              <h2 className="text-lg font-extrabold text-white tracking-tight mb-2">
                {onboardingSteps[onboardingStep].title}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                {onboardingSteps[onboardingStep].description}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Dot Indicators */}
              <div className="flex justify-center gap-1.5">
                {onboardingSteps.map((_, i) => (
                  <span 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === onboardingStep ? "w-6 bg-[#00E5FF]" : "w-1.5 bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <button 
                onClick={() => {
                  if (onboardingStep < 2) {
                    setOnboardingStep(onboardingStep + 1);
                  } else {
                    setCurrentScreen("login");
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-black font-black text-xs rounded-xl shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition-all"
              >
                {onboardingStep === 2 ? "Başlayalım" : "Devam Et"}
              </button>
            </div>
          </div>
        )}

        {/* 3. LOGIN SCREEN */}
        {currentScreen === "login" && (
          <div className="flex-1 flex flex-col justify-center p-8 bg-[#0F0F14] overflow-y-auto custom-scrollbar min-h-screen w-full">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-[#1A1C22] rounded-[24px] flex items-center justify-center shadow-xl border border-white/5">
                <span className="text-3xl font-black text-[#45D1E8] tracking-tighter">ESX</span>
              </div>
              <h1 className="text-3xl font-bold text-white mt-6 tracking-tight">eSkorX Portal</h1>
              <p className="text-sm text-gray-400 mt-2 font-medium opacity-80">E-sporun yapay zeka destekli dünyası</p>
            </div>

            {/* Login Form */}
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e-mail"
                  value={loginEmail}
                  readOnly
                  className="w-full px-6 py-4 bg-[#1A1C22] text-white border border-white/10 text-base rounded-full focus:outline-none placeholder-gray-500 font-medium transition-all cursor-default"
                />
                <span className="absolute -top-3 -right-2 bg-gray-400 text-black text-[10px] font-black px-2 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
              </div>

              <input
                type="password"
                placeholder="Şifre"
                value={loginPassword}
                readOnly
                className="w-full px-6 py-4 bg-[#1A1C22] text-white border border-white/10 text-base rounded-full focus:outline-none placeholder-gray-500 font-medium transition-all cursor-default"
              />

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">VEYA</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Social Login Grid */}
              <div className="space-y-3">
                <div className="relative">
                  <button className="w-full py-4 bg-[#1A1C22] text-white/40 font-bold text-base rounded-full flex items-center justify-center gap-3 border border-white/5 cursor-default">
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-40" alt="Google" />
                    Google ile Giriş Yap
                  </button>
                  <span className="absolute -top-3 -right-2 bg-gray-400 text-black text-[10px] font-black px-2 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <button className="w-full py-3.5 bg-[#2A3F4A] text-white/90 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 opacity-80 cursor-default">
                      <Gamepad2 size={16} /> Steam
                    </button>
                    <span className="absolute -top-2 -right-1 bg-gray-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
                  </div>
                  <div className="relative">
                    <button className="w-full py-3.5 bg-[#6441a5] text-white/90 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 opacity-80 cursor-default">
                      <Radio size={16} /> Twitch
                    </button>
                    <span className="absolute -top-2 -right-1 bg-gray-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCredits(1000);
                  setIsLoggedIn(false);
                  setUsername("Ziyaretçi");
                  setUserAvatar("👤");
                  setCurrentScreen("dashboard");
                }}
                className="w-full mt-6 py-5 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-black font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center group"
              >
                Ziyaretçi Olarak Devam Et
                <Sparkles size={20} className="ml-2 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* 4. DASHBOARD SCREEN (Tabs 0-4) */}
        {currentScreen === "dashboard" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Dynamic Dashboard Tab Header */}
            <header className="px-4 py-3 border-b border-[#1c1c24] flex justify-between items-center bg-[#12121A]">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-[#00E5FF]">ESkorX</span>
                <span className="text-[9px] bg-[#7C4DFF]/20 text-[#7C4DFF] px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
              </div>

              {/* Credit Badge */}
              <div className="flex items-center gap-1 bg-[#1a1a24] border border-yellow-500/20 rounded-full py-1 px-2.5">
                <Coins size={12} className="text-yellow-500 animate-spin [animation-duration:10s]" />
                <span className="text-[10px] font-mono text-yellow-500 font-bold">{credits}</span>
              </div>
            </header>

            {/* TAB SCREENS VIEW */}
            <div className="flex-1 overflow-y-auto min-h-0">
              
              {/* TAB 0: HOME / PANORAMA */}
              {activeTab === 0 && (
                <div className="p-4 space-y-4">
                  {/* Highlights section Banner */}
                  <div className="relative bg-gradient-to-r from-[#7C4DFF]/30 to-[#00E5FF]/20 border border-[#7C4DFF]/30 rounded-2xl p-4 overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-1 max-w-[170px]">
                      <span className="text-[9px] font-black uppercase text-[#00E5FF] tracking-wider">Haftanın Maçı</span>
                      <h3 className="text-xs font-black text-white">T1 - Gen.G LCK Büyük Finali</h3>
                      <p className="text-[10px] text-gray-300">Harika oranlarla tahmin yapmaya başla.</p>
                      <button 
                        onClick={() => {
                          const m = matches.find(m => m.id === "match-lol-1");
                          if (m) {
                            setSelectedMatch(m);
                            setCurrentScreen("match-detail");
                          }
                        }}
                        className="mt-2 w-max px-3 py-1.5 bg-[#00E5FF] text-black font-extrabold text-[10px] rounded-lg shadow shadow-cyan-500/20 active:scale-[0.98] transition-all"
                      >
                        Maçı İncele
                      </button>
                    </div>
                    {/* Abstract design elements */}
                    <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-xl"></div>
                    <span className="absolute right-4 bottom-2 text-6xl opacity-20 select-none">🎮</span>
                  </div>

                  {/* Top Live Match list */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Öne Çıkan Canlı Maçlar</span>
                      <button onClick={() => setActiveTab(1)} className="text-[10px] text-[#00E5FF] font-bold">Tümü</button>
                    </div>

                    <div className="space-y-2">
                      {matches.slice(0, 3).map((match) => (
                        <div 
                          key={match.id}
                          onClick={() => {
                            setSelectedMatch(match);
                            setCurrentScreen("match-detail");
                          }}
                          className="bg-[#12121A] border border-[#1e1e28] rounded-xl p-3 hover:border-[#00E5FF]/30 transition-all cursor-pointer relative"
                        >
                          <div className="flex justify-between items-center text-[8px] text-gray-400 mb-1.5">
                            <span className="text-[#00E5FF] font-bold font-mono">{match.game}</span>
                            <div className="flex items-center gap-2">
                              {match.timer === "CANLI" && (
                                <span className="text-[8px] text-[#00E5FF] font-mono bg-[#00E5FF]/10 px-1.5 py-0.5 rounded">
                                  👁️ {(match as any).viewerCount ? `${((match as any).viewerCount / 1000).toFixed(1)}k` : "0.8k"}
                                </span>
                              )}
                              <button
                                onClick={(e) => toggleFavorite(e, match.id)}
                                className="p-1 -m-1"
                              >
                                <Star
                                  size={10}
                                  className={favorites.includes(match.id) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                                />
                              </button>
                              <div className="flex items-center gap-1">
                                {match.timer === "CANLI" && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>}
                                <span className={`font-mono ${match.timer === "BİTTİ" ? "text-gray-500" : ""}`}>{match.timer}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{match.teamA.logo}</span>
                                <span className="text-[10px] text-white font-bold">{match.teamA.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{match.teamB.logo}</span>
                                <span className="text-[10px] text-white font-bold">{match.teamB.name}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-0.5 font-mono font-black text-[10px] text-[#00E5FF]">
                              <span className={flashingTeamId === `${match.id}-A` ? "text-green-400 font-extrabold animate-pulse" : ""}>{match.teamA.score}</span>
                              <span className={flashingTeamId === `${match.id}-B` ? "text-green-400 font-extrabold animate-pulse" : ""}>{match.teamB.score}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Favorites section on Home */}
                  {favorites.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Favori Maçlarım</span>
                      <div className="space-y-2.5">
                        {matches.filter(m => favorites.includes(m.id)).map((match) => (
                          <div
                            key={`fav-${match.id}`}
                            onClick={() => {
                              setSelectedMatch(match);
                              setCurrentScreen("match-detail");
                            }}
                            className="bg-[#12121A] border border-yellow-500/10 rounded-xl p-3 hover:border-yellow-500/30 transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-center text-[9px] mb-2">
                              <span className="text-yellow-500 font-bold font-mono">{match.game}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={(e) => toggleFavorite(e, match.id)}>
                                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                </button>
                                <span className="text-gray-500 font-mono">{match.timer}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white font-bold">{match.teamA.name} vs {match.teamB.name}</span>
                              <span className="text-xs font-mono font-black text-yellow-500">{match.teamA.score} - {match.teamB.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: LIVE SCORES */}
              {activeTab === 1 && (
                <div className="p-4 space-y-4">
                  {/* Real-time status header */}
                  <div className="flex justify-between items-center bg-[#12121A]/40 border border-[#1e1e28]/50 rounded-xl p-2.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
                        CANLI VERİ AKIŞI
                      </span>
                      <span className="text-[8px] text-gray-500 font-bold uppercase">
                        {apiActive ? "PandaScore API Aktif" : "Premium Demo Modu"}
                      </span>
                    </div>
                    <button 
                      onClick={fetchMatches}
                      disabled={matchesLoading}
                      className="px-2.5 py-1.5 bg-[#12121A] border border-[#1e1e28] hover:border-[#00E5FF]/20 rounded-lg active:scale-95 transition-all text-gray-400 hover:text-white flex items-center gap-1 text-[9px] font-extrabold"
                    >
                      <RefreshCw size={10} className={matchesLoading ? "animate-spin text-[#00E5FF]" : ""} />
                      <span>{matchesLoading ? "Yenileniyor..." : "Yenile"}</span>
                    </button>
                  </div>

                  {/* Search and Category Scroll Container */}
                  <div className="space-y-3">
                    {/* Game Search Box (Mirrored from Akış) */}
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Oyun veya takım ara..."
                        value={liveSearchQuery}
                        onChange={(e) => setLiveSearchQuery(e.target.value)}
                        className="w-full bg-[#12121A] border border-[#1e1e28] rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                      />
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>

                    {/* Dynamic Category Scroll */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {["Hepsi", ...Array.from(new Set(matches.map(m => m.game)))].map((g) => {
                        const isSel = selectedGameFilter === g;
                        return (
                          <button
                            key={g}
                            onClick={() => setSelectedGameFilter(g)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                              isSel
                                ? "bg-[#00E5FF] text-black shadow shadow-cyan-400/20"
                                : "bg-[#12121A] text-gray-400 border border-[#1d1d26] hover:text-white"
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtered Matches List */}
                  <div className="space-y-3">
                    {(() => {
                      const filtered = matches.filter(m => {
                        const matchesCategory = selectedGameFilter === "Hepsi" || m.game === selectedGameFilter;
                        const matchesSearch = m.teamA.name.toLowerCase().includes(liveSearchQuery.toLowerCase()) ||
                                              m.teamB.name.toLowerCase().includes(liveSearchQuery.toLowerCase()) ||
                                              m.game.toLowerCase().includes(liveSearchQuery.toLowerCase()) ||
                                              m.tournament.toLowerCase().includes(liveSearchQuery.toLowerCase());
                        return matchesCategory && matchesSearch;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-10 text-gray-500 text-xs">
                            Aramanızla eşleşen canlı maç bulunmuyor.
                          </div>
                        );
                      }

                      return filtered.map((match) => (
                        <div 
                          key={match.id}
                          onClick={() => {
                            setSelectedMatch(match);
                            setCurrentScreen("match-detail");
                          }}
                          className="bg-[#12121A] border border-[#1e1e28] rounded-2xl p-4 hover:border-[#00E5FF]/20 transition-all cursor-pointer relative"
                        >
                          <div className="flex justify-between items-center text-[9px] text-gray-500 mb-2.5">
                            <div className="flex items-center gap-2">
                              {match.timer === "CANLI" && (
                                <span className="text-[8px] text-[#00E5FF] font-mono bg-[#00E5FF]/10 px-1.5 py-0.5 rounded">
                                  👁️ {(match as any).viewerCount ? `${((match as any).viewerCount / 1000).toFixed(1)}k` : "0.8k"}
                                </span>
                              )}
                              <button
                                onClick={(e) => toggleFavorite(e, match.id)}
                                className="p-1 -m-1"
                              >
                                <Star
                                  size={12}
                                  className={favorites.includes(match.id) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                                />
                              </button>
                              <span className="text-[#00E5FF] font-black">{match.game}</span>
                            </div>
                            <span className="text-xs truncate max-w-[130px]">{match.tournament}</span>
                          </div>

                          <div className="grid grid-cols-12 items-center gap-2">
                            <div className="col-span-10 space-y-2">
                              {/* Team A */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg leading-none">{match.teamA.logo}</span>
                                  <span className="text-xs text-white font-bold">{match.teamA.name}</span>
                                </div>
                                <span className={`font-mono text-sm font-black text-white ${
                                  flashingTeamId === `${match.id}-A` ? "text-green-400 scale-110" : ""
                                }`}>{match.teamA.score}</span>
                              </div>
                              {/* Team B */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg leading-none">{match.teamB.logo}</span>
                                  <span className="text-xs text-white font-bold">{match.teamB.name}</span>
                                </div>
                                <span className={`font-mono text-sm font-black text-white ${
                                  flashingTeamId === `${match.id}-B` ? "text-green-400 scale-110" : ""
                                }`}>{match.teamB.score}</span>
                              </div>
                            </div>
                            
                            {/* Live Action Dot Column */}
                            <div className="col-span-2 flex flex-col items-center justify-center border-l border-[#20202a] pl-2 h-full gap-1">
                              {match.timer === "CANLI" && (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                  <span className="text-[8px] text-red-500 font-bold font-mono uppercase">{match.timer}</span>
                                </>
                              )}
                              {match.timer === "BİTTİ" && (
                                <span className="text-[8px] text-gray-500 font-bold font-mono uppercase">{match.timer}</span>
                              )}
                              {match.timer !== "CANLI" && match.timer !== "BİTTİ" && (
                                <span className="text-[8px] text-gray-500 font-mono text-center truncate max-w-[40px]">{match.timer}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 2: FEED / AKIŞ (RE-DESIGNED AS CALENDAR) */}
              {activeTab === 2 && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0F] relative">
                  {/* Redesigned Header from Image */}
                  <div className="bg-[#12121A] border-b border-[#1e1e28] p-2 shrink-0">
                    <div className="flex items-center gap-1">
                      {/* Left: Calendar Icon */}
                      <button
                        onClick={() => setShowFullCalendar(!showFullCalendar)}
                        className="p-2.5 bg-[#1b1b24] rounded-xl border border-white/5 text-[#00E5FF] active:scale-95 transition-all flex flex-col items-center justify-center min-w-[50px] relative"
                      >
                        <Calendar size={20} />
                        <span className="text-[7px] font-black absolute bottom-1.5">{new Date(selectedDate).getDate()}</span>
                      </button>

                      {/* Middle: 5 Days around selected (Adjusted for mobile width) */}
                      <div className="flex-1 flex items-center justify-around overflow-hidden px-1">
                        {Array.from({ length: 5 }, (_, i) => {
                          // Fix: Use the current simulated date as the reference point
                          const [y, m, d_val] = simulatedToday.split('-').map(Number);
                          const d = new Date(y, m - 1, d_val);
                          d.setDate(d.getDate() - 2 + i);

                          const year = d.getFullYear();
                          const month = (d.getMonth() + 1).toString().padStart(2, '0');
                          const day = d.getDate().toString().padStart(2, '0');
                          const dateStr = `${year}-${month}-${day}`;

                          const isSelected = selectedDate === dateStr;
                          const isToday = dateStr === simulatedToday;

                          const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
                          const dayAndMonth = `${day}.${month}`;

                          return (
                            <button
                              key={dateStr}
                              onClick={() => setSelectedDate(dateStr)}
                              className={`flex flex-col items-center px-2 py-1 transition-all ${
                                isSelected ? "relative" : "opacity-60"
                              }`}
                            >
                              <span className={`text-[9px] font-bold ${isSelected ? "text-white" : "text-gray-500"}`}>
                                {isToday ? "Bugün" : dayName}
                              </span>
                              <span className={`text-[11px] font-mono font-black mt-0.5 ${isSelected ? "text-white" : "text-gray-400"}`}>
                                {dayAndMonth}
                              </span>
                              {isSelected && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right: Search Input */}
                      <div className="w-[100px] relative group">
                        <input
                          type="text"
                          placeholder="Maç ara..."
                          value={matchSearchQuery}
                          onChange={(e) => setMatchSearchQuery(e.target.value)}
                          className="w-full bg-[#1b1b24] border border-white/5 rounded-lg py-1.5 pl-7 pr-2 text-[10px] text-white focus:outline-none focus:border-[#00E5FF]/40"
                        />
                        <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* FULL MONTH CALENDAR MODAL */}
                  {showFullCalendar && (
                    <div className="absolute inset-x-0 top-[55px] bg-[#12121A] border-b border-[#2d2d3c] shadow-2xl z-[55] animate-in slide-in-from-top duration-300 p-4 rounded-b-[30px]">
                      {/* Month/Year Selectors */}
                      <div className="flex gap-3 mb-6">
                        {/* Month Selector */}
                        <div className="flex-1 bg-[#1b1b24] rounded-2xl flex items-center justify-between p-1 border border-white/5">
                          <button
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() - 1);
                              setCalendarViewDate(newD);
                            }}
                            className="p-2 text-gray-400 hover:text-white"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-black text-white uppercase tracking-widest">
                            {calendarViewDate.toLocaleDateString('tr-TR', { month: 'long' })}
                          </span>
                          <button
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setMonth(newD.getMonth() + 1);
                              setCalendarViewDate(newD);
                            }}
                            className="p-2 text-gray-400 hover:text-white"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        {/* Year Selector */}
                        <div className="flex-1 bg-[#1b1b24] rounded-2xl flex items-center justify-between p-1 border border-white/5">
                          <button
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setFullYear(newD.getFullYear() - 1);
                              setCalendarViewDate(newD);
                            }}
                            className="p-2 text-gray-400 hover:text-white"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-black text-white font-mono">
                            {calendarViewDate.getFullYear()}
                          </span>
                          <button
                            onClick={() => {
                              const newD = new Date(calendarViewDate);
                              newD.setFullYear(newD.getFullYear() + 1);
                              setCalendarViewDate(newD);
                            }}
                            className="p-2 text-gray-400 hover:text-white"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Day Names Row */}
                      <div className="grid grid-cols-7 text-center mb-3">
                        {["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PZR"].map(day => (
                          <span key={day} className="text-[10px] font-black text-red-500 uppercase">{day}</span>
                        ))}
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const year = calendarViewDate.getFullYear();
                          const month = calendarViewDate.getMonth();
                          const firstDay = new Date(year, month, 1).getDay(); // 0: Sunday
                          const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // 0: Monday
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const prevMonthDays = new Date(year, month, 0).getDate();

                          const calendarItems = [];

                          // Previous month overlap
                          for (let i = adjustedFirstDay - 1; i >= 0; i--) {
                            calendarItems.push(
                              <div key={`prev-${i}`} className="h-10 flex items-center justify-center text-gray-700 text-xs font-bold">
                                {prevMonthDays - i}
                              </div>
                            );
                          }

                          // Current month days
                          for (let i = 1; i <= daysInMonth; i++) {
                            const yStr = year;
                            const mStr = (month + 1).toString().padStart(2, '0');
                            const dStr = i.toString().padStart(2, '0');
                            const dateStr = `${yStr}-${mStr}-${dStr}`;
                            const isSelected = selectedDate === dateStr;

                            calendarItems.push(
                              <button
                                key={`curr-${i}`}
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setShowFullCalendar(false);
                                }}
                                className={`h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                                  isSelected
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
                                    : "text-gray-300 hover:bg-white/5"
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }

                          // Next month overlap
                          const remaining = 42 - calendarItems.length;
                          for (let i = 1; i <= remaining; i++) {
                            calendarItems.push(
                              <div key={`next-${i}`} className="h-10 flex items-center justify-center text-gray-700 text-xs font-bold">
                                {i}
                              </div>
                            );
                          }

                          return calendarItems;
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Matches List for Selected Date */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {isDateMatchesLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <RefreshCw size={24} className="text-[#00E5FF] animate-spin" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Maçlar Yükleniyor...</span>
                      </div>
                    ) : (
                      (() => {
                        const filtered = dateMatches.filter(m =>
                          m.teamA.name.toLowerCase().includes(matchSearchQuery.toLowerCase()) ||
                          m.teamB.name.toLowerCase().includes(matchSearchQuery.toLowerCase()) ||
                          m.game.toLowerCase().includes(matchSearchQuery.toLowerCase()) ||
                          m.tournament.toLowerCase().includes(matchSearchQuery.toLowerCase())
                        );

                        if (filtered.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 opacity-40">
                              <span className="text-4xl">📅</span>
                              <p className="text-xs text-gray-400 font-bold">
                                {matchSearchQuery ? "Aramanızla eşleşen maç bulunamadı." : "Seçilen günde maç bulunmuyor."}
                              </p>
                            </div>
                          );
                        }

                        return filtered.map((match) => (
                          <div
                            key={match.id}
                            onClick={() => {
                              setSelectedMatch(match);
                              setCurrentScreen("match-detail");
                            }}
                            className="bg-[#12121A] border border-[#1e1e28] rounded-2xl p-4 hover:border-[#00E5FF]/20 transition-all cursor-pointer relative"
                          >
                            <div className="flex justify-between items-center text-[9px] text-gray-500 mb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[#00E5FF] font-black">{match.game}</span>
                                <span className="text-gray-600">•</span>
                                <span className="truncate max-w-[150px]">{match.tournament}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {match.timer === "CANLI" && (
                                  <span className="text-[8px] text-[#00E5FF] font-mono bg-[#00E5FF]/10 px-1.5 py-0.5 rounded mr-1">
                                    👁️ {(match as any).viewerCount ? `${((match as any).viewerCount / 1000).toFixed(1)}k` : "0.8k"}
                                  </span>
                                )}
                                {match.timer === "CANLI" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                <span className={`font-mono font-bold ${match.timer === "BİTTİ" ? "text-gray-500" : "text-white"}`}>
                                  {match.timer}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-4">
                              <div className="col-span-5 flex flex-col items-center text-center space-y-1">
                                <span className="text-2xl leading-none">{match.teamA.logo}</span>
                                <span className="text-[10px] text-white font-extrabold truncate w-full">{match.teamA.name}</span>
                              </div>

                              <div className="col-span-2 flex flex-col items-center justify-center">
                                <div className="text-sm font-mono font-black text-[#00E5FF] flex flex-col items-center">
                                  <span>{match.teamA.score}</span>
                                  <div className="h-[1px] w-4 bg-gray-800 my-0.5"></div>
                                  <span>{match.teamB.score}</span>
                                </div>
                              </div>

                              <div className="col-span-5 flex flex-col items-center text-center space-y-1">
                                <span className="text-2xl leading-none">{match.teamB.logo}</span>
                                <span className="text-[10px] text-white font-extrabold truncate w-full">{match.teamB.name}</span>
                              </div>
                            </div>
                          </div>
                        ));
                      })()
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PREDICTION / TAHMİN GAMIFICATION */}
              {activeTab === 3 && (
                <div className="p-4 space-y-4">
                  {/* Credits header info card */}
                  <div className="bg-gradient-to-br from-[#12121A] to-[#1b1b28] border border-yellow-500/20 rounded-2xl p-4 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-500 uppercase font-black">Bakiyeniz</span>
                      <div className="flex items-center gap-1.5">
                        <Coins size={16} className="text-yellow-500" />
                        <span className="text-lg font-mono font-black text-white">{credits}</span>
                        <span className="text-[10px] font-mono text-gray-500">ESK</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-gray-500 uppercase font-black">Başarı Oranı</span>
                      <span className="text-sm font-black text-[#00E5FF] font-mono">
                        {userTotal > 0 ? `%${Math.round((userCorrect / userTotal) * 100)}` : "%0"}
                      </span>
                    </div>
                  </div>

                  {/* Leaderboard or Match predictions selector tab */}
                  <div className="flex border-b border-[#1c1c24]">
                    <button 
                      onClick={() => setPredictSubTab("matches")}
                      className={`flex-1 pb-2 text-[11px] font-extrabold text-center transition-all ${
                        predictSubTab === "matches" 
                          ? "border-b-2 border-[#00E5FF] text-[#00E5FF]" 
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      Aktif Maçlar
                    </button>
                    <button 
                      onClick={() => setPredictSubTab("leaderboard")}
                      className={`flex-1 pb-2 text-[11px] font-extrabold text-center transition-all relative opacity-40 grayscale-[0.5] ${
                        predictSubTab === "leaderboard" 
                          ? "border-b-2 border-[#00E5FF] text-[#00E5FF]" 
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      🏆 Liderlik Tablosu
                      <span className="absolute -top-1 right-2 bg-gray-500 text-black text-[7px] font-black px-1 rounded-sm rotate-12 shadow-sm">YAKINDA</span>
                    </button>
                  </div>

                  {/* Toast notification for season reset */}
                  {showSeasonResetToast && (
                    <div className="bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-white p-3 rounded-xl text-[9px] text-center font-black animate-bounce shadow-lg shadow-purple-500/20 border border-[#9b73ff]/30 leading-relaxed">
                      🎉 HAFTALIK SEZON YENİLENDİ!<br/>
                      Tüm tahminler sıfırlandı, yeni sıralama yarışı başladı.
                    </div>
                  )}

                  {predictSubTab === "matches" ? (
                    <>
                      {/* Match Prediction Cards list */}
                      <div className="space-y-3.5">
                        {matches.map((match) => (
                          <div key={match.id} className="bg-[#12121A] border border-[#1e1e28] rounded-2xl p-3.5 space-y-3">
                            <div className="flex justify-between items-center text-[9px] text-gray-500">
                              <span className="text-white font-bold">{match.game}</span>
                              <span className="text-[#00E5FF] font-semibold">{match.tournament}</span>
                            </div>

                            {/* Matchup row */}
                            <div className="grid grid-cols-3 items-center text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-2xl mb-1 select-none leading-none">{match.teamA.logo}</span>
                                <span className="text-xs text-white font-bold max-w-[80px] truncate">{match.teamA.name}</span>
                                <span className="text-[9px] text-gray-500 font-mono mt-0.5">Oran: {match.teamA.odds}</span>
                              </div>

                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">CANLI</span>
                                <span className="text-[10px] text-gray-500 font-mono mt-1">{match.teamA.score} - {match.teamB.score}</span>
                              </div>

                              <div className="flex flex-col items-center">
                                <span className="text-2xl mb-1 select-none leading-none">{match.teamB.logo}</span>
                                <span className="text-xs text-white font-bold max-w-[80px] truncate">{match.teamB.name}</span>
                                <span className="text-[9px] text-gray-500 font-mono mt-0.5">Oran: {match.teamB.odds}</span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1c1c24]">
                              <button
                                onClick={() => {
                                  setBetMatch(match);
                                  setBetSide("teamA");
                                  setStakeAmount(100);
                                }}
                                className="py-2 bg-[#00E5FF]/10 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-black font-extrabold text-[10px] rounded-lg transition-all"
                              >
                                {match.teamA.name} ({match.teamA.odds})
                              </button>
                              
                              <button
                                onClick={() => {
                                  setBetMatch(match);
                                  setBetSide("teamB");
                                  setStakeAmount(100);
                                }}
                                className="py-2 bg-[#7C4DFF]/10 hover:bg-[#7C4DFF] text-[#7C4DFF] hover:text-white font-extrabold text-[10px] rounded-lg transition-all"
                              >
                                {match.teamB.name} ({match.teamB.odds})
                              </button>
                            </div>

                            {/* Gemini AI Predictions Suggestion Panel inside */}
                            <div className="mt-2 border-t border-[#1c1c24] pt-2">
                              {aiTipResult[match.id] ? (
                                <div className="p-2 bg-[#1c1c28] rounded-lg border border-[#00E5FF]/20 text-[10px] leading-relaxed text-gray-300 whitespace-pre-wrap select-text">
                                  <p className="text-[8px] text-[#00E5FF] uppercase font-black flex items-center gap-1.5 mb-1">
                                    <Sparkles size={8} /> Gemini AI Analizi &amp; Tahmini:
                                  </p>
                                  {aiTipResult[match.id]}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleGetPredictionTip(match)}
                                  disabled={aiTipLoading === match.id}
                                  className="w-full py-1 bg-gradient-to-r from-[#00E5FF]/10 to-[#7C4DFF]/10 hover:from-[#00E5FF]/20 hover:to-[#7C4DFF]/20 border border-[#00E5FF]/20 text-[9px] text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                                >
                                  <Sparkles size={10} className="text-[#00E5FF]" />
                                  <span>{aiTipLoading === match.id ? "Gemini Analiz Yapıyor..." : "Bu maç için AI tahmini al"}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Predictions History section if exists */}
                      {userPredictions.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tahmin Geçmişim</span>
                          {userPredictions.map((p) => (
                            <div key={p.id} className="bg-[#12121A] border border-[#1e1e28] rounded-xl p-3 flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-1.5 text-[10px] text-white">
                                  <span className="font-bold">{p.predictedTeam === "teamA" ? p.match.teamA.name : p.match.teamB.name} Kazanır</span>
                                  <span className="text-[8px] bg-gray-800 text-gray-400 px-1 rounded">{p.odds} Oran</span>
                                </div>
                                <span className="text-[8px] text-gray-500 mt-0.5 block">{p.match.teamA.name} vs {p.match.teamB.name}</span>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono font-bold text-white">{p.stake} ESK</span>
                                <span className={`text-[9px] font-black uppercase mt-0.5 ${
                                  p.status === 'won' ? 'text-green-400' : p.status === 'lost' ? 'text-red-400' : 'text-yellow-400'
                                }`}>
                                  {p.status === 'won' ? `KAZANDI (+${p.potentialReward})` : p.status === 'lost' ? 'KAYBETTİ' : 'BEKLİYOR'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* LEADERBOARD VIEW */
                    <div className="space-y-4 relative min-h-[400px] overflow-hidden">
                      {/* Large Watermark Overlay */}
                      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <span className="text-[120px] font-black text-white/[0.03] uppercase -rotate-12 tracking-[10px] whitespace-nowrap select-none">
                          YAKINDA
                        </span>
                      </div>

                      {/* Weekly Season bar & Reset action */}
                      <div className="bg-[#12121A] border border-[#1e1e28] rounded-xl p-3 flex justify-between items-center opacity-40 grayscale-[0.5] pointer-events-none">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#00E5FF] text-[10px] font-black uppercase tracking-wider">HAFTA {currentWeek}</span>
                          <span className="text-[8px] text-gray-500">1., 2. ve 3. belirleniyor</span>
                        </div>
                        <button 
                          disabled
                          className="px-2.5 py-1.5 bg-[#7C4DFF] hover:bg-[#7C4DFF]/80 text-white font-black rounded-lg text-[9px] active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-purple-500/10"
                        >
                          <RefreshCw size={10} /> Haftayı Yenile
                        </button>
                      </div>

                      {/* Reset countdown placeholder to enhance gamification */}
                      <div className="bg-[#1c1c28]/40 border border-[#1e1e28]/40 rounded-xl p-2.5 flex justify-between items-center text-[9px] opacity-40 grayscale-[0.5] pointer-events-none">
                        <span className="text-gray-400">⏱️ Sıfırlanma Geri Sayımı:</span>
                        <span className="text-[#00E5FF] font-mono font-bold animate-pulse">4 gün 12 saat 35 dk</span>
                      </div>

                      {/* Visual Podium for Top 3 */}
                      <div className="grid grid-cols-3 items-end gap-2 pt-3 pb-1 text-center bg-[#12121A]/40 border border-[#1e1e28]/40 rounded-2xl p-3">
                        {/* 2nd Place */}
                        {currentLeaderboard[1] && (
                          <div className="flex flex-col items-center bg-[#12121A]/80 border border-gray-700/20 rounded-xl p-2 h-[82px] justify-end relative">
                            <span className="absolute top-[-8px] text-[9px] bg-gray-500 text-white px-1.5 py-0.5 rounded-full font-black">2</span>
                            <span className="text-sm select-none leading-none mb-1">{currentLeaderboard[1].avatar}</span>
                            <span className="text-[9px] font-bold text-gray-200 truncate max-w-[65px]">{currentLeaderboard[1].username}</span>
                            <span className="text-[8px] text-gray-500 font-mono mt-0.5">{currentLeaderboard[1].correct} Doğru</span>
                          </div>
                        )}

                        {/* 1st Place */}
                        {currentLeaderboard[0] && (
                          <div className="flex flex-col items-center bg-[#1c1c2b] border border-yellow-500/30 rounded-xl p-2 h-[100px] justify-end relative shadow-lg shadow-yellow-500/5">
                            <span className="absolute top-[-11px] text-xs animate-bounce">👑</span>
                            <span className="absolute top-[-8px] text-[10px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-black">1</span>
                            <span className="text-lg select-none leading-none mb-1">{currentLeaderboard[0].avatar}</span>
                            <span className="text-[10px] font-black text-yellow-400 truncate max-w-[70px]">{currentLeaderboard[0].username}</span>
                            <span className="text-[9px] text-[#00E5FF] font-mono font-black mt-0.5">{currentLeaderboard[0].correct} Doğru</span>
                          </div>
                        )}

                        {/* 3rd Place */}
                        {currentLeaderboard[2] && (
                          <div className="flex flex-col items-center bg-[#12121A]/80 border border-amber-800/20 rounded-xl p-2 h-[76px] justify-end relative">
                            <span className="absolute top-[-8px] text-[9px] bg-amber-700 text-white px-1.5 py-0.5 rounded-full font-black">3</span>
                            <span className="text-sm select-none leading-none mb-1">{currentLeaderboard[2].avatar}</span>
                            <span className="text-[9px] font-bold text-gray-200 truncate max-w-[65px]">{currentLeaderboard[2].username}</span>
                            <span className="text-[8px] text-gray-500 font-mono mt-0.5">{currentLeaderboard[2].correct} Doğru</span>
                          </div>
                        )}
                      </div>

                      {/* Player rows list */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[8px] text-gray-500 uppercase tracking-widest px-2.5">
                          <span>Sıra / Oyuncu</span>
                          <span>Doğru / Başarı</span>
                        </div>

                        <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-0.5">
                          {currentLeaderboard.map((player, idx) => {
                            const rank = idx + 1;
                            const isMe = player.username === username;
                            const winRatePercent = player.total > 0 ? Math.round((player.correct / player.total) * 100) : 0;
                            
                            let rankBadge = `${rank}.`;
                            if (rank === 1) rankBadge = "🥇";
                            if (rank === 2) rankBadge = "🥈";
                            if (rank === 3) rankBadge = "🥉";

                            return (
                              <div 
                                key={player.username}
                                className={`flex justify-between items-center p-2 rounded-xl transition-all ${
                                  isMe 
                                    ? "bg-[#00E5FF]/10 border border-[#00E5FF]/40 shadow-sm shadow-[#00E5FF]/5" 
                                    : "bg-[#12121A] border border-[#1e1e28]"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] font-mono font-bold w-4 text-center text-gray-400">{rankBadge}</span>
                                  <span className="text-xs select-none">{player.avatar}</span>
                                  <div className="flex flex-col min-w-0">
                                    <span className={`text-[10px] font-bold truncate ${isMe ? "text-[#00E5FF]" : "text-white"}`}>
                                      {player.username} {isMe && <span className="text-[7px] bg-[#00E5FF] text-black px-1 rounded font-black ml-1">SEN</span>}
                                    </span>
                                    <span className="text-[8px] text-gray-500">Tahmin: {player.total}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-mono font-black text-white">{player.correct} Doğru</span>
                                    <span className="text-[8px] font-mono text-gray-500">%{winRatePercent} Oran</span>
                                  </div>
                                  <ChevronRight size={10} className="text-gray-700" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Last Week Winners History Section */}
                      {lastWeekWinners && (
                        <div className="bg-[#12121A]/80 border border-[#1e1e28]/80 rounded-xl p-3 space-y-2">
                          <span className="text-[8px] uppercase font-black text-[#7C4DFF] tracking-wider block">⏮️ Geçen Haftanın Şampiyonları</span>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            {lastWeekWinners.map((winner, idx) => {
                              let prefix = "1. ";
                              if (idx === 1) prefix = "2. ";
                              if (idx === 2) prefix = "3. ";
                              return (
                                <div key={idx} className="bg-[#171724] border border-[#1e1e2d] px-1.5 py-1 rounded-lg">
                                  <span className="text-xs select-none">{winner.avatar}</span>
                                  <p className="text-[8px] text-gray-300 font-bold truncate mt-0.5">{prefix}{winner.username}</p>
                                  <p className="text-[8px] text-[#00E5FF] font-mono font-bold">{winner.correct} Doğru</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PROFILE */}
              {activeTab === 4 && (
                <div className="flex-1 flex flex-col justify-center p-8 bg-[#0F0F14] overflow-y-auto custom-scrollbar w-full h-full">
                  {/* Header Section */}
                  <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-[#1A1C22] rounded-[24px] flex items-center justify-center shadow-xl border border-white/5">
                      <span className="text-3xl font-black text-[#45D1E8] tracking-tighter">ESX</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mt-6 tracking-tight">eSkorX Portal</h1>
                    <p className="text-sm text-gray-400 mt-2 font-medium opacity-80">E-sporun yapay zeka destekli dünyası</p>
                  </div>

                  {/* Form fields (ReadOnly) */}
                  <div className="flex flex-col gap-4">
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="e-mail"
                        readOnly
                        className="w-full px-6 py-4 bg-[#1A1C22] text-white border border-white/10 text-base rounded-full focus:outline-none placeholder-gray-500 font-medium transition-all cursor-default"
                      />
                      <span className="absolute -top-3 -right-2 bg-gray-400 text-black text-[10px] font-black px-2 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Şifre"
                        readOnly
                        className="w-full px-6 py-4 bg-[#1A1C22] text-white border border-white/10 text-base rounded-full focus:outline-none placeholder-gray-500 font-medium transition-all cursor-default"
                      />
                    </div>

                    <div className="relative flex py-4 items-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">VEYA</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    {/* Social Login Grid (Disabled style) */}
                    <div className="space-y-3">
                      <div className="relative">
                        <button className="w-full py-4 bg-[#1A1C22] text-white/40 font-bold text-base rounded-full flex items-center justify-center gap-3 border border-white/5 cursor-default">
                          <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-40" alt="Google" />
                          Google ile Giriş Yap
                        </button>
                        <span className="absolute -top-3 -right-2 bg-gray-400 text-black text-[10px] font-black px-2 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <button className="w-full py-3.5 bg-[#2A3F4A] text-white/90 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 opacity-80 cursor-default">
                            <Gamepad2 size={16} /> Steam
                          </button>
                          <span className="absolute -top-2 -right-1 bg-gray-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
                        </div>
                        <div className="relative">
                          <button className="w-full py-3.5 bg-[#6441a5] text-white/90 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 opacity-80 cursor-default">
                            <Radio size={16} /> Twitch
                          </button>
                          <span className="absolute -top-2 -right-1 bg-gray-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded rotate-12 shadow-lg">YAKINDA</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Button (Logout trigger or just text) */}
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setUsername("Ziyaretçi");
                        setCurrentScreen("login");
                      }}
                      className="w-full mt-6 py-5 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-black font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-[0.98] transition-all flex items-center justify-center group"
                    >
                      Ziyaretçi Olarak Giriş Yapıldı
                      <Sparkles size={20} className="ml-2 opacity-100 transition-all" />
                    </button>

                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setCurrentScreen("login");
                      }}
                      className="text-[10px] text-gray-600 font-bold hover:text-red-400 transition-all mt-2"
                    >
                      (Oturumu Kapatmak İçin Dokunun)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* HIGH-FIDELITY ANDROID BOTTOM NAVIGATION BAR */}
            <nav className="h-14 bg-[#12121A] border-t border-[#1c1c24] flex items-center justify-around px-2 z-40 shrink-0">
              <button 
                onClick={() => { setActiveTab(0); setSelectedGameFilter("Hepsi"); }} 
                className={`flex flex-col items-center gap-1 ${activeTab === 0 ? "text-[#00E5FF]" : "text-gray-500"}`}
              >
                <HomeIcon size={16} />
                <span className="text-[8px] font-bold">Anasayfa</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab(1); setSelectedGameFilter("Hepsi"); }} 
                className={`flex flex-col items-center gap-1 ${activeTab === 1 ? "text-[#00E5FF]" : "text-gray-500"}`}
              >
                <Radio size={16} className={activeTab === 1 ? "animate-pulse" : ""} />
                <span className="text-[8px] font-bold">Canlı</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab(2); }} 
                className={`flex flex-col items-center gap-1 ${activeTab === 2 ? "text-[#00E5FF]" : "text-gray-500"}`}
              >
                <Flame size={16} />
                <span className="text-[8px] font-bold">Akış</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab(3); }} 
                className={`flex flex-col items-center gap-1 ${activeTab === 3 ? "text-[#00E5FF]" : "text-gray-500"}`}
              >
                <Target size={16} />
                <span className="text-[8px] font-bold">Tahmin</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab(4); }} 
                className={`flex flex-col items-center gap-1 ${activeTab === 4 ? "text-[#00E5FF]" : "text-gray-500"}`}
              >
                <User size={16} />
                <span className="text-[8px] font-bold">Profil</span>
              </button>
            </nav>
          </div>
        )}

        {/* 5. MATCH DETAIL SCREEN */}
        {currentScreen === "match-detail" && selectedMatch && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with back button */}
            <div className="px-4 py-3 border-b border-[#1c1c24] bg-[#12121A] flex items-center justify-between">
              <button 
                onClick={() => {
                  setCurrentScreen("dashboard");
                  setActiveDetailTab("stats");
                  setAiAnalysisResult("");
                }}
                className="p-1 hover:bg-gray-800 rounded-lg text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] text-gray-400 font-extrabold max-w-[170px] truncate">{selectedMatch.tournament}</span>
              <div className="w-8"></div> {/* Spacer */}
            </div>

            {/* Score header section */}
            <div className="p-4 bg-gradient-to-b from-[#12121A] to-black text-center space-y-3 shrink-0">
              <span className="text-[9px] uppercase font-bold text-[#00E5FF]">{selectedMatch.game} • {selectedMatch.stage}</span>
              
              <div className="grid grid-cols-12 items-center">
                <div
                  className="col-span-4 flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                  onClick={() => {
                    console.log("Team A clicked:", selectedMatch.teamA);
                    handleGetTeamDetails(selectedMatch.teamA.id);
                  }}
                >
                  <span className="text-3xl select-none">{selectedMatch.teamA.logo}</span>
                  <span className="text-xs text-white font-extrabold mt-1 truncate max-w-[90px] border-b border-dashed border-gray-600">{selectedMatch.teamA.name}</span>
                </div>
                
                <div className="col-span-4 flex flex-col items-center justify-center">
                  <span className="text-sm font-mono font-black text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {selectedMatch.teamA.score} - {selectedMatch.teamB.score}
                  </span>
                  <span className="text-[8px] text-gray-500 font-mono mt-1.5">{selectedMatch.timer}</span>
                </div>

                <div
                  className="col-span-4 flex flex-col items-center cursor-pointer active:scale-95 transition-all"
                  onClick={() => {
                    console.log("Team B clicked:", selectedMatch.teamB);
                    handleGetTeamDetails(selectedMatch.teamB.id);
                  }}
                >
                  <span className="text-3xl select-none">{selectedMatch.teamB.logo}</span>
                  <span className="text-xs text-white font-extrabold mt-1 truncate max-w-[90px] border-b border-dashed border-gray-600">{selectedMatch.teamB.name}</span>
                </div>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="flex bg-[#12121A] border-y border-[#1c1c24] text-[9px] shrink-0 font-bold">
              <button 
                onClick={() => setActiveDetailTab("stats")}
                className={`flex-1 py-2 text-center ${activeDetailTab === "stats" ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-gray-500"}`}
              >
                İstatistikler
              </button>
              <button 
                onClick={() => setActiveDetailTab("h2h")}
                className={`flex-1 py-2 text-center ${activeDetailTab === "h2h" ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-gray-500"}`}
              >
                Geçmiş
              </button>
              <button 
                onClick={() => setActiveDetailTab("lineup")}
                className={`flex-1 py-2 text-center ${activeDetailTab === "lineup" ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-gray-500"}`}
              >
                Kadro
              </button>
              <button 
                onClick={() => {
                  setActiveDetailTab("gemini");
                  if (!aiAnalysisResult) {
                    handleGetAiAnalysis(selectedMatch);
                  }
                }}
                className={`flex-1 py-2 text-center flex items-center justify-center gap-1 ${activeDetailTab === "gemini" ? "text-[#00E5FF] border-b-2 border-[#00E5FF]" : "text-[#7C4DFF]"}`}
              >
                <Sparkles size={10} /> AI Analizi
              </button>
            </div>

            {/* Scrollable detail tab views */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* TAB 1: OVERVIEW STATS */}
              {activeDetailTab === "stats" && (
                <div className="space-y-4">
                  {selectedMatch.stats.killsA !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>Skor (Kill)</span>
                        <span className="font-mono">{selectedMatch.stats.killsA} - {selectedMatch.stats.killsB}</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-[#00E5FF] h-full" 
                          style={{ width: `${(selectedMatch.stats.killsA / ((selectedMatch.stats.killsA || 1) + (selectedMatch.stats.killsB || 1))) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-[#7C4DFF] h-full" 
                          style={{ width: `${(selectedMatch.stats.killsB / ((selectedMatch.stats.killsA || 1) + (selectedMatch.stats.killsB || 1))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Game specific statistics */}
                  {selectedMatch.game === "LoL" && (
                    <div className="bg-[#12121A] border border-[#1e1e28] rounded-xl p-3 space-y-2.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Gold Farkı</span>
                        <span className="text-yellow-500 font-bold font-mono">{selectedMatch.stats.goldDiff}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Ejderhalar</span>
                        <span className="font-mono text-white">{selectedMatch.stats.dragonsA} vs {selectedMatch.stats.dragonsB}</span>
                      </div>
                    </div>
                  )}

                  {selectedMatch.game === "CS2" && (
                    <div className="bg-[#12121A] border border-[#1e1e28] rounded-xl p-3 space-y-2.5">
                      <span className="text-[10px] text-gray-500 font-bold block">Son Raund Akışı</span>
                      <p className="text-xs text-white font-mono tracking-widest">{selectedMatch.stats.roundHistory}</p>
                    </div>
                  )}

                  <div className="text-center text-[10px] text-gray-600 font-mono py-4">
                    İstatistikler her 30 saniyede bir otomatik güncellenir.
                  </div>
                </div>
              )}

              {/* TAB 2: HEAD TO HEAD HISTORY */}
              {activeDetailTab === "h2h" && (
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Aralarındaki Son Karşılaşmalar</span>
                  {selectedMatch.h2h.map((h, i) => (
                    <div key={i} className="bg-[#12121A] border border-[#1e1e28] rounded-xl p-3 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-white font-bold">{h.winner} Kazandı</span>
                        <span className="text-[8px] text-gray-500 block mt-0.5">{h.tournament} • {h.date}</span>
                      </div>
                      <span className="font-mono text-[#00E5FF] font-bold bg-[#00E5FF]/5 py-1 px-2 rounded">{h.score}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: LINEUP / ROSTERS */}
              {activeDetailTab === "lineup" && (
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Team A Roster */}
                  <div className="space-y-2 bg-[#12121A]/50 p-2.5 rounded-xl border border-gray-950">
                    <span className="text-[10px] text-white font-bold block text-center border-b border-gray-900 pb-1">{selectedMatch.teamA.name}</span>
                    {selectedMatch.rosters.teamA.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-300">
                        <span>{p.avatar}</span>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-white">{p.name}</p>
                          <p className="text-[8px] text-gray-500 uppercase">{p.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Team B Roster */}
                  <div className="space-y-2 bg-[#12121A]/50 p-2.5 rounded-xl border border-gray-950">
                    <span className="text-[10px] text-white font-bold block text-center border-b border-gray-900 pb-1">{selectedMatch.teamB.name}</span>
                    {selectedMatch.rosters.teamB.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-300">
                        <span>{p.avatar}</span>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-white">{p.name}</p>
                          <p className="text-[8px] text-gray-500 uppercase">{p.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GEMINI AI TURKISH ANALYSIS */}
              {activeDetailTab === "gemini" && (
                <div className="space-y-3.5">
                  {aiAnalysisLoading ? (
                    <div className="space-y-2 py-4">
                      {/* Shimmer loading items */}
                      <div className="h-4 bg-gray-950 rounded-full animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-950 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-950 rounded-full animate-pulse w-5/6"></div>
                      <div className="h-3 bg-gray-950 rounded-full animate-pulse w-2/3"></div>
                      <div className="text-[9px] text-center text-[#7C4DFF] animate-pulse font-mono block pt-2">
                        GEMINI AI ANALİZ HAZIRLIYOR...
                      </div>
                    </div>
                  ) : aiAnalysisResult ? (
                    <div className="bg-[#12121A] border border-[#00E5FF]/20 rounded-2xl p-3.5 relative overflow-hidden select-text text-[11px] leading-relaxed text-gray-300 whitespace-pre-wrap">
                      <p className="text-[8px] text-[#00E5FF] uppercase font-black flex items-center gap-1.5 mb-2 border-b border-gray-900 pb-1.5">
                        <Sparkles size={10} /> Gemini AI Yorumu &amp; Analizi:
                      </p>
                      {aiAnalysisResult}
                      
                      {/* Action trigger button inside analysis */}
                      <button 
                        onClick={() => handleGetAiAnalysis(selectedMatch)}
                        className="mt-3 w-full py-1.5 bg-[#7C4DFF]/10 text-[#7C4DFF] font-bold text-[9px] rounded-lg border border-[#7C4DFF]/20 flex items-center justify-center gap-1 hover:bg-[#7C4DFF]/20 transition-all"
                      >
                        <RefreshCw size={8} /> Analizi Yenile
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <button
                        onClick={() => handleGetAiAnalysis(selectedMatch)}
                        className="px-4 py-2 bg-[#7C4DFF] text-white rounded-xl text-[10px] font-extrabold"
                      >
                        Yorum Al
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Float 'Tahmin Et' Button at bottom of Match Detail */}
            <div className="p-3.5 bg-black/60 border-t border-[#1c1c24] shrink-0">
              <button 
                onClick={() => {
                  setBetMatch(selectedMatch);
                  setBetSide("teamA");
                  setStakeAmount(100);
                  setActiveTab(3);
                  setCurrentScreen("dashboard");
                }}
                className="w-full py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-black font-black text-xs rounded-xl shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/25 active:scale-[0.98] transition-all"
              >
                Bu Maça Tahmin Yap
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. CREATE POST / AI DRAFT POST MODAL */}
      {showCreatePostModal && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#12121A] border-t border-[#2d2d3c] rounded-t-[30px] p-5 space-y-4 max-h-[90%] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2.5">
              <span className="text-xs font-black text-white">Gönderi Oluştur</span>
              <button onClick={() => setShowCreatePostModal(false)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* AI Drafting Generator box */}
            <div className="bg-[#7C4DFF]/5 border border-[#7C4DFF]/20 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#00E5FF]" />
                <span className="text-[10px] text-[#00E5FF] font-black uppercase tracking-wider">Gemini ile Post Taslağı Hazırla</span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Konu girin (örn: LCK finali heyecanı, Valorant güncellemesi)"
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-[#181824] text-[10px] text-white border border-[#2d2d38] rounded-lg focus:outline-none focus:border-[#7C4DFF]"
                />
                <button
                  onClick={handleDraftAiPost}
                  disabled={aiDraftLoading || !postTopic.trim()}
                  className="px-3 bg-[#7C4DFF] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-[#6c3be5] disabled:opacity-50"
                >
                  {aiDraftLoading ? "Yazıyor..." : "Oluştur"}
                </button>
              </div>
            </div>

            {/* Custom Edit Post Textarea */}
            <textarea
              placeholder="E-spor topluluğuna ne söylemek istersin?..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              rows={4}
              className="w-full p-3 bg-black text-[11px] text-white border border-gray-900 rounded-xl focus:outline-none focus:border-[#00E5FF] resize-none"
            />

            <button
              onClick={handleCreatePost}
              disabled={!newPostText.trim()}
              className="w-full py-2.5 bg-[#00E5FF] text-black text-xs font-extrabold rounded-xl shadow active:scale-95 transition-all disabled:opacity-50"
            >
              Gönderiyi Yayınla
            </button>
          </div>
        </div>
      )}

      {/* PREDICTION SLIDER/CONFIRMATION MODAL */}
      {betMatch && (
        <div className="absolute inset-0 bg-black/85 z-50 flex items-end">
          <div className="w-full bg-[#12121A] border-t border-[#2d2d3c] rounded-t-[30px] p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white">Tahmin Detayları</span>
              <button onClick={() => setBetMatch(null)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#1a1a26] border border-gray-900 p-3 rounded-xl space-y-1 text-center">
              <span className="text-[9px] uppercase font-bold text-gray-500">Tercihiniz</span>
              <p className="text-xs text-white font-extrabold">
                {betSide === "teamA" ? betMatch.teamA.name : betMatch.teamB.name} Kazanır
              </p>
              <p className="text-[10px] text-[#00E5FF] font-mono font-bold">
                Oran: {betSide === "teamA" ? betMatch.teamA.odds : betMatch.teamB.odds}
              </p>
            </div>

            {/* Slider Stake selector */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-400">Yatırılacak Kredit:</span>
                <span className="text-yellow-500 font-mono font-bold">{stakeAmount} ESK</span>
              </div>
              <input
                type="range"
                min="50"
                max={Math.min(credits, 500)}
                step="50"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className="w-full accent-[#00E5FF] h-1 bg-gray-900 rounded-full"
              />
              <div className="flex justify-between text-[8px] text-gray-600 font-mono">
                <span>Min: 50 ESK</span>
                <span>Maks (Limit): 500 ESK</span>
              </div>
            </div>

            {/* Potential payout prediction */}
            <div className="flex justify-between items-center text-[11px] bg-black p-3 rounded-xl border border-gray-900">
              <span className="text-gray-500">Olası Kazanç:</span>
              <span className="text-[#00E5FF] font-mono font-black">
                {Math.round(stakeAmount * (betSide === "teamA" ? betMatch.teamA.odds : betMatch.teamB.odds))} ESK
              </span>
            </div>

            <button
              onClick={handleConfirmPrediction}
              className="w-full py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-black font-extrabold text-xs rounded-xl shadow-lg"
            >
              Tahmini Onayla
            </button>
          </div>
        </div>
      )}

      {/* 8. TEAM DETAIL MODAL */}
      {(isTeamDetailLoading || teamDetail) && (
        <div className="absolute inset-0 bg-black/90 z-[60] flex items-end font-sans">
          <div className="w-full bg-[#12121A] border-t border-[#333] rounded-t-[30px] p-6 space-y-6 max-h-[90%] overflow-y-auto">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-white">Takım Detayları</span>
              <button
                onClick={() => { setTeamDetail(null); setIsTeamDetailLoading(false); }}
                className="text-gray-500 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {isTeamDetailLoading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <RefreshCw size={32} className="text-[#00E5FF] animate-spin" />
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">PandaScore Verileri Çekiliyor...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Team Header */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-black rounded-2xl p-2 flex items-center justify-center border border-white/5">
                    {teamDetail.image_url ? (
                      <img src={teamDetail.image_url} alt={teamDetail.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-4xl">🛡️</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{teamDetail.name}</h2>
                    <div className="flex gap-1 mt-1.5">
                      {teamDetail.form.map((res: string, i: number) => (
                        <span key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                          res === "W" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}>
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Players Section */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-[#00E5FF]" /> AKTİF KADRO
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {teamDetail.players.map((p: any) => (
                      <div key={p.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1b1b24] overflow-hidden flex items-center justify-center border border-white/10">
                            {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <span className="text-lg">👤</span>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                            <p className="text-[10px] text-gray-500">{p.first_name} {p.last_name}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {p.role || "Oyuncu"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Matches Section */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Gamepad2 size={12} className="text-[#7C4DFF]" /> SON MAÇLAR
                  </span>
                  <div className="space-y-2">
                    {teamDetail.past_matches.map((m: any) => (
                      <div key={m.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-bold">vs {m.opponent}</span>
                          <span className="text-[9px] text-gray-500">{m.date}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-mono font-black text-white">{m.score}</span>
                          <span className={`text-[8px] font-black uppercase ${m.winner === teamDetail.name ? "text-green-500" : "text-red-500"}`}>
                            {m.winner === teamDetail.name ? "GALİBİYET" : "MAĞLUBİYET"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
