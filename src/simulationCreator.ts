import { ecs } from "./simulation";
import { EntityFactory } from "./Util/entityFactory";

export const ResourceTable : {[key: string]: string} = {
  "water": "💧",
  "sheep": "🐑",
  "meat": "🥩",
  "wool": "🧶",
  "shirt": "👕"
}

export const profesionIcon : {[key: string]: string} = {
  "water": "👷",
  "sheep": "🧑‍🌾",
  "meat": "🧑‍🌾",
  "bank": "🏦",
  "butcher": "🙋",
  "unemployed" : "🙍‍♂️"
}
export function loadSimulationEntities(){
    EntityFactory.createUnskilledWorker("water", ["water", "water"], 200, ecs)
    EntityFactory.createUnskilledWorker("water", [], 200, ecs)
    EntityFactory.createUnskilledWorker("sheep", ["sheep"], 200, ecs)
    EntityFactory.createUnskilledWorker("sheep", ["sheep"], 200, ecs)
    EntityFactory.createSkilledWorker("butcher", ["sheep"], ["meat", "meat"], 200, ecs)
    EntityFactory.createSkilledWorker("skinner", ["sheep"], ["wool", "wool", "wool"], 200, ecs)
    EntityFactory.createSkilledWorker("shirt", ["wool"], ["shirt"], 200, ecs)
    EntityFactory.createNonTradableBank(1000, ecs)
    EntityFactory.createTradableBank(1000, ecs)
    EntityFactory.createUnemployedPerson("unemployed", 100, ecs)
}