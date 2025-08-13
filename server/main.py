from flask import Flask, Response
import cv2
import numpy as np
import chess
import chess.engine
from diff import diff

app = Flask(__name__)
board = chess.Board()
engine = chess.engine.SimpleEngine.popen_uci("/usr/bin/stockfish")
cap = cv2.VideoCapture(2)

img1 = None
img2 = None

def get_latest_frame(cap, discard=10):
    for _ in range(discard):
        cap.read()
    ret, frame = cap.read()
    return ret, frame

@app.route("/capture-board-state", methods=["GET"])
def capture_board_state():
    global img1
    _, img1 = get_latest_frame(cap)
    ret, buffer = cv2.imencode('.jpg', img1)
    return Response(buffer.tobytes(), mimetype='image/jpeg')

@app.route("/confirm-opponent-move", methods=["GET"])
def confirm_opponent_move():
    global img2
    _, img2 = get_latest_frame(cap)
    ret, buffer = cv2.imencode('.jpg', img2)


    changed = diff(img1, img2)
    print(changed)

    return Response(buffer.tobytes(), mimetype='image/jpeg')

@app.route("/get-best-move", methods=["GET"])
def get_best_move():
    return "", 200


if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=5000)
    finally:
        engine.quit()
        cap.release()