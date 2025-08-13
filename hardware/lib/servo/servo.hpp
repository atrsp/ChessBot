#pragma once

#include <Arduino.h>
#include <ESP32Servo.h>
#include <math.h>

class ServoChess {
    Servo servo;
    int   position;
    int   initial;

   public:
    ServoChess(int pin, int position);
    void move(int target, float percent = 1.0, int duration = 1000, int steps = 50);
    void pos_default();
};
