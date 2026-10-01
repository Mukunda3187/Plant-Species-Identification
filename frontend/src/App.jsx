import { useEffect, useRef, useState } from "react";

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

    scanImage(f);
  }

  async function scanImage(selectedFile) {
    if (!selectedFile) return;

    setLoading(true);
    setError("");

    try {
      const body = new FormData();
      body.append("image", selectedFile);

      const res = await fetch("/api/predict", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Prediction failed.");
      }

      setResult(data);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Can't reach the backend. Start it with: python app.py"
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  function goHome() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setLoading(false);
    setError("");
    setDragging(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const best = result?.prediction;
  const unsure = best && best.confidence < 60;

  return (
    <div className="page">

      {/* HEADER */}
      <header className="top">
        <button
          className="brand"
          onClick={goHome}
          type="button"
          aria-label="Go to home page"
        >
          <LeafMark size={25} />
          <span>Plant Species Identification Using CNN</span>
        </button>
      </header>

      {/* HOME / UPLOAD PAGE */}
      {!preview ? (
        <main className="layout">

          <section className="specimen">

            <div
              className={"drop" + (dragging ? " over" : "")}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                choose(e.dataTransfer.files[0]);
              }}
            >

              <LeafMark size={42} />

              <p className="drop-title">
                Drop a plant photo here
              </p>

              <p className="lede">
                Upload a photo and a CNN will name the plant from
                14 species, with its top three guesses and how sure it is.
              </p>

              <p className="muted">
                JPG or PNG, up to 10 MB
              </p>

              <button
                className="btn"
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                Choose image
              </button>

            </div>

          </section>

        </main>
      ) : (

        /* RESULT PAGE */
        <main className="result-page">

          <div className="result-card">

            {/* LEFT - IMAGE */}
            <div className="result-image-section">
              <img
                className="result-photo"
                src={preview}
                alt="Uploaded plant"
              />
            </div>

            {/* RIGHT - DETAILS */}
            <div className="result-details">

              {loading && (
                <div className="scanning">

                  <div className="loader"></div>

                  <h2>
                    Scanning image...
                  </h2>

                  <p>
                    The CNN model is identifying the plant.
                  </p>

                </div>
              )}

              {error && !loading && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}

              {result && !loading && best && (
                <div className="label">

                  <p className="identified-text">
                    Identified as
                  </p>

                  <h2>
                    {best.label}
                  </h2>

                  <p className="conf">
                    {best.confidence.toFixed(2)}% confidence
                  </p>

                  {unsure && (
                    <p className="note">
                      Low confidence. Try a closer, well-lit
                      photo of the leaves or fruit.
                    </p>
                  )}

                  <ol className="bars">

                    {result.top3.map((p, i) => (
                      <li key={p.label}>

                        <span className="bar-name">
                          {p.label}
                        </span>

                        <span className="track">
                          <span
                            className={
                              "fill" +
                              (i === 0 ? " first" : "")
                            }
                            style={{
                              width: `${Math.max(
                                p.confidence,
                                1
                              )}%`,
                            }}
                          />
                        </span>

                        <span className="bar-val">
                          {p.confidence.toFixed(1)}%
                        </span>

                      </li>
                    ))}

                  </ol>

                </div>
              )}

            </div>

          </div>

        </main>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => choose(e.target.files[0])}
      />

    </div>
  );
}

function LeafMark({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 4C10 4 4 9 4 15c0 2.2 1.2 4 3 5 .3-5 3-9 8-11-4 3-6 6-6.5 11.3C15.5 19.5 20 14 20 4Z"
        fill="currentColor"
      />
    </svg>
  );
}
