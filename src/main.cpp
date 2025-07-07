#include <WiFi.h>
#include <PubSubClient.h>
#include <ESP32Servo.h>

// Wi-Fi
const char* ssid = "S23";
const char* password = "12345678.";

// MQTT
const char* mqtt_server = "192.168.56.126";
const char* mqtt_topic = "braco/comando";

WiFiClient espClient;
PubSubClient client(espClient);

// Pinos
#define pinServBase     18
#define pinServEsquerda 19
#define pinServDireita  21
#define pinMagnet       22

// Servos
Servo servBase, servEsquerda, servDireita;

void setup_wifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado");
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

  Serial.printf("----> %d %d %d %d \n", base, esquerdo, direito, magnet);

  // Aplica comandos
  servBase.write(base);
  servEsquerda.write(esquerdo);
  servDireita.write(direito);

  digitalWrite(pinMagnet, magnet == 1 ? HIGH : LOW);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      client.subscribe(mqtt_topic);
    } else {
      delay(5000);
    }
  }
}

void posDefault() {
  servBase.write(180);
  delay(500);
  servEsquerda.write(180);
  delay(500);
  servDireita.write(40);
  delay(500);
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



