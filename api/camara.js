import { consultaCamara, reescreverLinks } from '../lib/camara.js';
export default async function handler(req,res) {
  if(req.method!=='GET') {res.setHeader('Allow','GET');return res.status(405).json({erro:'Método não permitido.'});}
  const params=new URL(req.url,'https://radar.local').searchParams;
  let url;
  try {url=consultaCamara(params);}catch(error){return res.status(400).json({erro:error.message});}
  try {
    const r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(18000),redirect:'error'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const body=await r.json();
    if(!Array.isArray(body.dados) || body.dados.length>100) throw new Error('Esquema inválido.');
    if(params.get('tipo')==='deputados') body.links=reescreverLinks(body.links,params);
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({...body,fonte_url:url.href});
  } catch {
    res.setHeader('Cache-Control','no-store');
    return res.status(502).json({erro:'A Câmara dos Deputados está indisponível nesta consulta. Nenhum valor foi estimado.'});
  }
}
