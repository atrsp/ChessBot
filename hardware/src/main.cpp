//#include <ArduinoJson.h>
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
const char* server = "http://172.20.10.2:5000";

ServoPosition p = CHESSBOARD_POSITIONS[6][6];

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

void setup() {
    Serial.begin(115200);

    setup_wifi("Vitor", "20212022");

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
            digitalWrite(pinMagnet, HIGH);
            gotoPositionDefault();
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
    gotoPositionDown(camera);
    delay(500);
    String url = String(server) + String("/capture-board-state");
    http.begin(url);
    int httpCode = http.GET();
}

BestMove getBestMove() {
    String url = String(server) + String("/get-best-move");
    http.begin(url);
    int httpCode = http.GET();

    Serial.println(httpCode);

    if (httpCode == 200) {
        String                  payload = http.getString();
        // StaticJsonDocument<256> doc;
        // DeserializationError    error = deserializeJson(doc, payload);

        // if (!error) {
        //     int from_row = doc["from"][0];
        //     int from_col = doc["from"][1];
        //     int to_row   = doc["to"][0];
        //     int to_col   = doc["to"][1];
        //     Move from(from_row, from_col);
        //     Move to(to_row, to_col);

        //     //Serial.printf("From: (%d, %d)\n", from_row, from_col);
        //     //Serial.printf("To: (%d, %d)\n", to_row, to_col);

        //     return BestMove(from, to, false);
        // }
    }
    return BestMove();
}

void executeRobotMove(BestMove move) {
    Serial.println("Executando jogada no ROBO...");
    
    ServoPosition from = CHESSBOARD_POSITIONS[move.from.row][move.from.column];
    ServoPosition to = CHESSBOARD_POSITIONS[move.to.row][move.to.column];

    gotoPositionDown(from);
    delay(1000);
    enableMagnet();
    delay(500);
    gotoPositionDefault();
    delay(1000);
    gotoPositionDown(to);
    delay(500);
    disableMagnet();
    gotoPositionDefault();
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
    traverse_board();
    //captureBoardState();
    //waitOpponentMove();
    //BestMove move = getBestMove();
    //executeRobotMove(move);
    //confirmRobotMove();
}
