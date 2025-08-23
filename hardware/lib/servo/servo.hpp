#pragma once

#include <Arduino.h>
#include <ESP32Servo.h>
#include <math.h>

class ServoChess {
    Servo servo;
    int   initial;
    
    public:
    
    int   position;
    ServoChess(int pin, int position);
    void move(int target, float percent = 1.0, int duration = 1000, int steps = 50);
    void moveStep(int target, int step);
    void pos_default();
};
