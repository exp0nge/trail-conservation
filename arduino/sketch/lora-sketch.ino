#include <Arduino.h>
#include "disk91_LoRaE5.h"
#include "Seeed_Arduino_GroveAI.h"
#include <Wire.h>
#include "TFT_eSPI.h"
#define FF17 &FreeSans9pt7b

// keys
uint8_t deveui[] = {0x...};
uint8_t appeui[] = {0x...};
uint8_t appkey[] = {0x...};

GroveAI ai(Wire);
TFT_eSPI tft;
Disk91_LoRaE5 lorae5(false); // true, false whatever

void setup()
{

  Wire.begin();
  Serial.begin(115200);
  randomSeed(analogRead(0));

  tft.begin();
  tft.setRotation(3);
  tft.fillScreen(TFT_BLACK);
  tft.setFreeFont(FF17);
  tft.fillScreen(TFT_BLACK);
  tft.setCursor(0, 20);

  Serial.println("begin");
  tft.println("begin");

  uint32_t start = millis();

  tft.println("LoRa E5 Init");

  // init the library, search the LORAE5 over the different WIO port available
  if (!lorae5.begin(DSKLORAE5_SEARCH_WIO))
  {
    Serial.println("LoRa E5 Init Failed");
    tft.println("LoRa E5 Init Failed");
    while (1)
      ;
  }

  tft.println("LoRa E5 Setup");
  // Setup the LoRaWan Credentials
  if (!lorae5.setup(
        DSKLORAE5_ZONE_US915, // LoRaWan Radio Zone EU868 here
        deveui,
        appeui,
        appkey))
  {
    Serial.println("LoRa E5 Setup Failed");
    tft.println("LoRa E5 Setup Failed");
    while (1);
  }

  if (ai.begin(ALGO_OBJECT_DETECTION, MODEL_EXT_INDEX_1)) // Object detection and pre-trained model 1
  {
    Serial.print("Version: ");
    Serial.println(ai.version());
    Serial.print("ID: ");
    Serial.println(ai.id());
    Serial.print("Algo: ");
    Serial.println(ai.algo());
    Serial.print("Model: ");
    Serial.println(ai.model());
    Serial.print("Confidence: ");
    Serial.println(ai.confidence());
    tft.print("AI version ");
    tft.println(ai.version());
  }
  else
  {
    Serial.println("Algo begin failed. Program halting here.");
    tft.println("Algo begin failed. Program halting here.");
    while (1)
      ;
  }
}

void loop()
{
  uint32_t tick = millis();
  tft.fillScreen(TFT_BLACK);
  tft.setCursor(0, 20);
  tft.println("Begin ai invoke");
  //  tft.println(ai.state());
  if (ai.invoke()) // begin invoke
  {
    tft.println("wait for ai invoke");
    while (1) // wait for invoking finished
    {
      CMD_STATE_T ret = ai.state();
      if (ret == CMD_STATE_IDLE)
      {
        break;
      }
      delay(20);
    }
    tft.println("AI state ready");
    uint8_t len = ai.get_result_len(); // receive how many people detect
    if (len)
    {
      int time1 = millis() - tick;
      Serial.print("Time consuming: ");
      Serial.println(time1);
      Serial.print("Number of people: ");
      Serial.println(len);
      tft.println("Ident success");
      object_detection_t data; //get data

      for (int i = 0; i < len; i++)
      {
        Serial.println("result:detected");
        Serial.print("Detecting and calculating: ");
        Serial.println(i + 1);
        ai.get_result(i, (uint8_t *)&data, sizeof(object_detection_t)); //get result

        Serial.print("confidence:");
        Serial.print(data.confidence);
        Serial.println();

        uint8_t data[] = { random() };


        tft.fillScreen(TFT_BLACK);
        tft.setFreeFont(FF17);
        tft.setCursor(0, 20);
        Serial.print("Unique code: ");
        tft.print("Unique code: ");
        for (int i = 0; i < 4; i++)
        {
          Serial.print(data[i]);
          tft.print(data[i]);
        }

        Serial.println();
        tft.println();

        tft.println("sending to Helium");
        // Send an uplink message. The Join is automatically performed
        if (lorae5.send_sync(
              1,            // LoRaWan Port
              data,         // data array
              sizeof(data), // size of the data
              false,        // we are not expecting a ack
              7,            // Spread Factor
              14            // Tx Power in dBm
            ))
        {
          Serial.println("Uplink done");
          if (lorae5.isDownlinkReceived())
          {
            Serial.println("A downlink has been received");
            if (lorae5.isDownlinkPending())
            {
              Serial.println("More downlink are pending");
            }
          }
        } else {
          Serial.println("uplink failed");
        }
        delay(30000);
      }
    }
    else
    {
      //      Serial.println("No identification");
      delay(1000);
    }
  }
  else
  {
    delay(1000);
    Serial.println("Invoke Failed.");
    tft.println("Invoke Failed.");
  }
}