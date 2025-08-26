"use client"

import { useState, useEffect } from "react"

// Mapeamento das peças FEN para símbolos Unicode
const pieceSymbols: { [key: string]: string } = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙", // Peças brancas (serão vermelhas)
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟", // Peças pretas (serão verdes)
}

// Função para converter FEN em array 8x8
function fenToBoard(fen: string): (string | null)[][] {
  const board: (string | null)[][] = []
  const rows = fen.split(" ")[0].split("/")

  for (const row of rows) {
    const boardRow: (string | null)[] = []
    for (const char of row) {
      if (isNaN(Number.parseInt(char))) {
        boardRow.push(char)
      } else {
        // Adiciona casas vazias
        for (let i = 0; i < Number.parseInt(char); i++) {
          boardRow.push(null)
        }
      }
    }
    board.push(boardRow)
  }

  return board
}

export default function ChessBoard() {
  const [message, setMessage] = useState("CARREGANDO...")
  const [board, setBoard] = useState<(string | null)[][]>([])

  // Simular chamada da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulando uma API call - substitua pela sua API real
        const response = await fetch('http://localhost:5000/status')
        console.log(response)
        const data = await response.json()

        setMessage(data.message)
        setBoard(fenToBoard(data.fen))
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setMessage("ERRO NA CONEXÃO")
      }
    }

    fetchData()

    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 flex flex-col items-center justify-center p-4">
      {/* Título grande e claro */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 text-center text-balance drop-shadow-lg">
        {message}
      </h1>

      {/* Tabuleiro de xadrez */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
        <div className="grid grid-cols-8 gap-0 border-4 border-white/20 rounded-lg overflow-hidden">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLightSquare = (rowIndex + colIndex) % 2 === 0
              const squareColor = isLightSquare ? "bg-amber-100" : "bg-amber-800"

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center ${squareColor} relative`}
                >
                  {piece && (
                    <span
                      className={`text-6xl md:text-7xl font-black select-none ${
                        piece === piece.toUpperCase()
                          ? "text-red-500" // removido blur e neon, mantendo apenas cor vermelha
                          : "text-green-500" // removido blur e neon, mantendo apenas cor verde
                      }`}
                      style={{
                        WebkitTextStroke: "2px currentColor",
                      }}
                    >
                      {pieceSymbols[piece]}
                    </span>
                  )}
                </div>
              )
            }),
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-6 flex gap-6 text-white text-lg font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Peças Brancas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Peças Pretas</span>
        </div>
      </div>
    </div>
  )
}
