// KitchenFlow ECL v3.0 - Ranking Sheets + Regeneracao + Tabela Completa
import { useState, useEffect, useCallback } from "react";

// Load Barlow Condensed font
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500;600&display=swap";
document.head.appendChild(fontLink);

const fontStyle = document.createElement("style");
fontStyle.textContent = "* { font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif !important; } input, textarea, select { font-family: 'Barlow', sans-serif !important; }";
document.head.appendChild(fontStyle);



// Apps Script trigger deve estar configurado para "Head" para não precisar atualizar após cada deploy
const SHEET_URL="https://script.google.com/macros/s/AKfycbyQjtMs5k1aK0yDJVNOg0l-i6WExp3M19JeDkCP2IKcy8xPRo6H4HmE4emwbZXmev89rw/exec";
const enviar=(t,d)=>fetch(SHEET_URL,{method:"POST",body:JSON.stringify(typeof d==="object"&&d.linha?{tabela:t,...d}:{tabela:t,linha:d})}).catch(()=>{});
const V="#0e7490",V2="#0891b2",CR="#f0f9ff",BE="#bae6fd",CA="#0369a1",W="#ffffff",R="#dc2626",GR="#64748b",LC="#e0f2fe";

const FRIOS=["Congelador 1","Congelador 2","Congelador 3","Frig. Vert. 1","Frig. Vert. 2","Frig. Vert. 3","Frig. Vert. 4","Frig. Banc. 1","Frig. Banc. 2","Frig. Banc. 3","Frig. Banc. 4","Frig. Banc. 5"];
const CATS=["Legumes frescos","Carne","Peixe","Mercearia seca","Laticinios","Congelados","Outros"];
const TODOS_EQ=[...FRIOS,"Abatedor 1","Abatedor 2","Forno 1","Forno 2","Maq.vacuo 1","Maq.vacuo 2","Picadora","Batedeira","Amassadeira 1","Amassadeira 2","Desidratador","Bimby","Pacojet","Processador 1","Processador 2"];
const ZONAS={
"Bancadas":["Bancada 1 limpa e higienizada (cima e baixo)","Bancada 2 limpa e higienizada (cima e baixo)","Bancada 3 limpa e higienizada (cima e baixo)","Bancada 4 limpa e higienizada (cima e baixo)","Bancada 5 limpa e higienizada (cima e baixo)","Ralo cuba bancada 1 limpo","Ralo cuba bancada 2 limpo","Ralo cuba bancada 3 limpo","Ralo cuba bancada 4 limpo","Ralo cuba bancada 5 limpo","Bancadas laterais limpas e higienizadas"],
"Equipamentos":["Abatedor 1 desligado e higienizado","Abatedor 2 desligado e higienizado","Maq. vacuo 1 limpa e desligada","Maq. vacuo 2 limpa e desligada","Amassadeira 1 desligada e protegida c/pelicula","Amassadeira 2 desligada e protegida c/pelicula","Batedeira desligada e protegida c/pelicula","Picadora limpa e protegida c/pelicula","Processadores limpos e protegidos","Fogoes todos desligados","Ar condicionado desligado"],
"Frio":["Frigorifico vertical 1 verificado","Frigorifico vertical 2 verificado","Frigorifico vertical 3 verificado","Frigorifico vertical 4 verificado","Frigorifico bancada 1 verificado","Frigorifico bancada 2 verificado","Frigorifico bancada 3 verificado","Frigorifico bancada 4 verificado","Frigorifico bancada 5 verificado","Congelador 1 verificado","Congelador 2 verificado","Congelador 3 verificado","Temperaturas registadas"],
"Copa":["Loica lavada e arrumada","Sem utensilios por lavar","Cuba higienizada","Maq. lavagem 1 drenada, porta aberta e higienizada","Maq. lavagem 2 drenada, porta aberta e higienizada","Inoxes em condicoes","Panos colocados em solucao desinfetante","Esponjas colocadas em solucao desinfetante","Solucao desinfetante renovada"],
"Economatos":["Economato mat.-primas organizado","Mat.-primas devidamente armazenadas","Sem mat.-primas no chao","Economato material organizado","Material arrumado (nao no chao)","Chao economato em condicoes"],
"Residuos":["Lixo organico despejado no local correto","Lixo reciclavel separado corretamente","Caixotes lavados e higienizados","Sacos novos colocados"],
"Carrinhos":["Carrinho 1 limpo e higienizado","Carrinho 2 limpo e higienizado","Carrinhos arrumados no local correto"]
};
const PC=[{id:"fog",lb:"Fogões OK"},{id:"for",lb:"Fornos OK"},{id:"arc",lb:"Ar cond. OK"},{id:"cop",lb:"Copa OK"},{id:"fri",lb:"Frio OK"},{id:"hig",lb:"Higieniz. OK"},{id:"lix",lb:"Lixos OK"},{id:"ali",lb:"Alimentos armazenados"},{id:"ute",lb:"Utensílios OK"},{id:"cha",lb:"Chão lavado"},{id:"eco",lb:"Economatos OK"},{id:"asp",lb:"Aspeto geral"}];
const FOLHAS=[{id:"temperaturas",lb:"Temperaturas"},{id:"recepcao",lb:"Receção Matérias-Primas"},{id:"testemunho",lb:"Amostras Testemunho"},{id:"desinfecao",lb:"Desinfeção Alimentos Cru"},{id:"producao",lb:"Prod. Confeccionados"},{id:"higienizacao",lb:"Higienização Equip. e Utensilios"},{id:"manutencao",lb:"Manutenção, Avarias e Prevenção"},{id:"naoconf",lb:"Não Conformidades"},{id:"validacoes",lb:"Validações"}];
const MODS_DIARIOS=[
  {id:"higienePessoal",lb:"Higiene Pessoal",cor:"#0e7490"},
  {id:"temperaturas",lb:"Temperaturas",cor:"#0e7490"},
  {id:"recepcao",lb:"Receção Matérias-Primas",cor:"#0e7490"},
  {id:"higienizacao",lb:"Higienização",cor:"#0e7490"},
  {id:"encerramento",lb:"Encerramento da Aula",cor:"#0e7490"},
];
const MODS_ESPECIFICOS=[
  {id:"conservacao",lb:"Conservação de Produtos",cor:"#6d28d9"},
  {id:"regeneracao",lb:"Regeneração/Cook-Chill",cor:"#6d28d9"},
  {id:"testemunho",lb:"Amostra Testemunho",cor:"#6d28d9"},
  {id:"desinfecao",lb:"Desinfeção Alimentos em Cru",cor:"#6d28d9"},
  {id:"oleos",lb:"Controlo de Óleos",cor:"#6d28d9"},
  {id:"servico",lb:"Temperatura de Serviço",cor:"#6d28d9"},
  {id:"naoConf",lb:"Não Conformidades",cor:"#6d28d9"},
];
const MODS_GESTAO=[
  {id:"manutencao",lb:"Manutenção e Avarias",cor:"#b45309"},
  {id:"equipamentos",lb:"Fichas de Equipamentos",cor:"#b45309"},
  {id:"faltas",lb:"Faltas e Necessidades",cor:"#b45309"},
];
const MODS_HACCP=[...MODS_DIARIOS,...MODS_ESPECIFICOS];
const MODS=[...MODS_DIARIOS,...MODS_ESPECIFICOS,...MODS_GESTAO];

const gD=()=>new Date().toLocaleDateString("pt-PT");
const gT=()=>new Date().toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"});
const fD=s=>{if(!s)return"?";if(s.includes("/"))return s;const p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];};
const nD=s=>s?(s.includes("/")?s.split("/").reverse().join("-"):s):"";
const iC=(nm,t)=>{const v=parseFloat(t);if(isNaN(v))return null;const cg=nm.toLowerCase().includes("congelador")||nm.toLowerCase().includes("congel");return cg?v<=-18:v>=0&&v<=4;};

