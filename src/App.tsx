import { useState, useEffect, useCallback } from "react";

// Load Barlow Condensed font
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500;600&display=swap";
document.head.appendChild(fontLink);

const fontStyle = document.createElement("style");
fontStyle.textContent = "* { font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif !important; } input, textarea, select { font-family: 'Barlow', sans-serif !important; }";
document.head.appendChild(fontStyle);



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
"Copa":["Loica lavada e arrumada","Sem utensilios por lavar","Cuba higienizada","Maq. lavagem 1 drenada, porta aberta e higienizada","Maq. lavagem 2 drenada, porta aberta e higienizada","Inoxes em condicoes","Panos em solucao desinfetante"],
"Economatos":["Economato mat.-primas organizado","Mat.-primas devidamente armazenadas","Sem mat.-primas no chao","Economato material organizado","Material arrumado (nao no chao)","Chao economato em condicoes"],
"Residuos":["Lixo organico despejado no local correto","Lixo reciclavel separado corretamente","Caixotes lavados e higienizados","Sacos novos colocados"],
"Carrinhos":["Carrinho 1 limpo e higienizado","Carrinho 2 limpo e higienizado","Carrinhos arrumados no local correto"]
};
const PC=[{id:"fog",lb:"Fogões OK"},{id:"for",lb:"Fornos OK"},{id:"arc",lb:"Ar cond. OK"},{id:"cop",lb:"Copa OK"},{id:"fri",lb:"Frio OK"},{id:"hig",lb:"Higieniz. OK"},{id:"lix",lb:"Lixos OK"},{id:"ali",lb:"Alimentos armazenados"},{id:"ute",lb:"Utensílios OK"},{id:"cha",lb:"Chão lavado"},{id:"eco",lb:"Economatos OK"},{id:"asp",lb:"Aspeto geral"}];
const FOLHAS=[{id:"temperaturas",lb:"Temperaturas"},{id:"recepcao",lb:"Receção Matérias-Primas"},{id:"testemunho",lb:"Amostras Testemunho"},{id:"desinfecao",lb:"Desinfeção Alimentos Cru"},{id:"producao",lb:"Prod. Confeccionados"},{id:"higienizacao",lb:"Higienização Equip. e Utensilios"},{id:"manutencao",lb:"Manutenção, Avarias e Prevenção"},{id:"naoconf",lb:"Não Conformidades"},{id:"validacoes",lb:"Validações"}];
const MODS=[{id:"temperaturas",lb:"Temperaturas",cor:"#0e7490"},{id:"recepcao",lb:"Receção Matérias-Primas",cor:"#0369a1"},{id:"producao",lb:"Prod. Confeccionados",cor:"#0891b2"},{id:"testemunho",lb:"Amostra Testemunho",cor:"#6d28d9"},{id:"desinfecao",lb:"Desinfeção Alimentos Cru",cor:"#059669"},{id:"manutencao",lb:"Manutenção e Avarias",cor:"#0284c7"},{id:"higienizacao",lb:"Higienização",cor:"#0e7490"},{id:"equipamentos",lb:"Fichas de Equipamentos",cor:"#0f766e"},{id:"naoConf",lb:"Não Conformidades",cor:"#dc2626"},{id:"encerramento",lb:"Encerramento da Aula",cor:"#0369a1"},{id:"faltas",lb:"Faltas e Necessidades",cor:"#b45309"}];

const gD=()=>new Date().toLocaleDateString("pt-PT");
const gT=()=>new Date().toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"});
const fD=s=>{if(!s)return"?";if(s.includes("/"))return s;const p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];};
const nD=s=>s?(s.includes("/")?s.split("/").reverse().join("-"):s):"";
const iC=(nm,t)=>{const v=parseFloat(t);if(isNaN(v))return null;const cg=nm.toLowerCase().includes("congelador")||nm.toLowerCase().includes("congel");return cg?v<=-18:v>=0&&v<=5;};

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
function Hd({user,onOut}){return <div style={{background:"linear-gradient(135deg,#0e7490,#0369a1)",color:W,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:99,boxShadow:"0 4px 20px rgba(14,116,144,.4)"}}><div><div style={{fontSize:20,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>KitchenFlow <span style={{color:"#bae6fd"}}>ECL</span></div>{user&&<div style={{fontSize:10,opacity:.7,letterSpacing:.5,marginTop:1}}>{user.id} — {gD()}</div>}</div>{user&&<button onClick={onOut} style={{background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.3)",color:W,borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",letterSpacing:.5}}>SAIR</button>}</div>;}

function Login({onLogin}){
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
        </div>
      </div>
    </div>
  );
}

