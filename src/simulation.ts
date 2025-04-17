import { Worker } from "./worker";
import { drawEntities, setEntitiesPos, addDrawEvent } from "./drawingUtil";
import { ResourceTable, shuffleArray } from "./util";
import { d } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";
import { Bank } from "./bank";
import { Event } from "./event";
import { SaleType } from "./type";

export let days = 0;
let totalMoney = 0
let resourcePriceString = ""
addDrawEvent(() => {d.text(`Day: ${days}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(resourcePriceString,12,10,75, HorizontalAllign.start,undefined,new color(255, 255, 255));});
export let entities: (Worker| Bank)[] = [];
export let resourcePrices : { [key: string]: {avgSellPrice: number, avgBuyPrice: number}} = {}
export const saleEvent = new Event<(saleData: SaleType) => void>()
export const updateUIEvent = new Event<() => void>()

entities.push(new Worker(40, { water: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0}, sheep: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0} }, "water"));
entities.push(new Worker(40, { water: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0}, sheep: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0} }, "sheep"));
entities.push(new Worker(4000, { water: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0}, sheep: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0} }, "butcher"));
entities.push(new Worker(40, { water: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0}, sheep: {amount: 2, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0} }, "sheep"));
entities.push(new Bank(10000))
setEntitiesPos(entities);


export async function Loop() {
    totalMoney = 0
    drawEntities();
    console.log("1")
    for(const e of entities){
        await e.work()
        totalMoney += e.money
    }
    
    await handleTransactions()
    getResourcePrice()

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
