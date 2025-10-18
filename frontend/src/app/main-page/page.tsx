// Oldal metaadatai
export const metadata = {
  title: 'Main Page', // Oldal címe
};

// Dinamikus render (minden betöltésnél új receptek)
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Script from 'next/script';

// Szerver oldali lekérés Spoonacular-ból (API kulcs .env-ből)
async function getRandomRecipes(count: number = 8) {
  const apiKey = "62c8fdc83dcb45448c48a60b8a7e35cc"; // .env.local
  if (!apiKey) {
    // Ha nincs kulcs, adj vissza üres listát és jelezzük a UI-ban
    return { recipes: [], error: 'Hiányzik a SPOONACULAR_API_KEY a környezeti változók közül.' } as const;
  }

  // Random receptek lekérése
  const url = `https://api.spoonacular.com/recipes/random?number=${count}&apiKey=${apiKey}`;
  const res = await fetch(url, { cache: 'no-store' }); // Ne cache-eljük, mindig friss

  if (!res.ok) {
    return { recipes: [], error: `API hiba: ${res.status} ${res.statusText}` } as const;
  }

  const data = await res.json();
  return { recipes: (data.recipes ?? []) as any[], error: null } as const;
}

function RecipeGrid({ recipes }: { recipes: any[] }) {
  return (
    <>
      <section className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] w-full max-w-6xl">
        {recipes.map((r: any) => (
          <article key={r.id} className="border rounded-lg overflow-visible bg-white shadow-sm flex flex-col">
            {r.image && (
              <div className="relative aspect-[4/3]">
                <Image src={r.image} alt={r.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col gap-2">
              <h3 className="font-medium leading-snug line-clamp-2" title={r.title}>{r.title}</h3>
              <div className="text-xs text-gray-500 flex gap-3">
                {typeof r.readyInMinutes === 'number' && <span>⏱️ {r.readyInMinutes} perc</span>}
                {typeof r.servings === 'number' && <span>🍽️ {r.servings} adag</span>}
              </div>
              <button
                type="button"
                data-recipe-index={String(recipes.findIndex((x: any) => x.id === r.id))}
                className="mt-auto w-full rounded px-3 py-2 text-sm font-medium border bg-gray-50 hover:bg-gray-100 border-gray-200 transition text-center"
              >
                View Recipe
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}


export default async function MainPage() {
  // Random receptek betöltése
  const { recipes, error } = await getRandomRecipes(8);

  return (
    <main className="min-h-dvh flex flex-col items-center p-8 gap-6">
      {/* Popup dialog (HTML <dialog>) */}
      <dialog id="recipeDialog" className="backdrop:bg-black/50 rounded-lg p-0 w-full max-w-3xl">
        <form method="dialog">
          <button aria-label="Bezárás" className="absolute right-3 top-3 rounded border px-2 py-1 text-sm hover:bg-gray-50">✕</button>
        </form>
        <div id="recipeDialogContent">
          {/* Dinamikusan feltöltve a kliens scriptből */}
        </div>
      </dialog>

      {/* Adattár a klienseknek: csak a szükséges mezők JSON-ban */}
      <script id="recipes-data" type="application/json" suppressHydrationWarning>
        {JSON.stringify(recipes.map((r: any) => ({
          id: r.id,
          title: r.title,
          image: r.image,
          readyInMinutes: r.readyInMinutes,
          servings: r.servings,
          sourceUrl: r.sourceUrl,
          extendedIngredients: (r.extendedIngredients ?? []).map((x: any) => ({ original: x.original })),
          analyzedInstructions: Array.isArray(r.analyzedInstructions) ? r.analyzedInstructions : [],
          instructions: r.instructions || ''
        })))}
      </script>

      {/* Kliens oldali vezérlő script – a grid gombjai megnyitják a dialogot */}
      <Script id="recipe-dialog-controller" strategy="afterInteractive">
        {`
          (function(){
            const dialog = document.getElementById('recipeDialog');
            const content = document.getElementById('recipeDialogContent');
            const dataEl = document.getElementById('recipes-data');
            if(!dialog || !content || !dataEl) return;
            let recipes = [];
            try { recipes = JSON.parse(dataEl.textContent || '[]'); } catch(e) { recipes = []; }

            // Delegate clicks from the main container
            document.addEventListener('click', (ev) => {
              const target = ev.target;
              if(!(target instanceof HTMLElement)) return;
              const btn = target.closest('button[data-recipe-index]');
              if(!btn) return;
              const idx = parseInt(btn.getAttribute('data-recipe-index') || '-1', 10);
              if(isNaN(idx) || !recipes[idx]) return;
              const r = recipes[idx];

              // Build dialog HTML
              const steps = (Array.isArray(r.analyzedInstructions) && r.analyzedInstructions.length > 0 && Array.isArray(r.analyzedInstructions[0].steps))
                ? r.analyzedInstructions[0].steps.map((s) => \`<li>\${(s && s.step) ? String(s.step) : ''}</li>\`).join('')
                : '';

              const ings = (r.extendedIngredients || []).map((ing) => \`<li>\${ing.original}</li>\`).join('');
              const instructionsBlock = steps
                ? \`<ol class="list-decimal pl-5 mt-2 space-y-2 text-sm">\${steps}</ol>\`
                : \`<p class="text-sm mt-2 whitespace-pre-line">\${(r.instructions || 'Nincs megadott leírás.').replace(/</g,'&lt;')}</p>\`;

              content.innerHTML = \`
                \${r.image ? \`<div class="relative w-full" style="aspect-ratio:16/9;background:#f5f5f5 url('\${r.image}') center/cover no-repeat"></div>\` : ''}
                <div class="p-5">
                  <div class="flex items-start justify-between gap-4">
                    <h2 class="text-xl font-semibold leading-tight">\${r.title || ''}</h2>
                  </div>
                  <div class="mt-2 text-sm text-gray-600 flex gap-4">
                    \${typeof r.readyInMinutes === 'number' ? \`<span>⏱️ \${r.readyInMinutes} perc</span>\` : ''}
                    \${typeof r.servings === 'number' ? \`<span>🍽️ \${r.servings} adag</span>\` : ''}
                  </div>
                  <section class="mt-5">
                    <h3 class="font-medium">Ingredients</h3>
                    <ul class="list-disc pl-5 mt-2 space-y-1 text-sm">\${ings}</ul>
                  </section>
                  <section class="mt-5">
                    <h3 class="font-medium">Step- by step guide</h3>
                    \${instructionsBlock}
                  </section>
                </div>
              \`;

              if (typeof dialog.showModal === 'function') {
                dialog.showModal();
              } else {
                dialog.setAttribute('open','');
              }
            });

            // Close on backdrop click for <dialog>
            dialog.addEventListener('click', (e) => {
              const rect = dialog.getBoundingClientRect();
              const inDialog = (
                rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX && e.clientX <= rect.left + rect.width
              );
              if (!inDialog) dialog.close();
            });
          })();
        `}
      </Script>
      <h1 className="text-3xl font-semibold">Recipes</h1>


      {/* Hibaüzenet az API kulcs hiányára vagy API hibára */}
      {error && (
        <div className="w-full max-w-2xl border border-red-200 bg-red-50 text-red-700 p-4 rounded">
          <p className="font-medium">Hiba</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Állíts be egy <code>SPOONACULAR_API_KEY</code> változót a <code>.env.local</code>-ban.</p>
        </div>
      )}

      <RecipeGrid recipes={recipes} />
    </main>
  );
}