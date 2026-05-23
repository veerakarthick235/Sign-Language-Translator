import base64
import cv2
import numpy as np
import mediapipe as mp
import os
import random
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

# ─────────────────────────────────────────────────────────────
# MediaPipe Initialization
# ─────────────────────────────────────────────────────────────
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils

# ─────────────────────────────────────────────────────────────
# Full Gesture Dictionary (for API & library page)
# ─────────────────────────────────────────────────────────────
GESTURE_LIBRARY = [
    {"id": "hello",     "name": "Hello / Stop",  "emoji": "✋", "pattern": "All 5 fingers open",           "category": "Common"},
    {"id": "fist",      "name": "Fist / Rock",   "emoji": "✊", "pattern": "All fingers curled",            "category": "Common"},
    {"id": "peace",     "name": "Peace",          "emoji": "✌️", "pattern": "Index & Middle up",            "category": "Common"},
    {"id": "iloveyou",  "name": "I Love You",    "emoji": "🤟", "pattern": "Thumb, Index & Pinky up",      "category": "Emotional"},
    {"id": "one",       "name": "One",            "emoji": "☝️", "pattern": "Only index finger up",         "category": "Numbers"},
    {"id": "two",       "name": "Two",            "emoji": "✌️", "pattern": "Index & Middle up, no thumb", "category": "Numbers"},
    {"id": "three",     "name": "Three",          "emoji": "🤟", "pattern": "Index, Middle & Ring up",     "category": "Numbers"},
    {"id": "four",      "name": "Four",           "emoji": "🖖", "pattern": "All except thumb",             "category": "Numbers"},
    {"id": "callme",    "name": "Call Me",        "emoji": "🤙", "pattern": "Thumb & Pinky up",             "category": "Common"},
    {"id": "thumbsup",  "name": "Thumbs Up",     "emoji": "👍", "pattern": "Only thumb up",                "category": "Emotional"},
    {"id": "thumbsdown","name": "Thumbs Down",   "emoji": "👎", "pattern": "Only thumb down",              "category": "Emotional"},
    {"id": "point",     "name": "Point / Gun",   "emoji": "👆", "pattern": "Thumb & Index up",             "category": "Common"},
    {"id": "ok",        "name": "OK",             "emoji": "👌", "pattern": "Thumb & Index circle",         "category": "Common"},
    {"id": "rock",      "name": "Rock On",        "emoji": "🤘", "pattern": "Index & Pinky up",             "category": "Common"},
]

# ─────────────────────────────────────────────────────────────
# Finger State Detection
# ─────────────────────────────────────────────────────────────
def count_fingers(hand_landmarks):
    """
    Returns a list of booleans [Thumb, Index, Middle, Ring, Pinky].
    True = finger is extended/up.
    """
    fingers = []

    # Thumb: compare tip (4) vs joint (3) on x-axis
    if hand_landmarks.landmark[4].x > hand_landmarks.landmark[3].x:
        fingers.append(True)
    else:
        fingers.append(False)

    # Four fingers: compare tip y vs PIP y (lower y = higher on screen)
    for tip_id in [8, 12, 16, 20]:
        if hand_landmarks.landmark[tip_id].y < hand_landmarks.landmark[tip_id - 2].y:
            fingers.append(True)
        else:
            fingers.append(False)

    return fingers


def is_thumb_down(hand_landmarks):
    """Check if thumb is pointing downward (tip below wrist)."""
    tip = hand_landmarks.landmark[4]
    wrist = hand_landmarks.landmark[0]
    return tip.y > wrist.y and tip.x > hand_landmarks.landmark[3].x


def is_ok_gesture(hand_landmarks):
    """Detect OK gesture: thumb tip close to index tip."""
    thumb_tip = hand_landmarks.landmark[4]
    index_tip = hand_landmarks.landmark[8]
    dist = abs(thumb_tip.x - index_tip.x) + abs(thumb_tip.y - index_tip.y)
    return dist < 0.07


