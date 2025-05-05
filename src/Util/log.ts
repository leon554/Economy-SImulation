import { d } from "../main"
import { HorizontalAllign } from "../draw/Draw"
import { color } from "../draw/Color"
import { ResourceTable } from "../simulationCreator"
import { TierManager } from "./tierManager"
import { ECS } from "./ecs"
import { Inventory } from "../Components/components"
import { addDrawEvent } from "../Systems/drawSystems"

//rewrite this to be more acurate and to consider the new min sell price atribute
let avgResourcePriceString = ""
let resourcePriceMaxString = ""
let resourcePriceMinString = ""
let resourceAmountString = ""
export let resourceAmountData : {[key: string]: number} = {}
export let resourceAvgPriceData: { [key: string]: {avgSellPrice: number, avgBuyPrice: number}} = {}

export function InitLog(){
    addDrawEvent(() => {d.text("Avg" + avgResourcePriceString,12,10,75, HorizontalAllign.start,undefined,new color(255, 255, 255));});
    addDrawEvent(() => {d.text("Max: " + resourcePriceMaxString,12,10,100, HorizontalAllign.start,undefined,new color(255, 255, 255));});
    addDrawEvent(() => {d.text("Min: " + resourcePriceMinString,12,10,125, HorizontalAllign.start,undefined,new color(255, 255, 255));});
    addDrawEvent(() => {d.text(TierManager.getTierString(),12,10,150, HorizontalAllign.start,undefined,new color(255, 255, 255));})
    addDrawEvent(() => {d.text("Amt:" + resourceAmountString,12,10,175, HorizontalAllign.start,undefined,new color(255, 255, 255));});
}

interface ResourceData {
    totalAmount: number, 
    minSellPrice: number, 
    maxSellPrice: number,
    sellPriceSum: number,
    minBuyPrice: number,
    maxBuyPrice: number,
    buyPriceSum: number
}
const resourceDataInitValues: ResourceData = {
    totalAmount: 0, 
    minSellPrice: Infinity, 
    maxSellPrice: 0,
    sellPriceSum: 0,
    minBuyPrice: Infinity,
    maxBuyPrice: 0,
    buyPriceSum: 0
}
export function calculateResourceData(ecs: ECS){
    avgResourcePriceString = "", resourcePriceMaxString = "", resourcePriceMinString = "", resourceAmountString = ""
    const entities = ecs.getEntitiesWithComponents(Inventory)
    const entityCount = entities.length 

    const resourceData: {[key: string]: ResourceData} = {}
    for(const entity of entities){
        const invData = ecs.getComponent(entity, Inventory)
        Object.entries(invData!.resources).forEach(resource => {
            if(!resourceData[resource[0]]) resourceData[resource[0]] = {...resourceDataInitValues}

            const rd = resourceData[resource[0]]
            rd.totalAmount += resource[1].amount

            const normalSellPrice = resource[1].sellPrice
            const minSellPrice = resource[1].minSellPrice
            const usedSellPrice = Math.max(normalSellPrice, minSellPrice) //implement this in the trading system
            rd.sellPriceSum += usedSellPrice
            rd.maxSellPrice = (rd.maxSellPrice < usedSellPrice) ? usedSellPrice : rd.maxSellPrice
            rd.minSellPrice = (usedSellPrice < rd.minSellPrice) ? usedSellPrice : rd.minSellPrice

            const buyPrice = resource[1].buyPrice
            rd.buyPriceSum += buyPrice
            rd.maxBuyPrice = (rd.maxBuyPrice < buyPrice) ? buyPrice : rd.maxBuyPrice
            rd.minBuyPrice = (buyPrice < rd.minBuyPrice) ? buyPrice : rd.minBuyPrice
        })
    }
    setResourceData(resourceData, entityCount)

}
function setResourceData(resourceData: {[key: string]: ResourceData}, entityCount: number){
    Object.entries(resourceData).forEach(resource => {
        avgResourcePriceString += `${ResourceTable[resource[0]]}: $${Math.round((resource[1].sellPriceSum/entityCount)*10)/10} `
        resourcePriceMaxString += `${ResourceTable[resource[0]]}: $${Math.round(resource[1].maxSellPrice*10)/10} `
        resourcePriceMinString += `${ResourceTable[resource[0]]}: $${Math.round(resource[1].minSellPrice*10)/10} `
        resourceAmountString += `${ResourceTable[resource[0]]}: ${resource[1].totalAmount}`
        resourceAmountData[resource[0]] = resource[1].totalAmount
        resourceAvgPriceData[resource[0]] = {avgSellPrice: Math.round(resource[1].sellPriceSum/entityCount*10)/10, avgBuyPrice: Math.round(resource[1].buyPriceSum/entityCount*10)/10}
    })
}