#include <ArduinoJson.h>
#include <Bounce2.h>
#include <HTTPClient.h>

#include <board.hpp>
#include <servo.hpp>
#include <utils.hpp>

#define pinServoBase 18
#define pinServoLeft 19
#define pinServoRight 21
#define pinConfirm 25
#define pinMagnet 32

ServoChess  servoBase(pinServoBase, POS_INITIAL.base);
ServoChess  servoLeft(pinServoLeft, POS_INITIAL.left);
ServoChess  servoRight(pinServoRight, POS_INITIAL.right);
HTTPClient  http;
const char* server  = "http://172.20.10.8:5000";
Bounce      confirm = Bounce();

class Move {
   public:
    int row;
    int column;

    Move() {
    }

    Move(int row, int column) {
        this->row    = row;
        this->column = column;
    }
};

class BestMove {
   public:
    Move from;
    Move to;
    bool captured;

    BestMove() {
    }

    BestMove(Move from, Move to, bool captured) {
        this->from     = from;
        this->to       = to;
        this->captured = captured;
    }
};

void gotoPositionDown(ServoPosition p, VerticalTuning f) {
    servoBase.move(p.base);

    servoRight.move(p.right, f.percent);
    servoLeft.move(p.left, f.percent);

    int remainingLeft  = abs(servoLeft.position - p.left);
    int remainingRight = abs(servoRight.position - p.right);

    int stepsRight = remainingRight / f.deltaRight;
    int stepsLeft  = remainingLeft / f.deltaLeft;

    while (stepsRight > 0 and stepsLeft > 0) {
        if (stepsLeft > 0 and servoLeft.position != p.left) {
            servoLeft.moveStep(p.left, f.deltaLeft);
            stepsLeft--;
        }
        if (stepsRight > 0 and servoRight.position != p.right) {
            servoRight.moveStep(p.right, f.deltaRight);
            stepsRight--;
        }
    }

    servoRight.move(p.right);
    servoLeft.move(p.left);
}

void gotoPositionUp(ServoPosition p, VerticalTuning f) {
    float percent = 1 - f.percent;
    int remainingLeft  = abs((servoLeft.position - p.left) * percent);
    int remainingRight = abs((servoRight.position - p.right) * percent);

    int stepsRight = remainingRight / f.deltaRight;
    int stepsLeft  = remainingLeft / f.deltaLeft;

    while (stepsRight > 0 and stepsLeft > 0) {
        if (stepsRight > 0 and servoRight.position != p.right) {
            servoRight.moveStep(p.right, f.deltaRight);
            stepsRight--;
        }
        if (stepsLeft > 0 and servoLeft.position != p.left) {
            servoLeft.moveStep(p.left, f.deltaLeft);
            stepsLeft--;
        }
    }

    servoRight.move(p.right);
    servoLeft.move(p.left);

    servoBase.move(p.base);
}

void gotoPositionCamera() {
    servoBase.move(POS_CAMERA.base);
    servoRight.move(POS_CAMERA.right);
    servoLeft.move(POS_CAMERA.left);
}

void gotoPositionDefault() {
    servoLeft.pos_default();
    servoRight.pos_default();
    servoBase.pos_default();
}

void waitKey() {
    while (1) {
        confirm.update();
        if (confirm.fell()) {
            break;
        }
    }
}

void disableMagnet() {
    digitalWrite(pinMagnet, LOW);
}

void enableMagnet() {
    digitalWrite(pinMagnet, HIGH);
}

void captureBoardState() {
    gotoPositionCamera();
    delay(500);
    String url = String(server) + String("/capture-board-state");
    http.begin(url);
    int httpCode = http.GET();
    http.end();
}

