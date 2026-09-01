// STATE — état global des préréglages (CRUD localStorage) et résolution des paramètres
const LS_KEY='photomanuel_presets_v4';
let presets=[],editingId=null,formState={};
let currentPopupPreset=null,currentPopupCondIdx=null;

function loadPresets(){
  try{const r=localStorage.getItem(LS_KEY);presets=r?JSON.parse(r):JSON.parse(JSON.stringify(DEFAULT_PRESETS));if(!r)save();}
  catch(e){presets=JSON.parse(JSON.stringify(DEFAULT_PRESETS));}
}
function save(){localStorage.setItem(LS_KEY,JSON.stringify(presets));}
function getPreset(id){return presets.find(p=>p.id===id);}
function resolveParams(preset,condIdx){
  const def=preset.defaultParams||{};
  if(condIdx===null||condIdx===undefined||!preset.conditions?.length)return{params:def,overrides:{}};
  const overrides=preset.conditions[condIdx]?.params||{};
  const allKeys=[...new Set([...Object.keys(def),...Object.keys(overrides)])];
  const params={};
  allKeys.forEach(k=>{params[k]=overrides[k]||def[k];});
  return{params,overrides};
}

// ═══════════════════════════════════════════
//  TABS
// ═══════════════════════════════════════════
