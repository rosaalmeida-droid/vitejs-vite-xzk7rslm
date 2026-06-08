import { useState, useEffect, useCallback } from "react";



const SHEET_URL="https://script.google.com/a/macros/eclisboa.net/s/AKfycbx61h1YIvODQaH_DJ-jhzx6zHSd2tux2LZuPOpOIvVFfOyK9J8gfzJIbjiEH6WE7xX6iQ/exec";
const enviar=(t,d)=>fetch(SHEET_URL,{method:"POST",body:JSON.stringify(typeof d==="object"&&d.linha?{tabela:t,...d}:{tabela:t,linha:d})}).catch(()=>{});
const V="#1a3d2b",V2="#4a7c5e",CR="#f5f0e8",BE="#e8dfc8",CA="#7c5c3a",W="#ffffff",R="#c0392b",GR="#8a8a8a",LC="#f0ede6";

const FRIOS=["Congelador 1","Congelador 2","Congelador 3","Frig. Vert. 1","Frig. Vert. 2","Frig. Vert. 3","Frig. Vert. 4","Frig. Banc. 1","Frig. Banc. 2","Frig. Banc. 3","Frig. Banc. 4","Frig. Banc. 5"];
const CATS=["Legumes frescos","Carne","Peixe","Mercearia seca","Laticinios","Congelados","Outros"];
const TODOS_EQ=[...FRIOS,"Abatedor 1","Abatedor 2","Forno 1","Forno 2","Maq.vacuo 1","Maq.vacuo 2","Picadora","Batedeira","Amassadeira 1","Amassadeira 2","Desidratador","Bimby","Pacojet","Processador 1","Processador 2"];
const ZONAS={
"Bancadas":["Bancada 1 limpa e higienizada (cima e baixo)","Bancada 2 limpa e higienizada (cima e baixo)","Bancada 3 limpa e higienizada (cima e baixo)","Bancada 4 limpa e higienizada (cima e baixo)","Bancada 5 limpa e higienizada (cima e baixo)","Ralo cuba bancada 1 limpo","Ralo cuba bancada 2 limpo","Ralo cuba bancada 3 limpo","Ralo cuba bancada 4 limpo","Ralo cuba bancada 5 limpo","Bancadas laterais limpas e higienizadas"],
"Equipamentos":["Abatedor 1 desligado e higienizado","Abatedor 2 desligado e higienizado","Maq. vacuo 1 limpa e desligada","Maq. vacuo 2 limpa e desligada","Amassadeira 1 desligada e protegida c/pelicula","Amassadeira 2 desligada e protegida c/pelicula","Batedeira desligada e protegida c/pelicula","Picadora limpa e protegida c/pelicula","Processadores limpos e protegidos","Fogoes todos desligados","Ar condicionado desligado"],
"Frio":["Frigorifico vertical 1 verificado","Frigorifico vertical 2 verificado","Frigorifico vertical 3 verificado","Frigorifico vertical 4 verificado","Frigorifico bancada 1 verificado","Frigorifico bancada 2 verificado","Frigorifico bancada 3 verificado","Frigorifico bancada 4 verificado","Frigorifico bancada 5 verificado","Congelador 1 verificado","Congelador 2 verificado","Congelador 3 verificado","Temperaturas registadas"],
"Copa":["Loica lavada e arrumada","Sem utensilios por lavar","Cuba higienizada","Maq. lavagem 1 drenada, porta aberta e higienizada","Maq. lavagem 2 drenada, porta aberta e higienizada","Inoxes em condicoes"],
"Economatos":["Economato mat.-primas organizado","Mat.-primas devidamente armazenadas","Sem mat.-primas no chao","Economato material organizado","Material arrumado (nao no chao)","Chao economato em condicoes"],
"Residuos":["Lixo organico despejado no local correto","Lixo reciclavel separado corretamente","Caixotes lavados e higienizados","Sacos novos colocados"],
"Carrinhos":["Carrinho 1 limpo e higienizado","Carrinho 2 limpo e higienizado","Carrinhos arrumados no local correto"]
};
const PC=[{id:"fog",lb:"Fogões OK"},{id:"for",lb:"Fornos OK"},{id:"arc",lb:"Ar cond. OK"},{id:"cop",lb:"Copa OK"},{id:"fri",lb:"Frio OK"},{id:"hig",lb:"Higieniz. OK"},{id:"lix",lb:"Lixos OK"},{id:"ali",lb:"Alimentos armazenados"},{id:"ute",lb:"Utensílios OK"},{id:"cha",lb:"Chão lavado"},{id:"eco",lb:"Economatos OK"},{id:"asp",lb:"Aspeto geral"}];
const FOLHAS=[{id:"temperaturas",lb:"Temperaturas"},{id:"recepcao",lb:"Receção Matérias-Primas"},{id:"testemunho",lb:"Amostras Testemunho"},{id:"desinfecao",lb:"Desinfeção Alimentos Cru"},{id:"producao",lb:"Produção"},{id:"higienizacao",lb:"Higienização Equip. e Utensilios"},{id:"manutencao",lb:"Manutenção, Avarias e Prevenção"},{id:"naoconf",lb:"Não Conformidades"},{id:"validacoes",lb:"Validações"}];
const MODS=[{id:"temperaturas",lb:"Temperaturas",cor:"#2d5a3d"},{id:"recepcao",lb:"Receção Matérias-Primas",cor:V2},{id:"producao",lb:"Prod. Confeccionados",cor:CA},{id:"testemunho",lb:"Amostra Testemunho",cor:"#6d3b8e"},{id:"desinfecao",lb:"Desinfeção Alimentos Cru",cor:"#1a6b4a"},{id:"manutencao",lb:"Manutenção, Avarias e Prevenção",cor:"#2c5f8a"},{id:"higienizacao",lb:"Higienização Equip. e Utensilios",cor:"#a67c52"},{id:"naoConf",lb:"Não Conformidades",cor:R},{id:"encerramento",lb:"Encerramento",cor:V}];

