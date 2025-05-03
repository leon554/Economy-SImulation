import { Inventory, DrawComp, UnSkilledWork, IsTradeable, WellfareRecievable, ActivityTracker, Person, SkilledWork, Bank } from "../Components/components"
import { ECS } from "./ecs"
import { CreateResources } from "./util"

export class EntityFactory{
    private static createBaseWorker(Profesion: string, money: number, ecs: ECS){
      const id = ecs.createEntity()
      ecs.addComponent(id, DrawComp, new DrawComp(Profesion))
      ecs.addComponent(id, Inventory, new Inventory(CreateResources(["water", "meat"], [5,5]), money))
      ecs.addComponent(id, IsTradeable, new IsTradeable())
      ecs.addComponent(id, WellfareRecievable, new WellfareRecievable())
      ecs.addComponent(id, ActivityTracker, new ActivityTracker())
      ecs.addComponent(id, Person, new Person())
      return id
    }
    static createUnskilledWorker(profesion: string, outputResources: string[], money: number, ecs:ECS){
        const id = EntityFactory.createBaseWorker(profesion, money, ecs)
        ecs.addComponent(id, UnSkilledWork, new UnSkilledWork(outputResources))
        return id
    }
    static createSkilledWorker(profesion: string, inputResources: string[], outputResources: string[], money: number, ecs: ECS){
        const id = EntityFactory.createBaseWorker(profesion, money, ecs)
        ecs.addComponent(id, SkilledWork, new SkilledWork(inputResources, outputResources))
        return id
    }
    static createNonTradableBank(money: number, ecs: ECS){
        const id = ecs.createEntity()
        ecs.addComponent(id, DrawComp, new DrawComp("bank"))
        ecs.addComponent(id, Inventory, new Inventory({}, money))
        ecs.addComponent(id, Bank, new Bank())
        ecs.addComponent(id, ActivityTracker, new ActivityTracker())
        return id
    }
    static createTradableBank(money: number, ecs: ECS){
        const id = this.createNonTradableBank(money, ecs)
        ecs.addComponent(id, IsTradeable, new IsTradeable())
        return id
    }
}