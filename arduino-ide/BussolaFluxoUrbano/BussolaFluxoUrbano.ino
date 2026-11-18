// Grupo12 - Tinkercad/Arduino UNO:3HC-SR04,servoD9,LEDopcionalD10.
// Arquivo unico. Assinaturas usam somente tipos Arduino primitivos para o preprocessor1.8.8.
// Kit documentado tem somente1HC-SR04; a arquitetura requer3.
#include <Servo.h>
const byte TRIG[3]={2,4,6};
const byte ECHO[3]={3,5,7};
const byte SERVO_PIN=9;
const byte LED_PIN=10;
const bool USE_LED=false;
const int ANGLE[3]={40,90,140};
const int NEUTRAL_ANGLE=15;
const unsigned long TRIGGER_GAP_MS=61UL;
const unsigned long ECHO_TIMEOUT_US=25000UL;
const unsigned long MIN_ECHO_US=116UL;
const unsigned long MAX_ECHO_US=23200UL;
const unsigned long WINDOW_MS=10000UL;
// Perfil INICIAL de bancada, nao validado fisicamente. Outro ensaio possivel100/120cm.
const unsigned int ENTER_CM=9;
const unsigned int EXIT_CM=12;
const byte STABLE_SAMPLES=2;
const byte INVALID_TO_FAULT=3;
const byte VALID_TO_RECOVER=3;
const byte UNKNOWN_ZONE=0;
const byte CLEAR_ZONE=1;
const byte PRESENT_ZONE=2;
struct ChannelData {
  byte state;
  byte candidate;
  byte candidateSamples;
  byte invalidSamples;
  byte validSamples;
  bool armed;
  bool ready;
  bool fault;
  bool tainted;
  unsigned long count;
};
ChannelData channels[3];
Servo pointer;
byte nextRoute=0;
unsigned long lastTrigger=0;
bool triggered=false;
bool active=false;
unsigned long startedAt=0;
int previousWinner=-1;
// Estado da leitura e relatorio: sem tipos customizados em assinaturas de funcoes.
bool measuredValid=false;
unsigned int measuredCm=0;
unsigned long reportCount[3]={0,0,0};
bool reportUsable[3]={false,false,false};
int reportWinner=-1;
bool reportIncomplete=false;
bool reportTie=false;

byte incrementSaturated(byte n);
bool allReadyAndClear();
void observeRoute(byte index,bool valid,unsigned int cm,unsigned long now);
bool closeWindow(unsigned long now);
void measureRoute(byte index);
void outputReport();
void setup();
void loop();

