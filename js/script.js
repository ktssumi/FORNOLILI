  /* ================== DADOS (edite aqui) ==================
     grupo:  "cookies" | "goiabada" | "coxinha"
     tipo:   "pronta" | "encomenda"      (PROVISÓRIO: todos como encomenda)
     status: "disponivel" | "esgotado"
     preco:  número (ex.: 7.5) ou null enquanto não confirmado */
  const WHATSAPP = "5511989634843"; // número que aparece na logo (PIX/WhatsApp). Confirmar com a Dani (DDI+DDD+número)
  const DONA = "Dani";

const FOTOS = {
    f1: "img/imagem-3.jpg",
    f2: "img/imagem-4.jpg",
    f3: "img/imagem-5.jpg",
    f4: "img/imagem-6.jpg",
    f5: "img/imagem-7.jpg",
    f6: "img/imagem-8.jpg",
    f7: "img/imagem-9.jpg",
    f8: "img/imagem-10.jpg",
    f9: "img/imagem-11.jpg"
  };
  /* Galeria: titulo e texto alternativo de cada foto */
  const GALERIA = [
    {f:"f8", legenda:"Cookie com doce de leite"},
    {f:"f1", legenda:"Docinhos de goiabada"},
    {f:"f2", legenda:"Caixinhas com a etiqueta do Forninho"},
    {f:"f3", legenda:"Brigadeiros de chocolate"},
    {f:"f6", legenda:"Brigadeiros no potinho de coração"},
    {f:"f4", legenda:"Docinhos vermelhos decorados"},
    {f:"f5", legenda:"Docinhos de goiabada com café"},
    {f:"f7", legenda:"Docinhos embalados para presente"},
    {f:"f9", legenda:"Saquinho de docinhos de goiabada"}
  ];
  const LOGO = "img/imagem-2.jpg";

  /* Docinhos: vendidos por peso (a seta escolhe a quantidade em quilos) */
  const PESOS = [{rot:"200 g", preco:14}, {rot:"Meio quilo", preco:25}, {rot:"1 quilo", preco:50}];
  function precoDe(p){ return p.pesos ? p.pesos[p.peso].preco : p.preco; }
  function rotulo(p){ return p.pesos ? p.nome + " (" + p.pesos[p.peso].rot + ")" : p.nome; }
  const A_CONF = "A confirmar com a Dani";
  const PRODUTOS = [
    {id:1, grupo:"cookies", emoji:"🍪", nome:"Cookie de brigadeiro tradicional"},
    {id:2, grupo:"cookies", emoji:"🍪", nome:"Cookie de ninho"},
    {id:3, grupo:"cookies", emoji:"🍪", nome:"Cookie de nutella"},
    {id:4, grupo:"cookies", emoji:"🍪", nome:"Cookie de doce de leite"},
    {id:5, grupo:"goiabada", emoji:"🍬", nome:"Docinho de goiabada"},
    {id:6, grupo:"goiabada", emoji:"🍬", nome:"Docinho sem goiabada"},
    {id:7, grupo:"coxinha", emoji:"🧁", nome:"Coxinha doce de brigadeiro"},
    {id:8, grupo:"coxinha", emoji:"🧁", nome:"Coxinha doce de ninho"},
    {id:9, grupo:"coxinha", emoji:"🧁", nome:"Coxinha doce de amendoim"}
  ].map(p => Object.assign({
    foto:null, preco:(p.grupo==="coxinha"?15:p.grupo==="cookies"?14:null), pesos:(p.grupo==="goiabada"?PESOS:null), peso:0, tipo:"encomenda", status:"disponivel",
    ingred:A_CONF, alerg:"Alérgenos: " + A_CONF
  }, p));

  /* ================== LÓGICA ================== */
  const qtds = {};
  let busca = "";
  const favs = new Set();
  const $ = (s) => document.querySelector(s);
  const moeda = (v) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  function desenhar(filtro){
    const grade = $("#grade");
    grade.innerHTML = "";
    PRODUTOS.filter(p => (filtro==="todos" || (filtro==="fav" ? favs.has(p.id) : p.grupo===filtro)) && p.nome.toLowerCase().includes(busca)).forEach(p => {
      const esg = p.status==="esgotado";
      const el = document.createElement("article");
      el.className = "prod" + (esg ? " esgotado" : "");
      el.dataset.g = p.grupo;
      el.innerHTML = `
        <div class="foto emoji"><span role="img" aria-label="Ilustração de ${p.nome}">${p.emoji}</span><button type="button" class="fav" data-fav="${p.id}" aria-pressed="${favs.has(p.id)}" aria-label="Favoritar ${p.nome}">♥</button></div>
        <div class="corpo">
          <h3>${p.nome}</h3>
          <div class="tags">
            <span class="tag ${p.tipo==="encomenda" ? "enc":""}">${p.tipo==="encomenda" ? "Sob encomenda" : "Pronta entrega"}</span>
            <span class="tag ${esg ? "off":"ok"}">${esg ? "Esgotado" : "Disponível"}</span>
          </div>
          <p class="info"><b>Ingredientes:</b> ${p.ingred}</p>
          <p class="alerg">⚠️ ${p.alerg}</p>
          ${p.pesos ? `<label class="peso">Escolha a quantidade<select data-peso="${p.id}" aria-label="Quantidade de ${p.nome}">${p.pesos.map((w,i) => `<option value="${i}" ${i===p.peso?"selected":""}>${w.rot} · ${moeda(w.preco)}</option>`).join("")}</select></label>` : ""}
          <div class="preco ${precoDe(p)==null?"pend":""}" id="pr${p.id}">${precoDe(p)==null ? "Preço a confirmar" : moeda(precoDe(p))}${p.pesos||precoDe(p)==null ? "" : " <small>cada</small>"}</div>
          <div class="qtd">
            <button type="button" aria-label="Diminuir ${p.nome}" data-id="${p.id}" data-d="-1" ${esg?"disabled":""}>−</button>
            <output id="q${p.id}" aria-live="polite">${qtds[p.id]||0}</output>
            <button type="button" aria-label="Aumentar ${p.nome}" data-id="${p.id}" data-d="1" ${esg?"disabled":""}>+</button>
          </div>
        </div>`;
      grade.appendChild(el);
    });
    if(!grade.children.length) grade.innerHTML = `<p class="vazio">${filtro==="fav" && !busca ? "Toque no ♥ dos doces para guardar seus favoritos 💗" : "Nenhum doce encontrado. Tente outra busca 💗"}</p>`;
  }

  function valorRadio(nome){
    return document.querySelector(`input[name="${nome}"]:checked`)?.value || "";
  }

  function dadosOk(){
    const entrega = valorRadio("recebimento") === "Entrega";
    return $("#nome").value.trim() !== "" &&
      $("#data").value !== "" &&
      valorRadio("pagamento") !== "" &&
      valorRadio("recebimento") !== "" &&
      (!entrega || $("#endereco").value.trim() !== "") &&
      $("#aceite-politica").checked;
  }

  function atualizarRecebimento(){
    const entrega = valorRadio("recebimento") === "Entrega";
    $("#campo-endereco").classList.toggle("on", entrega);
    $("#endereco").required = entrega;
    if(!entrega){
      $("#endereco").classList.remove("invalido");
      $("#erro-endereco").classList.remove("on");
    }
    atualizar();
  }

  function mostrarErros(){
    const n = $("#nome"), d = $("#data"), end = $("#endereco");
    const nOk = n.value.trim() !== "", dOk = d.value !== "";
    const pagOk = valorRadio("pagamento") !== "";
    const receb = valorRadio("recebimento");
    const recebOk = receb !== "";
    const endOk = receb !== "Entrega" || end.value.trim() !== "";
    const polOk = $("#aceite-politica").checked;

    n.classList.toggle("invalido", !nOk);
    d.classList.toggle("invalido", !dOk);
    end.classList.toggle("invalido", !endOk);
    $("#erro-nome").classList.toggle("on", !nOk);
    $("#erro-data").classList.toggle("on", !dOk);
    $("#erro-pagamento").classList.toggle("on", !pagOk);
    $("#erro-recebimento").classList.toggle("on", !recebOk);
    $("#erro-endereco").classList.toggle("on", !endOk);
    $("#erro-politica").classList.toggle("on", !polOk);
    $("#label-aceite").classList.toggle("invalido", !polOk);

    if(!nOk) return n;
    if(!dOk) return d;
    if(!pagOk) return document.querySelector('input[name="pagamento"]');
    if(!recebOk) return document.querySelector('input[name="recebimento"]');
    if(!endOk) return end;
    if(!polOk) return $("#aceite-politica");
    return null;
  }

  function atualizar(){
    marcarPassos();
    const itens = PRODUTOS.filter(p => (qtds[p.id]||0) > 0);
    const n = itens.reduce((s,p) => s + qtds[p.id], 0);
    const btn = $("#enviar");

    if(!n){
      $("#resumo").textContent = "Nenhum item escolhido";
      btn.setAttribute("aria-disabled","true");
      btn.href = "#cardapio";
      btn.removeAttribute("target");
      return;
    }

    const semPreco = itens.some(p => precoDe(p) == null);
    const total = semPreco ? null : itens.reduce((s,p) => s + precoDe(p)*qtds[p.id], 0);
    const ok = dadosOk();

    $("#resumo").textContent =
      `${n} ${n>1?"itens":"item"}` + (total!=null ? ` · ${moeda(total)}` : "") + (ok ? "" : " · faltam dados/aceite");
    btn.setAttribute("aria-disabled","false");

    if(!ok){
      btn.href = "#dados";
      btn.removeAttribute("target");
      return;
    }

    const nome = $("#nome").value.trim();
    const [a,m,d] = $("#data").value.split("-");
    const pagamento = valorRadio("pagamento");
    const recebimento = valorRadio("recebimento");
    const endereco = $("#endereco").value.trim();

    let msg = `Olá, ${DONA}! Aqui é ${nome}. Gostaria de fazer um pedido:\n\n`;
    itens.forEach(p => { msg += `• ${qtds[p.id]}x ${rotulo(p)}\n`; });
    if(total!=null) msg += `\nTotal estimado: ${moeda(total)}`;
    msg += `\nData desejada: ${d}/${m}/${a}`;
    msg += `\nForma de pagamento escolhida: ${pagamento}`;
    msg += `\nForma de recebimento: ${recebimento}`;
    if(recebimento === "Entrega") msg += `\nEndereço para entrega: ${endereco}`;
    if(recebimento === "Retirada") msg += `\nRetirada: local a combinar com a Dani`;
    msg += `\n\nPolítica de desistência e cancelamento: cliente confirma que leu e concorda com a política apresentada no site (desistência no meio do prazo: pagamento de 50% do valor).`;
    msg += `\n\nPor favor, confirme a disponibilidade, o valor final e os detalhes do pedido.`;
    btn.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    btn.target = "_blank";
  }

  // Eventos
  $("#grade").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if(!b) return;
    const id = +b.dataset.id;
    qtds[id] = Math.max(0, (qtds[id]||0) + (+b.dataset.d));
    $("#q"+id).textContent = qtds[id];
    atualizar();
  });

  document.querySelectorAll(".filtros button").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".filtros button").forEach(x => x.setAttribute("aria-pressed","false"));
      b.setAttribute("aria-pressed","true");
      desenhar(b.dataset.f);
    });
  });

  ["nome","data","endereco"].forEach(id => {
    $("#"+id).addEventListener("input", () => {
      if($("#erro-nome").classList.contains("on") ||
         $("#erro-data").classList.contains("on") ||
         $("#erro-endereco").classList.contains("on")) mostrarErros();
      atualizar();
    });
  });

  document.querySelectorAll('input[name="pagamento"]').forEach(input => {
    input.addEventListener("change", () => {
      if($("#erro-pagamento").classList.contains("on")) mostrarErros();
      atualizar();
    });
  });

  document.querySelectorAll('input[name="recebimento"]').forEach(input => {
    input.addEventListener("change", () => {
      if($("#erro-recebimento").classList.contains("on")) mostrarErros();
      atualizarRecebimento();
    });
  });

  $("#aceite-politica").addEventListener("change", () => {
    if($("#erro-politica").classList.contains("on")) mostrarErros();
    atualizar();
  });

  $("#enviar").addEventListener("click", (e) => {
    const btn = $("#enviar");
    if(btn.getAttribute("aria-disabled")==="true"){ e.preventDefault(); return; }
    if(!dadosOk()){
      e.preventDefault();
      atualizarRecebimento();
      const alvo = mostrarErros();
      $("#dados").scrollIntoView({behavior:"smooth"});
      if(alvo) alvo.focus({preventScroll:true});
    }
  });

  $("#data").min = new Date().toISOString().split("T")[0];

  /* ================== EXTRAS DIDÁTICOS ================== */
  // 1) Progresso dos 3 passos (marca conforme o cliente avança)
  function marcarPassos(){
    const n = Object.values(qtds).reduce((s,v) => s + v, 0);
    const p1 = n > 0, p2 = p1 && dadosOk(), p3 = p2;
    [[p1,"#passo1"],[p2,"#passo2"],[p3,"#passo3"]].forEach(([ok,id]) => $(id).classList.toggle("feito", ok));
    const atual = !p1 ? "#passo1" : !p2 ? "#passo2" : "#passo3";
    ["#passo1","#passo2","#passo3"].forEach(id => $(id).classList.toggle("atual", id === atual));
    $("#barra-prog").style.width = ([p1,p2,p3].filter(Boolean).length / 3 * 100) + "%";
    $("#passo3").querySelector("div").lastChild.textContent =
      p3 ? " Tudo pronto! Toque em “Pedir pelo WhatsApp”." : " A mensagem já sai pronta. É só enviar.";
  }

  // 2) Aviso rápido (toast)
  let toastT;
  function aviso(txt){
    const t = $("#toast"); t.textContent = txt; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 1600);
  }
  $("#grade").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-id]");
    if(!b || b.disabled) return;
    const p = PRODUTOS.find(x => x.id === +b.dataset.id);
    const out = $("#q"+p.id);
    out.classList.remove("pulo"); void out.offsetWidth; out.classList.add("pulo");
    aviso((+b.dataset.d > 0 ? "Adicionado: " : "Removido: ") + p.nome);
  });

  // 3) Galeria + lightbox (ampliar, setas do teclado, Esc)
  const lb = $("#lb");
  let lbI = 0;
  function abrirFoto(i){
    lbI = (i + GALERIA.length) % GALERIA.length;
    const g = GALERIA[lbI];
    $("#lb-img").src = FOTOS[g.f];
    $("#lb-img").alt = g.legenda;
    $("#lb-leg").textContent = g.legenda;
    $("#lb-cont").textContent = (lbI+1) + " de " + GALERIA.length;
    $("#toast").classList.remove("on");
    if(!lb.open) lb.showModal();
  }
  $("#galeria-grade").innerHTML = GALERIA.map((g,i) =>
    `<button type="button" data-i="${i}" aria-label="Ampliar: ${g.legenda}"><img src="${FOTOS[g.f]}" alt="${g.legenda}" loading="lazy"><span class="legenda">${g.legenda}</span></button>`
  ).join("");
  $("#galeria-grade").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]"); if(b) abrirFoto(+b.dataset.i);
  });
  $("#grade").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-foto]"); if(!b) return;
    abrirFoto(GALERIA.findIndex(g => g.f === b.dataset.foto));
  });
  $("#lb-fechar").addEventListener("click", () => lb.close());
  $("#lb-ant").addEventListener("click", () => abrirFoto(lbI - 1));
  $("#lb-prox").addEventListener("click", () => abrirFoto(lbI + 1));
  lb.addEventListener("click", (e) => { if(e.target === lb || e.target.classList.contains("lb-in")) lb.close(); });
  lb.addEventListener("keydown", (e) => {
    if(e.key === "ArrowLeft") abrirFoto(lbI - 1);
    if(e.key === "ArrowRight") abrirFoto(lbI + 1);
  });

  // 4) Seções aparecem suavemente ao rolar
  if("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    document.documentElement.classList.add("js");
    const io = new IntersectionObserver((es) => es.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add("vis"); io.unobserve(en.target); }
    }), {threshold:.08});
    document.querySelectorAll("main section .container").forEach(c => { c.classList.add("reveal"); io.observe(c); });
  }

  /* ================== V3: INTERATIVIDADE ================== */
  const filtroAtual = () => document.querySelector('.filtros [aria-pressed="true"]').dataset.f;
  const semAnim = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Chuva de docinhos ao adicionar + favoritos
  function chuva(el){
    if(semAnim) return;
    const r = el.getBoundingClientRect(), em = ["💗","🍪","✨","🍬","🧁"];
    for(let i=0;i<7;i++){
      const s = document.createElement("span"); s.className = "solta"; s.textContent = em[i % em.length];
      s.style.left = (r.left + r.width/2) + "px"; s.style.top = (r.top + r.height/2) + "px";
      s.style.setProperty("--dx", (Math.random()*120-60) + "px");
      s.style.setProperty("--dy", -(50+Math.random()*70) + "px");
      document.body.appendChild(s); setTimeout(() => s.remove(), 900);
    }
  }
  $("#grade").addEventListener("click", (e) => {
    const f = e.target.closest("button[data-fav]");
    if(f){
      const id = +f.dataset.fav;
      favs.has(id) ? favs.delete(id) : favs.add(id);
      f.setAttribute("aria-pressed", favs.has(id));
      aviso(favs.has(id) ? "♥ Guardado nos favoritos" : "Removido dos favoritos");
      if(filtroAtual() === "fav") desenhar("fav");
      return;
    }
    const b = e.target.closest('button[data-id][data-d="1"]');
    if(b && !b.disabled) chuva(b);
  });

  // Seta de quantidade (docinhos por peso)
  $("#grade").addEventListener("change", (e) => {
    const s = e.target.closest("select[data-peso]"); if(!s) return;
    const p = PRODUTOS.find(x => x.id === +s.dataset.peso);
    p.peso = +s.value;
    $("#pr"+p.id).textContent = moeda(precoDe(p));
    atualizar();
  });

  // Busca e "me surpreenda"
  $("#busca").addEventListener("input", (e) => { busca = e.target.value.trim().toLowerCase(); desenhar(filtroAtual()); });
  $("#surpresa").addEventListener("click", () => {
    const disp = PRODUTOS.filter(p => p.status !== "esgotado");
    const p = disp[Math.floor(Math.random()*disp.length)];
    busca = ""; $("#busca").value = "";
    document.querySelectorAll(".filtros button").forEach(x => x.setAttribute("aria-pressed", x.dataset.f === "todos" ? "true" : "false"));
    desenhar("todos");
    const el = $("#q"+p.id).closest(".prod");
    el.scrollIntoView({behavior:"smooth", block:"center"});
    el.classList.add("destaque"); setTimeout(() => el.classList.remove("destaque"), 2600);
    aviso("🎲 Que tal: " + p.nome + "?");
  });

  // Janela "Meu pedido"
  const ped = $("#ped");
  function renderPedido(){
    const itens = PRODUTOS.filter(p => (qtds[p.id]||0) > 0);
    $("#ped-lista").innerHTML = itens.length
      ? itens.map(p => `<li><span>${p.emoji} ${rotulo(p)}${precoDe(p)!=null ? `<small>${moeda(precoDe(p)*qtds[p.id])}</small>` : ""}</span><span class="qtd-mini"><button type="button" data-pid="${p.id}" data-d="-1" aria-label="Diminuir ${p.nome}">−</button><b>${qtds[p.id]}</b><button type="button" data-pid="${p.id}" data-d="1" aria-label="Aumentar ${p.nome}">+</button></span></li>`).join("")
      : '<li class="vazio">Seu pedido está vazio. Escolha um doce no cardápio 💗</li>';
  }
  $("#resumo").addEventListener("click", () => { renderPedido(); ped.showModal(); });
  $("#ped-lista").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-pid]"); if(!b) return;
    const id = +b.dataset.pid;
    qtds[id] = Math.max(0, (qtds[id]||0) + (+b.dataset.d));
    const o = $("#q"+id); if(o) o.textContent = qtds[id];
    atualizar(); renderPedido();
  });
  $("#ped-fechar").addEventListener("click", () => ped.close());
  $("#ped-continuar").addEventListener("click", () => { ped.close(); $("#dados").scrollIntoView({behavior:"smooth"}); });
  ped.addEventListener("click", (e) => { if(e.target === ped) ped.close(); });

  // Barra de rolagem e logo 3D
  const sp = $("#scroll-prog");
  addEventListener("scroll", () => {
    const h = document.documentElement;
    sp.style.width = (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1) * 100) + "%";
  }, {passive:true});
  const heroEl = document.querySelector(".hero"), hl = document.querySelector(".hero-logo");
  if(!semAnim){
    heroEl.addEventListener("mousemove", (e) => {
      const r = heroEl.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - .5, y = (e.clientY - r.top)/r.height - .5;
      hl.style.transform = `perspective(700px) rotateY(${x*14}deg) rotateX(${-y*10}deg)`;
    });
    heroEl.addEventListener("mouseleave", () => { hl.style.transform = ""; });
  }

  desenhar("todos");
  atualizar();
