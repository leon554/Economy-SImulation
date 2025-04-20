
import { drawEntities, setEntitiesPos, addDrawEvent} from "./Util/drawingUtil";
import { CategoriseEntities, CreateResources, shuffleArray } from "./Util/util";
import { d } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";
import { Bank } from "./Entities/bank";
import { Event } from "./Util/event";
import { Drawable, SaleType, entitiesInCategoriesType, entitiesInCategoriesIntitial} from "./Util/type";
import { SpecialisedWorker } from "./Entities/specialisedWorke";
import { GAME_SPEED } from "./constants";
import { calculateResourceData } from "./Util/log";
import { baseWorker } from "./Entities/baseWorker";
import { unSkilledWorker } from "./Entities/unskilledWorker";

export let days = 0;
let currentSimulationStep = ""
let totalMoney = 0

addDrawEvent(() => {d.text(`Day: ${days}, Step: ${currentSimulationStep}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}, Game Speed: ${20 -Math.abs(GAME_SPEED)}x`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});

let workers: baseWorker[] = [];
let institutions: Bank[] = [];
let entities: Drawable[] = [];
let entitiesInCategories: entitiesInCategoriesType = entitiesInCategoriesIntitial

export const saleEvent = new Event<(saleData: SaleType, entities: baseWorker[]) => void>()
export const updateUIEvent = new Event<() => void>()
export const drawUiEvent = new Event<() => void>()
drawUiEvent.subscribe(() => drawEntities(entities))

workers.push(new unSkilledWorker(40, CreateResources(["water", "meat"], [5,5]) , "water"));
workers.push(new unSkilledWorker(40, CreateResources(["water", "meat"], [5,5]), "sheep"));
workers.push(new unSkilledWorker(40, CreateResources(["water", "meat"], [5,5]), "sheep"));
workers.push(new SpecialisedWorker(4000, CreateResources(["water", "meat"], [5,5]), "butcher", "sheep", "meat"));
//workers.push(new SpecialisedWorker(4000, CreateResources(["water", "meat"], [5,5]), "skinner", "sheep", "wool"));
//workers.push(new SpecialisedWorker(400, CreateResources(["water", "meat"], [5,5]), "shirt", "wool", "shirt"));
workers.push(new unSkilledWorker(40, CreateResources(["water", "meat"], [5,5]), "sheep"));
institutions.push(new Bank(10000))

entities.push(...workers, ...institutions)
CategoriseEntities(workers, institutions, entitiesInCategories)
console.log(entitiesInCategories)
setEntitiesPos(entities); 


export async function Loop() {
    drawUiEvent.emit()

    await handleWork()

    await handleTransactions()

    consumeResourcesAndDelDead()

    workers = shuffleArray(workers);
    days++;
}

async function handleTransactions(){
    currentSimulationStep = "Trading"
    let buyDemand = true;
    while (buyDemand) {
        buyDemand = false;
        for (const e of workers) {
            if(e instanceof Bank) continue

            const buyStatus = await e.makeBuyOffers(workers);
            if (buyStatus) buyDemand = true;
        }
    }
    calculateResourceData(workers)
}
async function handleWork(){
    currentSimulationStep = "Working"

    for(const w of entitiesInCategories.unSkilledWorkers){
        await w.work(workers)    
    }
    for(const w of entitiesInCategories.specialisedWorkers){
        await w.work(workers)
    }
    for(const w of entitiesInCategories.banks){
        await w.work(workers)
    }
}
function consumeResourcesAndDelDead(){
    currentSimulationStep = "Consuming Resources"
    const entitiesIDToDel: number[] = []
    workers.forEach((e) => {
        const alive = e.consumeResources()
        if(!alive) entitiesIDToDel.push(e.id)
    });
    workers = workers.filter(e => !entitiesIDToDel.includes(e.id))
}
