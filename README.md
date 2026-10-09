# Plant Species Identification Using CNN

React (Vite) frontend + Flask backend serving your MobileNetV2 model (`plant_species_model.keras`).
Recognises 14 plants: aloe vera, banana, coconut, corn, cucumber, ginger, guava, mango, melon,
orange, paddy, papaya, pineapple, watermelon.

link:- https://plant-species-identification-suw0.onrender.com
colab link :- https://colab.research.google.com/drive/1C6uil2_RrzzTN9F2Lnh9UC82pd6u6sHf?usp=sharing

## Requirements
- Python 3.10–3.13
- Node.js 18+

## 1. Start the backend (terminal 1)
```
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python app.py
```
Runs at http://127.0.0.1:5000 (the first start takes a few seconds to load the model).

## 2. Start the frontend (terminal 2)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## API
- `GET  /api/health`  -> status and class list
- `POST /api/predict` -> multipart field `image`; returns `{ prediction, top3 }`

## Notes
- The model contains its own `Rescaling(1/255)` layer, so the backend sends raw 0-255 pixels.
  Do not divide by 255 in `app.py`.
- If you retrain with different classes, update `CLASS_NAMES` in `backend/app.py`
  (alphabetical order, same as your dataset folders) and the `PLANTS` list in `frontend/src/App.jsx`.