function B({lb,onClick,cor,dis,sm,out,st}){
  const bg=dis?"#ccc":out?"transparent":(cor||V);
  return <button onClick={onClick} disabled={dis} style={{background:bg,color:out?(cor||V):W,border:out?"2px solid "+(cor||V):"none",borderRadius:sm?8:11,padding:sm?"8px 14px":"13px 18px",fontSize:sm?13:15,fontWeight:600,cursor:dis?"not-allowed":"pointer",width:sm?"auto":"100%",fontFamily:"inherit",...st}}>{lb}</button>;
}
function Cd({children,st}){return <div style={{background:W,borderRadius:16,padding:18,marginBottom:14,boxShadow:"0 4px 16px rgba(14,116,144,.1)",border:"1px solid #e0f2fe",...st}}>{children}</div>;}
function Ip({lb,val,onChange,type,ph,min,max}){return <div style={{marginBottom:12}}>{lb&&<div style={{fontSize:10,fontWeight:700,color:CA,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{lb}</div>}<input type={type||"text"} value={val} onChange={e=>onChange(e.target.value)} placeholder={ph||""} min={min} max={max} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #bae6fd",fontSize:14,background:"#f0f9ff",outline:"none",color:"#0c4a6e",fontFamily:"inherit",boxSizing:"border-box"}}/></div>;}
function Sl({lb,val,onChange,opts}){return <div style={{marginBottom:12}}>{lb&&<div style={{fontSize:10,fontWeight:700,color:CA,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{lb}</div>}<select value={val} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #bae6fd",fontSize:14,background:"#f0f9ff",color:"#0c4a6e",outline:"none",fontFamily:"inherit"}}><option value="">-- Selecionar --</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;}
function Ta({lb,val,onChange,ph}){return <div style={{marginBottom:11}}>{lb&&<div style={{fontSize:11,fontWeight:600,color:CA,marginBottom:3,textTransform:"uppercase"}}>{lb}</div>}<textarea value={val} onChange={e=>onChange(e.target.value)} placeholder={ph||""} rows={3} style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1.5px solid "+BE,fontSize:14,background:LC,color:V,outline:"none",resize:"vertical",fontFamily:"inherit"}}/></div>;}
function Ck({lb,chk,onChange}){return <div onClick={()=>onChange(!chk)} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:"1px solid "+LC,cursor:"pointer"}}><div style={{width:25,height:25,borderRadius:7,border:"2px solid "+(chk?V:BE),background:chk?V:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{chk&&<span style={{color:W,fontSize:13,fontWeight:700}}>v</span>}</div><span style={{fontSize:13,color:chk?V:GR}}>{lb}</span></div>;}
function Pg({val,max}){const pct=val/Math.max(max,1)*100;return <div style={{background:"#e0f2fe",borderRadius:7,height:8,marginBottom:12}}><div style={{background:"linear-gradient(90deg,#0e7490,#0891b2)",height:8,borderRadius:7,width:pct+"%",transition:"width .3s"}}/></div>;}
function Tt({msg,onClose}){useEffect(()=>{const t=setTimeout(onClose,2800);return()=>clearTimeout(t);},[onClose]);return <div style={{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",background:V,color:W,borderRadius:11,padding:"11px 22px",fontSize:13,fontWeight:500,zIndex:9999}}>{msg}</div>;}
function Hd({user,onOut,onRanking}){return <div style={{background:"linear-gradient(135deg,#0e7490,#0369a1)",color:W,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:99,boxShadow:"0 4px 20px rgba(14,116,144,.4)"}}><div><div style={{fontSize:20,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>KitchenFlow <span style={{color:"#bae6fd"}}>ECL</span></div>{user&&<div style={{fontSize:10,opacity:.7,letterSpacing:.5,marginTop:1}}>{user.id} — {gD()}</div>}</div><div style={{display:"flex",gap:6}}>{user&&<button onClick={onRanking} style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",color:W,borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:.3}}>Ranking</button>}{user&&<button onClick={onOut} style={{background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.3)",color:W,borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",letterSpacing:.5}}>SAIR</button>}</div></div>;}

function Login({onLogin,db,showRanking,setShowRanking}){
  const [tipo,setTipo]=useState("aluno");
  const [turma,setTurma]=useState("");
  const [num,setNum]=useState("");
  const [prof,setProf]=useState("");
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const go=()=>{
    setErr("");
    if(tipo==="aluno"){
      if(!turma||!num||!pin){setErr("Preenche todos os campos.");return;}
      const n=parseInt(num);
      if(n<1||n>24){setErr("Número entre 1 e 24.");return;}
      if(pin!=="1234"){setErr("PIN incorreto: 1234");return;}
      onLogin({tipo:"aluno",id:turma+"-A"+String(n).padStart(2,"0"),turma});
    } else if(tipo==="professor") {
      if(!prof||!pin){setErr("Preenche todos os campos.");return;}
      if(pin!=="1111"){setErr("PIN incorreto: 1111");return;}
      onLogin({tipo:"professor",id:prof});
    } else if(tipo==="coord") {
      if(pin!=="1006"){setErr("PIN incorreto: 1006");return;}
      onLogin({tipo:"coord",id:"Coord."});
    } else {
      if(pin!=="2222"){setErr("PIN incorreto: 2222");return;}
      onLogin({tipo:"auxiliar",id:"Auxiliar"});
    }
  };
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0c4a6e,#0e7490,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",padding:22}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:36,fontWeight:700,color:W,marginBottom:6}}>ECL</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:W}}>KitchenFlow ECL</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",marginTop:2}}>ESCOLA DE COMÉRCIO DE LISBOA</div>
        </div>
        {showRanking&&<div style={{background:"rgba(255,255,255,.95)",borderRadius:16,padding:16,marginBottom:16,maxHeight:"50vh",overflowY:"auto"}}><Ranking db={db}/></div>}
        <div style={{background:W,borderRadius:20,padding:28,boxShadow:"0 20px 60px rgba(14,116,144,.3)",border:"1px solid rgba(186,230,253,.3)"}}>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[["aluno","Aluno"],["professor","Prof."],["coord","Coord."],["auxiliar","Aux."]].map(([t,lb])=>(
              <button key={t} onClick={()=>{setTipo(t);setErr("");setPin("");}} style={{flex:1,padding:"8px 2px",borderRadius:8,border:"2px solid "+(tipo===t?V:BE),background:tipo===t?V:LC,color:tipo===t?W:GR,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{lb}</button>
            ))}
          </div>
          {tipo==="aluno"&&<><Sl lb="Turma" val={turma} onChange={setTurma} opts={["T1","T2","T3"]}/><Ip lb="Número (1-24)" type="number" val={num} onChange={setNum} min="1" max="24"/></>}
          {tipo==="professor"&&<Sl lb="Professor" val={prof} onChange={setProf} opts={["P01","P02","P03"]}/>}
          {tipo==="coord"&&<div style={{textAlign:"center",padding:"6px 0",color:GR,fontSize:13}}>Coordenadora — PIN: 1006</div>}
          {tipo==="auxiliar"&&<div style={{textAlign:"center",padding:"6px 0",color:GR,fontSize:13}}>Auxiliar de Apoio — PIN: 2222</div>}
          <Ip lb="PIN" type="text" val={pin} onChange={setPin} ph={tipo==="aluno"?"PIN: 1234":"PIN: 1111"}/>
          {err&&<div style={{color:R,fontSize:12,marginBottom:8,textAlign:"center"}}>{err}</div>}
          <B lb="Entrar" onClick={go}/>
          <button onClick={()=>setShowRanking(!showRanking)} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px solid #bae6fd",background:"transparent",color:"#0369a1",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:8,textTransform:"uppercase",letterSpacing:.5}}>{showRanking?"Fechar Ranking":"Ver Ranking"}</button>
        </div>
      </div>
    </div>
  );
}

function DashAluno({user,db,setModule}){
  const h=gD();
  const [aba,setAba]=useState("modulos");
  const ncs=(db.ncs||[]).filter(n=>n.turma===user.turma&&n.date===h).length;
  const nomeAluno=db.assinaturas&&db.assinaturas[user.id];
  const nome=nomeAluno?(nomeAluno.split(" ")[0].charAt(0).toUpperCase()+nomeAluno.split(" ")[0].slice(1)):user.id;

  const tempI=!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-inicio"]);
  const tempF=!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-final"]);
  const encerrado=!!(db.encerramento&&db.encerramento["enc-"+user.turma+"-"+h]);
  const higPessoal=!!(db.higPessoal&&db.higPessoal["hig-pessoal-"+user.id+"-"+h]);
  const recepcao=!!(db.recepcao||[]).find(r=>r.turma===user.turma&&r.date===h);
  const higienizacao=!!(db.higienizacao&&db.higienizacao["hig-"+user.turma+"-"+h]&&db.higienizacao["hig-"+user.turma+"-"+h].registos);

  const higK2="hig-"+user.turma+"-"+h;
  const panosInicioD=!!(db.higienizacao&&db.higienizacao[higK2]&&db.higienizacao[higK2].panos&&db.higienizacao[higK2].panos["inicio"]);
  const panosFinalD=!!(db.higienizacao&&db.higienizacao[higK2]&&db.higienizacao[higK2].panos&&db.higienizacao[higK2].panos["final"]);
  const feitoMap={
    higienePessoal:higPessoal,
    temperaturas:tempI&&tempF,
    recepcao:recepcao,
    higienizacao:higienizacao,
    encerramento:encerrado,
  };

  const avisos=[];
  if(!higPessoal)avisos.push({msg:"Verificar Higiene Pessoal antes de entrar!",mod:"higienePessoal",urgente:false});
  // Check if temps already registered by any turma today
  const todasTurmas=["T1","T2","T3"];
  const tempIQualquer=todasTurmas.find(t=>db.temperaturas&&db.temperaturas["temp-"+t+"-"+h+"-inicio"]);
  const tempFQualquer=todasTurmas.find(t=>db.temperaturas&&db.temperaturas["temp-"+t+"-"+h+"-final"]);
  if(!tempI){
    if(tempIQualquer&&tempIQualquer!==user.turma){
      const regI=db.temperaturas["temp-"+tempIQualquer+"-"+h+"-inicio"];
      avisos.push({msg:"Temperaturas início já registadas pela "+tempIQualquer+" às "+regI.time+" — "+regI.aluno,mod:"temperaturas",urgente:false,info:true});
    } else {
      avisos.push({msg:"Falta registo de temperaturas — Início de aula",mod:"temperaturas",urgente:false});
    }
  }
  if(!tempF){
    if(tempFQualquer&&tempFQualquer!==user.turma){
      const regF=db.temperaturas["temp-"+tempFQualquer+"-"+h+"-final"];
      avisos.push({msg:"Temperaturas final já registadas pela "+tempFQualquer+" às "+regF.time+" — "+regF.aluno,mod:"temperaturas",urgente:false,info:true});
    } else {
      avisos.push({msg:"Falta registo de temperaturas — Final de aula",mod:"temperaturas",urgente:false});
    }
  }
  if(!encerrado){const now=new Date();if(now.getHours()>=14)avisos.push({msg:"Não esquecer o Encerramento da Aula!",mod:"encerramento",urgente:true});}
  // Panos aviso - inicio de aula
  const horaAtual=new Date().getHours();

  if(!panosInicioD&&horaAtual>=8&&horaAtual<14)avisos.push({msg:"🧽 Renovar solução desinfetante dos panos e esponjas — Início de aula!",mod:"higienizacao",urgente:true});
  if(!panosFinalD&&horaAtual>=14)avisos.push({msg:"🧽 Colocar panos e esponjas em solução desinfetante — Final de aula!",mod:"higienizacao",urgente:true});

  // Check amostra destruicao
  const hoje=new Date();
  const amostrasDestruir=(db.testemunho||[]).filter(t=>{
    if(!t.dataDestruicao)return false;
    const d=new Date(t.dataDestruicao);
    return d.toDateString()===hoje.toDateString();
  });
  if(amostrasDestruir.length>0){
    amostrasDestruir.forEach(a=>avisos.push({msg:"Destruir amostra testemunho hoje: "+a.prato,mod:"testemunho",urgente:true}));
  }

  const diariosDone=MODS_DIARIOS.filter(m=>feitoMap[m.id]).length;
  const pct=Math.round(diariosDone/MODS_DIARIOS.length*100);

  const grpStyle=(cor,feito)=>({
    background:feito?"#16a34a":W,
    border:"none",
    borderRadius:13,
    padding:"13px 11px",
    cursor:"pointer",
    textAlign:"left",
    boxShadow:"0 3px 10px rgba(0,0,0,.08)",
    borderLeft:"4px solid "+(feito?"#16a34a":cor),
  });

  return(
    <div style={{padding:15}}>
      {avisos.length>0&&<div style={{marginBottom:12}}>
        {avisos.map((av,i)=>(
          <div key={i} onClick={()=>setModule(av.mod)} style={{background:av.urgente?"#dc2626":av.info?"#e0f2fe":"#fdecea",border:"2px solid "+(av.urgente?"#b91c1c":av.info?"#0891b2":R),borderRadius:10,padding:"10px 13px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:11,color:W,fontWeight:700,background:av.urgente?"#b91c1c":av.info?"#0891b2":R,borderRadius:6,padding:"2px 7px"}}>{av.info?"✓":"(!)"}</span>
            <span style={{fontSize:12,fontWeight:600,color:av.urgente?W:av.info?"#0369a1":R,flex:1}}>{av.msg}</span>
            {!av.info&&<span style={{fontSize:11,color:av.urgente?W:R}}>Registar</span>}
          </div>
        ))}
      </div>}

      <div style={{background:"linear-gradient(135deg,"+V+","+V2+")",borderRadius:14,padding:18,marginBottom:14,color:W}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:21,fontWeight:700}}>Olá, {nome}!</div>
        <div style={{fontSize:12,opacity:.75,marginTop:2}}>{user.turma} — {h}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          <div style={{fontSize:11,opacity:.8}}>Registos diários: {diariosDone}/{MODS_DIARIOS.length}</div>
          <div style={{fontSize:16,fontWeight:800,color:pct===100?"#bbf7d0":W}}>{pct}%</div>
        </div>
        <div style={{background:"rgba(255,255,255,.2)",borderRadius:6,height:6,marginTop:6}}>
          <div style={{background:pct===100?"#16a34a":"#bae6fd",height:6,borderRadius:6,width:pct+"%",transition:"width .3s"}}/>
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["modulos","Módulos"],["historico","Histórico do Dia"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setAba(id)} style={{flex:1,padding:10,borderRadius:9,border:"2px solid "+(aba===id?V:BE),background:aba===id?V:LC,color:aba===id?W:GR,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{lb}</button>
        ))}
      </div>

      {aba==="modulos"&&<div>
        <div style={{fontSize:11,fontWeight:800,color:"#0e7490",textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingLeft:2,borderLeft:"3px solid #0e7490",paddingLeft:8}}>Registos HACCP Obrigatórios Diários</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {MODS_DIARIOS.map(m=>{
            const feito=!!feitoMap[m.id];
            return(
              <button key={m.id} onClick={()=>setModule(m.id)} style={{background:feito?"#16a34a":"#0e7490",border:"none",borderRadius:13,padding:"16px 12px",cursor:"pointer",textAlign:"left",boxShadow:"0 4px 12px rgba(14,116,144,.3)"}}>
                {feito&&<div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.8)",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>✓ Feito</div>}
                <div style={{fontSize:12,fontWeight:700,color:W,lineHeight:1.4,textTransform:"uppercase",letterSpacing:.3}}>{m.lb}</div>
              </button>
            );
          })}
        </div>

        <div style={{fontSize:11,fontWeight:800,color:"#db2777",textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingLeft:8,borderLeft:"3px solid #db2777"}}>Registos HACCP Específicos / Quando Aplicável</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {MODS_ESPECIFICOS.map(m=>(
            <button key={m.id} onClick={()=>setModule(m.id)} style={{background:"#db2777",border:"none",borderRadius:13,padding:"16px 12px",cursor:"pointer",textAlign:"left",boxShadow:"0 4px 12px rgba(219,39,119,.25)"}}>
              <div style={{fontSize:12,fontWeight:700,color:W,lineHeight:1.4,textTransform:"uppercase",letterSpacing:.3}}>{m.lb}</div>
            </button>
          ))}
        </div>

        <div style={{fontSize:11,fontWeight:800,color:"#d97706",textTransform:"uppercase",letterSpacing:1,marginBottom:8,paddingLeft:8,borderLeft:"3px solid #d97706"}}>Gestão da Cozinha</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {MODS_GESTAO.map(m=>(
            <button key={m.id} onClick={()=>setModule(m.id)} style={{background:"#d97706",border:"none",borderRadius:13,padding:"16px 12px",cursor:"pointer",textAlign:"left",boxShadow:"0 4px 12px rgba(217,119,6,.25)"}}>
              <div style={{fontSize:12,fontWeight:700,color:W,lineHeight:1.4,textTransform:"uppercase",letterSpacing:.3}}>{m.lb}</div>
            </button>
          ))}
        </div>
      </div>}

      {aba==="historico"&&<div>
        <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:V,marginBottom:12}}>Histórico — {h}</div>
        <div style={{background:W,borderRadius:11,padding:"9px 13px",marginBottom:13}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:600,color:V}}>Registos diários</span>
            <span style={{fontSize:12,fontWeight:700,color:diariosDone===MODS_DIARIOS.length?V:CA}}>{diariosDone}/{MODS_DIARIOS.length}</span>
          </div>
          <Pg val={diariosDone} max={MODS_DIARIOS.length}/>
        </div>
        {MODS_DIARIOS.map(m=>(
          <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+LC}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:22,height:22,borderRadius:6,background:feitoMap[m.id]?"#16a34a":"transparent",border:"2px solid "+(feitoMap[m.id]?"#16a34a":BE),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {feitoMap[m.id]&&<span style={{color:W,fontSize:11,fontWeight:700}}>v</span>}
              </div>
              <div style={{fontSize:13,fontWeight:feitoMap[m.id]?600:400,color:feitoMap[m.id]?"#16a34a":GR}}>{m.lb}</div>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:feitoMap[m.id]?"#16a34a":R}}>{feitoMap[m.id]?"OK":"Por fazer"}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

function Temperaturas({user,db,setDb,showToast}){
  const h=gD();
  const kI="temp-"+user.turma+"-"+h+"-inicio";
  const kF="temp-"+user.turma+"-"+h+"-final";
  const svI=db.temperaturas&&db.temperaturas[kI];
  const svF=db.temperaturas&&db.temperaturas[kF];
  const [momento,setMomento]=useState("inicio");
  const k=momento==="inicio"?kI:kF;
  const sv=momento==="inicio"?svI:svF;

  // Load existing temps if partial registration
  const [temps,setTemps]=useState(()=>{
    const existing=momento==="inicio"?svI:svF;
    if(existing&&existing.temps)return existing.temps;
    return {};
  });

  // Check if all equipments have been registered
  const todosPreenchidos=FRIOS.every(eq=>temps[eq]!==undefined&&temps[eq]!=="");
  // Check if fully saved (all equipment + saved to db)
  const done=!!sv&&FRIOS.every(eq=>{
    const r=sv.records&&sv.records.find(x=>x.equipamento===eq);
    return r&&r.temperatura!=="";
  });

  const save=()=>{
    const cab=["Data","Turma","Aluno","Momento","Hora",...FRIOS.flatMap(eq=>[eq+" Temp",eq+" Conf"]),"Validado Prof"];
    const records=FRIOS.map(eq=>({equipamento:eq,temperatura:temps[eq]||"",conforme:iC(eq,temps[eq])}));
    const nomeTemp=(db.assinaturas&&db.assinaturas[user.id])||"";
    const linha=[h,gT(),user.turma,user.id,nomeTemp,momento,...records.flatMap(r=>[r.temperatura,r.conforme===false?"NC":r.conforme===true?"OK":"---"]),""];
    setDb(p=>{
      const te={...p.temperaturas};
      te[k]={temps,records,aluno:user.id,turma:user.turma,date:h,time:gT(),momento};
      const ncs=[...(p.ncs||[])];
      records.filter(r=>r.conforme===false&&r.temperatura!=="").forEach(r=>ncs.push({id:Date.now()+Math.random(),date:h,time:gT(),zona:r.equipamento,descricao:"Temp NC "+momento+": "+r.temperatura+"C",acaoCorretiva:"",responsavel:user.id,turma:user.turma,estado:"aberta",professor:""}));
      return{...p,temperaturas:te,ncs};
    });
    enviar("Temperaturas",{cabecalho:cab,linha});
    showToast("Temperaturas "+momento+" guardadas!");
    if(momento==="inicio"&&todosPreenchidos)setMomento("final");
  };

  // When switching moment, load existing temps
  const switchMomento=(m)=>{
    setMomento(m);
    const existing=m==="inicio"?svI:svF;
    if(existing&&existing.temps)setTemps(existing.temps);
    else setTemps({});
  };

  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Temperaturas</div><InfoBtn modId="temperaturas"/></div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["inicio","final"].map(m=>{
          const feito=m==="inicio"?!!svI:!!svF;
          const completo=feito&&FRIOS.every(eq=>{
            const sv2=m==="inicio"?svI:svF;
            const r=sv2&&sv2.records&&sv2.records.find(x=>x.equipamento===eq);
            return r&&r.temperatura!=="";
          });
          return(
            <button key={m} onClick={()=>switchMomento(m)} style={{flex:1,padding:10,borderRadius:9,border:"2px solid "+(momento===m?"#0e7490":BE),background:momento===m?"#0e7490":completo?"#e0f2fe":feito?"#fff3e0":LC,color:momento===m?W:completo?"#0e7490":feito?"#d97706":GR,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              {m==="inicio"?"Início de Aula":"Final de Aula"}
              {completo&&<span style={{fontSize:10,display:"block",opacity:.8}}>Completo {m==="inicio"?svI.time:svF.time}</span>}
              {feito&&!completo&&<span style={{fontSize:10,display:"block",opacity:.8}}>Incompleto — continuar</span>}
            </button>
          );
        })}
      </div>

      {sv&&done?(
        <div>
          <div style={{background:"#e0f2fe",borderRadius:11,padding:"10px 14px",marginBottom:12,color:"#0e7490",fontSize:13,fontWeight:600}}>
            Registado por {sv.aluno} às {sv.time}
          </div>
          {FRIOS.map(eq=>{
            const r=sv.records?sv.records.find(x=>x.equipamento===eq):null;
            const cg=eq.toLowerCase().includes("congelador")||eq.toLowerCase().includes("congel");
            const nc=r&&r.conforme===false;
            const ok=r&&r.conforme===true;
            return(
              <Cd key={eq} st={{marginBottom:8,borderLeft:"3px solid "+(nc?R:ok?V:BE)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#0c4a6e"}}>{eq}</div>
                    <div style={{fontSize:10,color:cg?"#7c3aed":"#0369a1",fontWeight:600,marginTop:1}}>{cg?"Congelação: ≤ -18°C":"Refrigeração: 0°C a 4°C"}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:20,fontWeight:800,color:nc?R:ok?V:GR}}>{r&&r.temperatura?r.temperatura+"°C":"---"}</div>
                    <div style={{fontSize:11,fontWeight:700,color:nc?R:ok?V:GR}}>{nc?"NC":ok?"OK":"---"}</div>
                  </div>
                </div>
              </Cd>
            );
          })}
        </div>
      ):(
        <div>
          {sv&&!done&&<div style={{background:"#fff3e0",borderRadius:9,padding:10,marginBottom:10,color:"#d97706",fontSize:12,fontWeight:600}}>
            Registo incompleto — preenche os equipamentos em falta e guarda novamente.
          </div>}
          <div style={{marginBottom:10,fontSize:11,color:GR}}>
            Preenchidos: {FRIOS.filter(eq=>temps[eq]!==undefined&&temps[eq]!=="").length}/{FRIOS.length}
          </div>
          {FRIOS.map(eq=>{
            const cg=eq.toLowerCase().includes("congelador")||eq.toLowerCase().includes("congel"),cf=iC(eq,temps[eq]);
            const preenchido=temps[eq]!==undefined&&temps[eq]!=="";
            return(
              <Cd key={eq} st={{marginBottom:8,borderLeft:"3px solid "+(cf===false?R:cf===true?V:preenchido?"#bae6fd":BE)}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#0c4a6e"}}>{eq}</div>
                    <div style={{fontSize:10,color:cg?"#7c3aed":"#0369a1",fontWeight:600,marginTop:1}}>{cg?"Congelação: ≤ -18°C":"Refrigeração: 0°C a 4°C"}</div>
                    <div style={{fontSize:9,color:GR,marginTop:1}}>{cg?"Zona ideal: -18°C a -22°C":"Zona ideal: 1°C a 3°C"}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:3}}>
                    {cg&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
                      <button onClick={()=>{const cur=String(temps[eq]||"");const abs=cur.replace("-","");setTemps(p=>({...p,[eq]:"-"+abs}));}} style={{width:26,height:16,borderRadius:4,border:"1.5px solid "+(temps[eq]&&String(temps[eq])[0]==="-"?"#dc2626":BE),background:temps[eq]&&String(temps[eq])[0]==="-"?"#dc2626":"transparent",color:temps[eq]&&String(temps[eq])[0]==="-"?W:GR,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",lineHeight:1,padding:0}}>−</button>
                      <button onClick={()=>{const cur=String(temps[eq]||"");const abs=cur.replace("-","");setTemps(p=>({...p,[eq]:abs}));}} style={{width:26,height:16,borderRadius:4,border:"1.5px solid "+(temps[eq]&&String(temps[eq])[0]!=="-"&&temps[eq]?"#16a34a":BE),background:temps[eq]&&String(temps[eq])[0]!=="-"&&temps[eq]?"#16a34a":"transparent",color:temps[eq]&&String(temps[eq])[0]!=="-"&&temps[eq]?W:GR,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",lineHeight:1,padding:0}}>+</button>
                    </div>}
                    <input type="number" value={temps[eq]?String(temps[eq]).replace("-",""):""} onChange={e=>{const neg=cg&&temps[eq]&&String(temps[eq])[0]==="-";setTemps(p=>({...p,[eq]:neg&&e.target.value?"-"+e.target.value:e.target.value}));}} placeholder="0" step="0.1" min="0" style={{width:52,padding:"7px 6px",borderRadius:7,border:"2px solid "+(cf===false?R:cf===true?V:preenchido?"#bae6fd":BE),fontSize:14,fontWeight:600,textAlign:"center",background:LC,color:V,fontFamily:"inherit"}}/>
                    <span style={{fontSize:10,fontWeight:700,color:cf===false?R:cf===true?V:GR,minWidth:20}}>{cf===false?"NC":cf===true?"OK":""}</span>
                  </div>
                </div>
              </Cd>
            );
          })}
          <B lb={todosPreenchidos?"Guardar Temperaturas "+momento.toUpperCase():"Guardar ("+FRIOS.filter(eq=>temps[eq]!==undefined&&temps[eq]!=="").length+"/"+FRIOS.length+" preenchidos)"} onClick={save} cor={todosPreenchidos?"#0e7490":"#0369a1"}/>
          {!todosPreenchidos&&<div style={{marginTop:8,fontSize:11,color:GR,textAlign:"center"}}>Podes guardar parcialmente e continuar depois.</div>}
        </div>
      )}
    </div>
  );
}

function Recepcao({user,db,setDb,showToast}){
  const [step,setStep]=useState("lista");
  const [form,setForm]=useState({fornecedor:"",fatura:"",professor:"P01"});
  const [prods,setProds]=useState([]);
  const [np,setNp]=useState({categoria:"",nome:"",quantidade:"",lote:"",validade:"",conforme:"conforme"});
  const lista=(db.recepcao||[]).filter(r=>r.turma===user.turma).slice(-10).reverse();
  const addP=()=>{if(!np.categoria||!np.nome)return;setProds(p=>[...p,{...np,id:Date.now()}]);setNp({categoria:"",nome:"",quantidade:"",lote:"",validade:"",conforme:"conforme"});};
  const save=()=>{
    if(!form.fornecedor||!form.fatura)return;
    const rec={...form,produtos:prods,aluno:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()};
    setDb(p=>({...p,recepcao:[...(p.recepcao||[]),rec]}));
    const nomeRec=(db.assinaturas&&db.assinaturas[user.id])||"";
    prods.forEach(p=>enviar("Receção Matérias-Primas",[gD(),gT(),user.turma,user.id,nomeRec,form.fornecedor,form.fatura,p.nome,p.categoria,p.quantidade,p.lote||"",p.validade,p.conforme]));
    showToast("Receção registada!");
    // Clear form
    setStep("lista");
    setForm({fornecedor:"",fatura:"",professor:"P01"});
    setProds([]);
  };
  if(step==="lista")return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Receção de Matérias-Primas</div>
      <B lb="+ Nova Receção" onClick={()=>setStep("nova")}/>
      {lista.map(r=><Cd key={r.id} st={{marginTop:10}}>
        <div style={{fontWeight:600,fontSize:13}}>{r.fornecedor} — Ft {r.fatura}</div>
        <div style={{fontSize:11,color:GR}}>{r.date} {r.time} — {r.aluno} — {(r.produtos||[]).length} produto(s)</div>
        {(r.produtos||[]).map(p=><div key={p.id} style={{fontSize:11,color:"#0369a1",marginTop:3}}>• {p.nome} — {p.categoria} — {p.quantidade}</div>)}
      </Cd>)}
    </div>
  );
  if(step==="nova")return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Nova Receção</div>
      <Cd>
        <Ip lb="Fornecedor" val={form.fornecedor} onChange={v=>setForm(p=>({...p,fornecedor:v}))}/>
        <Ip lb="Fatura" val={form.fatura} onChange={v=>setForm(p=>({...p,fatura:v}))}/>
        <Sl lb="Professor" val={form.professor} onChange={v=>setForm(p=>({...p,professor:v}))} opts={["P01","P02","P03"]}/>
      </Cd>
      <div style={{display:"flex",gap:8}}>
        <B lb="Voltar" sm out cor={GR} onClick={()=>setStep("lista")} st={{flex:1}}/>
        <B lb="Adicionar Produtos" sm onClick={()=>{if(form.fornecedor&&form.fatura)setStep("produtos");}} st={{flex:2}}/>
      </div>
    </div>
  );
  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Produtos — Ft {form.fatura}</div>
      {prods.length>0&&<Cd st={{marginBottom:10}}>
        {prods.map(p=><div key={p.id} style={{padding:"6px 0",borderBottom:"1px solid "+LC,display:"flex",justifyContent:"space-between"}}>
          <div><div style={{fontWeight:600,fontSize:13}}>{p.nome}</div><div style={{fontSize:11,color:GR}}>{p.categoria} — {p.quantidade}</div></div>
          <span style={{fontSize:11,color:p.conforme==="conforme"?V:R,fontWeight:600}}>{p.conforme}</span>
        </div>)}
      </Cd>}
      <Cd>
        <Sl lb="Categoria" val={np.categoria} onChange={v=>setNp(p=>({...p,categoria:v}))} opts={CATS}/>
        <Ip lb="Nome" val={np.nome} onChange={v=>setNp(p=>({...p,nome:v}))}/>
        <Ip lb="Quantidade" val={np.quantidade} onChange={v=>setNp(p=>({...p,quantidade:v}))} ph="Ex: 5 kg"/>
        <Ip lb="Lote" val={np.lote} onChange={v=>setNp(p=>({...p,lote:v}))}/>
        <Ip lb="Validade" type="date" val={np.validade} onChange={v=>setNp(p=>({...p,validade:v}))}/>
        <Sl lb="Conformidade" val={np.conforme} onChange={v=>setNp(p=>({...p,conforme:v}))} opts={["conforme","não conforme"]}/>
        <B lb="+ Adicionar Produto" sm onClick={addP} cor={V2}/>
      </Cd>
      <div style={{display:"flex",gap:8,marginTop:6}}>
        <B lb="Voltar" sm out cor={GR} onClick={()=>setStep("nova")} st={{flex:1}}/>
        <B lb="Guardar Receção" sm onClick={save} cor={prods.length>0?V:"#ccc"} dis={prods.length===0} st={{flex:2}}/>
      </div>
    </div>
  );
}

const TABELA_ALIMENTOS={
  "Carnes":[
    {prod:"Carne bovina crua",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-5 dias",frig_vacuo:"30-40 dias",cong_normal:"6 meses",cong_vacuo:"2-3 anos"},
    {prod:"Carne bovina confeccionada",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"2-3 meses",cong_vacuo:"2-3 anos"},
    {prod:"Carne suína crua",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-5 dias",frig_vacuo:"15 dias",cong_normal:"4-6 meses",cong_vacuo:"18 meses"},
    {prod:"Carne suína confeccionada",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"2-3 meses",cong_vacuo:"15 meses"},
    {prod:"Carne picada crua",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"4-5 dias",cong_normal:"4 meses",cong_vacuo:"1 ano"},
    {prod:"Hambúrguer cru",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"4-6 dias",cong_normal:"3-4 meses",cong_vacuo:"1 ano"},
    {prod:"Hambúrguer confeccionado",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"2-3 meses",cong_vacuo:"1 ano"},
  ],
  "Aves":[
    {prod:"Frango/Peru inteiro cru",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"6-9 dias",cong_normal:"1 ano",cong_vacuo:"2-3 anos"},
    {prod:"Frango/Peru peças cruas",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"6-9 dias",cong_normal:"9 meses",cong_vacuo:"2 anos"},
    {prod:"Frango/Peru confeccionado",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"6-9 dias",cong_normal:"4-6 meses",cong_vacuo:"2-3 anos"},
    {prod:"Frango frito",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"4 meses",cong_vacuo:"1-2 anos"},
  ],
  "Carnes Frias e Enchidos":[
    {prod:"Bacon",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"7 dias",frig_vacuo:"15 dias",cong_normal:"1 mês",cong_vacuo:"7 meses"},
    {prod:"Fiambre fatiado",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"160-180 dias",cong_normal:"1-2 meses",cong_vacuo:"6 meses"},
    {prod:"Salsichas — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1 semana",frig_vacuo:"25 dias",cong_normal:"1-2 meses",cong_vacuo:"10 meses"},
    {prod:"Linguiça",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"15 dias",frig_vacuo:"60 dias",cong_normal:"30 dias",cong_vacuo:"8 meses"},
    {prod:"Presunto",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"15 dias",frig_vacuo:"20 dias",cong_normal:"25 dias",cong_vacuo:"8 meses"},
    {prod:"Frios (geral)",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-5 dias",frig_vacuo:"15-20 dias",cong_normal:"1-2 meses",cong_vacuo:"6 meses"},
  ],
  "Peixe e Marisco":[
    {prod:"Peixe magro cru (bacalhau, pescada)",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"7-8 dias",cong_normal:"6 meses",cong_vacuo:"10-12 meses"},
    {prod:"Peixe gordo cru (salmão, atum)",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"4-6 dias",cong_normal:"6 meses",cong_vacuo:"10-12 meses"},
    {prod:"Peixe confeccionado",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"4-6 meses",cong_vacuo:"1-2 anos"},
    {prod:"Peixe fumado (vácuo)",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"14 dias",frig_vacuo:"21 dias",cong_normal:"2 meses",cong_vacuo:"6 meses"},
    {prod:"Camarão/Marisco cru",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"4-5 dias",cong_normal:"3-6 meses",cong_vacuo:"10-12 meses"},
    {prod:"Camarão/Marisco confeccionado",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"3 meses",cong_vacuo:"9 meses"},
  ],
  "Laticínios":[
    {prod:"Leite",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"7 dias",frig_vacuo:"21 dias",cong_normal:"3 meses",cong_vacuo:"6 meses"},
    {prod:"Manteiga",estado:"cru",amb_normal:"1-2 dias",amb_vacuo:"5-7 dias",frig_normal:"7-14 dias",frig_vacuo:"30 dias",cong_normal:"3 meses",cong_vacuo:"4 meses"},
    {prod:"Margarina",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-3 meses",frig_vacuo:"3-6 meses",cong_normal:"6-9 meses",cong_vacuo:"1 ano"},
    {prod:"Queijo duro",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 semanas",frig_vacuo:"4-6 meses",cong_normal:"6 meses",cong_vacuo:"2-3 anos"},
    {prod:"Queijo fresco/mole",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"5-7 dias",frig_vacuo:"13-15 dias",cong_normal:"25 dias",cong_vacuo:"4 meses"},
    {prod:"Queijo fundido",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"2 semanas",frig_vacuo:"6 semanas",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Iogurte",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"7-14 dias",frig_vacuo:"21-42 dias",cong_normal:"1-2 meses",cong_vacuo:"3 meses"},
    {prod:"Natas UHT",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1 mês",frig_vacuo:"2-3 meses",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Leite evaporado — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"4-5 dias",frig_vacuo:"14 dias",cong_normal:"-",cong_vacuo:"-"},
  ],
  "Ovos":[
    {prod:"Ovos frescos com casca",estado:"cru",amb_normal:"1-2 semanas",amb_vacuo:"-",frig_normal:"3-5 semanas",frig_vacuo:"-",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Ovo cozido com casca",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"4 dias",frig_vacuo:"20 dias",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Ovo cozido sem casca",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"2 dias",frig_vacuo:"10 dias",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Ovos pasteurizados — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3 dias",frig_vacuo:"9 dias",cong_normal:"1 ano",cong_vacuo:"1 ano"},
    {prod:"Maionese — após abertura",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"2 meses",frig_vacuo:"6 meses",cong_normal:"-",cong_vacuo:"-"},
  ],
  "Preparações e Sopas":[
    {prod:"Sopa/Caldo confeccionado",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"2-3 meses",cong_vacuo:"6 meses"},
    {prod:"Arroz seco (cru)",estado:"cru",amb_normal:"1 ano",amb_vacuo:"2-3 anos",frig_normal:"-",frig_vacuo:"-",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Arroz cozido",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"6-8 dias",cong_normal:"1-2 meses",cong_vacuo:"6 meses"},
    {prod:"Massa seca (crua)",estado:"cru",amb_normal:"1 ano",amb_vacuo:"2-3 anos",frig_normal:"-",frig_vacuo:"-",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Massa cozida",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"1-2 meses",cong_vacuo:"4-6 meses"},
    {prod:"Massa fresca (crua)",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"2-3 dias",frig_vacuo:"15-30 dias",cong_normal:"2-3 meses",cong_vacuo:"8 meses"},
    {prod:"Lasanha/Massa com molho",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"10-15 dias",cong_normal:"1-2 meses",cong_vacuo:"6 meses"},
    {prod:"Pizza confeccionada",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"10-20 dias",cong_normal:"1-2 meses",cong_vacuo:"6 meses"},
    {prod:"Risoto cozido",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"1-2 meses",cong_vacuo:"4-6 meses"},
    {prod:"Pratos de molho (estufados)",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-10 dias",cong_normal:"2-3 meses",cong_vacuo:"12 meses"},
  ],
  "Frutas e Legumes":[
    {prod:"Alface lavada e higienizada",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"8-10 dias",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Banana",estado:"cru",amb_normal:"3-5 dias",amb_vacuo:"10-15 dias",frig_normal:"2-3 dias",frig_vacuo:"15 dias",cong_normal:"7 dias",cong_vacuo:"3 meses"},
    {prod:"Maçã inteira",estado:"cru",amb_normal:"5-7 dias",amb_vacuo:"15-20 dias",frig_normal:"3-4 semanas",frig_vacuo:"2-3 semanas",cong_normal:"10 dias",cong_vacuo:"8-12 meses"},
    {prod:"Maçã cortada",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3 dias",frig_vacuo:"15 dias",cong_normal:"10 dias",cong_vacuo:"4 meses"},
    {prod:"Morango",estado:"cru",amb_normal:"1-2 dias",amb_vacuo:"5-7 dias",frig_normal:"3-7 dias",frig_vacuo:"5-7 dias",cong_normal:"15 dias",cong_vacuo:"10-12 meses"},
    {prod:"Uva",estado:"cru",amb_normal:"1-2 dias",amb_vacuo:"5 dias",frig_normal:"7 dias",frig_vacuo:"16 dias",cong_normal:"15 dias",cong_vacuo:"6 meses"},
    {prod:"Pêssego/Fruta de caroço",estado:"cru",amb_normal:"2-3 dias",amb_vacuo:"7-10 dias",frig_normal:"3-5 dias",frig_vacuo:"10-15 dias",cong_normal:"6-12 meses",cong_vacuo:"12-18 meses"},
    {prod:"Brócolos/Couve-flor (escaldados)",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"2-3 dias",frig_vacuo:"10-12 dias",cong_normal:"15 dias",cong_vacuo:"18-24 meses"},
    {prod:"Cenoura",estado:"cru",amb_normal:"3-5 dias",amb_vacuo:"10-15 dias",frig_normal:"3-5 dias",frig_vacuo:"10-15 dias",cong_normal:"7 dias",cong_vacuo:"18-24 meses"},
    {prod:"Ervilhas (escaldadas)",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-5 dias",frig_vacuo:"10-15 dias",cong_normal:"10 dias",cong_vacuo:"18-24 meses"},
    {prod:"Batata descascada crua",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"15 dias",cong_normal:"15 dias",cong_vacuo:"8 meses"},
    {prod:"Batata cozida",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"1 mês",cong_vacuo:"6 meses"},
    {prod:"Salada pronta",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 dias",frig_vacuo:"5-7 dias",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Feijão/Leguminosas cozidas",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"10-15 dias",cong_normal:"2-3 meses",cong_vacuo:"18-24 meses"},
  ],
  "Pão e Pastelaria":[
    {prod:"Pão fresco",estado:"cru",amb_normal:"2-3 dias",amb_vacuo:"7-8 dias",frig_normal:"7 dias",frig_vacuo:"30 dias",cong_normal:"6-12 meses",cong_vacuo:"2-3 anos"},
    {prod:"Bolos",estado:"confeccionado",amb_normal:"1-3 dias",amb_vacuo:"5-10 dias",frig_normal:"1 semana",frig_vacuo:"2-3 semanas",cong_normal:"1-2 meses",cong_vacuo:"4 meses"},
    {prod:"Bolachas/Biscoitos",estado:"cru",amb_normal:"4-6 meses",amb_vacuo:"12 meses",frig_normal:"2 meses",frig_vacuo:"6 meses",cong_normal:"4 meses",cong_vacuo:"1 ano"},
    {prod:"Quiche",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"1-2 meses",cong_vacuo:"4-6 meses"},
    {prod:"Creme de pasteleiro",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"2-3 dias",frig_vacuo:"10-15 dias",cong_normal:"-",cong_vacuo:"-"},
  ],
  "Condimentos e Conservas":[
    {prod:"Molho barbecue — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"4 meses",frig_vacuo:"12 meses",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Ketchup — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"6 meses",frig_vacuo:"18 meses",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Mostarda — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"12 meses",frig_vacuo:"24 meses",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Maionese — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"2 meses",frig_vacuo:"6 meses",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Azeitonas — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"2 semanas",frig_vacuo:"6 semanas",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Picles — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"1-2 semanas",frig_vacuo:"4-6 semanas",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Conservas de carne/peixe — após abertura",estado:"confeccionado",amb_normal:"-",amb_vacuo:"-",frig_normal:"3-4 dias",frig_vacuo:"8-12 dias",cong_normal:"2-3 meses",cong_vacuo:"6 meses"},
  ],
  "Bebidas e Sumos":[
    {prod:"Sumos — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"7-10 dias",frig_vacuo:"21-30 dias",cong_normal:"8-12 meses",cong_vacuo:"18 meses"},
    {prod:"Vinho — após abertura",estado:"cru",amb_normal:"2-3 dias",amb_vacuo:"20-25 dias",frig_normal:"3-5 dias",frig_vacuo:"20-25 dias",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Leite evaporado — após abertura",estado:"cru",amb_normal:"-",amb_vacuo:"-",frig_normal:"4-5 dias",frig_vacuo:"14 dias",cong_normal:"-",cong_vacuo:"-"},
  ],
  "Armazenagem Seca (Economato)":[
    {prod:"Café/Chá",estado:"cru",amb_normal:"2-3 meses",amb_vacuo:"12 meses",frig_normal:"-",frig_vacuo:"-",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Farinhas/Açúcar/Sal",estado:"cru",amb_normal:"6-12 meses",amb_vacuo:"2-3 anos",frig_normal:"-",frig_vacuo:"-",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Frutos secos",estado:"cru",amb_normal:"4-6 meses",amb_vacuo:"12 meses",frig_normal:"1 ano",frig_vacuo:"2 anos",cong_normal:"-",cong_vacuo:"-"},
    {prod:"Ervas aromáticas secas",estado:"cru",amb_normal:"6 meses",amb_vacuo:"1-2 anos",frig_normal:"-",frig_vacuo:"-",cong_normal:"-",cong_vacuo:"-"},
  ],
};
const VACUO_FRIG=Object.fromEntries(Object.values(TABELA_ALIMENTOS).flat().filter(p=>p.frig_vacuo&&p.frig_vacuo!=="-").map(p=>[p.prod,{normal:p.frig_normal,vacuo:p.frig_vacuo}]));
const VACUO_CONG=Object.fromEntries(Object.values(TABELA_ALIMENTOS).flat().filter(p=>p.cong_vacuo&&p.cong_vacuo!=="-").map(p=>[p.prod,{normal:p.cong_normal,vacuo:p.cong_vacuo}]));
const NAO_VACUO=[
  {prod:"Alho e cebola",motivo:"Libertam gases que podem criar condições para botulismo. Perigoso à temperatura ambiente em vácuo."},
  {prod:"Queijos moles (Brie, Ricotta, Camembert)",motivo:"Desenvolvem bactérias anaeróbias sem oxigénio. Guardar na embalagem original ou embalagem respirável."},
  {prod:"Cogumelos crus",motivo:"Continuam a libertar gases após colheita. O vácuo acelera a deterioração e altera a textura."},
  {prod:"Vegetais crucíferos crus (brócolos, couve, couve-flor)",motivo:"Produzem gases após colheita. Escaldar antes de selar a vácuo para parar as enzimas."},
  {prod:"Alimentos quentes ou mornos",motivo:"O vapor enfraquece a selagem e favorece o desenvolvimento de bactérias. Deixar arrefecer completamente primeiro."},
  {prod:"Alho cru à temperatura ambiente",motivo:"Risco de botulismo. Nunca selar alho cru a vácuo para armazenamento à temperatura ambiente."},
];

const CONSERVACAO=[
  {cat:"Ovos e Derivados",items:[
    {prod:"Ovos frescos com casca",temp:"≤4°C",dias:"3 a 5 semanas"},
    {prod:"Ovos pasteurizados — embalagem fechada",temp:"≤4°C",dias:"10 dias"},
    {prod:"Ovos pasteurizados — após abertura",temp:"≤4°C",dias:"3 dias"},
    {prod:"Ovos pasteurizados congelados",temp:"≤-18°C",dias:"1 ano"},
    {prod:"Maionese — após abertura",temp:"≤4°C",dias:"2 meses"},
  ]},
  {cat:"Carnes Frias e Enchidos",items:[
    {prod:"Salsichas — embalagem fechada",temp:"≤4°C",dias:"2 semanas"},
    {prod:"Salsichas — após abertura",temp:"≤4°C",dias:"1 semana"},
    {prod:"Salsichas congeladas",temp:"≤-18°C",dias:"1 a 2 meses"},
    {prod:"Bacon",temp:"≤4°C",dias:"7 dias"},
    {prod:"Bacon congelado",temp:"≤-18°C",dias:"1 mês"},
    {prod:"Fiambre fatiado",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Fiambre fatiado congelado",temp:"≤-18°C",dias:"1 a 2 meses"},
    {prod:"Hambúrguer fresco",temp:"≤4°C",dias:"1 a 2 dias"},
    {prod:"Hambúrguer congelado",temp:"≤-18°C",dias:"3 a 4 meses"},
  ]},
  {cat:"Aves",items:[
    {prod:"Frango/Peru inteiro",temp:"≤4°C",dias:"1 a 2 dias"},
    {prod:"Frango/Peru inteiro congelado",temp:"≤-18°C",dias:"1 ano"},
    {prod:"Frango/Peru peças",temp:"≤4°C",dias:"1 a 2 dias"},
    {prod:"Frango/Peru peças congelado",temp:"≤-18°C",dias:"9 meses"},
    {prod:"Frango frito",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Frango frito congelado",temp:"≤-18°C",dias:"4 meses"},
    {prod:"Frango cozinhado",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Frango cozinhado congelado",temp:"≤-18°C",dias:"4 a 6 meses"},
  ]},
  {cat:"Peixe e Marisco",items:[
    {prod:"Peixe fresco",temp:"≤4°C",dias:"1 a 2 dias"},
    {prod:"Peixe congelado",temp:"≤-18°C",dias:"6 meses"},
    {prod:"Peixe cozinhado",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Peixe cozinhado congelado",temp:"≤-18°C",dias:"4 a 6 meses"},
    {prod:"Peixe fumado (vácuo)",temp:"≤4°C",dias:"14 dias"},
    {prod:"Peixe fumado congelado",temp:"≤-18°C",dias:"2 meses"},
    {prod:"Marisco fresco",temp:"≤4°C",dias:"1 a 2 dias"},
    {prod:"Marisco congelado",temp:"≤-18°C",dias:"3 a 6 meses"},
    {prod:"Marisco cozinhado",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Marisco cozinhado congelado",temp:"≤-18°C",dias:"3 meses"},
  ]},
  {cat:"Laticínios",items:[
    {prod:"Leite",temp:"≤4°C",dias:"7 dias"},
    {prod:"Leite congelado",temp:"≤-18°C",dias:"3 meses"},
    {prod:"Manteiga",temp:"≤4°C",dias:"7 a 14 dias"},
    {prod:"Manteiga congelada",temp:"≤-18°C",dias:"3 meses"},
    {prod:"Margarina",temp:"≤4°C",dias:"1 a 3 meses"},
    {prod:"Margarina congelada",temp:"≤-18°C",dias:"6 a 9 meses"},
    {prod:"Queijo — embalagem fechada",temp:"≤4°C",dias:"6 meses"},
    {prod:"Queijo — após abertura",temp:"≤4°C",dias:"3 a 4 semanas"},
    {prod:"Queijo congelado",temp:"≤-18°C",dias:"6 meses"},
    {prod:"Queijo fundido",temp:"≤4°C",dias:"2 semanas"},
    {prod:"Natas UHT",temp:"≤4°C",dias:"1 mês"},
    {prod:"Iogurte",temp:"≤4°C",dias:"7 a 14 dias"},
    {prod:"Iogurte congelado",temp:"≤-18°C",dias:"1 a 2 meses"},
    {prod:"Pudim — após abertura",temp:"≤4°C",dias:"2 dias"},
  ]},
  {cat:"Preparações e Refeições",items:[
    {prod:"Sopas",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Sopas congeladas",temp:"≤-18°C",dias:"2 a 3 meses"},
    {prod:"Carne cozinhada",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Carne cozinhada congelada",temp:"≤-18°C",dias:"2 a 3 meses"},
    {prod:"Pizza",temp:"≤4°C",dias:"3 a 4 dias"},
    {prod:"Pizza congelada",temp:"≤-18°C",dias:"1 a 2 meses"},
  ]},
  {cat:"Bebidas e Sumos",items:[
    {prod:"Sumos — embalagem fechada",temp:"≤4°C",dias:"3 semanas"},
    {prod:"Sumos — após abertura",temp:"≤4°C",dias:"7 a 10 dias"},
    {prod:"Sumos congelados",temp:"≤-18°C",dias:"8 a 12 meses"},
  ]},
];

function ConsTabela(){
  const [open,setOpen]=useState(false);
  return(
    <div style={{marginBottom:11}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"9px 13px",borderRadius:9,border:"1.5px solid #1a6b4a",background:open?"#1a6b4a":LC,color:open?W:"#1a6b4a",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
        {open?"Fechar":"Consultar tempos de conservação por produto"}
      </button>
      {open&&(
        <div style={{background:W,borderRadius:9,border:"1.5px solid #1a6b4a",padding:14,marginTop:4}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1a6b4a",marginBottom:10}}>Tempos de Conservação — Referência HACCP</div>
          {CONSERVACAO.map(cat=>(
            <div key={cat.cat} style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"#7c5c3a",marginBottom:5,textTransform:"uppercase"}}>{cat.cat}</div>
              {cat.items.map(item=>(
                <div key={item.prod} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0ede6",fontSize:11}}>
                  <span style={{color:"#333",flex:2}}>{item.prod}</span>
                  <span style={{color:"#1a6b4a",fontWeight:600,flex:1,textAlign:"center"}}>{item.temp}</span>
                  <span style={{color:"#2c5f8a",fontWeight:600,flex:1,textAlign:"right"}}>{item.dias}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{fontSize:10,color:"#888",marginTop:8}}>Fonte: Regulamento CE 852/2004 — valores indicativos. Respeitar sempre as indicações do fabricante.</div>
          <div style={{marginTop:12}}><button onClick={()=>window.print()} style={{padding:"10px 20px",background:"#1a3d2b",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Imprimir / Guardar PDF</button></div>
        </div>
      )}
    </div>
  );
}

function Producao({user,db,setDb,showToast}){
  const [show,setShow]=useState(false);
  const today=new Date().toISOString().split("T")[0];
  const [form,setForm]=useState({nome:"",dataProducao:today,dataLimite:"",conservacao:"refrigerado",local:"Frig. Vert. 1",professor:"P01"});
  const lista=(db.producao||[]).filter(p=>p.turma===user.turma).slice(-6).reverse();
  const nL=String((db.producao||[]).length+1).padStart(3,"0");
  const save=()=>{if(!form.nome||!form.dataLimite)return;const prod={...form,lote:nL,aluno:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()};setDb(p=>({...p,producao:[...(p.producao||[]),prod]}));setShow(false);enviar("Produção",[gD(),user.turma,user.id,form.nome,nL,form.conservacao,form.dataProducao,form.dataLimite,form.local,form.professor]);showToast("Produto registado! Lote: "+nL);};
  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Prod. Confeccionados e Conservação</div>
      <B lb="+ Registar Produto" onClick={()=>setShow(!show)}/>
      {show&&<Cd st={{marginTop:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontWeight:600,color:CA}}>Novo Produto</span><span style={{background:CA,color:W,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600}}>Lote {nL}</span></div>
        <Ip lb="Nome" val={form.nome} onChange={v=>setForm(p=>({...p,nome:v}))}/>
        <Ip lb="Data Produção" type="date" val={form.dataProducao} onChange={v=>setForm(p=>({...p,dataProducao:v}))}/>
        <Ip lb="Data Limite de Consumo" type="date" val={form.dataLimite} onChange={v=>setForm(p=>({...p,dataLimite:v}))}/>
        <ConsTabela/>
        <Sl lb="Conservação" val={form.conservacao} onChange={v=>setForm(p=>({...p,conservacao:v}))} opts={["refrigerado","congelado","consumo imediato"]}/>
        <div style={{background:"#fef3c7",borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:"#92400e",lineHeight:1.6}}>
          <strong>Regra HACCP — Sobras:</strong> Acondicionar em recipiente tapado, rotulado e consumir em max. 72h. Data limite calculada automaticamente.
        </div>
        <Sl lb="Local" val={form.local} onChange={v=>setForm(p=>({...p,local:v}))} opts={FRIOS}/>
        <Sl lb="Professor" val={form.professor} onChange={v=>setForm(p=>({...p,professor:v}))} opts={["P01","P02","P03"]}/>
        {form.nome&&form.dataLimite&&<div style={{background:LC,borderRadius:8,padding:10,marginBottom:10,fontSize:11,lineHeight:1.6}}>Produto: {form.nome} | Produzido em: {fD(form.dataProducao)} | Consumir até: {fD(form.dataLimite)} | {user.id} | Lote {nL}</div>}
        <B lb="Guardar" onClick={save}/>
      </Cd>}
      {lista.map(p=><div key={p.id} style={{padding:"8px 0",borderBottom:"1px solid "+LC,display:"flex",justifyContent:"space-between"}}><div><div style={{fontWeight:600,fontSize:13}}>{p.nome}</div><div style={{fontSize:11,color:GR}}>{p.date} - ate {fD(p.dataLimite)}</div></div><span style={{background:CA,color:W,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>L{p.lote}</span></div>)}
    </div>
  );
}

function Testemunho({user,db,setDb,showToast}){
  const [form,setForm]=useState({prato:"",dataRefeicao:new Date().toISOString().split("T")[0],horaRefeicao:gT(),tipoRefeicao:"almoço",pesoAmostra:"150",localArmazenamento:"Frig. Vert. 1"});
  const lista=(db.testemunho||[]).filter(t=>t.turma===user.turma).slice(-5).reverse();
  const cD=d=>{if(!d)return"";const x=new Date(d);x.setDate(x.getDate()+3);return x.toISOString().split("T")[0];};
  const save=()=>{if(!form.prato)return;const dest=cD(form.dataRefeicao);const nomeT=(db.assinaturas&&db.assinaturas[user.id])||"";setDb(p=>({...p,testemunho:[...(p.testemunho||[]),{...form,dataDestruicao:dest,responsavel:user.id,nomeAluno:nomeT,turma:user.turma,date:gD(),time:gT(),id:Date.now()}]}));enviar("Amostra Testemunho",[gD(),gT(),user.turma,user.id,nomeT,form.prato,form.tipoRefeicao,form.horaRefeicao,form.pesoAmostra,form.localArmazenamento,fD(dest)]);showToast("Amostra registada! Destruir em "+fD(dest));};
  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Amostra de Testemunho</div><InfoBtn modId="testemunho"/></div>
      <div style={{fontSize:12,color:GR,marginBottom:14}}>Guardar 150g de cada refeição durante 72h a 0-3°C</div>
      <Cd>
        <Ip lb="Nome do Prato" val={form.prato} onChange={v=>setForm(p=>({...p,prato:v}))} ph="Ex: Frango assado"/>
        <div style={{display:"flex",gap:9}}><div style={{flex:1}}><Ip lb="Data" type="date" val={form.dataRefeicao} onChange={v=>setForm(p=>({...p,dataRefeicao:v}))}/></div><div style={{flex:1}}><Ip lb="Hora" type="time" val={form.horaRefeicao} onChange={v=>setForm(p=>({...p,horaRefeicao:v}))}/></div></div>
        <Sl lb="Tipo" val={form.tipoRefeicao} onChange={v=>setForm(p=>({...p,tipoRefeicao:v}))} opts={["almoço","jantar","lanche","pequeno-almoço"]}/>
        <Ip lb="Peso (g)" type="number" val={form.pesoAmostra} onChange={v=>setForm(p=>({...p,pesoAmostra:v}))}/>
        <Sl lb="Local" val={form.localArmazenamento} onChange={v=>setForm(p=>({...p,localArmazenamento:v}))} opts={FRIOS}/>
        {form.dataRefeicao&&<div style={{background:"#f0e8f8",borderRadius:8,padding:10,marginBottom:10,fontSize:12,color:"#6d3b8e"}}>Destruir em: {fD(cD(form.dataRefeicao))}</div>}
        <B lb="Guardar Amostra" onClick={save} cor="#6d3b8e"/>
      </Cd>
    
    </div>
  );
}

function Desinfecao({user,db,setDb,showToast}){
  const [form,setForm]=useState({alimento:"",quantidade:"",produto:"",concentracao:"",tempoContacto:"5",temperatura:""});
  const lista=(db.desinfecao||[]).filter(d=>d.turma===user.turma).slice(-5).reverse();
  const save=()=>{if(!form.alimento||!form.produto)return;const nomeD=(db.assinaturas&&db.assinaturas[user.id])||"";setDb(p=>({...p,desinfecao:[...(p.desinfecao||[]),{...form,responsavel:user.id,nomeAluno:nomeD,turma:user.turma,date:gD(),time:gT(),id:Date.now()}]}));enviar("Desinfeção",[gD(),gT(),user.turma,user.id,nomeD,form.alimento,form.quantidade,form.produto,form.concentracao,form.tempoContacto,form.temperatura]);showToast("Desinfeção registada!");};
  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Desinfeção de Alimentos para Consumo em Cru</div><InfoBtn modId="desinfecao"/></div>
      <div style={{fontSize:12,color:GR,marginBottom:14}}>Vegetais e frutas servidos em cru</div>
      <Cd>
        <Ip lb="Alimento" val={form.alimento} onChange={v=>setForm(p=>({...p,alimento:v}))} ph="Ex: Alface, tomate"/>
        <Ip lb="Quantidade" val={form.quantidade} onChange={v=>setForm(p=>({...p,quantidade:v}))} ph="Ex: 2 kg"/>
        <Ip lb="Produto Desinfetante" val={form.produto} onChange={v=>setForm(p=>({...p,produto:v}))} ph="Ex: Hidrocloro"/>
        <div style={{display:"flex",gap:9}}><div style={{flex:1}}><Ip lb="Conc. (ml/L)" val={form.concentracao} onChange={v=>setForm(p=>({...p,concentracao:v}))}/></div><div style={{flex:1}}><Ip lb="Tempo (min)" type="number" val={form.tempoContacto} onChange={v=>setForm(p=>({...p,tempoContacto:v}))}/></div></div>
        <Ip lb="Temp. água (°C)" type="number" val={form.temperatura} onChange={v=>setForm(p=>({...p,temperatura:v}))}/>
        <div style={{background:"#e8f5f0",borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:"#1a6b4a"}}>1. Lavar em agua corrente  2. Imergir no desinfetante pelo tempo indicado  3. Passar em agua corrente</div>
        <B lb="Guardar" onClick={save} cor="#1a6b4a"/>
      </Cd>
    
    </div>
  );
}

function Manutencao({user,db,setDb,showToast}){
  const [form,setForm]=useState({equipamento:"",tipoOcorrencia:"avaria",descricao:"",acaoImediata:"",estado:"reportado"});
  const lista=(db.manutencao||[]).filter(m=>m.turma===user.turma).slice(-6).reverse();
  const corE={reportado:"#2c5f8a","em reparação":"#d35400",resolvido:V,"aguarda técnico":R};
  const save=()=>{if(!form.equipamento||!form.descricao)return;const nomeM=(db.assinaturas&&db.assinaturas[user.id])||"";setDb(p=>({...p,manutencao:[...(p.manutencao||[]),{...form,responsavel:user.id,nomeAluno:nomeM,turma:user.turma,date:gD(),time:gT(),id:Date.now()}]}));enviar("Manutenção, Avarias e Prevenção",[gD(),gT(),user.turma,user.id,nomeM,form.equipamento,form.tipoOcorrencia,form.descricao,form.acaoImediata,form.estado]);showToast("Ocorrencia registada!");};

  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Manutenção Equipamentos</div><InfoBtn modId="manutencao"/></div>
      <div style={{fontSize:12,color:GR,marginBottom:14}}>Avarias e anomalias detetadas</div>
      <Cd>
        <Sl lb="Equipamento" val={form.equipamento} onChange={v=>setForm(p=>({...p,equipamento:v}))} opts={TODOS_EQ}/>
        <Sl lb="Tipo" val={form.tipoOcorrencia} onChange={v=>setForm(p=>({...p,tipoOcorrencia:v}))} opts={["avaria","anomalia","manutenção preventiva","calibração"]}/>
        <Ta lb="Descricao" val={form.descricao} onChange={v=>setForm(p=>({...p,descricao:v}))} ph="O que foi observado..."/>
        <Ta lb="Acao Imediata" val={form.acaoImediata} onChange={v=>setForm(p=>({...p,acaoImediata:v}))} ph="Ação corretiva tomada..."/>
        <Sl lb="Estado" val={form.estado} onChange={v=>setForm(p=>({...p,estado:v}))} opts={["reportado","em reparação","aguarda técnico","resolvido"]}/>
        <B lb="Guardar" onClick={save} cor="#2c5f8a"/>
      </Cd>
    
    </div>
  );
}

function Higienizacao({user,db,setDb,showToast}){
  const h=gD(),k="hig-"+user.turma+"-"+h;
  const regs=(db.higienizacao&&db.higienizacao[k]&&db.higienizacao[k].registos)?db.higienizacao[k].registos:{};
  const panos=(db.higienizacao&&db.higienizacao[k]&&db.higienizacao[k].panos)?db.higienizacao[k].panos:{};
  const [zona,setZona]=useState(Object.keys(ZONAS)[0]);
  const tI=Object.values(ZONAS).flat().length,tF=regs?Object.keys(regs).length:0;
  const nomeAluno=db.assinaturas&&db.assinaturas[user.id];

  const mk=item=>{
    if(regs[item]){
      if(regs[item].aluno!==user.id&&regs[item].aluno!==nomeAluno){showToast("Marcado por "+regs[item].aluno);return;}
      if(!window.confirm("Desmarcar?"))return;
      const n={...regs};delete n[item];
      setDb(p=>{const hg={...p.higienizacao};hg[k]={...hg[k],registos:n,turma:user.turma,date:h};return{...p,higienizacao:hg};});
      showToast("Desmarcado");return;
    }
    const n={...regs,[item]:{aluno:nomeAluno||user.id,time:gT(),turma:user.turma}};
    setDb(p=>{const hg={...p.higienizacao};hg[k]={...hg[k],registos:n,turma:user.turma,date:h};return{...p,higienizacao:hg};});
    enviar("Higienização",[h,gT(),user.turma,user.id,nomeAluno||user.id,item]);
    showToast("Verificado!");
  };

  const marcarPanos=(momento)=>{
    if(panos[momento]){showToast("Já registado às "+panos[momento].time);return;}
    const np={...panos,[momento]:{aluno:nomeAluno||user.id,time:gT(),turma:user.turma}};
    setDb(p=>{const hg={...(p.higienizacao||{})};const existing=hg[k]||{registos:{},turma:user.turma,date:h};hg[k]={...existing,panos:np,turma:user.turma,date:h};return{...p,higienizacao:hg};});
    enviar("Panos Solução",[h,gT(),user.turma,user.id,nomeAluno||user.id,momento]);
    showToast("Panos e esponjas — "+momento+" registado!");
  };

  const pct=Math.round(tF/Math.max(tI,1)*100);
  const panosInicio=panos["inicio"];
  const panosFinal=panos["final"];

  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Higienização</div><InfoBtn modId="higienizacao"/></div>

      {/* BANNER PANOS */}
      <div style={{background:"#7c3aed",borderRadius:14,padding:16,marginBottom:16,color:"#fff",boxShadow:"0 4px 16px rgba(124,58,237,.4)"}}>
        <div style={{fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>🧽</span>
          SOLUÇÃO DESINFETANTE — PANOS E ESPONJAS
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>marcarPanos("inicio")} style={{flex:1,padding:"14px 8px",borderRadius:11,border:"2px solid "+(panosInicio?"#4ade80":"rgba(255,255,255,.4)"),background:panosInicio?"#16a34a":"rgba(255,255,255,.15)",color:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Início da Aula</div>
            {panosInicio?(
              <div>
                <div style={{fontSize:18,fontWeight:800}}>✓ Feito</div>
                <div style={{fontSize:10,opacity:.8,marginTop:2}}>{panosInicio.time} — {panosInicio.aluno}</div>
              </div>
            ):(
              <div>
                <div style={{fontSize:16,fontWeight:700,opacity:.7}}>Por fazer</div>
                <div style={{fontSize:10,opacity:.6,marginTop:2}}>Toca para registar</div>
              </div>
            )}
          </button>
          <button onClick={()=>marcarPanos("final")} style={{flex:1,padding:"14px 8px",borderRadius:11,border:"2px solid "+(panosFinal?"#4ade80":"rgba(255,255,255,.4)"),background:panosFinal?"#16a34a":"rgba(255,255,255,.15)",color:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Final da Aula</div>
            {panosFinal?(
              <div>
                <div style={{fontSize:18,fontWeight:800}}>✓ Feito</div>
                <div style={{fontSize:10,opacity:.8,marginTop:2}}>{panosFinal.time} — {panosFinal.aluno}</div>
              </div>
            ):(
              <div>
                <div style={{fontSize:16,fontWeight:700,opacity:.7}}>Por fazer</div>
                <div style={{fontSize:10,opacity:.6,marginTop:2}}>Toca para registar</div>
              </div>
            )}
          </button>
        </div>
        <div style={{fontSize:10,opacity:.7,marginTop:10,textAlign:"center"}}>Solução desinfetante deve ser renovada no início e no final de cada aula</div>
      </div>

      <Cd>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:13,fontWeight:600,color:V}}>Progresso total</span>
          <span style={{fontSize:22,fontWeight:800,color:tF===tI?V:CA}}>{pct}%</span>
        </div>
        <Pg val={tF} max={tI}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
          {Object.keys(ZONAS).map(z=>{
            const f=ZONAS[z].filter(i=>regs[i]).length,ok=f===ZONAS[z].length,total=ZONAS[z].length;
            return(
              <button key={z} onClick={()=>setZona(z)} style={{padding:"8px 12px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",border:"2px solid "+(zona===z?V:ok?"#0891b2":BE),background:zona===z?V:ok?"#e0f2fe":LC,color:zona===z?W:ok?"#0e7490":GR,fontFamily:"inherit",flex:1,minWidth:80}}>
                <div>{z}</div>
                <div style={{fontSize:10,marginTop:2,opacity:.8}}>{f}/{total}</div>
              </button>
            );
          })}
        </div>
      </Cd>

      <div style={{fontWeight:700,fontSize:15,color:V,marginBottom:10,paddingLeft:2}}>{zona} <span style={{fontSize:12,color:GR,fontWeight:400}}>— {ZONAS[zona].filter(i=>regs[i]).length}/{ZONAS[zona].length} verificados</span></div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {ZONAS[zona].map(item=>{
          const reg=regs[item];
          const meu=reg&&(reg.aluno===user.id||reg.aluno===nomeAluno);
          return(
            <div key={item} onClick={()=>mk(item)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:13,background:reg?V:W,border:"2px solid "+(reg?V:"#e2e8f0"),cursor:"pointer",boxShadow:"0 2px 8px rgba(14,116,144,"+(reg?.15:.05)+")"}}>
              <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:reg?"rgba(255,255,255,.25)":"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:16,fontWeight:700,color:reg?W:"#bae6fd"}}>{reg?"✓":"○"}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:reg?W:"#0c4a6e"}}>{item}</div>
                {reg&&<div style={{fontSize:10,color:"rgba(255,255,255,.75)",marginTop:2}}>{reg.aluno} — {reg.time}</div>}
              </div>
              {reg&&!meu&&<span style={{fontSize:9,color:"rgba(255,255,255,.7)",background:"rgba(255,255,255,.15)",borderRadius:4,padding:"2px 6px"}}>{reg.aluno}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NaoConf({user,db,setDb,showToast}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({zona:"",descricao:"",acaoCorretiva:"",estado:"aberta"});
  const lista=(db.ncs||[]).filter(n=>n.turma===user.turma);
  const save=()=>{if(!form.zona||!form.descricao)return;const nomeN=(db.assinaturas&&db.assinaturas[user.id])||"";const nc={...form,responsavel:user.id,nomeAluno:nomeN,turma:user.turma,date:gD(),time:gT(),id:Date.now(),professor:""};setDb(p=>({...p,ncs:[...(p.ncs||[]),nc]}));setShow(false);setForm({zona:"",descricao:"",acaoCorretiva:"",estado:"aberta"});enviar("NãoConformidades",[gD(),gT(),user.turma,user.id,nomeN,form.zona,form.descricao,form.acaoCorretiva,form.estado]);showToast("NC registada!");};
  const corE={aberta:R,"em resolução":"#d35400",resolvida:"#f39c12",validada:V};
  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Não Conformidades</div><InfoBtn modId="naoConf"/></div>
      <B lb="+ Nova Não Conformidade" onClick={()=>setShow(!show)} cor={R}/>
      {show&&<Cd st={{marginTop:10}}><Ip lb="Zona / Equipamento" val={form.zona} onChange={v=>setForm(p=>({...p,zona:v}))} ph="Ex: Frigorifico 1"/><Ta lb="Descricao" val={form.descricao} onChange={v=>setForm(p=>({...p,descricao:v}))} ph="Descreva o problema..."/><Ta lb="Ação Corretiva" val={form.acaoCorretiva} onChange={v=>setForm(p=>({...p,acaoCorretiva:v}))} ph="Ação corretiva tomada..."/><Sl lb="Estado" val={form.estado} onChange={v=>setForm(p=>({...p,estado:v}))} opts={["aberta","em resolução","resolvida"]}/><B lb="Registar" onClick={save} cor={R}/></Cd>}
      {lista.slice(-5).reverse().map(nc=><Cd key={nc.id} st={{marginTop:10,borderLeft:"3px solid "+(corE[nc.estado]||R)}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:13}}>{nc.zona}</span><span style={{background:corE[nc.estado]||R,color:W,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>{nc.estado}</span></div><div style={{fontSize:12,color:GR}}>{nc.descricao}</div><div style={{fontSize:10,color:GR}}>{nc.date} - {nc.responsavel}</div></Cd>)}
    </div>
  );
}

function Encerramento({user,db,setDb,showToast}){
  const h=gD(),k="enc-"+user.turma+"-"+h,sv=db.encerramento&&db.encerramento[k];
  const [obs,setObs]=useState(sv?sv.obs:"");
  const [checks,setChecks]=useState(sv?sv.checks:{});
  const done=!!sv;

  const higK="hig-"+user.turma+"-"+h;
  const panosFinalEnc=!!(db.higienizacao&&db.higienizacao[higK]&&db.higienizacao[higK].panos&&db.higienizacao[higK].panos["final"]);
  const ITEMS_OBG=[
    {id:"ti",l:"Temperaturas de início registadas",auto:!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-inicio"])},
    {id:"tf",l:"Temperaturas de final registadas",auto:!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-final"])},
    {id:"panos",l:"Panos e esponjas em solução desinfetante — Final da aula",auto:panosFinalEnc},
    {id:"hig",l:"Higienização concluída",auto:!!(db.higienizacao&&db.higienizacao["hig-"+user.turma+"-"+h]&&db.higienizacao["hig-"+user.turma+"-"+h].registos)},
    {id:"val",l:"Validação do professor",auto:!!(db.validacoes&&db.validacoes["val-"+user.turma+"-"+h])},
  ];

  const ITEMS_MANUAL=[
    {id:"b1",l:"Bancada 1 limpa e higienizada"},
    {id:"b2",l:"Bancada 2 limpa e higienizada"},
    {id:"b3",l:"Bancada 3 limpa e higienizada"},
    {id:"b4",l:"Bancada 4 limpa e higienizada"},
    {id:"b5",l:"Bancada 5 limpa e higienizada"},
    {id:"r1",l:"Ralos das cubas limpos"},
    {id:"bl",l:"Bancadas laterais limpas e higienizadas"},
    {id:"ab1",l:"Abatedor 1 desligado e higienizado"},
    {id:"ab2",l:"Abatedor 2 desligado e higienizado"},
    {id:"mv1",l:"Máq. vácuo 1 limpa e desligada"},
    {id:"mv2",l:"Máq. vácuo 2 limpa e desligada"},
    {id:"am1",l:"Amassadeira 1 desligada e protegida"},
    {id:"am2",l:"Amassadeira 2 desligada e protegida"},
    {id:"bat",l:"Batedeira desligada e protegida"},
    {id:"pic",l:"Picadora limpa e protegida"},
    {id:"proc",l:"Processadores limpos e protegidos"},
    {id:"fog",l:"Fogões todos desligados"},
    {id:"arc",l:"Ar condicionado desligado"},
    {id:"fri",l:"Frigoríficos verificados"},
    {id:"equip_limp",l:"Equipamentos de preparacao limpos e higienizados"},
    {id:"proc_limp",l:"Processadores limpos e protegidos"},
    {id:"loi",l:"Loiça lavada e arrumada"},
    {id:"ml1",l:"Máq. lavagem 1 drenada e porta aberta"},
    {id:"ml2",l:"Máq. lavagem 2 drenada e porta aberta"},
    {id:"cop",l:"Copa sem utensílios por lavar"},
    {id:"eco",l:"Economato mat.-primas organizado"},
    {id:"ecu",l:"Economato material organizado"},
    {id:"lix",l:"Lixos despejados e separados corretamente"},
    {id:"cx",l:"Caixotes lavados e com saco novo"},
    {id:"car",l:"Carrinhos limpos e higienizados"},
  ];

  const allAuto=ITEMS_OBG.every(i=>i.auto);
  const allManual=ITEMS_MANUAL.every(i=>checks[i.id]);
  const todosOk=allAuto&&allManual;
  const totalFeito=ITEMS_OBG.filter(i=>i.auto).length+ITEMS_MANUAL.filter(i=>checks[i.id]).length;
  const total=ITEMS_OBG.length+ITEMS_MANUAL.length;

  const toggle=id=>{if(!done)setChecks(p=>({...p,[id]:!p[id]}));};

  const save=()=>{
    if(!todosOk){showToast("Faltam itens obrigatórios!");return;}
    const nomeEnc=(db.assinaturas&&db.assinaturas[user.id])||"";
    setDb(p=>{const e={...p.encerramento};e[k]={obs,checks,aluno:user.id,nomeAluno:nomeEnc,turma:user.turma,date:h,time:gT()};return{...p,encerramento:e};});
    enviar("Encerramento",[h,gT(),user.turma,user.id,nomeEnc,"Concluído"]);
    showToast("Encerramento de aula prática registado!");
  };

  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Encerramento da Aula</div><InfoBtn modId="encerramento"/></div>
      <div style={{fontSize:12,color:GR,marginBottom:14}}>Todos os pontos têm de estar verificados para encerrar.</div>
      <Cd>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,color:GR}}>Progresso</span>
          <span style={{background:todosOk?V:CA,color:W,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600}}>{totalFeito}/{total}</span>
        </div>
        <Pg val={totalFeito} max={total}/>
        <div style={{fontSize:11,fontWeight:600,color:"#7c5c3a",marginBottom:8,textTransform:"uppercase"}}>Registos automáticos</div>
        {ITEMS_OBG.map(item=>(
          <div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid "+LC,alignItems:"center"}}>
            <span style={{fontSize:13,color:item.auto?V:GR}}>{item.l}</span>
            <span style={{fontWeight:700,fontSize:13,color:item.auto?V:R}}>{item.auto?"OK":"Em falta"}</span>
          </div>
        ))}
        <div style={{fontSize:11,fontWeight:600,color:"#7c5c3a",margin:"12px 0 8px",textTransform:"uppercase"}}>Verificação manual</div>
        {ITEMS_MANUAL.map(item=>(
          <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:"1px solid "+LC,cursor:done?"default":"pointer"}}>
            <div style={{width:24,height:24,borderRadius:6,border:"2px solid "+(checks[item.id]?V:BE),background:checks[item.id]?V:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {checks[item.id]&&<span style={{color:W,fontSize:12,fontWeight:700}}>v</span>}
            </div>
            <span style={{fontSize:13,color:checks[item.id]?V:GR}}>{item.l}</span>
          </div>
        ))}
      </Cd>
      {!done?(
        <Cd>
          <Ta lb="Observações finais" val={obs} onChange={setObs} ph="Notas para o professor..."/>
          <B lb={todosOk?"Encerrar Aula Prática":"Faltam "+(total-totalFeito)+" itens"} onClick={save} cor={todosOk?V:"#ccc"} dis={!todosOk}/>
          {!todosOk&&<div style={{marginTop:8,fontSize:12,color:R,textAlign:"center"}}>Complete todos os pontos antes de encerrar.</div>}
        </Cd>
      ):(
        <div style={{textAlign:"center",padding:14,color:V,fontWeight:600,background:W,borderRadius:11}}>Aula prática encerrada — Aguarda validação do professor</div>
      )}
    </div>
  );
}

function Professor({user,db,setDb,showToast}){
  const [turma,setT]=useState("T1");
  const [obs,setObs]=useState("");
  const h=gD(),vK="profv-"+user.id+"-"+turma+"-"+h;
  const ver=(db.profVerif&&db.profVerif[vK])||{};
  const vK2="val-"+turma+"-"+h,jaV=!!(db.validacoes&&db.validacoes[vK2]);
  const tot=PC.filter(c=>ver[c.id]).length,ok=tot===PC.length;
  const mk=(id,cf)=>{setDb(p=>{const pv={...p.profVerif};pv[vK]={...ver,[id]:{professor:user.id,time:gT(),conf:cf}};return{...p,profVerif:pv};});};
  const uNC=(id,es)=>{setDb(p=>({...p,ncs:(p.ncs||[]).map(n=>n.id===id?{...n,estado:es,professor:user.id}:n)}));showToast("NC atualizada!");};
  const val=()=>{if(!ok){showToast("Verifica todos os pontos!");return;}setDb(p=>{const v={...p.validacoes};v[vK2]={professor:user.id,turma,date:h,time:gT(),obs};return{...p,validacoes:v};});enviar("Validações",[h,turma,user.id,obs,tot+"/"+PC.length]);showToast("Sessão validada!");setObs("");};
  const ncs=(db.ncs||[]).filter(n=>n.turma===turma&&n.date===h&&(n.estado==="aberta"||n.estado==="em resolução"));
  return(
    <div style={{padding:15}}>
      <div style={{background:"linear-gradient(135deg,"+V+","+V2+")",borderRadius:14,padding:18,marginBottom:14,color:W}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Painel do Professor - {user.id}</div>
        <div style={{fontSize:12,opacity:.75,marginTop:2}}>{h}</div>
      </div>
      
      <div>
        <div style={{display:"flex",gap:7,marginBottom:13}}>{["T1","T2","T3"].map(t=><button key={t} onClick={()=>setT(t)} style={{flex:1,padding:10,borderRadius:9,border:"2px solid "+(turma===t?V:BE),background:turma===t?V:W,color:turma===t?W:V,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>)}</div>
        <div style={{background:W,borderRadius:11,padding:"9px 13px",marginBottom:13}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:V}}>Verificados</span><span style={{fontSize:12,fontWeight:700,color:ok?V:CA}}>{tot}/{PC.length}</span></div><Pg val={tot} max={PC.length}/></div>
        <Cd>{PC.map(item=>{const v=ver[item.id];return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid "+LC}}><div style={{flex:1,fontSize:13,color:V}}>{item.lb}{v&&<span style={{fontSize:10,color:v.conf?V:"#d35400",marginLeft:6}}>{v.conf?"OK":"NC"} {v.time}</span>}</div><div style={{display:"flex",gap:4}}><button onClick={()=>mk(item.id,false)} style={{padding:"5px 9px",borderRadius:6,border:"1.5px solid "+(v&&!v.conf?"#d35400":BE),background:v&&!v.conf?"#fff3e0":"transparent",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:"#d35400"}}>NC</button><button onClick={()=>mk(item.id,true)} style={{padding:"5px 9px",borderRadius:6,border:"1.5px solid "+(v&&v.conf?V:BE),background:v&&v.conf?V:"transparent",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:v&&v.conf?W:V}}>OK</button></div></div>);})}</Cd>
        {ncs.length>0&&<Cd st={{borderLeft:"4px solid "+R}}><div style={{fontWeight:700,color:R,marginBottom:8}}>NCs Pendentes</div>{ncs.map(nc=><div key={nc.id} style={{marginBottom:8,paddingBottom:8,borderBottom:"1px solid "+LC}}><div style={{fontWeight:600,fontSize:12}}>{nc.zona}</div><div style={{fontSize:11,color:GR}}>{nc.descricao}</div><div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{["em resolução","resolvida","validada"].map(e=><button key={e} onClick={()=>uNC(nc.id,e)} style={{padding:"3px 8px",borderRadius:5,fontSize:10,fontWeight:600,cursor:"pointer",border:"none",background:nc.estado===e?V:LC,color:nc.estado===e?W:GR,fontFamily:"inherit"}}>{e}</button>)}</div></div>)}</Cd>}
        <Cd st={{border:"2px solid "+(ok?V:BE)}}><div style={{fontWeight:700,fontSize:14,color:V,marginBottom:5}}>Assinar Sessão - {turma}</div>{!jaV?<><Ta lb="Observações" val={obs} onChange={setObs} ph="Notas..."/><B lb={ok?"Assinar e Validar "+turma:"Faltam "+(PC.length-tot)+" itens"} onClick={val} cor={ok?V:GR}/></>:<div style={{textAlign:"center",padding:11,color:V,fontWeight:600}}>Sessao {turma} validada - {h}</div>}</Cd>
    </div>
    </div>
  );
}
function AssinaturaDigital({onSave}){
  const [n,setN]=useState("");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:W,borderRadius:16,padding:24,width:"100%",maxWidth:360}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:V,marginBottom:8}}>Assinatura Digital</div>
        <div style={{fontSize:13,color:GR,marginBottom:14}}>Escreve o teu nome completo. Ficará associado a todos os teus registos.</div>
        <input value={n} onChange={e=>setN(e.target.value)} placeholder="Ex: Maria Silva" style={{width:"100%",padding:"12px 14px",borderRadius:9,border:"1.5px solid "+BE,fontSize:15,background:LC,outline:"none",color:V,fontFamily:"inherit",marginBottom:14}}/>
        {n&&<div style={{background:LC,borderRadius:9,padding:12,marginBottom:14,textAlign:"center",fontFamily:"Georgia,serif",fontSize:20,color:V,fontStyle:"italic"}}>{n}</div>}
        <button onClick={()=>{if(n.trim())onSave(n.trim());}} disabled={!n.trim()} style={{width:"100%",padding:13,borderRadius:11,background:n.trim()?V:"#ccc",color:W,border:"none",fontSize:15,fontWeight:600,cursor:n.trim()?"pointer":"not-allowed",fontFamily:"inherit"}}>Confirmar Assinatura</button>
      </div>
    </div>
  );
}

function Coordenadora({user,db}){
  const [turma,setTurma]=useState("T1");
  const [mes,setMes]=useState(()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");});
  const [folha,setFolha]=useState("temperaturas");

  const getDias=()=>{
    const [ano,m]=mes.split("-").map(Number);
    const total=new Date(ano,m,0).getDate();
    return Array.from({length:31},(_,i)=>{
      const d=new Date(ano,m-1,i+1);
      return i<total?d.toLocaleDateString("pt-PT"):null;
    });
  };

  const dias=getDias();

  const getTempDia=(dia,momento)=>{
    if(!dia)return null;
    const dISO=dia.split("/").reverse().join("-");
    const k="temp-"+turma+"-"+dia+"-"+momento;
    return db.temperaturas&&db.temperaturas[k]?db.temperaturas[k]:null;
  };

  return(
    <div style={{padding:15}}>
      <div style={{background:"linear-gradient(135deg,#7c5c3a,#a67c52)",borderRadius:14,padding:18,marginBottom:14,color:W}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Relatórios HACCP</div>
        <div style={{fontSize:12,opacity:.75,marginTop:2}}>Coordenadora - {new Date().toLocaleDateString("pt-PT")}</div>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:11}}>
        {["T1","T2","T3"].map(t=><button key={t} onClick={()=>setTurma(t)} style={{flex:1,padding:9,borderRadius:8,border:"2px solid "+(turma===t?V:BE),background:turma===t?V:W,color:turma===t?W:V,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{t}</button>)}
      </div>
      <div style={{marginBottom:11}}>
        <div style={{fontSize:11,fontWeight:600,color:"#7c5c3a",marginBottom:4,textTransform:"uppercase"}}>Mes</div>
        <input type="month" value={mes} onChange={e=>setMes(e.target.value)} style={{width:"100%",padding:"10px 13px",borderRadius:9,border:"1.5px solid "+BE,fontSize:15,background:LC,color:V,outline:"none",fontFamily:"inherit"}}/>
      </div>
      <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
        {["temperaturas","recepcao","testemunho","producao","desinfecao","higienizacao","naoconf"].map(f=><button key={f} onClick={()=>setFolha(f)} style={{padding:"6px 10px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",border:"2px solid "+(folha===f?"#7c5c3a":BE),background:folha===f?"#7c5c3a":LC,color:folha===f?W:"#7c5c3a",fontFamily:"inherit",marginBottom:4}}>{{temperaturas:"Temperaturas",recepcao:"Receção Matérias-Primas",testemunho:"Amostra Testemunho",producao:"Produção",desinfecao:"Desinfeção",higienizacao:"Higienização Equip. e Utensilios",naoconf:"Não Conformidades"}[f]}</button>)}
      </div>

      {folha==="temperaturas"&&(
        <div style={{overflowX:"auto"}}>
          <div style={{fontSize:11,color:"#7c5c3a",fontWeight:600,marginBottom:8}}>Temperaturas - {turma} - {mes.split("-")[1]}/{mes.split("-")[0]}</div>
          <table style={{borderCollapse:"collapse",fontSize:10}}>
            <thead>
              <tr style={{background:"#1a3d2b",color:W}}>
                <th style={{padding:"5px 6px",border:"1px solid #ccc",textAlign:"left"}}>Dia</th>
                <th style={{padding:"5px 6px",border:"1px solid #ccc"}}>Momento</th>
                <th style={{padding:"5px 6px",border:"1px solid #ccc"}}>Hora</th>
                <th style={{padding:"5px 6px",border:"1px solid #ccc"}}>Aluno</th>
                {FRIOS.map(eq=><th key={eq} style={{padding:"5px 4px",border:"1px solid #ccc",textAlign:"center"}}>{eq}</th>)}
                <th style={{padding:"5px 6px",border:"1px solid #ccc"}}>Prof.</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((dia,idx)=>{
                if(!dia)return(
                  <tr key={"e"+idx} style={{background:"#f9f9f9"}}>
                    <td style={{padding:"4px 6px",border:"1px solid #ddd",color:"#ccc",fontSize:9}}>{idx+1}</td>
                    <td colSpan={4+FRIOS.length} style={{border:"1px solid #ddd"}}></td>
                  </tr>
                );
                return(["inicio","final"].map(momento=>{
                  const reg=getTempDia(dia,momento);
                  const bgRow=momento==="inicio"?"#fff":"#f8fffe";
                  return(
                    <tr key={dia+momento} style={{background:reg?bgRow:"#fff8f8"}}>
                      <td style={{padding:"4px 6px",border:"1px solid #ddd",fontWeight:600,color:V,fontSize:10}}>{momento==="inicio"?dia:""}</td>
                      <td style={{padding:"4px 6px",border:"1px solid #ddd",fontSize:9,color:momento==="inicio"?"#2d5a3d":"#1a6b4a",fontWeight:600}}>{momento==="inicio"?"INÍCIO":"FINAL"}</td>
                      <td style={{padding:"4px 6px",border:"1px solid #ddd",fontSize:10}}>{reg?reg.time:"---"}</td>
                      <td style={{padding:"4px 6px",border:"1px solid #ddd",fontSize:9}}>{reg?reg.aluno:"---"}</td>
                      {FRIOS.map(eq=>{
                        const r=reg&&reg.records?reg.records.find(x=>x.equipamento===eq):null;
                        const nc=r&&r.conforme===false;
                        return<td key={eq} style={{padding:"3px 4px",border:"1px solid #ddd",textAlign:"center",fontSize:9,background:nc?"#fdecea":r&&r.conforme===true?"#e8f5e9":""}}>{r&&r.temperatura?r.temperatura+"C":"---"}{r&&<span style={{display:"block",fontSize:8,color:nc?"#c0392b":"#2d5a3d"}}>{nc?"NC":"OK"}</span>}</td>;
                      })}
                      <td style={{padding:"4px 6px",border:"1px solid #ddd",fontSize:9,color:V}}>{reg?"---":"---"}</td>
                    </tr>
                  );
                }));
              })}
            </tbody>
          </table>
          <div style={{marginTop:10,fontSize:11,color:"#888"}}>Verde = conforme | Vermelho = não conforme | --- = sem registo</div>
          <div style={{marginTop:12,display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>window.print()} style={{padding:"10px 20px",background:"#1a3d2b",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Imprimir / Guardar PDF</button>
            <span style={{fontSize:11,color:"#888"}}>Orientação paisagem recomendada</span>
          </div>
        </div>
      )}

      {folha==="recepcao"&&(
        <div>
          <div style={{fontSize:11,color:"#7c5c3a",fontWeight:600,marginBottom:8}}>Receção de Mercadorias - {turma} - {mes.split("-")[1]}/{mes.split("-")[0]}</div>
          {dias.map((dia,idx)=>{
            if(!dia)return null;
            const recs=(db.recepcao||[]).filter(r=>r.turma===turma&&r.date===dia);
            return(
              <div key={dia} style={{marginBottom:8,borderLeft:"3px solid "+(recs.length?"#4a7c5e":BE),paddingLeft:10}}>
                <div style={{fontSize:12,fontWeight:600,color:recs.length?V:GR}}>{dia}</div>
                {recs.length?recs.map(r=><div key={r.id} style={{fontSize:11,color:GR}}>{r.fornecedor} - Ft {r.fatura} - {r.aluno} - {(r.produtos||[]).length} produtos</div>):<div style={{fontSize:11,color:"#ccc"}}>Sem registo</div>}
              </div>
            );
          })}
          <div style={{marginTop:12}}><button onClick={()=>window.print()} style={{padding:"10px 20px",background:"#1a3d2b",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Imprimir / Guardar PDF</button></div>
        </div>
      )}

      {folha==="testemunho"&&(
        <div>
          <div style={{fontSize:11,color:"#7c5c3a",fontWeight:600,marginBottom:8}}>Amostras de Testemunho - {turma} - {mes.split("-")[1]}/{mes.split("-")[0]}</div>
          <table style={{borderCollapse:"collapse",fontSize:10,width:"100%"}}>
            <thead>
              <tr style={{background:"#6d3b8e",color:W}}>
                <th style={{padding:"6px 8px",border:"1px solid #ccc",textAlign:"left"}}>Dia</th>
                <th style={{padding:"6px 8px",border:"1px solid #ccc"}}>Hora</th>
                <th style={{padding:"6px 8px",border:"1px solid #ccc"}}>Prato</th>
                <th style={{padding:"6px 8px",border:"1px solid #ccc"}}>Tipo</th>
                <th style={{padding:"6px 8px",border:"1px solid #ccc"}}>Peso</th>
                <th style={{padding:"6px 8px",border:"1px solid #ccc"}}>Local</th>
                <th style={{padding:"6px 8px",border:"1px solid #ccc"}}>Destruir em</th>
                <th style={{padding:"6px 8px",border:"1px solid #ccc"}}>Aluno</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((dia,idx)=>{
                const rows=(db.testemunho||[]).filter(t=>t.turma===turma&&t.date===dia);
                if(!dia)return(<tr key={"e"+idx}><td style={{padding:"4px 8px",border:"1px solid #ddd",color:"#ccc",fontSize:9}}>{idx+1}</td><td colSpan={7} style={{border:"1px solid #ddd"}}></td></tr>);
                if(!rows.length)return(<tr key={dia} style={{background:"#fff8f8"}}><td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600,color:GR}}>{dia}</td><td colSpan={7} style={{padding:"4px 8px",border:"1px solid #ddd",color:"#ccc",fontSize:9}}>Sem registo</td></tr>);
                return rows.map((t,i)=>(
                  <tr key={t.id} style={{background:i%2===0?"#fff":"#f9f6ff"}}>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600,color:"#6d3b8e"}}>{i===0?dia:""}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{t.horaRefeicao}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600}}>{t.prato}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{t.tipoRefeicao}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",textAlign:"center"}}>{t.pesoAmostra}g</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{t.localArmazenamento}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",color:"#6d3b8e",fontWeight:600}}>{fD(t.dataDestruicao)}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{t.responsavel}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <button onClick={()=>window.print()} style={{padding:"10px 20px",background:"#1a3d2b",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Imprimir / Guardar PDF</button>
            <div style={{fontSize:11,color:"#888",alignSelf:"center"}}>Orientação paisagem recomendada</div>
          </div>
        </div>
      )}

      {folha==="producao"&&(
        <div>
          <div style={{fontSize:11,color:"#7c5c3a",fontWeight:600,marginBottom:8}}>Produção - {turma} - {mes.split("-")[1]}/{mes.split("-")[0]}</div>
          <table style={{borderCollapse:"collapse",fontSize:10,width:"100%"}}>
            <thead>
              <tr style={{background:CA,color:W}}>
                <th style={{padding:"5px 8px",border:"1px solid #ccc",textAlign:"left"}}>Dia</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Produto</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Lote</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Conservação</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Prod. em</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Cons. ate</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Local</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Aluno</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Prof.</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((dia,idx)=>{
                const rows=(db.producao||[]).filter(p=>p.turma===turma&&p.date===dia);
                if(!dia)return(<tr key={"e"+idx}><td style={{padding:"4px 8px",border:"1px solid #ddd",color:"#ccc",fontSize:9}}>{idx+1}</td><td colSpan={8} style={{border:"1px solid #ddd"}}></td></tr>);
                if(!rows.length)return(<tr key={dia} style={{background:"#fff8f8"}}><td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600,color:GR}}>{dia}</td><td colSpan={8} style={{padding:"4px 8px",border:"1px solid #ddd",color:"#ccc",fontSize:9}}>Sem registo</td></tr>);
                return rows.map((p,i)=>(
                  <tr key={p.id} style={{background:i%2===0?"#fff":"#fdf5ec"}}>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600,color:CA}}>{i===0?dia:""}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600}}>{p.nome}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",textAlign:"center"}}>{p.lote}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{p.conservacao}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{fD(p.dataProducao)}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600,color:CA}}>{fD(p.dataLimite)}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontSize:9}}>{p.local}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{p.aluno}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{p.professor}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <button onClick={()=>window.print()} style={{padding:"10px 20px",background:"#1a3d2b",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Imprimir / Guardar PDF</button>
            <div style={{fontSize:11,color:"#888",alignSelf:"center"}}>Orientação paisagem recomendada</div>
          </div>
        </div>
      )}

      {folha==="desinfecao"&&(
        <div>
          <div style={{fontSize:11,color:"#7c5c3a",fontWeight:600,marginBottom:8}}>Desinfeção Alimentos Cru - {turma} - {mes.split("-")[1]}/{mes.split("-")[0]}</div>
          <table style={{borderCollapse:"collapse",fontSize:10,width:"100%"}}>
            <thead>
              <tr style={{background:"#1a6b4a",color:W}}>
                <th style={{padding:"5px 8px",border:"1px solid #ccc",textAlign:"left"}}>Dia</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Hora</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Alimento</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Qtd</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Produto</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Conc. (ml/L)</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Tempo (min)</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Temp. agua</th>
                <th style={{padding:"5px 8px",border:"1px solid #ccc"}}>Aluno</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((dia,idx)=>{
                const rows=(db.desinfecao||[]).filter(d=>d.turma===turma&&d.date===dia);
                if(!dia)return(<tr key={"e"+idx}><td style={{padding:"4px 8px",border:"1px solid #ddd",color:"#ccc",fontSize:9}}>{idx+1}</td><td colSpan={8} style={{border:"1px solid #ddd"}}></td></tr>);
                if(!rows.length)return(<tr key={dia} style={{background:"#fff8f8"}}><td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600,color:GR}}>{dia}</td><td colSpan={8} style={{padding:"4px 8px",border:"1px solid #ddd",color:"#ccc",fontSize:9}}>Sem registo</td></tr>);
                return rows.map((d,i)=>(
                  <tr key={d.id} style={{background:i%2===0?"#fff":"#f0fff8"}}>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600,color:"#1a6b4a"}}>{i===0?dia:""}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{d.time}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",fontWeight:600}}>{d.alimento}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{d.quantidade}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{d.produto}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",textAlign:"center"}}>{d.concentracao}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",textAlign:"center"}}>{d.tempoContacto}</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd",textAlign:"center"}}>{d.temperatura}C</td>
                    <td style={{padding:"4px 8px",border:"1px solid #ddd"}}>{d.responsavel}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <button onClick={()=>window.print()} style={{padding:"10px 20px",background:"#1a3d2b",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Imprimir / Guardar PDF</button>
            <div style={{fontSize:11,color:"#888",alignSelf:"center"}}>Orientação paisagem recomendada</div>
          </div>
        </div>
      )}

      {folha==="higienizacao"&&(
        <div>
          <div style={{fontSize:11,color:"#7c5c3a",fontWeight:600,marginBottom:8}}>Higienização - {turma} - {mes.split("-")[1]}/{mes.split("-")[0]}</div>
          {dias.map((dia,idx)=>{
            if(!dia)return null;
            const hig=db.higienizacao&&db.higienizacao["hig-"+turma+"-"+dia];
            const total=Object.values(ZONAS).flat().length;
            const feitos=hig?Object.keys(hig.registos||{}).length:0;
            return(
              <div key={dia} style={{marginBottom:6,display:"flex",justifyContent:"space-between",padding:"7px 10px",borderRadius:7,background:feitos===total?"#e8f5e9":feitos>0?"#fff3e0":"#fff",border:"1px solid "+BE}}>
                <span style={{fontSize:12,fontWeight:600,color:V}}>{dia}</span>
                <span style={{fontSize:11,color:feitos===total?V:feitos>0?"#d35400":GR}}>{feitos===0?"Sem registo":feitos+"/"+total+" tarefas"}</span>
              </div>
            );
          })}
          <div style={{marginTop:12}}><button onClick={()=>window.print()} style={{padding:"10px 20px",background:"#1a3d2b",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Imprimir / Guardar PDF</button></div>
        </div>
      )}

      {folha==="naoconf"&&(
        <div>
          <div style={{fontSize:11,color:"#7c5c3a",fontWeight:600,marginBottom:8}}>Não Conformidades - {turma} - {mes.split("-")[1]}/{mes.split("-")[0]}</div>
          {dias.map((dia,idx)=>{
            if(!dia)return null;
            const ncs=(db.ncs||[]).filter(n=>n.turma===turma&&n.date===dia);
            return(
              <div key={dia} style={{marginBottom:6,borderLeft:"3px solid "+(ncs.length?R:BE),paddingLeft:10}}>
                <div style={{fontSize:12,fontWeight:600,color:ncs.length?R:GR}}>{dia}</div>
                {ncs.length?ncs.map(n=><div key={n.id} style={{fontSize:11,color:GR}}>{n.zona} - {n.estado}</div>):<div style={{fontSize:11,color:"#ccc"}}>Sem não conformidades</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const EQUIP_LISTA=[
  {id:"cong_vert",nome:"Arca Congeladora Vertical",tipo:"Frio",icone:"C",desc:"Arcas congeladoras verticais (x3)"},
  {id:"cong_horiz",nome:"Arca Congeladora Horizontal",tipo:"Frio",icone:"C",desc:"Arcas congeladoras horizontais"},
  {id:"frig_vert",nome:"Frigorifico Vertical",tipo:"Frio",icone:"F",desc:"Frigorificos verticais (x4)"},
  {id:"frig_banc",nome:"Frigorifico de Bancada",tipo:"Frio",icone:"F",desc:"Frigorificos de bancada (x5)"},
  {id:"abatedor",nome:"Abatedor de Temperatura",tipo:"Frio",icone:"A",desc:"Abatedores (x2)"},
  {id:"forno",nome:"Forno",tipo:"Calor",icone:"F",desc:"Fornos (x2)"},
  {id:"vacuo",nome:"Maquina de Vacuo",tipo:"Preparacao",icone:"V",desc:"Maquinas de vacuo (x2)"},
  {id:"picadora",nome:"Picadora de Carne",tipo:"Preparacao",icone:"P",desc:"Picadora"},
  {id:"batedeira",nome:"Batedeira",tipo:"Preparacao",icone:"B",desc:"Batedeira"},
  {id:"amassadeira",nome:"Amassadeira",tipo:"Preparacao",icone:"A",desc:"Amassadeiras (x2)"},
  {id:"desidratador",nome:"Desidratador",tipo:"Preparacao",icone:"D",desc:"Desidratador"},
  {id:"bimby",nome:"Bimby",tipo:"Preparacao",icone:"B",desc:"Bimby"},
  {id:"pacojet",nome:"Pacojet",tipo:"Preparacao",icone:"P",desc:"Pacojet"},
  {id:"processador",nome:"Processador de Alimentos",tipo:"Preparacao",icone:"P",desc:"Processadores (x2)"},
  {id:"mlav",nome:"Maquina de Lavagem",tipo:"Copa",icone:"L",desc:"Maquinas de lavagem (x2)"},
];

const PROD_HIGIENE_LISTA=[
  {id:"deterg_loica",nome:"Detergente Loia / Copa",tipo:"Detergente"},
  {id:"deterg_bancada",nome:"Detergente Superficies / Bancadas",tipo:"Detergente"},
  {id:"desinfetante",nome:"Desinfetante Superficies",tipo:"Desinfetante"},
  {id:"desinfetante_alim",nome:"Desinfetante Alimentos",tipo:"Desinfetante"},
  {id:"deterg_chao",nome:"Detergente Chao",tipo:"Detergente"},
  {id:"desengordurante",nome:"Desengordurante",tipo:"Detergente"},
  {id:"prod_forno",nome:"Produto Limpeza Forno",tipo:"Especifico"},
  {id:"prod_inox",nome:"Produto Limpeza Inox",tipo:"Especifico"},
  {id:"clorado",nome:"Produto Clorado",tipo:"Desinfetante"},
  {id:"alcool",nome:"Alcool / Gel Desinfetante Maos",tipo:"Higiene Pessoal"},
];

const PLANO_HIG={
  diario:[
    "Bancadas de trabalho — lavar e desinfetar apos cada utilizacao",
    "Equipamentos utilizados — limpar e higienizar no final da aula",
    "Chao da cozinha — varrer e lavar",
    "Cuba e ralos — limpar e desinfetar",
    "Caixotes do lixo — esvaziar, lavar e desinfetar",
    "Copa — maquinas de lavagem, loica e bancadas",
    "Frigorifico — verificar temperaturas e limpeza exterior",
  ],
  semanal:[
    "Frigorificos — limpeza interior completa",
    "Congeladores — verificar acumulacao de gelo",
    "Prateleiras e armarios — limpeza completa",
    "Paredes e azulejos — limpeza e desinfecao",
    "Exaustores e filtros — limpeza",
    "Carrinhos de transporte — lavagem completa",
    "Economatos — organizacao e limpeza",
  ],
  mensal:[
    "Congeladores — descongelacao e limpeza profunda",
    "Fornos — limpeza profunda interior e exterior",
    "Equipamentos de preparacao — desmontagem e limpeza profunda",
    "Tetos e iluminacao — limpeza",
    "Portas e janelas — limpeza completa",
    "Limpeza geral profunda da cozinha",
    "Verificacao e registo de todos os equipamentos",
  ],
};

function Equipamentos({user,db,setDb,showToast}){
  const [sel,setSel]=useState(null);
  const [edit,setEdit]=useState(false);
  const [aba,setAba]=useState("equip");
  const [selProd,setSelProd]=useState(null);
  const [editProd,setEditProd]=useState(false);
  const [form,setForm]=useState({marca:"",modelo:"",ano:"",tempTrabalho:"",capacidade:"",instrucoes:"",limpeza:"",seguranca:"",notas:"",linkPDF:"",linkImg:""});
  const [formProd,setFormProd]=useState({fabricante:"",referencia:"",instrucoes:"",seguranca:"",dosagem:"",linkPDF:"",linkImg:""});
  const [filtro,setFiltro]=useState("Todos");
  const podeEditar=user.tipo==="professor"||user.tipo==="coord";
  const fichas=db.fichasEquip||{};
  const fichasProd=db.fichasProd||{};
  const tipos=["Todos","Frio","Calor","Preparacao","Copa"];
  const lista=filtro==="Todos"?EQUIP_LISTA:EQUIP_LISTA.filter(e=>e.tipo===filtro);
  const corTipo={Frio:"#0369a1",Calor:"#dc2626",Preparacao:"#0891b2",Copa:"#059669",Detergente:"#0891b2",Desinfetante:"#6d28d9",Especifico:"#0f766e","Higiene Pessoal":"#059669"};

  const abrirEdit=(eq)=>{
    const f=fichas[eq.id]||{};
    setForm({marca:f.marca||"",modelo:f.modelo||"",ano:f.ano||"",tempTrabalho:f.tempTrabalho||"",capacidade:f.capacidade||"",instrucoes:f.instrucoes||"",limpeza:f.limpeza||"",seguranca:f.seguranca||"",notas:f.notas||"",linkPDF:f.linkPDF||"",linkImg:f.linkImg||""});
    setEdit(true);
  };

  const guardar=()=>{
    setDb(p=>({...p,fichasEquip:{...(p.fichasEquip||{}),[sel.id]:{...form,atualizadoPor:user.id,atualizadoEm:gD()+" "+gT()}}}));
    setEdit(false);
    showToast("Ficha guardada!");
  };

  const abrirEditProd=(prod)=>{
    const f=fichasProd[prod.id]||{};
    setFormProd({fabricante:f.fabricante||"",referencia:f.referencia||"",instrucoes:f.instrucoes||"",seguranca:f.seguranca||"",dosagem:f.dosagem||"",linkPDF:f.linkPDF||"",linkImg:f.linkImg||""});
    setEditProd(true);
  };

  const guardarProd=()=>{
    setDb(p=>({...p,fichasProd:{...(p.fichasProd||{}),[selProd.id]:{...formProd,atualizadoPor:user.id,atualizadoEm:gD()+" "+gT()}}}));
    setEditProd(false);
    showToast("Ficha do produto guardada!");
  };

  // Equipment detail view
  if(sel){
    const f=fichas[sel.id]||{};
    return(
      <div style={{padding:15}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:44,height:44,borderRadius:12,background:corTipo[sel.tipo]||V,display:"flex",alignItems:"center",justifyContent:"center",color:W,fontSize:18,fontWeight:800,flexShrink:0}}>{sel.icone}</div>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#0c4a6e"}}>{sel.nome}</div>
            <div style={{fontSize:10,color:GR,marginTop:2}}>{sel.desc}</div>
          </div>
        </div>
        {!edit?(
          <div>
            {[
              {lb:"Marca / Modelo",val:f.marca?(f.marca+(f.modelo?" — "+f.modelo:"")):"Nao definido"},
              {lb:"Ano de aquisicao",val:f.ano||"Nao definido"},
              {lb:"Temperatura de trabalho",val:f.tempTrabalho||"Nao definido"},
              {lb:"Capacidade",val:f.capacidade||"Nao definido"},
              {lb:"Instrucoes de utilizacao",val:f.instrucoes||"Nao definido"},
              {lb:"Limpeza e higienizacao",val:f.limpeza||"Nao definido"},
              {lb:"Notas de seguranca",val:f.seguranca||"Nao definido"},
              {lb:"Notas adicionais",val:f.notas||"Nao definido"},
            ].map(item=>(
              <div key={item.lb} style={{marginBottom:10,padding:"11px 13px",background:W,borderRadius:11,border:"1px solid #bae6fd"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#0369a1",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{item.lb}</div>
                <div style={{fontSize:13,color:"#0c4a6e",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{item.val}</div>
              </div>
            ))}
            {f.linkImg&&<div style={{marginBottom:10}}><div style={{fontSize:10,fontWeight:700,color:"#0369a1",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Imagem / Ficha</div><img src={f.linkImg} alt="Ficha" style={{width:"100%",borderRadius:10,border:"1px solid #bae6fd"}}/></div>}
            {f.linkPDF&&<div style={{marginBottom:10}}><a href={f.linkPDF} target="_blank" rel="noreferrer" style={{display:"block",padding:"12px 16px",background:"#0369a1",color:W,borderRadius:10,textAlign:"center",fontSize:13,fontWeight:700,textDecoration:"none",letterSpacing:.5}}>Abrir PDF / Ficha de Seguranca</a></div>}
            {f.atualizadoPor&&<div style={{fontSize:10,color:GR,textAlign:"center",marginTop:4}}>Atualizado: {f.atualizadoEm} por {f.atualizadoPor}</div>}
            {podeEditar&&<div style={{marginTop:12}}><B lb="Editar Ficha" onClick={()=>abrirEdit(sel)} cor="#0369a1"/></div>}
            <div style={{marginTop:8}}><B lb="Voltar" onClick={()=>{setSel(null);setEdit(false);}} out cor={GR}/></div>
          </div>
        ):(
          <div>
            <div style={{fontWeight:700,color:"#0369a1",marginBottom:12,fontSize:14}}>Editar — {sel.nome}</div>
            <Ip lb="Marca" val={form.marca} onChange={v=>setForm(p=>({...p,marca:v}))} ph="Ex: Liebherr"/>
            <Ip lb="Modelo" val={form.modelo} onChange={v=>setForm(p=>({...p,modelo:v}))} ph="Ex: GNP 2366"/>
            <Ip lb="Ano" val={form.ano} onChange={v=>setForm(p=>({...p,ano:v}))} ph="Ex: 2020"/>
            <Ip lb="Temperatura de Trabalho" val={form.tempTrabalho} onChange={v=>setForm(p=>({...p,tempTrabalho:v}))} ph="Ex: -18°C a -22°C"/>
            <Ip lb="Capacidade" val={form.capacidade} onChange={v=>setForm(p=>({...p,capacidade:v}))} ph="Ex: 346 litros"/>
            <Ta lb="Instrucoes de Utilizacao" val={form.instrucoes} onChange={v=>setForm(p=>({...p,instrucoes:v}))} ph="Como utilizar..."/>
            <Ta lb="Limpeza e Higienizacao" val={form.limpeza} onChange={v=>setForm(p=>({...p,limpeza:v}))} ph="Como limpar..."/>
            <Ta lb="Notas de Seguranca" val={form.seguranca} onChange={v=>setForm(p=>({...p,seguranca:v}))} ph="Avisos de seguranca..."/>
            <Ta lb="Notas Adicionais" val={form.notas} onChange={v=>setForm(p=>({...p,notas:v}))} ph="Outras informacoes..."/>
            <Ip lb="Link PDF / Google Drive (ficha de seguranca)" val={form.linkPDF} onChange={v=>setForm(p=>({...p,linkPDF:v}))} ph="https://drive.google.com/..."/>
            <Ip lb="Link de Imagem (URL)" val={form.linkImg} onChange={v=>setForm(p=>({...p,linkImg:v}))} ph="https://..."/>
            <div style={{display:"flex",gap:8,marginTop:6}}>
              <B lb="Cancelar" sm out cor={GR} onClick={()=>setEdit(false)} st={{flex:1}}/>
              <B lb="Guardar" sm onClick={guardar} cor="#0369a1" st={{flex:2}}/>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Product detail view
  if(selProd){
    const f=fichasProd[selProd.id]||{};
    return(
      <div style={{padding:15}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:44,height:44,borderRadius:12,background:corTipo[selProd.tipo]||V,display:"flex",alignItems:"center",justifyContent:"center",color:W,fontSize:18,fontWeight:800,flexShrink:0}}>H</div>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:700,color:"#0c4a6e"}}>{selProd.nome}</div>
            <div style={{fontSize:10,color:corTipo[selProd.tipo],fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>{selProd.tipo}</div>
          </div>
        </div>
        {!editProd?(
          <div>
            {[
              {lb:"Fabricante",val:f.fabricante||"Nao definido"},
              {lb:"Referencia / EAN",val:f.referencia||"Nao definido"},
              {lb:"Dosagem / Concentracao",val:f.dosagem||"Nao definido"},
              {lb:"Instrucoes de utilizacao",val:f.instrucoes||"Nao definido"},
              {lb:"Seguranca / EPI necessario",val:f.seguranca||"Nao definido"},
            ].map(item=>(
              <div key={item.lb} style={{marginBottom:10,padding:"11px 13px",background:W,borderRadius:11,border:"1px solid #bae6fd"}}>
                <div style={{fontSize:10,fontWeight:700,color:"#6d28d9",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{item.lb}</div>
                <div style={{fontSize:13,color:"#0c4a6e",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{item.val}</div>
              </div>
            ))}
            {f.linkImg&&<div style={{marginBottom:10}}><img src={f.linkImg} alt="Ficha" style={{width:"100%",borderRadius:10,border:"1px solid #bae6fd"}}/></div>}
            {f.linkPDF&&<div style={{marginBottom:10}}><a href={f.linkPDF} target="_blank" rel="noreferrer" style={{display:"block",padding:"12px 16px",background:"#6d28d9",color:W,borderRadius:10,textAlign:"center",fontSize:13,fontWeight:700,textDecoration:"none",letterSpacing:.5}}>Abrir Ficha de Seguranca (PDF)</a></div>}
            {podeEditar&&<div style={{marginTop:12}}><B lb="Editar Ficha" onClick={()=>abrirEditProd(selProd)} cor="#6d28d9"/></div>}
            <div style={{marginTop:8}}><B lb="Voltar" onClick={()=>{setSelProd(null);setEditProd(false);}} out cor={GR}/></div>
          </div>
        ):(
          <div>
            <div style={{fontWeight:700,color:"#6d28d9",marginBottom:12,fontSize:14}}>Editar — {selProd.nome}</div>
            <Ip lb="Fabricante" val={formProd.fabricante} onChange={v=>setFormProd(p=>({...p,fabricante:v}))} ph="Ex: Diversey"/>
            <Ip lb="Referencia / EAN" val={formProd.referencia} onChange={v=>setFormProd(p=>({...p,referencia:v}))} ph="Ex: 123456789"/>
            <Ip lb="Dosagem / Concentracao" val={formProd.dosagem} onChange={v=>setFormProd(p=>({...p,dosagem:v}))} ph="Ex: 2ml por litro de agua"/>
            <Ta lb="Instrucoes de Utilizacao" val={formProd.instrucoes} onChange={v=>setFormProd(p=>({...p,instrucoes:v}))} ph="Como usar o produto..."/>
            <Ta lb="Seguranca / EPI Necessario" val={formProd.seguranca} onChange={v=>setFormProd(p=>({...p,seguranca:v}))} ph="Luvas, avental, oculos..."/>
            <Ip lb="Link PDF Ficha de Seguranca (Google Drive)" val={formProd.linkPDF} onChange={v=>setFormProd(p=>({...p,linkPDF:v}))} ph="https://drive.google.com/..."/>
            <Ip lb="Link Imagem (URL)" val={formProd.linkImg} onChange={v=>setFormProd(p=>({...p,linkImg:v}))} ph="https://..."/>
            <div style={{display:"flex",gap:8,marginTop:6}}>
              <B lb="Cancelar" sm out cor={GR} onClick={()=>setEditProd(false)} st={{flex:1}}/>
              <B lb="Guardar" sm onClick={guardarProd} cor="#6d28d9" st={{flex:2}}/>
            </div>
          </div>
        )}
      </div>
    );
  }

  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,color:"#0c4a6e",marginBottom:14}}>Fichas e Planos</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["equip","Equipamentos"],["produtos","Prod. Higiene"],["plano","Plano Higienizacao"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setAba(id)} style={{flex:1,padding:"9px 4px",borderRadius:9,border:"2px solid "+(aba===id?"#0e7490":"#bae6fd"),background:aba===id?"#0e7490":"#f0f9ff",color:aba===id?W:"#0369a1",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:.3}}>{lb}</button>
        ))}
      </div>

      {aba==="equip"&&<div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {tipos.map(t=>(
            <button key={t} onClick={()=>setFiltro(t)} style={{padding:"5px 10px",borderRadius:7,fontSize:10,fontWeight:700,cursor:"pointer",border:"1.5px solid "+(filtro===t?"#0e7490":"#bae6fd"),background:filtro===t?"#0e7490":"#f0f9ff",color:filtro===t?W:"#0369a1",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:.5}}>{t}</button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {lista.map(eq=>{
            const temFicha=!!(fichas[eq.id]&&fichas[eq.id].marca);
            return(
              <button key={eq.id} onClick={()=>setSel(eq)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:13,border:"1px solid "+(temFicha?"#bae6fd":"#e2e8f0"),background:W,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(14,116,144,.08)"}}>
                <div style={{width:36,height:36,borderRadius:10,background:temFicha?corTipo[eq.tipo]||V:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",color:temFicha?W:GR,fontSize:14,fontWeight:800,flexShrink:0}}>{eq.icone}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#0c4a6e"}}>{eq.nome}</div>
                  <div style={{fontSize:10,color:GR,marginTop:1}}>{eq.desc}</div>
                  <div style={{fontSize:9,color:temFicha?corTipo[eq.tipo]:GR,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>{temFicha?"Ficha preenchida":"Sem ficha"}</div>
                </div>
                <div style={{fontSize:18,color:"#bae6fd"}}>›</div>
              </button>
            );
          })}
        </div>
      </div>}

      {aba==="produtos"&&<div>
        <div style={{fontSize:12,color:GR,marginBottom:12}}>Fichas de seguranca dos produtos de higiene utilizados na cozinha</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PROD_HIGIENE_LISTA.map(prod=>{
            const temFicha=!!(fichasProd[prod.id]&&fichasProd[prod.id].fabricante);
            return(
              <button key={prod.id} onClick={()=>setSelProd(prod)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:13,border:"1px solid "+(temFicha?"#ddd6fe":"#e2e8f0"),background:W,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(109,40,217,.06)"}}>
                <div style={{width:36,height:36,borderRadius:10,background:temFicha?corTipo[prod.tipo]||"#6d28d9":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",color:temFicha?W:GR,fontSize:14,fontWeight:800,flexShrink:0}}>H</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#0c4a6e"}}>{prod.nome}</div>
                  <div style={{fontSize:9,color:temFicha?corTipo[prod.tipo]:"#ccc",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>{prod.tipo} — {temFicha?"Ficha preenchida":"Sem ficha"}</div>
                </div>
                <div style={{fontSize:18,color:"#ddd6fe"}}>›</div>
              </button>
            );
          })}
        </div>
      </div>}

      {aba==="plano"&&<div>
        <div style={{fontSize:12,color:GR,marginBottom:12}}>Plano de higienizacao da cozinha pedagogica ECL</div>
        {[
          {freq:"Diario",cor:"#0891b2",items:PLANO_HIG.diario},
          {freq:"Semanal",cor:"#0369a1",items:PLANO_HIG.semanal},
          {freq:"Mensal",cor:"#6d28d9",items:PLANO_HIG.mensal},
        ].map(grupo=>(
          <div key={grupo.freq} style={{marginBottom:14}}>
            <div style={{background:grupo.cor,color:W,borderRadius:"10px 10px 0 0",padding:"8px 14px",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{grupo.freq}</div>
            <div style={{background:W,borderRadius:"0 0 10px 10px",border:"1px solid #bae6fd",borderTop:"none"}}>
              {grupo.items.map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",borderBottom:i<grupo.items.length-1?"1px solid #f0f9ff":"none"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:grupo.cor,flexShrink:0,marginTop:5}}></div>
                  <span style={{fontSize:12,color:"#0c4a6e",lineHeight:1.5}}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function Faltas({user,db,setDb,showToast}){
  const [form,setForm]=useState({tipo:"equipamento",descricao:"",urgencia:"normal"});
  const duasSemanas=new Date();
  duasSemanas.setDate(duasSemanas.getDate()-14);
  const lista=(db.faltas||[]).filter(f=>{try{const p=f.date.split("/");const d=new Date(p[2],p[1]-1,p[0]);return d>=duasSemanas;}catch{return true;}}).reverse();
  const corU={normal:"#0369a1",urgente:"#d97706",critico:"#dc2626"};
  const save=()=>{
    if(!form.descricao)return;
    const falta={...form,responsavel:user.id,turma:user.turma||"",date:gD(),time:gT(),id:Date.now(),estado:"pendente"};
    setDb(p=>({...p,faltas:[...(p.faltas||[]),falta]}));
    const nomeFalt=(db.assinaturas&&db.assinaturas[user.id])||"";
    enviar("Faltas e Necessidades",[gD(),gT(),user.turma||"",user.id,nomeFalt,form.tipo,form.descricao,form.urgencia,"pendente"]);
    showToast("Falta registada! Notificação enviada.");
    setForm({tipo:"equipamento",descricao:"",urgencia:"normal"});
  };
  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:4}}>Faltas e Necessidades</div>
      <div style={{fontSize:12,color:GR,marginBottom:14}}>Regista equipamentos em falta, materiais ou outras necessidades</div>
      <Cd>
        <Sl lb="Tipo" val={form.tipo} onChange={v=>setForm(p=>({...p,tipo:v}))} opts={["equipamento","material","produto limpeza","outro"]}/>
        <Ta lb="Descrição" val={form.descricao} onChange={v=>setForm(p=>({...p,descricao:v}))} ph="O que está em falta ou é necessário..."/>
        <Sl lb="Urgência" val={form.urgencia} onChange={v=>setForm(p=>({...p,urgencia:v}))} opts={["normal","urgente","critico"]}/>
        <div style={{background:"#fef3c7",borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:"#92400e"}}>
          Após guardar, será enviada notificação por email à coordenação.
        </div>
        <B lb="Registar e Notificar" onClick={save} cor="#b45309"/>
      </Cd>
      {lista.length>0&&<div>
        <div style={{fontSize:12,fontWeight:700,color:"#b45309",marginBottom:8}}>Últimas 2 semanas</div>
        {lista.map(f=><Cd key={f.id} st={{marginBottom:8,borderLeft:"3px solid "+(corU[f.urgencia]||"#b45309")}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:600,fontSize:13}}>{f.tipo}</span>
            <span style={{background:corU[f.urgencia]||"#b45309",color:W,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>{f.urgencia}</span>
          </div>
          <div style={{fontSize:12,color:GR,marginTop:3}}>{f.descricao}</div>
          <div style={{fontSize:10,color:GR,marginTop:2}}>{f.date} {f.time} — {f.responsavel}</div>
        </Cd>)}
      </div>}
    </div>
  );
}

function Auxiliar({user,db,setDb,showToast}){
  const h=gD(),k="aux-"+h;
  const regs=(db.auxHig&&db.auxHig[k]&&db.auxHig[k].registos)?db.auxHig[k].registos:{};
  const notas=(db.auxHig&&db.auxHig[k]&&db.auxHig[k].notas)?db.auxHig[k].notas:{};
  const [zona,setZona]=useState(Object.keys(ZONAS)[0]);
  const [notaEdit,setNotaEdit]=useState("");
  const [showNota,setShowNota]=useState(false);
  const tI=Object.values(ZONAS).flat().length,tF=Object.keys(regs).length;
  const nomeAux=db.assinaturas&&db.assinaturas[user.id];

  const mk=item=>{
    if(regs[item]){showToast("Já marcado");return;}
    const n={...regs,[item]:{aluno:nomeAux||user.id,time:gT()}};
    setDb(p=>{const ah={...p.auxHig};ah[k]={registos:n,notas,date:h};return{...p,auxHig:ah};});
    showToast("Verificado!");
  };

  const guardarNota=()=>{
    const n={...notas,[zona]:notaEdit};
    setDb(p=>{const ah={...p.auxHig};ah[k]={registos:regs,notas:n,date:h};return{...p,auxHig:ah};});
    setShowNota(false);
    showToast("Nota guardada!");
  };

  if(!nomeAux){
    return(
      <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f9ff,#e0f2fe)",maxWidth:600,margin:"0 auto"}}>
        <AssinaturaDigital onSave={nome=>{setDb(p=>({...p,assinaturas:{...(p.assinaturas||{}),[user.id]:nome}}));}}/>
      </div>
    );
  }

  return(
    <div style={{padding:15}}>
      <div style={{background:"linear-gradient(135deg,#0f766e,#0e7490)",borderRadius:14,padding:18,marginBottom:14,color:W}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Auxiliar de Apoio</div>
        <div style={{fontSize:14,opacity:.9,marginTop:2,fontStyle:"italic"}}>{nomeAux}</div>
        <div style={{fontSize:11,opacity:.65,marginTop:2}}>{h}</div>
      </div>
      <Cd>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
          <span style={{fontSize:12,color:GR}}>Progresso de verificação</span>
          <span style={{background:tF===tI?V:CA,color:W,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600}}>{tF}/{tI}</span>
        </div>
        <Pg val={tF} max={tI}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {Object.keys(ZONAS).map(z=>{
            const f=ZONAS[z].filter(i=>regs[i]).length,ok=f===ZONAS[z].length;
            const temNota=!!(notas[z]&&notas[z].trim());
            return(
              <button key={z} onClick={()=>{setZona(z);setNotaEdit(notas[z]||"");setShowNota(false);}} style={{padding:"5px 9px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"2px solid "+(zona===z?V:ok?"#b8dfc8":BE),background:zona===z?V:ok?"#e8f5e9":LC,color:zona===z?W:ok?V:GR,fontFamily:"inherit",position:"relative"}}>
                {z}{ok?" ok":" "+f+"/"+ZONAS[z].length}
                {temNota&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#f59e0b"}}></span>}
              </button>
            );
          })}
        </div>
      </Cd>
      <Cd>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontWeight:700,fontSize:14,color:V}}>{zona} — {ZONAS[zona].filter(i=>regs[i]).length}/{ZONAS[zona].length}</div>
          <button onClick={()=>{setNotaEdit(notas[zona]||"");setShowNota(!showNota);}} style={{padding:"5px 12px",borderRadius:7,border:"1.5px solid "+(notas[zona]?"#f59e0b":BE),background:notas[zona]?"#fef3c7":"transparent",color:notas[zona]?"#92400e":GR,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            {notas[zona]?"Nota":"+ Nota"}
          </button>
        </div>
        {showNota&&(
          <div style={{marginBottom:12,background:"#fef3c7",borderRadius:9,padding:10}}>
            <div style={{fontSize:10,fontWeight:700,color:"#92400e",marginBottom:6,textTransform:"uppercase"}}>Nota — {zona}</div>
            <textarea value={notaEdit} onChange={e=>setNotaEdit(e.target.value)} placeholder="Ex: Produto acabou..." rows={3} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #f59e0b",fontSize:13,background:W,color:"#92400e",outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
            <div style={{display:"flex",gap:6,marginTop:6}}>
              <button onClick={()=>setShowNota(false)} style={{flex:1,padding:"7px",borderRadius:7,border:"1.5px solid "+BE,background:"transparent",color:GR,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
              <button onClick={guardarNota} style={{flex:2,padding:"7px",borderRadius:7,border:"none",background:"#f59e0b",color:W,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Guardar Nota</button>
            </div>
          </div>
        )}
        {notas[zona]&&!showNota&&(
          <div style={{marginBottom:10,background:"#fef3c7",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400e"}}>
            <span style={{fontWeight:700}}>Nota: </span>{notas[zona]}
          </div>
        )}
        {ZONAS[zona].map(item=>{const reg=regs[item];return(
          <div key={item} onClick={()=>mk(item)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid "+LC,cursor:"pointer"}}>
            <div style={{width:32,height:32,borderRadius:8,flexShrink:0,border:"2px solid "+(reg?V:BE),background:reg?V:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {reg&&<span style={{color:W,fontSize:16,fontWeight:700}}>v</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:reg?600:400,color:reg?V:"#333"}}>{item}</div>
              {reg&&<div style={{fontSize:10,color:GR,marginTop:1}}>{reg.aluno} — {reg.time}</div>}
            </div>
          </div>
        );})}
      </Cd>
    </div>
  );
}

function HigienePessoal({user,db,setDb,showToast}){
  const h=gD(),k="hig-pessoal-"+user.id+"-"+h;
  const sv=db.higPessoal&&db.higPessoal[k];
  const [checks,setChecks]=useState(sv?sv.checks:{});
  const ITEMS_INFO=[
    {titulo:"Lavagem das Mãos",desc:"Lavar as mãos durante pelo menos 20 segundos com água quente e sabão: antes de manipular alimentos, após usar a casa de banho, após tocar em alimentos crus, após assoar, tossir ou espirrar."},
    {titulo:"Farda Completa",desc:"Usar sempre: avental limpo, touca ou rede no cabelo, calçado adequado e antiderrapante."},
    {titulo:"Sem Adornos",desc:"Retirar obrigatoriamente: anéis, pulseiras, relógios, brincos. Podem cair nos alimentos e causar contaminação física."},
    {titulo:"Proibido: Unhas e Pestanas Postiças",desc:"Unhas postiças e pestanas postiças são PROIBIDAS na cozinha. Podem desprender-se durante a manipulação de alimentos e causar contaminação física. Unhas naturais devem estar curtas, limpas e sem verniz."},
    {titulo:"Unhas",desc:"Unhas curtas, limpas e sem verniz. O verniz pode descascar e contaminar os alimentos."},
    {titulo:"Proibições",desc:"É proibido: comer, beber, fumar ou mascar pastilha na cozinha. Também é proibido tossir ou espirrar sobre os alimentos."},
    {titulo:"Doença",desc:"Não trabalhar com alimentos se tiver: diarreia, vómitos, febre, tosse intensa ou feridas infetadas nas mãos. Informar o professor imediatamente."},
  ];
  const CHECKLIST=[
    {id:"farda",l:"Farda completa e limpa"},
    {id:"touca",l:"Cabelo apanhado / touca colocada"},
    {id:"maos",l:"Mãos lavadas antes de entrar"},
    {id:"adornos",l:"Sem anéis, pulseiras ou relógio"},
    {id:"unhas",l:"Unhas curtas, sem verniz e sem unhas postiças"},
    {id:"pestanas",l:"Sem pestanas postiças"},
    {id:"calcado",l:"Calçado adequado"},
    {id:"sem_doenca",l:"Sem sintomas de doença"},
    {id:"sem_perfume",l:"Sem perfume excessivo"},
  ];
  const total=CHECKLIST.length;
  const feitos=CHECKLIST.filter(i=>checks[i.id]).length;
  const todosOk=feitos===total;
  const [aba,setAba]=useState("info");

  const guardar=()=>{
    const nomeHig=(db.assinaturas&&db.assinaturas[user.id])||user.id;
    setDb(p=>{const hp={...p.higPessoal};hp[k]={checks,aluno:user.id,nomeAluno:nomeHig,date:h,time:gT()};return{...p,higPessoal:hp};});
    enviar("Higiene Pessoal",[h,gT(),user.turma,user.id,nomeHig,"Confirmado"]);
    showToast("Higiene pessoal confirmada!");
  };

  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,color:"#0c4a6e"}}>Higiene Pessoal</div><InfoBtn modId="higienePessoal"/></div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["info","Informação"],["checklist","Checklist"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setAba(id)} style={{flex:1,padding:10,borderRadius:9,border:"2px solid "+(aba===id?"#0f766e":BE),background:aba===id?"#0f766e":LC,color:aba===id?W:"#0f766e",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:.5}}>{lb}</button>
        ))}
      </div>
      {aba==="info"&&<div>
        {ITEMS_INFO.map(item=>(
          <Cd key={item.titulo} st={{borderLeft:"4px solid #0f766e",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:"#0f766e",marginBottom:5}}>{item.titulo}</div>
            <div style={{fontSize:12,color:"#334155",lineHeight:1.6}}>{item.desc}</div>
          </Cd>
        ))}
      </div>}
      {aba==="checklist"&&<div>
        {sv&&<div style={{background:"#e0f2fe",borderRadius:9,padding:10,marginBottom:10,color:"#0e7490",fontSize:12,fontWeight:600}}>Confirmado hoje às {sv.time}</div>}
        <Cd>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,color:GR}}>Verificados</span>
            <span style={{background:todosOk?"#0f766e":CA,color:W,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600}}>{feitos}/{total}</span>
          </div>
          <Pg val={feitos} max={total}/>
          {CHECKLIST.map(item=>(
            <div key={item.id} onClick={()=>{if(!sv)setChecks(p=>({...p,[item.id]:!p[item.id]}));}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid "+LC,cursor:sv?"default":"pointer"}}>
              <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:checks[item.id]?"#0f766e":"transparent",border:"2px solid "+(checks[item.id]?"#0f766e":BE),display:"flex",alignItems:"center",justifyContent:"center"}}>
                {checks[item.id]&&<span style={{color:W,fontSize:14,fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:checks[item.id]?"#0f766e":GR,fontWeight:checks[item.id]?600:400}}>{item.l}</span>
            </div>
          ))}
        </Cd>
        {!sv&&<B lb={todosOk?"Confirmar Higiene Pessoal":"Faltam "+(total-feitos)+" itens"} onClick={guardar} cor={todosOk?"#0f766e":"#ccc"} dis={!todosOk}/>}
      </div>}
    </div>
  );
}

function Oleos({user,db,setDb,showToast}){
  const [form,setForm]=useState({equipamento:"Fritadeira 1",temperatura:"",cor:"normal",espuma:"nao",cheiro:"normal",teste:"ok",acao:"continua"});
  const lista=(db.oleos||[]).filter(o=>o.turma===user.turma).slice(-10).reverse();
  const save=()=>{
    if(!form.temperatura)return;
    const alterado=form.cor!=="normal"||form.espuma==="sim"||form.cheiro!=="normal"||form.teste!=="ok";
    const reg={...form,alterado,responsavel:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()};
    setDb(p=>({...p,oleos:[...(p.oleos||[]),reg]}));
    const nomeOleos=(db.assinaturas&&db.assinaturas[user.id])||"";
    enviar("Controlo Óleos",[gD(),gT(),user.turma,user.id,nomeOleos,form.equipamento,form.temperatura,form.cor,form.espuma,form.cheiro,form.teste,form.acao,alterado?"ALTERADO":"OK"]);
    if(alterado){
      setDb(p=>({...p,ncs:[...(p.ncs||[]),{id:Date.now(),date:gD(),time:gT(),zona:form.equipamento,descricao:"Óleo alterado — "+[form.cor!=="normal"?"cor alterada":"",form.espuma==="sim"?"espuma":"",form.cheiro!=="normal"?"cheiro":""].filter(Boolean).join(", "),acaoCorretiva:form.acao,responsavel:user.id,turma:user.turma,estado:"aberta",professor:""}]}));
    }
    showToast(alterado?"Óleo ALTERADO — NC registada!":"Óleo OK registado!");
    setForm({equipamento:"Fritadeira 1",temperatura:"",cor:"normal",espuma:"nao",cheiro:"normal",teste:"ok",acao:"continua"});
  };
  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Controlo de Óleos</div><InfoBtn modId="oleos"/></div>
      <div style={{fontSize:12,color:GR,marginBottom:14}}>Registar o estado do óleo de fritura antes e durante a utilização</div>
      <Cd>
        <Sl lb="Equipamento" val={form.equipamento} onChange={v=>setForm(p=>({...p,equipamento:v}))} opts={["Fritadeira 1","Fritadeira 2","Wok","Outro"]}/>
        <Ip lb="Temperatura do óleo (°C)" type="number" val={form.temperatura} onChange={v=>setForm(p=>({...p,temperatura:v}))} ph="Ex: 175"/>
        <div style={{background:"#fef3c7",borderRadius:8,padding:8,marginBottom:10,fontSize:11,color:"#92400e"}}>Temperatura máxima recomendada: 180°C. Acima disso rejeitar o óleo.</div>
        <Sl lb="Cor do óleo" val={form.cor} onChange={v=>setForm(p=>({...p,cor:v}))} opts={["normal","ligeiramente escura","escura (rejeitar)"]}/>
        <Sl lb="Espuma" val={form.espuma} onChange={v=>setForm(p=>({...p,espuma:v}))} opts={["nao","sim (rejeitar)"]}/>
        <Sl lb="Cheiro" val={form.cheiro} onChange={v=>setForm(p=>({...p,cheiro:v}))} opts={["normal","intenso (rejeitar)"]}/>
        <Sl lb="Teste de oxidação" val={form.teste} onChange={v=>setForm(p=>({...p,teste:v}))} opts={["ok","alterado (rejeitar)"]}/>
        <Sl lb="Ação tomada" val={form.acao} onChange={v=>setForm(p=>({...p,acao:v}))} opts={["continua","substituido","rejeitado"]}/>
        <B lb="Registar Controlo" onClick={save} cor="#d97706"/>
      </Cd>
      {lista.map(o=><Cd key={o.id} st={{marginBottom:8,borderLeft:"3px solid "+(o.alterado?"#dc2626":"#d97706")}}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontWeight:600,fontSize:13}}>{o.equipamento}</span>
          <span style={{background:o.alterado?"#dc2626":"#16a34a",color:W,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>{o.alterado?"ALTERADO":"OK"}</span>
        </div>
        <div style={{fontSize:11,color:GR}}>{o.date} {o.time} — {o.temperatura}°C — {o.responsavel}</div>
      </Cd>)}
    </div>
  );
}

function Servico({user,db,setDb,showToast}){
  const [form,setForm]=useState({prato:"",tipo:"quente",tempInicio:gT(),temperatura:"",equipamento:""});
  const lista=(db.servico||[]).filter(s=>s.turma===user.turma&&s.date===gD()).slice(-8).reverse();
  const save=()=>{
    if(!form.prato||!form.temperatura)return;
    const tempOk=form.tipo==="quente"?parseFloat(form.temperatura)>=65:parseFloat(form.temperatura)<=4;
    const reg={...form,tempOk,responsavel:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()};
    setDb(p=>({...p,servico:[...(p.servico||[]),reg]}));
    const nomeServ=(db.assinaturas&&db.assinaturas[user.id])||"";
    enviar("Temperatura Serviço",[gD(),gT(),user.turma,user.id,nomeServ,form.prato,form.tipo,form.temperatura,tempOk?"OK":"NC",form.tempInicio,form.equipamento]);
    if(!tempOk){
      setDb(p=>({...p,ncs:[...(p.ncs||[]),{id:Date.now(),date:gD(),time:gT(),zona:"Serviço — "+form.prato,descricao:"Temp. serviço NC: "+form.temperatura+"°C ("+form.tipo+")",acaoCorretiva:"",responsavel:user.id,turma:user.turma,estado:"aberta",professor:""}]}));
    }
    showToast(tempOk?"Temperatura OK!":"Temperatura NC — verifique!");
    setForm({prato:"",tipo:"quente",tempInicio:gT(),temperatura:"",equipamento:""});
  };
  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Temperatura de Serviço</div><InfoBtn modId="servico"/></div>
      <div style={{fontSize:12,color:GR,marginBottom:10}}>Registo de temperaturas durante o serviço de refeições</div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:1,background:"#fef3c7",borderRadius:9,padding:10,textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#d97706"}}>QUENTE</div>
          <div style={{fontSize:18,fontWeight:800,color:"#d97706"}}>≥65°C</div>
          <div style={{fontSize:9,color:"#92400e"}}>Banho-maria: 90°C</div>
        </div>
        <div style={{flex:1,background:"#e0f2fe",borderRadius:9,padding:10,textAlign:"center"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#0369a1"}}>FRIO</div>
          <div style={{fontSize:18,fontWeight:800,color:"#0369a1"}}>≤4°C</div>
          <div style={{fontSize:9,color:"#0369a1"}}>Self-service: max 2h</div>
        </div>
      </div>
      <div style={{background:"#fdecea",borderRadius:9,padding:10,marginBottom:12,fontSize:11,color:"#dc2626",fontWeight:600}}>
        Alimentos em self-service/buffet: max 2 horas de exposição!
      </div>
      <Cd>
        <Ip lb="Prato / Alimento" val={form.prato} onChange={v=>setForm(p=>({...p,prato:v}))} ph="Ex: Frango assado, Salada..."/>
        <Sl lb="Tipo de serviço" val={form.tipo} onChange={v=>setForm(p=>({...p,tipo:v}))} opts={["quente","frio","self-service quente","self-service frio","buffet"]}/>
        <Ip lb="Hora de início do serviço" type="time" val={form.tempInicio} onChange={v=>setForm(p=>({...p,tempInicio:v}))}/>
        <Ip lb="Temperatura (°C)" type="number" val={form.temperatura} onChange={v=>setForm(p=>({...p,temperatura:v}))} ph={form.tipo==="quente"||form.tipo.includes("quente")?"Min. 65°C":"Max. 4°C"}/>
        <Ip lb="Equipamento (banho-maria, estufa, etc.)" val={form.equipamento} onChange={v=>setForm(p=>({...p,equipamento:v}))} ph="Ex: Banho-maria 1"/>
        {form.temperatura&&<div style={{background:parseFloat(form.temperatura)>=(form.tipo==="quente"||form.tipo.includes("quente")?65:0)&&parseFloat(form.temperatura)<=(form.tipo==="frio"||form.tipo.includes("frio")?4:999)?"#e0f2fe":"#fdecea",borderRadius:8,padding:10,marginBottom:10,fontSize:13,fontWeight:700,textAlign:"center",color:parseFloat(form.temperatura)>=(form.tipo==="quente"||form.tipo.includes("quente")?65:0)&&parseFloat(form.temperatura)<=(form.tipo==="frio"||form.tipo.includes("frio")?4:999)?"#0369a1":"#dc2626"}}>
          {form.tipo==="quente"||form.tipo.includes("quente")?parseFloat(form.temperatura)>=65?"OK — Temperatura adequada":"NC — Temperatura insuficiente! Aquecer mais.":parseFloat(form.temperatura)<=4?"OK — Temperatura adequada":"NC — Temperatura elevada! Verificar equipamento."}
        </div>}
        <B lb="Registar Temperatura" onClick={save} cor="#dc2626"/>
      </Cd>
      {lista.length>0&&<div>
        <div style={{fontSize:12,fontWeight:700,color:GR,marginBottom:8}}>Registos de hoje</div>
        {lista.map(s=><Cd key={s.id} st={{marginBottom:8,borderLeft:"3px solid "+(s.tempOk?"#16a34a":"#dc2626")}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:600,fontSize:13}}>{s.prato}</span>
            <span style={{background:s.tempOk?"#16a34a":"#dc2626",color:W,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>{s.tempOk?"OK":"NC"}</span>
          </div>
          <div style={{fontSize:11,color:GR}}>{s.tipo} — {s.temperatura}°C — início {s.tempInicio} — {s.responsavel}</div>
        </Cd>)}
      </div>}
    </div>
  );
}

function EtiquetaConservacao({produto,tipoProd,metodo,dataProducao,dataLimite,notas,responsavel}){
  const [open,setOpen]=useState(false);
  const card=(
    <div style={{background:W,borderRadius:12,border:"2px solid #0e7490",padding:20,marginBottom:14,cursor:"pointer"}} onClick={()=>setOpen(true)}>
      <div style={{fontSize:10,fontWeight:700,color:"#0e7490",textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>Etiqueta de Conservação</span>
        <span style={{fontSize:10,color:GR,fontWeight:400}}>Clica para ampliar</span>
      </div>
      <div style={{fontSize:22,fontWeight:800,color:"#0c4a6e",marginBottom:6}}>{produto}</div>
      {notas&&<div style={{fontSize:14,color:"#334155",fontStyle:"italic",marginBottom:8}}>"{notas}"</div>}
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <div style={{flex:1,background:"#f0f9ff",borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontSize:10,color:GR,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Produzido em</div>
          <div style={{fontSize:16,fontWeight:700,color:"#0c4a6e"}}>{dataProducao}</div>
        </div>
        <div style={{flex:1,background:"#fef2f2",borderRadius:8,padding:"8px 10px",border:"2px solid #fca5a5"}}>
          <div style={{fontSize:10,color:"#dc2626",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Consumir até</div>
          <div style={{fontSize:18,fontWeight:800,color:"#dc2626"}}>{dataLimite}</div>
        </div>
      </div>
      <div style={{fontSize:13,color:GR}}>Responsável: <strong style={{color:"#0c4a6e"}}>{responsavel}</strong></div>
    </div>
  );
  return(
    <div>
      {card}
      {open&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setOpen(false)}>
          <div style={{background:W,borderRadius:16,padding:30,width:"100%",maxWidth:500,border:"3px solid #0e7490"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:12,fontWeight:700,color:"#0e7490",textTransform:"uppercase",letterSpacing:1,marginBottom:16,textAlign:"center"}}>Etiqueta de Conservação HACCP</div>
            <div style={{fontSize:32,fontWeight:800,color:"#0c4a6e",marginBottom:10,textAlign:"center",lineHeight:1.2}}>{produto}</div>
            {notas&&<div style={{fontSize:18,color:"#334155",fontStyle:"italic",marginBottom:16,textAlign:"center",padding:"10px",background:"#f8fafc",borderRadius:8}}>"{notas}"</div>}
            <div style={{display:"flex",gap:12,marginBottom:16}}>
              <div style={{flex:1,background:"#f0f9ff",borderRadius:10,padding:"14px",textAlign:"center",border:"1.5px solid #bae6fd"}}>
                <div style={{fontSize:12,color:GR,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Produzido em</div>
                <div style={{fontSize:24,fontWeight:800,color:"#0c4a6e"}}>{dataProducao}</div>
              </div>
              <div style={{flex:1,background:"#fef2f2",borderRadius:10,padding:"14px",textAlign:"center",border:"2px solid #fca5a5"}}>
                <div style={{fontSize:12,color:"#dc2626",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Consumir até</div>
                <div style={{fontSize:26,fontWeight:800,color:"#dc2626"}}>{dataLimite}</div>
              </div>
            </div>
            <div style={{background:"#f8fafc",borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:12,color:GR,marginBottom:4}}>Método de conservação</div>
              <div style={{fontSize:16,fontWeight:700,color:"#0c4a6e"}}>{metodo}</div>
              <div style={{fontSize:13,color:GR,marginTop:6}}>Tipo: {tipoProd}</div>
            </div>
            <div style={{textAlign:"center",padding:"12px",background:"#e0f2fe",borderRadius:10}}>
              <div style={{fontSize:12,color:GR,marginBottom:4}}>Responsável</div>
              <div style={{fontSize:20,fontWeight:700,color:"#0c4a6e",fontStyle:"italic"}}>{responsavel}</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{width:"100%",marginTop:16,padding:14,borderRadius:10,background:"#0e7490",color:W,border:"none",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}


function ConservacaoProd({user,db,setDb,showToast}){
  const [aba,setAba]=useState("registo");
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({estado:"",temperatura:"",embalagem:"",categoria:"",produto:"",produtoManual:"",prazoManual:"",notas:"",dataProducao:new Date().toISOString().split("T")[0]});
  const nomeAluno=(db.assinaturas&&db.assinaturas[user.id])||user.id;
  const lista=(db.conservacaoProd||[]).filter(p=>p.turma===user.turma).slice(-8).reverse();

  const getPrazoEntry=()=>{
    const prod=form.produto;
    if(!prod)return null;
    const todos=Object.values(TABELA_ALIMENTOS).flat();
    return todos.find(p=>p.prod===prod)||null;
  };

  const getPrazo=()=>{
    if(form.produto==="__manual__"){
      if(!form.prazoManual)return null;
      if(form.embalagem==="vacuo"){
        const num=parseFloat(form.prazoManual);
        if(isNaN(num))return form.prazoManual+" ×5";
        return (num*5)+" dias (×5 sem vácuo)";
      }
      return form.prazoManual+" dias";
    }
    const entry=getPrazoEntry();
    if(!entry)return null;
    if(form.temperatura==="ambiente"&&form.embalagem==="vacuo")return entry.amb_vacuo;
    if(form.temperatura==="ambiente"&&form.embalagem==="normal")return entry.amb_normal;
    if(form.temperatura==="frigorifico"&&form.embalagem==="vacuo")return entry.frig_vacuo;
    if(form.temperatura==="frigorifico"&&form.embalagem==="normal")return entry.frig_normal;
    if(form.temperatura==="congelador"&&form.embalagem==="vacuo")return entry.cong_vacuo;
    if(form.temperatura==="congelador"&&form.embalagem==="normal")return entry.cong_normal;
    return null;
  };

  const calcDataLimite=()=>{
    const prazo=getPrazo();
    if(!prazo||prazo==="-"||!form.dataProducao)return null;
    const numStr=prazo.split(/[- ×]/)[0];
    const num=parseInt(numStr);
    if(isNaN(num))return null;
    const d=new Date(form.dataProducao);
    const lower=prazo.toLowerCase();
    if(lower.includes("ano"))d.setFullYear(d.getFullYear()+num);
    else if(lower.includes("mes")||lower.includes("mês"))d.setMonth(d.getMonth()+num);
    else if(lower.includes("semana"))d.setDate(d.getDate()+num*7);
    else d.setDate(d.getDate()+num);
    return d.toISOString().split("T")[0];
  };

  const save=()=>{
    const prodNome=form.produto==="__manual__"?form.produtoManual:form.produto;
    if(!prodNome)return;
    const dataLimite=calcDataLimite();
    const lote=String((db.conservacaoProd||[]).length+1).padStart(3,"0");
    const metodo=form.embalagem==="vacuo"?(form.temperatura==="frigorifico"?"vacuo_frig":form.temperatura==="congelador"?"vacuo_cong":"vacuo_amb"):(form.temperatura==="frigorifico"?"refrigeracao":form.temperatura==="congelador"?"congelacao":"ambiente");
    const reg={...form,produto:prodNome,metodo,dataLimite,lote,aluno:user.id,nomeAluno,turma:user.turma,date:gD(),time:gT(),id:Date.now()};
    setDb(p=>({...p,conservacaoProd:[...(p.conservacaoProd||[]),reg]}));
    enviar("Conservação Produtos",[gD(),gT(),user.turma,user.id,nomeAluno,form.estado,prodNome,form.categoria||"manual",form.temperatura,form.embalagem,form.notas||"",form.dataProducao,dataLimite||"",lote]);
    showToast("Produto registado! Lote: "+lote);
    setForm({estado:"",temperatura:"",embalagem:"",categoria:"",produto:"",produtoManual:"",prazoManual:"",notas:"",dataProducao:new Date().toISOString().split("T")[0]});
    setStep(1);
  };

  const dataLimite=calcDataLimite();
  const prazo=getPrazo();
  const produtosDaCategoria=form.categoria&&form.categoria!=="__manual__"?(TABELA_ALIMENTOS[form.categoria]||[]).filter(p=>{
    if(!form.estado)return true;
    if(form.estado==="cru")return p.estado==="cru";
    if(form.estado==="confeccionado")return p.estado==="confeccionado";
    return true;
  }):[];

  const stepBar=(
    <div style={{display:"flex",gap:4,marginBottom:16}}>
      {[1,2,3,4,5].map(s=>(
        <div key={s} style={{flex:1,height:5,borderRadius:3,background:step>=s?"#0e7490":"#e0f2fe",transition:"background .2s"}}/>
      ))}
    </div>
  );

  const btnStep=(label,onClick,icon="")=>(
    <button onClick={onClick} style={{width:"100%",padding:"15px 16px",marginBottom:9,borderRadius:12,border:"2px solid #bae6fd",background:"#f0f9ff",color:"#0c4a6e",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
      {icon&&<span style={{fontSize:20}}>{icon}</span>}
      <span>{label}</span>
    </button>
  );

  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,color:"#0c4a6e"}}>Conservação de Produtos</div>
        <InfoBtn modId="conservacao"/>
      </div>

      <div style={{background:"#fdecea",borderRadius:10,padding:"10px 14px",marginBottom:14,borderLeft:"4px solid #dc2626"}}>
        <div style={{fontSize:12,fontWeight:700,color:"#dc2626",marginBottom:2}}>⚠️ Atenção — Regra HACCP obrigatória</div>
        <div style={{fontSize:11,color:"#7f1d1d",lineHeight:1.6}}>Qualquer produto que esteve mais de <strong>2 horas na zona de perigo (5°C a 65°C)</strong> — buffet, banho-maria abaixo de 65°C ou temperatura ambiente — <strong>deve ser rejeitado. Não pode ser conservado.</strong></div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["registo","Registar"],["tabela","Tempos"],["vacuo","Vácuo"],["proibidos","Não utilizar o Vácuo"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setAba(id)} style={{flex:1,padding:"8px 2px",borderRadius:8,border:"2px solid "+(aba===id?"#0891b2":BE),background:aba===id?"#0891b2":LC,color:aba===id?W:"#0369a1",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",letterSpacing:.2}}>{lb}</button>
        ))}
      </div>

      {aba==="registo"&&<div>
        {stepBar}

        {step===1&&<Cd>
          <div style={{fontSize:15,fontWeight:700,color:"#0c4a6e",marginBottom:4}}>Passo 1 — Estado do produto</div>
          <div style={{fontSize:11,color:GR,marginBottom:14}}>O produto está cru/fresco ou já foi confeccionado?</div>
          {btnStep("🥬  Cru / Fresco (não processado)",()=>{setForm(p=>({...p,estado:"cru"}));setStep(2);})}
          {btnStep("🍳  Confeccionado (cozido, assado, frito, etc.)",()=>{setForm(p=>({...p,estado:"confeccionado"}));setStep(2);})}
          <div style={{background:"#fef3c7",borderRadius:9,padding:"10px 12px",marginTop:4,fontSize:11,color:"#92400e",borderLeft:"3px solid #d97706"}}>
            ♨️ Para registar <strong>Regeneração</strong> (reaquecimento), usa o módulo específico <strong>"Regeneração"</strong> no menu principal.
          </div>
          {lista.length>0&&<div style={{marginTop:14}}>
            <div style={{fontSize:11,fontWeight:700,color:GR,marginBottom:8,textTransform:"uppercase"}}>Últimos registos</div>
            {lista.map(p=><div key={p.id} style={{padding:"7px 0",borderBottom:"1px solid "+LC,display:"flex",justifyContent:"space-between"}}>
              <div><div style={{fontWeight:600,fontSize:12}}>{p.produto}</div><div style={{fontSize:10,color:GR}}>{p.temperatura} {p.embalagem==="vacuo"?"+ vácuo":""} — até {fD(p.dataLimite)}</div></div>
              <span style={{background:"#0891b2",color:W,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>L{p.lote}</span>
            </div>)}
          </div>}
        </Cd>}

        {step===2&&<Cd>
          <div style={{fontSize:15,fontWeight:700,color:"#0c4a6e",marginBottom:4}}>Passo 2 — Temperatura de conservação</div>
          <div style={{fontSize:11,color:GR,marginBottom:14}}>Estado: <strong>{form.estado==="cru"?"Cru/Fresco":"Confeccionado"}</strong></div>
          {form.estado==="cru"&&btnStep("🌡️  Temperatura ambiente — Economato",()=>{setForm(p=>({...p,temperatura:"ambiente"}));setStep(3);},"🌡️")}
          {btnStep("❄️  Frigorífico (0°C a 4°C)",()=>{setForm(p=>({...p,temperatura:"frigorifico"}));setStep(3);})}
          {btnStep("🧊  Congelador (≤ -18°C)",()=>{setForm(p=>({...p,temperatura:"congelador"}));setStep(3);})}
          {form.estado==="confeccionado"&&<div style={{background:"#fef3c7",borderRadius:8,padding:"8px 12px",marginTop:4,fontSize:11,color:"#92400e"}}>Produtos confeccionados devem sempre ir para frigorífico ou congelador — nunca temperatura ambiente!</div>}
          <button onClick={()=>setStep(1)} style={{width:"100%",padding:10,borderRadius:9,border:"1.5px solid #bae6fd",background:"transparent",color:GR,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>← Voltar</button>
        </Cd>}

        {step===3&&<Cd>
          <div style={{fontSize:15,fontWeight:700,color:"#0c4a6e",marginBottom:4}}>Passo 3 — Embalagem</div>
          <div style={{fontSize:11,color:GR,marginBottom:14}}>{form.estado==="cru"?"Cru":"Confeccionado"} • {form.temperatura==="ambiente"?"Temperatura ambiente":form.temperatura==="frigorifico"?"Frigorífico":"Congelador"}</div>
          {btnStep("🔵  Com Vácuo (sem ar) — prazo muito superior",()=>{setForm(p=>({...p,embalagem:"vacuo"}));setStep(4);})}
          {btnStep("⬜  Sem Vácuo — embalagem normal",()=>{setForm(p=>({...p,embalagem:"normal"}));setStep(4);})}
          <div style={{background:"#e0f2fe",borderRadius:8,padding:"8px 12px",marginTop:4,fontSize:11,color:"#0369a1"}}>Com vácuo o prazo é aproximadamente <strong>5× superior</strong> ao prazo sem vácuo!</div>
          <button onClick={()=>setStep(2)} style={{width:"100%",padding:10,borderRadius:9,border:"1.5px solid #bae6fd",background:"transparent",color:GR,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>← Voltar</button>
        </Cd>}

        {step===4&&<Cd>
          <div style={{fontSize:15,fontWeight:700,color:"#0c4a6e",marginBottom:4}}>Passo 4 — Produto</div>
          <div style={{fontSize:11,color:GR,marginBottom:12}}>{form.estado==="cru"?"Cru":"Confeccionado"} • {form.temperatura} • {form.embalagem==="vacuo"?"Com vácuo":"Sem vácuo"}</div>
          {!form.categoria?(
            <div>
              <div style={{fontSize:12,color:GR,marginBottom:8}}>Escolhe a categoria:</div>
              {Object.keys(TABELA_ALIMENTOS).map(cat=>{
                const filtered=(TABELA_ALIMENTOS[cat]||[]).filter(p=>form.estado==="cru"?p.estado==="cru":p.estado==="confeccionado");
                if(filtered.length===0)return null;
                return(
                  <button key={cat} onClick={()=>setForm(p=>({...p,categoria:cat}))} style={{width:"100%",padding:"12px 14px",marginBottom:6,borderRadius:10,border:"2px solid #bae6fd",background:LC,color:"#0c4a6e",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                    {cat} <span style={{fontSize:10,color:GR,fontWeight:400}}>({filtered.length} produtos)</span>
                  </button>
                );
              })}
              <button onClick={()=>{setForm(p=>({...p,categoria:"__manual__",produto:"__manual__"}));setStep(5);}} style={{width:"100%",padding:"12px 14px",marginBottom:6,borderRadius:10,border:"2px dashed #d97706",background:"#fef3c7",color:"#92400e",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                ✏️ Produto não está na lista — introduzir manualmente
              </button>
            </div>
          ):(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:"#0369a1"}}>{form.categoria}</div>
                <button onClick={()=>setForm(p=>({...p,categoria:"",produto:""}))} style={{fontSize:11,color:GR,background:"none",border:"none",cursor:"pointer"}}>← Mudar</button>
              </div>
              {produtosDaCategoria.map(item=>{
                const prazoItem=form.temperatura==="ambiente"?(form.embalagem==="vacuo"?item.amb_vacuo:item.amb_normal):form.temperatura==="frigorifico"?(form.embalagem==="vacuo"?item.frig_vacuo:item.frig_normal):(form.embalagem==="vacuo"?item.cong_vacuo:item.cong_normal);
                if(!prazoItem||prazoItem==="-")return null;
                return(
                  <button key={item.prod} onClick={()=>{setForm(p=>({...p,produto:item.prod}));setStep(5);}} style={{width:"100%",padding:"12px 14px",marginBottom:6,borderRadius:10,border:"2px solid #bae6fd",background:LC,color:"#0c4a6e",fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:600}}>{item.prod}</span>
                    <span style={{fontSize:12,color:"#0891b2",fontWeight:700}}>{prazoItem}</span>
                  </button>
                );
              })}
            </div>
          )}
          <button onClick={()=>setStep(3)} style={{width:"100%",padding:10,borderRadius:9,border:"1.5px solid #bae6fd",background:"transparent",color:GR,fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>← Voltar</button>
        </Cd>}

        {step===5&&<div>
          <Cd>
            <div style={{fontSize:15,fontWeight:700,color:"#0c4a6e",marginBottom:4}}>Passo 5 — Detalhes finais</div>
            {form.produto==="__manual__"&&<div>
              <Ip lb="Nome do produto" val={form.produtoManual} onChange={v=>setForm(p=>({...p,produtoManual:v}))} ph="Ex: Creme de cogumelos, Tarte de maçã..."/>
              <div style={{background:"#fef3c7",borderRadius:8,padding:"8px 12px",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#92400e",marginBottom:4}}>Produto não encontrado na tabela</div>
                <div style={{fontSize:11,color:"#78350f",marginBottom:8}}>Indica o prazo de conservação <strong>sem vácuo</strong> em dias. {form.embalagem==="vacuo"&&<span style={{fontWeight:700}}>A app vai calcular automaticamente ×5 para o vácuo.</span>}</div>
                <Ip lb={form.embalagem==="vacuo"?"Prazo sem vácuo (dias) — será multiplicado por 5":"Prazo de conservação (dias)"} type="number" val={form.prazoManual} onChange={v=>setForm(p=>({...p,prazoManual:v}))} ph="Ex: 3"/>
                {form.prazoManual&&form.embalagem==="vacuo"&&<div style={{background:"#0e7490",borderRadius:8,padding:"8px 12px",color:W,fontSize:12,fontWeight:600}}>Com vácuo: {parseInt(form.prazoManual)*5} dias (×5)</div>}
              </div>
            </div>}
            {form.produto!=="__manual__"&&prazo&&prazo!=="-"&&<div style={{background:"#e0f2fe",borderRadius:8,padding:10,marginBottom:10,fontSize:13,color:"#0369a1",fontWeight:600}}>
              Prazo estimado: <strong>{prazo}</strong>
            </div>}
            <Ip lb="Data de produção" type="date" val={form.dataProducao} onChange={v=>setForm(p=>({...p,dataProducao:v}))}/>
            <Ta lb="Notas (opcional)" val={form.notas} onChange={v=>setForm(p=>({...p,notas:v}))} ph="Ex: Sabor a laranja, receita especial, lote de ingredientes..."/>
          </Cd>
          {(form.produto!=="__manual__"?form.produto:form.produtoManual)&&dataLimite&&<EtiquetaConservacao produto={form.produto==="__manual__"?form.produtoManual:form.produto} tipoProd={form.estado} metodo={(form.embalagem==="vacuo"?"Vácuo + ":"")+({frigorifico:"Frigorífico",congelador:"Congelador",ambiente:"Temperatura Ambiente"}[form.temperatura]||"")} dataProducao={fD(form.dataProducao)} dataLimite={fD(dataLimite)} notas={form.notas} responsavel={nomeAluno}/>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setStep(4)} style={{flex:1,padding:12,borderRadius:10,border:"1.5px solid #bae6fd",background:"transparent",color:GR,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Voltar</button>
            <button onClick={save} disabled={form.produto==="__manual__"?(!form.produtoManual||!form.prazoManual):!form.produto} style={{flex:2,padding:12,borderRadius:10,border:"none",background:"#0891b2",color:W,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Guardar Registo</button>
          </div>
        </div>}
      </div>}

      {aba==="tabela"&&<div>
        <div style={{fontSize:11,color:GR,marginBottom:10}}>Tempos de conservação — FDA, USDA, Hamilton Beach, MR Vácuo</div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",gap:2,fontSize:9,marginBottom:6,color:GR,padding:"4px",background:"#f0f9ff",borderRadius:7}}>
          <span>Produto</span>
          <span style={{textAlign:"center"}}>Amb.</span>
          <span style={{textAlign:"center"}}>Amb.+V</span>
          <span style={{textAlign:"center"}}>Frig.</span>
          <span style={{textAlign:"center"}}>Frig.+V</span>
          <span style={{textAlign:"center"}}>Cong.</span>
          <span style={{textAlign:"center"}}>Cong.+V</span>
        </div>
        {Object.entries(TABELA_ALIMENTOS).map(([cat,items])=>(
          <div key={cat} style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#0369a1",marginBottom:4,textTransform:"uppercase",background:"#f0f9ff",padding:"6px 10px",borderRadius:7}}>{cat}</div>
            {items.map(item=>(
              <div key={item.prod} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",gap:2,padding:"5px 4px",borderBottom:"1px solid #f0f9ff",fontSize:9,alignItems:"center"}}>
                <span style={{color:"#334155",fontWeight:500,fontSize:10}}>{item.prod} <span style={{color:item.estado==="cru"?"#059669":"#dc2626",fontSize:8}}>[{item.estado}]</span></span>
                <span style={{textAlign:"center",color:"#b45309"}}>{item.amb_normal||"-"}</span>
                <span style={{textAlign:"center",color:"#d97706",fontWeight:item.amb_vacuo&&item.amb_vacuo!=="-"?700:400}}>{item.amb_vacuo||"-"}</span>
                <span style={{textAlign:"center",color:"#0369a1"}}>{item.frig_normal||"-"}</span>
                <span style={{textAlign:"center",color:"#0891b2",fontWeight:item.frig_vacuo&&item.frig_vacuo!=="-"?700:400}}>{item.frig_vacuo||"-"}</span>
                <span style={{textAlign:"center",color:"#6d28d9"}}>{item.cong_normal||"-"}</span>
                <span style={{textAlign:"center",color:"#0f766e",fontWeight:item.cong_vacuo&&item.cong_vacuo!=="-"?700:400}}>{item.cong_vacuo||"-"}</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{fontSize:10,color:GR,marginTop:8,lineHeight:1.6}}>
          V = Com Vácuo | Amb = Temperatura Ambiente | Frig = Frigorífico | Cong = Congelador<br/>
          Fonte: FDA, USDA, Hamilton Beach, MR Vácuo — valores após abertura ou produto fresco/confeccionado<br/>
          Para produtos não listados: prazo com vácuo = prazo sem vácuo ×5
        </div>
      </div>}

      {aba==="vacuo"&&<div>
        <div style={{background:"#e0f2fe",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:"#0369a1",fontWeight:600}}>
          O vácuo remove o oxigénio — sem oxigénio as bactérias aeróbias não sobrevivem. Prazo ≈ ×5 superior ao normal.
        </div>
        {Object.entries(TABELA_ALIMENTOS).map(([cat,items])=>(
          <div key={cat} style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#0369a1",marginBottom:6,textTransform:"uppercase",background:"#f0f9ff",padding:"6px 10px",borderRadius:7}}>{cat}</div>
            {items.map(item=>(
              <div key={item.prod} style={{padding:"8px 0",borderBottom:"1px solid #f0f9ff"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#0c4a6e",marginBottom:4}}>{item.prod} <span style={{fontSize:9,color:item.estado==="cru"?"#059669":"#dc2626",fontWeight:700}}>[{item.estado}]</span></div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",fontSize:10}}>
                  {item.frig_normal&&item.frig_normal!=="-"&&<div style={{background:"#f8fafc",borderRadius:5,padding:"4px 8px"}}>
                    <span style={{color:GR}}>Frig: {item.frig_normal}</span>
                    {item.frig_vacuo&&item.frig_vacuo!=="-"&&<span style={{color:"#0891b2",fontWeight:700}}> → Vácuo: {item.frig_vacuo}</span>}
                  </div>}
                  {item.cong_normal&&item.cong_normal!=="-"&&<div style={{background:"#f8fafc",borderRadius:5,padding:"4px 8px"}}>
                    <span style={{color:GR}}>Cong: {item.cong_normal}</span>
                    {item.cong_vacuo&&item.cong_vacuo!=="-"&&<span style={{color:"#0f766e",fontWeight:700}}> → Vácuo: {item.cong_vacuo}</span>}
                  </div>}
                  {item.amb_normal&&item.amb_normal!=="-"&&<div style={{background:"#fef9f0",borderRadius:5,padding:"4px 8px"}}>
                    <span style={{color:GR}}>Amb: {item.amb_normal}</span>
                    {item.amb_vacuo&&item.amb_vacuo!=="-"&&<span style={{color:"#d97706",fontWeight:700}}> → Vácuo: {item.amb_vacuo}</span>}
                  </div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>}

      {aba==="proibidos"&&<div>
        <div style={{background:"#fdecea",borderRadius:9,padding:10,marginBottom:12,fontSize:12,color:"#dc2626",fontWeight:600}}>
          ⚠️ Atenção! Estes alimentos NÃO devem ser selados a vácuo.
        </div>
        {NAO_VACUO.map(item=>(
          <Cd key={item.prod} st={{borderLeft:"4px solid #dc2626",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:"#dc2626",marginBottom:5}}>{item.prod}</div>
            <div style={{fontSize:12,color:"#334155",lineHeight:1.6}}>{item.motivo}</div>
          </Cd>
        ))}
      </div>}
    </div>
  );
}

function calcPontos(db, userId, turma){
  let pts = 0;
  const nomeAluno = db.assinaturas&&db.assinaturas[userId];
  // Each registration = 1 point
  const tempI = db.temperaturas&&Object.values(db.temperaturas).filter(t=>t.aluno===userId).length||0;
  const recs = (db.recepcao||[]).filter(r=>r.aluno===userId).length;
  const prods = (db.conservacaoProd||[]).filter(p=>p.aluno===userId).length;
  const tests = (db.testemunho||[]).filter(t=>t.responsavel===userId).length;
  const desf = (db.desinfecao||[]).filter(d=>d.responsavel===userId).length;
  const mans = (db.manutencao||[]).filter(m=>m.responsavel===userId).length;
  const ncs = (db.ncs||[]).filter(n=>n.responsavel===userId).length;
  const oleos = (db.oleos||[]).filter(o=>o.responsavel===userId).length;
  const servico = (db.servico||[]).filter(s=>s.responsavel===userId).length;
  const faltas = (db.faltas||[]).filter(f=>f.responsavel===userId).length;
  pts = tempI + recs + prods + tests + desf + mans + ncs + oleos + servico + faltas;
  // Higiene pessoal points
  if(db.higPessoal){
    Object.values(db.higPessoal).forEach(h=>{
      if(h.aluno===userId)pts++;
    });
  }
  // Higienizacao points
  if(db.higienizacao){
    Object.values(db.higienizacao).forEach(h=>{
      if(h.turma===turma&&h.registos){
        Object.values(h.registos).forEach(r=>{
          if(r.aluno===userId||r.aluno===nomeAluno)pts++;
        });
      }
      // Panos e esponjas points
      if(h.turma===turma&&h.panos){
        Object.values(h.panos).forEach(p=>{
          if(p.aluno===userId||p.aluno===nomeAluno)pts++;
        });
      }
    });
  }
  // Encerramento bonus = 5 points
  if(db.encerramento){
    Object.values(db.encerramento).forEach(e=>{
      if(e.aluno===userId)pts+=5;
    });
  }
  return pts;
}

function Ranking({db,user}){
  const [rankingSheets,setRankingSheets]=useState(null);
  const [loading,setLoading]=useState(false);
  const [erro,setErro]=useState(null);

  const carregarRanking=()=>{
    setLoading(true);
    setErro(null);
    fetch(SHEET_URL+"?tabela=Ranking")
      .then(r=>r.json())
      .then(data=>{
        if(data.ok&&data.dados&&data.dados.length>1){
          const rows=data.dados.slice(1).map(r=>({
            id:String(r[0]),
            nome:String(r[1]),
            turma:String(r[2]),
            pts:parseInt(r[3])||0,
            regs:parseInt(r[4])||0,
            enc:parseInt(r[5])||0,
            updated:String(r[6])
          })).filter(r=>r.id&&r.pts>0).sort((a,b)=>b.pts-a.pts);
          setRankingSheets(rows);
        } else {
          setRankingSheets([]);
        }
        setLoading(false);
      })
      .catch(()=>{
        setErro("Não foi possível carregar o ranking do servidor.");
        setLoading(false);
      });
  };

  // Load on mount
  useEffect(()=>{carregarRanking();},[]);

  // Use Sheets data if available, otherwise fall back to localStorage
  const usarSheets=rankingSheets&&rankingSheets.length>0;
  
  // LocalStorage fallback
  const assinaturas=db.assinaturas||{};
  const turmas=["T1","T2","T3"];
  const alunoRankingLocal=Object.entries(assinaturas).map(([id,nome])=>{
    const turma=id.split("-")[0];
    const pts=calcPontos(db,id,turma);
    return{id,nome,turma,pts};
  }).sort((a,b)=>b.pts-a.pts).slice(0,10);

  const turmaRanking=turmas.map(t=>{
    if(usarSheets){
      const membros=rankingSheets.filter(r=>r.turma===t);
      const pts=membros.reduce((s,r)=>s+r.pts,0);
      return{turma:t,pts,membros:membros.length};
    }
    const membros=Object.keys(assinaturas).filter(id=>id.startsWith(t));
    const pts=membros.reduce((sum,id)=>sum+calcPontos(db,id,t),0);
    return{turma:t,pts,membros:membros.length};
  }).sort((a,b)=>b.pts-a.pts);

  const alunoRanking=usarSheets?rankingSheets.slice(0,10):alunoRankingLocal;

  const medalhas=["1°","2°","3°"];
  const cores=["#f59e0b","#94a3b8","#d97706"];

  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,color:"#0c4a6e",marginBottom:6}}>Ranking HACCP</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:11,color:GR}}>{usarSheets?"Dados do servidor (Google Sheets)":"Dados locais — conecta para ver ranking completo"}</div>
        <button onClick={carregarRanking} disabled={loading} style={{padding:"6px 12px",borderRadius:7,border:"1.5px solid #bae6fd",background:LC,color:V,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          {loading?"A carregar...":"↻ Atualizar"}
        </button>
      </div>

      {erro&&<div style={{background:"#fdecea",borderRadius:8,padding:10,marginBottom:12,fontSize:12,color:"#dc2626"}}>{erro}</div>}

      {loading&&<div style={{textAlign:"center",padding:30,color:GR,fontSize:13}}>A carregar ranking do servidor...</div>}

      {!loading&&<div>
        <div style={{fontWeight:700,fontSize:13,color:V,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>Ranking de Turmas</div>
        {turmaRanking.map((t,i)=>(
          <div key={t.turma} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,background:i===0?"linear-gradient(135deg,#0e7490,#0891b2)":W,marginBottom:8,boxShadow:"0 2px 8px rgba(14,116,144,.1)",border:"1px solid #e0f2fe"}}>
            <div style={{width:32,height:32,borderRadius:8,background:i===0?"rgba(255,255,255,.2)":cores[i]||LC,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:W,flexShrink:0}}>{medalhas[i]||i+1+"°"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:800,color:i===0?W:"#0c4a6e"}}>Turma {t.turma}</div>
              <div style={{fontSize:11,color:i===0?"rgba(255,255,255,.7)":GR}}>{t.membros} aluno(s)</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:22,fontWeight:800,color:i===0?W:V}}>{t.pts}</div>
              <div style={{fontSize:10,color:i===0?"rgba(255,255,255,.7)":GR}}>pontos</div>
            </div>
          </div>
        ))}

        <div style={{fontWeight:700,fontSize:13,color:V,marginBottom:10,marginTop:14,textTransform:"uppercase",letterSpacing:.5}}>Top 10 Alunos</div>
        {alunoRanking.length===0&&<div style={{textAlign:"center",padding:20,color:GR,fontSize:13}}>Ainda sem registos suficientes.</div>}
        {alunoRanking.map((a,i)=>{
          const nomeDisplay=a.nome?(a.nome.split(" ")[0].charAt(0).toUpperCase()+a.nome.split(" ")[0].slice(1)+" "+((a.nome.split(" ")[1]||"").charAt(0).toUpperCase())+(a.nome.split(" ")[1]?".":"")):a.id;
          return(
            <div key={a.id||i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:i===0?"linear-gradient(135deg,#0e7490,#0891b2)":i<3?"#f0f9ff":W,marginBottom:6,border:"1px solid "+(i===0?"transparent":"#e0f2fe")}}>
              <div style={{width:28,height:28,borderRadius:7,background:i===0?"rgba(255,255,255,.2)":i===1?"#94a3b8":i===2?"#d97706":"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:i<3?W:"#0369a1",flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:i===0?W:"#0c4a6e"}}>{nomeDisplay}</div>
                <div style={{fontSize:10,color:i===0?"rgba(255,255,255,.7)":GR}}>Turma {a.turma}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:800,color:i===0?W:V}}>{a.pts}</div>
                <div style={{fontSize:9,color:i===0?"rgba(255,255,255,.7)":GR}}>pontos</div>
              </div>
            </div>
          );
        })}
        <div style={{marginTop:10,fontSize:10,color:GR,textAlign:"center"}}>1 ponto por registo • 5 pontos bónus por encerramento completo</div>
        {usarSheets&&rankingSheets.length>0&&<div style={{fontSize:10,color:GR,textAlign:"center",marginTop:4}}>Última atualização: {rankingSheets[0]?.updated||"-"}</div>}
      </div>}
    </div>
  );
}

const INFO_HACCP={
  higienePessoal:{
    titulo:"Higiene Pessoal — HACCP",
    texto:`A higiene pessoal é a primeira linha de defesa na segurança alimentar. Os manipuladores de alimentos são uma das principais fontes de contaminação.

LAVAGEM DAS MÃOS: Lavar durante pelo menos 20 segundos com água quente e sabão: antes de manipular alimentos, após usar a casa de banho, após tocar em alimentos crus, após assoar, tossir ou espirrar.

FARDA: Usar sempre avental limpo, touca ou rede no cabelo, calçado adequado e antiderrapante.

PROIBIÇÕES: Anéis, pulseiras, relógios, brincos, unhas postiças e pestanas postiças são PROIBIDOS. Também é proibido comer, beber, fumar ou mascar pastilha na cozinha.

DOENÇA: Não trabalhar com alimentos se tiver diarreia, vómitos, febre, tosse intensa ou feridas infetadas.`,
    fonte:"Regulamento (CE) n.º 852/2004 | AHRESP Código de Boas Práticas"
  },
  temperaturas:{
    titulo:"Controlo de Temperaturas — HACCP",
    texto:`O controlo de temperatura é um dos pontos críticos mais importantes do HACCP.

ZONA DE PERIGO: Entre 5°C e 65°C as bactérias multiplicam-se rapidamente. Os alimentos devem estar o menor tempo possível nesta zona.

REFRIGERAÇÃO: 0°C a 4°C — retarda o crescimento bacteriano mas não o elimina.
CONGELAÇÃO: ≤ -18°C — suspende o crescimento bacteriano.

FREQUÊNCIA: Registar no início e no final de cada aula. Em caso de NC, registar imediatamente e reportar ao professor.`,
    fonte:"Regulamento (CE) n.º 852/2004 | DGAV"
  },
  conservacao:{
    titulo:"Conservação de Produtos — HACCP",
    texto:`A correta conservação dos alimentos é essencial para prevenir intoxicações alimentares.

REGRA DAS 2 HORAS: Qualquer produto que esteve mais de 2 horas na zona de perigo (5°C a 65°C) deve ser rejeitado — não pode ser conservado.

VÁCUO: A embalagem a vácuo remove o oxigénio, impedindo o crescimento de bactérias aeróbias. O prazo de validade é aproximadamente 5× superior ao normal.

ETIQUETAGEM: Todo o produto armazenado deve ter etiqueta com: nome do produto, data de produção, data limite de consumo e responsável.`,
    fonte:"FDA Food Safety | USDA | Hamilton Beach | MR Vácuo | Diário do Chef"
  },
  regeneracao:{
    titulo:"Regeneração/Cook-Chill — Reaquecimento Seguro",
    texto:`A regeneração é o reaquecimento de alimentos já confecionados e refrigerados/congelados para consumo quente, garantindo a sua segurança e qualidade organolética.

TEMPERATURA MÍNIMA OBRIGATÓRIA: ≥ 75°C no centro do alimento, no prazo máximo de 60 minutos após retirado do equipamento de frio.

EQUIPAMENTOS PERMITIDOS: Forno convector/regenerador (com ou sem vapor), fogão/marmita (sopas), micro-ondas (doses individuais — 3 a 6 minutos na potência máxima 1000W).

ONDE MONITORIZAR: Temperatura no interior de TODOS os componentes — componente principal, guarnição, legumes e sopa.

REGRAS OBRIGATÓRIAS:
• Pré-aquecer o equipamento ≈ 10 minutos antes
• Temperatura ≥ 75°C no centro — usar termómetro sonda
• Máximo 60 minutos desde a saída do frio até atingir 75°C
• Após regeneração: servir em máximo 30 minutos
• Manter a ≥ 65°C até ao momento de servir
• NUNCA recongelar após regenerar
• Refeições não consumidas após regeneração → destruir obrigatoriamente

TEMPERATURA NÃO CONFORME:
• Se < 75°C → voltar ao calor até atingir 75°C
• Se > 60 minutos → reportar imediatamente por escrito ao responsável

MICROONDAS: 3 a 6 minutos por dose na potência máxima (1000W). Verificar que aquece uniformemente — mexer a meio e verificar temperatura em vários pontos.`,
    fonte:"Procedimento R-020/B v.4 (22/03/2018) | USDA Food Safety | AHRESP | Regulamento (CE) n.º 852/2004"
  },
  testemunho:{
    titulo:"Amostra Testemunho — HACCP",
    texto:`A amostra testemunho é uma amostra de cada refeição guardada durante 72 horas para análise em caso de suspeita de intoxicação alimentar.

QUANTIDADE: Mínimo 150g de cada prato servido.
TEMPERATURA: 0°C a 3°C (frigorífico dedicado).
PRAZO: Guardar durante 72 horas após o serviço.
DESTRUIÇÃO: Após 72 horas, destruir a amostra.

OBRIGATORIEDADE: Em estabelecimentos de restauração coletiva é obrigatório por lei.`,
    fonte:"Regulamento (CE) n.º 852/2004 | ASAE"
  },
  desinfecao:{
    titulo:"Desinfeção de Alimentos para Consumo em Cru",
    texto:`Todos os produtos hortícolas e frutícolas servidos crus devem ser lavados e desinfetados.

PROCEDIMENTO:
1. Rejeitar folhas exteriores e partes danificadas
2. Lavar em água fria corrente
3. Mergulhar em solução desinfetante apropriada
4. Passar novamente por água fria corrente
5. Guardar no frio até ao momento de servir

PRODUTOS: Usar desinfetante alimentar aprovado, seguindo as indicações de dosagem e tempo de contacto.`,
    fonte:"AHRESP Código de Boas Práticas | Regulamento (CE) n.º 852/2004"
  },
  higienizacao:{
    titulo:"Higienização de Equipamentos e Utensílios",
    texto:`A higienização correta dos equipamentos e superfícies é fundamental para prevenir contaminações cruzadas.

PANOS E ESPONJAS: Devem ser colocados em solução desinfetante no início e no final de cada aula. São uma das principais fontes de contaminação cruzada.

PROCEDIMENTO: Limpar → Lavar → Desinfetar → Secar
Nunca usar o mesmo pano em zonas diferentes sem desinfetar.`,
    fonte:"AHRESP Código de Boas Práticas | Regulamento (CE) n.º 852/2004"
  },
  oleos:{
    titulo:"Controlo de Óleos de Fritura",
    texto:`O aquecimento prolongado do óleo a altas temperaturas origina compostos químicos tóxicos.

SINAIS DE ÓLEO ALTERADO: Cor escura, espuma excessiva, cheiro intenso ou fumo a temperaturas normais.

TEMPERATURA MÁXIMA: Nunca ultrapassar 180°C.
FILTRAGEM: Filtrar após cada utilização.
PROIBIÇÃO: Nunca misturar óleo novo com usado.

TESTE: Usar tiras de teste OleoTest ou equipamento Testo 270.
Verde (<17% CPT) = OK | Amarelo (17-24%) = atenção | Vermelho (>24%) = rejeitar.`,
    fonte:"ASAE | Regulamento (CE) n.º 852/2004 | AHRESP"
  },
  servico:{
    titulo:"Temperatura de Serviço — HACCP",
    texto:`Durante o serviço os alimentos devem manter temperaturas seguras fora da zona de perigo.

QUENTE: ≥ 65°C — banho-maria a 80-90°C para garantir temperatura interior > 65°C.
FRIO: ≤ 4°C — em equipamento de frio adequado.

REGRA DAS 2 HORAS: Em self-service ou buffet, os alimentos não podem estar expostos mais de 2 horas. Após esse tempo devem ser rejeitados.

MONITORIZAÇÃO: Verificar a temperatura regularmente durante o serviço.`,
    fonte:"AHRESP Código de Boas Práticas | Regulamento (CE) n.º 852/2004"
  },
  naoConf:{
    titulo:"Não Conformidades — HACCP",
    texto:`Uma não conformidade é qualquer desvio aos procedimentos de segurança alimentar estabelecidos.

AÇÃO IMEDIATA: Identificar, isolar e corrigir o problema.
REGISTO: Registar sempre a NC, a ação corretiva tomada e o resultado.
VALIDAÇÃO: O professor deve validar a resolução da NC.

EXEMPLOS: Temperatura fora dos limites, produto com validade expirada, higienização incompleta, contaminação cruzada.`,
    fonte:"HACCP — Análise de Perigos e Pontos Críticos de Controlo | Regulamento (CE) n.º 852/2004"
  },
  encerramento:{
    titulo:"Encerramento da Aula — HACCP",
    texto:`O encerramento correto da cozinha no final de cada aula é essencial para garantir a segurança alimentar e a higiene do espaço.

VERIFICAÇÕES OBRIGATÓRIAS:
• Todos os equipamentos desligados
• Frigoríficos verificados e temperaturas registadas
• Higienização completa de bancadas e equipamentos
• Lixos separados e despejados
• Panos e esponjas em solução desinfetante
• Economatos organizados
• Validação do professor`,
    fonte:"AHRESP Código de Boas Práticas | Regulamento (CE) n.º 852/2004"
  },
  manutencao:{
    titulo:"Manutenção e Avarias — HACCP",
    texto:`A manutenção preventiva dos equipamentos é essencial para garantir o funcionamento correto e a segurança alimentar.

AVARIA: Reportar imediatamente ao professor e registar na app.
EQUIPAMENTO EM FALHA: Isolar e sinalizar. Não utilizar até reparação.
MANUTENÇÃO PREVENTIVA: Verificar periodicamente o estado dos equipamentos, especialmente os de frio.`,
    fonte:"Regulamento (CE) n.º 852/2004 | ASAE"
  },
};


function InfoBtn({modId}){
  const [open,setOpen]=useState(false);
  const info=INFO_HACCP[modId];
  if(!info)return null;
  return(
    <div style={{display:"inline-block"}}>
      <button onClick={()=>setOpen(!open)} style={{padding:"5px 12px",borderRadius:20,background:"#0e7490",border:"none",color:W,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:.3,textTransform:"uppercase"}}>Saber mais</button>
      {open&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setOpen(false)}>
          <div style={{background:W,borderRadius:"20px 20px 0 0",padding:22,width:"100%",maxWidth:600,maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:"#bae6fd",borderRadius:2,margin:"0 auto 16px"}}></div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#0e7490",flex:1,paddingRight:10,lineHeight:1.3}}>{info.titulo}</div>
              <button onClick={()=>setOpen(false)} style={{width:28,height:28,borderRadius:"50%",background:"#f0f9ff",border:"none",fontSize:18,cursor:"pointer",flexShrink:0,color:"#0369a1",fontWeight:700}}>×</button>
            </div>
            <div style={{fontSize:13,color:"#334155",lineHeight:1.8,marginBottom:14,whiteSpace:"pre-line"}}>{info.texto}</div>
            <div style={{fontSize:10,color:GR,borderTop:"1px solid #e0f2fe",paddingTop:10,marginTop:4}}>Fonte: {info.fonte}</div>
          </div>
        </div>
      )}
    </div>
  );
}



function Regeneracao({user,db,setDb,showToast}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({
    prato:"",tipoProd:"",
    horaInicio:gT(),horaFim:"",
    tempFinal:"",tempServico:"",
    equipamento:"",obs:"",
    conservacaoAnterior:"refrigerado",
    dataConfeacao:new Date().toISOString().split("T")[0],
    embalagem:"normal"
  });
  const lista=(db.regeneracao||[]).filter(r=>r.turma===user.turma&&r.date===gD()).slice(-5).reverse();
  const nomeAluno=(db.assinaturas&&db.assinaturas[user.id])||"";

  const calcTempo=()=>{
    if(!form.horaInicio||!form.horaFim)return null;
    const [h1,m1]=form.horaInicio.split(":").map(Number);
    const [h2,m2]=form.horaFim.split(":").map(Number);
    return(h2*60+m2)-(h1*60+m1);
  };

  const tempOk=form.tempFinal&&parseFloat(form.tempFinal)>=75;
  const tempServicoOk=form.tempServico&&parseFloat(form.tempServico)>=65;
  const tempoDecorrido=calcTempo();
  const tempoOk=tempoDecorrido!==null&&tempoDecorrido<=60;

  const calcValidade=()=>{
    if(!form.dataConfeacao)return null;
    const d=new Date(form.dataConfeacao);
    const base=form.conservacaoAnterior==="congelado"?30:5;
    const dias=form.embalagem==="vacuo"?base*5:base;
    d.setDate(d.getDate()+dias);
    return{dias,data:d.toISOString().split("T")[0]};
  };
  const validade=calcValidade();
  const dentroValidade=validade&&new Date()<=new Date(validade.data);

  const save=()=>{
    if(!form.prato||!form.tempFinal)return;
    const reg={...form,tempOk,tempServicoOk,tempoDecorrido,tempoOk,dentroValidade,responsavel:user.id,nomeAluno,turma:user.turma,date:gD(),time:gT(),id:Date.now()};
    setDb(p=>({...p,regeneracao:[...(p.regeneracao||[]),reg]}));
    enviar("Regeneração",[gD(),gT(),user.turma,user.id,nomeAluno,form.prato,form.tipoProd,form.tempFinal,tempOk?"OK":"NC",form.horaInicio,form.horaFim,tempoDecorrido?tempoDecorrido+"min":"",form.tempServico,tempServicoOk?"OK":"NC",form.equipamento,form.conservacaoAnterior,form.embalagem,form.dataConfeacao,form.obs]);
    if(!tempOk)setDb(p=>({...p,ncs:[...(p.ncs||[]),{id:Date.now(),date:gD(),time:gT(),zona:"Regeneração — "+form.prato,descricao:"Temp. NC: "+form.tempFinal+"°C (mín. 75°C)",acaoCorretiva:"Continuar a aquecer até 75°C",responsavel:user.id,turma:user.turma,estado:"aberta",professor:""}]}));
    if(tempoDecorrido&&tempoDecorrido>60)setDb(p=>({...p,ncs:[...(p.ncs||[]),{id:Date.now()+1,date:gD(),time:gT(),zona:"Regeneração — "+form.prato,descricao:"Tempo NC: "+tempoDecorrido+"min (máx. 60min)",acaoCorretiva:"Reportar ao responsável",responsavel:user.id,turma:user.turma,estado:"aberta",professor:""}]}));
    showToast(tempOk?"Regeneração registada!":"NC criada!");
    setForm({prato:"",tipoProd:"",horaInicio:gT(),horaFim:"",tempFinal:"",tempServico:"",equipamento:"",obs:"",conservacaoAnterior:"refrigerado",dataConfeacao:new Date().toISOString().split("T")[0],embalagem:"normal"});
    setStep(1);
  };

  const stepBar=(
    <div style={{display:"flex",gap:4,marginBottom:16}}>
      {[1,2,3,4,5].map(s=>(
        <div key={s} style={{flex:1,height:5,borderRadius:3,background:step>=s?"#d97706":"#fef3c7",transition:"background .2s"}}/>
      ))}
    </div>
  );

  const btnGrande=(label,onClick,icon="",cor="#f0f9ff",corTxt="#0c4a6e")=>(
    <button onClick={onClick} style={{width:"100%",padding:"18px 16px",marginBottom:10,borderRadius:14,border:"2px solid #e0f2fe",background:cor,color:corTxt,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
      {icon&&<span style={{fontSize:24}}>{icon}</span>}
      <span>{label}</span>
    </button>
  );

  return(
    <div style={{padding:15}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,color:"#0c4a6e"}}>Regeneração/Cook-Chill</div>
        <InfoBtn modId="regeneracao"/>
      </div>

      {stepBar}

      {/* PASSO 1 — Verificar validade */}
      {step===1&&<div>
        <Cd>
          <div style={{fontSize:16,fontWeight:700,color:"#0c4a6e",marginBottom:6}}>Passo 1 — O produto está dentro do prazo?</div>
          <div style={{fontSize:12,color:GR,marginBottom:14}}>Indica quando foi confeccionado e como foi guardado</div>
          <Ip lb="Data de confeção" type="date" val={form.dataConfeacao} onChange={v=>setForm(p=>({...p,dataConfeacao:v}))}/>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {["refrigerado","congelado"].map(v=>(
              <button key={v} onClick={()=>setForm(p=>({...p,conservacaoAnterior:v}))} style={{flex:1,padding:"14px 8px",borderRadius:11,border:"2px solid "+(form.conservacaoAnterior===v?"#d97706":"#e0f2fe"),background:form.conservacaoAnterior===v?"#fef3c7":"#f0f9ff",color:form.conservacaoAnterior===v?"#92400e":"#0c4a6e",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                {v==="refrigerado"?"❄️ Frigorífico":"🧊 Congelador"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {["normal","vacuo"].map(v=>(
              <button key={v} onClick={()=>setForm(p=>({...p,embalagem:v}))} style={{flex:1,padding:"14px 8px",borderRadius:11,border:"2px solid "+(form.embalagem===v?"#d97706":"#e0f2fe"),background:form.embalagem===v?"#fef3c7":"#f0f9ff",color:form.embalagem===v?"#92400e":"#0c4a6e",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                {v==="normal"?"⬜ Sem Vácuo":"🔵 Com Vácuo"}
              </button>
            ))}
          </div>
          {validade&&<div style={{background:dentroValidade?"#e0f2fe":"#fdecea",borderRadius:12,padding:"14px 16px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:dentroValidade?"#0369a1":"#dc2626",marginBottom:4}}>
              {dentroValidade?"✅ DENTRO DO PRAZO":"❌ FORA DO PRAZO"}
            </div>
            <div style={{fontSize:13,color:dentroValidade?"#0369a1":"#dc2626",fontWeight:600}}>
              {dentroValidade?`Válido até ${fD(validade.data)}`:`Venceu em ${fD(validade.data)} — REJEITAR!`}
            </div>
            <div style={{fontSize:11,color:GR,marginTop:4}}>{form.embalagem==="vacuo"?`Com vácuo: ${validade.dias} dias`:`Sem vácuo: ${validade.dias} dias`}</div>
          </div>}
          {dentroValidade&&<button onClick={()=>setStep(2)} style={{width:"100%",padding:14,borderRadius:11,border:"none",background:"#d97706",color:W,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Continuar →</button>}
          {validade&&!dentroValidade&&<div style={{background:"#fdecea",borderRadius:10,padding:12,textAlign:"center",fontSize:13,fontWeight:700,color:"#dc2626"}}>Produto fora do prazo — não pode ser regenerado!</div>}
        </Cd>
        {lista.length>0&&<div>
          <div style={{fontSize:11,fontWeight:700,color:GR,marginBottom:8,textTransform:"uppercase"}}>Registos de hoje</div>
          {lista.map(r=><div key={r.id} style={{padding:"8px 0",borderBottom:"1px solid #e0f2fe",display:"flex",justifyContent:"space-between"}}>
            <div><div style={{fontWeight:600,fontSize:13}}>{r.prato}</div><div style={{fontSize:11,color:GR}}>{r.tempFinal}°C • {r.tempoDecorrido}min</div></div>
            <span style={{background:r.tempOk?"#16a34a":"#dc2626",color:W,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700}}>{r.tempOk?"OK":"NC"}</span>
          </div>)}
        </div>}
      </div>}

      {/* PASSO 2 — Que prato */}
      {step===2&&<Cd>
        <div style={{fontSize:16,fontWeight:700,color:"#0c4a6e",marginBottom:6}}>Passo 2 — Qual é o prato?</div>
        <Ip lb="Nome do prato" val={form.prato} onChange={v=>setForm(p=>({...p,prato:v}))} ph="Ex: Frango assado, Sopa..."/>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {["Aves","Carne","Peixe","Sopa","Legumes","Outro"].map(t=>(
            <button key={t} onClick={()=>setForm(p=>({...p,tipoProd:t}))} style={{padding:"10px 14px",borderRadius:10,border:"2px solid "+(form.tipoProd===t?"#d97706":"#e0f2fe"),background:form.tipoProd===t?"#fef3c7":"#f0f9ff",color:form.tipoProd===t?"#92400e":"#0c4a6e",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              {t}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setStep(1)} style={{flex:1,padding:12,borderRadius:10,border:"1.5px solid #e0f2fe",background:"transparent",color:GR,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Voltar</button>
          <button onClick={()=>{if(form.prato)setStep(3);}} disabled={!form.prato} style={{flex:2,padding:12,borderRadius:10,border:"none",background:form.prato?"#d97706":"#ccc",color:W,fontSize:14,fontWeight:700,cursor:form.prato?"pointer":"not-allowed",fontFamily:"inherit"}}>Continuar →</button>
        </div>
      </Cd>}

      {/* PASSO 3 — Equipamento e horas */}
      {step===3&&<Cd>
        <div style={{fontSize:16,fontWeight:700,color:"#0c4a6e",marginBottom:6}}>Passo 3 — Como vais aquecer?</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
          {["Forno combinado","Fogão/Marmita","Micro-ondas","Banho-maria"].map(eq=>(
            <button key={eq} onClick={()=>setForm(p=>({...p,equipamento:eq}))} style={{padding:"12px 14px",borderRadius:11,border:"2px solid "+(form.equipamento===eq?"#d97706":"#e0f2fe"),background:form.equipamento===eq?"#fef3c7":"#f0f9ff",color:form.equipamento===eq?"#92400e":"#0c4a6e",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              {eq}
            </button>
          ))}
        </div>
        <div style={{background:"#fef3c7",borderRadius:9,padding:"10px 12px",marginBottom:14,fontSize:11,color:"#92400e"}}>
          ⏱ Tens máximo <strong>60 minutos</strong> desde que retiraste do frio até atingir 75°C
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}><Ip lb="Hora de início" type="time" val={form.horaInicio} onChange={v=>setForm(p=>({...p,horaInicio:v}))}/></div>
          <div style={{flex:1}}><Ip lb="Hora de fim" type="time" val={form.horaFim} onChange={v=>setForm(p=>({...p,horaFim:v}))}/></div>
        </div>
        {tempoDecorrido!==null&&<div style={{background:tempoOk?"#e0f2fe":"#fdecea",borderRadius:9,padding:10,marginBottom:10,fontSize:13,fontWeight:700,textAlign:"center",color:tempoOk?"#0369a1":"#dc2626"}}>
          ⏱ {tempoDecorrido} minutos {tempoOk?"✅ OK":"❌ NC — ultrapassou 60 min!"}
        </div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setStep(2)} style={{flex:1,padding:12,borderRadius:10,border:"1.5px solid #e0f2fe",background:"transparent",color:GR,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Voltar</button>
          <button onClick={()=>setStep(4)} style={{flex:2,padding:12,borderRadius:10,border:"none",background:"#d97706",color:W,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Continuar →</button>
        </div>
      </Cd>}

      {/* PASSO 4 — Temperaturas */}
      {step===4&&<Cd>
        <div style={{fontSize:16,fontWeight:700,color:"#0c4a6e",marginBottom:6}}>Passo 4 — Temperaturas</div>
        <div style={{background:"#fdecea",borderRadius:9,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#dc2626",fontWeight:700,textAlign:"center"}}>
          Temperatura mínima no CENTRO do alimento: <span style={{fontSize:18}}>75°C</span>
        </div>
        <Ip lb="🌡️ Temperatura no centro do alimento (°C)" type="number" val={form.tempFinal} onChange={v=>setForm(p=>({...p,tempFinal:v}))} ph="Mínimo 75°C"/>
        {form.tempFinal&&<div style={{background:tempOk?"#e0f2fe":"#fdecea",borderRadius:12,padding:"14px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:28,fontWeight:800,color:tempOk?"#0369a1":"#dc2626"}}>{form.tempFinal}°C</div>
          <div style={{fontSize:14,fontWeight:700,color:tempOk?"#0369a1":"#dc2626",marginTop:4}}>{tempOk?"✅ OK — Temperatura atingida!":"❌ Continua a aquecer!"}</div>
        </div>}
        <Ip lb="🌡️ Temperatura de serviço (°C)" type="number" val={form.tempServico} onChange={v=>setForm(p=>({...p,tempServico:v}))} ph="Mínimo 65°C"/>
        {form.tempServico&&<div style={{background:tempServicoOk?"#e0f2fe":"#fdecea",borderRadius:9,padding:10,marginBottom:10,fontSize:13,fontWeight:700,textAlign:"center",color:tempServicoOk?"#0369a1":"#dc2626"}}>
          {tempServicoOk?"✅ Serviço OK — ≥65°C":"❌ Temperatura de serviço insuficiente!"}
        </div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setStep(3)} style={{flex:1,padding:12,borderRadius:10,border:"1.5px solid #e0f2fe",background:"transparent",color:GR,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Voltar</button>
          <button onClick={()=>{if(form.tempFinal)setStep(5);}} disabled={!form.tempFinal} style={{flex:2,padding:12,borderRadius:10,border:"none",background:form.tempFinal?"#d97706":"#ccc",color:W,fontSize:14,fontWeight:700,cursor:form.tempFinal?"pointer":"not-allowed",fontFamily:"inherit"}}>Continuar →</button>
        </div>
      </Cd>}

      {/* PASSO 5 — Confirmar */}
      {step===5&&<div>
        <Cd>
          <div style={{fontSize:16,fontWeight:700,color:"#0c4a6e",marginBottom:14}}>Passo 5 — Confirmar</div>
          <div style={{background:tempOk&&tempoOk?"#e0f2fe":"#fdecea",borderRadius:12,padding:16,marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:800,color:tempOk&&tempoOk?"#0369a1":"#dc2626"}}>{tempOk&&tempoOk?"✅ REGENERAÇÃO OK":"❌ NÃO CONFORME"}</div>
          </div>
          <div style={{fontSize:12,color:"#334155",lineHeight:1.8}}>
            <div>🍽️ <strong>{form.prato}</strong> — {form.tipoProd}</div>
            <div>🌡️ Temperatura: <strong style={{color:tempOk?"#0369a1":"#dc2626"}}>{form.tempFinal}°C</strong></div>
            <div>⏱ Tempo: <strong style={{color:tempoOk?"#0369a1":"#dc2626"}}>{tempoDecorrido}min</strong></div>
            <div>🍽️ Serviço: <strong style={{color:tempServicoOk?"#0369a1":"#dc2626"}}>{form.tempServico}°C</strong></div>
          </div>
          <div style={{background:"#fef3c7",borderRadius:9,padding:"10px 12px",marginTop:10,fontSize:11,color:"#92400e",fontWeight:600}}>
            Servir em máx. 30 min • manter ≥65°C • não recongelar • sobras: destruir!
          </div>
          <Ta lb="Observações (opcional)" val={form.obs} onChange={v=>setForm(p=>({...p,obs:v}))} ph="Notas..."/>
        </Cd>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setStep(4)} style={{flex:1,padding:12,borderRadius:10,border:"1.5px solid #e0f2fe",background:"transparent",color:GR,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Voltar</button>
          <button onClick={save} style={{flex:2,padding:14,borderRadius:11,border:"none",background:"#d97706",color:W,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Guardar Registo</button>
        </div>
      </div>}
    </div>
  );
}

export default function App(){
  const [user,setUser]=useState(null);
  const [mod,setMod]=useState(null);
  const [showRanking,setShowRanking]=useState(false);
  const [db,setDb]=useState(()=>{try{const s=localStorage.getItem("kf_db");return s?JSON.parse(s):{}}catch{return{}}});
  const [toast,setToast]=useState(null);
  const showToast=useCallback(msg=>setToast(msg),[]);
  useEffect(()=>{try{localStorage.setItem("kf_db",JSON.stringify(db));}catch{}},[db]);
  const logout=()=>{setUser(null);setMod(null);};
  const back=()=>setMod(null);
  if(!user)return <Login onLogin={u=>{setUser(u);setMod(null);}} db={db} showRanking={showRanking} setShowRanking={setShowRanking}/>;
  if(user.tipo==="aluno"&&!(db.assinaturas&&db.assinaturas[user.id])){
    return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f9ff,#e0f2fe)",maxWidth:600,margin:"0 auto"}}><Hd user={user} onOut={()=>setUser(null)}/><AssinaturaDigital onSave={nome=>{setDb(p=>({...p,assinaturas:{...(p.assinaturas||{}),[user.id]:nome}}));}}/></div>);
  }
  const p={user,db,setDb,showToast,setModule:setMod};
  let page;
  if(mod==="temperaturas")page=<Temperaturas {...p}/>;
  else if(mod==="recepcao")page=<Recepcao {...p}/>;
  else if(mod==="producao")page=<Producao {...p}/>;
  else if(mod==="testemunho")page=<Testemunho {...p}/>;
  else if(mod==="desinfecao")page=<Desinfecao {...p}/>;
  else if(mod==="manutencao")page=<Manutencao {...p}/>;
  else if(mod==="higienizacao")page=<Higienizacao {...p}/>;
  else if(mod==="equipamentos")page=<Equipamentos {...p}/>;
  else if(mod==="conservacao")page=<ConservacaoProd {...p}/>;
  else if(mod==="regeneracao")page=<Regeneracao {...p}/>;
  else if(mod==="ranking")page=<Ranking db={db}/>;
  else if(mod==="faltas")page=<Faltas {...p}/>;
  else if(mod==="higienePessoal")page=<HigienePessoal {...p}/>;
  else if(mod==="oleos")page=<Oleos {...p}/>;
  else if(mod==="servico")page=<Servico {...p}/>;
  else if(mod==="naoConf")page=<NaoConf {...p}/>;
  else if(mod==="encerramento")page=<Encerramento {...p}/>;
  else if(user.tipo==="professor")page=<Professor {...p}/>;
  else if(user.tipo==="coord")page=<Coordenadora {...p}/>;
  else if(user.tipo==="auxiliar")page=<Auxiliar {...p}/>;
  else page=<DashAluno {...p}/>;
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f9ff,#e0f2fe)",maxWidth:600,margin:"0 auto"}}>
      <Hd user={user} onOut={logout} onRanking={()=>setMod("ranking")}/>
      <div style={{paddingBottom:36}}>
        {mod&&<div style={{padding:"11px 15px 3px"}}><button onClick={back} style={{background:"none",border:"1.5px solid "+BE,color:V,fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:7,padding:"5px 13px",fontFamily:"inherit"}}>Voltar</button></div>}
        {page}
      </div>
      {toast&&<Tt msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
