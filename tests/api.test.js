import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/fontes.js';

function resposta() {
  return { statusCode:200, headers:{}, status(code){this.statusCode=code;return this;},
    setHeader(key,value){this.headers[key]=value;return this;}, json(body){this.body=body;return this;} };
}
test('métodos de escrita são rejeitados',async()=>{
  const res=resposta();await handler({method:'POST',url:'/api/fontes?fonte=planos'},res);
  assert.equal(res.statusCode,405);assert.equal(res.headers.Allow,'GET');
});
test('URL arbitrária e filtros inválidos são rejeitados antes da rede',async()=>{
  const res=resposta();await handler({method:'GET',url:'/api/fontes?fonte=https://example.com'},res);
  assert.equal(res.statusCode,400);
});
test('indisponibilidade nunca retorna lista vazia nem permite cache de erro',async(t)=>{
  t.mock.method(globalThis,'fetch',async()=>{throw new Error('Fonte indisponível');});
  const res=resposta();await handler({method:'GET',url:'/api/fontes?fonte=planos&ano=2026'},res);
  assert.equal(res.statusCode,502);assert.equal(res.headers['Cache-Control'],'no-store');
  assert.equal(res.body.data,undefined);assert.match(res.body.erro,/Nenhum valor foi estimado/);
});
