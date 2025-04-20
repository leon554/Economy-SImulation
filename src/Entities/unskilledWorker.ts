import { baseWorker } from "./baseWorker";
import { GATHER_AMOUNT } from "../constants";
import { drawEntities, drawOneWayTransaction, getCenterPoint } from "../Util/drawingUtil";
import { calculateResourceData } from "../Util/log";
import {  updateUIEvent } from "../simulation";
import { ResourceType, EntityType} from "../Util/type";
import { TierManager } from "../Util/tierManager";
import {ProfesionToResource, ResourceTable } from "../Util/util";

export class unSkilledWorker extends baseWorker{
    type = EntityType.unSkilledWorker

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string) {
        super(startingMoney, startingResources, profesion)
        TierManager.addRecipe([ProfesionToResource[this.profesion]], [])
    }
    
    public async work(entities: baseWorker[]) {
        this.checkAndCreateResources()
      
        await drawOneWayTransaction(getCenterPoint(), this.position, ResourceTable[ProfesionToResource[this.profesion]])
        this.resources[ProfesionToResource[this.profesion]].amount += GATHER_AMOUNT;
        this.currentActivity = `Worked +${GATHER_AMOUNT}${ResourceTable[ProfesionToResource[this.profesion]]}`
        calculateResourceData(entities)
        
        await updateUIEvent.emit()
        drawEntities(entities)
    }
}
