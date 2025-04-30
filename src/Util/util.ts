import type { baseWorker } from "../Entities/baseWorker"
import type { Bank } from "../Entities/bank"
import type { entitiesInCategoriesType } from "./type"
import { EntityType } from "./type"
import { ResourceType } from "./type"
import type { unSkilledWorker } from "../Entities/unskilledWorker"
import type { SpecialisedWorker } from "../Entities/specialisedWorke"

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

export function findWorkerByID(workers: baseWorker[], id: number){
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
  "meat": "meat",
}
export const profesionTable : {[key: string]: string} = {
  "water": "💧",
  "sheep": "🐑",
  "butcher": "🥩",
  "skinner": "🧶",
  "shirt": "👕",
  "meat": "🥩"
}
export const profesionIcon : {[key: string]: string} = {
  "water": "👷",
  "sheep": "🧑‍🌾",
  "meat": "👷",
  "bank": "🏦",
  "butcher": "🙋"
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
export function CategoriseEntities(workers: baseWorker[], institutions: Bank[], entitiesInCategories: entitiesInCategoriesType){
  entitiesInCategories.unSkilledWorkers = workers.filter(e => e.type == EntityType.unSkilledWorker) as unSkilledWorker[]
  entitiesInCategories.specialisedWorkers = workers.filter(e => e.type == EntityType.specialisedWorker) as SpecialisedWorker[]
  entitiesInCategories.banks = institutions.filter(e => e.type == EntityType.bank) as Bank[]
}