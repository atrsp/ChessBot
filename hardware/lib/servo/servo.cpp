#include <servo.hpp>

float easeInOut(float t) {
    return 0.5 * (1 - cos(t * PI));
}

ServoChess::ServoChess(int pin, int position) {
    this->servo = Servo();
    this->servo.attach(pin);
    this->position = position;
    this->initial = position;
    this->servo.writeMicroseconds(position);
}

void ServoChess::move(int target, float percent, int duration, int steps) {
    int &current = this->position;
    int  delta   = abs(target - current);
    target = current + (target - current) * percent;

    if (delta <= 222) {
        int step       = (target > current) ? 1 : -1;
        int delayPerUs = duration * 1000L / max(delta, 1);

        for (int us = current; us != target; us += step) {
            servo.writeMicroseconds(us);
            delayMicroseconds(delayPerUs);
        }
        servo.writeMicroseconds(target);
    } else {
        for (int i = 0; i <= steps; i++) {
            float t                 = (float)i / steps;
            float curve             = easeInOut(t);
            int   interpolatedValue = current + (target - current) * curve;
            servo.writeMicroseconds(interpolatedValue);
            delayMicroseconds((duration * 1000L) / steps);
        }
    }

    position = target;
}


void ServoChess::moveStep(int target, int step) {
    int &current = this->position;
    int signal       = (target > current) ? 1 : -1;
    step *= signal;
    this->move(current+step, 1, 300);
}

void ServoChess::pos_default() {
    this->move(this->initial);
}