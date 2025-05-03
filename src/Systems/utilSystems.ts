import { ActivityTracker, Inventory, SkilledWork, UnSkilledWork } from "../Components/components";
import { ECS, Entity } from "../Util/ecs";
import { TierManager } from "../Util/tierManager";


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
}

export function CalculateTotalMoney(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(Inventory)
    let totalMoney = 0
    for(const entity of entities){
        totalMoney += ecs.getComponent(entity, Inventory)!.money
    }
    return totalMoney
}