const gD=()=>new Date().toLocaleDateString("pt-PT");
const gT=()=>new Date().toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"});
const fD=s=>{if(!s)return"?";if(s.includes("/"))return s;const p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];};
const nD=s=>s?(s.includes("/")?s.split("/").reverse().join("-"):s):"";
const iC=(nm,t)=>{const v=parseFloat(t);if(isNaN(v))return null;return nm.includes("congeladora")?v<=-18:v>=0&&v<=5;};

function B({lb,onClick,cor,dis,sm,out,st}){
  const bg=dis?"#ccc":out?"transparent":(cor||V);
  return <button onClick={onClick} disabled={dis} style={{background:bg,color:out?(cor||V):W,border:out?"2px solid "+(cor||V):"none",borderRadius:sm?8:11,padding:sm?"8px 14px":"13px 18px",fontSize:sm?13:15,fontWeight:600,cursor:dis?"not-allowed":"pointer",width:sm?"auto":"100%",fontFamily:"inherit",...st}}>{lb}</button>;
}
function Cd({children,st}){return <div style={{background:W,borderRadius:14,padding:18,marginBottom:14,boxShadow:"0 2px 8px rgba(26,61,43,.08)",...st}}>{children}</div>;}
function Ip({lb,val,onChange,type,ph,min,max}){return <div style={{marginBottom:11}}>{lb&&<div style={{fontSize:11,fontWeight:600,color:CA,marginBottom:3,textTransform:"uppercase"}}>{lb}</div>}<input type={type||"text"} value={val} onChange={e=>onChange(e.target.value)} placeholder={ph||""} min={min} max={max} style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1.5px solid "+BE,fontSize:15,background:LC,outline:"none",color:V,fontFamily:"inherit"}}/></div>;}
function Sl({lb,val,onChange,opts}){return <div style={{marginBottom:11}}>{lb&&<div style={{fontSize:11,fontWeight:600,color:CA,marginBottom:3,textTransform:"uppercase"}}>{lb}</div>}<select value={val} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1.5px solid "+BE,fontSize:15,background:LC,color:V,outline:"none",fontFamily:"inherit"}}><option value="">-- Selecionar --</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;}
function Ta({lb,val,onChange,ph}){return <div style={{marginBottom:11}}>{lb&&<div style={{fontSize:11,fontWeight:600,color:CA,marginBottom:3,textTransform:"uppercase"}}>{lb}</div>}<textarea value={val} onChange={e=>onChange(e.target.value)} placeholder={ph||""} rows={3} style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1.5px solid "+BE,fontSize:14,background:LC,color:V,outline:"none",resize:"vertical",fontFamily:"inherit"}}/></div>;}
function Ck({lb,chk,onChange}){return <div onClick={()=>onChange(!chk)} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0",borderBottom:"1px solid "+LC,cursor:"pointer"}}><div style={{width:25,height:25,borderRadius:7,border:"2px solid "+(chk?V:BE),background:chk?V:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{chk&&<span style={{color:W,fontSize:13,fontWeight:700}}>v</span>}</div><span style={{fontSize:13,color:chk?V:GR}}>{lb}</span></div>;}
function Pg({val,max}){return <div style={{background:LC,borderRadius:7,height:7,marginBottom:12}}><div style={{background:V,height:7,borderRadius:7,width:(val/Math.max(max,1)*100)+"%"}}/></div>;}
function Tt({msg,onClose}){useEffect(()=>{const t=setTimeout(onClose,2800);return()=>clearTimeout(t);},[onClose]);return <div style={{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",background:V,color:W,borderRadius:11,padding:"11px 22px",fontSize:13,fontWeight:500,zIndex:9999}}>{msg}</div>;}
function Hd({user,onOut}){return <div style={{background:V,color:W,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:99,boxShadow:"0 2px 10px rgba(0,0,0,.2)"}}><div><div style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:700}}>KitchenFlow ECL</div>{user&&<div style={{fontSize:10,opacity:.65}}>{user.id} - {gD()}</div>}</div>{user&&<button onClick={onOut} style={{background:"rgba(255,255,255,.15)",border:"none",color:W,borderRadius:8,padding:"6px 13px",fontSize:13,cursor:"pointer"}}>Sair</button>}</div>;}

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
    } else {
      if(pin!=="1006"){setErr("PIN incorreto: 1006");return;}
      onLogin({tipo:"coord",id:"Coord."});
    }
  };
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(150deg,"+V+","+V2+")",display:"flex",alignItems:"center",justifyContent:"center",padding:22}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:36,fontWeight:700,color:W,marginBottom:6}}>ECL</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,color:W}}>KitchenFlow ECL</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",marginTop:2}}>ESCOLA DE COMÉRCIO DE LISBOA</div>
        </div>
        <div style={{background:W,borderRadius:16,padding:24,boxShadow:"0 16px 40px rgba(0,0,0,.25)"}}>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[["aluno","Aluno"],["professor","Prof."],["coord","Coord."]].map(([t,lb])=>(
              <button key={t} onClick={()=>{setTipo(t);setErr("");setPin("");}} style={{flex:1,padding:"9px 3px",borderRadius:8,border:"2px solid "+(tipo===t?V:BE),background:tipo===t?V:LC,color:tipo===t?W:GR,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{lb}</button>
            ))}
          </div>
          {tipo==="aluno"&&<><Sl lb="Turma" val={turma} onChange={setTurma} opts={["T1","T2","T3"]}/><Ip lb="Número (1-24)" type="number" val={num} onChange={setNum} min="1" max="24"/></>}
          {tipo==="professor"&&<Sl lb="Professor" val={prof} onChange={setProf} opts={["P01","P02","P03"]}/>}
          {tipo==="coord"&&<div style={{textAlign:"center",padding:"6px 0",color:GR,fontSize:13}}>Coordenadora - PIN: 1006</div>}
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
  const ncs=(db.ncs||[]).filter(n=>n.turma===user.turma&&n.date===h).length;
  const tempI=!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-inicio"]);
  const tempF=!!(db.temperaturas&&db.temperaturas["temp-"+user.turma+"-"+h+"-final"]);
  const avisos=[];
  if(!tempI)avisos.push({msg:"Falta registo de temperaturas — Início de Aula",mod:"temperaturas"});
  if(!tempF)avisos.push({msg:"Falta registo de temperaturas — Final de aula",mod:"temperaturas"});
  return(
    <div style={{padding:15}}>
      {avisos.length>0&&<div style={{marginBottom:12}}>
        {avisos.map((av,i)=>(
          <div key={i} onClick={()=>setModule(av.mod)} style={{background:"#fdecea",border:"2px solid "+R,borderRadius:10,padding:"10px 13px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,color:R}}>(!)</span>
            <span style={{fontSize:12,fontWeight:600,color:R,flex:1}}>{av.msg}</span>
            <span style={{fontSize:11,color:R}}>Registar</span>
          </div>
        ))}
      </div>}
      <div style={{background:"linear-gradient(135deg,"+V+","+V2+")",borderRadius:14,padding:18,marginBottom:14,color:W}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:21,fontWeight:700}}>Ola, {user.id}</div>
        <div style={{fontSize:12,opacity:.75,marginTop:2}}>{user.turma} - {h}</div>
        <div style={{fontSize:11,opacity:.65,marginTop:4}}>{ncs} não conformidades hoje</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {MODS.map(m=>(<button key={m.id} onClick={()=>setModule(m.id)} style={{background:W,border:"none",borderRadius:13,padding:14,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(26,61,43,.07)",borderLeft:"4px solid "+m.cor}}><div style={{fontSize:12,fontWeight:600,color:m.cor,lineHeight:1.3}}>{m.lb}</div></button>))}
      </div>
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
  const [temps,setTemps]=useState({});
  const done=!!sv;

  const save=()=>{
    const cab=["Data","Turma","Aluno","Momento","Hora",...FRIOS.flatMap(eq=>[eq+" Temp",eq+" Conf"]),"Validado Prof"];
    const records=FRIOS.map(eq=>({equipamento:eq,temperatura:temps[eq]||"",conforme:iC(eq,temps[eq])}));
    const linha=[h,user.turma,user.id,momento,gT(),...records.flatMap(r=>[r.temperatura,r.conforme===false?"NC":r.conforme===true?"OK":"---"]),""];
    setDb(p=>{
      const te={...p.temperaturas};
      te[k]={temps,records,aluno:user.id,turma:user.turma,date:h,time:gT(),momento};
      const ncs=[...(p.ncs||[])];
      records.filter(r=>r.conforme===false).forEach(r=>ncs.push({id:Date.now()+Math.random(),date:h,time:gT(),zona:r.equipamento,descricao:"Temp NC "+momento+": "+r.temperatura+"C",acaoCorretiva:"",responsavel:user.id,turma:user.turma,estado:"aberta",professor:""}));
      return{...p,temperaturas:te,ncs};
    });
    enviar("Temperaturas",{cabecalho:cab,linha});
    showToast("Temperaturas "+momento+" registadas!");
    if(momento==="inicio")setMomento("final");
  };

  return(
    <div style={{padding:15}}>
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Temperaturas</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["inicio","final"].map(m=>{
          const feito=m==="inicio"?!!svI:!!svF;
          return(
            <button key={m} onClick={()=>{setMomento(m);setTemps({});}} style={{flex:1,padding:10,borderRadius:9,border:"2px solid "+(momento===m?"#2d5a3d":BE),background:momento===m?"#2d5a3d":feito?"#e8f5e9":LC,color:momento===m?W:feito?"#2d5a3d":GR,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              {m==="inicio"?"Início de Aula":"Final de Aula"}
              {feito&&<span style={{fontSize:10,display:"block",opacity:.8}}>Registado {m==="inicio"?svI.time:svF.time}</span>}
            </button>
          );
        })}
      </div>
      {done&&<div style={{background:"#e8f5e9",borderRadius:9,padding:10,marginBottom:10,color:V,fontSize:13}}>Já registado — {sv.aluno} {sv.time}</div>}
      {FRIOS.map(eq=>{
        const cg=eq.includes("Congel"),cf=iC(eq,temps[eq]);
        return(
          <Cd key={eq} st={{marginBottom:8,borderLeft:"3px solid "+(cf===false?R:cf===true?V:BE)}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:V}}>{eq}</div><div style={{fontSize:10,color:GR}}>{cg?"max -18C":"0 a 5C"}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:3}}>
                {cg&&<button onClick={()=>{if(!done){const cur=String(temps[eq]||"");setTemps(p=>({...p,[eq]:cur[0]==="-"?cur.slice(1):"-"+cur}));}}} style={{width:26,height:34,borderRadius:6,border:"1.5px solid "+(temps[eq]&&String(temps[eq])[0]==="-"?V:BE),background:temps[eq]&&String(temps[eq])[0]==="-"?V:LC,color:temps[eq]&&String(temps[eq])[0]==="-"?W:GR,fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>-</button>}
                <input type="number" value={temps[eq]?String(temps[eq]).replace("-",""):""} onChange={e=>{if(!done){const neg=cg&&temps[eq]&&String(temps[eq])[0]==="-";setTemps(p=>({...p,[eq]:neg&&e.target.value?"-"+e.target.value:e.target.value}));}}} placeholder="0" step="0.1" min="0" style={{width:52,padding:"7px 6px",borderRadius:7,border:"2px solid "+(cf===false?R:cf===true?V:BE),fontSize:14,fontWeight:600,textAlign:"center",background:LC,color:V,fontFamily:"inherit"}}/>
                <span style={{fontSize:10,fontWeight:700,color:cf===false?R:cf===true?V:GR,minWidth:20}}>{cf===false?"NC":cf===true?"OK":""}</span>
              </div>
            </div>
          </Cd>
        );
      })}
      {!done&&<B lb={"Guardar Temperaturas "+momento.toUpperCase()} onClick={save} cor="#2d5a3d"/>}
    </div>
  );
}

function Recepcao({user,db,setDb,showToast}){
  const [step,setStep]=useState("lista");
  const [form,setForm]=useState({fornecedor:"",fatura:"",professor:"P01"});
  const [prods,setProds]=useState([]);
  const [np,setNp]=useState({categoria:"",nome:"",quantidade:"",lote:"",validade:"",conforme:"conforme"});
  const lista=(db.recepcao||[]).filter(r=>r.turma===user.turma);
  const addP=()=>{if(!np.categoria||!np.nome)return;setProds(p=>[...p,{...np,id:Date.now()}]);setNp({categoria:"",nome:"",quantidade:"",lote:"",validade:"",conforme:"conforme"});};
  const save=()=>{if(!form.fornecedor||!form.fatura)return;const rec={...form,produtos:prods,aluno:user.id,turma:user.turma,date:gD(),time:gT(),id:Date.now()};setDb(p=>({...p,recepcao:[...(p.recepcao||[]),rec]}));setStep("lista");setForm({fornecedor:"",fatura:"",professor:"P01"});setProds([]);prods.forEach(p=>enviar("Receção Matérias-Primas",[gD(),user.turma,user.id,form.fornecedor,form.fatura,p.nome,p.categoria,p.quantidade,p.lote||"",p.validade,p.conforme]));showToast("Receção registada!");};
  if(step==="lista")return(<div style={{padding:15}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Receção de Mercadorias</div><B lb="+ Nova Receção" onClick={()=>setStep("nova")}/>{lista.slice(-5).reverse().map(r=><Cd key={r.id} st={{marginTop:10}}><div style={{fontWeight:600,fontSize:13}}>{r.fornecedor} - Ft {r.fatura}</div><div style={{fontSize:11,color:GR}}>{r.date} {r.time} - {r.aluno} - {(r.produtos||[]).length} produto(s)</div></Cd>)}</div>);
  if(step==="nova")return(<div style={{padding:15}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Nova Receção</div><Cd><Ip lb="Fornecedor" val={form.fornecedor} onChange={v=>setForm(p=>({...p,fornecedor:v}))}/><Ip lb="Fatura" val={form.fatura} onChange={v=>setForm(p=>({...p,fatura:v}))}/><Sl lb="Professor" val={form.professor} onChange={v=>setForm(p=>({...p,professor:v}))} opts={["P01","P02","P03"]}/></Cd><div style={{display:"flex",gap:8}}><B lb="Voltar" sm out cor={GR} onClick={()=>setStep("lista")} st={{flex:1}}/><B lb="Produtos" sm onClick={()=>{if(form.fornecedor&&form.fatura)setStep("produtos");}} st={{flex:2}}/></div></div>);
  return(<div style={{padding:15}}><div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Produtos — Ft {form.fatura}</div>{prods.map(p=><Cd key={p.id} st={{marginBottom:8,borderLeft:"3px solid "+(p.conforme==="conforme"?V:R)}}><div style={{fontWeight:600,fontSize:13}}>{p.nome} - {p.categoria}</div></Cd>)}<Cd><Sl lb="Categoria" val={np.categoria} onChange={v=>setNp(p=>({...p,categoria:v}))} opts={CATS}/><Ip lb="Nome" val={np.nome} onChange={v=>setNp(p=>({...p,nome:v}))}/><Ip lb="Quantidade" val={np.quantidade} onChange={v=>setNp(p=>({...p,quantidade:v}))} ph="Ex: 5 kg"/><Ip lb="Lote" val={np.lote} onChange={v=>setNp(p=>({...p,lote:v}))}/><Ip lb="Validade" type="date" val={np.validade} onChange={v=>setNp(p=>({...p,validade:v}))}/><Sl lb="Conformidade" val={np.conforme} onChange={v=>setNp(p=>({...p,conforme:v}))} opts={["conforme","não conforme"]}/><B lb="Add" sm onClick={addP} cor={V2}/></Cd><div style={{display:"flex",gap:8,marginTop:6}}><B lb="Voltar" sm out cor={GR} onClick={()=>setStep("nova")} st={{flex:1}}/><B lb="Guardar Receção" sm onClick={save} cor={prods.length>0?V:GR} st={{flex:2}}/></div></div>);
}

const CONSERVACAO=[
  {cat:"Carne fresca",items:[
    {prod:"Carne de vaca/porco picada",temp:"0-4°C",dias:"1-2 dias"},
    {prod:"Carne de vaca/porco peça",temp:"0-4°C",dias:"3-5 dias"},
    {prod:"Frango inteiro/peças",temp:"0-4°C",dias:"1-2 dias"},
    {prod:"Carne cozinhada",temp:"0-4°C",dias:"3-4 dias"},
    {prod:"Carne congelada",temp:"≤-18°C",dias:"3-6 meses"},
  ]},
  {cat:"Peixe e marisco",items:[
    {prod:"Peixe fresco",temp:"0-4°C",dias:"1-2 dias"},
    {prod:"Peixe cozinhado",temp:"0-4°C",dias:"2-3 dias"},
    {prod:"Peixe congelado",temp:"≤-18°C",dias:"3-6 meses"},
    {prod:"Marisco cozinhado",temp:"0-4°C",dias:"2-3 dias"},
  ]},
  {cat:"Laticínios",items:[
    {prod:"Leite aberto",temp:"0-4°C",dias:"3-4 dias"},
    {prod:"Iogurte aberto",temp:"0-4°C",dias:"2-3 dias"},
    {prod:"Queijo fresco aberto",temp:"0-4°C",dias:"3-5 dias"},
    {prod:"Natas abertas",temp:"0-4°C",dias:"2-3 dias"},
    {prod:"Manteiga aberta",temp:"0-4°C",dias:"2-3 semanas"},
  ]},
  {cat:"Preparações",items:[
    {prod:"Sopas e caldos",temp:"0-4°C",dias:"3-4 dias"},
    {prod:"Molhos com carne",temp:"0-4°C",dias:"3-4 dias"},
    {prod:"Arroz/massa cozinhados",temp:"0-4°C",dias:"2-3 dias"},
    {prod:"Ovos cozinhados",temp:"0-4°C",dias:"1 semana"},
    {prod:"Sobremesas com ovo/natas",temp:"0-4°C",dias:"2-3 dias"},
  ]},
  {cat:"Congelados produzidos",items:[
    {prod:"Pratos com carne",temp:"≤-18°C",dias:"2-3 meses"},
    {prod:"Pratos com peixe",temp:"≤-18°C",dias:"1-2 meses"},
    {prod:"Sopas",temp:"≤-18°C",dias:"3-4 meses"},
    {prod:"Massa/pão",temp:"≤-18°C",dias:"3-6 meses"},
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
      <div style={{fontFamily:"Georgia,serif",fontSize:19,fontWeight:700,marginBottom:14}}>Produtos Produzidos</div>
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

export default function App(){
  const [user,setUser]=useState(null);
  const [mod,setMod]=useState(null);
  const [db,setDb]=useState({});
  const [toast,setToast]=useState(null);
  const showToast=useCallback(msg=>setToast(msg),[]);
  const logout=()=>{setUser(null);setMod(null);};
  const back=()=>setMod(null);
  if(!user)return <Login onLogin={u=>{setUser(u);setMod(null);}}/>;
  if(user.tipo==="aluno"&&!(db.assinaturas&&db.assinaturas[user.id])){
    return(<div style={{minHeight:"100vh",background:CR,maxWidth:600,margin:"0 auto"}}><Hd user={user} onOut={()=>setUser(null)}/><AssinaturaDigital userId={user.id} onSave={nome=>{setDb(p=>({...p,assinaturas:{...(p.assinaturas||{}),[user.id]:nome}}));}}/></div>);
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
  else if(mod==="naoConf")page=<NaoConf {...p}/>;
  else if(mod==="encerramento")page=<Encerramento {...p}/>;
  else if(user.tipo==="professor")page=<Professor {...p}/>;
  else if(user.tipo==="coord")page=<Coordenadora {...p}/>;
  else page=<DashAluno {...p}/>;
  return(
    <div style={{minHeight:"100vh",background:CR,maxWidth:600,margin:"0 auto"}}>
      <Hd user={user} onOut={logout}/>
      <div style={{paddingBottom:36}}>
        {mod&&<div style={{padding:"11px 15px 3px"}}><button onClick={back} style={{background:"none",border:"1.5px solid "+BE,color:V,fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:7,padding:"5px 13px",fontFamily:"inherit"}}>Voltar</button></div>}
        {page}
      </div>
      {toast&&<Tt msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
