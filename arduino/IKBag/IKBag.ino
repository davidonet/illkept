

/*
 Copyright (C) 2011 J. Coliz <maniacbug@ymail.com>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 version 2 as published by the Free Software Foundation.
 //2014 - TMRh20 - Updated along with Optimized RF24 Library fork
 */

/**
 * Example for Getting Started with nRF24L01+ radios.
 *
 * This is an example of how to use the RF24 class to communicate on a basic level.  Write this sketch to two
 * different nodes.  Put one of the nodes into 'transmit' mode by connecting with the serial monitor and
 * sending a 'T'.  The ping node sends the current time to the pong node, which responds by sending the value
 * back.  The ping node can then see how long the whole cycle took.
 * Note: For a more efficient call-response scenario see the GettingStarted_CallResponse.ino example.
 * Note: When switching between sketches, the radio may need to be powered down to clear settings that are not "un-set" otherwise
 */


#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
#include "printf.h"
#include <EEPROM.h>

// Hardware configuration: Set up nRF24L01 radio on SPI bus plus pins 7 & 8
RF24 radio(7, 8);
byte addresses[][7] =
{
    "Bag0", "BagA", "Master"
};


#define IN1 2
#define IN2 3
#define IN3 4
#define IN4 5

#define ENA 10
#define ENB 9

#define CSA 0
#define CSB 1
#define VLT 2

void setPwmFrequency(int pin, int divisor)
{
    byte mode;
    if (pin == 5 || pin == 6 || pin == 9 || pin == 10)
    {
        switch (divisor)
        {
        case 1:
            mode = 0x01;
            break;
        case 8:
            mode = 0x02;
            break;
        case 64:
            mode = 0x03;
            break;
        case 256:
            mode = 0x04;
            break;
        case 1024:
            mode = 0x05;
            break;
        default:
            return;
        }
        if (pin == 5 || pin == 6)
        {
            TCCR0B = TCCR0B & 0b11111000 | mode;
        }
        else
        {
            TCCR1B = TCCR1B & 0b11111000 | mode;
        }
    }
    else if (pin == 3 || pin == 11)
    {
        switch (divisor)
        {
        case 1:
            mode = 0x01;
            break;
        case 8:
            mode = 0x02;
            break;
        case 32:
            mode = 0x03;
            break;
        case 64:
            mode = 0x04;
            break;
        case 128:
            mode = 0x05;
            break;
        case 256:
            mode = 0x06;
            break;
        case 1024:
            mode = 0x7;
            break;
        default:
            return;
        }
        TCCR2B = TCCR2B & 0b11111000 | mode;
    }
}


void setup()
{
    if ('B' == EEPROM.read(0))
        addresses[0][3] = '0' + EEPROM.read(1);

    Serial.begin(57600);
    printf_begin();
    printf("\nBag : %s\n", addresses[0]);

    // Setup and configure rf radio
    radio.begin();                          // Start up the radio
    radio.setAutoAck(1);                    // Ensure autoACK is enabled
    radio.setRetries(15, 15);               // Max delay between retries & number of retries
    radio.openWritingPipe(addresses[2]);
    radio.openReadingPipe(1, addresses[0]);
    radio.openReadingPipe(2, addresses[0]);

    radio.startListening();                 // Start listening
    radio.printDetails();                   // Dump the configuration of the rf unit for debugging

    pinMode(IN1, OUTPUT);
    pinMode(IN2, OUTPUT);
    pinMode(IN3, OUTPUT);
    pinMode(IN4, OUTPUT);
    pinMode(ENA, OUTPUT);
    pinMode(ENB, OUTPUT);
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);

    setPwmFrequency(ENA, 1);
    setPwmFrequency(ENB, 1);

}

byte abaq[] =
{
    0, 160, 170, 180, 191, 202, 212, 223, 233, 244, 255
};

void run(byte m, int val)
{
    if (0 == m)
    {
        if (val < 0)
        {
            digitalWrite(IN1, HIGH);
            digitalWrite(IN2, LOW);
            analogWrite(ENA, abaq[-val / 10]);
        }
        else
        {
            digitalWrite(IN1, LOW);
            digitalWrite(IN2, HIGH);
            analogWrite(ENA, abaq[val / 10]);
        }
    }
    else
    {
        if (val < 0)
        {
            digitalWrite(IN3, HIGH);
            digitalWrite(IN4, LOW);
            analogWrite(ENB, abaq[-val / 10]);
        }
        else
        {
            digitalWrite(IN3, LOW);
            digitalWrite(IN4, HIGH);
            analogWrite(ENB, abaq[val / 10]);
        }
    }
}

void pulse(byte m, int val)
{
    if (0 == m)
    {
        digitalWrite(IN1, HIGH);
        digitalWrite(IN2, LOW);
        analogWrite(ENA, 255);
        delay(val);
        digitalWrite(IN1, LOW);
        digitalWrite(IN2, LOW);
        analogWrite(ENA, 0);
        delay(val);
    }
    else
    {
        digitalWrite(IN3, HIGH);
        digitalWrite(IN4, LOW);
        analogWrite(ENB, 255);
        delay(val);
        digitalWrite(IN3, LOW);
        digitalWrite(IN4, LOW);
        analogWrite(ENB, 0);

    }
}

int cur[3][16];
byte i = 0;
unsigned long last = 0;


void loop(void)
{
    cur[0][i] = analogRead(CSA);
    cur[1][i] = analogRead(CSB);
    cur[2][i] = analogRead(VLT);
    i = (i + 1) % 16;
    int sum[3] =
    {
        0, 0, 0
    };
    for (int j = 0; j < 16; j++)
    {
        sum[0] += cur[0][j];
        sum[1] += cur[1][j];
        sum[2] += cur[2][j];
    }
    if (10000 < (millis() - last))
    {
        last = millis();
        byte pkt[] =
        {
            0, 0, 0, 0
        };
        pkt[0] = EEPROM.read(1);
        pkt[1] = sum[0] >> 4;
        pkt[2] = sum[1] >> 4;
        pkt[3] = sum[2] >> 4;
        if (120 < pkt[1])
            run(0, 0);
        if (120 < pkt[2])
            run(1, 0);
        radio.stopListening();
        printf("bag %d csa : %d csb : %d  volt : %d\n\r", pkt[0], pkt[1], pkt[2], pkt[3]);
        radio.write(pkt, 4);
        radio.startListening();
    }


    if ( radio.available())
    {
        char buf[12] =
        {
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        };                                       // Variable for the received timestamp
        while (radio.available())                                     // While there is data ready
        {
            radio.read( buf, 12 );             // Get the payload
        }
        if (('B' == buf[0]) && 'M' == buf[2])
        {
            byte b = buf[1] - '0';
            byte m = buf[3] - '0';
            char c = buf[4];
            int v = atoi(&buf[5]);
            printf("motor : %d, cmd : %c, val : %d\n\r", m, c, v);
            if ('D' == c)
                run(m, v);
            if ('P' == c)
                pulse(m, v);
        }
    }
    else
    {
        delay(20);
    }
}




