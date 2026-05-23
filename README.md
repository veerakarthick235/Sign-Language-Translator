# AI Sign Language Translator — SignLens

A **SaaS-level** real-time hand gesture recognition web app built with **Python (Flask)**, **OpenCV**, **MediaPipe**, and a premium **HTML/CSS/JS** frontend.

## ✨ Features

- 🚀 **Premium Landing Page** with animated hero, feature cards, and CTA
- ✋ **Real-Time AI Detection** — MediaPipe 21-point hand landmark model
- 🎯 **14+ Gestures** with confidence scoring (High / Medium / Low)
- 🔊 **Text-to-Speech** — detected gestures spoken aloud via Web Speech API
- 📊 **Analytics Dashboard** — session stats, gesture frequency chart, session timer
- 🕐 **Translation History** — last 20 translations tracked per session
- 📚 **Gesture Library** — filterable visual guide for all supported signs
- ⌨️ **Keyboard Shortcuts** — Space, S, M, T, F
- 💾 **Snapshot Download** — save camera frames with flash effect
- 🔒 **100% Private** — all processing local, no data leaves your device

## 📂 Project Structure

```
Sign-Language-Translator/
├── app.py                  # Flask backend + MediaPipe logic
├── requirements.txt        # Dependencies
├── README.md
├── static/
│   ├── css/
│   │   ├── main.css        # Global design system (tokens, navbar, buttons)
│   │   ├── landing.css     # Landing page styles
│   │   └── app.css         # Translator app & gesture library styles
│   ├── js/
│   │   ├── app.js          # Camera, TTS, keyboard shortcuts, history
│   │   └── analytics.js    # Frequency tracking & chart rendering
│   └── img/
│       └── hero-bg.png     # AI-generated hero background
└── templates/
    ├── base.html           # Shared Jinja2 layout (nav, footer)
    ├── index.html          # Landing page
    ├── app.html            # Main translator app
    └── gestures.html       # Gesture library
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
python app.py

# 3. Open in browser
http://localhost:5000
```

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, demo |
| `/app` | Main real-time translator |
| `/gestures` | Visual gesture library (filterable) |
| `/api/gestures` | JSON API — full gesture list |
| `/history` | JSON API — session translation history |
| `/process_frame` | POST — process webcam frame |

## ✋ Supported Gestures

| Gesture | Emoji | Category |
|---------|-------|----------|
| Hello / Stop | ✋ | Common |
| Fist / Rock | ✊ | Common |
| Peace | ✌️ | Common |
| I Love You | 🤟 | Emotional |
| One | ☝️ | Numbers |
| Two | ✌️ | Numbers |
| Three | 🤟 | Numbers |
| Four | 🖖 | Numbers |
| Call Me | 🤙 | Common |
| Thumbs Up | 👍 | Emotional |
| Thumbs Down | 👎 | Emotional |
| Point / Gun | 👆 | Common |
| OK | 👌 | Common |
| Rock On | 🤘 | Common |

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start / Stop camera |
| `S` | Save snapshot |
| `M` | Toggle mirror |
| `T` | Toggle voice (TTS) |
| `F` | Toggle fullscreen |

## 🔧 Technologies

- **Backend**: Flask, Flask-CORS, Flask-Session
- **AI**: MediaPipe Hands, OpenCV, NumPy
- **Frontend**: Vanilla HTML5/CSS3/JavaScript
- **Fonts**: Google Fonts (Inter, Space Grotesk)
- **Voice**: Web Speech API (browser native)
