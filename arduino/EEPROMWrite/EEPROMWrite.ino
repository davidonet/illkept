#include <EEPROM.h>

// the current address in the EEPROM (i.e. which byte
// we're going to write to next)
int addr = 0;

void setup()
{
  EEPROM.write(0,'B');
  EEPROM.write(1,0);
  char * txt="La Chevre Noire";
  for(int i = 0; i<15;i++)
    EEPROM.write(i+2,txt[i]);
  Serial.begin(57600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }
  for(int i = 17; i<512;i++)
    EEPROM.write(i,0);
}

byte value=0;
byte address =0;

void loop()
{

  // read a byte from the current address of the EEPROM
  value = EEPROM.read(address);

  Serial.print(address);
  Serial.print("\t");
  Serial.print(value, DEC);
  Serial.print("\t");
  Serial.print((char)value);
  Serial.println();

  // advance to the next address of the EEPROM
  address = address + 1;

  // there are only 512 bytes of EEPROM, from 0 to 511, so if we're
  // on address 512, wrap around to address 0
  if (address == 32)
    address = 0;

  delay(500);
}





