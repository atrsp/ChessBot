from flask import Flask, Response, jsonify
import cv2
import chess
import chess.engine
from diff import diff
from flask_cors import CORS 
from time import sleep


CAMERA_INDEX=2
STOCKFISH_PATH="/usr/bin/stockfish"
DEPTH=30
LIMIT=0.1 # 1s


app = Flask(__name__)
CORS(app)
board = chess.Board()
engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
cap = cv2.VideoCapture(CAMERA_INDEX)
img1 = None
img2 = None
message = "🤖 Olá! Sou seu adversário de xadrez robótico. Estou online e pronto para jogar!"


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
    global board, message
    message = "♻️ Perfeito! Reiniciei minha mente. Organize as peças na posição inicial e vamos começar uma nova batalha!"
    board = chess.Board()
    return f"<pre>{board}</pre>", 200

@app.route("/view", methods=["GET"])
def view():
    return f"<pre>{board}</pre>", 200

@app.route("/capture-board-state", methods=["GET"])
def capture_board_state():
    global img1, message
    message = "📸 Preparando meus sensores visuais para capturar o tabuleiro em 5 segundos..."
    for i in range(5):
        message = f"📸 Focalizando minha câmera... {4-i} segundos restantes!"
        sleep(1)
    message = "✅ Imagem capturada com sucesso! Agora faça seu movimento!"
    _, img1 = get_latest_frame(cap)
    ret, buffer = cv2.imencode('.jpg', img1)

    return Response(buffer.tobytes(), mimetype='image/jpeg')

@app.route("/confirm-opponent-move", methods=["GET"])
def confirm_opponent_move():
    global img2, board, message
    _, img2 = get_latest_frame(cap)
    ret, buffer = cv2.imencode('.jpg', img2)

    message = "🔍 Analisando seu movimento com meus algoritmos de visão computacional..."

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
            if captured:
                message = "⚔️ Movimento confirmado! Vejo que capturou uma de minhas peças... Interessante estratégia!"
            else:
                message = "✅ Movimento válido registrado! Estou processando minha resposta..."
        else:
            message = "❌ Ops! Detectei um movimento inválido. Verifique as regras e tente novamente!"
    
    elif is_castling(changed):
        move  = ""
        if "a1" in changed:
            # Roque grande
            move = "e1c1"
            message = "🏰 Detectei um roque grande! Movimento clássico de proteção do rei..."
            
        if "h1" in changed:
            # Roque pequeno
            move = "e1g1"
            message = "🏰 Ah, um roque pequeno! Boa jogada defensiva..."

        move = chess.Move.from_uci(move)

        if move in board.legal_moves:
            board.push(move)
            message += " Movimento confirmado!"
        else:
            message = "❌ Roque inválido! Verifique se as condições estão corretas!"
    else:
        message = "🤔 Hmm, não consegui identificar claramente seu movimento. Pode tentar novamente?"

    print(board)
    print(changed)

    return Response(buffer.tobytes(), mimetype='image/jpeg')

@app.route("/get-best-move", methods=["GET"])
def get_best_move():
    global message
    message = "🧠 Ativando meus circuitos de inteligência artificial... Calculando a melhor jogada!"
    
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
            message = "🏰 Decidi fazer um roque pequeno! Protegendo meu rei e ativando a torre!"
        else:
            castling_type = 2 # Roque Grande
            message = "🏰 Vou fazer um roque grande! Uma jogada estratégica para controlar o centro!"
    elif piece != None:
        message = "⚔️ Capturei sua peça! Meus cálculos indicaram que essa era a melhor opção!"
    else:
        message = "♟️ Executei meu movimento! Vamos ver como você responde a isso..."

    board.push(move)
    print(board)
    
    # Verificar situações especiais do jogo
    if board.is_check():
        if board.turn == chess.WHITE:
            message += " 👑 E isso é XEQUE ao seu rei! Cuidado!"
        else:
            message += " 😅 Ops, parece que deixei meu rei em xeque..."
    
    if board.is_checkmate():
        if board.turn == chess.WHITE:
            message = "🎉 XEQUE-MATE! Vitória dos meus algoritmos! Boa partida, humano!"
        else:
            message = "😔 Você me derrotou... Meus parabéns! Vou aprender com essa derrota."
    
    if board.is_stalemate():
        message = "🤝 Empate por afogamento! Uma partida equilibrada entre homem e máquina!"

    sleep(2)

    message = "Agora confirme a minha jogada! Ajuste o posicionamento da peça se necessário!"

    return jsonify({
        "from": origin,
        "to": destiny,
        "captured": piece != None,
        "castling": castling_type,
    }), 200


@app.route("/status", methods=["GET"])
def status():
    global board, message
    
    # Mensagens dinâmicas baseadas no estado do jogo
    game_status = ""
    if board.is_game_over():
        if board.is_checkmate():
            game_status = " | 🏁 Jogo finalizado!"
        elif board.is_stalemate():
            game_status = " | 🤝 Empate!"
    elif board.is_check():
        game_status = " | ⚠️ Rei em xeque!"
    
    return jsonify({
        "fen": board.fen(),
        "message": message + game_status,
        "turn": "Sua vez" if board.turn == chess.WHITE else "Minha vez",
        "move_count": board.fullmove_number
    }), 200



if __name__ == "__main__":
    try:
        print("🤖 Inicializando sistema de xadrez robótico...")
        get_latest_frame(cap)
        print("✅ Câmera conectada com sucesso!")
        print("🧠 Motor de xadrez carregado!")
        print("🚀 Servidor rodando em http://0.0.0.0:5000")
        message = "🎯 Sistema totalmente operacional! Estou pronto para nossa partida de xadrez!"
        app.run(host="0.0.0.0", port=5000)
    finally:
        print("🔌 Desligando sistemas...")
        engine.quit()
        cap.release()
        print("👋 Até a próxima partida!")