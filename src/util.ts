import { ResourceType } from "./type"
import { Worker } from "./worker"

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

export function findWorkerByID(workers: Worker[], id: number){
  const worker =  workers.find(w => w.id == id)
  if(worker == undefined) throw new Error("ID given should exist at all times")
  return worker
}

export const ResourceTable : {[key: string]: string} = {
  "water": "💧",
  "sheep": "🐑",
  "meat": "🥩",
  "wool": "🧶",
  "shirt": "👕"
}
export const ProfesionToResource : {[key: string]: string} = {
  "water": "water",
  "sheep": "sheep",
  "meat": "🥩",
  "wool": "🧶",
  "shirt": "👕"
}
export const profesionTable : {[key: string]: string} = {
  "water": "💧",
  "sheep": "🐑",
  "butcher": "🥩",
  "skinner": "🧶",
  "shirt": "👕"
}
export const profesionIcon : {[key: string]: string} = {
  "water": "👷",
  "sheep": "🧑‍🌾",
  "bank": "🏦",
  "butcher": "🙋"
}

export function CreateResourceData(amount: number, buyPrice: number, sellPrice: number){
  return { amount, buyPrice, sellPrice, dayPriceLastUpdated: 0};
}
export function CreateResources(resources: string[], amounts: number[], buyPrice: number = 10, sellPrice: number = 10){
  let resourcesObj: ResourceType = {}
  resources.forEach((r, i) => {
    resourcesObj[r] = CreateResourceData(amounts[i], buyPrice, sellPrice)
  })
  return resourcesObj
}