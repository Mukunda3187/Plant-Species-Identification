import { useEffect, useRef, useState } from "react";

const SPECIES_COL_1 = [
  "Aloe vera",
  "Banana",
  "Coconut",
  "Corn",
  "Cucumber",
  "Ginger",
  "Guava",
];

const SPECIES_COL_2 = [
  "Mango",
  "Melon",
  "Orange",
  "Paddy",
  "Papaya",
  "Pineapple",
  "Watermelon",
];

const DATASET_COUNTS = {
  "Aloe vera": 700,
  "Banana": 700,
  "Coconut": 700,
  "Corn": 700,
  "Cucumber": 700,
  "Ginger": 700,
  "Guava": 700,
  "Mango": 700,
  "Melon": 700,
  "Orange": 700,
  "Paddy": 700,
  "Papaya": 700,
  "Pineapple": 700,
  "Watermelon": 700,
};

export default function App() {
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("classifier"); // "classifier" | "info"
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("theme") === "dark";
});
  useEffect(() => {
  document.body.classList.toggle("dark-mode", darkMode);
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);
  // 7-second graph display modal state
  const [graphModalOpen, setGraphModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function openGraphModal() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setGraphModalOpen(true);

    // Auto-close strictly after 7 seconds
    timerRef.current = setTimeout(() => {
      setGraphModalOpen(false);
    }, 7000);
  }

  function closeGraphModal() {
    setGraphModalOpen(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  async function chooseTestImage(number) {
    try {
      const response = await fetch(`/${number}.jpg`);
      if (!response.ok) throw new Error(`Test image ${number}.jpg not found.`);
      const blob = await response.blob();
      const testFile = new File([blob], `${number}.jpg`, { type: 'image/jpeg' });
      await choose(testFile);
    } catch (e) {
      setError(e.message || 'Unable to load test image.');
    }
  }

  async function choose(f) {
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError("Choose an image file (JPG or PNG).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const body = new FormData();
      body.append("image", f);

      const res = await fetch("/api/predict", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Prediction failed.");
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const url = URL.createObjectURL(f);
      setPreview(url);
      setFile(f);
      setResult(data);
      setActiveTab("classifier");
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Unable to reach the prediction server. Please try again."
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  function goHome() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setResult(null);
    setLoading(false);
    setError("");
    setDragging(false);
    setActiveTab("classifier");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const best = result?.prediction;

  return (
    <div className="page">

      {/* HEADER */}
      <header className="top">
        <div className="brand">
  <button
    className="theme-toggle"
    onClick={() => setDarkMode((prev) => !prev)}
    type="button"
    aria-label="Toggle dark mode"
  >
    <LeafMark size={25} />
  </button>

  <button
    className="brand-title"
    onClick={goHome}
    type="button"
  >
    Plant Species Identification Using CNN
  </button>
</div>

        {/* RIGHT HEADER LINE: SPECIES AND INFO */}
        <nav className="header-nav">
          <button
            type="button"
            className={"nav-species-info" + (activeTab === "info" ? " active" : "")}
            onClick={() => {
              setActiveTab(activeTab === "info" ? "classifier" : "info");
            }}
          >
            <span>Species & Info</span>
            <span className="nav-line" />
          </button>
        </nav>
      </header>

      {/* ============================================================ */}
      {/* 1. SPECIES AND INFO PAGE VIEW                                */}
      {/* ============================================================ */}
      {activeTab === "info" ? (
        <main className="info-page">
          <div className="info-container">

            {/* PAGE HEADER ROW */}
            <div className="info-header-row">
              <h1 className="info-title">Species and Model Information</h1>
            </div>

            {/* 1. ACCURACY IN A CARD BOX */}
            <section className="accuracy-card-box">
              <div className="accuracy-card-header">
                <h2 className="accuracy-card-title">Training & Validation Performance</h2>
              </div>

              <div className="accuracy-stats-grid">
                <div className="acc-stat-highlight">
                  <span className="acc-number">85.4%</span>
                  <span className="acc-label">Overall Accuracy</span>
                </div>
                <div className="acc-stat-item">
                  <span className="stat-val">85.6%</span>
                  <span className="stat-title">Validation Accuracy</span>
                </div>
                <div className="acc-stat-item">
                  <span className="stat-val">85.2%</span>
                  <span className="stat-title">Training Accuracy</span>
                </div>
                <div className="acc-stat-item">
                  <span className="stat-val">14</span>
                  <span className="stat-title">Target Species</span>
                </div>
              </div>
            </section>

            {/* 2. 14 SPECIES NAMES: 7 ON LEFT, LIGHT LINE IN MIDDLE, 7 ON RIGHT */}
            <section className="species-section-box">
              <div className="species-box-header">
                <h2 className="species-box-title">14 Plant Species</h2>
              </div>

              <div className="species-columns-split">
                {/* COLUMN 1 - 7 SPECIES */}
                <div className="species-col">
                 <ol className="species-list">
  {SPECIES_COL_1.map((name, i) => (
    <li key={name} className="species-item">
      <span className="species-num">{i + 1}.</span>

      <div className="species-info">
        <span className="species-common">{name}</span>

        <span className="species-count">
          {DATASET_COUNTS[name]} images
        </span>
      </div>
    </li>
  ))}
</ol>
                </div>

                {/* LIGHT MIDDLE LINE */}
                <div className="species-middle-divider" />

                {/* COLUMN 2 - ANOTHER 7 SPECIES */}
                <div className="species-col">
                 <ol className="species-list" start={8}>
  {SPECIES_COL_2.map((name, i) => (
    <li key={name} className="species-item">
      <span className="species-num">{i + 8}.</span>

      <div className="species-info">
        <span className="species-common">{name}</span>

        <span className="species-count">
          {DATASET_COUNTS[name]} images
        </span>
      </div>
    </li>
  ))}
</ol>
                </div>
              </div>
            </section>

            {/* 3. TRAINING AND VALIDATION ACCURACY GRAPH */}
            <section className="graph-section-box">
              <div className="graph-box-header">
                <h2 className="graph-box-title">Training and Validation Accuracy Graph</h2>
              </div>

              {/* CLICKABLE GRAPH CONTAINER */}
              <div
                className="graph-preview-container"
                onClick={openGraphModal}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openGraphModal();
                }}
                aria-label="Training and Validation Accuracy graph"
              >
                <img
                  src="/accuracy_graph.png"
                  alt="Training and Validation Accuracy Graph"
                  className="graph-img-preview"
                />
              </div>
            </section>

          </div>
        </main>
      ) : (

        /* ============================================================ */
        /* 2. CLASSIFIER / UPLOAD & RESULT VIEW                         */
        /* ============================================================ */
        !result || !preview ? (
          <main className="layout">
            <section className="specimen">
              <div
                className={"drop" + (dragging ? " over" : "") + (loading ? " uploading" : "")}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (!loading) choose(e.dataTransfer.files[0]);
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
                  disabled={loading}
                  onClick={() => inputRef.current?.click()}
                >
                  {loading ? "Analyzing image..." : "Choose image"}
                </button>

                {error && (
                  <p className="error" role="alert" style={{ marginTop: "16px" }}>
                    {error}
                  </p>
                )}
              </div>
            </section>
          </main>
        ) : (
          /* RESULT PAGE: INPUT PIC ON LEFT, DETAILS ON RIGHT */
          <main className="result-page">
            <div className="result-card">

              {/* LEFT - INPUT PICTURE */}
              <div className="result-image-section">
                <div className="photo-container">
                  <img
                    className="result-photo"
                    src={preview}
                    alt={file?.name ? `Uploaded specimen: ${file.name}` : "Uploaded plant"}
                  />
                </div>
              </div>

              {/* RIGHT - OTHER DETAILS */}
              <div className="result-details">
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}

                {best && (
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
        )
      )}

      {/* ============================================================ */}
      {/* 3. 7-SECOND ACCURACY GRAPH MODAL POPUP                       */}
      {/* ============================================================ */}
      {graphModalOpen && (
        <div className="graph-modal-backdrop" onClick={closeGraphModal}>
          <div
            className="graph-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Training and Validation Accuracy Graph"
          >
            {/* MODAL HEADER */}
            <div className="graph-modal-top">
              <span className="graph-modal-title">Training and Validation Accuracy</span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeGraphModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* GRAPH IMAGE */}
            <div className="graph-modal-image-wrapper">
              <img
                src="/accuracy_graph.png"
                alt="Training and Validation Accuracy Graph"
                className="graph-modal-img"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. TEST CASES FOOTER                                           */}
      {/* ============================================================ */}
{!result && !preview && activeTab === "classifier" && (
  <footer className="test-cases-footer">
    <span className="test-cases-title">Test Cases:</span>

    <div className="test-case-buttons">
      {[1, 2, 3, 4, 5].map((number) => (
        <button
          key={number}
          type="button"
          className="test-case-btn"
          onClick={() => chooseTestImage(number)}
          disabled={loading}
          aria-label={`Test case ${number}`}
        >
          {number}
        </button>
      ))}
    </div>
  </footer>
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
