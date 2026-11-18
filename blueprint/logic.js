/* Modelo didático determinístico do perfil compacto. Não emula acústica nem o AVR. */
(function(root){
  'use strict';
  const C={enter:9,exit:12,scan:61,stable:2,window:10000,angles:[40,90,140],neutral:15};
  const demoEvents=[[1000,0,8],[1550,0,14],[2200,1,8],[2750,1,14],[3400,2,8],[3950,2,14],[4600,1,8],[5150,1,14],[5800,2,8],[6350,2,14],[7000,1,8],[7550,1,14]];
  function create(){return {now:0,start:0,nextScan:61,nextRoute:0,winner:null,angle:15,lastCounts:null,reason:'Aguardando o primeiro fechamento.',counts:[0,0,0],channels:Array.from({length:3},()=>({distance:14,state:'livre',candidate:'livre',samples:3,armed:true,ready:true,fault:false,tainted:false,validSamples:3,invalidSamples:0})),events:[],closed:0,demo:false,demoIndex:0,demoOrigin:0,lastScan:null};}
  function setDistance(s,i,d){if(!Number.isInteger(i)||i<0||i>2)throw new RangeError('Rota inválida');if(d!==null&&(!Number.isFinite(d)||d<2||d>400))throw new RangeError('Distância inválida');s.channels[i].distance=d;}
  function log(s,text,kind='read'){s.events.unshift({time:s.now,text,kind});s.events.length=Math.min(s.events.length,80);}
  function sample(s,i){const c=s.channels[i];s.lastScan=i;
    if(c.distance===null){c.invalidSamples++;c.validSamples=0;c.ready=false;c.armed=false;c.tainted=true;c.state='inválido';c.samples=0;c.candidate='inválido';if(c.invalidSamples>=3)c.fault=true;log(s,`Rota ${'ABC'[i]}: ${c.fault?'falha persistente':'leitura inválida'}.`, 'fault');return;}
    c.invalidSamples=0;c.validSamples++;
    const zone=c.distance<=C.enter?'presente':c.distance>=C.exit?'livre':null;
    if(zone===null){c.candidate=c.state;c.samples=0;return;}
    if(zone!==c.candidate){c.candidate=zone;c.samples=1;}else c.samples++;
    if(c.samples>=C.stable&&zone!==c.state){c.state=zone;if(zone==='livre')c.armed=true;else {if(c.ready&&c.armed){s.counts[i]++;log(s,`Rota ${'ABC'[i]}: passagem ${s.counts[i]} registrada.`,'entry');}c.armed=false;}}
    if(!c.ready&&zone==='livre'&&c.state==='livre'&&c.validSamples>=3&&c.samples>=C.stable){c.ready=true;c.fault=false;c.armed=true;log(s,`Rota ${'ABC'[i]}: livre novamente. A janela afetada continua incompleta.`,'recovery');}
  }
  function close(s){const peak=Math.max(...s.counts), leaders=s.counts.map((v,i)=>v===peak?i:-1).filter(i=>i>=0), incomplete=s.channels.some(c=>!c.ready||c.tainted);let win=null;
    if(!incomplete&&peak>0){if(leaders.length===1)win=leaders[0];else if(s.winner!==null&&leaders.includes(s.winner))win=s.winner;}
    s.lastCounts=[...s.counts];s.reason=incomplete?'Neutro: janela incompleta; as rotas não são comparáveis.':peak===0?'Neutro: nenhuma passagem nesta janela.':win===null?'Neutro: empate sem rota anterior elegível.':leaders.length>1?`Rota ${'ABC'[win]} mantida: empate entre os maiores valores.`:`Rota ${'ABC'[win]}: maior número de passagens na janela.`;
    s.winner=win;s.angle=win===null?C.neutral:C.angles[win];s.closed++;log(s,`${s.lastCounts.map((n,i)=>`${'ABC'[i]}=${n}`).join(' · ')} → ${win===null?'neutro':'ABC'[win]} (${s.angle}°).`,'close');s.counts=[0,0,0];s.start=s.now;s.channels.forEach(c=>{c.tainted=!c.ready;});
  }
  function advance(s,to){if(!Number.isFinite(to)||to<s.now)throw new RangeError('Tempo precisa avançar');
    while(s.now<to){const due=s.demo&&s.demoIndex<demoEvents.length?s.demoOrigin+demoEvents[s.demoIndex][0]:Infinity;const t=Math.min(to,s.nextScan,s.start+C.window,due);s.now=t;
      if(t===s.start+C.window)close(s);
      if(t===due){const e=demoEvents[s.demoIndex++];setDistance(s,e[1],e[2]);}
      if(t===s.nextScan){sample(s,s.nextRoute);s.nextRoute=(s.nextRoute+1)%3;s.nextScan+=C.scan;}
    }return s;}
  function startDemo(s){s.demo=true;s.demoIndex=0;s.demoOrigin=s.now;}
  const api={C,create,setDistance,sample,close,advance,startDemo,demoEvents};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BussolaLogic=api;
})(typeof window!=='undefined'?window:globalThis);
