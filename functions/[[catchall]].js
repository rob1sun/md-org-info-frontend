/**
 * Cloudflare Pages "Functions" Proxy.
 * Denna fil fångar upp alla anrop som inte är statiska filer
 * (t.ex. /data.json, /export.csv) och skickar dem vidare till din
 * bundna data-worker.
 */
export async function onRequest(context) {
  
  // 'API_WORKER' är namnet du måste ge din Service Binding
  // i Cloudflare Pages-projektets inställningar.
  if (!context.env.API_WORKER) {
    console.error("Service Binding 'API_WORKER' saknas.");
    return new Response(
      "Server-fel: API-bindningen är inte korrekt konfigurerad.", 
      { status: 500 }
    );
  }

  try {
    // Ta emot anropet från webbläsaren (context.request) och skicka det
    // direkt vidare till din data-worker via bindningen.
    return await context.env.API_WORKER.fetch(context.request);
    
  } catch (err) {
    console.error(`Fel vid anrop till API_WORKER: ${err.message}`);
    return new Response('Internt API-fel', { status: 500 });
  }
}
