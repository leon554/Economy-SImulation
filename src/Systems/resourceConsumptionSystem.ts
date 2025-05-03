import { Inventory, Person } from "../Components/components";
import { ECS, Entity } from "../Util/ecs";
import { vitalResources } from "../Util/util";



export function consumeResourcesAndDelDead(ecs: ECS){

    const entitiesIDToDel: Entity[] = []
    const entities = ecs.getEntitiesWithComponents(Person, Inventory)

    for(const entity of entities){
        const alive = consumeResources(ecs.getComponent(entity, Inventory)!)
        if(!alive) entitiesIDToDel.push(entity)
    }

    for(const delEnt of entitiesIDToDel){
        ecs.deleteEntity(delEnt)
    }
}
function consumeResources(inventory: Inventory){
    const resources = inventory.resources

    Object.entries(resources).forEach(r => {
        if(vitalResources.includes(r[0])){
            r[1].amount--
        }
    })

    const vital = Object.entries(resources).filter(r => vitalResources.includes(r[0])).map(r => r[1].amount)
    return (vital.every(a => a >= 0)) ? true : false
}