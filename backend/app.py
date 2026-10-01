"""Flask API and React frontend server for Plant Species Identification."""

import io
import os

import numpy as np
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import keras

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

MODEL_PATH = os.path.join(BASE_DIR, "plant_species_model.keras")
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend", "dist")

IMG_SIZE = (224, 224)

CLASS_NAMES = [
    "aloevera",
    "banana",
    "coconut",
    "corn",
    "cucumber",
    "ginger",
    "guava",
    "mango",
    "melon",
    "orange",
    "paddy",
    "papaya",
    "pineapple",
    "watermelon",
]

DISPLAY_NAMES = {
    "aloevera": "Aloe vera"
}

app = Flask(__name__)
CORS(app)

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

print("Loading model...")
model = keras.models.load_model(MODEL_PATH)
print("Model ready.")


def pretty(name):
    return DISPLAY_NAMES.get(name, name.capitalize())


def preprocess(file_bytes):
    img = Image.open(
        io.BytesIO(file_bytes)
    ).convert("RGB").resize(
        IMG_SIZE,
        Image.BILINEAR
    )

    return np.expand_dims(
        np.asarray(img, dtype="float32"),
        axis=0
    )


@app.get("/api/health")
def health():
    return jsonify(
        status="ok",
        classes=[pretty(c) for c in CLASS_NAMES]
    )


@app.post("/api/predict")
def predict():
    file = request.files.get("image")

    if file is None or file.filename == "":
        return jsonify(
            error="No image uploaded. Choose a JPG or PNG file."
        ), 400

    try:
        batch = preprocess(file.read())

    except (UnidentifiedImageError, OSError):
        return jsonify(
            error="That file isn't a readable image. Try a JPG or PNG."
        ), 400

    probs = model.predict(batch, verbose=0)[0]

    top = np.argsort(probs)[::-1][:3]

    predictions = [
        {
            "label": pretty(CLASS_NAMES[i]),
            "confidence": round(float(probs[i]) * 100, 2)
        }
        for i in top
    ]

    return jsonify(
        prediction=predictions[0],
        top3=predictions
    )


@app.get("/")
def serve_frontend():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/<path:path>")
def serve_static(path):
    file_path = os.path.join(FRONTEND_DIR, path)

    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, path)

    return send_from_directory(FRONTEND_DIR, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
