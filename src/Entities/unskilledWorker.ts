import { baseWorker } from "./baseWorker";
import { GATHER_AMOUNT } from "../constants";
import { drawEntities, drawOneWayTransaction, getCenterPoint } from "../Util/drawingUtil";
import { calculateResourceData } from "../Util/log";
import {  drawUiEvent,  updateUIEvent } from "../simulation";
import { ResourceType, EntityType} from "../Util/type";

import {ProfesionToResource, ResourceTable } from "../Util/util";

export class unSkilledWorker extends baseWorker{
    type = EntityType.unSkilledWorker

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string) {
        super(startingMoney, startingResources, profesion)
    }
    
    public async work(entities: baseWorker[]) {
        this.checkAndCreateResources()
        for(let i = 0; i< GATHER_AMOUNT;i++){
            await drawOneWayTransaction(getCenterPoint(), this.position, ResourceTable[ProfesionToResource[this.profesion]])
            this.resources[ProfesionToResource[this.profesion]].amount += 1;
            this.currentActivity = `Worked +${1}${ResourceTable[ProfesionToResource[this.profesion]]} Total ${i +1}`
            await updateUIEvent.emit()
            drawUiEvent.emit()
            calculateResourceData(entities)
        }
        await updateUIEvent.emit()
        drawEntities(entities)
    }
}
