export default class Bus {
  constructor(){ this.map=new Map(); }
  on(type, fn){ const s=this.map.get(type)||new Set(); s.add(fn); this.map.set(type,s); return ()=>s.delete(fn); }
  emit(type, data){ const s=this.map.get(type); if(!s) return; for(const f of s){ try{ f(data); }catch(e){console.error(e);} } }
}
