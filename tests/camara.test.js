import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consultaCamara, reescreverLinks } from '../lib/camara.js';

test('proxy da Câmara restringe endpoint, parlamentar e paginação',()=>{
  assert.throws(()=>consultaCamara(new URLSearchParams('tipo=despesas&id=../secret')),/Identificador/);
  assert.throws(()=>consultaCamara(new URLSearchParams('tipo=deputados&pagina=11')),/Página/);
  assert.throws(()=>consultaCamara(new URLSearchParams('tipo=deputados&url=https://example.com')),/Filtro/);
  const url=consultaCamara(new URLSearchParams('tipo=deputados&uf=SP&pagina=2'));
  assert.equal(url.origin,'https://dadosabertos.camara.leg.br');
  assert.equal(url.searchParams.get('siglaUf'),'SP');
});
test('links de paginação permanecem na mesma origem do Radar',()=>{
  const params=new URLSearchParams('tipo=deputados&uf=SP');
  const links=reescreverLinks([{rel:'next',href:'https://dadosabertos.camara.leg.br/api/v2/deputados?pagina=2'}],params);
  assert.equal(links[0].href,'/api/camara?tipo=deputados&uf=SP&pagina=2');
  assert.throws(()=>reescreverLinks([{rel:'next',href:'https://example.com'}],params),/Link/);
});
