import { ECS, Entity } from "../Util/ecs"
import { currentSimulationStep } from "../simulation"
import { SaleType, ResourceType, SimulationStep} from "../Util/type"
import { Inventory, SkilledWork } from "../Components/components"
import { TAX_RATE, SPECIALISED_PROFIT_MARGIN } from "../constants"
import { checkAndCreateResources, shuffleArray } from "../Util/util"
import { calculateResourceData } from "../Util/log"
import { MakeBuyOffer } from "./tradeSystems"
import { UpdateDrawText } from "./drawSystems"



export function updateAvgBuyData(saleData: SaleType, ecs: ECS){

    const entities = ecs.getEntitiesWithComponents(Inventory, SkilledWork)

    for(const entity of entities){
        const skillWorkData = ecs.getComponent(entity, SkilledWork)
        const inventoryData = ecs.getComponent(entity, Inventory)

        if(saleData.sellerID == entity && skillWorkData!.outputResources.includes(saleData.resource)){
            //add tax calculation
            skillWorkData!.profit += saleData.price
        }
    
        if(saleData.buyerID != entity || currentSimulationStep == SimulationStep.Trading) return
        skillWorkData!.totalBought++
        skillWorkData!.totalBoughtPrice += saleData.price
        skillWorkData!.profit -= saleData.price
        skillWorkData!.avgBuyPrice = skillWorkData!.totalBoughtPrice/skillWorkData!.totalBought
    
        const outputPrice = ((skillWorkData!.inputResources.length * skillWorkData!.avgBuyPrice)/skillWorkData!.outputResources.length) * (1 + SPECIALISED_PROFIT_MARGIN) 
        for(const resource of skillWorkData!.outputResources){
            inventoryData!.resources[resource].minSellPrice = outputPrice / (1-TAX_RATE)
        }
    }
}

export async function workSkilled(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(SkilledWork, Inventory)

    for(const entity of entities){  
        const invetoryData = ecs.getComponent(entity, Inventory)
        const workData = ecs.getComponent(entity, SkilledWork)
            
        checkAndCreateResources(invetoryData!.resources)
        const minOutputResourceAmt = Math.min(...workData!.outputResources.map(outputResource => invetoryData!.resources[outputResource].amount))
        if(minOutputResourceAmt/4 > getBiggestNonOutputResource(invetoryData!.resources, workData!.outputResources)) continue

        for(const inputResource of workData!.inputResources){
            await offerAndBuyResource(inputResource, entity, ecs)
        }
        workData!.inputResources = shuffleArray(workData!.inputResources)
        createOutputResources(invetoryData!, workData!)
        calculateResourceData(ecs)
    }
}

function createOutputResources(invetoryData: Inventory, workData: SkilledWork){
    if(!workData.inputResources.every(inputResource => invetoryData.resources[inputResource].amount > 1)) return 

    const minInputResourceAmt = Math.min(...workData.inputResources.map(inputResource => invetoryData.resources[inputResource].amount))
    const minOutputResourceAmt = Math.min(...workData.outputResources.map(outputResource => invetoryData.resources[outputResource].amount))
    
    if(minOutputResourceAmt/4 > getBiggestNonOutputResource(invetoryData.resources, workData.outputResources)) return 

    const produceAmt = minInputResourceAmt - getSmallestResouceAmt(invetoryData.resources)
    if(produceAmt <= 0) return

    for(let i = 0; i < produceAmt; i++){
        workData.inputResources.forEach(inputResource => invetoryData.resources[inputResource].amount--)
        workData.outputResources.forEach(outputResource => invetoryData.resources[outputResource].amount++)
    }
}
async function offerAndBuyResource(resource: string, entity: Entity, ecs: ECS){
    let supplyLeft = true
    let boughtAmt = 0
    //make it so it evenly buys resources if theres more than one
    while(supplyLeft && boughtAmt < ecs.getEntityCount()){ 
        supplyLeft = await MakeBuyOffer(resource, entity, ecs)
        boughtAmt++
        UpdateDrawText(ecs)
    }
}
function getSmallestResouceAmt(resources: ResourceType){
    return Math.min(...Object.values(resources).filter(r => r.amount != 0).map(r => r.amount))
}
function getBiggestNonOutputResource(resources: ResourceType, outputResources: string[]){
    const nonOutputResources = Object.entries(resources).filter(r => !outputResources.includes(r[0]))
    return Math.max(...nonOutputResources.map(r => r[1].amount))
}