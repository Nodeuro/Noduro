import cv2
import base64
# # import os, sys, subprocess
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Change the parameter to the video source you want to capture from
def convert_stream(image):
    # print(base64.b64encode(cv2.imencode('.png', image)[1].tobytes()).decode('ascii'))
while True:
    # Read a frame from the VideoCapture
    ret, frame = cap.read()
    convert_stream(frame)
    # Encode the frame to base64
    cv2.imshow('frame', frame)
    cv2.waitKey(1)
    # Print the encoded image data
    # Send the encoded frame over the WebSocket connection
