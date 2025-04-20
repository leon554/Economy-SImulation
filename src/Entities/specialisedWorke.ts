import { Drawable, ResourceType, EntityType} from "../Util/type"
import { calculateResourceData } from "../Util/log"
import { baseWorker } from "./baseWorker"
import { updateUIEvent } from "../simulation"
import { TierManager } from "../Util/tierManager"


export class SpecialisedWorker extends baseWorker implements Drawable{
    type = EntityType.specialisedWorker
    inputResource: string
    outputResource: string

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string, inputResource: string, outputResource: string){
        super(startingMoney, startingResources, profesion)
        this.inputResource = inputResource
        this.outputResource = outputResource
        TierManager.addRecipe([outputResource], [inputResource])
    }
    //make it so worker sells for higer than buy
    //make it so worker doesnt by all the supply
    async work(entities: baseWorker[]){
        this.checkAndCreateResources()
        let supplyLeft = true
        let boughtAmt = 0

        while(supplyLeft && boughtAmt < 10 && this.resources[this.outputResource].amount < 20){
            supplyLeft = await this.MakeBuyOffer(entities, this.inputResource, Number.MAX_VALUE)
            boughtAmt++
            updateUIEvent.emit()
        }

        if(this.resources[this.inputResource].amount > 1){
            for(let i = 0; i < this.resources[this.inputResource].amount; i++){
                this.resources[this.outputResource].amount += 1;
                this.resources[this.outputResource].tier = this.resources[this.inputResource].tier + 1
                this.resources[this.inputResource].amount -= 1;
                calculateResourceData(entities)
            }
        }
    }
}