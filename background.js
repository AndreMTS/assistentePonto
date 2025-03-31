// Configurar verificação periódica
chrome.alarms.create('verificarPonto', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'verificarPonto') {
    verificarHorarios();
  }
});

function verificarHorarios() {
  const agora = new Date();
  
  chrome.storage.sync.get({
    chegadaInicio: '07:00',
    chegadaFim: '09:00',
    almocoSaidaInicio: '12:00',
    almocoSaidaFim: '13:00',
    almocoRetornoInicio: '13:00',
    almocoRetornoFim: '14:00',
    saidaInicio: '17:00',
    saidaFim: '18:00'
  }, (config) => {
    const registrosHoje = obterRegistrosHoje();
    
    // Verifica entrada
    if (dentroDoIntervalo(agora, config.chegadaInicio, config.chegadaFim) && 
        !registrosHoje.some(r => r.tipo === 'entrada')) {
      notificarUsuario('Entrada', 'Não esqueça de registrar seu ponto de entrada!');
    }
    
    // Verifica saída para almoço
    if (dentroDoIntervalo(agora, config.almocoSaidaInicio, config.almocoSaidaFim) && 
        registrosHoje.some(r => r.tipo === 'entrada') &&
        !registrosHoje.some(r => r.tipo === 'almoco_saida')) {
      notificarUsuario('Almoço', 'Não esqueça de registrar seu ponto de saída para almoço!');
    }
    
    // Verifica retorno do almoço
    if (dentroDoIntervalo(agora, config.almocoRetornoInicio, config.almocoRetornoFim) && 
        registrosHoje.some(r => r.tipo === 'almoco_saida') &&
        !registrosHoje.some(r => r.tipo === 'almoco_retorno')) {
      notificarUsuario('Retorno', 'Não esqueça de registrar seu ponto de retorno do almoço!');
    }
    
    // Verifica saída
    if (dentroDoIntervalo(agora, config.saidaInicio, config.saidaFim) && 
        registrosHoje.some(r => r.tipo === 'almoco_retorno') &&
        !registrosHoje.some(r => r.tipo === 'saida')) {
      notificarUsuario('Saída', 'Não esqueça de registrar seu ponto de saída!');
    }
  });
}

function dentroDoIntervalo(horario, inicio, fim) {
  const horaAtual = horario.getHours() * 60 + horario.getMinutes();
  const [horaInicio, minInicio] = inicio.split(':').map(Number);
  const [horaFim, minFim] = fim.split(':').map(Number);
  
  const inicioMinutos = horaInicio * 60 + minInicio;
  const fimMinutos = horaFim * 60 + minFim;
  
  return horaAtual >= inicioMinutos && horaAtual <= fimMinutos;
}

function notificarUsuario(tipo, mensagem) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Lembrete de Ponto',
    message: mensagem
  });
}

function obterRegistrosHoje() {
  const registros = JSON.parse(localStorage.getItem('registros') || '[]');
  const hoje = new Date().toDateString();
  
  return registros.filter(registro => 
    new Date(registro.horario).toDateString() === hoje
  );
} 