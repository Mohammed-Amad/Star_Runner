function safe(){
  try{ const t="__t__"; localStorage.setItem(t,"1"); localStorage.removeItem(t); return localStorage; }
  catch{ return {getItem(){return null},setItem(){},removeItem(){}}; }
}
const LS = safe();
const HIGH="sr.high", SET="sr.settings";

export const getHigh=()=>Number(LS.getItem(HIGH)||0);
export const setHigh=v=>LS.setItem(HIGH,String(v));

export function getSettings(){ try{ return JSON.parse(LS.getItem(SET)||'{"hardMode":false}'); }catch{ return {hardMode:false}; } }
export function setSettings(s){ try{ LS.setItem(SET, JSON.stringify(s)); }catch{} }
