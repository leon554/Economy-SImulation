import { ECS, Entity } from "../Util/ecs";
import { ActivityTracker, DrawComp, Inventory } from "../Components/components";
import { d } from "../main";
import { getResourcesAsString, profesionIcon, profesionTable, ResourceTable } from "../Util/util";
import { HorizontalAllign } from "../draw/Draw";
import { color } from "../draw/Color";
import { canvas } from "../main";
import { GAME_SPEED } from "../constants";
import { Position } from "../Util/type";
import { QolManager } from "../Util/qolManager";

export function setEntitiesPos(ecs: ECS){
    const entities = ecs.getComponents(DrawComp)

    const points = generateCirclePoints(window.innerWidth/3.2, entities.length, window.innerWidth/2.2, window.innerHeight/2)
    entities.forEach((e, i) => {
        e.position = {x: points[i].x, y: points[i].y}  
    })
}
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
console.log("SDFHJKSHGDKJ 123")
let drawEvents: Function[] = []
export function addDrawEvent(func: Function){
    drawEvents.push(func)
}

export function drawEntities(ecs: ECS){
    const entities = ecs.getComponents(DrawComp)
    d.Clear()
    entities.forEach((e) => {
        const profEmoji = (profesionIcon[e.profesion] == null) ? "🧑" : profesionIcon[e.profesion]
        const upperLowerData = e.drawText.split("^")
        d.text(upperLowerData[0], 11, e.position.x, e.position.y - 17, HorizontalAllign.centre, undefined, new color(255,255,255))
        d.text(profEmoji, 18, e.position.x, e.position.y, HorizontalAllign.centre, undefined, new color(255,255,100))
        if(upperLowerData.length < 2) return
        d.text(upperLowerData[1], 11, e.position.x, e.position.y + 17, HorizontalAllign.centre, undefined, new color(255,255,255))
        if(upperLowerData.length < 3) return
        d.text(upperLowerData[2], 11, e.position.x, e.position.y + 32, HorizontalAllign.centre, undefined, new color(255,255,255))
    })
    drawEvents.forEach(d => d())
}
export function UpdateDrawText(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(DrawComp, Inventory)
    for(const entity of entities){
        const drawcomp = ecs.getComponent(entity, DrawComp)
        const inventory = ecs.getComponent(entity, Inventory)
        const activityData = (ecs.hasComponent(entity, ActivityTracker)) ? ecs.getComponent(entity, ActivityTracker) : null

        drawcomp!.drawText = `ID: ${entity} $${Math.round(inventory!.money)} ${profesionTable[drawcomp!.profesion] ? `p${profesionTable[drawcomp!.profesion]}` : ""} QOL: ${Math.round(QolManager.calculateQOL(inventory!.resources)*100)/100}^ ${getResourcesAsString(inventory!.resources)} ^ ${(activityData) ? activityData.currentActivity : ""}`
    }
    drawEntities(ecs)
}

export async function drawOneWayTransaction(from: Position, To: Position, drawString: string, ecs: ECS){
    const fTot = generatePoints([from.x, from.y], [To.x, To.y])
    for(let i = 0; i < fTot.length; i++){
        drawEntities(ecs)
        d.text(drawString, 15, fTot[i][0], fTot[i][1])
        await sleep(10 * Math.abs(GAME_SPEED))
    }
}
export async function drawTransaction(buyer: Entity, seller: Entity, resource: string, ecs: ECS){
    const bPos = ecs.getComponent(buyer, DrawComp)
    const sPos = ecs.getComponent(seller, DrawComp)
    const sToB = generatePoints([sPos!.position.x, sPos!.position.y], [bPos!.position.x, bPos!.position.y])
    const bTos = generatePoints( [bPos!.position.x, bPos!.position.y], [sPos!.position.x, sPos!.position.y])
    
    for(let i = 0; i < sToB.length; i++){
        UpdateDrawText(ecs)
        d.text(ResourceTable[resource], 15, sToB[i][0], sToB[i][1])
        d.text("💰", 15, bTos[i][0], bTos[i][1])
        await sleep(10 * Math.abs(GAME_SPEED))
    }
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
export function getCenterPoint(){
    return {x: canvas.width/2, y: canvas.height/2}
}
export const sleep = (delay:number) => new Promise((resolve) => setTimeout(resolve, delay))