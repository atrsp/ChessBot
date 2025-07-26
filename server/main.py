from flask import Flask, request, jsonify
import chess
import chess.engine

app = Flask(__name__)

# Estado global do tabuleiro
board = chess.Board()
engine = chess.engine.SimpleEngine.popen_uci("/usr/bin/stockfish")  # Caminho do seu Stockfish

@app.route("/start", methods=["POST"])
def start_game():
    global board
    board = chess.Board()  # Reinicia o tabuleiro
    return jsonify({"status": "new game started", "fen": board.fen()}), 200

@app.route("/play", methods=["POST"])
def play_move():
    global board
    data = request.get_json()
    move_uci = data.get("move")

    try:
        move = chess.Move.from_uci(move_uci)
        if move in board.legal_moves:
            board.push(move)
            return jsonify({"status": "player move accepted", "fen": board.fen()}), 200
        else:
            return jsonify({"error": "illegal move"}), 400
    except:
        return jsonify({"error": "invalid move format"}), 400

@app.route("/next", methods=["GET"])
def get_best_move():
    global board
    if board.turn != chess.BLACK:
        return jsonify({"error": "not robot's turn (black)"}), 400

    result = engine.play(board, chess.engine.Limit(time=0.1))
    move = result.move
    board.push(move)
    return jsonify({"move": move.uci(), "fen": board.fen()}), 200

@app.route("/status", methods=["GET"])
def get_status():
    global board
    return jsonify({
        "fen": board.fen(),
        "is_game_over": board.is_game_over(),
        "turn": "white" if board.turn == chess.WHITE else "black"
    }), 200

@app.route("/stop", methods=["POST"])
def stop():
    engine.quit()
    return jsonify({"status": "engine stopped"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
