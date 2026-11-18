# Auditoria didática · Bússola de Fluxo Urbano · 04/11/2026

## Escopo e evidência
Conferência do sketch local de três sensores exportado para Tinkercad e da cópia Arduino IDE, que têm SHA-256 idêntico (960C1C9E4AEBA557CA45E608234528B1C7838CE71BF1C092C4C80E7294F451F0). Comparação com o semáforo do chat ARDUINO Sistemas Digitais Acer Nitro e o índice das aulas 11–13 de Praticas-Arduino. O editor do Tinkercad não pôde ser aberto. O manifesto local registra execução histórica do perfil 15/22 cm no simulador e compilação ainda pendente para 9/12 cm. Confirme a revisão do circuito exportando seu .ino e comparando o arquivo local antes de usá-lo na bancada.

## O que já se encaixa nas aulas
O semáforo usa nomes de pinos, int/bool, setup, loop, pinMode, digitalRead, digitalWrite, if/else e delay. A bússola tem a mesma sequência entrada → decisão → saída. No HC-SR04, pulseIn mede a duração do pulso de ECHO. No protótipo, o servo responde com Servo.write. São operações adicionais à prática do semáforo.

## Como explicar ou reescrever mantendo equivalência
| Parte | Tradução didática | Comportamento a preservar |
|---|---|---|
| Vetores de pinos | Mostrar A, B e C com nomes explícitos e tabela | TRIG/ECHO em D2/D3, D4/D5, D6/D7. Servo D9. LED D10 desativado |
| Expressões condicionais | Escrever com if/else e nomes claros | Usar a mesma ordem de avaliação e os mesmos valores |
| Estado por rota | Explicar primeiro uma rota, depois aplicar as mesmas regras às três | Duas amostras estáveis, presença em até 9 cm, livre a partir de 12 cm, faixa intermediária sem troca. Contar só após livre → presente |
| Temporização | Mostrar um relógio com millis e explicar o passo A → B → C | Mínimo de 61 ms entre disparos globais, nominal de 183 ms por rota. Janela comum de 10 s. Não trocar por delays longos do semáforo |
| Partida e perda de eco | Explicar com flags bool e contadores | Iniciar após as três rotas livres e prontas. Uma leitura inválida invalida a janela. Três inválidas consecutivas indicam falha. Recuperação exige leituras livres válidas, sem restaurar a janela já afetada |
| Ponteiro | Usar uma tabela de decisões e depois if/else | A=40°, B=90°, C=140°, neutro=15°. Em empate, manter a vencedora anterior somente se ainda estiver entre as empatadas. Janela incompleta ou sem eventos fica neutra |

A ordem no loop é relevante: fechar janela antes do disparo e voltar a verificar depois de medir, antes de atribuir a leitura. A janela zera contadores, preservando estado e rearme, para não recontar um alvo parado. A distância do firmware é inteira (duração / 58). O teste de bancada exibe uma medida decimal, sem aplicar as regras do protótipo.

## Critérios para aprovar uma futura versão didática
Comparar original e candidato com as mesmas sequências e tempos. Verificar partida livre; alvo parado por duas janelas sem recontagem; saída e segunda passagem; empate com e sem vencedora anterior elegível; perda e recuperação de eco; passagem na virada da janela; e pinos, ângulos, relatórios e espaçamento entre pulsos. A equivalência é possível em princípio. Nenhuma reescrita foi aplicada ou validada nesta auditoria. Compilação dos sketches atuais e ensaio físico permanecem pendentes.

## Teste de um sensor hoje
Abra TesteHCSR04.ino na Arduino IDE, selecione Arduino Uno e a porta. Use a montagem do arquivo Montagem.svg. Abra o Monitor Serial a 9600 baud. Compare leituras estáveis com uma régua em 8, 14 e 30 cm e verifique se a distância acompanha o movimento do alvo. Se houver “Sem eco” com alvo plano em frente, confira VCC, GND, TRIG, ECHO e continuidade dos trechos da protoboard com a placa desligada. Repita com jumpers diretos antes de concluir que o sensor está defeituoso.

Referência visual externa: https://www.tinkercad.com/embed/9H9d7pPk0QM (exemplo de terceiros, com TRIG D3 e ECHO D2 e LEDs extras). Para este ensaio, use o diagrama exato e a pinagem D2/D3 acima.
