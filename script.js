(function(){
  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const CHAVE_CONTAS = "controle-financeiro:contas";
  const CHAVE_RECEITAS = "controle-financeiro:receitas";

  let contas = [];
  let receitas = [];
  let mesSelecionado = mesAtualKey();

  function mesAtualKey(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
  }

  function formatarMoeda(v){
    return v.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
  }

  function popularSeletorMes(){
    const select = document.getElementById("seletorMes");
    select.innerHTML = "";
    const hoje = new Date();
    for(let i=-12; i<=3; i++){
      const d = new Date(hoje.getFullYear(), hoje.getMonth()+i, 1);
      const key = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = MESES[d.getMonth()] + " / " + d.getFullYear();
      if(key === mesSelecionado) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener("change", () => {
      mesSelecionado = select.value;
      renderizarTudo();
    });
  }

  function carregarDados(){
    try{
      const raw = localStorage.getItem(CHAVE_CONTAS);
      contas = raw ? JSON.parse(raw) : [];
    }catch(e){ contas = []; }
    try{
      const raw = localStorage.getItem(CHAVE_RECEITAS);
      receitas = raw ? JSON.parse(raw) : [];
    }catch(e){ receitas = []; }
  }

  function salvarContas(){
    try{ localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas)); }
    catch(e){ console.error("Erro ao salvar contas", e); }
  }

  function salvarReceitas(){
    try{ localStorage.setItem(CHAVE_RECEITAS, JSON.stringify(receitas)); }
    catch(e){ console.error("Erro ao salvar receitas", e); }
  }

  function renderizarContas(){
    const lista = document.getElementById("listaContas");
    const doMes = contas.filter(c => c.mes === mesSelecionado);
    lista.innerHTML = "";
    if(doMes.length === 0){
      lista.innerHTML = '<div class="vazio">Nenhuma conta registrada neste mês ainda.</div>';
      return;
    }
    doMes.sort((a,b)=> a.nome.localeCompare(b.nome)).forEach(c=>{
      const item = document.createElement("div");
      item.className = "item despesa";
      item.innerHTML = `
        <div class="info">
          <span class="nome">${escapeHtml(c.nome)}</span>
          <span class="categoria">${escapeHtml(c.categoria)}</span>
        </div>
        <div class="direita">
          <span class="valor">${formatarMoeda(c.valor)}</span>
          <button class="status-btn ${c.pago ? 'pago' : 'pendente'}" data-id="${c.id}">${c.pago ? 'Pago' : 'Pendente'}</button>
          <button class="excluir" data-id="${c.id}" title="Excluir">✕</button>
        </div>
      `;
      lista.appendChild(item);
    });

    lista.querySelectorAll(".status-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.dataset.id;
        const c = contas.find(x=>x.id===id);
        c.pago = !c.pago;
        salvarContas();
        renderizarTudo();
      });
    });
    lista.querySelectorAll(".excluir").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.dataset.id;
        contas = contas.filter(x=>x.id!==id);
        salvarContas();
        renderizarTudo();
      });
    });
  }

  function renderizarReceitas(){
    const lista = document.getElementById("listaReceitas");
    const doMes = receitas.filter(r => r.mes === mesSelecionado);
    lista.innerHTML = "";
    if(doMes.length === 0){
      lista.innerHTML = '<div class="vazio">Nenhuma receita registrada neste mês ainda.</div>';
      return;
    }
    doMes.forEach(r=>{
      const item = document.createElement("div");
      item.className = "item receita";
      item.innerHTML = `
        <div class="info">
          <span class="nome">${escapeHtml(r.descricao)}</span>
        </div>
        <div class="direita">
          <span class="valor">${formatarMoeda(r.valor)}</span>
          <button class="excluir" data-id="${r.id}" title="Excluir">✕</button>
        </div>
      `;
      lista.appendChild(item);
    });
    lista.querySelectorAll(".excluir").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.dataset.id;
        receitas = receitas.filter(x=>x.id!==id);
        salvarReceitas();
        renderizarTudo();
      });
    });
  }

  function renderizarResumo(){
    const totalReceitas = receitas.filter(r=>r.mes===mesSelecionado).reduce((s,r)=>s+r.valor,0);
    const totalDespesas = contas.filter(c=>c.mes===mesSelecionado).reduce((s,c)=>s+c.valor,0);
    const saldo = totalReceitas - totalDespesas;

    document.getElementById("totalReceitas").textContent = formatarMoeda(totalReceitas);
    document.getElementById("totalDespesas").textContent = formatarMoeda(totalDespesas);
    const saldoEl = document.getElementById("saldoMes");
    saldoEl.textContent = formatarMoeda(saldo);
    saldoEl.classList.remove("pos","neg");
    saldoEl.classList.add(saldo >= 0 ? "pos" : "neg");
  }

  function renderizarGrafico(){
    const totalReceitas = receitas.filter(r=>r.mes===mesSelecionado).reduce((s,r)=>s+r.valor,0);
    const totalDespesas = contas.filter(c=>c.mes===mesSelecionado).reduce((s,c)=>s+c.valor,0);

    let percentual = 0;
    if(totalReceitas > 0){
      percentual = (totalDespesas / totalReceitas) * 100;
    } else if(totalDespesas > 0){
      percentual = 100; // sem renda cadastrada, mas com contas: trata como 100% consumido
    }

    const percentualExibido = Math.round(percentual);
    document.getElementById("graficoPercentual").textContent = percentualExibido + "%";

    // desenha o donut em SVG (raio 90, centro 110,110)
    const svg = document.getElementById("svgGrafico");
    const raio = 90;
    const centro = 110;
    const circunferencia = 2 * Math.PI * raio;
    const fracaoConsumida = Math.min(percentual, 100) / 100;
    const consumidoLen = circunferencia * fracaoConsumida;
    const restanteLen = circunferencia - consumidoLen;

    const corConsumido = percentual > 100 ? "#c96b6b" : "#c98686";
    const corRestante = "#ffffff2a";

    svg.innerHTML = `
      <circle cx="${centro}" cy="${centro}" r="${raio}" fill="none" stroke="${corRestante}" stroke-width="20"></circle>
      <circle cx="${centro}" cy="${centro}" r="${raio}" fill="none" stroke="${corConsumido}" stroke-width="20"
        stroke-dasharray="${consumidoLen} ${restanteLen}"
        stroke-linecap="round"
        transform="rotate(-90 ${centro} ${centro})"></circle>
    `;

    const legendas = document.getElementById("graficoLegendas");
    legendas.innerHTML = "";

    const itemReceita = document.createElement("div");
    itemReceita.className = "grafico-legenda-item";
    itemReceita.innerHTML = `
      <span class="esq"><span class="bolinha" style="background:var(--receita)"></span>Receita do mês</span>
      <span class="valor">${formatarMoeda(totalReceitas)}</span>
    `;
    legendas.appendChild(itemReceita);

    const itemDespesa = document.createElement("div");
    itemDespesa.className = "grafico-legenda-item";
    itemDespesa.innerHTML = `
      <span class="esq"><span class="bolinha" style="background:${corConsumido}"></span>Contas do mês</span>
      <span class="valor">${formatarMoeda(totalDespesas)}</span>
    `;
    legendas.appendChild(itemDespesa);

    const itemSaldo = document.createElement("div");
    itemSaldo.className = "grafico-legenda-item";
    const saldo = totalReceitas - totalDespesas;
    const msg = totalReceitas === 0
      ? "Cadastre receitas para calcular a porcentagem"
      : (saldo >= 0 ? "Sobra disponível" : "Contas ultrapassaram a renda");
    itemSaldo.innerHTML = `
      <span class="esq"><span class="bolinha" style="background:${saldo>=0 ? 'var(--receita)' : 'var(--despesa)'}"></span>${msg}</span>
      <span class="valor">${formatarMoeda(Math.abs(saldo))}</span>
    `;
    legendas.appendChild(itemSaldo);
  }

  function renderizarTudo(){
    renderizarContas();
    renderizarReceitas();
    renderizarResumo();
    renderizarGrafico();
  }

  function escapeHtml(str){
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function gerarId(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  }

  document.getElementById("formConta").addEventListener("submit", (e)=>{
    e.preventDefault();
    const nome = document.getElementById("contaNome").value.trim();
    const categoria = document.getElementById("contaCategoria").value;
    const valor = parseFloat(document.getElementById("contaValor").value);
    if(!nome || isNaN(valor)) return;
    contas.push({ id: gerarId(), mes: mesSelecionado, nome, categoria, valor, pago:false });
    salvarContas();
    e.target.reset();
    renderizarTudo();
  });

  document.getElementById("formReceita").addEventListener("submit", (e)=>{
    e.preventDefault();
    const descricao = document.getElementById("receitaDescricao").value.trim();
    const valor = parseFloat(document.getElementById("receitaValor").value);
    if(!descricao || isNaN(valor)) return;
    receitas.push({ id: gerarId(), mes: mesSelecionado, descricao, valor });
    salvarReceitas();
    e.target.reset();
    renderizarTudo();
  });

  document.getElementById("btnTabContas").addEventListener("click", ()=>{
    document.getElementById("btnTabContas").classList.add("ativo");
    document.getElementById("btnTabReceitas").classList.remove("ativo");
    document.getElementById("btnTabGrafico").classList.remove("ativo");
    document.getElementById("painelContas").classList.add("ativo");
    document.getElementById("painelReceitas").classList.remove("ativo");
    document.getElementById("painelGrafico").classList.remove("ativo");
  });
  document.getElementById("btnTabReceitas").addEventListener("click", ()=>{
    document.getElementById("btnTabReceitas").classList.add("ativo");
    document.getElementById("btnTabContas").classList.remove("ativo");
    document.getElementById("btnTabGrafico").classList.remove("ativo");
    document.getElementById("painelReceitas").classList.add("ativo");
    document.getElementById("painelContas").classList.remove("ativo");
    document.getElementById("painelGrafico").classList.remove("ativo");
  });
  document.getElementById("btnTabGrafico").addEventListener("click", ()=>{
    document.getElementById("btnTabGrafico").classList.add("ativo");
    document.getElementById("btnTabContas").classList.remove("ativo");
    document.getElementById("btnTabReceitas").classList.remove("ativo");
    document.getElementById("painelGrafico").classList.add("ativo");
    document.getElementById("painelContas").classList.remove("ativo");
    document.getElementById("painelReceitas").classList.remove("ativo");
  });

  // Registro do service worker (PWA) - só ativa se o arquivo existir e estiver em HTTPS/localhost
  if("serviceWorker" in navigator){
    window.addEventListener("load", ()=>{
      navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
    });
  }

  popularSeletorMes();
  carregarDados();
  renderizarTudo();
})();
