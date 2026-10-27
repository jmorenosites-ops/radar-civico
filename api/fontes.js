import { criarConsulta, validarPagina } from '../lib/fontes.js';

export default async function handler(req,res) {
  if(req.method!=='GET') return res.status(405).setHeader('Allow','GET').json({erro:'Método não permitido.'});
  let url;
  try { url=criarConsulta(new URL(req.url,'https://radar.local').searchParams); }
  catch(error) { return res.status(400).json({erro:error.message}); }
  try {
    const resposta=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(18000),redirect:'error'});
    if(!resposta.ok) throw new Error('HTTP '+resposta.status);
    const pagina=validarPagina(await resposta.json());
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({...pagina,fonte_url:url.href,consultado_em:new Date().toISOString()});
  } catch {
    res.setHeader('Cache-Control','no-store');
    return res.status(502).json({erro:'A fonte oficial está indisponível ou retornou resposta incompatível. Tente novamente. Nenhum valor foi estimado.',fonte_url:url.href});
  }
}
