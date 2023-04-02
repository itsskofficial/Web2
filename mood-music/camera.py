import cv2
import fer

class VideoCamera(object):
    def __init__(self):
        self.video=cv2.VideoCapture(0)

    def __del__(self):
        self.video.release()

    def get_frame(self):
        ret,self.frame=self.video.read()
        ret,self.jpeg=cv2.imencode('.jpg',self.frame)
        return self.jpeg.tobytes(),self.jpeg

    

    
        