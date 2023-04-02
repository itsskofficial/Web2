from cv2 import *
from flask import *
from matplotlib import *
from camera import *
from functions import *

app= Flask (__name__)

@app.route('/')
def home_page():
    return render_template("index.html")

@app.route('/videocamera')
def video_feed():
    return Response(generate_camera(VideoCamera()),mimetype='multipart/x-mixed-replace; boundary=frame')
def return_emotion():
    return Response(return_emotion())

@app.route('/capture')
def capture_page():
    return render_template("capture.html")

if __name__=="__main__":
    app.run(debug=True, port=5000)