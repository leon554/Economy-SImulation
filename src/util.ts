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
  "meat": "🥩"
}
export const profesionTable : {[key: string]: string} = {
  "water": "💧",
  "sheep": "🐑",
  "butcher": "🥩"
}
export const profesionIcon : {[key: string]: string} = {
  "water": "👷",
  "sheep": "🧑‍🌾",
  "bank": "🏦",
  "butcher": "🙋"
}