# Pesquisa de implantação em escala real

A maquete usa três HC-SR04 de quatro pinos e alvos controlados. O teste físico relatado em 18/11/2026 demonstrou funcionamento de uma unidade; não demonstrou classificação de pedestres.

## O que muda na rua

O HC-SR04 mede distância até superfícies refletoras. Para contar exclusivamente pessoas, será necessário outro sistema de percepção ou delimitar explicitamente o que é contado. Câmeras são uma possibilidade, não uma exigência universal: sistemas de radar ou LiDAR podem executar rastreamento e classificação, conforme hardware, software e instalação. Detecção de movimento não equivale a contagem, identificação humana ou direção de passagem.

Radar Doppler simples, radar mmWave com alcance/ângulo e LiDAR não são intercambiáveis. Um detector binário de movimento não fornece automaticamente número de pessoas ou separação entre rotas. Alcance, campo de visão, oclusões, resolução angular e desempenho com grupos/animais dependem do produto. Caixa e blindagem exigem projeto; não se garante isolamento de rotas apenas com MDF ou anteparo.

As propostas de três radares direcionais, um radar multi-alvo e janela móvel de 5–15 minutos permanecem hipóteses de estudo. Não alteram a janela fixa de 10 s nem a pinagem da maquete. Precisam de ensaio local e orçamento específico, incluindo alimentação, proteção climática, instalação e comunicação.

## Referência de Doppler enviada

O [texto de Simon Willison](https://simonwillison.net/2026/Nov/3/a-sound-that-leaks-your-exact-location/) descreve localização por ruído de aviões, curvas Doppler e cruzamento com ADS-B. Isso não demonstra um contador de pedestres por radar nem transferência direta do método para a Bússola. [Vídeo indicado](https://www.youtube.com/watch?v=UytYrhYLOKI). A transcrição automática completa (0:00–29:00) foi lida. O método usa espectrogramas de sons de hélices, velocidade radial, atraso de propagação, relevo e trajetórias ADS-B para pontuar localizações candidatas. Não se trata de radar embarcado; nem o resultado nem a carga computacional podem ser transferidos diretamente para a maquete. Não houve reprodução integral do vídeo nesta revisão.

Os preços e alegações de diferenciação dos handoffs iniciais são referências não homologadas, não especificações aprovadas. Não são usados como orçamento de compra.
