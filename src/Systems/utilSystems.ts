import { ActivityTracker, Inventory, SkilledWork, UnSkilledWork } from "../Components/components";
import { ActivityMananger } from "../Util/activityManager";
import { ECS, Entity } from "../Util/ecs";
import { QolManager } from "../Util/qolManager";
import { TierManager } from "../Util/tierManager";
import { isResourcesAllZero } from "../Util/util";


export function addRecipesForTiers(ecs: ECS){
    const unSkilledWorkers = ecs.getEntitiesWithComponents(UnSkilledWork)
    const skilledWorkers = ecs.getEntitiesWithComponents(SkilledWork)

    for(const unSkilledWorker of unSkilledWorkers){
        const workData = ecs.getComponent(unSkilledWorker, UnSkilledWork)
        TierManager.addRecipe(workData!.productionResources, [])
    }
    for(const skilledWorker of skilledWorkers){
        const workData = ecs.getComponent(skilledWorker, SkilledWork)
        TierManager.addRecipe(workData!.outputResources, workData!.inputResources)
    }
}

export function setCurrentActivity(currentActivity: string, entity: Entity, ecs: ECS){
    if(!ecs.hasComponent(entity, ActivityTracker)) return
    const activityData = ecs.getComponent(entity, ActivityTracker)!
    activityData.currentActivity = currentActivity
    ActivityMananger.logActivity(`(${currentActivity}) Sender: ${entity}`)
}

export function CalculateTotalMoney(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(Inventory)
    let totalMoney = 0
    for(const entity of entities){
        totalMoney += ecs.getComponent(entity, Inventory)!.money
    }
    return totalMoney
}
export function calculateAVGQOL(ecs: ECS){
    const invComps = ecs.getComponents(Inventory)
    let qolSum = 0
    let totalEntries = 0
    for(const invComp of invComps){
        if(isResourcesAllZero(invComp.resources)) continue
        qolSum += QolManager.calculateQOL(invComp.resources)
        totalEntries++
    }
    return Math.round(qolSum/totalEntries*100)/100
}