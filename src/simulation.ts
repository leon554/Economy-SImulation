
import { addDrawEvent} from "./Util/drawingUtil";
import { CategoriseEntities, CreateResources, shuffleArray } from "./Util/util";
import { d } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";

import { Event } from "./Util/event";
import { Drawable, SaleType, entitiesInCategoriesType, entitiesInCategoriesIntitial} from "./Util/type";
import { SpecialisedWorker } from "./Entities/specialisedWorke";
import { GAME_SPEED } from "./constants";
import { calculateResourceData } from "./Util/log";
import { baseWorker } from "./Entities/baseWorker";
import { unSkilledWorker } from "./Entities/unskilledWorker";
import { TierManager } from "./Util/tierManager";
import { ECS } from "./ecs";
import { Bank, BaseWork, drawComp, Inventory, isTradeable } from "./Components/components";
import { drawEntities, setEntitiesPos, UpdateDrawText } from "./Components/drawSystems";
import { MakeTrades, Work } from "./Components/tradeSystems";
import { handleSaleTax } from "./Components/bankSystems";

export let days = 0;
export let currentSimulationStep = ""
let totalMoney = 0

const ecs = new ECS()

addDrawEvent(() => {d.text(`Day: ${days}, Step: ${currentSimulationStep}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}, Game Speed: ${20 -Math.abs(GAME_SPEED)}x`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});



let workers: baseWorker[] = [];

let entities: Drawable[] = [];
let entitiesInCategories: entitiesInCategoriesType = entitiesInCategoriesIntitial

export const saleEvent = new Event<(saleData: SaleType, ecs: ECS) => void>()
export const updateUIEvent = new Event<() => void>()
export const drawUiEvent = new Event<() => void>()
//drawUiEvent.subscribe(() => drawEntities(entities))

workers.push(new unSkilledWorker(100, CreateResources(["water", "meat"], [5,5]) , "water"));
workers.push(new unSkilledWorker(100, CreateResources(["water", "meat"], [5,5]), "meat"));
const p1 = ecs.createEntity()
const p2 = ecs.createEntity()
const b1 = ecs.createEntity()

ecs.addComponent(p1, drawComp, new drawComp("water"))
ecs.addComponent(p1, Inventory, new Inventory(CreateResources(["water", "meat"], [5,5]), 100))
ecs.addComponent(p1, BaseWork, new BaseWork(["water"]))
ecs.addComponent(p1, isTradeable, new isTradeable())

ecs.addComponent(p2, drawComp, new drawComp("meat"))
ecs.addComponent(p2, Inventory, new Inventory(CreateResources(["water", "meat"], [5,5]), 100))
ecs.addComponent(p2, BaseWork, new BaseWork(["meat"]))
ecs.addComponent(p2, isTradeable, new isTradeable())


ecs.addComponent(b1, drawComp, new drawComp("bank"))
ecs.addComponent(b1, Inventory, new Inventory(CreateResources(["water", "meat"], [5,5]), 1000))
ecs.addComponent(b1, Bank, new Bank())
ecs.addComponent(b1, isTradeable, new isTradeable())

setEntitiesPos(ecs)
saleEvent.subscribe((saleData: SaleType, ecs: ECS) => handleSaleTax(saleData, ecs))



console.log(entitiesInCategories)
//setEntitiesPos(entities); 
//to do make skiled workerers sell for more than they produce
TierManager.calculateTiers()
console.log(TierManager.recipes)
console.log(TierManager.resourceTiers)


export async function Loop() {
   UpdateDrawText(ecs)
   drawEntities(ecs)
   await Work(ecs)
   await MakeTrades(ecs)

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
    calculateResourceData(ecs)
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
    //del not working
    currentSimulationStep = "Consuming Resources"
    const entitiesIDToDel: number[] = []
    workers.forEach((e) => {
        const alive = e.consumeResources()
        if(!alive) entitiesIDToDel.push(e.id)
    });
    workers = workers.filter(e => !entitiesIDToDel.includes(e.id))
    entities = entities.filter(e => !entitiesIDToDel.includes(e.id))
    if(entitiesIDToDel.length > 0){
      // CategoriseEntities(workers, institutions, entitiesInCategories)
    }
}


//workers.push(new unSkilledWorker(100, CreateResources(["water", "meat"], [5,5]), "sheep"));
//workers.push(new unSkilledWorker(100, CreateResources(["water", "meat"], [5,5]), "sheep"));
//workers.push(new unSkilledWorker(100, CreateResources(["water", "meat"], [5,5], []), "sheep"));
//workers.push(new SpecialisedWorker(1000, CreateResources(["water", "meat"], [5,5]), "butcher", ["sheep"], ["meat", "meat"]));
//workers.push(new SpecialisedWorker(1000, CreateResources(["water", "meat"], [5,5]), "skinner", ["sheep"], ["wool", "wool"]));
//workers.push(new SpecialisedWorker(1000, CreateResources(["water", "meat"], [5,5]), "shirt", ["wool"], ["shirt"]));
//workers.push(new unSkilledWorker(100, CreateResources(["water", "meat"], [5,5], []), "sheep"));