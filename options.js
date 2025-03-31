document.addEventListener('DOMContentLoaded', () => {
  // Atualizar registros a cada minuto
  atualizarRegistrosHoje();
  setInterval(atualizarRegistrosHoje, 60000);

  // Carregar configurações salvas
  chrome.storage.sync.get({
    chegadaInicio: '07:00',
    chegadaFim: '09:00',
    almocoSaidaInicio: '12:00',
    almocoSaidaFim: '13:00',
    almocoRetornoInicio: '13:00',
    almocoRetornoFim: '14:00',
    saidaInicio: '17:00',
    saidaFim: '18:00'
  }, (items) => {
    Object.keys(items).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.value = items[key];
      }
    });
  });

  // Salvar configurações
  document.getElementById('salvar').addEventListener('click', () => {
    const config = {
      chegadaInicio: document.getElementById('chegadaInicio').value,
      chegadaFim: document.getElementById('chegadaFim').value,
      almocoSaidaInicio: document.getElementById('almocoSaidaInicio').value,
      almocoSaidaFim: document.getElementById('almocoSaidaFim').value,
      almocoRetornoInicio: document.getElementById('almocoRetornoInicio').value,
      almocoRetornoFim: document.getElementById('almocoRetornoFim').value,
      saidaInicio: document.getElementById('saidaInicio').value,
      saidaFim: document.getElementById('saidaFim').value
    };

    chrome.storage.sync.set(config, () => {
      alert('Configurações salvas com sucesso!');
    });
  });
});

function atualizarRegistrosHoje() {
  const registros = JSON.parse(localStorage.getItem('registros') || '[]');
  const hoje = new Date().toDateString();
  const registrosHoje = registros.filter(registro => 
    new Date(registro.horario).toDateString() === hoje
  );

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
    atualizarStatusRegistro('entrada', registrosHoje, config.chegadaInicio, config.chegadaFim);
    atualizarStatusRegistro('almoco-saida', registrosHoje, config.almocoSaidaInicio, config.almocoSaidaFim);
    atualizarStatusRegistro('almoco-retorno', registrosHoje, config.almocoRetornoInicio, config.almocoRetornoFim);
    atualizarStatusRegistro('saida', registrosHoje, config.saidaInicio, config.saidaFim);
  });
}

function atualizarStatusRegistro(tipo, registros, horaInicio, horaFim) {
  const element = document.getElementById(`registro-${tipo}`);
  const agora = new Date();
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFim, minFim] = horaFim.split(':').map(Number);
  
  const inicioMinutos = horaIni * 60 + minIni;
  const fimMinutos = horaFim * 60 + minFim;
  const agoraMinutos = agora.getHours() * 60 + agora.getMinutes();

  const tiposBusca = {
    'entrada': 'entrada',
    'almoco-saida': 'almoco_saida',
    'almoco-retorno': 'almoco_retorno',
    'saida': 'saida'
  };

  const descricoes = {
    'entrada': 'Entrada',
    'almoco-saida': 'Saída Almoço',
    'almoco-retorno': 'Retorno Almoço',
    'saida': 'Saída'
  };

  const registro = registros.find(r => r.tipo === tiposBusca[tipo]);

  if (registro) {
    const hora = new Date(registro.horario);
    element.className = 'registro-item registro-completo';
    element.textContent = `${descricoes[tipo]}: Registrado às ${hora.getHours()}:${String(hora.getMinutes()).padStart(2, '0')}`;
  } else if (agoraMinutos < inicioMinutos) {
    element.className = 'registro-item registro-pendente';
    element.textContent = `${descricoes[tipo]}: Aguardando (previsto ${horaInicio} - ${horaFim})`;
  } else if (agoraMinutos > fimMinutos) {
    element.className = 'registro-item registro-atrasado';
    element.textContent = `${descricoes[tipo]}: Não registrado! (período ${horaInicio} - ${horaFim})`;
  } else {
    element.className = 'registro-item registro-pendente';
    element.textContent = `${descricoes[tipo]}: Pendente! (período atual: ${horaInicio} - ${horaFim})`;
  }
} 