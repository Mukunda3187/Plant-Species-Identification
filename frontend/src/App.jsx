import { useEffect, useRef, useState } from "react";

const PLANTS = [
  "Aloe vera", "Banana", "Coconut", "Corn", "Cucumber", "Ginger", "Guava",
  "Mango", "Melon", "Orange", "Paddy", "Papaya", "Pineapple", "Watermelon",
];

export default function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function choose(f) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Choose an image file (JPG or PNG).");
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
  }

  async function identify() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/predict", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed.");
      setResult(data);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Can't reach the backend. Start it with: python app.py (in the backend folder)."
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const best = result?.prediction;
  const unsure = best && best.confidence < 60;

  return (
    <div className="page">
      <header className="top">
        <span className="brand">
          <LeafMark />Plant Species Identification Using CNN
        </span>
      </header>

      <main className="layout">
        <section className="intro">
          <p className="lede">
            Upload a photo and a convolutional neural network will name the plant from
            14 species, with its top three guesses and how sure it is.
          </p>
          <ul className="chips" aria-label="Supported plants">
            {PLANTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="specimen" aria-live="polite">
          {!preview ? (
            <div
              className={"drop" + (dragging ? " over" : "")}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                choose(e.dataTransfer.files[0]);
              }}
            >
              <LeafMark size={44} />
              <p className="drop-title">Drop a plant photo here</p>
              <p className="muted">JPG or PNG, up to 10 MB</p>
              <button className="btn" onClick={() => inputRef.current?.click()}>
                Choose image
              </button>
            </div>
          ) : (
            <div className="card">
              <img className="photo" src={preview} alt="Uploaded plant" />

              {!result && (
                <div className="actions">
                  <button className="btn" onClick={identify} disabled={loading}>
                    {loading ? "Identifying…" : "Identify plant"}
                  </button>
                  <button className="btn ghost" onClick={reset} disabled={loading}>
                    Choose another
                  </button>
                </div>
              )}

              {result && (
                <div className="label">
                  <p className="muted small">Identified as</p>
                  <h2>{best.label}</h2>
                  <p className="conf">{best.confidence.toFixed(2)}% confidence</p>
                  {unsure && (
                    <p className="note">
                      Low confidence. Try a closer, well-lit photo of the leaves or fruit.
                    </p>
                  )}
                  <ol className="bars">
                    {result.top3.map((p, i) => (
                      <li key={p.label}>
                        <span className="bar-name">{p.label}</span>
                        <span className="track">
                          <span
                            className={"fill" + (i === 0 ? " first" : "")}
                            style={{ width: `${Math.max(p.confidence, 1)}%` }}
                          />
                        </span>
                        <span className="bar-val">{p.confidence.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ol>
                  <button className="btn ghost" onClick={reset}>Identify another</button>
                </div>
              )}
            </div>
          )}

          {error && <p className="error" role="alert">{error}</p>}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => choose(e.target.files[0])}
          />
        </section>
      </main>
    </div>
  );
}

function LeafMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 4C10 4 4 9 4 15c0 2.2 1.2 4 3 5 .3-5 3-9 8-11-4 3-6 6-6.5 11.3C15.5 19.5 20 14 20 4Z" fill="currentColor" />
    </svg>
  );
}
