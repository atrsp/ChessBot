#include <ESP32Servo.h>

// Definição dos pinos
#define pinServBase 18
#define pinServEsquerda 19
#define pinServDireita 21
#define pinMagnet 32

Servo servBase, servEsquerda, servDireita;

// Posições iniciais em microssegundos
const int POS_INICIAL_BASE = 1500;       // 90°
const int POS_INICIAL_ESQUERDA = 2500;   // 180°
const int POS_INICIAL_DIREITA = 1166;    // 60°

const int DELAY_ESTABILIZACAO = 500;
const int DELAY_ELETROIMA = 300;

// Posições convertidas para microssegundos
struct Posicao {
  int base;
  int esquerda;
  int direita;
};

const Posicao posicoes[] = {
  {2388, 1764, 1388}, // Posição 1 (177°, 119°, 82°)
  {1100, 2331, 1890}, // Posição 2 (63°, 175°, 135°)
  {1990, 2360, 1904}, // Posição 3 (139°, 180°, 139°)
  {695, 1743, 1386},  // Posição 4 (13°, 115°, 81°)
  // {1550, 2350, 1849}, // Posição 5 (96°, 168°, 124°)
  // {1705, 1677, 1394}  // Posição 6 (112°, 108°, 81°)
};

const int NUM_POSICOES = sizeof(posicoes) / sizeof(posicoes[0]);

// Estados atuais dos servos (em microssegundos)
int baseAtual = POS_INICIAL_BASE;
int esquerdaAtual = POS_INICIAL_ESQUERDA;
int direitaAtual = POS_INICIAL_DIREITA;

// Função de easing (suavização)
float easeInOut(float t) {
  return 0.5 * (1 - cos(t * PI));
}

// Movimentação suave em microssegundos
void moverServoSuave(Servo& servo, int& atual, int destino, int duracaoMs = 1000, int passos = 50) {
  int delta = abs(destino - atual);

  if (delta <= 222) { // ~30° em microssegundos
    int passo = (destino > atual) ? 1 : -1;
    int delayPorUs = duracaoMs * 1000L / max(delta, 1);

    for (int us = atual; us != destino; us += passo) {
      servo.writeMicroseconds(us);
      delayMicroseconds(delayPorUs);
    }
    servo.writeMicroseconds(destino);
  } else {
    for (int i = 0; i <= passos; i++) {
      float t = (float)i / passos;
      float curva = easeInOut(t);
      int valorInterpolado = atual + (destino - atual) * curva;
      servo.writeMicroseconds(valorInterpolado);
      delayMicroseconds((duracaoMs * 1000L) / passos);
    }
  }

  atual = destino;
}

// Prototipagem
void moverParaPosicaoInicial();
void moverParaPosicao(const Posicao& pos);
void executarSequenciaCompleta(int indice);
void ligarEletroima();
void desligarEletroima();
void paradaEmergencia();

void setup() {
  Serial.begin(115200);
  Serial.println("=== INICIANDO GARRA ROBÓTICA COM ELETROÍMÃ ===");

  servBase.attach(pinServBase);
  servEsquerda.attach(pinServEsquerda);
  servDireita.attach(pinServDireita);

  pinMode(pinMagnet, OUTPUT);
  digitalWrite(pinMagnet, LOW);

  Serial.println("Movendo para posição inicial...");
  moverParaPosicaoInicial();

  Serial.println("Sistema pronto para operação!");
  Serial.println("Pressione qualquer tecla para iniciar a sequência...");
  while (Serial.available() == 0) delay(100);
  Serial.read();
}

void loop() {
  Serial.println("\n=== INICIANDO CICLO COMPLETO DE OPERAÇÃO ===");

  for (int i = 0; i < NUM_POSICOES; i++) {
    executarSequenciaCompleta(i);
    if (i < NUM_POSICOES - 1) {
      Serial.println("Aguardando próxima sequência...");
      delay(2000);
    }
  }

  Serial.println("\n=== CICLO COMPLETO FINALIZADO ===");
  Serial.println("Aguardando 10 segundos para reiniciar...");
  delay(10000);
}

void executarSequenciaCompleta(int indice) {
  Serial.printf("\n--- SEQUÊNCIA %d ---\n", indice + 1);

  Serial.printf("Indo para posição %d (pegar peça)...\n", indice + 1);
  moverParaPosicao(posicoes[indice]);

  Serial.println("Ligando eletroímã - PEGANDO PEÇA");
  ligarEletroima();

  Serial.println("Retornando à posição inicial com peça...");
  moverParaPosicaoInicial();

  int proximoIndice = (indice + 1) % NUM_POSICOES;
  Serial.printf("Indo para posição %d (soltar peça)...\n", proximoIndice + 1);
  moverParaPosicao(posicoes[proximoIndice]);

  Serial.println("Desligando eletroímã - SOLTANDO PEÇA");
  desligarEletroima();

  Serial.println("Retornando à posição inicial...");
  moverParaPosicaoInicial();

  Serial.printf("Sequência %d concluída!\n", indice + 1);
}

void moverParaPosicao(const Posicao& pos) {
  Serial.printf("Movendo para posição: Base=%dus, Esq=%dus, Dir=%dus\n", 
                pos.base, pos.esquerda, pos.direita);

  moverServoSuave(servBase, baseAtual, pos.base);
  moverServoSuave(servDireita, direitaAtual, pos.direita);
  moverServoSuave(servEsquerda, esquerdaAtual, pos.esquerda);

  delay(DELAY_ESTABILIZACAO);
  Serial.println("Posição alcançada!");
}

void moverParaPosicaoInicial() {
  Serial.println("Movendo para posição inicial...");
  moverServoSuave(servDireita, direitaAtual, POS_INICIAL_DIREITA);
  moverServoSuave(servEsquerda, esquerdaAtual, POS_INICIAL_ESQUERDA);
  moverServoSuave(servBase, baseAtual, POS_INICIAL_BASE);
  delay(DELAY_ESTABILIZACAO);
  Serial.println("Posição inicial alcançada!");
}

void ligarEletroima() {
  digitalWrite(pinMagnet, HIGH);
  delay(DELAY_ELETROIMA);
  Serial.println("✓ Eletroímã LIGADO - Peça capturada!");
}

void desligarEletroima() {
  digitalWrite(pinMagnet, LOW);
  delay(DELAY_ELETROIMA);
  Serial.println("✓ Eletroímã DESLIGADO - Peça liberada!");
}

void paradaEmergencia() {
  Serial.println("!!! PARADA DE EMERGÊNCIA !!!");
  digitalWrite(pinMagnet, LOW);
  Serial.println("Sistema parado. Reset necessário.");
  while (true) delay(1000);
}
