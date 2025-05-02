import { Drawable, Position } from "./type";
import { canvas, d } from "../main";
import { color } from "../draw/Color";
import { profesionIcon, ResourceTable } from "./util";
import { HorizontalAllign } from "../draw/Draw";
import { GAME_SPEED } from "../constants";
import { baseWorker } from "../Entities/baseWorker";
import { drawUiEvent } from "../simulation";


export const drawEvents: Function[] = []
export function addDrawEvent(func: Function){
    drawEvents.push(func)
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


export const sleep = (delay:number) => new Promise((resolve) => setTimeout(resolve, delay))

export async function drawTransaction(buyer: baseWorker, seller: baseWorker, resource: string){
    const sToB = generatePoints([seller.position.x, seller.position.y], [buyer.position.x, buyer.position.y])
    const bTos = generatePoints( [buyer.position.x, buyer.position.y], [seller.position.x, seller.position.y])
    
    for(let i = 0; i < sToB.length; i++){
        drawUiEvent.emit()
        d.text(ResourceTable[resource], 15, sToB[i][0], sToB[i][1])
        d.text("💰", 15, bTos[i][0], bTos[i][1])
        await sleep(10 * Math.abs(GAME_SPEED))
    }
}

export async function drawOneWayTransaction(from: Position, To: Position, drawString: string){
    const fTot = generatePoints([from.x, from.y], [To.x, To.y])
    for(let i = 0; i < fTot.length; i++){
        drawUiEvent.emit()
        d.text(drawString, 15, fTot[i][0], fTot[i][1])
        await sleep(10 * Math.abs(GAME_SPEED))
    }
}

