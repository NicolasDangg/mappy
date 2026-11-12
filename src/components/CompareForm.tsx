"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompareForm() {
  const router = useRouter();
  const [activity, setActivity] = useState("");
  const [places, setPlaces] = useState(["", "", ""]);
  const [passcode, setPasscode] = useState("");
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity, places: places.filter((p) => p.trim()), passcode: passcode || undefined }),
      });
      const body = await res.json();
      if (res.status === 401) setNeedsPasscode(true);
      if (!res.ok) throw new Error(body.error ?? "Could not start the comparison.");
      const official = (body.official_domains as string[] | undefined)?.join(",") ?? "";
      router.push(`/c/${body.id}${official ? `?official=${encodeURIComponent(official)}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the comparison.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <label>
        What do you want to do?
        <input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Open a small café that serves hot food" required minLength={4} maxLength={400} />
      </label>
      <fieldset>
        <legend>Where? Three to five cities, states or countries</legend>
        <div className="places">
          {places.map((p, i) => (
            <input key={i} value={p} onChange={(e) => setPlaces(places.map((x, k) => (k === i ? e.target.value : x)))} placeholder={["Singapore", "London, UK", "New York City, USA", "Sydney, Australia", "Dubai, UAE"][i]} required={i < 3} aria-label={`Place ${i + 1}`} />
          ))}
        </div>
        {places.length < 5 ? <button type="button" className="linkish" onClick={() => setPlaces([...places, ""])}>Add a place</button> : null}
      </fieldset>
      {needsPasscode ? (
        <label>
          Passcode
          <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} autoComplete="off" />
        </label>
      ) : null}
      {error ? <p role="alert" className="error">{error}</p> : null}
      <div className="actions">
        <button disabled={busy} className="btn">{busy ? "Finding government sites" : "Compare these places"}</button>
        <p>The research reads the official sites for every place. It takes 5 to 20 minutes, and the link keeps working if you leave.</p>
      </div>
    </form>
  );
}
