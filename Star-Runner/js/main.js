import Game from "./game.js";
import { loadLevels } from "./loader.js";
import { getHigh, setHigh, getSettings, setSettings } from "./storage.js";


const canvas=document.getElementById("game");
const scoreEl=document.getElementById("score");
const livesEl=document.getElementById("lives");
const highEl =document.getElementById("high");
const start  =document.getElementById("start");
const startBtn=document.getElementById("startBtn");
const over   =document.getElementById("over");
const again  =document.getElementById("again");
const Score  =document.getElementById("Score");
const HighScore=document.getElementById("highScore");


const game=new Game(canvas);


let settings=getSettings();                
if(settings.hardMode){ game.spawnBase=65; } 


game.bus.on("hud", s=>{
  if(s.score!=null) scoreEl.textContent="Score: "+s.score;
  if(s.lives!=null) livesEl.textContent="Lives: "+s.lives;
});


window.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","KeyA","KeyD","KeyW","KeyS","Space"].includes(e.code)) e.preventDefault();
  game.keys[e.code]=true;
  if(e.key.toLowerCase()==="h"){ 
    settings.hardMode=!settings.hardMode;
    setSettings(settings);
    game.spawnBase = settings.hardMode ? 65 : 50; 
  }
});
window.addEventListener("keyup",e=>game.keys[e.code]=false);


let high=getHigh(); highEl.textContent="High Score: "+high;


startBtn.onclick=startSafe;
again.onclick=()=>location.reload();


async function startSafe(){
  try{
    const data=await loadLevels();
    game.setupFrom(data);
    game.high=high;
    start.classList.remove("show");
    game.onOver=(score)=>{
      Score.textContent=score;
      high=Math.max(high,score); setHigh(high);
      HighScore.textContent=high; highEl.textContent="High Score: "+high;
      over.classList.add("show");
    };
    game.start();
  }catch(err){
    start.innerHTML=`<div style="padding:12px;background:#1f2a44;border-radius:8px">Error: ${err.message}</div>`;
  }
}
