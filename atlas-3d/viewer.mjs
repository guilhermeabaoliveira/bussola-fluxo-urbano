import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createModel,advance,setStableBlocked} from '../anatomy/model.mjs';
import {targetPose} from '../anatomy/mechanism.mjs';

const $=s=>document.querySelector(s), money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const describe=v=>v==null?'A conferir':typeof v==='object'?Array.isArray(v)?v.map(describe).join(' × '):Object.entries(v).map(([k,x])=>`${k}: ${describe(x)}`).join(' · '):String(v);
const still=matchMedia('(prefers-reduced-motion: reduce)');
const bootstrap=$('#atlas-data')?JSON.parse($('#atlas-data').textContent):null;
const modelUrl='modelos/bancada-completa.glb';
let catalog={items:[]},manifest={},renderer,scene,camera,controls,model,selected=null,isolated=null,opened=false;
let atlasReturnState=null;
const groups=new Map(), originalMaterials=new Map(), hiddenGroups=new Set();
const stage=$('#stage'), pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();
const stageWrap=$('.stage-wrap');
const fullToolbar=document.createElement('div');
fullToolbar.className='model-toolbar';
fullToolbar.innerHTML='<button id="model-fullscreen" aria-pressed="false">Tela cheia</button><span class="fullscreen-tools" hidden><button id="fullscreen-reset">Visão geral</button><button id="fullscreen-demo">Demo A1 · B3 · C2</button></span><span id="fullscreen-status" role="status"></span>';
stageWrap.prepend(fullToolbar);
function syncFullscreen(){
  const on=document.fullscreenElement===stageWrap||stageWrap.classList.contains('fullscreen-fallback');
  $('#model-fullscreen').textContent=on?'Sair da tela cheia':'Tela cheia';
  $('#model-fullscreen').setAttribute('aria-pressed',String(on));
  $('.fullscreen-tools').hidden=!on;
  document.body.classList.toggle('model-fullscreen-open',on);
}
async function toggleFullscreen(){
  try{
    if(document.fullscreenElement===stageWrap)await document.exitFullscreen();
    else if(stageWrap.classList.contains('fullscreen-fallback'))stageWrap.classList.remove('fullscreen-fallback');
    else if(stageWrap.requestFullscreen&&document.fullscreenEnabled)await stageWrap.requestFullscreen();
    else stageWrap.classList.add('fullscreen-fallback');
    $('#fullscreen-status').textContent='';
  }catch{
    stageWrap.classList.add('fullscreen-fallback');
    $('#fullscreen-status').textContent='Visualização ampliada · Esc para sair';
  }
  syncFullscreen();
}
$('#model-fullscreen').onclick=toggleFullscreen;
$('#fullscreen-reset').onclick=()=>$('#view-all').click();
$('#fullscreen-demo').onclick=()=>$('#demo').click();
document.addEventListener('fullscreenchange',syncFullscreen);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&stageWrap.classList.contains('fullscreen-fallback')){stageWrap.classList.remove('fullscreen-fallback');syncFullscreen();}});
// Cancel browser autoscroll on the model only; keep OrbitControls receiving the drag.
for(const type of ['pointerdown','mousedown','auxclick'])stage.addEventListener(type,event=>{if(event.button===1)event.preventDefault();},{capture:true,passive:false});
const structuralLayers={base:['base'],carenagem:['totem'],compartimentos:['carenagem_uno','carenagem_protoboard','carenagem_fonte'],sensores:['sensor_A','sensor_B','sensor_C','anteparo_A','anteparo_B','anteparo_C'],alvos:['alvo_A','alvo_B','alvo_C'],eletronica:['arduino','protoboard','servo'],cabos:['cabos','fonte'],indicador:['ponteiro']};
const layerTitles={base:'Base e reforços',carenagem:'Carenagem do totem',compartimentos:'Compartimentos técnicos',sensores:'Sensores e anteparos',alvos:'Alvos planos',eletronica:'UNO, protoboard e servo',cabos:'Cabos e alimentação',indicador:'Ponteiro e horn'};
const shellPattern=/base_MDF|tampa|painel|coluna|caixa|parede|disco|totem_frente|totem_traseira|lateral/i;
let ghost=false;
let wiringFilter='all',wiringNet='';
const wireBindings=new Map();
let step=0,playing=true,auto=false,autoAt=0,autoIndex=0,queue=[],stopAt=null,complete=false,state=createModel(10),servoAngle=15,clock=0,lastFrame=0;
const actors=Array.from({length:3},(_,route)=>({route,elapsed:0,active:false,present:false,y:70,lift:0}));
for(let i=0;i<3;i++)setStableBlocked(state,i,false);

