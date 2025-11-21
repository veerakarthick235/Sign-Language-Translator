# AI Sign Language Translator

A real-time hand gesture recognition system built using **Python (Flask)**, **OpenCV**, **MediaPipe**, and a lightweight **HTML/JS frontend**.  
The application captures webcam frames, detects hand landmarks, and translates them into text-based gesture predictions.

## 📌 Features

- Real-time webcam-based hand tracking  
- MediaPipe-powered 21-point hand landmark detection  
- Heuristic gesture classification for common static signs  
- Flask backend API (`/predict`)  
- Browser-based interface with automatic frame streaming  
- Low-latency communication using base64 frames (AJAX)

## 📂 Project Structure

```
sign-language-app/
├── app.py                 # Flask backend + MediaPipe logic
├── requirements.txt       # Dependencies
├── README.md              # Documentation
└── templates/
    └── index.html         # Frontend UI with webcam handling
```

## 🚀 Requirements

- Python **3.7+**
- A working **webcam**
- pip (Python package manager)

## 🛠️ Installation

1. Download or clone the project folder.  
2. Open a terminal in the project directory.  
3. Install dependencies:

```
pip install -r requirements.txt
```

## ▶️ Running the Application

Start the Flask server:

```
python app.py
```

If successful, you will see:

```
Running on http://127.0.0.1:5000
```

Open the application in your browser:

```
http://127.0.0.1:5000
```

Allow camera access when prompted.

## ✋ Supported Gestures (Heuristic-Based)

| Gesture      | Meaning       | Pattern Description                     |
|--------------|--------------|------------------------------------------|
| Open Palm    | Hello/Stop   | All 5 fingers open                       |
| Fist         | Fist/Rock    | All fingers curled                       |
| V Sign       | Peace        | Index & Middle up                        |
| I Love You   | Spider-Man   | Thumb, Index & Pinky up                  |
| Index Up     | One          | Only index finger up                     |
| Shaka        | Call Me      | Thumb & Pinky up                         |
| Thumb Up     | Like         | Thumb up, others curled                  |
| Rock On      | Rock Gesture | Index & Pinky up                         |
| Three        | Number 3     | Index, Middle, Ring up                   |
| Four         | Number 4     | All except Thumb                         |

## ❓ Troubleshooting

### Backend Disconnected
- Ensure `python app.py` is running  
- Confirm `http://127.0.0.1:5000` is correct  

### Camera Not Working
- Close other camera apps  
- Refresh page  
- Allow camera permissions  

### Jittery or Inaccurate Detection
- Improve lighting  
- Keep hand centered  
- Maintain moderate distance  

## 🔧 Technologies Used

- Flask  
- MediaPipe  
- OpenCV  
- JavaScript  

## 📌 Notes
Gesture detection uses rule-based heuristics; accuracy can be improved with a trained ML model.
