# Bússola de Fluxo Urbano

**Projetos I · Grupo 12 · CESAR School · 2026.2**

Uma bússola física torna visível qual das três rotas apresenta mais passagens no intervalo de observação. A maquete de 60 × 40 cm demonstra a cadeia de detecção, contagem, comparação e movimento do ponteiro.

[Explorar a maquete 3D](https://guilhermeabaoliveira.github.io/bussola-fluxo-urbano/atlas-3d/) · [Blueprint interativa](https://guilhermeabaoliveira.github.io/bussola-fluxo-urbano/blueprint/) · [Explainer](https://guilhermeabaoliveira.github.io/bussola-fluxo-urbano/explainer/) · [Apresentação](https://guilhermeabaoliveira.github.io/bussola-fluxo-urbano/apresentacao/) · [Manual](docs/manual.md)

![Maquete da Bússola de Fluxo Urbano](atlas-3d/modelos/perspectiva.png)

## O que está disponível

| Material | O que apresenta |
|---|---|
| Maquete 3D | Rotação, zoom, camadas, transparência, peças isoladas e ligações identificadas |
| Blueprint | Caminho das leituras até a decisão do ponteiro, com exemplos interativos |
| Explainer | Documento estruturado sobre propósito, componentes, funcionamento e limitações |
| Arduino: um sensor | Diagnóstico de distância com HC-SR04, TRIG D2 e ECHO D3 |
| Arduino: três sensores | Integração A D2/D3, B D4/D5, C D6/D7, servo D9 |

## Abrir no computador

Baixe e extraia a pasta completa. Para explorar o modelo sem instalar dependências, abra `atlas-3d/atlas-autonomo.html` no navegador com WebGL habilitado. Para abrir o portal com todos os materiais, execute na raiz:

```sh
python -m http.server 8767 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8767/`. O servidor fica restrito ao próprio computador. O [manual](docs/manual.md) explica navegação e apresentação no Acer Nitro.

## Montagem Arduino

| Componente | Pinos na UNO | Identificação no sketch |
|---|---|---|
| HC-SR04 · rota A | TRIG D2 / ECHO D3 | `TRIG[0]` / `ECHO[0]` |
| HC-SR04 · rota B | TRIG D4 / ECHO D5 | `TRIG[1]` / `ECHO[1]` |
| HC-SR04 · rota C | TRIG D6 / ECHO D7 | `TRIG[2]` / `ECHO[2]` |
| Servo do ponteiro | Sinal D9 | `SERVO_PIN` |

Os três HC-SR04 usam 5 V e GND da UNO. O servo usa fonte regulada externa de 5 V, com GND comum e positivos separados. O [mapa de montagem](docs/montagem.md) identifica cada fio e seu contato na protoboard.

| Prática | Montagem e material de estudo | Simulação |
|---|---|---|
| Uma unidade | [Código, PDF e montagem](https://guilhermeabaoliveira.github.io/bussola-fluxo-urbano/arduino-ide/TesteHCSR04/) | [Abrir Tinkercad](https://www.tinkercad.com/things/9I4VWpiVhHj/editel) |
| Três unidades e servo | [Código, PDF e montagem](https://guilhermeabaoliveira.github.io/bussola-fluxo-urbano/arduino-ide/BussolaFluxoUrbano/) | [Abrir Tinkercad](https://www.tinkercad.com/things/b0Wd2hCfCxH/editel) |

Os projetos Tinkercad permanecem privados na conta da equipe e podem solicitar login. As imagens das montagens, os sketches e os PDFs estão disponíveis no portfólio público.

## Evidências e limites

O grupo relatou funcionamento de uma unidade HC-SR04 em 18/11/2026. A integração física dos três sensores e do servo permanece como ensaio a realizar. A animação representa entradas controladas e não comprova desempenho em parque público.

O HC-SR04 mede distância; não classifica pessoas, cães ou outros alvos. Tecnologias de implantação urbana são discutidas separadamente na [pesquisa de escala real](docs/escala-real.md).

[Montagem por contato](docs/montagem.md) · [Escopo](docs/escopo.md) · [Ensaios](docs/testes.md) · [Segurança e publicação](docs/seguranca.md) · [Histórico](CHANGELOG.md)

## Equipe

| Integrante | GitHub | E-mail institucional |
|---|---|---|
| Guilherme Alcântara Batista Alencar de Oliveira | [@guilhermeabaoliveira](https://github.com/guilhermeabaoliveira) | [gabao@cesar.school](mailto:gabao@cesar.school) |
| Pedro Henrique de Freitas Veloso | [@pedro-de-freitas](https://github.com/pedro-de-freitas) | [phfv2@cesar.school](mailto:phfv2@cesar.school) |
| Maria Alice Rocha de Alcantara | [@mara768](https://github.com/mara768) | [mara@cesar.school](mailto:mara@cesar.school) |
| Enzo Leal Cavalcanti | [@enzolealcav](https://github.com/enzolealcav) | [elc@cesar.school](mailto:elc@cesar.school) |
| Samuel Bernardi Sá | [@Samuel-Bernardi-Sa](https://github.com/Samuel-Bernardi-Sa) | [sbs@cesar.school](mailto:sbs@cesar.school) |
| Mateus Dias Dino | [@mateusdiasdino-lgtm](https://github.com/mateusdiasdino-lgtm) | [mdd@cesar.school](mailto:mdd@cesar.school) |
| João Guilherme Sousa Gomes | [@Joao-Guilherme-Sousa-Gomes](https://github.com/Joao-Guilherme-Sousa-Gomes) | [jgsg@cesar.school](mailto:jgsg@cesar.school) |
| João Victor Teixeira de Albuquerque Maranhão | [@jvtam-tech](https://github.com/jvtam-tech) | [jvtam@cesar.school](mailto:jvtam@cesar.school) |

## Dependências e direitos

A visualização usa Three.js e componentes locais. Veja [terceiros](THIRD_PARTY_NOTICES.md). Uma licença para o trabalho autoral do grupo ainda precisa ser definida pelos responsáveis; a preparação desta pasta não concede licença sobre imagens ou materiais de terceiros.

