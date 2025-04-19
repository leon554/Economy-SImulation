import { Worker } from "./worker";
import { drawEntities, setEntitiesPos, addDrawEvent} from "./drawingUtil";
import { CreateResources, shuffleArray } from "./util";
import { d } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";
import { Bank } from "./bank";
import { Event } from "./event";
import { Entity, SaleType } from "./type";
import { SpecialisedWorker } from "./specialisedWorke";
import { GAME_SPEED } from "./constants";
import { calculateResourceData, initializeLog } from "./log";

export let days = 0;
let currentSimulationStep = ""
let totalMoney = 0

initializeLog()
addDrawEvent(() => {d.text(`Day: ${days}, Step: ${currentSimulationStep}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}, Game Speed: ${20 -Math.abs(GAME_SPEED)}x`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});

let entities: (Worker| Bank | SpecialisedWorker)[] = [];
export const saleEvent = new Event<(saleData: SaleType, entities: Entity[]) => void>()
export const updateUIEvent = new Event<() => void>()

entities.push(new Worker(40, CreateResources(["water", "meat"], [5,5]) , "water"));
entities.push(new Worker(40, CreateResources(["water", "meat"], [5,5]), "sheep"));
entities.push(new Worker(40, CreateResources(["water", "meat"], [5,5]), "sheep"));
entities.push(new SpecialisedWorker(4000, CreateResources(["water", "meat"], [5,5]), "butcher", "sheep", "meat"));
//entities.push(new SpecialisedWorker(4000, CreateResources(["water", "meat"], [5,5]), "skinner", "sheep", "wool"));
//entities.push(new SpecialisedWorker(400, CreateResources(["water", "meat"], [5,5]), "shirt", "wool", "shirt"));
entities.push(new Worker(40, CreateResources(["water", "meat"], [5,5]), "sheep"));
entities.push(new Bank(10000))
setEntitiesPos(entities);

//fix money supply
//show current resource supply
export async function Loop() {
    totalMoney = 0
    drawEntities(entities);

    currentSimulationStep = "Working"
    const specialisedWorkers: SpecialisedWorker[] = []
    for(const e of entities){
        if(e instanceof SpecialisedWorker){
            specialisedWorkers.push(e)
        }else{
            await e.work(entities)
        }
    }
    for(const sw of specialisedWorkers){
        await sw.work(entities)
    }
    currentSimulationStep = "Trading"
    await handleTransactions()
    calculateResourceData(entities)
    //make it so base workers work first

    currentSimulationStep = "Consuming Resources"
    const entitiesIDToDel: number[] = []
    entities.filter(e => e instanceof Worker).forEach((e) => {
        const alive = e.consumeResources()
        if(!alive) entitiesIDToDel.push(e.id)
    });
    entities = entities.filter(e => !entitiesIDToDel.includes(e.id))
    entities = shuffleArray(entities);
    days++;
}

async function handleTransactions(){
    let buyDemand = true;
    while (buyDemand) {
        buyDemand = false;
        for (const e of entities) {
            if(e instanceof Bank) continue
            //make the stament below so that it only takes one arr
            const buyStatus = await e.makeBuyOffers(entities.filter(e => e instanceof Worker), entities);
            if (buyStatus) buyDemand = true;
        }
    }
}
