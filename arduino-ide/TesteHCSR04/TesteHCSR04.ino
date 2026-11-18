int trig = 2;
int echo = 3;
unsigned long duracao;
float distancia;

void setup() {
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
  digitalWrite(trig, LOW);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  duracao = pulseIn(echo, HIGH, 25000UL);

  if (duracao == 0) {
    Serial.println("Sem eco");
  } else {
    // O som percorre a ida e a volta. Divida o percurso por dois.
    distancia = duracao * 0.0343 / 2.0;
    Serial.print("Distancia: ");
    Serial.print(distancia, 1);
    Serial.println(" cm");
  }

  delay(250);
}
