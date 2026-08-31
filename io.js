// IO — export / import JSON, réinitialisation, drag & drop
function exportData(){
  const blob=new Blob([JSON.stringify({version:4,app:'PhotoManuel',exportedAt:new Date().toISOString(),presets},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`photomanuel_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('Fichier exporté','success');
}
function importData(input){
  const file=(input.files||input)[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{const data=JSON.parse(e.target.result);const imported=data.presets||data;if(!Array.isArray(imported))throw new Error();if(!confirm(`Importer ${imported.length} préréglages ?`))return;presets=imported;save();renderGuide();renderManage();toast(`${imported.length} préréglages importés`,'success');}
    catch{toast('Fichier JSON invalide','error');}
    if(input.value!==undefined)input.value='';
  };reader.readAsText(file);
}
function resetDefaults(){
  if(!confirm('Restaurer les préréglages par défaut ?'))return;
  presets=JSON.parse(JSON.stringify(DEFAULT_PRESETS));save();renderGuide();renderManage();toast('Données réinitialisées','success');
}
const dz=document.getElementById('drop-zone');
dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag-over');const f=e.dataTransfer.files[0];if(f)importData({files:[f]});});