BestMove getBestMove() {
    String url = String(server) + String("/get-best-move");
    http.begin(url);
    int httpCode = http.GET();

    Serial.println(httpCode);
    Serial.printf("HTTP CODE DO BEST MOVE: %d\n", httpCode);

    if (httpCode == 200) {
        String payload = http.getString();
        Serial.println(payload);
        StaticJsonDocument<256> doc;
        DeserializationError    error = deserializeJson(doc, payload);

        if (!error) {
            int  from_row = doc["from"][0];
            int  from_col = doc["from"][1];
            int  to_row   = doc["to"][0];
            int  to_col   = doc["to"][1];
            bool captured = doc["captured"];
            Move from(from_row, from_col);
            Move to(to_row, to_col);

            Serial.printf("From: (%d, %d)\n", from_row, from_col);
            Serial.printf("To: (%d, %d)\n", to_row, to_col);
            Serial.printf("Captured: %d \n", captured);

            return BestMove(from, to, captured);
        }
    }

    http.end();

    Serial.println("Deu merdaaa!!!!!!!!!!!!!!!");

    while (Serial.available() == 0) delay(100);
    Serial.read();

    return BestMove();
}

void executeRobotMove(BestMove move) {
    Serial.println("Executando jogada no ROBO...");


    gotoPositionDefault();

    ServoPosition  from = CHESSBOARD_POSITIONS[move.from.row][move.from.column];
    VerticalTuning from_vt =
        CHESSBOARD_VERTICAL_TUNNING[move.from.row][move.from.column];

    ServoPosition  to = CHESSBOARD_POSITIONS[move.to.row][move.to.column];
    VerticalTuning to_vt =
        CHESSBOARD_VERTICAL_TUNNING[move.to.row][move.to.column];

    if (move.captured) {
        gotoPositionDown(to, to_vt);
        delay(500);
        enableMagnet();
        gotoPositionUp(POS_THRASH, to_vt);
        delay(500);
        disableMagnet();
        gotoPositionDefault();
    }

    gotoPositionDown(from, from_vt);
    delay(1000);
    enableMagnet();
    delay(500);
    gotoPositionUp(POS_INITIAL, from_vt);

    delay(1000);
    gotoPositionDown(to, to_vt);
    delay(500);
    disableMagnet();
    gotoPositionUp(POS_INITIAL, to_vt);
}

void waitOpponentMove() {
    Serial.println("15 segundos para fazer a jogada");
    waitKey();
}

void confirmRobotMove() {
    Serial.println("15 segundos para CONFIRMAR a jogada");
    waitKey();
}

void resetGame() {
    String url = String(server) + String("/reset");
    http.begin(url);
    int httpCode = http.GET();
    http.end();
}

void setup() {
    Serial.begin(115200);

    setup_wifi("iPhone de Felipe", "felipeoi");

    pinMode(pinMagnet, OUTPUT);
    digitalWrite(pinMagnet, LOW);

    pinMode(pinConfirm, INPUT_PULLUP);
    confirm.attach(pinConfirm);
    confirm.interval(50);
    gotoPositionDefault();

    resetGame();
}

void loop() {
    //enableMagnet();
    //delay(5000);
//
    //for (int j = 0; j < 8; j++) {
    //    ServoPosition  p = CHESSBOARD_POSITIONS[6][j];
    //    VerticalTuning f = CHESSBOARD_VERTICAL_TUNNING[6][j];
    //    gotoPositionDown(p, f);
    //    disableMagnet();
    //    delay(1000);
    //    enableMagnet();
    //    
    //    gotoPositionUp(POS_INITIAL, f);
    //    delay(2000);
    //}
//
    //disableMagnet();
    //while (1);

     captureBoardState();
     waitOpponentMove();

     int httpCode = -1;

     while (httpCode < 0) {
         String url = String(server) + String("/confirm-opponent-move");

         http.begin(url);
         httpCode = http.GET();
         http.end();
         Serial.printf("HTT CODE: %d\n", httpCode);
     }

    BestMove move = getBestMove();
    executeRobotMove(move);
    confirmRobotMove();
}
