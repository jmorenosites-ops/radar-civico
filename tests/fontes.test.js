import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarConsulta, validarPagina } from '../lib/fontes.js';

test('aceita apenas fontes e filtros oficiais conhecidos', () => {
  assert.throws(() => criarConsulta(new URLSearchParams('fonte=https://example.com')), /Fonte/);
  assert.throws(() => criarConsulta(new URLSearchParams('fonte=planos&pagina=0')), /Página/);
  assert.throws(() => criarConsulta(new URLSearchParams('fonte=planos&ano=abc')), /Ano/);
  assert.throws(() => criarConsulta(new URLSearchParams('fonte=lancamentos&cnpj=123')), /CNPJ/);
  assert.throws(() => criarConsulta(new URLSearchParams('fonte=planos&url=https://example.com')), /Filtro/);
});
test('mantém paginação e filtros no servidor oficial', () => {
  const url = criarConsulta(new URLSearchParams('fonte=planos&ano=2026&pagina=2'));
  assert.equal(url.origin, 'https://api-publica.transferegov.gestao.gov.br');
  assert.equal(url.searchParams.get('ano_plano_acao'), '2026');
  assert.equal(url.searchParams.get('pagina'), '2');
  assert.equal(url.searchParams.get('tamanho_da_pagina'), '20');
});
test('esquema inválido nunca vira ausência de gastos', () => {
  assert.throws(() => validarPagina({}), /Resposta/);
  assert.throws(() => validarPagina({data:[],total_items:1,total_pages:1,page_number:1}), /Resposta/);
  const vazio={data:[],total_items:0,total_pages:0,page_number:1,page_size:20};
  assert.equal(validarPagina(vazio), vazio);
});
