// 2026-09-24 10:20 (Paris) — V027 — (1) Bandeau "Réglage concerné" : ajout du nom de la scène (icône + nom du préréglage en cours, currentPopupPreset) devant le paramètre/la valeur. (2) Le cadre schéma (.ctrl-figure) passe en 2 colonnes : le schéma + sa légende restent à gauche (.ctrl-figure-media), la 1ère section de d.sections (ex. "Dans le mode M (Manuel)") est désormais injectée à droite (.ctrl-figure-intro) au lieu d'être listée avec les autres sections en dessous ; les sections suivantes et les conseils restent inchangés, sous le cadre. Layout géré ici ; classes CSS dans css/styles.css.
// 2026-09-20 01:22 (Paris) — V025 — Création : pop-up « fiche détail d'un contrôle » (schéma SVG + texte d'aide), ouvert au clic sur une étiquette du drawer. Fermeture : bouton retour, clic sur le fond, touche Échap.
// CONTROL POPUP — ouverture/fermeture de la fiche détail d'un contrôle (données : js/control-data.js)
function openControlDetail(ctrlId,ctx){
  const d=getControlDetail(ctrlId);
  if(!d)return;
  // Nom de la scène en cours (préréglage ouvert dans le popup principal), ajouté au bandeau de contexte.
  const sceneName=currentPopupPreset?`${currentPopupPreset.icon} ${currentPopupPreset.name}`:'';
  const ctxHtml=ctx&&ctx.param&&ctx.value
    ?`<div class="ctrl-context"><span class="ctrl-context-label">Réglage concerné</span><span class="ctrl-context-val">${sceneName?esc(sceneName)+' · ':''}${esc(ctx.param)} · ${esc(ctx.value)}</span></div>`:'';
  // La 1ère section (ex. "Dans le mode M (Manuel)") est placée à droite du schéma, dans le même cadre ;
  // les sections suivantes restent listées normalement en dessous, comme avant.
  const allSections=d.sections||[];
  const introSection=allSections[0]||null;
  const restSections=allSections.slice(1);
  const introHtml=introSection?`
    <div class="ctrl-figure-intro">
      <div class="ctrl-section-title">${esc(introSection.title)}</div>
      <ul class="ctrl-list">${introSection.items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    </div>`:'';
  const sectionsHtml=restSections.map(s=>`
    <div class="ctrl-section">
      <div class="ctrl-section-title">${esc(s.title)}</div>
      <ul class="ctrl-list">${s.items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    </div>`).join('');
  const tipsHtml=d.tips&&d.tips.length
    ?`<div class="tips-section"><div class="tips-label">Conseils</div>${d.tips.map(t=>`<div class="tip-item">${esc(t)}</div>`).join('')}</div>`:'';
  document.getElementById('ctrl-popup').innerHTML=`
    <div class="popup-header">
      <button class="popup-back" onclick="closeControlDetail()" aria-label="Retour">${ICONS.back}</button>
      <div class="popup-title-block">
        <div class="popup-title">${esc(d.title)}</div>
        <div class="popup-desc">${esc(d.subtitle||'')}</div>
      </div>
    </div>
    <div class="popup-body">
      ${ctxHtml}
      <figure class="ctrl-figure">
        <div class="ctrl-figure-media">
          ${d.svg}
          ${d.caption?`<figcaption class="ctrl-figure-caption">${esc(d.caption)}</figcaption>`:''}
        </div>
        ${introHtml}
      </figure>
      ${sectionsHtml}
      ${tipsHtml}
      ${d.note?`<div class="ctrl-note">${esc(d.note)}</div>`:''}
    </div>`;
  const ov=document.getElementById('ctrl-overlay');
  ov.classList.add('open');
  ov.scrollTop=0;
}
function closeControlDetail(){
  document.getElementById('ctrl-overlay').classList.remove('open');
  document.getElementById('ctrl-popup').innerHTML=''; // libère le SVG (et arrête son animation)
}
document.getElementById('ctrl-overlay').addEventListener('click',e=>{
  if(e.target===document.getElementById('ctrl-overlay'))closeControlDetail();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.getElementById('ctrl-overlay').classList.contains('open'))closeControlDetail();
});
