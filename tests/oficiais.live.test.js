import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarConsulta, validarPagina } from '../lib/fontes.js';

// Execução explícita: RADAR_TESTE_REDE=1 node --test tests/oficiais.live.test.js
test('contrato real: planos, lançamentos e subtransações oficiais', {skip:!globalThis.process.env.RADAR_TESTE_REDE},async()=>{
  const planos=criarConsulta(new URLSearchParams('fonte=planos&ano=2026'));
  const ler=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(25000)});assert.equal(r.status,200);return validarPagina(await r.json());};
  const p=await ler(planos);assert.ok(p.data.length);assert.ok(p.data.every(r=>r.ano_plano_acao===2026));
  const l=await ler(criarConsulta(new URLSearchParams('fonte=lancamentos')));
  assert.ok(l.data.length);assert.ok(l.data[0].id_lancamento_gestao_financeira);
  const vinculado=await ler(criarConsulta(new URLSearchParams({fonte:'lancamentos',conta:p.data[0].id_agencia_conta})));
  assert.ok(vinculado.data.every(r=>r.id_agencia_conta===p.data[0].id_agencia_conta));
  // Busca o primeiro lote real de subtransações para conferir o vínculo por ID.
  const r=await fetch('https://api-publica.transferegov.gestao.gov.br/especiais/gestao-financeira-subtransacoes-especiais?tamanho_da_pagina=1',{signal:AbortSignal.timeout(25000)});
  assert.equal(r.status,200);const sub=await r.json();assert.ok(sub.data[0]?.id_lancamento_gestao_financeira);
  const id=sub.data[0].id_lancamento_gestao_financeira;
  const pagamentos=await ler(criarConsulta(new URLSearchParams({fonte:'pagamentos',lancamento:id})));
  assert.ok(pagamentos.data.length);assert.ok(pagamentos.data.every(r=>r.id_lancamento_gestao_financeira===id));
});
