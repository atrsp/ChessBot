# ChessBOT

## Visão Geral

[cite_start]O ChessBOT é um projeto de um jogador de xadrez autônomo, materializado em uma garra robótica capaz de disputar uma partida de xadrez contra um oponente humano de forma independente[cite: 12]. O sistema utiliza visão computacional para identificar as jogadas do adversário, uma engine de xadrez para calcular seus próprios movimentos e um braço robótico para mover as peças no tabuleiro.

[cite_start]Este projeto foi desenvolvido como parte da disciplina "PROJETO INTEGRADO DE COMPUTAÇÃO II"[cite: 1].

### Autores
* [cite_start]Ana Tereza Pereira [cite: 3]
* [cite_start]Felipe de Albuquerque [cite: 3]
* [cite_start]Luiz Felipe Machado [cite: 3]
* [cite_start]Vitor Dadalto [cite: 3]

---

## Componentes e Materiais

[cite_start]A seguir estão os itens utilizados na construção do ChessBOT[cite: 5].

### Componentes Eletrônicos e Estruturais
* [cite_start]**Microcontrolador:** ESP32 [cite: 28]
* [cite_start]**Servomotores:** 3 unidades do modelo Tower Pro MG995 [cite: 20, 22]
* [cite_start]**Eletroímã:** 1 unidade com capacidade de 2kg [cite: 21]
* [cite_start]**Webcam:** Logitech C720 [cite: 32]
* [cite_start]**Botões:** 2 Botões de Fliperama [cite: 31]
* **Estrutura de Madeira:**
    * [cite_start]1 Tábua de 45cm x 35cm [cite: 18]
    * [cite_start]1 "Ponte" de madeira com 55cm de altura [cite: 19]

### Impressão 3D e Materiais Adicionais
* [cite_start]**Impressora 3D** [cite: 16]
* [cite_start]**Filamento:** PLA [cite: 17]
* [cite_start]**Peças:** 32 moedas de R$0,10 [cite: 27]
* **Acabamento:**
    * [cite_start]Papel Contact [cite: 29]
    * [cite_start]Adesivos de papel para as peças [cite: 30]

---

## Hardware e Impressão 3D

[cite_start]A estrutura física do braço robótico e suas peças foram produzidas com uma impressora 3D[cite: 34].

### Braço Robótico
[cite_start]O modelo base utilizado para o braço foi o **EEZYbotARM MK2**, um projeto gratuito desenvolvido por "daGHIZmo"[cite: 37, 38].

### Modificações e Melhorias
[cite_start]O modelo original serviu como ponto de partida, mas não possuía o alcance e a precisão necessários para a aplicação[cite: 41]. [cite_start]Por isso, foi necessário remodelar algumas peças[cite: 42].

* [cite_start]**Engrenagem:** Após a montagem, foi identificada uma grande folga na engrenagem, causando uma imprecisão de uma casa no tabuleiro[cite: 46]. [cite_start]A peça foi redesenhada para corrigir seu módulo, o que diminuiu a folga[cite: 47].
* [cite_start]**Base do Eletroímã:** O projeto original possuía uma garra na ponta do braço[cite: 50]. [cite_start]Como o ChessBOT utiliza um eletroímã, foi modelada uma nova peça para acoplar este componente[cite: 51].
* [cite_start]**Peças de Xadrez:** Foram desenvolvidas e impressas bases para as moedas para facilitar o movimento do braço ao pegar cada peça e aumentar a jogabilidade do oponente[cite: 55, 56].

### Peças Auxiliares
[cite_start]Também foram impressos modelos 3D para componentes de suporte, como dois suportes para descarte de peças capturadas e dois suportes para os botões[cite: 59].

---

## Montagem

[cite_start]A montagem do braço robótico seguiu as instruções detalhadas em um vídeo de Chris Riley[cite: 64]. [cite_start]Não foi feita nenhuma alteração nesse processo[cite: 65].

---

## Software

