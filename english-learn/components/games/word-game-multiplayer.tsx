"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { VersusRoomState } from "@/lib/games/word-game-versus-types";
import type { Locale } from "@/lib/i18n/dictionaries";

type Bank = {
  id: string;
  name: string;
};

const BANKS: Bank[] = [
  { id: "general", name: "General Academic" },
  { id: "cs", name: "Computer Science" },
  { id: "math", name: "Mathematics" },
  { id: "civil", name: "Civil Engineering" },
  { id: "mechanical", name: "Mechanical Engineering" },
  { id: "transport", name: "Transportation Engineering" },
];

const PLAYER_STORAGE_KEY = "word_game_versus_player_v1";

function createRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const normalizeRoomCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

const createFallbackPlayer = () => {
  const fallbackId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : fallbackId,
    name: `Player-${Math.floor(Math.random() * 900 + 100)}`,
  };
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload as T;
}

export function WordGameMultiplayer({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState<string>("general");
  const [draftRoomCode, setDraftRoomCode] = useState<string>(() => createRoomCode());
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [roomState, setRoomState] = useState<VersusRoomState | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeRoomCode = roomState?.roomCode ?? "";
  const normalizedJoinCode = useMemo(() => normalizeRoomCode(joinCodeInput), [joinCodeInput]);
  const selfPlayer = useMemo(
    () => roomState?.players.find((player) => player.isSelf) ?? null,
    [roomState],
  );
  const opponentPlayer = useMemo(
    () => roomState?.players.find((player) => !player.isSelf) ?? null,
    [roomState],
  );
  const readyCount = useMemo(
    () => roomState?.players.filter((player) => player.ready).length ?? 0,
    [roomState],
  );
  const readyPercent = useMemo(
    () => (readyCount / 2) * 100,
    [readyCount],
  );
  const canEnterMatch = roomState?.status === "active";
  const canToggleReady = Boolean(roomState && selfPlayer && roomState.status === "lobby");
  const canStartMatch = Boolean(roomState?.canStart && selfPlayer?.isHost);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(PLAYER_STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { id?: string; name?: string };
        if (parsed.id && parsed.name) {
          setPlayerId(parsed.id);
          setPlayerName(parsed.name);
          return;
        }
      } catch {
        // ignore corrupted local data and regenerate
      }
    }

    const next = createFallbackPlayer();
    setPlayerId(next.id);
    setPlayerName(next.name);
    window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!playerId || !playerName.trim()) return;
    window.localStorage.setItem(
      PLAYER_STORAGE_KEY,
      JSON.stringify({ id: playerId, name: playerName.trim() }),
    );
  }, [playerId, playerName]);

  useEffect(() => {
    if (!playerId || !activeRoomCode) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const state = await requestJson<VersusRoomState>(`/api/games/word-game/versus/rooms/${activeRoomCode}?playerId=${encodeURIComponent(playerId)}`);
        if (!cancelled) {
          setRoomState(state);
          setSelectedBank(state.bank);
        }
      } catch {
        // polling failures can happen during hot-reload; keep UI usable
      }
    };

    const pollId = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(pollId);
    };
  }, [activeRoomCode, playerId]);

  const openVersusBattle = () => {
    if (!activeRoomCode || !playerId) return;
    router.push(`/games/word-game/versus?lang=${locale}&room=${activeRoomCode}&player=${encodeURIComponent(playerId)}`);
  };

  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeRoomCode || draftRoomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!playerId) return;
    if (!playerName.trim()) {
      setErrorText("Please set your player name first.");
      return;
    }

    setBusy(true);
    setErrorText("");
    try {
      const state = await requestJson<VersusRoomState>("/api/games/word-game/versus/rooms", {
        method: "POST",
        body: JSON.stringify({
          action: "create",
          roomCode: draftRoomCode,
          playerId,
          playerName: playerName.trim(),
          bank: selectedBank,
        }),
      });
      setRoomState(state);
      setJoinCodeInput(state.roomCode);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to create room.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerId) return;
    if (normalizedJoinCode.length !== 6) {
      setErrorText("Please enter a valid 6-character room code.");
      return;
    }
    if (!playerName.trim()) {
      setErrorText("Please set your player name first.");
      return;
    }

    setBusy(true);
    setErrorText("");
    try {
      const state = await requestJson<VersusRoomState>("/api/games/word-game/versus/rooms", {
        method: "POST",
        body: JSON.stringify({
          action: "join",
          roomCode: normalizedJoinCode,
          playerId,
          playerName: playerName.trim(),
        }),
      });
      setRoomState(state);
      setSelectedBank(state.bank);
      setJoinCodeInput(state.roomCode);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to join room.");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleReady = async () => {
    if (!roomState || !selfPlayer) return;
    setBusy(true);
    setErrorText("");
    try {
      const state = await requestJson<VersusRoomState>(`/api/games/word-game/versus/rooms/${roomState.roomCode}/actions`, {
        method: "POST",
        body: JSON.stringify({
          action: "set-ready",
          playerId,
          ready: !selfPlayer.ready,
        }),
      });
      setRoomState(state);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to update readiness.");
    } finally {
      setBusy(false);
    }
  };

  const handleStartMatch = async () => {
    if (!roomState) return;
    setBusy(true);
    setErrorText("");
    try {
      const state = await requestJson<VersusRoomState>(`/api/games/word-game/versus/rooms/${roomState.roomCode}/actions`, {
        method: "POST",
        body: JSON.stringify({
          action: "start-match",
          playerId,
        }),
      });
      setRoomState(state);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Failed to start match.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="word-multi-root" data-page="multiplayer">
      <main className="multi-page">
        <div className="mountains" />
        <div className="ground" />

        <section className="multi-shell">
          <div className="multi-inner">
            <header className="multi-header">
              <div>
                <h1 className="page-title">Word Defence Versus Arena</h1>
                <p className="sub-copy">Create or join a room, lock your sector, and start when both players are ready.</p>
              </div>
              <div className="room-pill" aria-live="polite">
                {activeRoomCode ? `ACTIVE ROOM #${activeRoomCode}` : "NO ACTIVE ROOM"}
              </div>
            </header>

            <section className="multi-grid">
              <article className="panel panel-control">
                <h2>Match Control</h2>
                <div className="field">
                  <span className="label">Player Name</span>
                  <input
                    className="join-input"
                    type="text"
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                    placeholder="Your nickname"
                    maxLength={20}
                    aria-label="Your player name"
                  />
                </div>

                <div className="field">
                  <span className="label">Create Room</span>
                  <div className="room-box">{activeRoomCode || draftRoomCode}</div>
                  <div className="tiny-actions">
                    <button type="button" className="tiny-btn" onClick={handleCopy}>
                      {copied ? "Copied" : "Copy Room Code"}
                    </button>
                    <button
                      type="button"
                      className="tiny-btn"
                      onClick={() => {
                        setDraftRoomCode(createRoomCode());
                        setErrorText("");
                      }}
                      disabled={busy}
                    >
                      Regenerate
                    </button>
                    <button type="button" className="tiny-btn" onClick={handleCreateRoom} disabled={busy || !playerId}>
                      Create
                    </button>
                  </div>
                </div>

                <div className="field">
                  <span className="label">Join Room</span>
                  <div className="join-row">
                    <input
                      className="join-input"
                      type="text"
                      value={joinCodeInput}
                      onChange={(event) => {
                        setJoinCodeInput(event.target.value.toUpperCase());
                        if (errorText) {
                          setErrorText("");
                        }
                      }}
                      placeholder="Enter 6-character code"
                      maxLength={6}
                      aria-label="Enter room code"
                    />
                    <button type="button" className="tiny-btn join-btn" onClick={handleJoinRoom} disabled={normalizedJoinCode.length !== 6 || busy || !playerId}>
                      Join
                    </button>
                  </div>
                </div>

                <div className="field">
                  <span className="label">Sector Bank</span>
                  <select
                    className="bank-select"
                    value={selectedBank}
                    onChange={(event) => setSelectedBank(event.target.value)}
                    disabled={roomState?.status === "active"}
                  >
                    {BANKS.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
              </article>

              <article className="panel panel-status">
                <h2>Duel Status</h2>
                <div className="fighter-grid">
                  <div className={`fighter-card${selfPlayer?.ready ? " ready" : ""}`}>
                    <span className="fighter-tag">You</span>
                    <strong>{selfPlayer?.name ?? "Not in room"}</strong>
                    <span>
                      {selfPlayer ? (selfPlayer.ready ? "Ready" : "Not Ready") : "Create or join room first"}
                    </span>
                  </div>
                  <div className={`fighter-card${opponentPlayer?.ready ? " ready" : ""}`}>
                    <span className="fighter-tag">Opponent</span>
                    <strong>{opponentPlayer?.name ?? "Waiting..."}</strong>
                    <span>{opponentPlayer ? (opponentPlayer.ready ? "Ready" : "Not Ready") : "No opponent yet"}</span>
                  </div>
                </div>

                <div className="progress-wrap">
                  <div className="progress-label">Lobby Readiness</div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${readyPercent}%` }} />
                  </div>
                </div>

                <p className="join-help">
                  {roomState?.lastEvent ?? "No room activity yet."}
                </p>
                {roomState?.status === "finished" ? (
                  <p className="join-help">
                    Result: {roomState.winnerLabel ?? "Draw"} ({roomState.resultReason ?? "match"})
                  </p>
                ) : null}
                {errorText ? <p className="join-help error">{errorText}</p> : null}
              </article>
            </section>

            <footer className="action-bar">
              <button type="button" className="action-btn secondary" onClick={() => router.push(`/games/word-game?lang=${locale}`)}>
                Return
              </button>
              <button type="button" className="action-btn secondary" onClick={() => router.push(`/games/word-game/select?lang=${locale}`)}>
                Single Practice
              </button>
              <button type="button" className="action-btn ghost" onClick={handleToggleReady} disabled={!canToggleReady || busy}>
                {selfPlayer?.ready ? "Cancel Ready" : "Ready Up"}
              </button>
              <button type="button" className="action-btn test" onClick={handleStartMatch} disabled={!canStartMatch || busy}>
                {busy ? "Working..." : "Start Match"}
              </button>
              <button
                type="button"
                className="action-btn primary"
                disabled={!canEnterMatch}
                onClick={() => openVersusBattle()}
              >
                Enter Versus Match
              </button>
            </footer>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .word-multi-root {
          --sky-top: #7fd7e9;
          --sky-mid: #a6f0e4;
          --sky-bottom: #d4ffd8;
          --hill-far: #95d9c9;
          --hill-mid: #67bf90;
          --grass-light: #9dd860;
          --grass-mid: #74b54a;
          --grass-dark: #355a20;
          --purple-line: #241541;
          --white: #fffef8;
          --cream: #fff1d3;
          margin: 0;
          min-height: 100vh;
          font-family: "Trebuchet MS", "Segoe UI", sans-serif;
          color: var(--white);
          background: radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.36), transparent 18%),
            linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 58%, var(--sky-bottom) 100%);
        }

        .word-multi-root * {
          box-sizing: border-box;
        }

        .multi-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mountains {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 22%;
          height: 220px;
          pointer-events: none;
        }

        .mountains::before,
        .mountains::after {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 100%;
        }

        .mountains::before {
          clip-path: polygon(0% 100%, 11% 46%, 23% 100%, 37% 36%, 51% 100%, 66% 40%, 81% 100%, 100% 50%, 100% 100%);
          background: var(--hill-far);
          opacity: 0.92;
        }

        .mountains::after {
          transform: translateY(52px);
          clip-path: polygon(0% 100%, 10% 62%, 24% 100%, 40% 54%, 56% 100%, 74% 48%, 90% 100%, 100% 66%, 100% 100%);
          background: var(--hill-mid);
          opacity: 0.95;
        }

        .ground {
          position: absolute;
          left: -2%;
          right: -2%;
          bottom: -8%;
          height: 40%;
          background: radial-gradient(circle at 18% 12%, rgba(194, 240, 103, 0.8), rgba(194, 240, 103, 0) 18%),
            radial-gradient(circle at 80% 18%, rgba(194, 240, 103, 0.5), rgba(194, 240, 103, 0) 16%),
            linear-gradient(180deg, var(--grass-light) 0%, var(--grass-mid) 50%, var(--grass-dark) 100%);
          clip-path: polygon(0 42%, 12% 28%, 23% 26%, 38% 34%, 50% 31%, 60% 24%, 72% 28%, 82% 18%, 100% 26%, 100% 100%, 0 100%);
          box-shadow: inset 0 10px 0 rgba(255, 255, 255, 0.15);
          pointer-events: none;
        }

        .multi-shell {
          position: relative;
          z-index: 1;
          width: min(1280px, 100%);
          border-radius: 34px;
          padding: 24px;
          background: rgba(50, 39, 88, 0.22);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16), 0 24px 50px rgba(33, 24, 64, 0.22);
          backdrop-filter: blur(10px);
        }

        .multi-inner {
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.16), rgba(48, 31, 83, 0.08));
          padding: 24px;
        }

        .multi-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .page-title {
          margin: 8px 0 10px;
          font-size: clamp(2rem, 4vw, 3.4rem);
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--cream);
          text-shadow: 0 4px 0 rgba(55, 33, 24, 0.18), 0 18px 30px rgba(33, 22, 25, 0.16);
        }

        .sub-copy {
          margin: 0;
          color: rgba(255, 248, 235, 0.84);
          font-size: 1rem;
          line-height: 1.55;
          max-width: 680px;
        }

        .room-pill {
          align-self: center;
          border-radius: 999px;
          border: 3px solid var(--purple-line);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3), 0 6px 0 rgba(36, 21, 65, 0.34);
          padding: 10px 16px;
          font-size: 0.92rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          color: var(--cream);
          white-space: nowrap;
        }

        .multi-grid {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .panel {
          border-radius: 20px;
          border: 3px solid var(--purple-line);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3), 0 8px 0 rgba(36, 21, 65, 0.34);
          padding: 16px;
        }

        .panel h2 {
          margin: 0 0 14px;
          font-size: 1.15rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #bdefff;
        }

        .field + .field {
          margin-top: 14px;
        }

        .label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 248, 235, 0.84);
          font-size: 0.84rem;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .room-box {
          border-radius: 14px;
          border: 2px solid rgba(255, 255, 255, 0.26);
          background: rgba(16, 18, 37, 0.28);
          padding: 12px 14px;
          font-size: 1.4rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          color: #fff7e2;
          text-align: center;
        }

        .tiny-actions {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tiny-btn {
          border-radius: 999px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(22, 15, 42, 0.48);
          color: rgba(255, 248, 235, 0.9);
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
        }

        .tiny-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .join-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
        }

        .join-input {
          height: 42px;
          border-radius: 11px;
          border: 2px solid rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.95);
          color: #2f261e;
          font: inherit;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0 12px;
        }

        .join-btn {
          min-width: 86px;
          min-height: 42px;
        }

        .join-help {
          margin: 8px 0 0;
          color: rgba(255, 248, 235, 0.78);
          font-size: 0.82rem;
          line-height: 1.45;
        }

        .join-help.error {
          color: #ffd7c8;
        }

        .bank-select {
          width: 100%;
          height: 46px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.95);
          color: #2f261e;
          font: inherit;
          font-weight: 800;
          padding: 0 12px;
        }

        .fighter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .fighter-card {
          border-radius: 14px;
          border: 2px solid rgba(255, 255, 255, 0.24);
          background: rgba(20, 16, 44, 0.45);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .fighter-card.ready {
          border-color: rgba(177, 255, 160, 0.7);
          box-shadow: inset 0 0 0 1px rgba(177, 255, 160, 0.3);
        }

        .fighter-tag {
          color: rgba(255, 248, 235, 0.74);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .fighter-card strong {
          font-size: 1.1rem;
          color: #fff7e2;
        }

        .fighter-card span:last-child {
          color: rgba(255, 248, 235, 0.84);
          font-size: 0.9rem;
          font-weight: 700;
        }

        .progress-wrap {
          margin-top: 14px;
        }

        .progress-label {
          margin-bottom: 8px;
          color: rgba(255, 248, 235, 0.84);
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .progress-track {
          height: 14px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(13, 10, 29, 0.52);
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #5ed9ff, #8ce96a);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.36);
          transition: width 0.2s ease;
        }

        .sim-btn {
          margin-top: 14px;
          width: 100%;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(22, 15, 42, 0.46);
          color: #fff7e2;
          padding: 10px 12px;
          font-size: 0.86rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
        }

        .action-bar {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 0.8fr 1fr 1fr 1fr 1.2fr;
          gap: 10px;
        }

        .action-btn {
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          min-height: 52px;
          padding: 10px 14px;
          transition: transform 0.2s ease, filter 0.2s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .action-btn.secondary {
          border: 3px solid var(--purple-line);
          color: var(--cream);
          background: linear-gradient(180deg, rgba(91, 65, 146, 0.98), rgba(61, 39, 103, 1));
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14), inset 0 -5px 0 rgba(28, 17, 52, 0.3), 0 6px 0 rgba(36, 21, 65, 0.34);
        }

        .action-btn.ghost {
          border: 3px solid #333e96;
          color: var(--white);
          background: linear-gradient(180deg, #6f83f7, #4f5fd0);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -5px 0 rgba(39, 49, 125, 0.36), 0 6px 0 rgba(34, 45, 117, 0.38);
        }

        .action-btn.test {
          border: 3px solid #0d5a78;
          color: var(--white);
          background: linear-gradient(180deg, #4fb9e8, #2789b8);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.24), inset 0 -5px 0 rgba(15, 89, 119, 0.36), 0 6px 0 rgba(11, 74, 98, 0.38);
        }

        .action-btn.primary {
          border: 3px solid #6f2d1e;
          color: var(--white);
          background: linear-gradient(180deg, #d97d54, #a84e30);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.18), inset 0 -5px 0 rgba(109, 41, 25, 0.36), 0 6px 0 rgba(109, 41, 25, 0.38);
        }

        .action-btn:disabled {
          cursor: not-allowed;
          opacity: 0.56;
          filter: saturate(0.4);
        }

        @media (max-width: 980px) {
          .multi-page {
            padding: 16px;
          }

          .multi-shell {
            padding: 16px;
          }

          .multi-inner {
            padding: 16px;
          }

          .multi-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .room-pill {
            align-self: flex-start;
          }

          .multi-grid {
            grid-template-columns: 1fr;
          }

          .action-bar {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 720px) {
          .word-multi-root {
            overflow: auto;
          }

          .page-title {
            font-size: clamp(1.6rem, 9vw, 2.2rem);
          }

          .fighter-grid {
            grid-template-columns: 1fr;
          }

          .join-row {
            grid-template-columns: 1fr;
          }

          .action-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
