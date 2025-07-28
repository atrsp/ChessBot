from flask import Flask, request, jsonify
import cv2
import numpy as np
import chess
import chess.engine

app = Flask(__name__)
board = chess.Board()
engine = chess.engine.SimpleEngine.popen_uci("/usr/bin/stockfish")
cap = cv2.VideoCapture(0)
initial = None
last = None

def detect_chessboard_squares(image1, image2):
    # Sua implementação de detecção de mudanças no tabuleiro
    return [(6, 4), (4, 4)]

def squares_to_uci(squares):
    # Sua implementação para converter coordenadas em notação UCI
    return "e2e4"

def square_to_matrix_notation(square_name):
    """Converte notação de xadrez (e.g. 'e4') para coordenadas matriz (linha, coluna)"""
    if square_name is None:
        return None
    
    file = ord(square_name[0]) - ord('a')  # a=0, b=1, ..., h=7
    rank = int(square_name[1]) - 1         # 1=0, 2=1, ..., 8=7
    return [7 - rank, file]  # Inverte linha para ficar como batalha naval (8=0, 1=7)

def get_captured_piece_info(move, board):
    """Retorna informações sobre peça capturada, incluindo casos especiais como en passant"""
    if not board.is_capture(move):
        return None
    
    # En passant
    if board.is_en_passant(move):
        # No en passant, a peça capturada não está no quadrado de destino
        if board.turn == chess.WHITE:
            captured_square = chess.square(chess.square_file(move.to_square), 
                                         chess.square_rank(move.to_square) - 1)
        else:
            captured_square = chess.square(chess.square_file(move.to_square), 
                                         chess.square_rank(move.to_square) + 1)
        
        captured_piece = board.piece_at(captured_square)
        return {
            "piece": captured_piece.symbol() if captured_piece else "p",
            "position": square_to_matrix_notation(chess.square_name(captured_square)),
            "is_en_passant": True
        }
    
    # Captura normal
    captured_piece = board.piece_at(move.to_square)
    return {
        "piece": captured_piece.symbol() if captured_piece else None,
        "position": square_to_matrix_notation(chess.square_name(move.to_square)),
        "is_en_passant": False
    }

@app.route("/start", methods=["GET"])
def start_game():
    global board, initial
    board = chess.Board()
    _, initial = cap.read()
    return jsonify({"status": "Game started", "board": board.fen()}), 200

@app.route("/play", methods=["GET"])
def play_move():
    global initial, last, board
    
    try:
        # Captura imagem atual
        _, last = cap.read()
        
        # Detecta mudanças no tabuleiro
        changed_squares = detect_chessboard_squares(initial, last)
        uci_move = squares_to_uci(changed_squares)
        
        # Cria o movimento
        try:
            move = chess.Move.from_uci(uci_move)
        except ValueError:
            return jsonify({"error": "Invalid move format"}), 400
        
        # Verifica se o movimento é legal
        if move not in board.legal_moves:
            return jsonify({"error": "Illegal move"}), 400
        
        # Coleta informações antes de fazer o movimento
        is_castling_kingside = board.is_kingside_castling(move)
        is_castling_queenside = board.is_queenside_castling(move)
        captured_info = get_captured_piece_info(move, board)
        
        # Realiza o movimento
        board.push(move)
        
        # Calcula melhor jogada do engine (resposta da IA)
        engine_move = None
        best_move_matrix = None
        
        if not board.is_game_over():
            result = engine.play(board, chess.engine.Limit(time=1.0))
            engine_move = result.move
            if engine_move:
                # Converte movimento da IA para formato matriz
                from_square = square_to_matrix_notation(chess.square_name(engine_move.from_square))
                to_square = square_to_matrix_notation(chess.square_name(engine_move.to_square))
                best_move_matrix = {
                    "from": from_square,
                    "to": to_square,
                    "uci": engine_move.uci()
                }
        
        # Verifica estado do jogo
        game_over = board.is_game_over()
        game_result = None
        
        if game_over:
            if board.is_checkmate():
                winner = "Black" if board.turn == chess.WHITE else "White"
                game_result = f"Checkmate - {winner} wins"
            elif board.is_stalemate():
                game_result = "Stalemate - Draw"
            elif board.is_insufficient_material():
                game_result = "Insufficient material - Draw"
            elif board.is_fivefold_repetition():
                game_result = "Fivefold repetition - Draw"
            elif board.is_seventyfive_moves():
                game_result = "75-move rule - Draw"
            else:
                game_result = "Game over"
        
        # Monta resposta
        response = {
            "move_made": {
                "uci": uci_move,
                "from": square_to_matrix_notation(chess.square_name(move.from_square)),
                "to": square_to_matrix_notation(chess.square_name(move.to_square))
            },
            "best_move": best_move_matrix,
            "game_over": game_over,
            "game_result": game_result,
            "castling": {
                "kingside": is_castling_kingside,
                "queenside": is_castling_queenside
            },
            "captured_piece": captured_info,
            "check": board.is_check(),
            "board_fen": board.fen(),
            "turn": "White" if board.turn == chess.WHITE else "Black"
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/confirm", methods=["GET"])
def confirm_move():
    global initial
    _, initial = cap.read()
    return jsonify({"status": "Move confirmed, ready for next move"}), 200

@app.route("/board", methods=["GET"])
def get_board_state():
    """Endpoint adicional para consultar estado atual do tabuleiro"""
    return jsonify({
        "board_fen": board.fen(),
        "turn": "White" if board.turn == chess.WHITE else "Black",
        "check": board.is_check(),
        "game_over": board.is_game_over(),
        "legal_moves": [move.uci() for move in board.legal_moves]
    }), 200


if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=5000)
    finally:
        engine.quit()
        cap.release()