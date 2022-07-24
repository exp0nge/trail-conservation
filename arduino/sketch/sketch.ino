// Template ID, Device Name and Auth Token are provided by the Blynk.Cloud
// See the Device Info tab, or Template settings
#define BLYNK_TEMPLATE_ID "blnk id"
#define BLYNK_DEVICE_NAME "wio terminal vision ai"
#define BLYNK_AUTH_TOKEN "blynk auth"
 
// Your WiFi credentials.
// Set password to "" for open networks.
char ssid[] = "ssid";
char pass[] = "password";
char buf [64];

// Comment this out to disable prints and save space
#define BLYNK_PRINT Serial
 
#include <rpcWiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleWioTerminal.h>
#include "Seeed_Arduino_GroveAI.h"
#include <Wire.h>
#include"TFT_eSPI.h"
#define FF17 &FreeSans9pt7b

GroveAI ai(Wire);
uint8_t state = 0;
TFT_eSPI tft;

char auth[] = BLYNK_AUTH_TOKEN;
 
BlynkTimer timer;
 
// This function sends Arduino's up time every second to Virtual Pin (5).
// In the app, Widget's reading frequency should be set to PUSH. This means
// that you define how often to send data to Blynk App.
void myTimerEvent()
{
  // You can send any value at any time.
  // Please don't send more that 10 values per second.
  if (state == 1)
  {
    if (ai.invoke()) // begin invoke
    {
      while (1) // wait for invoking finished
      {
        CMD_STATE_T ret = ai.state(); 
        if (ret == CMD_STATE_IDLE)
        {
          break;
        }
        delay(20);
      }
     uint8_t len = ai.get_result_len(); // receive how many people detect
     if(len)
     {
       Serial.print("Number of people: ");
       Serial.println(len);
       object_detection_t data;       //get data
 
       for (int i = 0; i < len; i++)
       {
          Serial.println("result:detected");
          Serial.print("Detecting and calculating: ");
          Serial.println(i+1);
          ai.get_result(i, (uint8_t*)&data, sizeof(object_detection_t)); //get result
          Serial.print("confidence:");
          Serial.print(data.confidence);
          Serial.println();

          sprintf (buf, "%3d%3d%3d",  random(300), random(5), random(10));
          Serial.print("Unique code:");
          Serial.print(buf);
          Serial.println();
          
          Blynk.virtualWrite(V5, data.confidence);
          Blynk.virtualWrite(V4, len);
          Blynk.virtualWrite(V6, buf);
                  
          tft.fillScreen(TFT_BLACK);
          tft.setFreeFont(FF17); 
          tft.setCursor((320 - tft.textWidth(buf))/2, 20);                
          tft.print(buf);           
          delay(9000);
        }
     }
     else
     {
       tft.fillScreen(TFT_BLACK);
       Serial.println("No identification");
       Blynk.virtualWrite(V4, 0);
       Blynk.virtualWrite(V5, 0);
     }
    }
    else
    {
      delay(1000);
      Serial.println("Invoke Failed.");
    }
  }
  else
  {
    state == 0;
  }
}
 
void setup()
{
  // Debug console
  Serial.begin(115200);
 
  Wire.begin();
  tft.begin();
  tft.setRotation(3);
  tft.fillScreen(TFT_BLACK);
  tft.setFreeFont(FF17); 
  tft.fillScreen(TFT_BLACK);
  
  randomSeed(analogRead(0));
 
  Serial.println("begin");
  tft.println("begin");
  if (ai.begin(ALGO_OBJECT_DETECTION, MODEL_EXT_INDEX_1)) // Object detection and pre-trained model 1
  {
    Serial.print("Version: ");
    Serial.println(ai.version());
    Serial.print("ID: ");
    Serial.println( ai.id());
    Serial.print("Algo: ");
    Serial.println( ai.algo());
    Serial.print("Model: ");
    Serial.println(ai.model());
    Serial.print("Confidence: ");
    Serial.println(ai.confidence());
    state = 1;
  }
  else
  {
    Serial.println("Algo begin failed.");
  }

  tft.println("Connecting to wifi");
  Blynk.begin(auth, ssid, pass);
  // You can also specify server:
  //Blynk.begin(auth, ssid, pass, "blynk.cloud", 80);
  //Blynk.begin(auth, ssid, pass, IPAddress(192,168,1,100), 8080);
  tft.println("Wifi connection complete");
  // Setup a function to be called every second
  timer.setInterval(1000L, myTimerEvent);
}
 
void loop()
{
  Blynk.run();
  timer.run(); // Initiates BlynkTimer
}