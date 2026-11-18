# Bússola · Protótipo com três sensores

Abra `BussolaFluxoUrbano.ino` na Arduino IDE. O PDF acompanha o código completo e o esquema. A auditoria detalha a comparação com as práticas de Sistemas Digitais e os casos a verificar.

| Componente | Ligação à UNO |
|---|---|
| HC-SR04 A | TRIG D2, ECHO D3 |
| HC-SR04 B | TRIG D4, ECHO D5 |
| HC-SR04 C | TRIG D6, ECHO D7 |
| SG90 | Sinal D9 |

Os sensores usam 5 V da UNO. O servo usa fonte regulada externa de 5 V com GND em comum com a UNO e positivos separados. O LED opcional de D10 está desativado.

Abra o Monitor Serial a 9600 baud e inicie com as três rotas livres. Depois de PRONTO, faça uma passagem na rota A e confira a contagem e o ponteiro ao fechar a janela de 10 s. Em seguida, verifique alvo mantido, empate e perda de eco conforme a auditoria.

**Versão histórica preservada:** [circuito original](https://www.tinkercad.com/things/5qg1s6vhT8l/editel), com perfil 15/22 cm. Para o perfil compacto 9/12 cm, use a montagem conferida na revisão de 18/11 abaixo.

## Atualização de 18/11/2026

Sensor confirmado nas fotos: HC-SR04 de quatro pinos, 5 V. Uma unidade funcionou conforme relato do grupo. Consulte [mapa por contato](index.html) e [topologia completa](../../atlas-3d/conexoes-conferidas.md). Firmware original preservado; o resultado não comprova o conjunto de três sensores.

## Circuito salvo e conferido em 18/11

[Abrir montagem no Tinkercad](https://www.tinkercad.com/things/b0Wd2hCfCxH/editel). Três HC-SR04 de quatro pinos, fonte externa de 5 V para servo e GND comum. O firmware compacto compilou; Serial confirmou A=1 B=0 C=0 → A, A=0 B=1 C=0 → B e A=0 B=0 C=1 → C em janelas diferentes. Não equivale a ensaio físico.
