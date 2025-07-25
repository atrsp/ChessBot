#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>
#include <math.h>

// Wi-Fi
const char* ssid = "S23";
const char* password = "12345678.";

// MQTT
const char* mqtt_server = "192.168.83.126";
const char* mqtt_topic = "braco/comando";

WiFiClient espClient;
PubSubClient client(espClient);

// Pinos
#define pinServBase     18
#define pinServEsquerda 19
#define pinServDireita  21
#define pinMagnet       32

// Servos
Servo servBase, servEsquerda, servDireita;

// Posições atuais em microssegundos
int posBase     = 2500;
int posEsquerda = 2500;
int posDireita  = 1100;

// Função de easing
float easeInOut(float t) {
  return 0.5 * (1 - cos(t * PI));
}

// Movimento suave com easing
void moverServoSuave(Servo& servo, int& atual, int destino, int duracaoMs = 1000, int passos = 50) {
  int delta = abs(destino - atual);

  if (delta <= 222) {  // ~30°
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

void setup_wifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");
}

void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  msg.trim();
  Serial.print("Comando recebido: ");
  Serial.println(msg);

  // Esperado: base|esquerdo|direito|magnet
  int sep1 = msg.indexOf('|');
  int sep2 = msg.indexOf('|', sep1 + 1);
  int sep3 = msg.indexOf('|', sep2 + 1);

  if (sep1 == -1 || sep2 == -1 || sep3 == -1) {
    Serial.println("Formato inválido!");
    return;
  }

  int base     = msg.substring(0, sep1).toInt();
  int esquerdo = msg.substring(sep1 + 1, sep2).toInt();
  int direito  = msg.substring(sep2 + 1, sep3).toInt();
  int magnet   = msg.substring(sep3 + 1).toInt();

  Serial.printf("----> %dus %dus %dus magnet=%d\n", base, esquerdo, direito, magnet);

  moverServoSuave(servBase, posBase, base);
  moverServoSuave(servEsquerda, posEsquerda, esquerdo);
  moverServoSuave(servDireita, posDireita, direito);

  digitalWrite(pinMagnet, magnet == 1 ? HIGH : LOW);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      client.subscribe(mqtt_topic);
      Serial.println("MQTT conectado!");
    } else {
      Serial.print("Falha MQTT, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5s...");
      delay(5000);
    }
  }
}

void posDefault() {
  moverServoSuave(servBase, posBase, 2500);
  delay(100);
  moverServoSuave(servEsquerda, posEsquerda, 2500);
  delay(100);
  moverServoSuave(servDireita, posDireita, 1100);
  delay(100);
}

void setup() {
  Serial.begin(115200);

  servBase.attach(pinServBase);
  servEsquerda.attach(pinServEsquerda);
  servDireita.attach(pinServDireita);
  pinMode(pinMagnet, OUTPUT);
  digitalWrite(pinMagnet, LOW);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  posDefault();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
