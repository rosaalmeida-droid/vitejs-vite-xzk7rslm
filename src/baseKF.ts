// ============================================================
// Base de dados (Firebase) do KitchenFlow — Rosa, 13/out/2026
// ============================================================
// Como na Avaliação ECL: cada registo vai logo para a base de dados do Google
// (chega aos outros telemóveis em menos de um segundo) e continua a ir para o
// Google Sheets, que fica como registo oficial e cópia. Os telemóveis ouvem
// os registos de hoje: o «Já feito por…» aparece logo nos colegas, e o
// professor e a coordenadora veem os registos sem esperar pelo Sheets.
//
// É a mesma base da Avaliação ECL (projeto avaliacao-ecl), na coleção
// «kitchenflow». Sem ligação, ou enquanto as regras da base não deixarem,
// tudo continua pelo Sheets, como antes.
// ============================================================
import type { Firestore } from 'firebase/firestore';
import { TURMAS_ECL } from './alunosECL';

// Não é segredo: vai em todas as aplicações web. Quem protege os dados são as
// regras da base (firestore.rules, na Avaliação ECL) e a entrada anónima.
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA-OIBh5AJiGgmCtVPF9QR84tNhKkH6QhU',
  authDomain: 'avaliacao-ecl.firebaseapp.com',
  projectId: 'avaliacao-ecl',
  storageBucket: 'avaliacao-ecl.firebasestorage.app',
  messagingSenderId: '685153353060',
  appId: '1:685153353060:web:fb36f2680bdaf1af12ce71',
};
const COLECAO = 'kitchenflow';

/** As linhas de registo de hoje, por folha (no formato das linhas do Sheets). */
export type LinhasPorTabela = Record<string, unknown[][]>;

let aLigar: Promise<Firestore | null> | null = null;
/** Liga-se uma vez (o código do Firebase só se descarrega quando é preciso). */
function ligar(): Promise<Firestore | null> {
  if (aLigar) return aLigar;
  aLigar = (async () => {
    try {
      const [{ initializeApp }, fs, { getAuth, signInAnonymously }] = await Promise.all([
        import('firebase/app'), import('firebase/firestore'), import('firebase/auth'),
      ]);
      const app = initializeApp(FIREBASE_CONFIG);
      let db: Firestore;
      // Guarda no aparelho o que ainda não chegou e envia quando houver rede.
      try {
        db = fs.initializeFirestore(app, {
          ignoreUndefinedProperties: true,
          localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
        });
      } catch {
        db = fs.initializeFirestore(app, { ignoreUndefinedProperties: true });
      }
      await signInAnonymously(getAuth(app));
      return db;
    } catch (e) {
      console.warn('[base] não foi possível ligar:', e);
      aLigar = null;
      return null;
    }
  })();
  return aLigar;
}

const hojePT = () => new Date().toLocaleDateString('pt-PT');
/** A turma do registo: a primeira coluna que é uma turma (na maioria das folhas, a 3.ª). */
function turmaDaLinha(linha: unknown[]): string {
  const t = linha.find(v => TURMAS_ECL.includes(String(v)));
  return t ? String(t) : '';
}
/** O que a base aceita numa lista: sem «undefined» nem listas dentro de listas. */
const limpo = (v: unknown) => v === undefined ? null : (v !== null && typeof v === 'object') ? JSON.stringify(v) : v;

/** Grava o registo na base (além do Sheets). Devolve true quando a base o aceitou. */
export async function gravarRegistoNaBase(idEnvio: string, tabela: string, linha: unknown[]): Promise<boolean> {
  if (!idEnvio || !tabela || !Array.isArray(linha)) return false;
  const db = await ligar();
  if (!db) return false;
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    await setDoc(doc(db, COLECAO, String(idEnvio).replace(/\//g, '∕')), {
      tabela, linha: linha.map(limpo), dia: hojePT(), turma: turmaDaLinha(linha), idEnvio,
      gravadoNaBaseEm: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('[base] não gravou', tabela, e);
    return false;
  }
}

let deHoje: LinhasPorTabela = {};
let deHojeDia = '';
/** As linhas de hoje que a base já trouxe para esta folha (vazio se ainda não ouviu). */
export function linhasDeHojeNaBase(tabela: string): unknown[][] {
  return deHojeDia === hojePT() ? (deHoje[tabela] || []) : [];
}

/** Fica a ouvir os registos de hoje (de uma turma, ou de todas). Cada mudança
 *  chega na hora. Passa a meia-noite sozinho. Devolve a função que para. */
export function ouvirRegistosDeHoje(turma: string | null, aoMudar: (porTabela: LinhasPorTabela) => void): () => void {
  let vivo = true;
  let parar: (() => void) | null = null;
  let dia = '';
  const comecar = async () => {
    const db = await ligar();
    if (!db || !vivo) return;
    const { collection, query, where, onSnapshot } = await import('firebase/firestore');
    if (!vivo) return;
    if (parar) { parar(); parar = null; }
    dia = hojePT();
    const filtros = [where('dia', '==', dia)];
    if (turma) filtros.push(where('turma', '==', turma));
    parar = onSnapshot(query(collection(db, COLECAO), ...filtros), snap => {
      const porTabela: LinhasPorTabela = {};
      snap.docs.forEach(d => {
        const x = d.data() as { tabela?: string; linha?: unknown[] };
        if (!x.tabela || !Array.isArray(x.linha)) return;
        (porTabela[x.tabela] ||= []).push(x.linha);
      });
      deHoje = porTabela; deHojeDia = dia;
      if (vivo) aoMudar(porTabela);
    }, e => console.warn('[base] escuta', e));
  };
  comecar();
  // À meia-noite passa a ouvir o dia novo.
  const t = setInterval(() => { if (vivo && dia && dia !== hojePT()) comecar(); }, 5 * 60000);
  return () => { vivo = false; clearInterval(t); if (parar) parar(); };
}
