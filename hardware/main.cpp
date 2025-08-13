#include <HTTPClient.h>

#include <board.hpp>
#include <servo.hpp>
#include <utils.hpp>

#define pinServoBase 18
#define pinServoLeft 19
#define pinServoRight 21
#define pinMagnet 32

ServoChess  servoBase(pinServoBase, POS_INITIAL_BASE);
ServoChess  servoLeft(pinServoLeft, POS_INITIAL_LEFT);
ServoChess  servoRight(pinServoRight, POS_INITIAL_RIGHT);
HTTPClient  http;
const char* server = "192.168.210.126:5000";

ServoPosition p = CHESSBOARD_POSITIONS[6][6];

class BestMove {};

void setup() {
    Serial.begin(115200);

    setup_wifi("S23", "12345678.");

    pinMode(pinMagnet, OUTPUT);
    digitalWrite(pinMagnet, LOW);
}

void gotoPositionDown(ServoPosition p) {
    servoBase.move(p.base);
    servoRight.move(p.right);
    servoLeft.move(p.left);
}

void gotoPositionUp(ServoPosition p) {
    servoBase.move(p.base);
    servoRight.move(p.right);
    servoLeft.move(p.left);
}

void gotoPositionDefault() {
    servoLeft.pos_default();
    servoRight.pos_default();
    servoBase.pos_default();
}

void traverse_board() {
    for (int i = 7; i >= 0; i--) {
        for (int j = 7; j >= 0; j--) {
            ServoPosition p = CHESSBOARD_POSITIONS[i][j];
            gotoPositionDown(p);
            gotoPositionDefault();
        }
    }
}

void captureBoardState() {
    String url = String(server) + String("/capture-board-state");
    http.begin(url);
    int httpCode = http.GET();
}

BestMove getBestMove() {
    String url = String(server) + String("/get-best-move");
    http.begin(url);
    int httpCode = http.GET();
    return BestMove();
}

void executeRobotMove(BestMove move) {
    Serial.println("Executando jogada no ROBO...");
}

void waitOpponentMove() {
    Serial.println("Press ENTER to confirm opponent move...");

    while (Serial.available() == 0) delay(100);
    Serial.read();

    String url = String(server) + String("/confirm-opponent-move");
    http.begin(url);
    int httpCode = http.GET();
}

void confirmRobotMove() {
    Serial.println("Press ENTER to confirm robot move...");

    while (Serial.available() == 0) delay(100);
    Serial.read();
}

void loop() {
    captureBoardState();
    waitOpponentMove();
    BestMove move = getBestMove();
    executeRobotMove(move);
    confirmRobotMove();
}
