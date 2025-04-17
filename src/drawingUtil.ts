import { Drawable, Position } from "./type";
import { d } from "./main";
import { color } from "./draw/Color";
import { Worker } from "./worker"
import { profesionIcon, ResourceTable } from "./util";
import { entities } from "./simulation";

export function generateCirclePoints(radius: number, amount: number, x: number, y: number): { x: number, y: number }[] {
    const points: { x: number, y: number }[] = [];
    const angleIncrement = (2 * Math.PI) / amount;
  
    for (let i = 0; i < amount; i++) {
        const angle = i * angleIncrement;
        const pointX = x + radius * Math.cos(angle);
        const pointY = y + radius * Math.sin(angle);
        points.push({ x: pointX, y: pointY });
    }
  
    return points;
}
export const drawEvents: Function[] = []
export function addDrawEvent(func: Function){
    drawEvents.push(func)
}
export function drawEntities(){
    d.Clear()
    entities.forEach((e) => {
        const upperLowerData = e.data.split("^")
        d.text(upperLowerData[0], 10, e.position.x, e.position.y - 17, undefined, undefined, new color(255,255,255))
        d.text(profesionIcon[e.profesion], 18, e.position.x, e.position.y, undefined, undefined, new color(255,255,100))
        if(upperLowerData.length < 2) return
        d.text(upperLowerData[1], 10, e.position.x, e.position.y + 17, undefined, undefined, new color(255,255,255))
    })
    drawEvents.forEach(e => e())
}
export function setEntitiesPos(entities: Drawable[]){
    const points = generateCirclePoints(window.innerWidth/2.7, entities.length, window.innerWidth/2.1, window.innerHeight/2)
    entities.forEach((e, i) => {
        e.position = {x: points[i].x, y: points[i].y}  
    })
}

function generatePoints(start: number[], end: number[]) {
    const points = [];
    const stepX = (end[0] - start[0]) / 49; // Divide by 19 because we want 20 points, including start and end
    const stepY = (end[1] - start[1]) / 49;
    for (let i = 0; i < 50; i++) {
      points.push([start[0] + stepX * i, start[1] + stepY * i]);
    }
    return points;
}

const sleep = (delay:number) => new Promise((resolve) => setTimeout(resolve, delay))
export async function drawTransAction(buyer: Worker, seller: Worker, resource: string){
    const sToB = generatePoints([seller.position.x, seller.position.y], [buyer.position.x, buyer.position.y])
    const bTos = generatePoints( [buyer.position.x, buyer.position.y], [seller.position.x, seller.position.y])
    
    for(let i = 0; i < sToB.length; i++){
        drawEntities()
        d.text(ResourceTable[resource], 15, sToB[i][0], sToB[i][1])
        d.text("💰", 15, bTos[i][0], bTos[i][1])
        await sleep(10)
    }
}
export async function drawMoneyTransaction(from: Position, To: Position){
    const fTot = generatePoints([from.x, from.y], [To.x, To.y])
   
    
    for(let i = 0; i < fTot.length; i++){
        drawEntities()
        d.text("💰", 15, fTot[i][0], fTot[i][1])
        await sleep(10)
    }
}