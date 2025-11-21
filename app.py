import base64
import cv2
import numpy as np
import mediapipe as mp
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

def count_fingers(hand_landmarks):
    """
    Analyzes hand landmarks to determine which fingers are open.
    Returns a list of booleans [Thumb, Index, Middle, Ring, Pinky].
    """
    # Tips IDs: Thumb=4, Index=8, Middle=12, Ring=16, Pinky=20
    # PIP IDs (Knuckles): Thumb=2, Index=6, Middle=10, Ring=14, Pinky=18
    
    fingers = []
    
    # Thumb (Logic depends on hand orientation, simplifying for right hand logic usually)
    # Check if tip is to the right/left of the knuckle depending on hand side
    # For simplicity here, we check x-coordinates relative to the wrist
    if hand_landmarks.landmark[4].x > hand_landmarks.landmark[3].x:
        fingers.append(True)
    else:
        fingers.append(False)

    # 4 Fingers (Check if Tip y is lower than PIP y - remember y increases downwards in images)
    for id in [8, 12, 16, 20]:
        if hand_landmarks.landmark[id].y < hand_landmarks.landmark[id - 2].y:
            fingers.append(True)
        else:
            fingers.append(False)
            
    return fingers

def detect_gesture(fingers):
    """
    Maps finger patterns to words.
    Fingers array: [Thumb, Index, Middle, Ring, Pinky]
    """
    # Logic: True = Finger Up, False = Finger Down
    
    if fingers == [False, False, False, False, False]:
        return "Fist / Rock"
    
    elif fingers == [True, True, True, True, True]:
        return "Hello / Stop"
    
    elif fingers == [False, True, True, False, False]:
        return "Peace / Victory"
    
    elif fingers == [True, True, False, False, True]:
        return "I Love You"
    
    elif fingers == [False, True, False, False, False]:
        return "One"
        
    elif fingers == [True, False, False, False, True]:
        return "Call Me"
    
    elif fingers == [True, True, False, False, False]:
        return "Gun / Point"

    else:
        return "Scanning..."

@app.route('/')
def index():
    return render_template('index.html')

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

        # Convert BGR to RGB for MediaPipe
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = hands.process(img_rgb)
        
        message = "No Hand Detected"
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Analyze fingers
                fingers_status = count_fingers(hand_landmarks)
                # Detect Gesture
                message = detect_gesture(fingers_status)
                
        return jsonify({'prediction': message})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'prediction': "Error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)