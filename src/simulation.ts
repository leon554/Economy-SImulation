
import {  CreateResources} from "./Util/util";
import { d } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";
import { Event } from "./Util/event";
import { SaleType} from "./Util/type";
import { GAME_SPEED } from "./constants";
import { TierManager } from "./Util/tierManager";
import { ECS } from "./Util/ecs";
import { Bank, UnSkilledWork, DrawComp, Inventory, IsTradeable, SkilledWork, WellfareRecievable, ActivityTracker } from "./Components/components";
import { drawEntities, setEntitiesPos, UpdateDrawText } from "./Systems/drawSystems";
import { MakeTrades, Work } from "./Systems/tradeSystems";
import { handleSaleTax, handleWelfarePayments } from "./Systems/bankSystems";
import { updateAvgBuyData, workSkilled } from "./Systems/skilledWorkSystems";
import { addDrawEvent } from "./Systems/drawSystems";
import { addRecipesForTiers } from "./Systems/utilSystems";
import { InitLog } from "./Util/log";

export let days = 0;
export let currentSimulationStep = ""
let totalMoney = 0

const ecs = new ECS()

addDrawEvent(() => {d.text(`Day: ${days}, Step: ${currentSimulationStep}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}, Game Speed: ${20 -Math.abs(GAME_SPEED)}x`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});
InitLog()

export const saleEvent = new Event<(saleData: SaleType, ecs: ECS) => void>()
export const updateUIEvent = new Event<() => void>()

const p1 = ecs.createEntity()
const p2 = ecs.createEntity()
const p3 = ecs.createEntity()
const b1 = ecs.createEntity()
const b2 = ecs.createEntity()

ecs.addComponent(p1, DrawComp, new DrawComp("water"))
ecs.addComponent(p1, Inventory, new Inventory(CreateResources(["water", "meat"], [5,5]), 100))
ecs.addComponent(p1, UnSkilledWork, new UnSkilledWork(["water"]))
ecs.addComponent(p1, IsTradeable, new IsTradeable())
ecs.addComponent(p1, WellfareRecievable, new WellfareRecievable())
ecs.addComponent(p1, ActivityTracker, new ActivityTracker())

ecs.addComponent(p2, DrawComp, new DrawComp("sheep"))
ecs.addComponent(p2, Inventory, new Inventory(CreateResources(["water", "meat"], [5,5]), 100))
ecs.addComponent(p2, UnSkilledWork, new UnSkilledWork(["sheep"]))
ecs.addComponent(p2, IsTradeable, new IsTradeable())
ecs.addComponent(p2, WellfareRecievable, new WellfareRecievable())
ecs.addComponent(p2, ActivityTracker, new ActivityTracker())

ecs.addComponent(p3, DrawComp, new DrawComp("butcher"))
ecs.addComponent(p3, Inventory, new Inventory(CreateResources(["water", "meat"], [5,5]), 100))
ecs.addComponent(p3, IsTradeable, new IsTradeable())
ecs.addComponent(p3, WellfareRecievable, new WellfareRecievable())
ecs.addComponent(p3, SkilledWork, new SkilledWork(["sheep"], ["meat", "meat"]))
ecs.addComponent(p3, ActivityTracker, new ActivityTracker())

ecs.addComponent(b1, DrawComp, new DrawComp("bank"))
ecs.addComponent(b1, Inventory, new Inventory({}, 1000))
ecs.addComponent(b1, Bank, new Bank())
ecs.addComponent(b1, ActivityTracker, new ActivityTracker())


ecs.addComponent(b2, DrawComp, new DrawComp("bank"))
ecs.addComponent(b2, Inventory, new Inventory({}, 1000))
ecs.addComponent(b2, Bank, new Bank())
ecs.addComponent(b2, ActivityTracker, new ActivityTracker())
ecs.addComponent(b2, IsTradeable, new IsTradeable())



setEntitiesPos(ecs)
saleEvent.subscribe((saleData: SaleType, ecs: ECS) => handleSaleTax(saleData, ecs))
saleEvent.subscribe((saleData: SaleType, ecs: ECS) => updateAvgBuyData(saleData, ecs))

addRecipesForTiers(ecs)
TierManager.calculateTiers()


export async function Loop() {
   UpdateDrawText(ecs)
   drawEntities(ecs)
   currentSimulationStep = "Working"
   await Work(ecs)
   await workSkilled(ecs)
   await handleWelfarePayments(ecs)
   currentSimulationStep = "Trading"
   await MakeTrades(ecs)

}

/*
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
}*/
