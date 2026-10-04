// ═══════════════════════════════════════════════════════════════
// KitchenFlow ECL — Apps Script v6 (ficheiro novo e limpo, out/2026)
// ═══════════════════════════════════════════════════════════════
// Para um Google Sheets NOVO. O ficheiro antigo fica como arquivo.
//
// O que muda em relação à v5.5:
//  1. Fila de espera: um registo de cada vez (LockService). Com a turma toda
//     a registar ao mesmo tempo, já não há gravações perdidas nem Ranking errado.
//  2. Sem linhas repetidas: cada registo traz um número de envio; se a
//     aplicação o reenviar (falha de rede), o script reconhece-o e não o grava duas vezes.
//  3. Cabeçalhos certos: as colunas de cada folha são exatamente as que as
//     aplicações enviam (Receção com temperatura, Produção, Validações com hora…).
//  4. «Criar PIN» corrige a linha do aluno certo (número E turma).
//  5. Os relatórios de NC em PDF deixam de ficar abertos a quem tiver o link.
//  6. A cópia para o ficheiro de registos PDF já não leva os PINs dos alunos.
//  7. Tudo num só script: preparar as folhas, cópia de segurança diária e
//     proteção das folhas. Começa vazio: o ficheiro antigo só tinha testes
//     com alunos fictícios, e não se traz nada de lá (Rosa, out/2026).
//
// Como instalar: ver «prepararTudo» mais abaixo.
// ═══════════════════════════════════════════════════════════════

var VERSAO = "6.0";
var EMAIL_COORDENACAO = "rosa.almeida@eclisboa.net";
// A cópia linha a linha para o ficheiro antigo de registos PDF fica desligada:
// esse ficheiro tem os testes. A segurança passa a ser a cópia diária.
var SHEET_ID_PDF_REGISTOS = "";
var PASTA_COPIAS = "KitchenFlow — Cópias de segurança";