function DashAluno({user,db,setModule}){
  const h=gD();
  const [aba,setAba]=useState("modulos");
  const ncs=(db.ncs||[]).filter(n=>n.turma===user.turma&&n.date===h).length;
  const tempI=!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-inicio"]);
  const tempF=!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-final"]);
  const avisos=[];
  if(!tempI)avisos.push({msg:"Falta registo de temperaturas — Início de aula",mod:"temperaturas"});
  if(!tempF)avisos.push({msg:"Falta registo de temperaturas — Final de aula",mod:"temperaturas"});

  const historico=[
    {id:"ti",lb:"Temperaturas Início",ok:tempI,detalhe:tempI?db.temperaturas["temp-"+user.turma+"-"+h+"-inicio"].time:""},
    {id:"tf",lb:"Temperaturas Final",ok:tempF,detalhe:tempF?db.temperaturas["temp-"+user.turma+"-"+h+"-final"].time:""},
    {id:"rec",lb:"Receção Matérias-Primas",ok:!!(db.recepcao||[]).find(r=>r.turma===user.turma&&r.date===h),detalhe:(db.recepcao||[]).filter(r=>r.turma===user.turma&&r.date===h).length+" registo(s)"},
    {id:"prod",lb:"Prod. Confeccionados",ok:!!(db.producao||[]).find(p=>p.turma===user.turma&&p.date===h),detalhe:(db.producao||[]).filter(p=>p.turma===user.turma&&p.date===h).length+" produto(s)"},
    {id:"test",lb:"Amostra Testemunho",ok:!!(db.testemunho||[]).find(t=>t.turma===user.turma&&t.date===h),detalhe:(db.testemunho||[]).filter(t=>t.turma===user.turma&&t.date===h).length+" amostra(s)"},
    {id:"des",lb:"Desinfeção Alimentos Cru",ok:!!(db.desinfecao||[]).find(d=>d.turma===user.turma&&d.date===h),detalhe:(db.desinfecao||[]).filter(d=>d.turma===user.turma&&d.date===h).length+" registo(s)"},
    {id:"hig",lb:"Higienização",ok:!!(db.higienizacao&&db.higienizacao["hig-"+user.turma+"-"+h]),detalhe:db.higienizacao&&db.higienizacao["hig-"+user.turma+"-"+h]?Object.keys(db.higienizacao["hig-"+user.turma+"-"+h].registos||{}).length+" tarefas":""},
    {id:"man",lb:"Manutenção",ok:!!(db.manutencao||[]).find(m=>m.turma===user.turma&&m.date===h),detalhe:(db.manutencao||[]).filter(m=>m.turma===user.turma&&m.date===h).length+" ocorrência(s)"},
    {id:"nc",lb:"Não Conformidades",ok:ncs>0,detalhe:ncs+" NC(s)"},
    {id:"enc",lb:"Encerramento",ok:!!(db.encerramento&&db.encerramento["enc-"+user.turma+"-"+h]),detalhe:db.encerramento&&db.encerramento["enc-"+user.turma+"-"+h]?db.encerramento["enc-"+user.turma+"-"+h].time:""},
    {id:"val",lb:"Validação Professor",ok:!!(db.validacoes&&db.validacoes["val-"+user.turma+"-"+h]),detalhe:""},
  ];

  const feitos=historico.filter(x=>x.ok).length;

  return(
    <div style={{padding:15}}>
      {avisos.length>0&&<div style={{marginBottom:12}}>
        {avisos.map((av,i)=>(
          <div key={i} onClick={()=>setModule(av.mod)} style={{background:"#fdecea",border:"2px solid "+R,borderRadius:10,padding:"10px 13px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,color:R,fontWeight:700}}>(!)</span>
            <span style={{fontSize:12,fontWeight:600,color:R,flex:1}}>{av.msg}</span>
            <span style={{fontSize:11,color:R}}>Registar</span>
          </div>
        ))}
      </div>}
      <div style={{background:"linear-gradient(135deg,"+V+","+V2+")",borderRadius:14,padding:18,marginBottom:14,color:W}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:21,fontWeight:700}}>Olá, {user.id}</div>
        <div style={{fontSize:12,opacity:.75,marginTop:2}}>{user.turma} - {h}</div>
        <div style={{fontSize:11,opacity:.65,marginTop:4}}>{feitos}/{historico.length} tarefas concluídas hoje</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["modulos","Módulos"],["historico","Histórico do Dia"]].map(([id,lb])=>(
          <button key={id} onClick={()=>setAba(id)} style={{flex:1,padding:10,borderRadius:9,border:"2px solid "+(aba===id?V:BE),background:aba===id?V:LC,color:aba===id?W:GR,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{lb}</button>
        ))}
      </div>
      {aba==="modulos"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {MODS.map(m=>(<button key={m.id} onClick={()=>setModule(m.id)} style={{background:W,border:"none",borderRadius:14,padding:"14px 12px",cursor:"pointer",textAlign:"left",boxShadow:"0 4px 12px rgba(14,116,144,.12)",borderLeft:"4px solid "+m.cor,borderTop:"1px solid #e0f2fe",transition:"transform .1s"}}><div style={{fontSize:11,fontWeight:700,color:m.cor,lineHeight:1.4,textTransform:"uppercase",letterSpacing:.5}}>{m.lb}</div></button>))}
      </div>}
      {aba==="historico"&&<div>
        <div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:V,marginBottom:12}}>Histórico — {h}</div>
        <div style={{background:W,borderRadius:11,padding:"9px 13px",marginBottom:13}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:12,fontWeight:600,color:V}}>Progresso do dia</span>
            <span style={{fontSize:12,fontWeight:700,color:feitos===historico.length?V:CA}}>{feitos}/{historico.length}</span>
          </div>
          <Pg val={feitos} max={historico.length}/>
        </div>
        {historico.map(item=>(
          <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+LC}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:22,height:22,borderRadius:6,background:item.ok?V:"transparent",border:"2px solid "+(item.ok?V:BE),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {item.ok&&<span style={{color:W,fontSize:11,fontWeight:700}}>v</span>}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:item.ok?600:400,color:item.ok?V:GR}}>{item.lb}</div>
                {item.ok&&item.detalhe&&<div style={{fontSize:10,color:GR}}>{item.detalhe}</div>}
              </div>
            </div>
            <span style={{fontSize:12,fontWeight:700,color:item.ok?V:R}}>{item.ok?"OK":"Por fazer"}</span>
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
    const linha=[h,user.turma,user.id,momento,gT(),...records.flatMap(r=>[r.temperatura,r.conforme===false?"NC":r.conforme===true?"OK":"---"]),""];
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
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Temperaturas</div>
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
                    <div style={{fontSize:10,color:cg?"#7c3aed":"#0369a1",fontWeight:600,marginTop:1}}>{cg?"Congelação: ≤ -18°C":"Refrigeração: 0°C a 5°C"}</div>
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
                    <div style={{fontSize:10,color:cg?"#7c3aed":"#0369a1",fontWeight:600,marginTop:1}}>{cg?"Congelação: ≤ -18°C":"Refrigeração: 0°C a 5°C"}</div>
                    <div style={{fontSize:9,color:GR,marginTop:1}}>{cg?"Zona ideal: -18°C a -22°C":"Zona ideal: 2°C a 4°C"}</div>
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
    prods.forEach(p=>enviar("Receção Matérias-Primas",[gD(),user.turma,user.id,form.fornecedor,form.fatura,p.nome,p.categoria,p.quantidade,p.lote||"",p.validade,p.conforme]));
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
  const save=()=>{if(!form.prato)return;const dest=cD(form.dataRefeicao);setDb(p=>({...p,testemunho:[...(p.testemunho||[]),{...form,dataDestruicao:dest,responsavel:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()}]}));enviar("Amostra Testemunho",[gD(),user.turma,user.id,form.prato,form.tipoRefeicao,form.horaRefeicao,form.pesoAmostra,form.localArmazenamento,fD(dest)]);showToast("Amostra registada! Destruir em "+fD(dest));};
  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:4}}>Amostra de Testemunho</div>
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
  const save=()=>{if(!form.alimento||!form.produto)return;setDb(p=>({...p,desinfecao:[...(p.desinfecao||[]),{...form,responsavel:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()}]}));enviar("Desinfeção",[gD(),user.turma,user.id,form.alimento,form.quantidade,form.produto,form.concentracao,form.tempoContacto,form.temperatura]);showToast("Desinfeção registada!");};
  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:4}}>Desinfeção Alimentos em Cru</div>
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
  const save=()=>{if(!form.equipamento||!form.descricao)return;setDb(p=>({...p,manutencao:[...(p.manutencao||[]),{...form,responsavel:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()}]}));enviar("Manutenção, Avarias e Prevenção",[gD(),user.turma,user.id,form.equipamento,form.tipoOcorrencia,form.descricao,form.acaoImediata,form.estado]);showToast("Ocorrencia registada!");};

  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:4}}>Manutenção Equipamentos</div>
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
  const regs=(db.higienizacao&&db.higienizacao[k])?db.higienizacao[k].registos:{};
  const [zona,setZona]=useState(Object.keys(ZONAS)[0]);
  const tI=Object.values(ZONAS).flat().length,tF=Object.keys(regs).length;
  const mk=item=>{
    if(regs[item]){if(regs[item].aluno!==user.id){showToast("Marcado por "+regs[item].aluno);return;}if(!window.confirm("Desmarcar?"))return;const n={...regs};delete n[item];setDb(p=>{const hg={...p.higienizacao};hg[k]={registos:n,turma:user.turma,date:h};return{...p,higienizacao:hg};});showToast("Desmarcado");return;}
    const n={...regs,[item]:{aluno:user.id,time:gT(),turma:user.turma}};
    setDb(p=>{const hg={...p.higienizacao};hg[k]={registos:n,turma:user.turma,date:h};return{...p,higienizacao:hg};});
    enviar("Higienização Equip. e Utensilios",[h,user.turma,user.id,item]);
    showToast("Registado por "+user.id);
  };
  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Higienização</div>
      <Cd>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:12,color:GR}}>Progresso</span><span style={{background:tF===tI?V:CA,color:W,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600}}>{tF}/{tI}</span></div>
        <Pg val={tF} max={tI}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {Object.keys(ZONAS).map(z=>{const f=ZONAS[z].filter(i=>regs[i]).length,ok=f===ZONAS[z].length;return <button key={z} onClick={()=>setZona(z)} style={{padding:"5px 9px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:"2px solid "+(zona===z?V:ok?"#b8dfc8":BE),background:zona===z?V:ok?"#e8f5e9":LC,color:zona===z?W:ok?V:GR,fontFamily:"inherit"}}>{z}{ok?" ok":" "+f+"/"+ZONAS[z].length}</button>;})}
        </div>
      </Cd>
      <Cd>
        <div style={{fontWeight:700,fontSize:14,color:V,marginBottom:10}}>{zona} - {ZONAS[zona].filter(i=>regs[i]).length}/{ZONAS[zona].length}</div>
        {ZONAS[zona].map(item=>{const reg=regs[item],meu=reg&&reg.aluno===user.id;return(
          <div key={item} style={{borderBottom:"1px solid "+LC,paddingBottom:10,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div onClick={()=>mk(item)} style={{width:26,height:26,borderRadius:7,flexShrink:0,marginTop:1,border:"2px solid "+(reg?V:BE),background:reg?V:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{reg&&<span style={{color:W,fontSize:13,fontWeight:700}}>v</span>}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:reg?600:400,color:reg?V:GR}}>{item}</div>{reg&&<div style={{fontSize:10,color:GR,marginTop:2}}><span style={{background:meu?"#e8f5e9":"#fff3e0",color:meu?V:CA,borderRadius:4,padding:"1px 6px",fontWeight:700}}>{reg.aluno}</span> {reg.time}</div>}</div>
            </div>
          </div>
        );})}
      </Cd>
    </div>
  );
}

function NaoConf({user,db,setDb,showToast}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({zona:"",descricao:"",acaoCorretiva:"",estado:"aberta"});
  const lista=(db.ncs||[]).filter(n=>n.turma===user.turma);
  const save=()=>{if(!form.zona||!form.descricao)return;const nc={...form,responsavel:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now(),professor:""};setDb(p=>({...p,ncs:[...(p.ncs||[]),nc]}));setShow(false);setForm({zona:"",descricao:"",acaoCorretiva:"",estado:"aberta"});enviar("NãoConformidades",[gD(),user.turma,user.id,form.zona,form.descricao,form.acaoCorretiva,form.estado]);showToast("NC registada!");};
  const corE={aberta:R,"em resolução":"#d35400",resolvida:"#f39c12",validada:V};
  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Não Conformidades</div>
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

  const ITEMS_OBG=[
    {id:"ti",l:"Temperaturas de início registadas",auto:!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-inicio"])},
    {id:"tf",l:"Temperaturas de final registadas",auto:!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-final"])},
    {id:"hig",l:"Higienização concluída",auto:!!(db.higienizacao&&db.higienizacao["hig-"+user.turma+"-"+h])},
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
    setDb(p=>{const e={...p.encerramento};e[k]={obs,checks,aluno:user.id,turma:user.turma,date:h,time:gT()};return{...p,encerramento:e};});
    showToast("Encerramento de aula prática registado!");
  };

  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:4}}>Encerramento da Aula</div>
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
  const lista=(db.faltas||[]).slice(-10).reverse();
  const save=()=>{
    if(!form.descricao)return;
    const falta={...form,responsavel:user.id,turma:user.turma||"",date:gD(),time:gT(),id:Date.now(),estado:"pendente"};
    setDb(p=>({...p,faltas:[...(p.faltas||[]),falta]}));
    enviar("Faltas e Necessidades",[gD(),user.id,form.tipo,form.descricao,form.urgencia,"pendente"]);
    showToast("Falta registada! Notificação enviada.");
    setForm({tipo:"equipamento",descricao:"",urgencia:"normal"});
  };
  const corU={normal:"#0369a1",urgente:"#d97706",critico:"#dc2626"};
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
        <div style={{fontSize:12,fontWeight:700,color:"#b45309",marginBottom:8}}>Registos recentes</div>
        {lista.map(f=><Cd key={f.id} st={{marginBottom:8,borderLeft:"3px solid "+(corU[f.urgencia]||"#b45309")}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:600,fontSize:13}}>{f.tipo}</span>
            <span style={{background:corU[f.urgencia],color:W,borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>{f.urgencia}</span>
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
  const regs=(db.auxHig&&db.auxHig[k])?db.auxHig[k].registos:{};
  const notas=(db.auxHig&&db.auxHig[k])?db.auxHig[k].notas||{}:{};
  const [zona,setZona]=useState(Object.keys(ZONAS)[0]);
  const [notaEdit,setNotaEdit]=useState("");
  const [showNota,setShowNota]=useState(false);
  const tI=Object.values(ZONAS).flat().length,tF=Object.keys(regs).length;

  const mk=item=>{
    if(regs[item]){showToast("Ja marcado");return;}
    const n={...regs,[item]:{aluno:user.id,time:gT()}};
    setDb(p=>{const ah={...p.auxHig};ah[k]={registos:n,notas,date:h};return{...p,auxHig:ah};});
    showToast("Verificado!");
  };

  const guardarNota=()=>{
    const n={...notas,[zona]:notaEdit};
    setDb(p=>{const ah={...p.auxHig};ah[k]={registos:regs,notas:n,date:h};return{...p,auxHig:ah};});
    setShowNota(false);
    showToast("Nota guardada!");
  };

  return(
    <div style={{padding:15}}>
      <div style={{background:"linear-gradient(135deg,#0f766e,#0e7490)",borderRadius:14,padding:18,marginBottom:14,color:W}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700}}>Auxiliar de Apoio</div>
        <div style={{fontSize:12,opacity:.75,marginTop:2}}>{h}</div>
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
            {notas[zona]?"Nota ✎":"+ Nota"}
          </button>
        </div>
        {showNota&&(
          <div style={{marginBottom:12,background:"#fef3c7",borderRadius:9,padding:10}}>
            <div style={{fontSize:10,fontWeight:700,color:"#92400e",marginBottom:6,textTransform:"uppercase"}}>Nota para a zona {zona}</div>
            <textarea value={notaEdit} onChange={e=>setNotaEdit(e.target.value)} placeholder="Ex: Produto acabou, não foi possível higienizar..." rows={3} style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid #f59e0b",fontSize:13,background:W,color:"#92400e",outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
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
          <div key={item} style={{borderBottom:"1px solid "+LC,paddingBottom:10,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div onClick={()=>mk(item)} style={{width:26,height:26,borderRadius:7,flexShrink:0,marginTop:1,border:"2px solid "+(reg?V:BE),background:reg?V:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{reg&&<span style={{color:W,fontSize:13,fontWeight:700}}>v</span>}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:reg?600:400,color:reg?V:GR}}>{item}</div>
                {reg&&<div style={{fontSize:10,color:GR,marginTop:2}}>{reg.time}</div>}
              </div>
            </div>
          </div>
        );})}
      </Cd>
    </div>
  );
}

export default function App(){
  const [user,setUser]=useState(null);
  const [mod,setMod]=useState(null);
  const [db,setDb]=useState(()=>{try{const s=localStorage.getItem("kf_db");return s?JSON.parse(s):{}}catch{return{}}});
  const [toast,setToast]=useState(null);
  const showToast=useCallback(msg=>setToast(msg),[]);
  useEffect(()=>{try{localStorage.setItem("kf_db",JSON.stringify(db));}catch{}},[db]);
  const logout=()=>{setUser(null);setMod(null);};
  const back=()=>setMod(null);
  if(!user)return <Login onLogin={u=>{setUser(u);setMod(null);}}/>;
  if(user.tipo==="aluno"&&!(db.assinaturas&&db.assinaturas[user.id])){
    return(<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f9ff,#e0f2fe)",maxWidth:600,margin:"0 auto"}}><Hd user={user} onOut={()=>setUser(null)}/><AssinaturaDigital userId={user.id} onSave={nome=>{setDb(p=>({...p,assinaturas:{...(p.assinaturas||{}),[user.id]:nome}}));}}/></div>);
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
  else if(mod==="faltas")page=<Faltas {...p}/>;
  else if(mod==="naoConf")page=<NaoConf {...p}/>;
  else if(mod==="encerramento")page=<Encerramento {...p}/>;
  else if(user.tipo==="professor")page=<Professor {...p}/>;
  else if(user.tipo==="coord")page=<Coordenadora {...p}/>;
  else if(user.tipo==="auxiliar")page=<Auxiliar {...p}/>;
  else page=<DashAluno {...p}/>;
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f9ff,#e0f2fe)",maxWidth:600,margin:"0 auto"}}>
      <Hd user={user} onOut={logout}/>
      <div style={{paddingBottom:36}}>
        {mod&&<div style={{padding:"11px 15px 3px"}}><button onClick={back} style={{background:"none",border:"1.5px solid "+BE,color:V,fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:7,padding:"5px 13px",fontFamily:"inherit"}}>Voltar</button></div>}
        {page}
      </div>
      {toast&&<Tt msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
