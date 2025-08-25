import Bus from "./bus.js";
import { Player, Bullet, Enemy, Powerup } from "./entities.js";
import { make } from "./factory.js";

export default class Game {
  constructor(canvas){
    this.bus = new Bus();
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width; this.h = canvas.height;

    this.player=new Player(this.w/2,this.h-40);
    this.enemies=[]; this.bullets=[]; this.powers=[];
    this.keys={}; this.running=false;

    this.score=0; this.lives=3; this.level=1; this.high=0;

    
    this.spawnBase=50; this.spawnPerMin=50; this.enemySpeedMul=1; this.dropRate=0.06;
    this.spawnT=0; this.levelUpT=0;

    
    this.bus.on("enemy:dead", ()=>this.addScore(10));
  }

  setupFrom(json){
    this.player.fireMs = json.settings.playerFireMs;
    this.spawnBase     = json.settings.spawnPerMin;
    this.levels        = json.levels;
    this.applyLevel(1);
  }

  applyLevel(n){
    const p=this.levels?.[n-1] || {enemySpeedMul:1+(n-1)*.15,spawnMul:1+(n-1)*.12,drop:.08};
    this.level=n;
    this.enemySpeedMul=p.enemySpeedMul;
    this.spawnPerMin = this.spawnBase * p.spawnMul;
    this.dropRate = p.drop;
  }

  start(){ this.running=true; this.last=performance.now(); requestAnimationFrame(this.loop.bind(this)); }
  stop(){ this.running=false; }

  loop(t){
    if(!this.running) return;
    const dt=Math.min(.033,(t-this.last)/1000); this.last=t;
    this.update(dt); this.draw(this.ctx);
    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt){
   
    this.player.handle(this.keys, dt, this.w, this.h);
    if(this.keys["Space"]) this.player.tryShoot(this);
    this.player.update(dt);

    const perSec=this.spawnPerMin/60; this.spawnT+=dt;
    while(this.spawnT>1/perSec){
      this.spawnT-=1/perSec;
      const r=12, x=Math.random()*(this.w-2*r)+r;
      const vy=(80+Math.random()*60)*this.enemySpeedMul;
      const dx=(Math.random()*2-1)*30*this.enemySpeedMul;
      this.spawn(make("enemy",{x,y:-r-10,r,vy,dx}));
    }


    this.enemies.forEach(e=>e.update(dt,this));
    this.bullets.forEach(b=>b.update(dt,this));
    this.powers .forEach(p=>p.update(dt,this));


    for(let i=this.bullets.length-1;i>=0;i--){
      const b=this.bullets[i]; let hit=false;
      for(let j=this.enemies.length-1;j>=0;j--){
        const e=this.enemies[j];
        if(circleRect(e.x,e.y,e.r, b.x-2,b.y-b.h,4,b.h)){
          this.enemies.splice(j,1); this.bullets.splice(i,1); hit=true;
          this.bus.emit("enemy:dead");
          if(Math.random()<this.dropRate){
            const k=Math.random()<.5 ? "power.rapid" : "power.shield";
            this.spawn(make(k,{x:e.x,y:e.y}));
          }
          break;
        }
      }
      if(!hit && b.dead) this.bullets.splice(i,1);
    }


    this.enemies=this.enemies.filter(e=>!e.dead);
    this.bullets=this.bullets.filter(b=>!b.dead);
    this.powers =this.powers .filter(p=>!p.dead);
    this.levelUpT=Math.max(0,this.levelUpT-dt);


    const need=Math.floor(this.score/200)+1;
    if(need>this.level){
      this.applyLevel(need);
      this.bus.emit("hud",{ level:this.level });
      this.levelUpT=1.0;
    }
  }

draw(ctx){
 
  ctx.clearRect(0,0,this.w,this.h);

 
  ctx.fillStyle = "#0f1924";
  ctx.fillRect(0,0,this.w,this.h);


  this.player.draw(ctx);
  this.enemies.forEach(e => e.draw(ctx));
  this.bullets.forEach(b => b.draw(ctx));
  this.powers .forEach(p => p.draw(ctx));


  if (this.levelUpT > 0){
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.levelUpT * 2);
    ctx.fillStyle = "#9be3ff";
    ctx.font = "bold 42px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LEVEL UP!", this.w / 2, this.h / 2);
    ctx.restore();
  }
}


  spawn(e){ if(e instanceof Enemy)this.enemies.push(e); else if(e instanceof Bullet)this.bullets.push(e); else this.powers.push(e); }

  addScore(n){ this.score+=n; this.bus.emit("hud",{score:this.score}); }

  onPlayerHit(){ this.lives--; this.bus.emit("hud",{lives:this.lives}); if(this.lives<=0){ this.stop(); this.onOver?.(this.score); } }
}

function circleRect(cx,cy,cr, rx,ry,rw,rh){
  const nx=Math.max(rx,Math.min(cx,rx+rw));
  const ny=Math.max(ry,Math.min(cy,ry+rh));
  return Math.hypot(cx-nx,cy-ny)<cr;
}
