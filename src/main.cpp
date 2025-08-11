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
    digitalWrite(pinMagnet, HIGH);
}

void gotoPositionDown(ServoPosition p) {
    servoBase.move(p.base);
    servoRight.move(p.right, 0.7);
    servoLeft.move(p.left, 0.7);

    for (int i = 1; i <= 10; i++) {
        servoRight.move(p.right, 0.7 + (0.03 * i));
        servoLeft.move(p.left, 0.7 + (0.03 * i));
    }
}

void gotoPositionUp(ServoPosition p) {
    for (int i = 10; i >= 0; i--) {
        servoRight.move(p.right, 0.8 + (0.02 * i), 50, 2);
        servoLeft.move(p.left, 0.9 + (0.01 * i), 50, 2);
    }

    servoRight.move(POS_INITIAL_RIGHT);
    servoLeft.move(POS_INITIAL_LEFT);
    servoBase.move(POS_INITIAL_BASE);
    
}

void loop() {
    gotoPositionDown(p);
    delay(3000);
    gotoPositionUp(p);
}
