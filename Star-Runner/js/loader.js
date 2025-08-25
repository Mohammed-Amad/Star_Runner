export async function loadLevels(){
  const res = await fetch("../levels.json");
  if(!res.ok) throw new Error(`Levels fetch failed: ${res.status}`);
  return await res.json();
}
