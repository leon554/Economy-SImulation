import { d } from "../main"
import { HorizontalAllign } from "../draw/Draw"
import { color } from "../draw/Color"
import { addDrawEvent } from "./drawingUtil"
import {  ResourceTable } from "./util"
import { baseWorker } from "../Entities/baseWorker"
import { TierManager } from "./tierManager"


let resourcePriceString = ""
let resourcePriceMaxString = ""
let resourcePriceMinString = ""
let resourceAmountString = ""
export let resourceAmountData : {[key: string]: number} = {}
export let resourcePrices : { [key: string]: {avgSellPrice: number, avgBuyPrice: number}} = {}


addDrawEvent(() => {d.text(resourcePriceString,12,10,75, HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text("Max: " + resourcePriceMaxString,12,10,100, HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text("Min: " + resourcePriceMinString,12,10,125, HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(TierManager.getTierString(),12,10,150, HorizontalAllign.start,undefined,new color(255, 255, 255));})
addDrawEvent(() => {d.text(resourceAmountString,12,10,175, HorizontalAllign.start,undefined,new color(255, 255, 255));});

export function calculateResourceData(entities: baseWorker[]){
    resourcePriceString = ""
    resourcePriceMinString = ""
    resourcePriceMaxString = ""
    resourceAmountString = ""
    const resourceDict: { [key: string]: {sellPriceSum: number, buyPriceSum: number, frequency: number, amount: number, maxPrice: number, minPrice:number}} = {}
    
    entities.forEach(e => {
        Object.entries(e.resources).forEach(r => {
            if(resourceDict[r[0]] == null){
                resourceDict[r[0]] = {sellPriceSum: r[1].sellPrice, buyPriceSum: r[1].buyPrice, frequency: 1, amount: r[1].amount, maxPrice: r[1].sellPrice, minPrice: r[1].sellPrice}
            }else{
                resourceDict[r[0]].buyPriceSum += r[1].buyPrice
                resourceDict[r[0]].sellPriceSum += r[1].sellPrice
                resourceDict[r[0]].frequency++
                resourceDict[r[0]].amount += r[1].amount
                resourceDict[r[0]].maxPrice = (r[1].sellPrice > resourceDict[r[0]].maxPrice) ? r[1].sellPrice : resourceDict[r[0]].maxPrice
                resourceDict[r[0]].minPrice = (r[1].sellPrice < resourceDict[r[0]].maxPrice) ? r[1].sellPrice : resourceDict[r[0]].maxPrice
            }
        })
    })
    Object.entries(resourceDict).forEach(r => {
        resourcePrices[r[0]] = {avgBuyPrice: Math.round(r[1].buyPriceSum/r[1].frequency), avgSellPrice: Math.round(r[1].sellPriceSum/r[1].frequency)}
        resourcePriceString += `${ResourceTable[r[0]]}: $${Math.round(r[1].sellPriceSum/r[1].frequency)}`
        resourcePriceMaxString += `${ResourceTable[r[0]]}: $${r[1].maxPrice}`
        resourcePriceMinString += `${ResourceTable[r[0]]}: $${r[1].minPrice}`
        resourceAmountString += `${ResourceTable[r[0]]}:${r[1].amount} `
        resourceAmountData[r[0]] = r[1].amount
    })
}