# Mapa de montagem — HC-SR04 de quatro pinos

Revisão de 18/11/2026. Maquete de 600 × 400 mm. O modelo do sensor foi identificado nas fotos do teste físico. Uma unidade funcionou, conforme relato do grupo. Isso não comprova contagem humana nem integração dos três sensores e do servo.

## Orientação da protoboard

Mapa proposto para a protoboard de referência do modelo: **P+** é o trilho de 5 V dos sensores; **N-** é o trilho de GND comum. Na vista superior, P+ é a segunda fileira do par superior (+); N- é a primeira fileira do par inferior (-). Numere os 50 contatos de cada trilho da esquerda para a direita na vista de cima. P+5 significa o quinto contato do trilho positivo; não é a coluna 5 da matriz a–j. A numeração é uma legenda deste projeto, não uma marca universal de fabricação.

Todas as conexões usadas ficam entre os contatos 1 e 25 de cada trilho, para não depender da continuidade com a outra metade. Antes de energizar, conferir continuidade entre os contatos usados: há protoboards com trilhos interrompidos. Cor e linha impressa não comprovam ligação elétrica.

| Origem | Destino exato no mapa | Função |
|---|---|---|
| HC-SR04 A VCC | P+5 | 5 V sensores |
| HC-SR04 A GND | N-4 | GND |
| HC-SR04 A TRIG | UNO D2 | Sinal |
| HC-SR04 A ECHO | UNO D3 | Sinal |
| HC-SR04 B VCC | P+10 | 5 V sensores |
| HC-SR04 B GND | N-9 | GND |
| HC-SR04 B TRIG | UNO D4 | Sinal |
| HC-SR04 B ECHO | UNO D5 | Sinal |
| HC-SR04 C VCC | P+15 | 5 V sensores |
| HC-SR04 C GND | N-14 | GND |
| HC-SR04 C TRIG | UNO D6 | Sinal |
| HC-SR04 C ECHO | UNO D7 | Sinal |
| UNO 5 V | P+20 | 5 V sensores |
| UNO GND | N-19 | GND |
| Servo sinal | UNO D9 | Sinal |
| Servo positivo | Fonte externa +5 V | 5 V servo |
| Servo GND | N-24 | GND |
| Fonte externa negativo | N-23 | GND |

## Teste com uma unidade

Use apenas o sensor A: VCC em P+5, GND em N-4, TRIG em D2 e ECHO em D3; UNO 5 V em P+20 e GND em N-19. O sketch TesteHCSR04 não usa servo. Ele é a referência local preservada; a pinagem efetiva usada na aula de 18/11 ainda precisa ser confrontada com o sketch daquele teste.

## Três sensores

A pinagem permanece D2/D3, D4/D5, D6/D7, servo D9. LED D10 é opcional e está desativado no perfil atual. O positivo da fonte externa do servo não deve ser unido ao 5 V da UNO. O negativo da fonte se conecta ao GND comum. Confirmar tensão, polaridade e capacidade da fonte no componente real.

Os limiares de 9/12 cm e a janela fixa de 10 s do firmware foram preservados. Alvos controlados demonstram passagens na maquete; o HC-SR04 não identifica pessoas ou animais. Disparo sequencial e anteparos reduzem interferência, mas a ausência de contagem cruzada deve ser verificada na bancada.

Os contatos nomeados no 3D correspondem a este mapa proposto. Os circuitos de [uma unidade](https://www.tinkercad.com/things/9I4VWpiVhHj/editel) e [três unidades](https://www.tinkercad.com/things/b0Wd2hCfCxH/editel) foram salvos e reabertos na conta da equipe em 18/11/2026. A montagem de três sensores usa fonte externa de 5 V para o servo. O código compilou e a Serial registrou eventos A/B/C, com escolhas A, B e C em janelas diferentes. Isso é evidência de simulação ideal, não de isolamento acústico ou bancada física. O circuito original foi preservado.
