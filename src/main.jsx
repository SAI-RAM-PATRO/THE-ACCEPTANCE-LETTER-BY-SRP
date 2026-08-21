import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Volume2, VolumeX, Sparkles, Feather, RotateCcw } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./styles.css";

const LETTER_TEXT =
  "We are delighted to inform you that your application has been accepted. Your place has been reserved for the upcoming term. Prepare yourself for a journey filled with knowledge, friendship, courage, and a little bit of magic.";

const envelopes = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 17) % 91)}%`,
  top: `${8 + ((i * 29) % 78)}%`,
  delay: `${(i * 0.9) % 6}s`,
  duration: `${11 + (i % 5) * 2}s`,
  rotate: `${-14 + (i * 13) % 29}deg`,
  scale: 0.72 + (i % 4) * 0.12,
}));

function App() {
  const [name, setName] = useState("");
  const [revealedName, setRevealedName] = useState("");
  const [stage, setStage] = useState("landing");
  const [soundOn, setSoundOn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const audioRef = useRef(null);
  const letterRef = useRef(null);

  const normalizedName = useMemo(() => {
    return name.trim().replace(/\s+/g, " ").slice(0, 60);
  }, [name]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/background-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.22;
      audioRef.current.preload = "auto";
    }
  }, []);

  const toggleSound = async () => {
    if (!audioRef.current) return;
    try {
      if (soundOn) {
        audioRef.current.pause();
        setSoundOn(false);
      } else {
        await audioRef.current.play();
        setSoundOn(true);
      }
    } catch {
      setSoundOn(false);
    }
  };

  const reveal = (event) => {
    event.preventDefault();
    if (!normalizedName) return;
    setRevealedName(normalizedName);

    // The reveal button is a user gesture, so browsers allow audio playback here.
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setSoundOn(true)).catch(() => setSoundOn(false));
    }

    setStage("flying");
    window.setTimeout(() => setStage("letter"), 1900);
  };

  const reset = () => {
    setStage("landing");
    setRevealedName("");
    setName("");
  };

  const downloadPdf = async () => {
    if (!letterRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(letterRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ead5a9",
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 12;
      const usableW = pageW - margin * 2;
      const ratio = canvas.height / canvas.width;
      const imgH = usableW * ratio;
      const y = Math.max(margin, (pageH - imgH) / 2);
      pdf.setFillColor(232, 210, 166);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.addImage(img, "PNG", margin, y, usableW, Math.min(imgH, pageH - margin * 2));
      const safe = revealedName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      pdf.save(`Acceptance-Letter-${safe || "Wizard"}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="ambient-glow glow-one" />
      <div className="ambient-glow glow-two" />
      <div className="moon" />

      <div className="stars" aria-hidden="true">
        {Array.from({ length: 80 }, (_, i) => (
          <span key={i} style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 61) % 100}%`,
            animationDelay: `${(i % 9) * 0.55}s`,
            animationDuration: `${2.2 + (i % 5) * 0.7}s`
          }} />
        ))}
      </div>

      <div className="mist mist-a" />
      <div className="mist mist-b" />

      {envelopes.map((e) => (
        <motion.div
          key={e.id}
          className="floating-envelope"
          style={{
            left: e.left,
            top: e.top,
            rotate: e.rotate,
            scale: e.scale,
            animationDelay: e.delay,
            animationDuration: e.duration,
          }}
          animate={{ y: [-18, 18, -18], x: [-5, 6, -5] }}
          transition={{ duration: Number(e.duration.replace("s", "")), repeat: Infinity, ease: "easeInOut", delay: Number(e.delay.replace("s", "")) }}
          aria-hidden="true"
        >
          <div className="mini-envelope" />
        </motion.div>
      ))}

      <header className="topbar">
        <div className="brand-mark">
          <span className="crest">✦</span>
          <span>THE ACCEPTANCE LETTER</span>
        </div>
        <button className="sound-toggle" onClick={toggleSound} aria-label="Toggle ambient sound">
          {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          <span>{soundOn ? "Music On" : "Music Off"}</span>
        </button>
      </header>

      <section className="hero">
        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <motion.div
              key="landing"
              className="landing-panel"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(5px)" }}
              transition={{ duration: 0.7 }}
            >
              <div className="eyebrow"><Sparkles size={14} /> AN INVITATION FROM BEYOND THE ORDINARY</div>
              <h1>The Acceptance<br /><em>Letter</em></h1>
              <p className="lead">
                Somewhere between midnight and moonlight, an envelope has been waiting for you.
              </p>

              <form className="name-form" onSubmit={reveal}>
                <label htmlFor="wizard-name">Enter your name, young witch or wizard…</label>
                <div className="parchment-input">
                  <Feather size={20} />
                  <input
                    id="wizard-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </div>
                <button className="reveal-button" type="submit" disabled={!normalizedName}>
                  <span>Reveal My Letter</span><span className="button-star">✦</span>
                </button>
              </form>

              <div className="tiny-note">A little patience. A little courage. And perhaps… a little magic.</div>
            </motion.div>
          )}

          {stage === "flying" && (
            <motion.div
              key="flying"
              className="flight-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="hero-envelope"
                initial={{ y: 360, x: 120, rotate: -12, scale: 0.65, opacity: 0 }}
                animate={{ y: [360, -25, 0], x: [120, -30, 0], rotate: [-12, 4, 0], scale: [0.65, 1.05, 1], opacity: 1 }}
                transition={{ duration: 1.9, times: [0, 0.68, 1], ease: "easeInOut" }}
              >
                <div className="envelope-body">
                  <div className="envelope-flap" />
                  <div className="wax-seal">✦</div>
                </div>
              </motion.div>
              <div className="magic-ring" />
              <p>Something extraordinary is on its way…</p>
            </motion.div>
          )}

          {stage === "letter" && (
            <motion.div
              key="letter"
              className="letter-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                className="letter-card-wrap"
                initial={{ y: 80, rotateX: -12, scale: 0.82, opacity: 0 }}
                animate={{ y: 0, rotateX: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 70, damping: 15 }}
              >
                <article className="letter-card exact-letter" ref={letterRef}>
                  <img
                    className="exact-letter-image"
                    src="/acceptanceletter.png"
                    alt="Antique wizarding school acceptance letter"
                    crossOrigin="anonymous"
                  />
                  <div
                    className="personalized-name"
                    aria-label={`Dear Mr/Ms. ${revealedName}`}
                  >
                    {revealedName}
                  </div>
                </article>
              </motion.div>

              <motion.div
                className="action-row"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <button className="reveal-button secondary" onClick={downloadPdf} disabled={downloading}>
                  <Download size={17} />
                  <span>{downloading ? "Preparing…" : "Download My Acceptance Letter"}</span>
                </button>
                <button className="ghost-button" onClick={reset}>
                  <RotateCcw size={16} /> Create Another Letter
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="footer">
        <span>Some letters change more than an address.</span>
        <span className="footer-star">✦</span>
        <span>Made for the curious.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
