import { ResourceType } from "./type"
import { ResourceTable } from "../simulationCreator"

let workerID = 0
export function getID(){
  let temp = workerID
  workerID++
  return temp
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; 
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const vitalResources = ["water", "meat"]

export function CreateResourceData(amount: number, buyPrice: number, sellPrice: number, tier: number){
  return { amount, buyPrice, sellPrice, dayPriceLastUpdated: 0, tier, minSellPrice: 0};
}
export function CreateResources(resources: string[], amounts: number[],  buyPrice: number = 10, sellPrice: number = 10){
  let resourcesObj: ResourceType = {}
  resources.forEach((r, i) => {
    resourcesObj[r] = CreateResourceData(amounts[i], buyPrice, sellPrice, 1)
  })
  return resourcesObj
}
export function getResourcesAsString(resources: ResourceType) {
  let resourcesString: string = "";
  Object.entries(resources).map((entry) => {
    if(entry[1].amount > 0){
      resourcesString += `${ResourceTable[entry[0]]}${entry[1].amount}`;
    }
  });
  return resourcesString;
}
export function checkAndCreateResources(resources: ResourceType){
  Object.keys(ResourceTable).forEach(resource => {
    if(resources[resource] == null){
      resources[resource] = {amount: 0, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0, tier: 1, minSellPrice: 0}
    }
  })
}
export function isResourcesAllZero(resources: ResourceType){
  const resourcesValues = Object.values(resources)
  return resourcesValues.every(r => r.amount == 0)
}