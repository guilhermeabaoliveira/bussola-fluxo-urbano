/* Catálogo do projeto: dimensões propostas, não medições do kit. */
window.BussolaParts = [
  {
    "id": "base",
    "title": "Base e reforços",
    "dimensions": "600 × 400 × 3 mm; pés de 25 mm",
    "material": "MDF nominal 3 mm; pés a confirmar",
    "function": "Apoiar os módulos e manter envelope máximo de 600 × 400 mm.",
    "necessity": "Mantém as três rotas e módulos posicionados na mesma bancada de 600 × 400 mm.",
    "note": "Medir espessura; reservar base inteira e chapa adicional. Plano de corte e quantidade final de chapas pendentes. Reforços e pés necessários conforme ensaio. Compartimentos técnicos são peças separadas no Atlas. Chapas e cortes dessas coberturas continuam sem quantidade/preço fechados."
  },
  {
    "id": "totem",
    "title": "Totem vertical",
    "dimensions": "Corpo 60 × 35 × 135 mm; altura total 165 mm; disco Ø 90 mm",
    "material": "Caixa MDF, acabamento preto e mostrador fixo",
    "function": "Apresentar orientação por ponteiro móvel.",
    "necessity": "Transforma a decisão eletrônica em indicação física legível para quem chega à bifurcação.",
    "note": "Servo em suporte independente ajustável atrás da face. Abertura frontal deve permitir horn assentar integralmente no eixo original, acesso ao parafuso e giro livre; não presumir eixo atravessando MDF."
  },
  {
    "id": "sensor_A",
    "title": "HC-SR04 · 4 pinos · via A",
    "dimensions": "HC aproximado 45 × 20 × 15 mm; centro de leitura a 60 mm de altura",
    "material": "PCB e dois transdutores",
    "function": "Medir distância lateral ao alvo/fundo; não identifica pessoas nem direção.",
    "necessity": "Detecta a entrada e saída de um alvo naquela rota usando distância, sem contato com o piso.",
    "note": "TRIG D2, ECHO D3; VCC de 5 V da UNO e GND comum. Fora do piso e atrás da face. Disparos sequenciais; ensaiar reflexos e interferência entre canais."
  },
  {
    "id": "alvo_A",
    "title": "Alvo móvel — via A",
    "dimensions": "Painel 100 × 60 × 3 mm; alvo a 80 mm do sensor; retorno elevado 80 mm",
    "material": "MDF de 3 mm; pega e cantos suavizados",
    "function": "Representar uma passagem de pessoa na demonstração; não é um humano em escala validada.",
    "necessity": "Permite repetir passagens conhecidas para demonstrar a contagem; é um painel manual de MDF, não um cartão eletrônico.",
    "note": "Transladar mantendo face e altura. Levantar 80 mm após cruzar, retornar com borda inferior em Z = 110 mm e baixar no estacionamento; retorno levantado não é nova passagem. Limiares iniciais entrada de 9 cm e saída de 12 cm, validar fisicamente."
  },
  {
    "id": "anteparo_A",
    "title": "Anteparo de referência — via A",
    "dimensions": "Painel 100 × 80 × 3 mm; face a 140 mm do sensor",
    "material": "MDF de 3 mm",
    "function": "Oferecer referência de distância livre de 14 cm.",
    "necessity": "Fornece referência de caminho livre; não garante isolamento acústico entre rotas.",
    "note": "Anteparo não garante bloqueio do som, isolamento entre vias ou eco válido; instalar e testar cada célula. Não converter ausência de eco em passagem livre. Fixação da placa ao pé ainda precisa de suporte ou ajuste: há um vão de 17 mm no modelo."
  },
  {
    "id": "sensor_B",
    "title": "HC-SR04 · 4 pinos · via B",
    "dimensions": "HC aproximado 45 × 20 × 15 mm; centro de leitura a 60 mm de altura",
    "material": "PCB e dois transdutores",
    "function": "Medir distância lateral ao alvo/fundo; não identifica pessoas nem direção.",
    "necessity": "Detecta a entrada e saída de um alvo naquela rota usando distância, sem contato com o piso.",
    "note": "TRIG D4, ECHO D5; VCC de 5 V da UNO e GND comum. Fora do piso e atrás da face. Disparos sequenciais; ensaiar reflexos e interferência entre canais."
  },
  {
    "id": "alvo_B",
    "title": "Alvo móvel — via B",
    "dimensions": "Painel 100 × 60 × 3 mm; alvo a 80 mm do sensor; retorno elevado 80 mm",
    "material": "MDF de 3 mm; pega e cantos suavizados",
    "function": "Representar uma passagem de pessoa na demonstração; não é um humano em escala validada.",
    "necessity": "Permite repetir passagens conhecidas para demonstrar a contagem; é um painel manual de MDF, não um cartão eletrônico.",
    "note": "Transladar mantendo face e altura. Levantar 80 mm após cruzar, retornar com borda inferior em Z = 110 mm e baixar no estacionamento; retorno levantado não é nova passagem. Limiares iniciais entrada de 9 cm e saída de 12 cm, validar fisicamente."
  },
  {
    "id": "anteparo_B",
    "title": "Anteparo de referência — via B",
    "dimensions": "Painel 100 × 80 × 3 mm; face a 140 mm do sensor",
    "material": "MDF de 3 mm",
    "function": "Oferecer referência de distância livre de 14 cm.",
    "necessity": "Fornece referência de caminho livre; não garante isolamento acústico entre rotas.",
    "note": "Anteparo não garante bloqueio do som, isolamento entre vias ou eco válido; instalar e testar cada célula. Não converter ausência de eco em passagem livre. Fixação da placa ao pé ainda precisa de suporte ou ajuste: há um vão de 17 mm no modelo."
  },
  {
    "id": "sensor_C",
    "title": "HC-SR04 · 4 pinos · via C",
    "dimensions": "HC aproximado 45 × 20 × 15 mm; centro de leitura a 60 mm de altura",
    "material": "PCB e dois transdutores",
    "function": "Medir distância lateral ao alvo/fundo; não identifica pessoas nem direção.",
    "necessity": "Detecta a entrada e saída de um alvo naquela rota usando distância, sem contato com o piso.",
    "note": "TRIG D6, ECHO D7; VCC de 5 V da UNO e GND comum. Fora do piso e atrás da face. Disparos sequenciais; ensaiar reflexos e interferência entre canais."
  },
  {
    "id": "alvo_C",
    "title": "Alvo móvel — via C",
    "dimensions": "Painel 100 × 60 × 3 mm; alvo a 80 mm do sensor; retorno elevado 80 mm",
    "material": "MDF de 3 mm; pega e cantos suavizados",
    "function": "Representar uma passagem de pessoa na demonstração; não é um humano em escala validada.",
    "necessity": "Permite repetir passagens conhecidas para demonstrar a contagem; é um painel manual de MDF, não um cartão eletrônico.",
    "note": "Transladar mantendo face e altura. Levantar 80 mm após cruzar, retornar com borda inferior em Z = 110 mm e baixar no estacionamento; retorno levantado não é nova passagem. Limiares iniciais entrada de 9 cm e saída de 12 cm, validar fisicamente."
  },
  {
    "id": "anteparo_C",
    "title": "Anteparo de referência — via C",
    "dimensions": "Painel 100 × 80 × 3 mm; face a 140 mm do sensor",
    "material": "MDF de 3 mm",
    "function": "Oferecer referência de distância livre de 14 cm.",
    "necessity": "Fornece referência de caminho livre; não garante isolamento acústico entre rotas.",
    "note": "Anteparo não garante bloqueio do som, isolamento entre vias ou eco válido; instalar e testar cada célula. Não converter ausência de eco em passagem livre. Fixação da placa ao pé ainda precisa de suporte ou ajuste: há um vão de 17 mm no modelo."
  },
  {
    "id": "arduino",
    "title": "Arduino UNO",
    "dimensions": "Referência da placa UNO: 68,6 × 53,4 mm; confirmar o exemplar",
    "material": "Placa eletrônica do kit",
    "function": "Processar estados, contar entradas por janela de 10 s e comandar servo.",
    "necessity": "Executa a contagem por rota e a comparação da janela comum, sem identificar pessoas.",
    "note": "USB para placa e monitor serial; servomotor com positivo separado. GND comum. Dimensões aproximadas; furos e conectores reais a medir."
  },
  {
    "id": "protoboard",
    "title": "Protoboard e barramentos",
    "dimensions": "Envelope do modelo: 165 × 55 × 10 mm; confirmar o exemplar",
    "material": "Protoboard de 830 contatos do kit",
    "function": "Distribuir 5 V dos sensores e GND comum.",
    "necessity": "Permite montar a distribuição elétrica provisória sem fabricar uma placa própria.",
    "note": "Verificar interrupções dos trilhos e continuidade; não unir positivo externo servo com positivo UNO. Reserva não comprova encaixe."
  },
  {
    "id": "cabos",
    "title": "Chicotes e conexões",
    "dimensions": "Reserva de 3 m: três percursos de até 700 mm e 900 mm de folga",
    "material": "Cabo manga 4 × 26 AWG e conectores; jumpers",
    "function": "Conectar cada pino de sinal e os barramentos por percursos organizados sob a base.",
    "necessity": "Transportam sinais e alimentação entre módulos que ficam em posições distintas.",
    "note": "Cada chicote HC possui VCC, TRIG, ECHO e GND. O 3D identifica as duas pontas; selecione o circuito e depois uma ligação para acompanhá-la. Percursos seguem sob a base e retornam por passagens próprias. Comprimento final, terminais e alívio de tração dependem da montagem física."
  },
  {
    "id": "fonte",
    "title": "Fonte externa do servo",
    "dimensions": "Envelope ilustrativo 90 × 50 × 30 mm; conferir unidade real",
    "material": "Fonte regulada externa de 5 V e adaptador borne",
    "function": "Alimentar servo separadamente.",
    "necessity": "Fornece alimentação externa adequada ao servo, mantendo terra comum com a UNO.",
    "note": "Referência de 5 V e 5 A: 5 A é capacidade, não consumo. UNO por USB; GND comum e positivos separados. Fonte de rede fora da caixa. Não ligar 5 V no jack UNO."
  },
  {
    "id": "ponteiro",
    "title": "Ponteiro leve e horn",
    "dimensions": "Raio útil 37 mm; largura máxima 8 mm; meta de massa < 2 g",
    "material": "Cartolina/acetato leve no horn original",
    "function": "Exibir A a 40°, B a 90°, C a 140° e posição neutra a 15°. Os ângulos são comandos do servo, não azimutes geográficos.",
    "necessity": "Mostra fisicamente a rota escolhida pelo algoritmo; não mede fluxo por si só.",
    "note": "Sem estrias cortadas em MDF, extensão de eixo colada ou parafuso genérico. Fixação não deve obstruir cubo/parafuso. Ensaiar sem atrito e ajustar abertura/suporte."
  },
  {
    "id": "servo",
    "title": "Microservo SG90",
    "dimensions": "Corpo representativo 23 × 12,2 × 29 mm; conferir exemplar e horn",
    "material": "Servo e horn original",
    "function": "Movimentar ponteiro somente; disco e caixa fixos.",
    "necessity": "Converte o comando angular do Arduino em movimento do ponteiro.",
    "note": "Sinal D9; positivo externo regulado compatível e GND comum. Confirmar tensão/curso da unidade. Montar horn em 90° com ponteiro para cima, sem forçar batentes."
  },
  {
    "id": "carenagem_uno",
    "title": "Compartimento técnico — UNO",
    "dimensions": "92 × 65 mm; paredes de 25 mm; MDF de 3 mm",
    "material": "MDF nominal de 3 mm com acabamento preto",
    "function": "Cobrir e organizar UNO na apresentação, com tampa removível para acesso técnico. Não possui função de sensor nem vedação certificada.",
    "necessity": "Permite esconder a eletrônica na apresentação e abrir para inspeção/manutenção.",
    "note": "Proposta aberta na traseira; prever saídas de cabos e manutenção. Recalcular plano de corte e encaixes com o módulo recebido. Não constitui invólucro certificado de fonte de rede."
  },
  {
    "id": "carenagem_protoboard",
    "title": "Compartimento técnico — protoboard",
    "dimensions": "176 × 66 mm; paredes de 25 mm; MDF de 3 mm",
    "material": "MDF nominal de 3 mm com acabamento preto",
    "function": "Cobrir e organizar protoboard na apresentação, com tampa removível para acesso técnico. Não possui função de sensor nem vedação certificada.",
    "necessity": "Permite esconder a eletrônica na apresentação e abrir para inspeção/manutenção.",
    "note": "Proposta aberta na traseira; prever saídas de cabos e manutenção. Recalcular plano de corte e encaixes com o módulo recebido. Não constitui invólucro certificado de fonte de rede."
  },
  {
    "id": "carenagem_fonte",
    "title": "Compartimento técnico — fonte",
    "dimensions": "102 × 70 mm; paredes de 40 mm; MDF de 3 mm",
    "material": "MDF nominal de 3 mm com acabamento preto",
    "function": "Cobrir e organizar fonte na apresentação, com tampa removível para acesso técnico. Não possui função de sensor nem vedação certificada.",
    "necessity": "Permite esconder a eletrônica na apresentação e abrir para inspeção/manutenção.",
    "note": "Proposta aberta na traseira; prever saídas de cabos e manutenção. Recalcular plano de corte e encaixes com o módulo recebido. Não constitui invólucro certificado de fonte de rede."
  }
];
