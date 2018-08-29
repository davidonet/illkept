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

// Hardware configuration: Set up nRF24L01 radio on SPI bus plus pins 7 & 8
RF24 radio(6, 7);

byte addresses[][7] =
{
    "Master", "BagA"
};

byte bagStatus[10][3];

unsigned long lastTime;
unsigned long lastUpdate[10];

void setup()
{


    Serial.begin(57600);
    // Setup and configure rf radio
    printf_begin();
    radio.begin();                          // Start up the radio
    radio.setAutoAck(1);                    // Ensure autoACK is enabled
    radio.setRetries(15, 15);               // Max delay between retries & number of retries
    radio.openReadingPipe(1, addresses[0]);
    radio.startListening();
    // Start listening
    for (byte b = 0; b < 10; b++)
    {
        bagStatus[b][0] = 0;
        bagStatus[b][1] = 0;
        bagStatus[b][2] = 0;
        lastUpdate[b] = millis();
    }
    lastTime = millis();
    //radio.printDetails();
    pinMode(9, INPUT);
    digitalWrite(9, HIGH);
}

byte slave[] = "Bag0";

void loop(void)
{

    if (LOW == digitalRead(9))
    {
        radio.stopListening();
        for (byte b = 0; b < 10; b++)
        {
            char buf[12] =
            {
                'B', '0' + b, 'M', '0', 'D', '0', 0, 0, 0, 0, 0, 'E'
            };
            slave[3] = '0' + b;
            radio.openWritingPipe(slave);
            radio.write(buf, 12);
            delay(50);
            buf[3] = '1';
            radio.write(buf, 12);
            delay(25);

        }
        printf("{\"lastcmd\":\"reset\"}\n");
        radio.startListening();
    }

    if (3 < Serial.available())
    {
        while (Serial.read() != 'B')
        {

        }
        char buf[12] =
        {
            'B', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        };
        Serial.readBytesUntil('E', buf + 1, 12);
        if (('B' == buf[0]) && 'M' == buf[2])
        {
            byte b = buf[1] - '0';
            byte m = buf[3] - '0';
            char c = buf[4];
            int v = atoi(&buf[5]);
            printf("{ \"lastcmd\":\"%s -> bag : %d, motor : %d, cmd : %c, val : %d\"}\n", buf, b, m, c, v);
            slave[3] = buf[1];
            radio.stopListening();
            radio.openWritingPipe(slave);
            buf[11] = 'E';
            radio.write(buf, 12);
            radio.startListening();
        }
    }

    if (1000 < (millis() - lastTime))
    {

        for (byte b = 0; b < 10; b++)
        {
            if (20000 < (millis() - lastUpdate[b] ))
            {
                bagStatus[b][0] = 64;
                bagStatus[b][1] = 0;
                bagStatus[b][2] = 0;
            }
        }

        lastTime = millis();
        printf("{\"connected\":true,\"bag\":[");
        for (byte b = 0; b < 10; b++)
        {
            printf("{\"v\":%d,\"m0\":%d,\"m1\":%d}", bagStatus[b][0], bagStatus[b][1], bagStatus[b][2]);
            if (b < 9)
                printf(",");
        }
        printf("]");
        printf("}\n");
    }

    if (radio.available())
    {
        while (radio.available())
        {
            byte pkt[] =
            {
                0, 0, 0, 0
            };
            radio.read( pkt, 4 );
            bagStatus[pkt[0]][0] = pkt[3];
            bagStatus[pkt[0]][1] = pkt[1];
            bagStatus[pkt[0]][2] = pkt[2];
            printf("{\"lastcmd\":\"bag %d csa : %d csb : %d  volt : %d\"}\n", pkt[0], pkt[1], pkt[2], pkt[3]);
            lastUpdate[pkt[0]] = millis();
        }
    }



}























