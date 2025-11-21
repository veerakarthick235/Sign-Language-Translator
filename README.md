AI Sign Language Translator

A real-time hand gesture recognition system built with Python (Flask), OpenCV, MediaPipe, and HTML/JS. This application uses computer vision to detect hand landmarks via a webcam and translates them into text based on geometric rules.

📂 Project Structure

sign-language-app/
├── app.py                 # Flask backend server & Computer Vision logic
├── requirements.txt       # Python dependencies
├── README.md              # Documentation
└── templates/
    └── index.html         # Frontend UI (Camera & Results)


🚀 Prerequisites

Python 3.7+ installed on your machine.

A working Webcam.

🛠️ Installation & Setup

Clone or Download this repository/folder.

Open your terminal or command prompt in the project folder.

Install Dependencies:

pip install -r requirements.txt


▶️ How to Run

Start the Backend Server:
Run the following command in your terminal:

python app.py


You should see output indicating the server is running on http://127.0.0.1:5000.

Open the Application:
Open your web browser (Chrome/Firefox recommended) and navigate to:
http://127.0.0.1:5000

Grant Permissions:
Allow the browser to access your webcam when prompted.

✋ Supported Gestures

The system currently recognizes the following static gestures:

Gesture

Action/Meaning

Description

Open Palm

Hello / Stop

All 5 fingers open

Fist

Fist / Rock

All fingers curled

V Sign

Peace

Index & Middle fingers up

Spider-Man

I Love You

Thumb, Index & Pinky up

Index Up

One

Only Index finger up

Shaka

Call Me

Thumb & Pinky up

Thumb Up

Thumbs Up

Thumb out, others curled

Rock On

Rock On

Index & Pinky up

Three

Three

Index, Middle, Ring up

Four

Four

All fingers up except Thumb

❓ Troubleshooting

"Backend Disconnected" / "Offline"

Ensure the terminal running python app.py is still open and hasn't crashed.

Ensure you are accessing the site via http://127.0.0.1:5000.

Camera not working

Check if another application (Zoom, Teams) is using the camera.

Ensure you clicked "Allow" on the browser permission popup.

Try refreshing the page.

Detection is jittery or inaccurate

Ensure your hand is well-lit.

Keep your hand within the frame.

The logic currently assumes the right hand for specific thumb orientation checks, but works generally for both hands for vertical finger counts.

🔧 Technologies Used

Flask: Web framework for serving the app and API.

MediaPipe: Google's ML framework for hand tracking.

OpenCV: Image processing.

JavaScript (Fetch API): Sending video frames to the server asynchronously.
