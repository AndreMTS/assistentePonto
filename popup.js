document.addEventListener('DOMContentLoaded', () => {
  const btnRegistrar = document.getElementById('registrarPonto');
  const btnConfig = document.getElementById('abrirConfig');
  const mensagemElement = document.getElementById('mensagem');

  atualizarMensagem();

  btnRegistrar.addEventListener('click', () => {
    const agora = new Date();
    const tipo = determinarTipoPonto();
    
    if (tipo) {
      const registro = {
        horario: agora.toISOString(),
        tipo: tipo
      };

      // Salvar registro no localStorage
      const registros = JSON.parse(localStorage.getItem('registros') || '[]');
      registros.push(registro);
      localStorage.setItem('registros', JSON.stringify(registros));

      mensagemElement.textContent = 'Ponto registrado com sucesso!';
      setTimeout(() => {
        window.close();
      }, 2000);
    }
  });

  btnConfig.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

function determinarTipoPonto() {
  const registrosHoje = obterRegistrosHoje();
  
  if (!registrosHoje.some(r => r.tipo === 'entrada')) {
    return 'entrada';
  }
  
  if (!registrosHoje.some(r => r.tipo === 'almoco_saida') && 
      registrosHoje.some(r => r.tipo === 'entrada')) {
    return 'almoco_saida';
  }
  
  if (!registrosHoje.some(r => r.tipo === 'almoco_retorno') && 
      registrosHoje.some(r => r.tipo === 'almoco_saida')) {
    return 'almoco_retorno';
  }
  
  if (!registrosHoje.some(r => r.tipo === 'saida') && 
      registrosHoje.some(r => r.tipo === 'almoco_retorno')) {
    return 'saida';
  }
  
  return null;
}

function atualizarMensagem() {
  const mensagemElement = document.getElementById('mensagem');
  const tipo = determinarTipoPonto();
  
  const mensagens = {
    'entrada': 'Registrar ponto de entrada?',
    'almoco_saida': 'Registrar ponto de saída para almoço?',
    'almoco_retorno': 'Registrar ponto de retorno do almoço?',
    'saida': 'Registrar ponto de saída?'
  };
  
  mensagemElement.textContent = tipo ? mensagens[tipo] : 'Todos os pontos do dia foram registrados!';
}

function obterRegistrosHoje() {
  const registros = JSON.parse(localStorage.getItem('registros') || '[]');
  const hoje = new Date().toDateString();
  
  return registros.filter(registro => 
    new Date(registro.horario).toDateString() === hoje
  );
} 