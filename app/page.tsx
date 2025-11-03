"use client";

import { useState, useMemo, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Random music selection that persists
  const randomMusic = useMemo(() => {
    const songs = [
      "/music/kear - sh1tin (Official Music Video).mp3",
      "/music/M-C-M AND BAPE (SLOWED).mp3",
      "/music/EEM TRIPLIN - 100 GRAMS  MILEY CYRUS.mp3"
    ];
    return songs[Math.floor(Math.random() * songs.length)];
  }, []);

  // Generate random stats that persist
  const stats = useMemo(() => {
    const likes = Math.floor(Math.random() * 50000) + 1000; // Between 1k and 51k
    const comments = Math.floor(likes / 3 * (0.8 + Math.random() * 0.4)); // ~likes/3 with some variation
    const shares = Math.floor(comments / 2 * (0.8 + Math.random() * 0.4)); // ~comments/2 with some variation
    return { likes, comments, shares };
  }, []); // Empty deps means it only generates once

  const handleTranslate = async () => {
    if (!input.trim()) return;

    console.log("🔄 Starting translation for:", input.substring(0, 50));
    setLoading(true);
    setTranslation("");

    try {
      console.log("📡 Sending request to /api/translate");
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      console.log("📥 Response status:", response.status, response.statusText);
      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!response.ok) {
        // Show the error message from the API
        console.error("❌ API Error:", data);
        setTranslation(data.message || "something went wrong 💀 try again");
        return;
      }

      console.log("✅ Translation received:", data.translation);
      setTranslation(data.translation);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      setTranslation("something went wrong 💀 try again");
    } finally {
      setLoading(false);
      console.log("🏁 Translation complete");
    }
  };

  const handleCopyCA = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const caAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    try {
      await navigator.clipboard.writeText(caAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      console.log("✅ CA copied to clipboard:", caAddress);
    } catch (error) {
      console.error("❌ Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = caAddress;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("❌ Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Auto-play music on mount or first user interaction
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let hasStarted = false;

    const startMusic = () => {
      if (hasStarted) return;
      hasStarted = true;
      
      audio = document.getElementById("background-music") as HTMLAudioElement;
      if (audio) {
        audio.volume = 0.3;
        audio.play().catch(err => {
          console.log("Audio play failed:", err);
        });
      }
    };

    // Try to start immediately (works in some contexts)
    const immediateAudio = document.getElementById("background-music") as HTMLAudioElement;
    if (immediateAudio) {
      immediateAudio.volume = 0.3;
      immediateAudio.play().then(() => {
        hasStarted = true;
      }).catch(() => {
        // If autoplay fails, wait for user interaction
        document.addEventListener("click", startMusic, { once: true });
        document.addEventListener("touchstart", startMusic, { once: true });
        document.addEventListener("keydown", startMusic, { once: true });
      });
    }

    return () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      document.removeEventListener("keydown", startMusic);
    };
  }, [randomMusic]);

  return (
    <main className="h-screen overflow-hidden bg-black text-white">
      {/* Background Music - Hidden audio element */}
      <audio
        id="background-music"
        src={randomMusic}
        loop
        preload="auto"
        className="hidden"
      />
      
      {/* Header Elements - Overlay on video */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/80 via-black/60 to-transparent md:bg-transparent">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-2xl">🔁</span>
          <span className="font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Translating</span>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Pump.fun Button */}
          <a 
            href="https://pump.fun" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-800/80 rounded-lg transition-colors bg-black/40 backdrop-blur-sm"
          >
            <img src="/Logo-stems/Pump logo.png" alt="pump.fun" className="w-7 h-7" />
          </a>
          {/* X (Twitter) Button */}
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-800/80 rounded-lg transition-colors bg-black/40 backdrop-blur-sm"
          >
            <img src="/Logo-stems/X logo.png" alt="X" className="w-7 h-7" />
          </a>
        </div>
      </div>

      {/* Main Content - TikTok Feed Style */}
      <div className="h-full pt-0 pb-20 md:py-2 md:flex md:items-center md:justify-center">
        <div className="max-w-[600px] mx-auto w-full h-full md:h-auto md:w-full md:px-8">
          {/* Single "Video" Card - Translator */}
          <div className="relative h-full md:h-auto md:aspect-[9/16] md:max-h-[calc(100vh-2rem)] md:w-full overflow-hidden md:rounded-2xl">
            {/* Video Background */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover md:rounded-2xl"
            >
                  <source src="/Video/New vid.mp4" type="video/mp4" />
            </video>
            
            {/* Video Overlay Effects */}
            <div className="absolute inset-0 bg-black/40"></div>
            {/* Animated gradient overlay for video effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]"></div>
            {/* Video-like scan lines effect */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
            }}></div>

            {/* Video Container - Translator Box */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 overflow-hidden">
              <div className="w-full max-w-md flex-shrink-0 flex flex-col">
                {/* Input Area - Fixed Height */}
                <div className="h-32 mb-1 overflow-hidden">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={input ? "" : "I'm fine."}
                    className="w-full h-full px-4 py-2 bg-transparent text-white placeholder-gray-300 focus:outline-none resize-none text-3xl text-center font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                    disabled={loading}
                    style={{ 
                      lineHeight: '1.4',
                      fontFamily: 'TikTok Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                        e.preventDefault();
                        handleTranslate();
                      }
                    }}
                  />
                </div>

                {/* Translating Indicator - Fixed Position */}
                <div className="text-center h-12 mb-10 flex items-center justify-center flex-shrink-0">
                  {loading ? (
                    <p className="text-white text-2xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">🔁Translating...🔁</p>
                  ) : (
                    <button
                      onClick={handleTranslate}
                      disabled={!input.trim()}
                      className="text-white text-2xl font-bold hover:text-pink-400 transition-colors disabled:opacity-80 disabled:cursor-not-allowed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                    >
                      🔁Translating...🔁
                    </button>
                  )}
                </div>

                {/* Translation Display - Flexible Height */}
                <div className="min-h-40 max-h-52 overflow-y-auto text-center flex items-center justify-center animate-[fadeIn_0.3s_ease-out] py-3 no-scrollbar">
                  {loading ? (
                    <p className="text-white text-2xl md:text-3xl leading-snug font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] px-4" style={{ fontFamily: 'TikTok Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                      ...
                    </p>
                  ) : translation ? (
                    <p className="text-white text-2xl md:text-3xl leading-snug font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] px-4" style={{ fontFamily: 'TikTok Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                      {translation}
                    </p>
                  ) : (
                    <p className="text-gray-300 text-2xl md:text-3xl leading-snug font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] px-4" style={{ fontFamily: 'TikTok Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                      one ignored dm away from a breakdown fr 😭
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Actions (TikTok style) */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-20">
              {/* Action Buttons */}
              <div className="flex flex-col items-center gap-2">
                <img src="/Logo-stems/like.png" alt="Like" className="w-12 h-12" />
                <span className="text-xs">{stats.likes >= 1000 ? `${(stats.likes / 1000).toFixed(1)}K` : stats.likes}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <img src="/Logo-stems/comment.png" alt="Comment" className="w-12 h-12" />
                <span className="text-xs">{stats.comments >= 1000 ? `${(stats.comments / 1000).toFixed(1)}K` : stats.comments}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <img src="/Logo-stems/Share.png" alt="Share" className="w-12 h-12" />
                <span className="text-xs">{stats.shares >= 1000 ? `${(stats.shares / 1000).toFixed(1)}K` : stats.shares}</span>
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl">🔁</div>
                <div>
                  <p className="text-sm font-semibold">@$TRANSLATING</p>
                  <button
                    onClick={handleCopyCA}
                    className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer text-left select-none pointer-events-auto"
                    type="button"
                  >
                    {copied ? "Copied! ✓" : "CA : EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (TikTok style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden">
        <div className="max-w-[600px] mx-auto flex items-center justify-around py-2">
          <button className="flex flex-col items-center gap-1 p-2">
            <img src="/Logo-stems/Home.png" alt="Home" className="w-8 h-8" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <img src="/Logo-stems/friends.png" alt="Friends" className="w-8 h-8" />
            <span className="text-xs text-gray-500">Friends</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <div className="w-12 h-8 border-2 border-white rounded-md flex items-center justify-center">
              <span className="text-xs">+</span>
            </div>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <img src="/Logo-stems/inbox.png" alt="Inbox" className="w-8 h-8" />
            <span className="text-xs text-gray-500">Inbox</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2">
            <img src="/Logo-stems/profile.png" alt="Profile" className="w-8 h-8" />
            <span className="text-xs text-gray-500">Profile</span>
          </button>
        </div>
      </nav>
    </main>
  );
}

