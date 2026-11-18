// Política das janelas e desempate igual à proposta do firmware; sem simular TRIG/ECHO, distância, acústica ou filtragem física.
export function createModel(windowSeconds = 10) {
  if (!Number.isFinite(windowSeconds) || windowSeconds <= 0) throw new RangeError('Janela inválida');
  return { windowSeconds, start: 0, now: 0, counts: [0,0,0], lastCounts: null,
    winner: null, reason: 'Aguardando primeiro fechamento', closedAt: null,
    channels: Array.from({length:3},()=>({blocked:true, armed:false})) };
}
export function advance(state, now) {
  if (!Number.isFinite(now) || now < state.now) throw new RangeError('Tempo precisa avançar');
  state.now = now;
  if (now - state.start < state.windowSeconds) return false;
  const peak = Math.max(...state.counts);
  const leaders = state.counts.map((n,i)=>n===peak?i:-1).filter(i=>i>=0);
  let winner = null;
  if (peak > 0 && leaders.length === 1) winner = leaders[0];
  else if (peak > 0 && state.winner !== null && leaders.includes(state.winner)) winner = state.winner;
  state.reason = peak === 0 ? 'Neutro: sem passagens na janela' : winner === null
    ? 'Neutro: empate sem anterior elegível' : leaders.length > 1
    ? `Via ${'ABC'[winner]} mantida: empate; anterior entre os máximos`
    : `Maior fluxo na última janela: via ${'ABC'[winner]}`;
  state.lastCounts = [...state.counts]; state.winner = winner;
  state.counts = [0,0,0]; state.closedAt = now; state.start = now;
  // Como no firmware, fechar janela não muda presença/armamento (blocked/armed).
  return true;
}
export function setStableBlocked(state, route, blocked) {
  if (!Number.isInteger(route) || route < 0 || route > 2) throw new RangeError('Via inválida');
  const channel = state.channels[route];
  if (channel.blocked === blocked) return false;
  channel.blocked = blocked;
  if (!blocked) {channel.armed = true; return false;}
  if (!channel.armed) return false;
  state.counts[route]++; channel.armed = false; return true;
}
export function passage(state, route) {
  // Botão representa uma sequência já validada: livre, bloqueado, livre.
  setStableBlocked(state,route,false);
  const counted=setStableBlocked(state,route,true);
  setStableBlocked(state,route,false);
  return counted;
}
