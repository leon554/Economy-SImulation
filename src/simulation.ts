import { d, isPaused } from "./main";
import { color } from "./draw/Color";
import { HorizontalAllign } from "./draw/Draw";
import { Event } from "./Util/event";
import { SaleType, SimulationStep} from "./Util/type";
import { GAME_SPEED } from "./constants";
import { TierManager } from "./Util/tierManager";
import { ECS } from "./Util/ecs";
import { drawEntities, setEntitiesPos, UpdateDrawText } from "./Systems/drawSystems";
import { MakeTrades, reducePricesIfNecasary, Work } from "./Systems/tradeSystems";
import { handleSaleTax, handleWelfarePayments } from "./Systems/bankSystems";
import { updateAvgBuyData, workSkilled } from "./Systems/skilledWorkSystems";
import { addDrawEvent } from "./Systems/drawSystems";
import { addRecipesForTiers, calculateAVGQOL, CalculateTotalMoney } from "./Systems/utilSystems";
import { calculateResourceData, InitLog } from "./Util/log";
import { consumeResourcesAndDelDead } from "./Systems/resourceConsumptionSystem";
import { loadSimulationEntities, ResourceTable } from "./simulationCreator";
import { ActivityMananger } from "./Util/activityManager";

export let currentDay = 0;
export let currentSimulationStep = SimulationStep.Idle
export let avgQOl = 0
let totalMoney = 0

export const ecs = new ECS()

addDrawEvent(() => {d.text(`Day: ${currentDay}, Step: ${currentSimulationStep}`,22,10,25,HorizontalAllign.start,undefined,new color(255, 255, 255));});
addDrawEvent(() => {d.text(`Money In Circulation: $${Math.round(totalMoney)}, Game Speed: ${20 -Math.abs(GAME_SPEED)}x AVG QOL: ${avgQOl}`,12,10,50, HorizontalAllign.start,undefined,new color(255, 255, 255));});
InitLog()

export const saleEvent = new Event<(saleData: SaleType, ecs: ECS) => void>()
export const updateUIEvent = new Event<() => void>()

loadSimulationEntities()


setEntitiesPos(ecs)
saleEvent.subscribe((saleData: SaleType, ecs: ECS) => handleSaleTax(saleData, ecs))
saleEvent.subscribe((saleData: SaleType, ecs: ECS) => updateAvgBuyData(saleData, ecs))
saleEvent.subscribe((saleData: SaleType) => 
  ActivityMananger.logActivity(`${saleData.sellerID} sold ${ResourceTable[saleData.resource]} to ${saleData.buyerID} for $${saleData.price}`
))


export async function onLoad(){
  calculateResourceData(ecs)
  addRecipesForTiers(ecs)
  TierManager.calculateTiers()
  UpdateDrawText(ecs)
}
export async function Loop() {
  if(isPaused) return
  avgQOl = calculateAVGQOL(ecs)
  UpdateDrawText(ecs)
  drawEntities(ecs)
  currentSimulationStep = SimulationStep.Working
  await Work(ecs)
  avgQOl = calculateAVGQOL(ecs)
  await workSkilled(ecs)
  await handleWelfarePayments(ecs)
  currentSimulationStep = SimulationStep.Trading
  await MakeTrades(ecs)
  reducePricesIfNecasary(ecs)
  totalMoney = CalculateTotalMoney(ecs)
  currentSimulationStep = SimulationStep.Consuming
  consumeResourcesAndDelDead(ecs)
  currentDay++
}

