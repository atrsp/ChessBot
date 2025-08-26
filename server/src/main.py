from flask import Flask, Response, jsonify
import cv2
import chess
import chess.engine
from diff import diff


CAMERA_INDEX=2
STOCKFISH_PATH="/usr/bin/stockfish"
DEPTH=30
LIMIT=0.1 # 1s


app = Flask(__name__)
board = chess.Board()
engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
cap = cv2.VideoCapture(CAMERA_INDEX)
img1 = None
img2 = None


def is_standard_move(changed):
    return len(changed) == 2


def is_castling(changed):
    return len(changed) == 4


def square_to_matrix_coords(square):
    if isinstance(square, str):
        square = chess.parse_square(square)
    
    col = chess.square_file(square)
    row = chess.square_rank(square)

    return (row, abs(col - 7))

def get_latest_frame(cap, discard=10):
    for _ in range(discard):
        cap.read()
    ret, frame = cap.read()
    return ret, frame


@app.route("/reset", methods=["GET"])
def reset_board():
    global board
    board = chess.Board()
    return f"<pre>{board}</pre>", 200

@app.route("/view", methods=["GET"])
def view():
    return f"<pre>{board}</pre>", 200

@app.route("/capture-board-state", methods=["GET"])
def capture_board_state():
    global img1
    _, img1 = get_latest_frame(cap)
    ret, buffer = cv2.imencode('.jpg', img1)

    return Response(buffer.tobytes(), mimetype='image/jpeg')

@app.route("/confirm-opponent-move", methods=["GET"])
def confirm_opponent_move():
    global img2, board
    _, img2 = get_latest_frame(cap)
    ret, buffer = cv2.imencode('.jpg', img2)

    changed = diff(img1, img2)

    if is_standard_move(changed):
        square1 = chess.parse_square(changed[0])
        square2 = chess.parse_square(changed[1])

        piece1 = board.piece_at(square1)
        piece2 = board.piece_at(square2)

        move = ""
        captured = False

        if piece1 != None and piece1.color == chess.WHITE:
            move = f"{changed[0]}{changed[1]}"
            captured = piece2 != None

        if piece2 != None and piece2.color == chess.WHITE:
            move = f"{changed[1]}{changed[0]}"
            captured = piece1 != None
        
        move = chess.Move.from_uci(move)
        print(captured)

        if move in board.legal_moves:
            board.push(move)
        else:
            print("Movimento ilegal!")
    
    if is_castling(changed):
        move  = ""
        if "a1" in changed:
            # Roque grande
            move = "e1c1"
            
        if "h1" in changed:
            # Roque pequeno
            move = "e1g1"

        move = chess.Move.from_uci(move)

        if move in board.legal_moves:
            board.push(move)
        else:
            print("Movimento ilegal!")
        

    print(board)
    print(changed)

    return Response(buffer.tobytes(), mimetype='image/jpeg')

@app.route("/get-best-move", methods=["GET"])
def get_best_move():
    result = engine.play(board, chess.engine.Limit(time=LIMIT, depth=DEPTH))
    move = result.move

    origin = square_to_matrix_coords(move.from_square)
    destiny = square_to_matrix_coords(move.to_square)

    piece = board.piece_at(move.to_square)

    print(origin, destiny)


    castling_type = 0

    if board.is_castling(move):
        if move.to_square > move.from_square:
            castling_type = 1 # Roque pequeno
        else:
            castling_type = 2 # Roque Grande


    board.push(move)
    print(board)
    

    return jsonify({
        "from": origin,
        "to": destiny,
        "captured": piece != None,
        "castling": castling_type,
    }), 200


if __name__ == "__main__":
    try:
        get_latest_frame(cap)
        app.run(host="0.0.0.0", port=5000)
    finally:
        engine.quit()
        cap.release()
