import { d, isPaused } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";
import { Event } from "./Util/event";
import { SaleType} from "./Util/type";
import { GAME_SPEED } from "./constants";
import { TierManager } from "./Util/tierManager";
import { ECS } from "./Util/ecs";
import { drawEntities, setEntitiesPos, UpdateDrawText } from "./Systems/drawSystems";
import { MakeTrades, Work } from "./Systems/tradeSystems";
import { handleSaleTax, handleWelfarePayments } from "./Systems/bankSystems";
import { updateAvgBuyData, workSkilled } from "./Systems/skilledWorkSystems";
import { addDrawEvent } from "./Systems/drawSystems";
import { addRecipesForTiers, calculateAVGQOL, CalculateTotalMoney } from "./Systems/utilSystems";
import { InitLog } from "./Util/log";
import { consumeResourcesAndDelDead } from "./Systems/resourceConsumptionSystem";
import { EntityFactory } from "./Util/entityFactory";

export let currentDay = 0;
export let currentSimulationStep = ""
export let avgQOl = 0
let totalMoney = 0

const ecs = new ECS()

addDrawEvent(() => {d.text(`Day: ${currentDay}, Step: ${currentSimulationStep}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}, Game Speed: ${20 -Math.abs(GAME_SPEED)}x AVG QOL: ${avgQOl}`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});
InitLog()

export const saleEvent = new Event<(saleData: SaleType, ecs: ECS) => void>()
export const updateUIEvent = new Event<() => void>()

EntityFactory.createUnskilledWorker("water", ["water", "water"], 200, ecs)
EntityFactory.createUnskilledWorker("water", [], 200, ecs)
EntityFactory.createUnskilledWorker("sheep", ["sheep"], 200, ecs)
EntityFactory.createUnskilledWorker("sheep", ["sheep"], 200, ecs)
EntityFactory.createSkilledWorker("butcher", ["sheep"], ["meat", "meat"], 200, ecs)
EntityFactory.createSkilledWorker("skinner", ["sheep"], ["wool", "wool", "wool"], 200, ecs)
EntityFactory.createSkilledWorker("shirt", ["wool"], ["shirt"], 200, ecs)

EntityFactory.createNonTradableBank(1000, ecs)
EntityFactory.createTradableBank(1000, ecs)


setEntitiesPos(ecs)
saleEvent.subscribe((saleData: SaleType, ecs: ECS) => handleSaleTax(saleData, ecs))
saleEvent.subscribe((saleData: SaleType, ecs: ECS) => updateAvgBuyData(saleData, ecs))


export async function onLoad(){
  addRecipesForTiers(ecs)
  TierManager.calculateTiers()
  UpdateDrawText(ecs)
}
export async function Loop() {
  if(isPaused) return
  avgQOl = calculateAVGQOL(ecs)
  UpdateDrawText(ecs)
  drawEntities(ecs)
  currentSimulationStep = "Working"
  await Work(ecs)
  avgQOl = calculateAVGQOL(ecs)
  await workSkilled(ecs)
  await handleWelfarePayments(ecs)
  currentSimulationStep = "Trading"
  await MakeTrades(ecs)
  totalMoney = CalculateTotalMoney(ecs)
  currentSimulationStep = "Consuming"
  consumeResourcesAndDelDead(ecs)
  currentDay++
}

