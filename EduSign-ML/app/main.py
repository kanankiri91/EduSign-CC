from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import numpy as np
import tensorflow as tf
import mediapipe as mp
import cv2
import json
import os

app = Flask(__name__)

BASE_PATH = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_PATH,'model','v3.1.2.h5')
P2S_PATH = os.path.join(BASE_PATH,'p2s_index_map.json')
UPLOAD_PATH = os.path.join(BASE_PATH,'uploads')
SEQUENCE_LENGTH = 30
model = tf.keras.models.load_model(MODEL_PATH)
mp_holistic = mp.solutions.holistic

with open(P2S_PATH, 'r') as json_file:
  json_data = json_file.read()
decoder = json.loads(json_data)

lipsUpperOuter = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
lipsLowerOuter = [146, 91, 181, 84, 17, 314, 405, 321, 375, 291]
lipsUpperInner = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308]
lipsLowerInner = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308]
lipsIDX = np.array(lipsUpperOuter + lipsLowerOuter + lipsUpperInner + lipsLowerInner)


def mp_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    landmarks = model.process(image)
    return landmarks

def extract_keypoints(mp_results):
    #Face
    if mp_results.face_landmarks:
        face = np.array([[cord.x, cord.y, cord.z] for cord in mp_results.face_landmarks.landmark])
        lips = np.array(face[lipsIDX]).flatten()
    else:
        face = np.zeros(129)
    #Pose
    if mp_results.pose_landmarks:
        pose = np.array([[cord.x, cord.y, cord.z] for cord in mp_results.pose_landmarks.landmark]).flatten()
    else:
        pose = np.zeros(99)
    #Right Hand    
    if mp_results.right_hand_landmarks:
        rh = np.array([[cord.x, cord.y, cord.z] for cord in mp_results.right_hand_landmarks.landmark]).flatten() 
    else:
        rh = np.zeros(63)
    #Left Hand
    if mp_results.left_hand_landmarks:
        lh = np.array([[cord.x, cord.y, cord.z] for cord in mp_results.left_hand_landmarks.landmark]).flatten() 
    else:
        lh = np.zeros(63)
    return np.concatenate([lips,lh,pose,rh])

def get_top10(result):
    sorted_idx = sorted(range(len(result)), key=lambda i: result[i], reverse=True)
    return [decoder[str(idx)] for idx in sorted_idx[:10]], ['{:.2f}'.format(result[idx]*100) for idx in sorted_idx[:10]]

@app.route('/predict', methods=['POST'])
def predict():
    f = request.files['video']
    
    #Save Video
    if not os.path.exists(UPLOAD_PATH):
        os.makedirs(UPLOAD_PATH)
    videoPath = os.path.join(BASE_PATH,'uploads',secure_filename(f.filename))
    f.save(videoPath)
    
    with mp_holistic.Holistic(min_detection_confidence=.5, min_tracking_confidence=.5) as holistic_model:
        cap = cv2.VideoCapture(videoPath)
        num_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
        landmarks = []
        sequences_interval = 1 if num_frames < SEQUENCE_LENGTH else num_frames // SEQUENCE_LENGTH
    
        for frame in range(0, SEQUENCE_LENGTH*sequences_interval, sequences_interval):
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame)
            _, image = cap.read()
            try:
                mp_results = mp_detection(image, holistic_model)
                landmarks.append(extract_keypoints(mp_results))
            except:
                landmarks.append(np.zeros(354))
        cap.release()
        cv2.destroyAllWindows()
    
    # Remove Video
    if os.path.exists(videoPath):
        os.remove(videoPath)
    else:
        print("The file does not exist")
    
    result = model.predict(np.expand_dims(landmarks, axis=0))
    top10 = get_top10(result[0])
    
    return jsonify({"prediction":top10[0], "value":top10[1]})

if __name__ == '__main__':
    app.run(port=int(os.environ.get("PORT", 8080)),host='127.0.0.1',debug=True)