O software do ChessBOT é dividido em dois componentes principais: o sistema de visão computacional para detectar a jogada do oponente e a engine de xadrez para a tomada de decisão.

### Visão Computacional
[cite_start]Foi utilizada a biblioteca **OpenCV** em Python para identificar a jogada do oponente[cite: 77]. [cite_start]A estratégia consiste em capturar uma imagem do tabuleiro antes e outra depois do movimento do oponente para identificar as diferenças[cite: 78].

O processo ocorre em três etapas:

1.  [cite_start]**Identificação do Tabuleiro:** Uma máscara de cor vermelha é aplicada à imagem para destacar a borda do tabuleiro[cite: 81, 88]. [cite_start]Com isso, os pontos referentes às bordas são detectados para saber onde cortar a imagem[cite: 83, 89].
2.  [cite_start]**Corte e Ajuste de Perspectiva:** A imagem passa por uma transformação de perspectiva (warp) para corrigir distorções causadas pelo ângulo da câmera, alinhando o tabuleiro em uma visão superior[cite: 94, 103]. [cite_start]Em seguida, a área é cortada, deixando apenas a região útil[cite: 95, 104].
3.  [cite_start]**Detecção do Movimento:** Com as imagens "antes" e "depois" normalizadas, o sistema calcula a diferença entre elas[cite: 109]. [cite_start]Uma operação com kernel é aplicada para reduzir ruídos[cite: 110]. [cite_start]As diferenças mais significativas são usadas para determinar o movimento realizado[cite: 111].

### Engine de Xadrez
[cite_start]A inteligência do robô é fornecida pela **Stockfish**, uma engine de xadrez de código aberto[cite: 120, 121].

* [cite_start]**Funcionamento:** A Stockfish recebe a configuração atual do tabuleiro (a "posição") e calcula qual seria a melhor jogada[cite: 122].
* [cite_start]**Análise:** Além de sugerir a jogada, a engine fornece uma avaliação numérica que indica se as peças brancas ou pretas estão em vantagem e o tamanho dessa vantagem[cite: 123].

---

## Decisões de Projeto

[cite_start]Algumas decisões foram tomadas para garantir a funcionalidade e a robustez do sistema[cite: 125].

* [cite_start]**Botões de Confirmação:** Foram adicionados botões de confirmação de jogada para determinar o momento exato de tirar a foto que identificará o movimento do oponente[cite: 128].
* [cite_start]**Adesivos das Peças:** As cores vermelha e verde foram escolhidas por se diferenciarem bem do preto e branco do tabuleiro, facilitando a identificação da jogada por visão computacional[cite: 132].

***
***

# ChessBOT - README (English Translation)

## Overview

[cite_start]ChessBOT is an autonomous chess player project, embodied by a robotic arm capable of playing a game of chess against a human opponent on its own[cite: 12]. The system uses computer vision to identify the opponent's moves, a chess engine to calculate its own moves, and a robotic arm to move the pieces on the board.

[cite_start]This project was developed as part of the "INTEGRATED COMPUTING PROJECT II" course[cite: 1].

### Authors
* [cite_start]Ana Tereza Pereira [cite: 3]
* [cite_start]Felipe de Albuquerque [cite: 3]
* [cite_start]Luiz Felipe Machado [cite: 3]
* [cite_start]Vitor Dadalto [cite: 3]

---

## Components and Materials

[cite_start]The following are the items used in the construction of the ChessBOT[cite: 5].

### Electronic and Structural Components
* [cite_start]**Microcontroller:** ESP32 [cite: 28]
* [cite_start]**Servo Motors:** 3 units of the Tower Pro MG995 model [cite: 20, 22]
* [cite_start]**Electromagnet:** 1 unit with a 2kg capacity [cite: 21]
* [cite_start]**Webcam:** Logitech C720 [cite: 32]
* [cite_start]**Buttons:** 2 Arcade Buttons [cite: 31]
* **Wooden Structure:**
    * [cite_start]1 45cm x 35cm wooden board [cite: 18]
    * [cite_start]1 wooden "bridge" with a height of 55cm [cite: 19]

