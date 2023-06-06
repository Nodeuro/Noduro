import cv2
import numpy as np
from numpy import linalg
from numpy.polynomial import Polynomial as P
import warnings
from sklearn.linear_model import LinearRegression
model = LinearRegression()
def perpendicular_bisector(a,b):
    vx = b[0] - a[0]
    vy = b[1] - a[1]
    mag = np.sqrt(vx**2 + vy**2)
    vx = vx/mag
    vy = vy/mag
    vt = vx
    vx = -vy
    vy = vt
    angle = np.degrees(np.arctan(vx/vy))
    return vx,vy, angle 

def pythag(a,b):
    return np.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)

def distance_between_line_and_point( p1,p2,p3):
    d= (p3[0]-p1[0])*(p2[1]-p1[1])-(p3[1]-p1[1])*(p2[0]-p1[0]) #0.10720277702381154
    if d > 0:
        d = 1
    else:
        d = -1
    x = linalg.norm(np.cross(p2-p1, p1-p3))
    return linalg.norm(np.cross(p2-p1, p1-p3))/linalg.norm(p2-p1)*d

def nose_line_angle(list_of_values):
    model.fit(list_of_values[:,0].reshape(-1, 1), list_of_values[:,1])

    # Calculate the slope of the line connecting the points
    if model.coef_[0] == 0:
        return 0
    else:
        slope =1/model.coef_[0]

        # Calculate the angle of the slope relative to the vertical axis (in degrees)
        angle_degrees = np.degrees(np.arctan(slope))
        # if slope < 0:
        #     angle_degrees += 180
        # elif slope == 0 and np.any(y < 0):
        #     angle_degrees += 180
        return angle_degrees

def angle_between_two_lines(M1,M11,M2,M22):
    if M11 == 0:
        Mx = 0
    else:
        Mx = M1/M11
    if M22 == 0:
        My = 0
    else:
        My = M2/M22
    
    if M1*M2 == -1:
        return 90
    elif abs(M1-M2) < 0.001:
        return 0
    else:
        angle = abs((M2 - M1) / (1 + M1 * M2))
        return np.degrees(np.arctan(angle))

def landmarks_to_lists( landmarks):
    return landmarks.face_landmarks, landmarks.pose_landmarks

def calculate_eye_ratio( left_iris_list, right_iris_list, chest_list, nose_list):
    right_box = cv2.boundingRect(right_iris_list)
    left_box = cv2.boundingRect(left_iris_list)

    eye_center = np.asarray([int(np.mean((right_box[0], left_box[0] + left_box[2]))),int(np.mean((right_box[1], left_box[1] + left_box[3])))])
    body_center = np.mean(chest_list, axis = 0, dtype = np.int16)
    perp_bisect = perpendicular_bisector(chest_list[0],chest_list[1])
    body_slope = perp_bisect[0:2]
    chest_angle = perp_bisect[2]
    factor = (eye_center[1]-body_center[1])/body_slope[1]*2
    new_point = np.asarray([int(body_center[0]+body_slope[0]*factor),int(body_center[1]+body_slope[1]*factor)])
    
    eye_distance = distance_between_line_and_point(new_point, body_center[:,0:2], eye_center)
    chest_distance = pythag(chest_list[0],chest_list[1])/2
    king_joshua_ratio = np.round(eye_distance/chest_distance,3)

    nose_line, nose_angle = nose_line_angle(nose_list)
    nose_line = nose_line[0]

    angle_diff = abs(chest_angle - nose_angle)
    return king_joshua_ratio, nose_angle,angle_diff, new_point, body_center, eye_center, left_box, right_box

def focus_tracking(left_iris_list, right_iris_list, chest_list, nose_list, display: None):
    # orientation, angle_difference,
    left_box = cv2.boundingRect(left_iris_list); right_box = cv2.boundingRect(right_iris_list)

    chest_z= chest_list[:,2]
    chest_list = chest_list[:,0:2]
    eye_center = np.asarray([int(np.mean((right_box[0], left_box[0] + left_box[2]))),int(np.mean((right_box[1], left_box[1] + left_box[3])))])
    body_center = np.mean(chest_list, axis = 0, dtype = np.int16)
    
    perp_bisect = perpendicular_bisector(chest_list[0],chest_list[1])
    body_slope = perp_bisect[0:2]
    chest_angle = perp_bisect[2]
    factor = (eye_center[1]-body_center[1])/body_slope[1]*2
    new_point = np.asarray([int(body_center[0]+body_slope[0]*factor),int(body_center[1]+body_slope[1]*factor)])
    
    eye_distance = distance_between_line_and_point(new_point, body_center, eye_center)
    chest_distance = pythag(chest_list[0],chest_list[1])/2
    
    
    fundamental_ratio = abs(eye_distance/chest_distance + abs(np.diff(chest_z)[0])) #max of 2
    if fundamental_ratio > 2:
        fundamental_ratio = 2
    nose_angle = nose_line_angle(nose_list)


    roll = abs(chest_angle * 0.25 + nose_angle) /  60  #060
    if roll > 1:
        roll = 1
    derived_focus = (roll * 2 + fundamental_ratio)/4 #factor 2 together]
    if display is not None:
        ret = draw_eye_calculations(display, eye_center, body_center, np.asarray(chest_list, np.int32), new_point, derived_focus, roll, fundamental_ratio)
        return *ret, derived_focus
    else:
        return derived_focus
    #combine chest_z and eye_ratiop
    
    #angle_difference
    pass

def draw_eye_calculations(frame,eye_center, body_center, chest_list, new_point, derived_focus, roll, fundamental_ratio):
    # cv2.putText(frame, "Orientation: \nd" + str(nose_angle), (10,45), cv2.FONT_HERSHEY_PLAIN, fontScale = 4 * scalar, thickness= 2 * scalar, color = (0,0,0))
    # cv2.putText(frame, "Angle Diff: " + str(angle_diff), (10,60), cv2.FONT_HERSHEY_PLAIN, fontScale = 4 * scalar, thickness= 2 * scalar, color = (0,0,0))
    # cv2.putText(frame, "Eye Ratio: " + str(king_joshua_ratio), (10,30), cv2.FONT_HERSHEY_PLAIN, fontScale = 4 * scalar, thickness= 2 * scalar, color = (0,0,0))
    
    cv2.circle(frame, eye_center,radius = 2,color = (255,255,255), thickness = 2) #dot in the center of two eyes
    
    
    cv2.line(frame,chest_list[0],chest_list[1], color = (102,35,0),thickness = 2) #  Connect two shoulders
    cv2.line(frame,body_center,new_point, color = (102,35,0),thickness = 2) # Perpendicular Bisector
    # cv2.line(frame,(int((king_joshua_ratio)*image_cols/2+image_cols/2), 0), (int((king_joshua_ratio)*image_cols/2+image_cols/2), 10000), color = (0,0,255),thickness = 3) # moving line

    return frame, ["focus: " + str(int(derived_focus*100)), "roll: " + str(np.round(roll,2)), "ratio: " + str(np.round(fundamental_ratio,2))]