export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { min-height: 100%; }
body { background: #0e0c0a; color: #ede8e3; font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #141210; }
::-webkit-scrollbar-thumb { background: #3d3530; border-radius: 3px; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn .4s ease both; }
.toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #4ade80; color: #000; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 13px; z-index: 999; animation: slideUp .3s ease; }
.toast-err { background: #f87171; color: #fff; }
`;

export const bg = "#0e0c0a";
export const card = "#1a1714";
export const cardB = "#2d2722";
export const gold = "#e07a5f";
export const goldDim = "rgba(224,122,95,.12)";
export const txt = "#ede8e3";
export const mut = "#7a6f63";
export const grn = "#4ade80";
export const red = "#f87171";
export const blu = "#60a5fa";
