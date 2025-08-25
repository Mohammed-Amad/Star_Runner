// Base entity (inherit from this)
export class Entity {
  constructor(x=0,y=0){ this.x=x; this.y=y; this.dead=false; }
  update(dt, game){} draw(ctx){}
}

export class Bullet extends Entity {
  constructor(x,y){ super(x,y); this.vy=-520; this.w=4; this.h=10; this.r=3; }
  update(dt){ this.y += this.vy*dt; if(this.y < -12) this.dead=true; }
  draw(ctx){ ctx.fillStyle="#9be3ff"; ctx.fillRect(this.x-2, this.y-this.h, 4, this.h); }
}

export class Enemy extends Entity {
  constructor(x,y,r,vy,dx){ super(x,y); this.r=r; this.vy=vy; this.dx=dx; }
  update(dt,g){
    this.y += this.vy*dt; this.x += this.dx*dt;
    if(this.x<20){this.x=20; this.dx*=-1} if(this.x>g.w-20){this.x=g.w-20; this.dx*=-1}
    if(this.y - this.r > g.h+20) this.dead=true;
    const d=Math.hypot(this.x-g.player.x, this.y-g.player.y);
    if(!g.player.inv && d < this.r + g.player.r){ this.dead=true; g.onPlayerHit(); }
  }
  draw(ctx){ ctx.fillStyle="rgba(244,114,182,0.9)"; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill(); }
}

export class Powerup extends Entity {
  constructor(x,y,kind){ super(x,y); this.kind=kind; this.vy=120; this.r=10; }
  update(dt,g){
    this.y += this.vy*dt;
    const d=Math.hypot(this.x-g.player.x, this.y-g.player.y);
    if(d < this.r + g.player.r){ g.player.apply(this.kind); this.dead=true; }
    if(this.y > g.h+12) this.dead=true;
  }
  draw(ctx){
    ctx.fillStyle = this.kind==="shield" ? "#a7f3d0" : "#60a5fa";
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
  }
}


function timed(on, off, ms){ let active=false, t;
  return ()=>{ if(active) clearTimeout(t); else{ on(); active=true; }
               t=setTimeout(()=>{ off(); active=false; }, ms); };
}

export class Player extends Entity {
  constructor(x,y){
    super(x,y);
    this.r=12; this.speed=260; this.fireMs=260; this.cool=0; this.inv=false;
    this.fx={
      rapid:  timed(()=>this.fireMs=Math.max(100,Math.floor(this.fireMs/2)),
                    ()=>this.fireMs=Math.min(260,Math.floor(this.fireMs*2)), 8000),
      shield: timed(()=>this.inv=true, ()=>this.inv=false, 6000)
    };
  }
  handle(keys, dt, w, h){
    let dx=0,dy=0;
    if(keys["ArrowLeft"]||keys["KeyA"]) dx-=1;
    if(keys["ArrowRight"]||keys["KeyD"]) dx+=1;
    if(keys["ArrowUp"]||keys["KeyW"]) dy-=1;
    if(keys["ArrowDown"]||keys["KeyS"]) dy+=1;
    const len=Math.hypot(dx,dy)||1;
    this.x += (dx/len)*this.speed*dt;
    this.y += (dy/len)*this.speed*dt;
    this.x = Math.max(20, Math.min(w-20, this.x));
    this.y = Math.max(20, Math.min(h-20, this.y));
  }
  tryShoot(game){ if(this.cool<=0){ game.spawn(new Bullet(this.x, this.y-this.r-4)); this.cool=this.fireMs; } }
  update(dt){ this.cool -= dt*1000; }
  draw(ctx){
    ctx.fillStyle = this.inv ? "#7dd3fc" : "cyan";
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    if(this.inv){ ctx.strokeStyle="rgba(167,243,208,.9)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r+10,0,Math.PI*2); ctx.stroke(); }
  }
  apply(kind){ const f=this.fx[kind]; if(f) f(); }
}