byte incrementSaturated(byte n){return n==255?n:(byte)(n+1);}
bool allReadyAndClear(){
  for(byte i=0;i<3;i++)if(!channels[i].ready||channels[i].state!=CLEAR_ZONE)return false;
  return true;
}
void observeRoute(byte index,bool valid,unsigned int cm,unsigned long now){
  if(index>=3)return;
  ChannelData &c=channels[index];
  if(!valid){
    c.invalidSamples=incrementSaturated(c.invalidSamples);
    c.validSamples=0;c.tainted=true;c.ready=false;c.armed=false;
    c.state=UNKNOWN_ZONE;c.candidate=UNKNOWN_ZONE;c.candidateSamples=0;
    if(c.invalidSamples>=INVALID_TO_FAULT)c.fault=true;
    return;
  }
  c.invalidSamples=0;c.validSamples=incrementSaturated(c.validSamples);
  byte zone=cm<=ENTER_CM?PRESENT_ZONE:cm>=EXIT_CM?CLEAR_ZONE:UNKNOWN_ZONE;
  if(zone==UNKNOWN_ZONE){c.candidate=c.state;c.candidateSamples=0;return;}
  if(zone!=c.candidate){c.candidate=zone;c.candidateSamples=1;}
  else c.candidateSamples=incrementSaturated(c.candidateSamples);
  if(c.candidateSamples>=STABLE_SAMPLES&&zone!=c.state){
    c.state=zone;
    if(zone==CLEAR_ZONE)c.armed=true;
    else{
      if(c.ready&&c.armed&&active&&c.count!=0xFFFFFFFFUL)c.count++;
      c.armed=false;
    }
  }
  if(!c.ready&&zone==CLEAR_ZONE&&c.state==CLEAR_ZONE&&
     c.validSamples>=VALID_TO_RECOVER&&c.candidateSamples>=STABLE_SAMPLES){
    c.ready=true;c.fault=false;c.armed=true;
  }
  if(!active&&allReadyAndClear()){
    active=true;startedAt=now;
    for(byte i=0;i<3;i++){channels[i].count=0;channels[i].tainted=false;}
  }
}
bool closeWindow(unsigned long now){
  if(!active||(unsigned long)(now-startedAt)<WINDOW_MS)return false;
  unsigned long maximum=0;
  reportIncomplete=false;reportTie=false;reportWinner=-1;
  for(byte i=0;i<3;i++){
    reportCount[i]=channels[i].count;
    reportUsable[i]=channels[i].ready&&!channels[i].tainted;
    if(!reportUsable[i])reportIncomplete=true;
    if(channels[i].count>maximum)maximum=channels[i].count;
  }
  if(!reportIncomplete&&maximum>0){
    byte ties=0;int candidate=-1;
    for(byte i=0;i<3;i++)if(channels[i].count==maximum){ties++;candidate=i;}
    reportTie=ties>1;
    if(ties==1)reportWinner=candidate;
    else if(previousWinner>=0&&channels[previousWinner].count==maximum)reportWinner=previousWinner;
  }
  previousWinner=reportWinner;
  for(byte i=0;i<3;i++){
    channels[i].count=0;channels[i].tainted=!channels[i].ready;
    // Nao zerar estado/armado: presenca continua nao pode recontar na janela seguinte.
  }
  startedAt=now;return true;
}
void measureRoute(byte index){
  digitalWrite(TRIG[index],LOW);delayMicroseconds(2);
  lastTrigger=millis();triggered=true;
  digitalWrite(TRIG[index],HIGH);delayMicroseconds(10);digitalWrite(TRIG[index],LOW);
  unsigned long duration=pulseIn(ECHO[index],HIGH,ECHO_TIMEOUT_US);
  measuredValid=duration>=MIN_ECHO_US&&duration<=MAX_ECHO_US;
  measuredCm=measuredValid?(unsigned int)(duration/58UL):0;
}
void outputReport(){
  pointer.write(reportWinner<0?NEUTRAL_ANGLE:ANGLE[reportWinner]);
  if(USE_LED)digitalWrite(LED_PIN,reportWinner<0?LOW:HIGH);
  for(byte i=0;i<3;i++){
    Serial.print((char)('A'+i));Serial.print('=');Serial.print(reportCount[i]);
    if(!reportUsable[i])Serial.print(F(" [INVALIDA]"));Serial.print(' ');
  }
  Serial.print(F("-> "));
  if(reportIncomplete)Serial.println(F("NEUTRO: janela incompleta; nao comparar rotas"));
  else if(reportWinner<0)Serial.println(reportTie?F("NEUTRO: empate sem anterior elegivel"):F("NEUTRO: sem eventos"));
  else{Serial.print((char)('A'+reportWinner));Serial.println(reportTie?F(" (empate elegivel)"):F(""));}
}
void setup(){
  Serial.begin(9600);
  for(byte i=0;i<3;i++){
    channels[i].state=UNKNOWN_ZONE;channels[i].candidate=UNKNOWN_ZONE;
    channels[i].candidateSamples=0;channels[i].invalidSamples=0;channels[i].validSamples=0;
    channels[i].armed=false;channels[i].ready=false;channels[i].fault=false;
    channels[i].tainted=true;channels[i].count=0;
    pinMode(TRIG[i],OUTPUT);digitalWrite(TRIG[i],LOW);pinMode(ECHO[i],INPUT);
  }
  if(USE_LED){pinMode(LED_PIN,OUTPUT);digitalWrite(LED_PIN,LOW);}
  pointer.attach(SERVO_PIN);pointer.write(NEUTRAL_ANGLE);
  Serial.println(F("Bussola US:3canais, entrada<=9cm, saida>=12cm,2amostras."));
  Serial.println(F("Inicializacao:deixe TODAS rotas livres a14cm ate obter3amostras validas."));
  Serial.println(F("Semeco e INVALIDO;posicao neutra nao garante ausencia de pessoas."));
}
void loop(){
  unsigned long now=millis();
  if(closeWindow(now))outputReport();
  now=millis(); // Report pode bloquear no Serial: renovar antes do gate.
  if(triggered&&(unsigned long)(now-lastTrigger)<TRIGGER_GAP_MS)return;
  measureRoute(nextRoute);now=millis();
  if(closeWindow(now))outputReport();
  bool wasActive=active;
  bool wasReady=channels[nextRoute].ready;
  bool wasFault=channels[nextRoute].fault;
  unsigned long countBefore=channels[nextRoute].count;
  observeRoute(nextRoute,measuredValid,measuredCm,now);
  if(channels[nextRoute].count>countBefore){
    Serial.print(F("EVENTO;"));Serial.print(now);Serial.print(';');
    Serial.print((char)('A'+nextRoute));Serial.print(';');Serial.println(channels[nextRoute].count);
  }
  if(!measuredValid){Serial.print((char)('A'+nextRoute));Serial.println(F(":leitura INVALIDA(timeout/fora de faixa)"));}
  if(!wasFault&&channels[nextRoute].fault){Serial.print((char)('A'+nextRoute));Serial.println(F(":FALHA persistente;recuperar com leituras livres validas"));}
  if(!wasReady&&channels[nextRoute].ready){Serial.print((char)('A'+nextRoute));Serial.println(F(":pronto;janela afetada continua invalida ate fechar"));}
  if(!wasActive&&active)Serial.println(F("PRONTO:janela comum10s iniciada"));
  nextRoute=(nextRoute+1)%3;
}

