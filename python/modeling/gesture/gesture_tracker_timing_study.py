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
from modeling.gesture.gesture_base import gesture_base
import multiprocessing as multiprocess
import sys
import json
"""a base class that takes videos, as either a video file or through a capture. 
Base gestures are derived from mediapipe's Holistic, Hand, Pose, and Face Mesh modules. 
The gesture class doesn't need to use holistic, but it is strongle recommended.{}
The class takes a frameskip feature, that skips analysis to maximize frame per second whilst maintaining gesture analysis.
By default, propietary points are tracked as opposed to all of them, with selected values being chosen to maximize runtime viability whilst maninting accuracy.
The start, stop, and while procesing functions all serve as placeholders for subclasses to allow for added functionality within the gesture tracking base, as it is a closed loop process without such options"""
import base64     
# encoded_frames = multiprocess.Queue()
# def encode_and_send_frame(image, output_queue):
#     output_queue.put(image)
# def send_to_js(lock, input_queue):
#     lock.acquire()
#     try:
#         while True:
#             not_encoded_frame = input_queue.get()
#             # Do whatever processing you need with the encoded frame
#             print(base64.b64encode(cv2.imencode('.jpg', not_encoded_frame)[1].tobytes()).decode('ascii'))
#     finally:
#         lock.release()
class gesture_tracker(gesture_base):
    def draw_holistic(self, frame, results, scalar = 1): #run the drawing algorithms
        # self.draw_face_proprietary(frame, results.face_landmarks, False,scalar)
        self.draw_pose_proprietary(frame, results.pose_landmarks, False,scalar)
        self.draw_hands_proprietary(frame, results.left_hand_landmarks, results.right_hand_landmarks, False,scalar)
        if results.face_landmarks is not None and results.pose_landmarks is not None:
            frame,displays, focus =  self.eyes(frame, results)
            if displays is not None:
                self.etc["screen_elements"] = displays
            self.etc["focus"] = np.round(focus,3)
        return frame
    
    def eyes(self, frame, landmarks):
        image_rows, image_cols, _ = frame.shape
        face_list, pose_list = eye_tracking.landmarks_to_lists(landmarks)
        right_iris = self.gesture_point_dict["face"]["right_iris"]
        left_iris = self.gesture_point_dict["face"]["left_iris"]
        chest = self.gesture_point_dict["pose"]["chest"]
        nose_line = self.gesture_point_dict["face"]["nose_line"]
        right_iris_list = np.array([list(self._normalized_to_pixel_coordinates(land.x, land.y, image_cols, image_rows)) for index, land in enumerate(face_list.landmark) if index in right_iris]) #rewrite to index with right iris
        left_iris_list = np.array([list(self._normalized_to_pixel_coordinates(land.x, land.y, image_cols, image_rows)) for index, land in enumerate(face_list.landmark) if index in left_iris]) #rewrite
        chest_list = np.array([list(self._normalized_to_pixel_coordinates_3d(land.x, land.y, land.z, image_cols, image_rows)) for index, land in enumerate(pose_list.landmark) if index in chest]) #rewrite
        nose_list = np.array([list(self._normalized_to_pixel_coordinates(land.x, land.y, image_cols, image_rows)) for index, land in enumerate(face_list.landmark) if index in nose_line]) #rewrite

        frame, display_string, focus = eye_tracking.focus_tracking(left_iris_list,right_iris_list,chest_list,nose_list, frame)
        return frame, display_string, focus

    def per_frame_analysis(self, frame, show_final : bool = True, video_scalar = 1):
        frame.flags.writeable = False #save speed
        # frame = cv2.flip(frame, 1)
        # framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        framergb_smaller = cv2.cvtColor(cv2.resize(frame, (0, 0), fx=video_scalar, fy=video_scalar), cv2.COLOR_BGR2RGB) 
        self.track[self.etc["frame_index"]]["convert"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
        frame.flags.writeable = True #so you can fix image
        if self.tracking_or_not["hand"] and self.tracking_or_not["pose"] and self.tracking_or_not["face"]: #holistic
            self.processed_frame["holistic"] = self.model_and_solution["holistic_model"].process(framergb_smaller) #run holistic model
            # # print(1/(time.time() - a))
            self.visibilty_dict = {"left_hand" : self.processed_frame["holistic"].left_hand_landmarks is not None, "right_hand" : self.processed_frame["holistic"].right_hand_landmarks is not None, "pose": self.processed_frame["holistic"].pose_landmarks is not None, "face" : self.processed_frame["holistic"].face_landmarks is not None} #check if any is none
        else:
            if self.tracking_or_not["hand"]:
                self.processed_frame["hand"] = self.model_and_solution["hand_model"].process(framergb_smaller)
                self.visibilty_dict["left_hand"] = self.processed_frame["hand"].left_hand_landmarks is not None
                self.visibilty_dict["right_hand"] = self.processed_frame["right_hand"].right_hand_landmarks is not None
            if self.tracking_or_not["pose"]:
                self.processed_frame["pose"] = self.model_and_solution["pose_model"].process(framergb_smaller)
                self.visibilty_dict["pose"] = self.processed_frame["pose"].pose_landmarks is not None
            if self.tracking_or_not["face"]:
                self.processed_frame["face"] = self.model_and_solution["face_model"].process(framergb_smaller)
                self.visibilty_dict["face"] = self.processed_frame["face"].face_landmarks is not None
        self.get_timer()
        self.process_frame = frame #frame post processing(could have drawing points in it as well)
        self.track[self.etc["frame_index"]]["processing"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
        return frame

    def draw_on_screen(self,frame, texts : list):
        if "h" not in self.etc:
            self.etc["scalar"] =  int(np.round(frame.shape[0]/800))
            _, self.etc["h"] = cv2.getTextSize("a", cv2.FONT_HERSHEY_PLAIN, 2*self.etc["scalar"], self.etc["scalar"])[0]
        h1 = 1.4*self.etc["h"]
        w = self.etc["h"]/2
        for text in texts:
            cv2.putText(frame, text, np.int32([self.etc["h"]/2,h1]), cv2.FONT_HERSHEY_PLAIN, 2*self.etc["scalar"], (255, 255, 255), self.etc["scalar"], cv2.LINE_AA)
            h1 += 1.3*self.etc["h"]
        return frame
    
    def looping_analysis(self, videoCapture : object, video_shape = None, fps = None,  result_vid : str = None, starting_vid: str = None, frame_skip : int = None, video_scalar : float = None,  save_pose : bool = False, standardize_pose : bool = False, save_frames = False):
        self.processed_frame = {}
        self.visibilty_dict = {}
        if fps is None:
            fps = 30
        _, frame = videoCapture.read()

        #frame_skip
        if frame_skip is None:
            frame_skip = self.etc["frame_skip"] #recommended frame skip vs set value
        if video_scalar is None:
            video_scalar = self.etc["video_scalar"]
        self.etc["frame_skip_in_situ"] = frame_skip #frame skip in situ
        if video_shape is None:
            video_shape = (frame.shape[1], frame.shape[0])
        video_scalar = np.round(int(video_scalar.split(",")[0])/frame.shape[0],2)
        #video writer objects
        if starting_vid is not None: #whether to make a new video writer
            curr = cv2.VideoWriter(starting_vid, 
                fourcc = self.etc["video_codec"],
                fps = fps,
                frameSize = video_shape,
                isColor = True)
        if result_vid is not None: #whether to make a result video writer
            result = cv2.VideoWriter(result_vid, 
                fourcc = self.etc["video_codec"],
                fps = fps,
                frameSize = video_shape,
                isColor = True)
        #loops
        self.etc["frame_index"] = 0 
        if save_pose:
            self.save_pose = []
        if standardize_pose:
            self.save_calibrated_pose = []
            self.moving_average = []
            try:
                self.etc["moving_average_length"] = int(30/frame_skip)
            except:
                self.etc["moving_average_length"] = 5
        self.etc["frame_index"] = -1
        self.track = {}
        self.etc["elapsed_time"] = time.time()
        # lock = multiprocess.Lock()
        # printing_process = multiprocess.Process(target=send_to_js, args=(lock, encoded_frames))
        # printing_process.start()

        while True:
            self.etc["frame_index"] +=1
            
            # if time.time() - self.etc["elapsed_time"] > 30:
            #     printing_process.terminate()
            #     printing_process = multiprocess.Process(target=send_to_js, args=(encoded_frames,))
            #     printing_process.start()
            #     self.etc["elapsed_time"] = time.time()            
            self.track[self.etc["frame_index"]] = {"start" : time.time()}
            _, frame = videoCapture.read() 
            
            self.track[self.etc["frame_index"]]["read"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
            if frame is None:
                videoCapture.release()
                if result_vid:
                    result.release()
                    # print("result_Release")
                if starting_vid:
                    curr.release()
                    # print("curr_Release")
                cv2.destroyAllWindows()
                break
            if starting_vid: #write frame to the file
                curr.write(frame)
            if "points_size" not in self.etc:
                self.etc["points_size"] = int(np.mean(frame.shape[:2])/150)
            self.track[self.etc["frame_index"]]["boolean"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
            
            if frame_skip != 0 and self.etc["frame_index"] % frame_skip == 0 : #if you want to skip frames
                frame = self.per_frame_analysis(frame, True, video_scalar) #run frame analysis
                _ = self.while_processing(frame,True) #filler for any subclasses
                self.track[self.etc["frame_index"]]["perframe"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
                if _ is not None:
                    frame = _
                if save_pose or standardize_pose:
                    gesture_dic = standardize.convert_holistic_to_dict(self.processed_frame["holistic"])
                if save_pose and save_frames:
                    self.save_pose.append(standardize.filter_body_parts_faster(gesture_dic, self.gpdict_flatten))
                elif save_pose:
                    self.save_pose = standardize.filter_body_parts_faster(gesture_dic, self.gpdict_flatten)
                # closer_or_farther = check_distance.closer_or_farther(_)
                # # print(closer_or_farther)s
                if standardize_pose:
                    try:
                        stand, self.etc["distance"] = standardize.center_and_scale_from_given(gesture_dic, self.gpdict_flatten,self.moving_average)
                        # standardize.display_pose_direct(stand)
                        #if the array isn't long enough, force add
                        if save_pose and save_frames:
                            self.save_calibrated_pose.append(stand)
                        elif save_pose:
                            self.save_calibrated_pose = stand
                        if len(self.moving_average) < self.etc["moving_average_length"]:
                            self.moving_average.append(self.etc["distance"])
                        else:
                            self.moving_average.append(self.etc["distance"])
                            del self.moving_average[0]
                    except:
                        pass
                self.track[self.etc["frame_index"]]["standardize_pose"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
            else:
                _ = self.while_processing(frame,False) #filler for any subclasses
                if _ is not None:
                    frame = _
            if "holistic" in self.processed_frame and self.tracking_or_not["hand"] and self.tracking_or_not["pose"] and self.tracking_or_not["face"] and self.draw == True:
                frame = self.draw_holistic(frame, self.processed_frame["holistic"],self.etc["distance"])
            displays = []
            if "fps" in self.etc:
                displays.append("FPS: " + str(self.etc["fps"]))
            if "gesture" in self.etc:
                displays.append(str(self.etc["gesture"][0]) + ", " + str(self.etc["gesture"][1]))
            if "screen_elements" in self.etc:
                displays.extend(self.etc["screen_elements"])
            frame = self.draw_on_screen(frame, displays)
            self.track[self.etc["frame_index"]]["displays"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
            if result_vid: #write the results
                result.write(frame)
            # if "width" not in self.etc:
            #     abc,self.etc["width"],self.etc["height"] = noduro.scale_image_to_window(frame)
            # else:
            #     abc, _, _ =noduro.scale_image_to_window(frame,self.etc["width"],self.etc["height"])
            #Frame displays
            # cv2.imshow("Gesture tracked. Press Q to exit", frame) #show tracking
            # sys.stdout.write(base64.b64encode(cv2.imencode('.jpg', frame)[1].tobytes()).decode('ascii'))
            if "app_settings" in self.etc:
                if self.etc["app_settings"]["flipVideo"] == True:
                    frame =  cv2.flip(frame, 1)
                # if self.etc["app_settings"]["lowLight"] != -1:
                #     frame = np.clip(frame * (1+self.etc["app_settings"]["lowLight"]/10), 0, 255).astype(np.uint8)
            if "focus" in self.etc:
                sys.stdout.write(base64.b64encode(cv2.imencode('.jpg', frame)[1].tobytes()).decode('ascii') + " " + str(self.etc["fps"]) + " " + str(self.etc["focus"]))
            else:
                sys.stdout.write(base64.b64encode(cv2.imencode('.jpg', frame)[1].tobytes()).decode('ascii') +  " " + str(self.etc["fps"]))
            # encode_and_send_frame(frame, encoded_frames)
            self.track[self.etc["frame_index"]]["convert_stream"] = time.time() - self.track[self.etc["frame_index"]]["start"];self.track[self.etc["frame_index"]]["start"] = time.time()
            # cv2.imshow("Gesture tracked. Press Q to exit", frame) #show tracking    
            # cv2.imshow("Gesture tracked. Press Q to exit", cv2.resize(frame,(int(frame.shape[1]/3), int(frame.shape[0]/3)))) #show tracking    
            if cv2.waitKey(1) == ord('q'): #stop everything
                videoCapture.release()
                if result_vid:
                    result.release()
                    # print("result_Release")
                if starting_vid:
                    curr.release()
                    # print("curr_Release")
                cv2.destroyAllWindows()
                break
            self.track[self.etc["frame_index"]]["last"] = time.time()

        self.end(video_scalar) #ending

    def realtime_analysis(self, capture_index : int = 0, save_vid_file  : str = None, save_results_vid_file : str = None, frame_skip = None, analyze = True):
        if capture_index == None:
            capture_index = self.camera_selector() #select camera
        self.capture = cv2.VideoCapture(capture_index, cv2.CAP_DSHOW) #cap_show makes startup alot faster. Starts camera
        if "app_settings" in self.etc:
            self.capture = noduro.set_resolution(self.capture, *self.etc["app_settings"]["resolution"])
        else:
            self.capture = noduro.set_resolution(self.capture, 1920,1080)
        first_frame = True  
        landmarks = None
        self.looping_analysis(videoCapture = self.capture, video_shape = None, fps = None, result_vid = save_results_vid_file, starting_vid = save_vid_file, frame_skip = frame_skip, save_pose = analyze, standardize_pose = analyze, save_frames = analyze)    

    def video_analysis(self, video = None, result_video = None, frame_skip = 1, standardize_pose = True, video_scalar = None):
        if not video:
            video,result_video, = self.file_finder() #get file if not provided
        self.capture = cv2.VideoCapture(video)
        self.vid_info = self.video_dimensions_fps(video)
        self.video_file = video
        self.looping_analysis(self.capture, self.vid_info[0:2], self.vid_info[2], result_video, None, frame_skip = 1, standardize_pose=standardize_pose, video_scalar = video_scalar)
    
    def get_timer(self): #timers to check tracking data
        curr_reference = time.time()
        self.etc["fps"] = np.around(self.etc["frame_skip_in_situ"]/(curr_reference - self.etc["timer"]), 2)
        self.etc["timer"] = curr_reference
        for feature, value in self.visibilty_dict.items():
            if not value:
                if len(self.etc["timers"][feature]) == 0:
                    self.etc["timers"][feature]["start"] = time.time()
                    self.etc["timers"][feature]["previous_elapsed"] = 0 
                elif int(curr_reference - self.etc["timers"][feature]["start"]) > self.etc["timers"][feature]["previous_elapsed"]:
                    self.etc["timers"][feature]["previous_elapsed"] = int(curr_reference - self.etc["timers"][feature]["start"])
                    # print(feature,"time elapsed =", self.etc["timers"][feature]["previous_elapsed"] )
            else:
                if "start" in self.etc["timers"][feature]: #cleans up if face is found after camera starts
                    # print(feature, "detected; breaking wait time for", feature)
                    del self.etc["timers"][feature]["start"]
                    del self.etc["timers"][feature]["previous_elapsed"]
    def end(self, video_scalar):
        
        data = self.track
        averages = {}
        num_entries = len(data)  # Number of entries in the dictionary

        for key in data[0].keys():
            values = [data[i][key] for i in range(num_entries)]
            average = sum(values) / num_entries
            averages[key] = average   
        averages = averages
        self.averages = averages

    def start(self):
        self.gpdict_flatten = standardize.flatten_gesture_point_dict_keys_to_list(self.gesture_point_dict)
if __name__ == '__main__':
    # start = time.time()
    # while True:
    #     # Read a message from the parent process
    #     line = sys.stdin.readline()
    #     if line or time.time() - start > 10:
    #         break

    file = noduro.subdir_path(read_settings.get_settings()[0]["filesystem"]["app_user_settings"])
    if os.stat(file).st_size == 0:
        file = noduro.subdir_path(read_settings.get_settings()[0]["filesystem"]["app_settings"])

    # Open the JSON file
    with open(file) as f:
        # Load the JSON data into a dictionary
        data = json.load(f)["video"]

        # Now you can use the dictionary as needed
    a = gesture_tracker(frameskip = True, app_settings = data)

    # Parse the message as JSON
    
    a.averages = {}
    # a.video_analysis("C:/Users/aadvi/Desktop/IMG_1004.mp4", result_video = "C:/Users/aadvi/Desktop/vid.mp4")

    # a.video_analysis("C:/Users/aadvi/Downloads/pexels-mikhail-nilov-6740725-1080x1920-25fps.mp4", None, frame_skip=1, standardize_pose = True)
    a.realtime_analysis()


        # def end(self, video_scalar):
            
        #     data = self.track
        #     averages = {}
        #     num_entries = len(data)  # Number of entries in the dictionary

        #     for key in data[0].keys():
        #         values = [data[i][key] for i in range(num_entries)]
        #         average = sum(values) / num_entries
        #         averages[key] = average   
        #     averages = averages
        #     self.averages = averages

        # for i in np.arange(0.1,1.01,0.05):
        #     printing_process = multiprocess.Process(target=self.send_to_js, args=(encoded_frames,))
        #     printing_process.start()
        #     a.video_analysis("C:/Users/aadvi/Downloads/pexels-mikhail-nilov-6740725-1080x1920-25fps.mp4", None, frame_skip=1, standardize_pose = True, video_scalar = i)
        #     printing_process.terminate()