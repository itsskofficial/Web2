from camera import *
from cv2 import *
from time import *
from datetime import *


def generate_camera(camera):
    end_time = datetime.now() + timedelta(seconds=5)
    while datetime.now() < end_time:
        frame,image = camera.get_frame()
        yield (b"--frame\r\n" b"Content-Type:image/jpeg\r\n\r\n" + frame + b"\r\n\r\n")
    dominant_emotion=recognize_emotions(image)
    return_emotion(dominant_emotion)
     

def recognize_emotions(frame):
    emo_detector=fer.FER(mtcnn=True)
    dominant_emotion=emo_detector.top_emotion(frame)
    return dominant_emotion

def return_emotion(dominant_emotion):
    yield dominant_emotion

#def playlist(dominant_emotion):
   # if dominant_emotion=="Anger":

        