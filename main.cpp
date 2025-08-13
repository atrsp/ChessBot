#include <board.hpp>
#include <servo.hpp>

#define pinServoBase 18
#define pinServoLeft 19
#define pinServoRight 21
#define pinMagnet 32

ServoChess servoBase(pinServoBase, POS_INITIAL_BASE);
ServoChess servoLeft(pinServoLeft, POS_INITIAL_LEFT);
ServoChess servoRight(pinServoRight, POS_INITIAL_RIGHT);

ServoPosition p = CHESSBOARD_POSITIONS[6][6];

void setup() {
    Serial.begin(115200);

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

void loop() {
    traverse_board();
}
