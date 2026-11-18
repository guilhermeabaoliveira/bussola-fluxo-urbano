# Bússola · Teste de um sensor · 04/11/2026

Abra o sketch `TesteHCSR04.ino` na Arduino IDE e consulte o PDF de código e montagem. O arquivo `Montagem.svg` mostra as ligações diretas.

| HC-SR04 de quatro pinos | Arduino UNO |
|---|---|
| VCC | 5 V |
| TRIG | D2 |
| ECHO | D3 |
| GND | GND |

Abra o Monitor Serial a 9600 baud. Posicione um alvo plano a 8, 14 e 30 cm da face do sensor. A leitura deve acompanhar o deslocamento. Se o eco não chegar dentro do limite do sketch, aparece “Sem eco”. A distância em centímetros é o tempo do eco em microssegundos multiplicado por 0,0343 cm/µs e dividido por dois.

**Tinkercad:** [circuito de um HC-SR04](https://www.tinkercad.com/things/9I4VWpiVhHj/editel). Montagem de seis fios, com protoboard e contatos identificados. Compilação e leituras variáveis conferidas no Monitor Serial em 18/11/2026.

## Atualização de 18/11/2026

Sensor confirmado nas fotos: HC-SR04 de quatro pinos, 5 V. Uma unidade funcionou conforme relato do grupo. Consulte [mapa por contato](index.html) e [topologia completa](../../atlas-3d/conexoes-conferidas.md). Firmware original preservado; o resultado não comprova o conjunto de três sensores.

## Circuito salvo e conferido em 18/11

[Abrir montagem no Tinkercad](https://www.tinkercad.com/things/9I4VWpiVhHj/editel). Seis fios com protoboard: TRIG D2, ECHO D3, sensor P+5/N-4 e alimentação UNO P+20/N-19. Serial apresentou leituras variáveis na simulação.