// As colunas são as que as aplicações enviam, pela mesma ordem.
var SHEET_CONFIG = {
  "Temperaturas":{cor:"#0e7490",titulo:"KitchenFlow ECL — Registo de Temperaturas",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Momento","Congelador 1","Conf.","Congelador 2","Conf.","Congelador 3","Conf.","Frig. Vert. 1","Conf.","Frig. Vert. 2","Conf.","Frig. Vert. 3","Conf.","Frig. Vert. 4","Conf.","Frig. Banc. 1","Conf.","Frig. Banc. 2","Conf.","Frig. Banc. 3","Conf.","Frig. Banc. 4","Conf.","Frig. Banc. 5","Conf.","Validado Prof"]},
  "Higiene Pessoal":{cor:"#0f766e",titulo:"KitchenFlow ECL — Registo de Higiene Pessoal",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Estado","Fonte"]},
  "Presenças":{cor:"#0e7490",titulo:"KitchenFlow ECL — Presenças",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Estado","Fonte"]},
  "Receção Matérias-Primas":{cor:"#0369a1",titulo:"KitchenFlow ECL — Receção de Matérias-Primas",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Fornecedor","Fatura","Produto","Categoria","Quantidade","Lote","Validade","Conformidade","Temperatura (°C)"]},
  "Conservação Produtos":{cor:"#0891b2",titulo:"KitchenFlow ECL — Conservação de Produtos",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Estado","Produto","Categoria","Local de conservação","Embalagem","Notas","Data Produção","Data Limite","Lote"]},
  "Regeneração":{cor:"#d97706",titulo:"KitchenFlow ECL — Regeneração/Cook-Chill (DTR-008)",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Prato","Tipo","Temp. Final (°C)","Resultado","Hora Início","Hora Fim","Tempo (min)","Temp. Serviço","Serviço OK","Equipamento","Conservação Anterior","Embalagem","Data Confeção","Observações"]},
  "Amostra Testemunho":{cor:"#6d28d9",titulo:"KitchenFlow ECL — Amostra Testemunho",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Prato","Tipo Refeição","Hora Refeição","Peso (g)","Local","Destruir em"]},
  "Desinfeção":{cor:"#059669",titulo:"KitchenFlow ECL — Desinfeção de Alimentos para Consumo em Cru",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Alimento","Quantidade","Produto Desinfetante","Concentração (ml/L)","Tempo (min)","Temp. Água (°C)"]},
  "Produção":{cor:"#0e7490",titulo:"KitchenFlow ECL — Produtos Confecionados",colunas:["Data","Turma","ID Aluno","Prato","Lote","Conservação","Data Produção","Data Limite","Local","Professor","Hora","Nome Aluno"]},
  "Controlo Óleos":{cor:"#d97706",titulo:"KitchenFlow ECL — Controlo de Óleos de Fritura",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Equipamento","Temperatura (°C)","Cor","Espuma","Cheiro","Teste Oxidação","Ação Tomada","Resultado"]},
  "Temperatura Serviço":{cor:"#dc2626",titulo:"KitchenFlow ECL — Temperatura de Serviço",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Prato","Tipo Serviço","Temperatura (°C)","Resultado","Hora Início","Equipamento"]},
  "Higienização":{cor:"#0e7490",titulo:"KitchenFlow ECL — Higienização de Equipamentos e Utensílios",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Item Higienizado","Observação"]},
  "Panos Solução":{cor:"#7c3aed",titulo:"KitchenFlow ECL — Panos e Esponjas em Solução Desinfetante",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Momento (Início/Final)"]},
  "Manutenção, Avarias e Prevenção":{cor:"#0284c7",titulo:"KitchenFlow ECL — Manutenção, Avarias e Prevenção",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Equipamento","Tipo Ocorrência","Descrição","Ação Imediata","Estado"]},
  "NãoConformidades":{cor:"#dc2626",titulo:"KitchenFlow ECL — Não Conformidades",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Zona/Equipamento","Descrição","Ação Corretiva","Estado","Gravidade / Decidido por","Decisão","Relatório PDF"]},
  "Faltas e Necessidades":{cor:"#b45309",titulo:"KitchenFlow ECL — Faltas e Necessidades",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Tipo","Descrição","Quantidade","Urgência","Estado","Observações","Email Enviado"]},
  "Encerramento":{cor:"#0369a1",titulo:"KitchenFlow ECL — Encerramento da Aula",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Estado"]},
  "VerificacaoFinalAuxiliares":{cor:"#9d174d",titulo:"KitchenFlow ECL — Verificação Final (Auxiliares)",colunas:["Data","Hora","Turma","Auxiliar","Item","Correção feita","Estado"]},
  "Avisos":{cor:"#0369a1",titulo:"KitchenFlow ECL — Avisos ao Professor",colunas:["Data","Hora","Turma","ID Aluno","Nome Aluno","Mensagem"]},
  "Validações":{cor:"#0f766e",titulo:"KitchenFlow ECL — Validações do Professor",colunas:["Data","Hora","Turma","Professor","Observações","Verificados"]},
  "Ranking":{cor:"#0e7490",titulo:"KitchenFlow ECL — Ranking de Alunos",colunas:["ID Aluno","Nome Aluno","Turma","Pontos Totais","Registos","Encerramentos","Última Atualização"]},
  "Alunos":{cor:"#0c4a6e",titulo:"KitchenFlow ECL — Lista de Alunos",colunas:["Número","Nome","Turma","PIN","Estado","Data Registo","Data Criação PIN","Hora Criação PIN"]}
};

var PONTOS_POR_TABELA = {
  "Temperaturas":5,"Higiene Pessoal":1,"Receção Matérias-Primas":5,"Conservação Produtos":5,
  "Regeneração":5,"Amostra Testemunho":5,"Desinfeção":5,"Controlo Óleos":5,
  "Temperatura Serviço":5,"Higienização":1,"Panos Solução":1,
  "Manutenção, Avarias e Prevenção":1,"NãoConformidades":1,"Faltas e Necessidades":1,"Presenças":10,
  "Encerramento":10
};

// Folhas que não vão para a cópia do ficheiro de registos PDF (têm PINs ou não são registos HACCP).
var NAO_DUPLICAR = {"Alunos":true,"Ranking":true,"Avisos":true,"Validações":true};

function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function folha_(){return SpreadsheetApp.getActiveSpreadsheet();}

// ═══════════════════════════════════════════════════════════════
// INSTALAR (uma só vez, no Google Sheets novo)
// ═══════════════════════════════════════════════════════════════
/**
 * Executar uma vez: cria todas as folhas (vazias) com os cabeçalhos certos e liga
 * a cópia de segurança diária, a proteção das folhas e os avisos por email.
 */
function prepararTudo(){
  prepararFolhas();
  instalarAutomatismos();
  SpreadsheetApp.getUi().alert("KitchenFlow v"+VERSAO+" preparado: as folhas estão criadas e vazias.\n\nFalta só: Implementar > Nova implementação > Aplicação Web.");
}

/** Cria as folhas que faltam, com título e cabeçalho; apaga a «Folha1» vazia. */
function prepararFolhas(){
  var ss=folha_();
  Object.keys(SHEET_CONFIG).forEach(function(nome){
    var tab=ss.getSheetByName(nome);
    if(!tab)tab=ss.insertSheet(nome);
    if(tab.getLastRow()===0){var c=SHEET_CONFIG[nome];criarCabecalho(tab,c.colunas,c.cor,c.titulo);}
  });
  ["Folha1","Folha 1","Sheet1"].forEach(function(n){
    var t=ss.getSheetByName(n);
    if(t&&t.getLastRow()===0&&ss.getSheets().length>1)ss.deleteSheet(t);
  });
  SpreadsheetApp.flush();
}

/** Cópia de segurança diária, proteção das folhas e avisos por email (faltas e NC escaladas). */
function instalarAutomatismos(){
  ScriptApp.getProjectTriggers().forEach(function(t){
    var f=t.getHandlerFunction();
    if(f==="copiaDeSegurancaDiaria"||f==="tarefaPeriodica")ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("copiaDeSegurancaDiaria").timeBased().everyDays(1).atHour(23).inTimezone("Europe/Lisbon").create();
  ScriptApp.newTrigger("tarefaPeriodica").timeBased().everyHours(1).create();
  copiaDeSegurancaDiaria();
}

// ═══════════════════════════════════════════════════════════════
// Cópia de segurança e proteção
// ═══════════════════════════════════════════════════════════════
function pastaCopias_(){var it=DriveApp.getFoldersByName(PASTA_COPIAS);return it.hasNext()?it.next():DriveApp.createFolder(PASTA_COPIAS);}

/** Só a conta dona pode editar à mão (a aplicação escreve na mesma, porque corre com a conta dona). */
function protegerFolhas_(ss){
  var dono=Session.getEffectiveUser();
  ss.getSheets().forEach(function(sh){
    var p=sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0]||sh.protect();
    p.setDescription("Registos HACCP: só a coordenação pode alterar");
    p.addEditor(dono);
    p.removeEditors(p.getEditors().filter(function(u){return u.getEmail()!==dono.getEmail();}));
    if(p.canDomainEdit())p.setDomainEdit(false);
  });
}

function copiaDeSegurancaDiaria(){
  var ss=folha_();
  protegerFolhas_(ss);
  var nome="KitchenFlow registos "+Utilities.formatDate(new Date(),"Europe/Lisbon","yyyy-MM-dd");
  var pasta=pastaCopias_();
  if(pasta.getFilesByName(nome).hasNext())return;
  var copia=DriveApp.getFileById(ss.getId()).makeCopy(nome,pasta);
  protegerFolhas_(SpreadsheetApp.openById(copia.getId()));
}

// ═══════════════════════════════════════════════════════════════
// Alunos e PIN
// ═══════════════════════════════════════════════════════════════
function tabAlunos_(){
  var ss=folha_(),tab=ss.getSheetByName("Alunos");
  if(!tab){tab=ss.insertSheet("Alunos");var c=SHEET_CONFIG["Alunos"];criarCabecalho(tab,c.colunas,c.cor,c.titulo);}
  return tab;
}
function agoraTexto_(){var a=new Date(),tz=Session.getScriptTimeZone();return {data:Utilities.formatDate(a,tz,"dd/MM/yyyy"),hora:Utilities.formatDate(a,tz,"HH:mm")};}

function validarLogin(numero,pin){
  var rows=tabAlunos_().getDataRange().getValues();
  for(var i=4;i<rows.length;i++){
    var row=rows[i];
    if(String(row[0]).trim()===String(numero).trim()&&String(row[3]).trim()===String(pin).trim()&&String(row[4]).trim().toLowerCase()==="ativo"){
      return {ok:true,numero:String(row[0]).trim(),nome:String(row[1]).trim(),turma:String(row[2]).trim(),estado:String(row[4]).trim()};
    }
  }
  return {ok:false,erro:"Número ou PIN incorreto"};
}

/** Muda o PIN do aluno certo: número E turma (na v5.5 bastava o número, e podia mudar o de outra turma). */
function registarPinAluno(numero,pin,turma){
  var tab=tabAlunos_(),rows=tab.getDataRange().getValues(),t=agoraTexto_();
  for(var i=4;i<rows.length;i++){
    if(String(rows[i][0]).trim()===String(numero).trim()&&(!turma||String(rows[i][2]).trim()===String(turma).trim())){
      tab.getRange(i+1,4).setValue(pin);tab.getRange(i+1,7).setValue(t.data);tab.getRange(i+1,8).setValue(t.hora);
      return true;
    }
  }
  return false;
}

/** Acrescenta o aluno ou, se já existir (número + turma), atualiza nome e PIN. */
function upsertAluno_(numero,nome,turma,pin,soCriar){
  var tab=tabAlunos_(),rows=tab.getDataRange().getValues(),t=agoraTexto_();
  for(var i=4;i<rows.length;i++){
    if(String(rows[i][0]).trim()===String(numero).trim()&&String(rows[i][2]).trim()===String(turma).trim()){
      if(soCriar)return {ok:true,novo:false};
      if(nome)tab.getRange(i+1,2).setValue(nome);
      if(pin&&String(pin)!=="Sem PIN"){tab.getRange(i+1,4).setValue(pin);tab.getRange(i+1,7).setValue(t.data);tab.getRange(i+1,8).setValue(t.hora);}
      return {ok:true,novo:false};
    }
  }
  var temPin=pin&&String(pin)!=="Sem PIN";
  tab.appendRow([numero,nome||"",turma,temPin?pin:"","ativo",t.data,temPin?t.data:"",temPin?t.hora:""]);
  formatarLinha(tab,tab.getLastRow(),8);
  return {ok:true,novo:true};
}
function upsertAlunoAvaliacaoECL(numero,nome,turma,pin){return upsertAluno_(numero,nome,turma,pin,false);}
function registarAlunoECL(numero,nome,turma,pin){return upsertAluno_(numero,nome,turma,pin,true);}

function getAlunosAvaliacaoECL(turmaFiltro){
  var tab=folha_().getSheetByName("Alunos");
  if(!tab)return {ok:true,dados:[]};
  var rows=tab.getDataRange().getValues(),lista=[];
  for(var i=4;i<rows.length;i++){
    var row=rows[i];
    if(!row[0])continue;
    if(turmaFiltro&&String(row[2]).trim()!==String(turmaFiltro).trim())continue;
    lista.push({numero:String(row[0]||"").trim(),nome:String(row[1]||"").trim(),turma:String(row[2]||"").trim(),pin:String(row[3]||"").trim(),estado:String(row[4]||"").trim()});
  }
  return {ok:true,dados:lista};
}

// ═══════════════════════════════════════════════════════════════
// Formatação, Ranking e cópia para o ficheiro de registos PDF
// ═══════════════════════════════════════════════════════════════
function criarCabecalho(tab,colunas,corHex,titulo){
  if(!tab)return;
  try{
    var n=Math.max(colunas.length,4);
    tab.getRange(1,1).setValue(titulo);
    var t=tab.getRange(1,1,1,n);
    try{t.merge();}catch(e){}
    t.setBackground(corHex).setFontColor("#fff").setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center");
    tab.setRowHeight(1,35);
    tab.getRange(2,1,1,5).setValues([["Escola de Comércio de Lisboa — Cozinha Pedagógica","","KitchenFlow ECL v"+VERSAO,"",new Date().toLocaleDateString("pt-PT")]]);
    tab.getRange(2,1,1,n).setBackground("#f0f9ff").setFontColor("#0369a1").setFontSize(9).setFontStyle("italic");
    tab.setRowHeight(2,20);tab.setRowHeight(3,8);
    tab.getRange(4,1,1,colunas.length).setValues([colunas]);
    tab.getRange(4,1,1,colunas.length).setBackground(corHex).setFontColor("#fff").setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center").setWrap(true);
    tab.setRowHeight(4,32);tab.setFrozenRows(4);
    for(var j=1;j<=colunas.length;j++)tab.setColumnWidth(j,110);
    tab.setColumnWidth(1,90);
  }catch(err){Logger.log("Erro criarCabecalho: "+err);}
}

function formatarLinha(tab,rowNum,numCols){
  if(!tab||numCols<1)return;
  tab.getRange(rowNum,1,1,numCols).setBackground(rowNum%2===0?"#f0f9ff":"#fff").setFontSize(9).setVerticalAlignment("middle");
}

function atualizarRanking(idAluno,nomeAluno,turma,tabela){
  var ss=folha_(),rt=ss.getSheetByName("Ranking");
  if(!rt){rt=ss.insertSheet("Ranking");var c=SHEET_CONFIG["Ranking"];criarCabecalho(rt,c.colunas,c.cor,c.titulo);}
  var pts=PONTOS_POR_TABELA[tabela]||1,isEnc=tabela==="Encerramento";
  var data=rt.getDataRange().getValues(),idx=-1;
  for(var i=4;i<data.length;i++){if(String(data[i][0])===String(idAluno)){idx=i+1;break;}}
  var agora=new Date().toLocaleString("pt-PT");
  if(idx===-1){
    rt.appendRow([idAluno,nomeAluno||idAluno,turma,pts,isEnc?0:1,isEnc?1:0,agora]);
    formatarLinha(rt,rt.getLastRow(),7);
  }else{
    var l=data[idx-1];
    rt.getRange(idx,2,1,6).setValues([[nomeAluno||l[1],l[2]||turma,(Number(l[3])||0)+pts,(Number(l[4])||0)+(isEnc?0:1),(Number(l[5])||0)+(isEnc?1:0),agora]]);
  }
}

/** Ordena o Ranking (uma vez por hora, e não em cada registo, para não atrasar os alunos). */
function ordenarRanking(){
  var rt=folha_().getSheetByName("Ranking");
  if(!rt)return;
  var lr=rt.getLastRow();
  if(lr>5)rt.getRange(5,1,lr-4,7).sort({column:4,ascending:false});
}

function duplicarRegistoPDF(tabela,linha){
  try{
    if(!SHEET_CONFIG[tabela]||NAO_DUPLICAR[tabela]||!SHEET_ID_PDF_REGISTOS)return;
    var ss2=SpreadsheetApp.openById(SHEET_ID_PDF_REGISTOS);
    var tab2=ss2.getSheetByName(tabela);
    if(!tab2)tab2=ss2.insertSheet(tabela);
    if(tab2.getLastRow()===0){var cfg=SHEET_CONFIG[tabela];criarCabecalho(tab2,cfg.colunas,cfg.cor,cfg.titulo);}
    tab2.appendRow(linha);
  }catch(err){Logger.log("Erro duplicar PDF registos: "+err);}
}

// ═══════════════════════════════════════════════════════════════
// Relatório de NC em PDF e resumo do encerramento
// ═══════════════════════════════════════════════════════════════
function gerarRelatorioNC(nc){
  try{
    var ss=folha_();
    var tempSheet=ss.insertSheet("_NC_TEMP_"+new Date().getTime());
    tempSheet.getRange(1,1).setValue("ESCOLA DE COMÉRCIO DE LISBOA");
    tempSheet.getRange(1,1,1,2).merge().setBackground("#0c4a6e").setFontColor("#fff").setFontWeight("bold").setFontSize(16).setHorizontalAlignment("center");
    tempSheet.setRowHeight(1,40);
    tempSheet.getRange(2,1).setValue("Relatório de Não Conformidade");
    tempSheet.getRange(2,1,1,2).merge().setBackground("#dc2626").setFontColor("#fff").setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center");
    tempSheet.setRowHeight(2,28);
    var linhas=[
      ["Data",nc.date],["Hora",nc.time],["Turma",nc.turma],
      ["Registado por",(nc.nomeAluno||nc.responsavel)+" ("+nc.responsavel+")"],
      ["Zona / Equipamento",nc.zona],["Gravidade",nc.criticidade==="critica"?"Crítica":"Normal"],
      ["Descrição",nc.descricao],["Ação Corretiva",nc.acaoCorretiva||"—"],
      ["Decisão do Professor",nc.decisao||"—"],["Estado Final",nc.estado],["Professor",nc.professor||"—"]
    ];
    var r=4;
    linhas.forEach(function(l){
      tempSheet.getRange(r,1).setValue(l[0]).setFontWeight("bold").setBackground("#e0f2fe").setFontColor("#0369a1");
      tempSheet.getRange(r,2).setValue(l[1]);
      tempSheet.getRange(r,1,1,2).setBorder(true,true,true,true,false,false);
      tempSheet.setRowHeight(r,Math.max(24,Math.ceil(String(l[1]).length/60)*20));
      r++;
    });
    tempSheet.setColumnWidth(1,160);tempSheet.setColumnWidth(2,420);
    tempSheet.getRange(r+1,1).setValue("Documento gerado automaticamente pelo KitchenFlow ECL em "+new Date().toLocaleString("pt-PT"));
    tempSheet.getRange(r+1,1,1,2).merge().setFontSize(8).setFontStyle("italic").setFontColor("#999");
    SpreadsheetApp.flush();
    var exportUrl=ss.getUrl().replace(/edit$/,"")+"export?format=pdf&gid="+tempSheet.getSheetId()+"&size=A4&portrait=true&fitw=true&top_margin=0.4&bottom_margin=0.4&left_margin=0.4&right_margin=0.4&gridlines=false&printtitle=false&sheetnames=false";
    var response=UrlFetchApp.fetch(exportUrl,{headers:{Authorization:"Bearer "+ScriptApp.getOAuthToken()}});
    var nomeArquivo="NC_"+String(nc.turma).replace(/[^a-zA-Z0-9]/g,"_")+"_"+String(nc.date).replace(/\//g,"-")+"_"+String(nc.zona).replace(/[^a-zA-Z0-9]/g,"_")+".pdf";
    var pdfBlob=response.getBlob().setName(nomeArquivo);
    ss.deleteSheet(tempSheet);
    // O PDF fica privado (na pasta da coordenação): já não fica aberto a quem tiver o link.
    return getOrCriarPastaRelatoriosNC().createFile(pdfBlob).getUrl();
  }catch(err){Logger.log("Erro gerarRelatorioNC: "+err);return "";}
}

function getOrCriarPastaRelatoriosNC(){
  var nome="KitchenFlow ECL - Relatórios NC",pastas=DriveApp.getFoldersByName(nome);
  return pastas.hasNext()?pastas.next():DriveApp.createFolder(nome);
}

function enviarResumoEncerramento(d){
  try{
    var assunto="📋 Resumo de Encerramento — "+d.turma+" — "+d.date;
    var corpo="Exma. Senhora Formadora,\n\nResumo do encerramento da aula prática:\n\n";
    corpo+="Turma: "+d.turma+"\nData: "+d.date+"\nHora de encerramento: "+d.time+"\nResponsável pelo encerramento: "+d.nomeAluno+" ("+d.aluno+")\n\n";
    corpo+="--- Presenças ---\n";
    if(d.presentes&&d.presentes.length){d.presentes.forEach(function(p){corpo+="• "+p.nome+" — "+p.time+"\n";});}else corpo+="Sem registos de presença.\n";
    if(d.faltas&&d.faltas.length){corpo+="\nAlunos sem presença registada:\n";d.faltas.forEach(function(f){corpo+="• "+f+"\n";});}
    corpo+="\n--- Não Conformidades do dia ---\n";
    if(d.ncs&&d.ncs.length){d.ncs.forEach(function(nc){corpo+="• "+nc.zona+": "+nc.descricao+" — Estado: "+(nc.estado||"sem decisão")+(nc.decisao?" ("+nc.decisao+")":"")+"\n";});}else corpo+="Sem não conformidades registadas.\n";
    corpo+="\n--- Itens marcados como Não Aplicável hoje ---\n";
    if(d.naItens&&d.naItens.length){d.naItens.forEach(function(i){corpo+="• "+i+"\n";});}else corpo+="Nenhum.\n";
    if(d.obs)corpo+="\n--- Observações do aluno ---\n"+d.obs+"\n";
    corpo+="\nCom os melhores cumprimentos,\nKitchenFlow ECL\nEscola de Comércio de Lisboa";
    GmailApp.sendEmail(EMAIL_COORDENACAO,assunto,corpo);
  }catch(err){Logger.log("Erro resumo encerramento: "+err);}
}

// ═══════════════════════════════════════════════════════════════
// doGet
// ═══════════════════════════════════════════════════════════════
var MAPA_TIPOS_PDF = {
  "temperaturas":"Temperaturas","higiene":"Higiene Pessoal","recepcao":"Receção Matérias-Primas",
  "conservacao":"Conservação Produtos","regeneracao":"Regeneração","testemunho":"Amostra Testemunho",
  "desinfecao":"Desinfeção","oleos":"Controlo Óleos","tempservico":"Temperatura Serviço",
  "higienizacao":"Higienização","panos":"Panos Solução","manutencao":"Manutenção, Avarias e Prevenção",
  "naoconformidades":"NãoConformidades","faltas":"Faltas e Necessidades","encerramento":"Encerramento",
  "ranking":"Ranking","presenca":"Presenças","verifFinalAux":"VerificacaoFinalAuxiliares","producao":"Produção"
};

function doGet(e){
  try{
    var p=e.parameter||{};
    if(p.action==="versao")return json_({ok:true,versao:VERSAO});
    if(p.action==="login")return json_(validarLogin(p.numero,p.pin));
    if(p.action==="get_alunos")return json_(getAlunosAvaliacaoECL(p.turma||""));
    if(p.action==="pdf"){
      var nomeTabela=MAPA_TIPOS_PDF[p.tipo||"temperaturas"];
      if(!nomeTabela)return json_({ok:false,erro:"Tipo desconhecido: "+p.tipo});
      var pdfBlob=gerarPDFGenerico(nomeTabela,parseInt(p.ano)||new Date().getFullYear(),parseInt(p.mes)||(new Date().getMonth()+1),p.turma||"");
      if(!pdfBlob)return json_({ok:false,erro:"Sem dados"});
      return json_({ok:true,pdf:Utilities.base64Encode(pdfBlob.getBytes()),filename:pdfBlob.getName()});
    }
    var tab=folha_().getSheetByName(p.tabela);
    if(!tab)return json_({ok:true,dados:[]});
    return json_({ok:true,dados:tab.getDataRange().getValues()});
  }catch(err){return json_({ok:false,erro:String(err)});}
}

// ═══════════════════════════════════════════════════════════════
// doPost — um registo de cada vez e sem repetidos
// ═══════════════════════════════════════════════════════════════
function doPost(e){
  var data;
  try{data=JSON.parse(e.postData.contents);}catch(err){return json_({ok:false,erro:"Pedido inválido"});}

  // Pedidos que não escrevem linhas de registo.
  if(data.action==="resumoEncerramento"){enviarResumoEncerramento(data);return json_({ok:true});}
  if(data.action==="gerarRelatorioNC")return json_(relatorioNC_(data.nc));

  var cache=CacheService.getScriptCache();
  var chaveEnvio=data.idEnvio?"envio_"+String(data.idEnvio).slice(0,80):"";
  if(chaveEnvio&&cache.get(chaveEnvio))return json_({ok:true,repetido:true});

  var lock=LockService.getScriptLock();
  if(!lock.tryLock(25000))return json_({ok:false,erro:"ocupado",tentarDeNovo:true});
  var resposta;
  try{
    if(chaveEnvio&&cache.get(chaveEnvio))return json_({ok:true,repetido:true});
    if(data.action==="criarPin"||data.action==="alterarPin")resposta={ok:registarPinAluno(data.numero,data.pin,data.turma)};
    else if(data.action==="registarAlunoECL")resposta=registarAlunoECL(data.numero,data.nome,data.turma,data.pin);
    else if(data.action==="upsert_aluno")resposta=upsertAlunoAvaliacaoECL(data.numero,data.nome,data.turma,data.pin);
    else if(data.tabela==="Alunos"&&Array.isArray(data.linha)){
      // O «Criar PIN» do KitchenFlow envia a linha inteira: corrige a do aluno em vez de acrescentar outra.
      var l=data.linha;
      resposta=upsertAluno_(l[0],l[1],l[2],l[3],false);
    }else if(data.tabela&&Array.isArray(data.linha)){
      var ss=folha_(),tab=ss.getSheetByName(data.tabela);
      if(!tab)tab=ss.insertSheet(data.tabela);
      if(tab.getLastRow()===0){var cfg=SHEET_CONFIG[data.tabela];if(cfg)criarCabecalho(tab,cfg.colunas,cfg.cor,cfg.titulo);}
      tab.appendRow(data.linha);
      formatarLinha(tab,tab.getLastRow(),Math.max(tab.getLastColumn(),data.linha.length));
      if(PONTOS_POR_TABELA[data.tabela]&&data.linha[3])atualizarRanking(data.linha[3],data.linha[4]||"",data.linha[2]||"",data.tabela);
      SpreadsheetApp.flush();
      resposta={ok:true};
    }else resposta={ok:false,erro:"Pedido sem tabela"};
    if(resposta.ok&&chaveEnvio)cache.put(chaveEnvio,"1",21600);
  }catch(err){
    Logger.log("Erro doPost: "+err);
    resposta={ok:false,erro:String(err),tentarDeNovo:true};
  }finally{lock.releaseLock();}
  if(resposta.ok&&data.tabela&&Array.isArray(data.linha))duplicarRegistoPDF(data.tabela,data.linha);
  return json_(resposta);
}

/** Gera o PDF da NC (fora da fila, porque demora) e só depois atualiza a linha da NC. */
function relatorioNC_(nc){
  if(!nc||!nc.date)return {ok:false,erro:"nc ausente ou sem date"};
  var pdfUrl=gerarRelatorioNC(nc);
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(25000))return {ok:true,pdfUrl:pdfUrl};
  try{
    var tabNC=folha_().getSheetByName("NãoConformidades");
    if(tabNC){
      var rows=tabNC.getDataRange().getValues(),tz=Session.getScriptTimeZone();
      for(var i=4;i<rows.length;i++){
        var row=rows[i];
        var dataStr=row[0] instanceof Date?Utilities.formatDate(row[0],tz,"dd/MM/yyyy"):String(row[0]).trim();
        var horaStr=row[1] instanceof Date?Utilities.formatDate(row[1],tz,"HH:mm"):String(row[1]).trim();
        var desc=String(row[6]).trim();
        var descOk=desc===nc.descricao||desc==="[ESCALADA AO COORDENADOR] "+nc.descricao;
        if(horaStr===nc.time&&dataStr===nc.date&&String(row[2]).trim()===nc.turma&&String(row[5]).trim()===nc.zona&&String(row[3]).trim()===String(nc.responsavel)&&descOk&&String(row[8]).trim()!=="validada"){
          tabNC.getRange(i+1,9,1,3).setValues([[nc.estado,nc.criticidade==="critica"?"Crítica":"Normal",nc.decisao||""]]);
          if(pdfUrl)tabNC.getRange(i+1,12).setValue(pdfUrl).setFontColor("#0369a1");
          break;
        }
      }
    }
  }catch(err){Logger.log("Erro update NC: "+err);}finally{lock.releaseLock();}
  return {ok:true,pdfUrl:pdfUrl};
}

// ═══════════════════════════════════════════════════════════════
// Avisos por email (de hora a hora) e PDF mensal
// ═══════════════════════════════════════════════════════════════
function verificarEEnviarNCsCriticas(){
  try{
    var tab=folha_().getSheetByName("NãoConformidades");
    if(!tab)return;
    var tz=Session.getScriptTimeZone(),hojeStr=Utilities.formatDate(new Date(),tz,"dd/MM/yyyy");
    tab.getDataRange().getValues().slice(4).forEach(function(row,i){
      var dataStr=row[0] instanceof Date?Utilities.formatDate(row[0],tz,"dd/MM/yyyy"):String(row[0]).trim();
      var descricao=String(row[6]||"");
      if(dataStr===hojeStr&&descricao.indexOf("[ESCALADA AO COORDENADOR]")===0&&row[9]!=="email_enviado"){
        var corpo="Foi reportada uma Não Conformidade que necessita de ação externa.\n\nData: "+dataStr+"\nHora: "+row[1]+"\nTurma: "+row[2]+"\nZona/Equipamento: "+row[5]+"\nDescrição: "+descricao.replace("[ESCALADA AO COORDENADOR] ","")+"\nEstado: "+row[8]+"\nRegistado por: "+row[4]+" ("+row[3]+")\n\nKitchenFlow ECL\nEscola de Comércio de Lisboa";
        GmailApp.sendEmail(EMAIL_COORDENACAO,"🔧 Não Conformidade — Necessita Manutenção/Ação Externa | "+dataStr,corpo);
        tab.getRange(i+5,10).setValue("email_enviado").setBackground("#e0f2fe").setFontColor("#0369a1").setFontWeight("bold");
      }
    });
  }catch(err){Logger.log("Erro NC: "+err);}
}

function verificarEEnviarFaltas(){
  try{
    var tab=folha_().getSheetByName("Faltas e Necessidades");
    if(!tab)return;
    var tz=Session.getScriptTimeZone(),hojeStr=Utilities.formatDate(new Date(),tz,"dd/MM/yyyy");
    tab.getDataRange().getValues().slice(4).forEach(function(row,i){
      var dataStr=row[0] instanceof Date?Utilities.formatDate(row[0],tz,"dd/MM/yyyy"):String(row[0]).trim();
      if(dataStr===hojeStr&&!row[11]){
        var corpo="Exma. Senhora Coordenadora,\n\nNo dia "+dataStr+", pelas "+row[1]+", foi detetada uma falta.\n\nTipo: "+row[5]+"\nDescrição: "+row[6]+"\nQuantidade: "+(row[7]||"—")+"\nUrgência: "+row[8]+"\nRegistado por: "+row[4]+" ("+row[3]+") — Turma "+row[2]+"\n\nKitchenFlow ECL\nEscola de Comércio de Lisboa";
        GmailApp.sendEmail(EMAIL_COORDENACAO,"Cozinha Pedagógica ECL — Falta "+String(row[8]).toUpperCase()+" | "+dataStr,corpo);
        tab.getRange(i+5,12).setValue("enviado").setBackground("#e0f2fe").setFontColor("#0369a1").setFontWeight("bold");
      }
    });
  }catch(err){Logger.log("Erro faltas: "+err);}
}

function tarefaPeriodica(){
  verificarEEnviarFaltas();
  verificarEEnviarNCsCriticas();
  ordenarRanking();
}

function testarEmail(){
  GmailApp.sendEmail(EMAIL_COORDENACAO,"Teste KitchenFlow ECL v"+VERSAO,"Sistema a funcionar.\n\nKitchenFlow ECL v"+VERSAO+"\nEscola de Comércio de Lisboa");
  SpreadsheetApp.getUi().alert("Email de teste enviado!");
}

function gerarPDFGenerico(nomeTabela,ano,mes,turma){
  var ss=folha_(),tab=ss.getSheetByName(nomeTabela),cfg=SHEET_CONFIG[nomeTabela];
  if(!tab||!cfg)return null;
  var data=tab.getDataRange().getValues();
  if(data.length<5)return null;
  var tz=Session.getScriptTimeZone(),mesStr=("0"+mes).slice(-2);
  var filtradas=data.slice(4).filter(function(row){
    if(!row[0])return false;
    var d=row[0] instanceof Date?Utilities.formatDate(row[0],tz,"dd/MM/yyyy"):String(row[0]).trim();
    var p=d.split("/");
    return p.length===3&&p[1]===mesStr&&p[2]===String(ano)&&(!turma||String(row[nomeTabela==="Produção"?1:2]).trim()===turma);
  });
  var tempSheet=ss.insertSheet("_PDF_TEMP_"+new Date().getTime());
  var nomesMeses=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  var cabecalhos=data[3],numCols=cabecalhos.length,isLandscape=numCols>8;
  tempSheet.getRange(1,1).setValue("ESCOLA DE COMÉRCIO DE LISBOA");
  tempSheet.getRange(1,1,1,numCols).merge().setBackground("#0c4a6e").setFontColor("#fff").setFontWeight("bold").setFontSize(16).setHorizontalAlignment("center");
  tempSheet.getRange(2,1).setValue(cfg.titulo);
  tempSheet.getRange(2,1,1,numCols).merge().setBackground(cfg.cor).setFontColor("#fff").setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center");
  tempSheet.getRange(3,1).setValue(nomesMeses[mes-1]+" "+ano+(turma?" — Turma "+turma:" — Todas as Turmas"));
  tempSheet.getRange(3,1,1,numCols).merge().setBackground("#e0f2fe").setFontColor("#0369a1").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center");
  tempSheet.getRange(5,1,1,numCols).setValues([cabecalhos]).setBackground(cfg.cor).setFontColor("#fff").setFontWeight("bold").setFontSize(9).setHorizontalAlignment("center").setWrap(true);
  if(filtradas.length){
    filtradas=filtradas.map(function(l){var x=l.slice(0,numCols);while(x.length<numCols)x.push("");return x;});
    tempSheet.getRange(6,1,filtradas.length,numCols).setValues(filtradas).setFontSize(8).setHorizontalAlignment("center");
  }else{
    tempSheet.getRange(6,1).setValue("Sem registos para este período.");
    tempSheet.getRange(6,1,1,numCols).merge().setFontStyle("italic").setFontColor("#999").setHorizontalAlignment("center");
  }
  var lastRow=6+Math.max(filtradas.length,1)+1;
  tempSheet.getRange(lastRow,1).setValue("Documento gerado automaticamente pelo KitchenFlow ECL em "+new Date().toLocaleString("pt-PT")+" — Total de registos: "+filtradas.length);
  tempSheet.getRange(lastRow,1,1,numCols).merge().setFontSize(8).setFontStyle("italic").setFontColor("#999");
  SpreadsheetApp.flush();
  var exportUrl=ss.getUrl().replace(/edit$/,"")+"export?format=pdf&gid="+tempSheet.getSheetId()+"&size=A4&portrait="+(!isLandscape)+"&fitw=true&top_margin=0.3&bottom_margin=0.3&left_margin=0.3&right_margin=0.3&gridlines=false&printtitle=false&sheetnames=false&pagenumbers=true&horizontal_alignment=CENTER";
  var response=UrlFetchApp.fetch(exportUrl,{headers:{Authorization:"Bearer "+ScriptApp.getOAuthToken()}});
  var pdfBlob=response.getBlob().setName(nomeTabela.replace(/[^a-zA-Z0-9]/g,"_")+"_"+nomesMeses[mes-1]+"_"+ano+(turma?"_"+turma.replace(/[^a-zA-Z0-9]/g,"_"):"")+".pdf");
  ss.deleteSheet(tempSheet);
  return pdfBlob;
}
