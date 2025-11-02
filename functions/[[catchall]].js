/**
 * functions/[[catchall]].js
 * * En smartare proxy som kan hantera flera saker:
 * 1. Svara på anrop till '/config' själv.
 * 2. Skicka alla andra anrop (som /data.json) vidare till API_WORKER.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // *** NY LOGIK: Hantera /config-anropet här ***
  if (pathname === '/config') {
    try {
      // Hämta variabeln från Pages-inställningarna
      const rowsPerPage = context.env.ROWS_PER_PAGE || 100;

      const config = {
        rowsPerPage: parseInt(rowsPerPage, 10)
      };

      return new Response(JSON.stringify(config), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600' // Cacha i 10 min
        },
      });
    } catch (err) {
      console.error('Kunde inte hämta config:', err);
      return new Response(JSON.stringify({ error: 'Kunde inte ladda config' }), { status: 500 });
    }
  }

  // --- Befintlig logik för allt annat ---
  
  // Kontrollera att API-bindningen finns
  if (!context.env.API_WORKER) {
    console.error("Service Binding 'API_WORKER' saknas.");
    return new Response(
      "Server-fel: API-bindningen är inte korrekt konfigurerad.", 
      { status: 500 }
    );
  }

  try {
    // Skicka vidare alla andra anrop (t.ex. /data.json, /export.csv)
    // till din backend-worker.
    return await context.env.API_WORKER.fetch(context.request);
    
  } catch (err) {
    console.error(`Fel vid anrop till API_WORKER: ${err.message}`);
    return new Response('Internt API-fel', { status: 500 });
  }
}
