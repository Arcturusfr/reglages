// UTILS — toast de notification, échappement HTML
// UTILS
let toastTimer;
function toast(msg,type=''){const el=document.getElementById('toast');el.textContent=msg;el.className='show '+type;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.className='',2800);}
function esc(s=''){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
