/**
 * KitchenFlow ECL: cópia de segurança diária e proteção dos registos HACCP.
 *
 * Como instalar (uma só vez, com a conta dona do Google Sheets do KitchenFlow):
 *   1. Abrir o Google Sheets do KitchenFlow > Extensões > Apps Script.
 *   2. À esquerda, carregar em «+» > «Script» e dar o nome CopiaSeguranca.
 *   3. Apagar o que lá estiver, colar todo este texto e carregar em «Guardar».
 *   4. No topo, escolher a função «instalarCopiaSeguranca» e carregar em «Executar».
 *   5. Aceitar as autorizações que o Google pedir (é a própria conta da escola).
 *
 * O que faz:
 *   - Protege todas as folhas: só a conta dona pode alterar ou apagar linhas à mão.
 *     A aplicação continua a escrever, porque o script corre com a conta dona.
 *   - Todas as noites, faz uma cópia completa do ficheiro para a pasta
 *     «KitchenFlow — Cópias de segurança», que não é partilhada com ninguém.
 *   - As cópias também ficam protegidas e nunca são apagadas.
 */

var PASTA_COPIAS = 'KitchenFlow — Cópias de segurança';
var ID_DA_FOLHA = ''; // Deixar vazio se o script estiver dentro do Google Sheets.

function folhaKF_() {
  var ss = ID_DA_FOLHA ? SpreadsheetApp.openById(ID_DA_FOLHA) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Não encontrei o Google Sheets do KitchenFlow. Escreva o ID do ficheiro em ID_DA_FOLHA.');
  return ss;
}

function pastaCopias_() {
  var it = DriveApp.getFoldersByName(PASTA_COPIAS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PASTA_COPIAS);
}

/** Só a conta dona pode editar à mão cada folha do ficheiro. */
function protegerFolhas_(ss) {
  var dono = Session.getEffectiveUser();
  ss.getSheets().forEach(function (sh) {
    var p = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0] || sh.protect();
    p.setDescription('Registos HACCP: só a coordenação pode alterar');
    p.addEditor(dono);
    p.removeEditors(p.getEditors().filter(function (u) { return u.getEmail() !== dono.getEmail(); }));
    if (p.canDomainEdit()) p.setDomainEdit(false);
  });
}

/** Cópia completa do dia, na pasta privada. */
function copiaDeSegurancaDiaria() {
  var ss = folhaKF_();
  protegerFolhas_(ss); // também protege as folhas novas que a aplicação tenha criado
  var hoje = Utilities.formatDate(new Date(), 'Europe/Lisbon', 'yyyy-MM-dd');
  var nome = 'KitchenFlow registos ' + hoje;
  var pasta = pastaCopias_();
  if (pasta.getFilesByName(nome).hasNext()) return; // já há cópia deste dia
  var copia = DriveApp.getFileById(ss.getId()).makeCopy(nome, pasta);
  protegerFolhas_(SpreadsheetApp.openById(copia.getId()));
}

/** Executar uma vez: protege as folhas, faz a primeira cópia e agenda as seguintes (todas as noites, por volta das 23h). */
function instalarCopiaSeguranca() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'copiaDeSegurancaDiaria') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('copiaDeSegurancaDiaria').timeBased().everyDays(1).atHour(23).inTimezone('Europe/Lisbon').create();
  copiaDeSegurancaDiaria();
  Logger.log('Instalado. A primeira cópia está na pasta «' + PASTA_COPIAS + '» do Google Drive.');
}
