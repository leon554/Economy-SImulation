import { Worker } from "./worker";
import { drawEntities, setEntitiesPos, addDrawEvent } from "./drawingUtil";
import { CreateResources, ResourceTable, shuffleArray } from "./util";
import { d } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";
import { Bank } from "./bank";
import { Event } from "./event";
import { SaleType } from "./type";
import { SpecialisedWorker } from "./specialisedWorke";

export let days = 0;
let currentSimulationStep = ""
let totalMoney = 0
let resourcePriceString = ""
addDrawEvent(() => {d.text(`Day: ${days}, Step: ${currentSimulationStep}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(resourcePriceString,12,10,75, HorizontalAllign.start,undefined,new color(255, 255, 255));});
export let entities: (Worker| Bank)[] = [];
export let resourcePrices : { [key: string]: {avgSellPrice: number, avgBuyPrice: number}} = {}
export const saleEvent = new Event<(saleData: SaleType) => void>()
export const updateUIEvent = new Event<() => void>()

entities.push(new Worker(40, CreateResources(["water", "meat"], [4,4]) , "water"));
entities.push(new Worker(40, CreateResources(["water", "meat"], [4,4]), "sheep"));
entities.push(new Worker(40, CreateResources(["water", "meat"], [4,4]), "sheep"));
entities.push(new SpecialisedWorker(4000, CreateResources(["water", "meat"], [4,4]), "butcher", "sheep", "meat"));
entities.push(new SpecialisedWorker(4000, CreateResources(["water", "meat"], [4,4]), "skinner", "sheep", "wool"));
entities.push(new SpecialisedWorker(400, CreateResources(["water", "meat"], [4,4]), "shirt", "wool", "shirt"));
entities.push(new Worker(40, CreateResources(["water", "meat"], [4,4]), "sheep"));
entities.push(new Bank(10000))
setEntitiesPos(entities);


export async function Loop() {
    totalMoney = 0
    drawEntities();
    currentSimulationStep = "Working"
    for(const e of entities){
        await e.work()
        totalMoney += e.money
    }
    currentSimulationStep = "Trading"
    await handleTransactions()
    getResourcePrice()
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
            const buyStatus = await e.makeBuyOffers(entities.filter(e => e instanceof Worker));
            if (buyStatus) buyDemand = true;
        }
    }
}
function getResourcePrice(){
    resourcePriceString = ""
    const resourceDict: { [key: string]: {sellPriceSum: number, buyPriceSum: number, frequency: number}} = {}
    
    entities.filter(e => e instanceof Worker).forEach(e => {
        Object.entries(e.resources).forEach(r => {
            if(resourceDict[r[0]] == null){
                resourceDict[r[0]] = {sellPriceSum: r[1].sellPrice, buyPriceSum: r[1].buyPrice, frequency: 1}
            }else{
                resourceDict[r[0]].buyPriceSum += r[1].buyPrice
                resourceDict[r[0]].sellPriceSum += r[1].sellPrice
                resourceDict[r[0]].frequency++
            }
        })
    })
    Object.entries(resourceDict).forEach(r => {
        resourcePrices[r[0]] = {avgBuyPrice: Math.round(r[1].buyPriceSum/r[1].frequency), avgSellPrice: Math.round(r[1].sellPriceSum/r[1].frequency)}
        resourcePriceString += `${ResourceTable[r[0]]}:  Avg Price: $${Math.round(r[1].sellPriceSum/r[1].frequency)} \n`
    })
}
