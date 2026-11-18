# Ensaios e evidências

| Verificação | Situação |
|---|---|
| Identificação do sensor | Fotos fornecidas: HC-SR04, quatro terminais |
| Teste físico de uma unidade | Funcionamento relatado pelo grupo em 18/11/2026; sem série de medições anexada |
| Pinagem do firmware local | Um sensor D2/D3; três sensores D2/D3, D4/D5, D6/D7 e servo D9 |
| Integração física completa | Pendente |
| Circuitos Tinkercad da revisão | Salvos e compilados em 18/11; uma unidade com leituras variáveis; três canais com decisões A, B e C |

## Bancada: um sensor

Conferir 5 V, GND e identificação dos quatro pinos; montar conforme mapa; abrir Serial 9600 e medir alvos planos a 8, 14 e 30 cm usando régua. Registrar leituras e ausência de eco. Se não responder, conferir pinos, alimentação, GND e continuidade, inclusive interrupções nos trilhos da protoboard.

## Bancada: três sensores

Testar uma rota de cada vez; manter as outras livres e verificar contagens cruzadas. Repetir com alvos simultâneos, alvo parado, retorno ao livre e desconexão de sensor. Conferir a mudança do ponteiro ao fechamento da janela e o comportamento em empate. Registrar distância, sequência, leituras, resultado esperado e observado. Fonte do servo separada e GND comum.

Aprovação de testes do modelo lógico ou abertura do 3D não equivale à aprovação desses ensaios físicos.
