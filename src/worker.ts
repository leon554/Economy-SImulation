import { baseWorker } from "./baseWorker";
import { GATHER_AMOUNT } from "./constants";
import { drawEntities, drawResourceTransaction, getCenterPoint } from "./drawingUtil";
import { calculateResourceData } from "./log";
import {  drawUiEvent,  updateUIEvent } from "./simulation";
import { ResourceType} from "./type";

import {ProfesionToResource, ResourceTable, EntityType } from "./util";

export class unSkilledWorker extends baseWorker{
    type = EntityType.worker

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string) {
        super(startingMoney, startingResources, profesion)
    }
    
    public async work(entities: baseWorker[]) {
        this.checkAndCreateResource(ProfesionToResource[this.profesion])
        for(let i = 0; i< GATHER_AMOUNT;i++){
            await drawResourceTransaction(getCenterPoint(), this.position, ProfesionToResource[this.profesion])
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
