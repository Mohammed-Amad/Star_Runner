import { Enemy, Powerup } from "./entities.js";

export function make(type, o){
  if(type==="enemy")       return new Enemy(o.x,o.y,o.r,o.vy,o.dx||0);
  if(type==="power.rapid") return new Powerup(o.x,o.y,"rapid");
  if(type==="power.shield")return new Powerup(o.x,o.y,"shield");
  throw new Error("Unknown type: "+type);
}
