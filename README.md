# ChessBOT

## Visão Geral

O ChessBOT é um projeto de um jogador de xadrez autônomo, materializado em uma garra robótica capaz de disputar uma partida de xadrez contra um oponente humano de forma independente. O sistema utiliza visão computacional para identificar as jogadas do adversário, uma engine de xadrez para calcular seus próprios movimentos e um braço robótico para mover as peças no tabuleiro.

Este projeto foi desenvolvido como parte da disciplina [PROJETO INTEGRADO DE COMPUTAÇÃO II](https://computacao-ufes.github.io/mostra/pic2_EC_20251.html) na Universidade Federal do Espírito Santo (UFES).

### Autores
* [Ana Tereza Ribeiro Soares Pereira](https://github.com/atrsp)
* [Felipe Mattos Vanetti de Albuquerque](https://github.com/felipemattosv)
* [Luiz Felipe Machado](https://github.com/luizfelmach)
* [Vitor Dadalto Câmara Gomes](https://github.com/vitordcgomes)

---

## Componentes e Materiais

A seguir estão os itens utilizados na construção do ChessBOT.

### Componentes Eletrônicos e Estruturais
* **Microcontrolador:** ESP32
* **Servomotores:** 3 unidades do modelo Tower Pro MG995
* **Eletroímã:** 1 unidade com capacidade de 2kg
* **Webcam:** Logitech C720
* **Botões:** 2 Botões de Fliperama
* **Estrutura de Madeira:**
    * 1 Tábua de 45cm x 35cm
    * 1 "Ponte" de madeira com 55cm de altura

### Impressão 3D e Materiais Adicionais
* **Impressora 3D**
* **Filamento:** PLA
* **Peças:** 32 moedas de R$0,10
* **Acabamento:**
    * Papel Contact
    * Adesivos de papel para as peças

---

## Hardware e Impressão 3D

A estrutura física do braço robótico e suas peças foram produzidas com uma impressora 3D.

### Braço Robótico
O modelo base utilizado para o braço foi o [EEZYbotARM MK2](https://www.thingiverse.com/thing:1454048), um projeto gratuito desenvolvido por "daGHIZmo".

### Modificações e Melhorias
O modelo original serviu como ponto de partida, mas não possuía o alcance e a precisão necessários para a aplicação. Por isso, foi necessário remodelar algumas peças.

* **Engrenagem:** Após a montagem, foi identificada uma grande folga na engrenagem, causando uma imprecisão de uma casa no tabuleiro. A peça foi redesenhada para corrigir seu módulo, o que diminuiu a folga.
* **Base do Eletroímã:** O projeto original possuía uma garra na ponta do braço. Como o ChessBOT utiliza um eletroímã, foi modelada uma nova peça para acoplar este componente.

### Peças de Xadrez
Foram desenvolvidas e impressas bases para as moedas para facilitar o movimento do braço ao pegar cada peça e aumentar a jogabilidade do oponente.

### Peças Auxiliares
Também foram impressos modelos 3D para componentes de suporte, como dois suportes para descarte de peças capturadas e dois suportes para os botões.

---

## Montagem

A montagem do braço robótico seguiu as instruções detalhadas no vídeo [EEZYbotARM MK2 3D Printed Robot Build - Chris's Basement](https://www.youtube.com/watch?v=R2MI-tpXyS4&ab_channel=ChrisRiley) de Chris Riley. Não foi feita nenhuma alteração nesse processo.

---

## Software

O software do ChessBOT é dividido em dois componentes principais: o sistema de visão computacional para detectar a jogada do oponente e a engine de xadrez para a tomada de decisão.

### Visão Computacional
Foi utilizada a biblioteca [**OpenCV**](https://opencv.org/) em Python para identificar a jogada do oponente. A estratégia consiste em capturar uma imagem do tabuleiro antes e outra depois do movimento do oponente para identificar as diferenças.

O processo ocorre em três etapas:

1.  **Identificação do Tabuleiro:** Uma máscara de cor vermelha é aplicada à imagem para destacar a borda do tabuleiro. Com isso, os pontos referentes às bordas são detectados para saber onde cortar a imagem.
2.  **Corte e Ajuste de Perspectiva:** A imagem passa por uma transformação de perspectiva (warp) para corrigir distorções causadas pelo ângulo da câmera, alinhando o tabuleiro em uma visão superior. Em seguida, a área é cortada, deixando apenas a região útil.
3.  **Detecção do Movimento:** Com as imagens "antes" e "depois" normalizadas, o sistema calcula a diferença entre elas. Uma operação com kernel é aplicada para reduzir ruídos. As diferenças mais significativas são usadas para determinar o movimento realizado.

### Engine de Xadrez
A inteligência do robô é fornecida pela [**Stockfish**](https://stockfishchess.org/), uma engine de xadrez de código aberto.

* **Funcionamento:** A Stockfish recebe a configuração atual do tabuleiro (a disposição das peças no tabuleiro) e calcula qual seria a melhor jogada.
* **Análise:** Além de sugerir a jogada, a engine fornece uma avaliação numérica que indica se as peças brancas ou pretas estão em vantagem e o tamanho dessa vantagem.

---

## Decisões de Projeto

Algumas decisões foram tomadas para garantir a funcionalidade e a robustez do sistema.

* **Botões de Confirmação:** Foram adicionados botões de confirmação de jogada para determinar o momento exato de tirar a foto que identificará o movimento do oponente.
* **Adesivos das Peças:** As cores vermelha e verde foram escolhidas por se diferenciarem bem do preto e branco do tabuleiro, facilitando a identificação da jogada por visão computacional.
---

## Organização do repositório

Neste repositório, além do código principal, que integra a visão computacional com a lógica de jogo e a engine de xadrez, também existe uma interface que facilita o mapeamento das posições do tabuleiro.

## Como rodar?

### Pré-requisitos

Antes de iniciar, garanta que você possui configurado em sua máquina:  
- Visual Studio Code ([VSCode](https://code.visualstudio.com/))
- Extensão [PlatformIO](https://platformio.org/install/ide?install=vscode) no VSCode  
- [Node.js v20.19.4](https://nodejs.org/en/download/)  
- [Python 3.13.5](https://www.python.org/downloads/)  
- [Mosquitto MQTT Broker](https://mosquitto.org/download/)  
- Webcam conectada ao computador  
- Sistema operacional Linux (ou adaptado para Windows/macOS, quando aplicável)
- O ESP32 e a máquina que estará responsável pelos servidores durante o jogo devem sempre estar conectados na mesma rede WiFi.
  - Para verificar o IP da sua máquina na rede, utilize `ifconfig`.

---

### Passo a Passo para rodar a interface de mapeamento (apenas durante a etapa de mapeamento das posições do tabuleiro).
     
1. Configure o **Mosquitto Broker**.  
   Edite o arquivo `/etc/mosquitto/mosquitto.conf` com o seguinte conteúdo:  
   ```conf
   listener 1883
   protocol mqtt

   listener 9001
   protocol websockets

   allow_anonymous true
   ```  
   Inicie o serviço:  
   ```bash
   sudo systemctl start mosquitto.service
   ```
   
2. Configuração do Hardware (ESP32):
   - Abra o **VSCode** com a extensão **PlatformIO**.  
   - Abra a pasta `Hardware/`.  
      - As dependências serão instaladas automaticamente via `platformio.ini`.
   - Configure as constantes no arquivo `Hardware/map.cpp` (nome e senha da rede Wi-Fi, IP do broker e tópico MQTT).
   - Compile e envie o código `map.cpp` para o ESP32 com o PlatformIO. Tenha em mente que somente o código que está dentro da pasta `src/` é compilado e enviado para o microcontrolador.


3. Acesse a interface de mapeamento:  
   - Entre na pasta `ui/`.  
   - Instale as dependências:  
     ```bash
     npm install
     ```  
   - Rode o servidor:  
     ```bash
     npm run dev
     ```  
   - Acesse em: [`http://localhost:3000`](http://localhost:3000).  

4. Salve os valores dos servos para cada posição do tabuleiro em `hardware/lib/board/board.hpp`
---

### Passo a Passo para rodar o Servidor de Inteligência (Engine + Visão Computacional).

1. Baixe o **Stockfish** em: [https://stockfishchess.org/download/](https://stockfishchess.org/download/).  
2. Mova o binário para:  
   ```bash
   /usr/local/bin/stockfish
   ```
   Ou altere a constante `STOCKFISH_PATH` no arquivo `server/src/main.py` com o caminho para o local da sua instalação da stockfish.

3. Vá para a pasta `server/` e crie um ambiente virtual:  
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```  

4. Instale as dependências:  
   ```bash
   pip install -r requirements.txt
   ```  

5. Certifique-se de que a webcam está funcionando.  

6. Inicie o servidor Python:  
   ```bash
   python3 src/main.py
   ```  

 
---

### Configuração da Interface do Jogo
1. Configuração do Hardware (ESP32):
   - Abra o **VSCode** com a extensão **PlatformIO**.  
   - Abra a pasta `Hardware/`.  
      - As dependências serão instaladas automaticamente via `platformio.ini`.
   - Configure as constantes no arquivo `Hardware/main.cpp` (IP do servidor e porta do servidor criado na etapa anterior (Servidor de Inteligência)).
      - O nome e senha da rede WiFi também precisam ser alterados dentro da função `void setup()`
   - Compile e envie o código `main.cpp` para o ESP32 com o PlatformIO. Tenha em mente que somente o código que está dentro da pasta `src/` é compilado e enviado para o microcontrolador.
     
2. Entre na pasta `chess/`.  
3. Instale as dependências:  
   ```bash
   npm install
   ```  
4. Rode o servidor da interface:  
   ```bash
   npm run dev
   ```
5. Acesse o servidor em: [`http://localhost:3000`](http://localhost:3000).
6. Se precisar reiniciar o jogo, basta clicar no botão de reset no ESP32 e reorganizar as peças no tabuleiro.

---

## Fluxo Geral de Execução (Mapeamento das posições do tabuleiro):
1. Iniciar o **Broker MQTT (Mosquitto)** com o comando
   ```bash
   sudo systemctl start mosquitto.service
   ```
2. Alterar as constantes da rede WiFi e Broker no arquivo `hardware/map.cpp` e subir o código no **ESP32** pelo PlatformIO.  
3. Abrir a **Interface de Mapeamento** na pasta `ui/` com `npm run dev` em [`http://localhost:3000`](http://localhost:3000) para calibrar as posições do tabuleiro.
4. Salvar as posições mapeadas em `hardware/lib/board/board.hpp`.

## Fluxo Geral de Execução (Jogo completo):
1. Dentro da pasta `server/`, ative o **ambiente virtual (.venv)** rodando o seguinte comando.
   ```bash
   source .venv/bin/activate
   ```
2. Iniciar o **servidor Python** com Stockfish + visão computacional em `server/src/main.py`
3. Alterar as constantes da rede WiFi e IP do server python no arquivo `hardware/src/main.cpp` e subir o código no **ESP32** pelo PlatformIO.  
4. Abrir a **Interface do Jogo** na pasta `chess/` com `npm run dev` em [`http://localhost:3000`](http://localhost:3000) para começar a jogar contra o braço robótico.  


### Opcional:
A parte de visão computacional (identificação de movimentação das peças) pode ser testada separadamente via Jupyter Notebook na pasta `server/vision/`:

   - O arquivo `takepic.py` é útil para descomplicar o processo de tirar uma foto antes e depois de mudar uma peça de uma posição para outra no tabuleiro e pode ser rodado primeiro para armazenar as fotos `before.jpg` e `after.jpg`   
   - O Notebook `main.ipynb` carrega as imagens `before.jpg` e `after.jpg` e mostra todo o processamento sobre as imagens para identificar em quais posições do tabuleiro houve mudança. É útil para debuggar possíveis erros de identificação da jogada do oponente que possam ocorrer durante o jogo.
   

***
***

# ChessBOT (English)

## Overview

ChessBOT is an autonomous chess player project, embodied by a robotic arm capable of playing a game of chess against a human opponent on its own. The system uses computer vision to identify the opponent's moves, a chess engine to calculate its own moves, and a robotic arm to move the pieces on the board.

This project was developed as part of the "INTEGRATED COMPUTING PROJECT II" course at the Federal University of Espírito Santo.

### Authors
* [Ana Tereza Ribeiro Soares Pereira](https://github.com/atrsp)
* [Felipe Mattos Vanetti de Albuquerque](https://github.com/felipemattosv)
* [Luiz Felipe Machado](https://github.com/luizfelmach)
* [Vitor Dadalto Câmara Gomes](https://github.com/vitordcgomes)

---

## Components and Materials

The following are the items used in the construction of the ChessBOT.

### Electronic and Structural Components
* **Microcontroller:** ESP32
* **Servo Motors:** 3 units of the Tower Pro MG995 model
* **Electromagnet:** 1 unit with a 2kg capacity
* **Webcam:** Logitech C720
* **Buttons:** 2 Arcade Buttons
* **Wooden Structure:**
    * 1 45cm x 35cm wooden board
    * 1 wooden "bridge" with a height of 55cm

### 3D Printing and Additional Materials
* **3D Printer**
* **Filament:** PLA
* **Pieces:** 32 Brazilian 10-cent coins
* **Finishing:**
    * Contact Paper
    * Paper stickers for the pieces

---

## Hardware and 3D Printing

The physical structure of the robotic arm and its parts were produced using a 3D printer.

### Robotic Arm
The base model used for the arm was the [EEZYbotARM MK2](https://www.thingiverse.com/thing:1454048), a free design developed by "daGHIZmo".

### Modificações and Improvements
The original model served as a starting point, but it lacked the necessary reach and precision for the application. Therefore, it was necessary to remodel some parts.

* **Gear:** After assembly, a large backlash was identified in the gear, causing an imprecision of one square on the board. The part was redesigned to correct its module, which reduced the backlash.
* **Electromagnet Base:** The original design featured a claw at the end of the arm. As the ChessBOT uses an electromagnet, a new part was modeled to attach this component.

###Chess Pieces
Bases for the coins were developed and printed to make it easier for the arm to pick up each piece and to improve the opponent's gameplay experience.

### Auxiliary Parts
3D models were also printed for support components, such as two holders for captured pieces and two holders for the buttons.

---

## Assembly

The assembly of the robotic arm followed the detailed instructions in the video [EEZYbotARM MK2 3D Printed Robot Build - Chris's Basement](https://www.youtube.com/watch?v=R2MI-tpXyS4&ab_channel=ChrisRiley) by Chris Riley. No alterations were made to this process.

---

## Software

The ChessBOT's software is divided into two main components: the computer vision system to detect the opponent's move and the chess engine for decision-making.

### Computer Vision
The [**OpenCV**](https://opencv.org/) library in Python was used to identify the opponent's move. The strategy is to capture an image of the board before and another after the opponent's move to identify the differences.

The process occurs in three stages:

1.  **Board Identification:** A red color mask is applied to the image to highlight the board's border. This allows the detection of the points corresponding to the borders to know where to crop the image.
2.  **Cropping and Perspective Adjustment:** The image undergoes a perspective transformation (warp) to correct distortions caused by the camera angle, aligning the board to a top-down view. Then, the area is cropped, leaving only the useful region.
3.  **Move Detection:** With the normalized "before" and "after" images, the system calculates the difference between them. A kernel operation is applied to reduce noise. The most significant differences are used to determine the move that was made.

### Chess Engine
The robot's intelligence is provided by [**Stockfish**](https://stockfishchess.org/), an open-source chess engine.

* **Functionality:** Stockfish receives the current board configuration (the "position") and calculates what the best move would be.
* **Analysis:** In addition to suggesting a move, the engine provides a numerical evaluation that indicates whether the white or black pieces have an advantage and the size of that advantage.

---

## Design Decisions

Certain decisions were made to ensure the system's functionality and robustness.

* **Confirmation Buttons:** Move confirmation buttons were added to determine the exact moment to take the photo that will identify the opponent's move.
* **Piece Stickers:** The red and green colors were chosen because they differentiate well from the black and white of the board, facilitating the move identification by computer vision.

## How to run?

### Prerequisites

Before you start, make sure your machine has:

* Visual Studio Code ([VSCode](https://code.visualstudio.com/))
* [PlatformIO extension](https://platformio.org/install/ide?install=vscode) in VSCode
* [Node.js v20.19.4](https://nodejs.org/en/download/)
* [Python 3.13.5](https://www.python.org/downloads/)
* [Mosquitto MQTT Broker](https://mosquitto.org/download/)
* A webcam connected to the computer
* Linux operating system (or adapted for Windows/macOS where applicable)
* The ESP32 and the machine responsible for running the servers during the game must always be connected to the same Wi-Fi network.

  * To check your machine’s IP on the network, use `ifconfig`.

---

### Step-by-step to run the mapping interface (only during the board-position mapping stage).

1. Configure the **Mosquitto Broker**.
   Edit `/etc/mosquitto/mosquitto.conf` with the following content:

   ```conf
   listener 1883
   protocol mqtt

   listener 9001
   protocol websockets

   allow_anonymous true
   ```

   Start the service:

   ```bash
   sudo systemctl start mosquitto.service
   ```

2. Hardware Setup (ESP32):

   * Open **VSCode** with the **PlatformIO** extension.
   * Open the `Hardware/` folder.

     * Dependencies will be installed automatically via `platformio.ini`.
   * Set the constants in `Hardware/map.cpp` (Wi-Fi SSID and password, broker IP, and MQTT topic).
   * Compile and upload `map.cpp` to the ESP32 with PlatformIO. Keep in mind that only the code inside the `src/` folder is compiled and uploaded to the microcontroller.

3. Access the mapping interface:

   * Go into the `ui/` folder.
   * Install dependencies:

     ```bash
     npm install
     ```
   * Run the dev server:

     ```bash
     npm run dev
     ```
   * Open: [`http://localhost:3000`](http://localhost:3000).

4. Save the servo values for each board position in `hardware/lib/board/board.hpp`

---

### Step-by-step to run the Intelligence Server (Engine + Computer Vision).

1. Download **Stockfish** at: [https://stockfishchess.org/download/](https://stockfishchess.org/download/).

2. Move the binary to:

   ```bash
   /usr/local/bin/stockfish
   ```

   Or change the `STOCKFISH_PATH` constant in `server/src/main.py` to the path where Stockfish is installed on your system.

3. Go to the `server/` folder and create a virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Make sure the webcam is working.

6. Start the Python server:

   ```bash
   python3 src/main.py
   ```

---

### Game Interface Setup

1. Hardware Setup (ESP32):

   * Open **VSCode** with the **PlatformIO** extension.
   * Open the `Hardware/` folder.

     * Dependencies will be installed automatically via `platformio.ini`.
   * Set the constants in `Hardware/main.cpp` (server IP and the port of the server created in the previous step—Intelligence Server).

     * The Wi-Fi SSID and password also need to be set inside the `void setup()` function.
   * Compile and upload `main.cpp` to the ESP32 with PlatformIO. Keep in mind that only the code inside the `src/` folder is compiled and uploaded to the microcontroller.
2. Go into the `chess/` folder.
3. Install dependencies:

   ```bash
   npm install
   ```
4. Run the interface server:

   ```bash
   npm run dev
   ```
5. Access the interface at: [`http://localhost:3000`](http://localhost:3000).
6. If you need to restart the game, just press the reset button on the ESP32 and rearrange the pieces on the board.

---

## Overall Execution Flow (Board position mapping):

1. Start the **MQTT Broker (Mosquitto)** with:

   ```bash
   sudo systemctl start mosquitto.service
   ```
2. Update the Wi-Fi and Broker constants in `hardware/map.cpp` and upload the code to the **ESP32** via PlatformIO.
3. Open the **Mapping Interface** in the `ui/` folder with `npm run dev` at [`http://localhost:3000`](http://localhost:3000) to calibrate the board positions.
4. Save the mapped positions in `hardware/lib/board/board.hpp`.

## Overall Execution Flow (Full game):

1. Inside the `server/` folder, activate the **virtual environment (.venv)** by running:

   ```bash
   source .venv/bin/activate
   ```
2. Start the **Python server** with Stockfish + computer vision at `server/src/main.py`.
3. Update the Wi-Fi constants and the Python server IP in `hardware/src/main.cpp` and upload the code to the **ESP32** via PlatformIO.
4. Open the **Game Interface** in the `chess/` folder with `npm run dev` at [`http://localhost:3000`](http://localhost:3000) to start playing against the robotic arm.

### Optional:

The computer vision component (identifying piece movement) can be tested separately via Jupyter Notebook in the `server/vision/` folder:

* The `takepic.py` file is useful to simplify taking a photo before and after moving a piece from one square to another, and can be run first to store the `before.jpg` and `after.jpg` images.
* The `main.ipynb` notebook loads `before.jpg` and `after.jpg` and shows the entire processing pipeline on the images to identify which board squares changed. It’s useful for debugging possible errors in detecting the opponent’s move that may occur during the game.