# ─────────────────────────────────────────────────────────────
# Gesture Classification
# ─────────────────────────────────────────────────────────────
def detect_gesture(fingers, hand_landmarks):
    """
    Maps finger pattern to gesture name + confidence score.
    Returns (gesture_name: str, confidence: float)
    """
    T, I, M, R, P = fingers  # Thumb, Index, Middle, Ring, Pinky

    # Check OK first (special distance-based gesture)
    if is_ok_gesture(hand_landmarks):
        return "OK", 0.91

    # All fingers down → Fist
    if fingers == [False, False, False, False, False]:
        return "Fist / Rock", 0.97

    # All fingers up → Hello/Stop
    if fingers == [True, True, True, True, True]:
        return "Hello / Stop", 0.96

    # Peace / Victory
    if fingers == [False, True, True, False, False]:
        return "Peace", 0.95

    # I Love You (ASL)
    if fingers == [True, True, False, False, True]:
        return "I Love You", 0.94

    # Thumbs Down (special check)
    if fingers == [True, False, False, False, False] and is_thumb_down(hand_landmarks):
        return "Thumbs Down", 0.88

    # Thumbs Up
    if fingers == [True, False, False, False, False]:
        return "Thumbs Up", 0.92

    # One — index only
    if fingers == [False, True, False, False, False]:
        return "One", 0.95

    # Two (no thumb)
    if fingers == [False, True, True, False, False]:
        return "Two", 0.90

    # Three
    if fingers == [False, True, True, True, False]:
        return "Three", 0.90

    # Four (all but thumb)
    if fingers == [False, True, True, True, True]:
        return "Four", 0.91

    # Call Me (Shaka)
    if fingers == [True, False, False, False, True]:
        return "Call Me", 0.93

    # Point / Gun
    if fingers == [True, True, False, False, False]:
        return "Point / Gun", 0.89

    # Rock On
    if fingers == [False, True, False, False, True]:
        return "Rock On", 0.88

    return "Scanning...", 0.0


# ─────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/app')
def app_page():
    return render_template('app.html')


@app.route('/gestures')
def gestures_page():
    return render_template('gestures.html', gestures=GESTURE_LIBRARY)


@app.route('/api/gestures')
def api_gestures():
    """Returns the full gesture library as JSON."""
    return jsonify({'gestures': GESTURE_LIBRARY, 'count': len(GESTURE_LIBRARY)})


@app.route('/history')
def get_history():
    """Returns the current session's gesture history."""
    history = session.get('history', [])
    return jsonify({'history': history, 'total': len(history)})


@app.route('/clear_history', methods=['POST'])
def clear_history():
    """Clears the current session's gesture history."""
    session['history'] = []
    return jsonify({'status': 'cleared'})


@app.route('/process_frame', methods=['POST'])
def process_frame():
    try:
        data = request.json
        image_data = data['image']

        # Decode base64 image
        header, encoded = image_data.split(",", 1)
        binary_data = base64.b64decode(encoded)
        image_array = np.frombuffer(binary_data, dtype=np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'prediction': 'Error', 'confidence': 0.0}), 400

        # Convert BGR → RGB for MediaPipe
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)

        prediction = "No Hand Detected"
        confidence = 0.0

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                fingers_status = count_fingers(hand_landmarks)
                prediction, confidence = detect_gesture(fingers_status, hand_landmarks)

        # Save to session history (only meaningful gestures)
        if prediction not in ("No Hand Detected", "Scanning...", "Error"):
            history = session.get('history', [])
            entry = {
                'gesture': prediction,
                'confidence': round(confidence * 100),
                'timestamp': datetime.now().strftime('%H:%M:%S')
            }
            # Avoid duplicate consecutive entries
            if not history or history[-1]['gesture'] != prediction:
                history.append(entry)
                if len(history) > 20:
                    history = history[-20:]
                session['history'] = history

        return jsonify({
            'prediction': prediction,
            'confidence': round(confidence * 100),
        })

    except Exception as e:
        print(f"[ERROR] process_frame: {e}")
        return jsonify({'prediction': 'Error', 'confidence': 0}), 500


# ─────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(
        debug=True,
        port=5000,
        use_reloader=True,
        reloader_type='stat',         # Use stat-based reloader instead of watchdog
        extra_files=[],               # No extra files to watch beyond the app itself
    )