async function loadData(){
  catalog=bootstrap?.catalog??await fetch('./catalog.json').then(r=>{if(!r.ok)throw Error('Catálogo HTTP '+r.status);return r.json();});
  manifest=bootstrap?.manifest??await fetch('./scene-manifest.json').then(r=>{if(!r.ok)throw Error('Manifesto HTTP '+r.status);return r.json();});
  renderTree();renderBudget();renderWiring();
}
function wiringNets(){return manifest.wiring?.nets??[];}
function circuitFor(net){if(net.circuit)return net.circuit;const id=net.id??net.name??'';const route=id.match(/HC_([ABC])_/);if(route)return route[1];return /servo/i.test(id)?'servo':'power';}
function wiringMatches(net){return (!wiringNet||net.id===wiringNet)&&(wiringFilter==='all'||circuitFor(net)===wiringFilter);}
function renderWiring(){
  wireBindings.clear();for(const net of wiringNets())for(const name of net.objectNames??[net.id])wireBindings.set(name,net);
  const matching=wiringNets().filter(net=>wiringFilter==='all'||circuitFor(net)===wiringFilter);
  const select=$('#wire-select');select.replaceChildren();const all=document.createElement('option');all.value='';all.textContent='Todas as ligações deste circuito';select.append(all);
  for(const net of matching){const option=document.createElement('option');option.value=net.id;option.textContent=`${net.fromLabel??net.from} → ${net.toLabel??net.to}`;select.append(option);}select.value=wiringNet;
  const count=matching.filter(wiringMatches).length;
  $('#wire-readout').textContent=wiringNets().length?`${count} ${count===1?'ligação selecionada':'ligações selecionadas'} · vermelho: alimentação · preto: GND · amarelo: TRIG · ciano: ECHO · laranja: sinal do servo`:'Catálogo de ligações aguardando o modelo.';
  document.querySelectorAll('[data-circuit]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.circuit===wiringFilter)));
  $('#wire-endpoints').replaceChildren();for(const net of matching.filter(wiringMatches)){const row=document.createElement('p');row.textContent=`${net.fromLabel??net.from} → ${net.toLabel??net.to}${net.function?' · '+net.function:''}`;$('#wire-endpoints').append(row);}
}
function inspectWiring(circuit='all',net=''){
  if(!model)return;atlasReturnState=null;$('#part-inspector').hidden=true;$('.stage-wrap').classList.remove('atlas-inspecting');isolated=null;selected=null;hiddenGroups.clear();opened=true;ghost=false;$('#ghost').checked=false;$('#clip-on').checked=false;updateClip();
  wiringFilter=circuit;wiringNet=net;renderWiring();applyVisibility();renderTree();document.querySelectorAll('#layers input').forEach(x=>x.checked=true);
  view('bottom');frameWiring();$('.stage-wrap').scrollIntoView({block:'start',behavior:still.matches?'auto':'smooth'});
}
function frameWiring(){
  model.updateWorldMatrix(true,true);const box=new THREE.Box3();
  model.traverse(o=>{const net=wireBindings.get(o.name);if(o.isMesh&&net&&wiringMatches(net))box.expandByObject(o);});
  if(box.isEmpty())return;const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const aspect=stage.clientWidth/stage.clientHeight,distance=Math.max(.12,Math.max(size.z,size.x/aspect)*.65/Math.tan(THREE.MathUtils.degToRad(camera.fov/2))+size.y/2+.025);
  camera.aspect=aspect;camera.updateProjectionMatrix();controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(0,-distance,-.0001));controls.update();cameraReadout();
}
function renderBudget(){
  const b=catalog.budget??{},min=b.minimumSubtotal??null,recommended=b.recommendedSubtotal??null;
  $('#budget').innerHTML=`${min!==null?`<p>Subtotal mínimo condicional<br><strong>${money(min)}</strong></p>`:''}${recommended!==null?`<p>Subtotal recomendado<br><strong>${money(recommended)}</strong></p>`:''}<p class="hint">Referências de ${escape(catalog.date)}; valores não fechados.</p><p><b>Condições:</b> ${escape(describe(b.minimumConditions))}</p><p><b>Ainda sem preço:</b> ${escape(describe(b.exclusions))}</p><details><summary>Materiais, quantidades e fontes</summary>${(b.lineItems??[]).map(x=>`<p>${escape(x.title)} · ${x.quantity??'?'} × ${x.unitBrl==null?'a cotar':money(x.unitBrl)} = ${x.subtotal==null?'a cotar':money(x.subtotal)}<br><small>${escape(x.notes)}</small>${x.source?` · <a href="${escape(x.source)}" target="_blank" rel="noopener">Fonte</a>`:''}</p>`).join('')}</details><p><a href="materiais-e-custos.md">Orçamento detalhado</a></p>`;
}
function renderTree(){
  const query=$('#filter').value.trim().toLocaleLowerCase();
  $('#tree').replaceChildren();
  for(const item of catalog.items??[]){if(query&&!`${item.id} ${item.title}`.toLocaleLowerCase().includes(query))continue;
    const row=document.createElement('div');row.className='part-row';row.setAttribute('role','listitem');row.dataset.id=item.id;row.setAttribute('aria-current',String(selected===item.id));
    const check=document.createElement('input');check.type='checkbox';check.checked=!hiddenGroups.has(item.id);check.setAttribute('aria-label','Mostrar '+item.title);check.addEventListener('change',()=>{check.checked?hiddenGroups.delete(item.id):hiddenGroups.add(item.id);applyVisibility();});
    const button=document.createElement('button');button.textContent=item.title;button.addEventListener('click',()=>select(item.id));row.append(check,button);$('#tree').append(row);
  }
}
function renderLayers(){
  $('#layers').replaceChildren();
  for(const[id,ids]of Object.entries(structuralLayers)){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.checked=true;box.dataset.layer=id;box.setAttribute('aria-label',layerTitles[id]);box.addEventListener('change',()=>{for(const name of ids)box.checked?hiddenGroups.delete(name):hiddenGroups.add(name);applyVisibility();renderTree();});label.append(box,' '+layerTitles[id]);$('#layers').append(label);}
}
function getItem(id){return catalog.items?.find(x=>x.id===id);}
const dimensionLabels={pcbXYZ:'Placa: X × Y × Z',pcbCenterXYZ:'Centro da placa (X, Y, Z)',bodyCenterXYZ:'Centro do corpo (X, Y, Z)',outerPlanXY:'Dimensões externas (X × Y)',internalWidth:'Largura interna',width:'Largura',depth:'Profundidade',height:'Altura',thickness:'Espessura',reinforcements:'Reforços',dialDiameter:'Diâmetro do disco',dialCenterZ:'Centro do disco em Z',overallHeight:'Altura total',moduleApprox:'Módulo aproximado',facePosition:'Posição da face (X, Y, Z)',moduleDimensionsStatus:'Estado da medida',panel:'Painel',handle:'Pega',centerZ:'Centro em Z',presentDistance:'Distância com alvo',travelY:'Percurso em Y',returnLift:'Elevação de retorno',freeDistance:'Distância livre',boardApprox:'Placa aproximada',tray:'Bandeja',position:'Posição (X, Y, Z)',status:'Estado',sensorCableTotalLength:'Cabo total dos sensores',sensorRunsAllowance:'Reserva por chicote',remainingAllowance:'Reserva restante',kitJumpersLength:'Jumpers do kit',dimensions:'Dimensões',connector:'Conector',usefulRadius:'Raio útil',maxWidth:'Largura máxima',targetMassGramsLessThan:'Meta de massa inferior a',initialAxialClearance:'Folga axial inicial',tailLength:'Cauda',XYZ:'X × Y × Z',planXY:'Envelope X × Y',panelXYZ:'Painel: X × Y × Z',handleXYZ:'Pega: X × Y × Z',panelCenterZ:'Centro do painel em Z',handleCenterZ:'Centro da pega em Z',panelZ:'Limites do painel em Z',handleZ:'Limites da pega em Z',bodyXYZ:'Corpo: X × Y × Z',referenceUnoriented:'Referência sem orientação',axisConvention:'Convenção dos eixos',positionXY:'Posição X, Y',supportXYZ:'Suporte: X × Y × Z',footXYZ:'Pé: X × Y × Z',sensingCenterHeight:'Altura do centro de leitura',note:'Observação'};
function dimensionValue(value,key=''){
  if(value==null)return 'Não informado — medir ou conferir.';
  if(typeof value==='number')return Number.isFinite(value)?`${value.toLocaleString('pt-BR')} ${/grams/i.test(key)?'g (meta)':/angle|degree/i.test(key)?'°':'mm'}`:'Medida pendente.';
  if(Array.isArray(value)){if(value.every(x=>typeof x==='number'))return `${value.map(x=>x.toLocaleString('pt-BR')).join(/travelY|panelZ|handleZ/.test(key)?' a ':' × ')} ${/grams/i.test(key)?'g':'mm'}`;return value.map(x=>dimensionValue(x,key)).join('; ');}
  if(typeof value==='object')return Object.entries(value).map(([name,v])=>`${dimensionLabels[name]??name}: ${dimensionValue(v,name)}`).join(' · ');
  return String(value);
}
function dimensionalRows(value){if(value==null)return '<p class="hint">Dimensões pendentes: medir o componente recebido.</p>';if(typeof value!=='object'||Array.isArray(value))return `<p>${escape(dimensionValue(value))}</p>`;return `<dl class="atlas-dimensions">${Object.entries(value).map(([key,v])=>`<div><dt>${escape(dimensionLabels[key]??key)}</dt><dd>${escape(dimensionValue(v,key))}</dd></div>`).join('')}</dl>`;}
function rememberAssembly(){if(atlasReturnState)return;atlasReturnState={opened,isolated,hidden:[...hiddenGroups],camera:camera?.position.clone(),target:controls?.target.clone(),wiringFilter,wiringNet,ghost,clip:$('#clip-on').checked};}
function select(id){
  if(!getItem(id))return;
  rememberAssembly();wiringFilter='all';wiringNet='';renderWiring();ghost=false;$('#ghost').checked=false;selected=id;isolated=id;opened=false;hiddenGroups.delete(id);
  let ancestor=groups.get(id)?.parent;while(ancestor){hiddenGroups.delete(ancestor.name);ancestor=ancestor.parent;}
  $('#clip-on').checked=false;updateClip();renderTree();renderDetails();highlight();focus(groups.get(id));
  $('.stage-wrap').scrollIntoView({block:'start',behavior:still.matches?'auto':'smooth'});
}
function returnAssembly(){
  const previous=atlasReturnState;atlasReturnState=null;isolated=previous?.isolated??null;opened=previous?.opened??false;
  if(previous){wiringFilter=previous.wiringFilter??'all';wiringNet=previous.wiringNet??'';renderWiring();ghost=previous.ghost;$('#ghost').checked=ghost;hiddenGroups.clear();for(const id of previous.hidden)hiddenGroups.add(id);$('#clip-on').checked=previous.clip;updateClip();}
  $('#part-inspector').hidden=true;$('.stage-wrap').classList.remove('atlas-inspecting');
  applyVisibility();renderTree();if(previous?.camera&&controls){camera.position.copy(previous.camera);controls.target.copy(previous.target);controls.update();cameraReadout();}else view('iso');
}
function renderDetails(){
  const item=getItem(selected);if(!item)return;
  const cost=item.additionalCost??{},allocation=cost.allocation?catalog.costAllocations?.[cost.allocation]:null;
  const costText=cost.subtotal!=null?money(cost.subtotal):allocation?`Custo compartilhado, contado uma vez: ${describe(allocation)}`:'Não cotado individualmente — consultar orçamento global.';
  const summary=[['Função',item.function],['Por que esta peça é necessária',item.necessity??item.function],['Material',item.material],['Kit / extras',item.kit],['Montagem e cuidados',item.assemblyNotes],['Conferência do componente',item.verification]].map(([title,value])=>`<div class="detail-row"><b>${title}</b><p>${escape(value==null||value===''?'Informação pendente no catálogo; conferir antes de fabricar.':describe(value))}</p></div>`).join('');
  const measurements=`<div class="detail-row"><b>Dimensões propostas e referências</b>${dimensionalRows(item.dimensionsMm)}</div>${item.modelDimensionsMm?`<details class="atlas-measures" open><summary>Medidas representadas no modelo (mm)</summary>${dimensionalRows(item.modelDimensionsMm)}</details>`:''}${item.reservationEnvelope?`<details class="atlas-measures"><summary>Reserva de montagem — não confundir com medida da peça</summary>${dimensionalRows(item.reservationEnvelope)}</details>`:''}`;
  $('#part-inspector').innerHTML=`<div class="atlas-part-heading"><span class="eyebrow">INSPEÇÃO 3D · PEÇA ISOLADA</span><h2 id="part-title" tabindex="-1">${escape(item.title)}</h2><button id="back-assembly">← Voltar à montagem</button></div><p class="hint">Gire, aproxime e examine a peça nesta cena. Dimensões são da proposta ou referências do catálogo; medir o exemplar real. Campos pendentes não são medidas confirmadas.</p>${summary}${measurements}`;
  $('#part-inspector').hidden=false;$('.stage-wrap').classList.add('atlas-inspecting');$('#back-assembly').onclick=returnAssembly;$('#part-title').focus({preventScroll:true});
  $('#details').innerHTML=`<h2>${escape(item.title)}</h2><p>Vista isolada e descrição abertas junto ao modelo 3D.</p><div class="buttons"><button id="focus-part">Aproximar peça</button><button id="un-isolate">Voltar à montagem</button></div><details><summary>Custo e arquivos desta peça</summary><div class="detail-row"><b>Custo de referência</b><p>${escape(costText)}</p></div><div class="detail-row"><b>Limite da referência</b><p>${escape(describe(cost.confidence))}</p></div><p><a href="modelos/${escape(item.id)}.blend" download>Blender</a> · <a href="modelos/${escape(item.id)}.glb" download>GLB</a></p></details>`;
  $('#focus-part').onclick=()=>{focus(groups.get(selected));$('.stage-wrap').scrollIntoView({block:'start',behavior:still.matches?'auto':'smooth'});};$('#un-isolate').onclick=returnAssembly;
}
function applyVisibility(){
  if(!model)return;
  for(const[id,g]of groups){g.visible=!isolated||id===isolated||isDescendantOf(g,groups.get(isolated))||isDescendantOf(groups.get(isolated),g);}
  model.traverse(o=>{if(!o.isMesh)return;let owner=o;while(owner&&!groups.has(owner.name))owner=owner.parent;const selectedGroup=groups.get(isolated);o.visible=!hiddenGroups.has(owner?.name)&&(!opened||!o.userData.shell)&&(!isolated||owner===selectedGroup||isDescendantOf(owner,selectedGroup));});
  model.traverse(o=>{if(!o.isMesh||!o.visible)return;const net=wireBindings.get(o.name);if(net&&!wiringMatches(net))o.visible=false;});
  model.traverse(o=>{if(!o.isMesh)return;const original=originalMaterials.get(o);if(!original)return;const mats=(Array.isArray(original)?original:[original]).map(m=>{const copy=m.clone();if(ghost&&(o.userData.shell||o.parent===groups.get('base')||o.parent===groups.get('totem'))){copy.transparent=true;copy.opacity=.18;copy.depthWrite=false;}return copy;});disposeTransientMaterials(o);o.material=Array.isArray(original)?mats:mats[0];});
  $('#open-build').textContent=opened?'Fechar construção':'Abrir construção';
}
function isDescendantOf(object,parent){if(!object||!parent)return false;let o=object.parent;while(o){if(o===parent)return true;o=o.parent;}return false;}
function restoreAll(){atlasReturnState=null;$('#part-inspector').hidden=true;$('.stage-wrap').classList.remove('atlas-inspecting');hiddenGroups.clear();isolated=null;opened=false;wiringFilter='all';wiringNet='';renderWiring();applyVisibility();renderTree();document.querySelectorAll('#layers input').forEach(x=>x.checked=true);view('iso');}
function disposeTransientMaterials(o){const original=originalMaterials.get(o);const originals=Array.isArray(original)?original:[original];for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&!originals.includes(m))m.dispose();}
function highlight(){
  if(!model)return;applyVisibility();
  model.traverse(o=>{if(!o.isMesh||!o.material)return;});
  const group=groups.get(selected);if(group)group.traverse(o=>{if(!o.isMesh)return;const orig=o.material;const mats=(Array.isArray(orig)?orig:[orig]).map(mat=>{const m=mat.clone();if(m.emissive){m.emissive.set('#b18d40');m.emissiveIntensity=.23;}return m;});disposeTransientMaterials(o);o.material=Array.isArray(orig)?mats:mats[0];});
}
function focus(object,layoutReady=false){if(!object||!camera||!controls)return;if(!layoutReady){requestAnimationFrame(()=>focus(object,true));return;}camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();object.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(object);if(box.isEmpty())return;const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),direction=camera.position.clone().sub(controls.target).normalize();if(!direction.length())direction.set(1,1,1).normalize();const halfFov=THREE.MathUtils.degToRad(camera.fov/2);const distance=Math.max(size.y,size.x/Math.max(camera.aspect,.2),size.z)*.7/Math.tan(halfFov)+size.length()*.35;controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,Math.max(distance,.08));controls.update();cameraReadout();requestAnimationFrame(()=>{if(!camera||!controls)return;const aspect=stage.clientWidth/stage.clientHeight;if(Math.abs(aspect-camera.aspect)>.001){camera.aspect=aspect;camera.updateProjectionMatrix();}});}
function view(name){if(!camera)return;const target=new THREE.Vector3(.3,.07,-.2);controls.target.copy(target);const positions={iso:[.86,.53,-.91],front:[.3,.23,-1.05],back:[.3,.23,.65],left:[-.65,.23,-.2],right:[1.25,.23,-.2],top:[.3,1.1,-.2001],bottom:[.3,-.9,-.2001]};camera.position.set(...(positions[name]??positions.iso));camera.up.set(0,1,0);controls.update();cameraReadout();}
function zoom(mult){if(!camera)return;camera.position.sub(controls.target).multiplyScalar(mult).add(controls.target);controls.update();cameraReadout();}
function cameraReadout(){if(!controls)return;const az=THREE.MathUtils.radToDeg(controls.getAzimuthalAngle()),el=90-THREE.MathUtils.radToDeg(controls.getPolarAngle()),distance=camera.position.distanceTo(controls.target);$('#camera-readout').textContent=`Azimute ${az.toFixed(1)}° · elevação ${el.toFixed(1)}° · distância ${(distance*1000).toFixed(0)} mm`;$('#azimuth').value=az;$('#elevation').value=el;}
function sphericalFromInputs(){if(!camera)return;const r=camera.position.distanceTo(controls.target),theta=THREE.MathUtils.degToRad(Number($('#azimuth').value)),phi=THREE.MathUtils.degToRad(90-Number($('#elevation').value));camera.position.copy(controls.target).add(new THREE.Vector3().setFromSphericalCoords(r,phi,theta));controls.update();cameraReadout();}
function updateClip(){if(!renderer)return;const enabled=$('#clip-on').checked,height=Number($('#clip').value)/100*.24-.03;renderer.clippingPlanes=enabled?[new THREE.Plane(new THREE.Vector3(0,-1,0),height)]:[];}
function pointerClick(event){if(!renderer||!model)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(model,true).find(x=>{let o=x.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});if(!hit)return;let node=hit.object;while(node&&!getItem(node.name))node=node.parent;if(node)select(node.name);}
function begin(route){if(actors[route].active)return;if(complete){complete=false;stopAt=null;playing=true;}const t=actors[route];Object.assign(t,{elapsed:0,active:true,present:false,y:70,lift:0});$('#play').textContent=playing?'Pausar':'Retomar';}
function reset(){state=createModel(10);for(let i=0;i<3;i++)setStableBlocked(state,i,false);for(const t of actors)Object.assign(t,{elapsed:0,active:false,present:false,y:70,lift:0});clock=0;servoAngle=15;queue=[];stopAt=null;complete=false;updateSimulation(0);}
function demo(){auto=false;$('#auto').textContent='Iniciar auto';reset();playing=true;stopAt=12;queue=[{at:0,r:0},{at:0,r:1},{at:0,r:2},{at:3.65,r:1},{at:3.65,r:2},{at:7.3,r:1}];$('#play').textContent='Pausar';}
const guideSteps=[
  {title:'A montagem que o grupo vai construir',copy:'A maquete física reúne uma base de 60 × 40 cm, três células de leitura, alvos manuais, Arduino e um totem com ponteiro. O modelo 3D permite examinar como essas peças se montam. A Bússola compara as passagens registradas em três rotas durante uma janela de 10 segundos. Indica a rota com mais eventos quando há um vencedor. Sem eventos, ou com empate sem indicação anterior elegível, fica neutra. Esse indicador não garante segurança nem identifica pessoas.'},
  {title:'Uma bancada de 600 × 400 mm',copy:'A cena apresenta a proposta da bancada em suas proporções, com medidas em milímetros e modelo 1:1 da montagem. Não é uma reprodução em escala de uma cidade: sensores, alvos e totem permitem demonstrar o mecanismo em mesa.'},
  {title:'Uma passagem por ciclo do alvo',copy:'O exemplo inicia agora: A recebe 1 passagem, B recebe 3 e C recebe 2. Cada alvo plano representa uma passagem por ciclo; não representa uma pessoa identificada. Após o fechamento aos 10 segundos, o ponteiro indica B a 90°. Aguarde a pausa aos 12 segundos para conferir o resultado antes de avançar. Na montagem física, o alvo é movimentado pela pega: borda inferior a 30 mm, percurso do centro de Y = 70 a 275 mm e retorno elevado 80 mm. O movimento mostrado representa essa operação manual; não existe motor transportando os alvos.'},
  {title:'Da leitura ao movimento do ponteiro',copy:'A construção está aberta para observar os cabos, a UNO e o servo atrás do mostrador. Os sensores enviam leituras à UNO; ao fechar a janela, o servo move o ponteiro. Gire a montagem ou use a vista de baixo para acompanhar o cabeamento. Ecos, interferência e comportamento elétrico ainda exigem ensaios físicos.'},
  {title:'Examine o sensor da rota A',copy:'O sensor A está isolado e enquadrado. Gire e aproxime a peça; a descrição junto ao modelo apresenta sua função, material e medidas de referência. Use “Voltar à montagem” para reintegrá-lo. Você também pode selecionar outras peças na cena ou na árvore.'}
];
let guideIndex=-1;
function showGuideStep(index){
  if(!model)return;
  guideIndex=Math.max(0,Math.min(guideSteps.length-1,index));
  const entry=guideSteps[guideIndex];
  $('#guide-content').hidden=false;$('#guide-start').textContent='Recomeçar exploração';
  $('#guide-step-status').textContent=`ETAPA ${guideIndex+1} DE ${guideSteps.length}`;
  $('#guide-title').textContent=entry.title;$('#guide-copy').textContent=entry.copy;
  $('#guide-prev').disabled=guideIndex===0;$('#guide-next').disabled=guideIndex===guideSteps.length-1;
  document.querySelectorAll('[data-guide-step]').forEach(button=>{if(Number(button.dataset.guideStep)===guideIndex)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  restoreAll();ghost=false;$('#ghost').checked=false;$('#clip-on').checked=false;updateClip();applyVisibility();
  if(guideIndex===2){$('#hold').checked=false;demo();}
  if(guideIndex===3){opened=true;applyVisibility();view('iso');}
  if(guideIndex===4)select('sensor_A');
  $('#guide-title').focus({preventScroll:true});
}
function endGuide(){guideIndex=-1;$('#guide-content').hidden=true;$('#guide-start').textContent='Explorar a montagem';restoreAll();$('#guide-start').focus({preventScroll:true});}
$('#guide-start').onclick=()=>showGuideStep(0);
document.querySelectorAll('[data-circuit]').forEach(button=>button.onclick=()=>inspectWiring(button.dataset.circuit));
$('#wire-select').onchange=()=>inspectWiring(wiringFilter,$('#wire-select').value);
$('#wiring-close').onclick=restoreAll;
$('#guide-prev').onclick=()=>showGuideStep(guideIndex-1);
$('#guide-next').onclick=()=>showGuideStep(guideIndex+1);
$('#guide-end').onclick=endGuide;
document.querySelectorAll('[data-guide-step]').forEach(button=>button.onclick=()=>showGuideStep(Number(button.dataset.guideStep)));

function updateSimulation(dt){
  if(playing){clock=stopAt===null?clock+dt:Math.min(stopAt,clock+dt);advance(state,clock);
    for(const t of actors){if(!t.active)continue;if($('#hold').checked&&t.present)continue;t.elapsed=Math.min(3.6,t.elapsed+dt);const p=targetPose(t.elapsed);t.y=p.y;t.lift=p.lift;if(p.present!==t.present){setStableBlocked(state,t.route,p.present);t.present=p.present;}if(t.elapsed>=3.6)t.active=false;}
    while(queue.length&&clock>=queue[0].at)begin(queue.shift().r);
    if(auto&&clock>=autoAt){const r=[0,1,2,1,2,1][autoIndex++%6];begin(r);autoAt=clock+3.65;}
    if(stopAt!==null&&clock>=stopAt){complete=true;stopAt=null;playing=false;$('#play').textContent='Retomar';}
  }
  for(const t of actors){const g=groups.get('alvo_'+'ABC'[t.route]);if(g){g.position.y=t.lift/1000;g.position.z=-t.y/1000;}$('#state-'+'ABC'[t.route]).textContent=`${'ABC'[t.route]}: ${t.present?'presente · 8':'livre · 14'} cm ideais · ${state.counts[t.route]} eventos · ${t.lift>0?'retorno elevado':t.active?'deslizando':'estacionado'}`;document.querySelector(`[data-move="${t.route}"]`).disabled=t.active;}
  const angle=state.winner===null?15:[40,90,140][state.winner];servoAngle=still.matches?angle:servoAngle+(angle-servoAngle)*(1-Math.exp(-dt/.25));const needle=groups.get('ponteiro');if(needle)needle.rotation.z=THREE.MathUtils.degToRad(servoAngle-90);
  $('#window-phase').textContent=`${state.closedAt===null?'Coletando passagens — ponteiro aguarda fechamento':'Ponteiro indica a última janela encerrada'} · próxima decisão em ${Math.max(0,10-(clock-state.start)).toFixed(1)} s`;
  const result=`Janela atual ${state.counts.join('/')} · última: ${state.lastCounts?state.lastCounts.join('/'):'aguardando fechamento'} · ${state.reason}${complete?' · Exemplo concluído; resultado mantido.':''}`;if($('#sim-status').textContent!==result)$('#sim-status').textContent=result;$('#sim-clock').textContent=`Tempo: ${clock.toFixed(1).replace('.',',')} s · janela de 10 s · comando servo ${angle}° · ponteiro ${servoAngle.toFixed(0)}°`;
}
async function initScene(){
  scene=new THREE.Scene();scene.background=new THREE.Color('#101b29');
  camera=new THREE.PerspectiveCamera(42,1,.005,15);renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;renderer.localClippingEnabled=true;stage.append(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.mouseButtons.MIDDLE=THREE.MOUSE.ROTATE;controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=.045;controls.maxDistance=3;controls.minPolarAngle=.001;controls.maxPolarAngle=Math.PI-.001;controls.screenSpacePanning=true;controls.addEventListener('change',cameraReadout);
  scene.add(new THREE.HemisphereLight('#dbeaff','#34445a',2.5));const sun=new THREE.DirectionalLight('#fff2dd',3.5);sun.position.set(1,2,1);scene.add(sun);const fill=new THREE.DirectionalLight('#9ecaff',2);fill.position.set(-1,.4,-1);scene.add(fill);
  const underside=new THREE.DirectionalLight('#e6efff',2.8);underside.position.set(.3,-1,-.2);scene.add(underside);
  const resize=()=>{const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(stage);resize();view('iso');
  let down;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointerup',e=>{if(e.button===0&&down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<5)pointerClick(e);down=null;});
  const loader=new GLTFLoader();let gltf;if(bootstrap?.glbBase64){const b=Uint8Array.from(atob(bootstrap.glbBase64),c=>c.charCodeAt(0));gltf=await loader.parseAsync(b.buffer,'');}else gltf=await loader.loadAsync('./'+modelUrl);
  model=gltf.scene;$('#guide-start').disabled=false;scene.add(model);model.updateMatrixWorld(true);let meshes=0;
  for(const id of manifest.groups??catalog.items.map(x=>x.id)){const g=model.getObjectByName(id);if(g)groups.set(id,g);}
  model.traverse(o=>{if(o.isMesh){meshes++;originalMaterials.set(o,o.material);o.userData.shell=shellPattern.test(o.name)&&isDescendantOf(o,groups.get('totem'));if(/base_MDF|tampa_tecnica|cobertura_tecnica/i.test(o.name))o.userData.shell=true;}});
  $('#load-status').textContent=`Modelo carregado · ${meshes} peças 3D · ${groups.size} grupos`;
  $('#diagnostic').textContent=`Arquivo: ${bootstrap?'GLB incorporado offline':new URL(modelUrl,location.href).href} · carregado · ${meshes} meshes · ${groups.size} grupos · 1 BU = 1 m · dados em mm`;
  renderLayers();applyVisibility();updateSimulation(0);$('#guide-start').disabled=false;
}

document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));$('#view-all').onclick=()=>{if(atlasReturnState)returnAssembly();else{isolated=null;applyVisibility();}view('iso');};$('#zoom-in').onclick=()=>zoom(.8);$('#zoom-out').onclick=()=>zoom(1.25);$('#azimuth').oninput=sphericalFromInputs;$('#elevation').oninput=sphericalFromInputs;$('#clip-on').onchange=updateClip;$('#clip').oninput=updateClip;
$('#presentation').onclick=()=>{const on=document.body.classList.toggle('presenting');$('#presentation').textContent=on?'Voltar à inspeção':'Modo apresentação';view('iso');};$('#ghost').onchange=()=>{ghost=$('#ghost').checked;applyVisibility();};$('#filter').oninput=renderTree;$('#restore').onclick=restoreAll;$('#open-build').onclick=()=>{opened=!opened;applyVisibility();};$('#demo').onclick=demo;$('#reset').onclick=reset;$('#play').onclick=()=>{playing=!playing;if(complete){complete=false;stopAt=null;}$('#play').textContent=playing?'Pausar':'Retomar';};$('#auto').onclick=()=>{auto=!auto;queue=[];stopAt=null;complete=false;if(auto)playing=true;$('#auto').textContent=auto?'Parar auto':'Iniciar auto';autoAt=clock;};document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>begin(Number(b.dataset.move)));
stage.addEventListener('keydown',event=>{if(['+','=','-'].includes(event.key)){zoom(event.key==='-'?1.15:.87);event.preventDefault();return;}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){$('#azimuth').value=Number($('#azimuth').value)+(event.key==='ArrowLeft'?-10:event.key==='ArrowRight'?10:0);$('#elevation').value=Number($('#elevation').value)+(event.key==='ArrowUp'?5:event.key==='ArrowDown'?-5:0);sphericalFromInputs();event.preventDefault();}});
try{await loadData();await initScene();const entry=new URLSearchParams(location.search),part=entry.get('part'),circuit=entry.get('circuit');if(part&&getItem(part))select(part);else if(['all','A','B','C','servo','power'].includes(circuit))inspectWiring(circuit);}catch(error){$('#load-status').textContent='Falha ao iniciar 3D: '+error.message;$('#fallback').hidden=false;$('#diagnostic').textContent=`Arquivo esperado ${modelUrl} · erro: ${error.message} · Catálogo ${catalog.items.length} itens`;console.error(error);}
function frame(time){const dt=lastFrame?Math.min((time-lastFrame)/1000,.05):0;lastFrame=time;if(!document.hidden){updateSimulation(dt);if(renderer&&scene){controls.update();renderer.render(scene,camera);}}requestAnimationFrame(frame);}requestAnimationFrame(frame);
