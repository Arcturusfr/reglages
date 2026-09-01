// TABS — navigation entre les onglets principaux (Guide / Préréglages / Export-Import)
function showTab(tab){
  ['guide','manage','io'].forEach(t=>{
    document.getElementById('section-'+t).classList.toggle('active',t===tab);
    document.getElementById('tab-'+t)?.classList.toggle('active',t===tab);
    document.getElementById('nav-'+t)?.classList.toggle('active',t===tab);
  });
  if(tab==='manage')renderManage();
}

// ═══════════════════════════════════════════
//  GUIDE
// ═══════════════════════════════════════════
