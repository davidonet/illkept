
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
#include "printf.h"

void setup(){
  Serial.begin(57600);
  // Setup and configure rf radio
  printf_begin();
  pinMode(9,OUTPUT);
  pinMode(4,OUTPUT);
  pinMode(5,OUTPUT);
  analogWrite(9,0);
  digitalWrite(4,HIGH);
  digitalWrite(5,LOW);

}

int cur[10];
byte i=0;
unsigned long last =0;
void loop(){
  cur[i] = analogRead(1);
  i=(i+1)%10;
  int sum=0;
  for(int j=0;j<10;j++) sum += cur[j];
  if(1000<(millis()-last)){
    printf("%d\n",sum/10);
    last = millis();
  }
  delay(10);
}







