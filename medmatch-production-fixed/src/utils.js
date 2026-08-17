export const $ = (s, root=document) => root.querySelector(s);
export const $$ = (s, root=document) => [...root.querySelectorAll(s)];
export const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const fmtDate = v => v ? new Date(v).toLocaleString('ja-JP') : '—';
export const arr = v => Array.isArray(v) ? v : [];
export function toast(msg){const t=$('#toast'); if(!t)return; t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
export function formData(form){return Object.fromEntries(new FormData(form).entries())}
export function csvArray(v=''){return String(v).split(',').map(x=>x.trim()).filter(Boolean)}
export function badge(text,cls=''){return `<span class="badge ${cls}">${esc(text)}</span>`}
export function statusBadge(s){const m={active:'green',verified:'green',approved:'green',interested:'green',accepted:'green',offered:'green',pending:'amber',unread:'blue',read:'blue',published:'blue',open:'amber',investigating:'amber',rejected:'red',declined:'red',suspended:'red',withdrawn:'red',closed:''};return badge(s,m[s]||'')}