### 3D Printing and Additional Materials
* [cite_start]**3D Printer** [cite: 16]
* [cite_start]**Filament:** PLA [cite: 17]
* [cite_start]**Pieces:** 32 Brazilian 10-cent coins [cite: 27]
* **Finishing:**
    * [cite_start]Contact Paper [cite: 29]
    * [cite_start]Paper stickers for the pieces [cite: 30]

---

## Hardware and 3D Printing

[cite_start]The physical structure of the robotic arm and its parts were produced using a 3D printer[cite: 34].

### Robotic Arm
[cite_start]The base model used for the arm was the **EEZYbotARM MK2**, a free design developed by "daGHIZmo"[cite: 37, 38].

### Modifications and Improvements
[cite_start]The original model served as a starting point, but it lacked the necessary reach and precision for the application[cite: 41]. [cite_start]Therefore, it was necessary to remodel some parts[cite: 42].

* [cite_start]**Gear:** After assembly, a large backlash was identified in the gear, causing an imprecision of one square on the board[cite: 46]. [cite_start]The part was redesigned to correct its module, which reduced the backlash[cite: 47].
* [cite_start]**Electromagnet Base:** The original design featured a claw at the end of the arm[cite: 50]. [cite_start]As the ChessBOT uses an electromagnet, a new part was modeled to attach this component[cite: 51].
* [cite_start]**Chess Pieces:** Bases for the coins were developed and printed to make it easier for the arm to pick up each piece and to improve the opponent's gameplay experience[cite: 55, 56].

### Auxiliary Parts
[cite_start]3D models were also printed for support components, such as two holders for captured pieces and two holders for the buttons[cite: 59].

---

## Assembly

[cite_start]The assembly of the robotic arm followed the detailed instructions in a video by Chris Riley[cite: 64]. [cite_start]No alterations were made to this process[cite: 65].

---

## Software

The ChessBOT's software is divided into two main components: the computer vision system to detect the opponent's move and the chess engine for decision-making.

### Computer Vision
[cite_start]The **OpenCV** library in Python was used to identify the opponent's move[cite: 77]. [cite_start]The strategy is to capture an image of the board before and another after the opponent's move to identify the differences[cite: 78].

The process occurs in three stages:

1.  [cite_start]**Board Identification:** A red color mask is applied to the image to highlight the board's border[cite: 81, 88]. [cite_start]This allows the detection of the points corresponding to the borders to know where to crop the image[cite: 83, 89].
2.  [cite_start]**Cropping and Perspective Adjustment:** The image undergoes a perspective transformation (warp) to correct distortions caused by the camera angle, aligning the board to a top-down view[cite: 94, 103]. [cite_start]Then, the area is cropped, leaving only the useful region[cite: 95, 104].
3.  [cite_start]**Move Detection:** With the normalized "before" and "after" images, the system calculates the difference between them[cite: 109]. [cite_start]A kernel operation is applied to reduce noise[cite: 110]. [cite_start]The most significant differences are used to determine the move that was made[cite: 111].

### Chess Engine
[cite_start]The robot's intelligence is provided by **Stockfish**, an open-source chess engine[cite: 120, 121].

* [cite_start]**Functionality:** Stockfish receives the current board configuration (the "position") and calculates what the best move would be[cite: 122].
* [cite_start]**Analysis:** In addition to suggesting a move, the engine provides a numerical evaluation that indicates whether the white or black pieces have an advantage and the size of that advantage[cite: 123].

---

## Design Decisions

[cite_start]Certain decisions were made to ensure the system's functionality and robustness[cite: 125].

* [cite_start]**Confirmation Buttons:** Move confirmation buttons were added to determine the exact moment to take the photo that will identify the opponent's move[cite: 128].
* [cite_start]**Piece Stickers:** The red and green colors were chosen because they differentiate well from the black and white of the board, facilitating the move identification by computer vision[cite: 132].