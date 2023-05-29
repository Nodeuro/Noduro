import threading
# import necessary packages
import cv2
import numpy as np 
import mediapipe as mp
import os
import time
import math
import matplotlib.cm 
import modeling.gesture.pose_manipulation.training_points as points
from typing import Union
import modeling.gesture.eye_tracking as eye_tracking
import noduro
import noduro_code.read_settings as read_settings
# main class for all gesture tracking related things
import modeling.gesture.pose_manipulation.pose_standardizer as standardize
import matplotlib.pyplot as plt
import modeling.gesture.check_distance as check_distance
from modeling.gesture.gesture_tracker_timing_study import gesture_timing
import multiprocessing as multiprocess
import sys
import json
import pickle
"""a base class that takes videos, as either a video file or through a capture. 
Base gestures are derived from mediapipe's Holistic, Hand, Pose, and Face Mesh modules. 
The gesture class doesn't need to use holistic, but it is strongle recommended.{}
The class takes a frameskip feature, that skips analysis to maximize frame per second whilst maintaining gesture analysis.
By default, propietary points are tracked as opposed to all of them, with selected values being chosen to maximize runtime viability whilst maninting accuracy.
The start, stop, and while procesing functions all serve as placeholders for subclasses to allow for added functionality within the gesture tracking base, as it is a closed loop process without such options"""
import base64     

class realtime_gesture_tracker(gesture_timing):
    def __init__(self, confidence: float = 0.7, frameskip=False, app_settings=None, use_newest : str = None):
        super().__init__(eye = True, face = True, hand = True, pose = True, eye_confidence = confidence, face_confidence = confidence, hand_confidence = confidence, pose_confidence = confidence, number_of_hands = 2, frameskip = frameskip, app_settings = app_settings)
        self.settings, _ = read_settings.get_settings()
        self.default_folder = self.settings["filesystem"]["model_storage"] #in settings
        self.default_folder = noduro.subdir_path(self.default_folder)
        self.models = sorted(os.listdir(self.default_folder))
        self.gpd = standardize.flatten_gesture_point_dict_to_list(self.gesture_point_dict)
        if use_newest is None:
            selected_model = noduro.get_dir_files(noduro.join(self.default_folder,self.models[-1]))
        else:
            try:
                ind = self.models.index(use_newest)
                selected_model = noduro.get_dir_files(noduro.join(self.default_folder,self.models[ind]))
            except:
                raise ValueError("folder not found in the models. Please try again.")
        self.selected_model = {
            "lr" : [pickle.load(open(i,"rb")) for i in selected_model if "lr.pkl" in i][0],
            "rc" : [pickle.load(open(i,"rb")) for i in selected_model if "rc.pkl" in i][0],
            "rf" : [pickle.load(open(i,"rb")) for i in selected_model if "rf.pkl" in i][0],
            "gb" : [pickle.load(open(i,"rb")) for i in selected_model if "gb.pkl" in i][0]
        }
        self.gesture_thread = threading.Thread(target=self.process_gesture, args=())
        self.gesture_thread.daemon = True
        self.gesture_thread.start()
        self.gesture_result = None
        self.gesture_lock = threading.Lock()

    def process_gesture(self):
        while True:
            if hasattr(self, "processed_frame") and "holistic" in self.processed_frame:
                if self.processed_frame["holistic"].pose_landmarks == None or self.processed_frame["holistic"].face_landmarks == None:
                    continue
                process_start = time.time()                
                stand, distance = standardize.center_and_scale_from_raw(standardize.convert_holistic_to_dict(self.processed_frame["holistic"]), self.gesture_point_dict)
                row = standardize.fill_nans_with_imputer_for_sklearn_regression(stand, False)
                gest = None
                proba = None
                for name, model in self.selected_model.items():
                    body_language_class = model.predict(row)[0]
                    try:
                        body_language_prob = model.predict_proba(row)[0]
                        if proba is None:
                            proba = body_language_prob
                            gest = list(np.zeros(proba.shape))
                        else:
                            proba += body_language_prob
                        gest[np.argmax(proba)] = body_language_class
                    except:
                        pass
                with self.gesture_lock:
                    self.gesture_result = [gest[np.argmax(proba)],np.max(proba)]
                process_end = time.time()
                if process_end-process_start < 3:
                    time.sleep(3-(process_end-process_start))
                # print("gesture processed", self.gesture_result, process_end-process_start)

    def while_processing(self, frame,process):
        if process:
            with self.gesture_lock:
                gesture_result = self.gesture_result
            if gesture_result is not None:
                self.etc["send_to_js"]["gesture"] = gesture_result
            return frame
if __name__ == '__main__':

        # Now you can use the dictionary as needed
    a = realtime_gesture_tracker(frameskip = True)

    # Parse the message as JSON
    
    a.averages = {}
    a.realtime_analysis()

