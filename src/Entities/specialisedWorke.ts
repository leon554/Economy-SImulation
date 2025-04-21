import { Drawable, ResourceType, EntityType} from "../Util/type"
import { calculateResourceData } from "../Util/log"
import { baseWorker } from "./baseWorker"
import { updateUIEvent } from "../simulation"
import { TierManager } from "../Util/tierManager"
import { ResourceTable } from "../Util/util"


export class SpecialisedWorker extends baseWorker implements Drawable{
    type = EntityType.specialisedWorker
    inputResources: string[]
    outputResources: string[]

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string, inputResource: string[], outputResource: string[]){
        super(startingMoney, startingResources, profesion)
        this.inputResources = [...inputResource]
        this.outputResources = [...outputResource]
        TierManager.addRecipe(outputResource, inputResource)
    }
    //make it so worker sells for higer than buy
    //make it so worker doesnt by all the supply
    async work(workers: baseWorker[]){
        this.checkAndCreateResources()
       
        for(const inputResource of this.inputResources){
            await this.offerAndBuyResource(inputResource, workers)
        }

        this.createOutputResources(workers)
    }
    private createOutputResources(workers: baseWorker[]){
        if(!this.inputResources.every(inputResource => this.resources[inputResource].amount > 1)) return 

        const minInputResourceAmt = Math.min(...this.inputResources.map(inputResource => this.resources[inputResource].amount))
        if(minInputResourceAmt <= 3) return

        for(let i = 0; i < minInputResourceAmt - 2; i++){
            this.inputResources.forEach(inputResource => this.resources[inputResource].amount--)
            this.outputResources.forEach(outputResource => this.resources[outputResource].amount++)

            calculateResourceData(workers)
        }
        this.currentActivity = `Made ${[...this.outputResources.map(o => ResourceTable[o])]}`
        
    }
    private async offerAndBuyResource(resource: string, workers: baseWorker[]){
        let supplyLeft = true
        let boughtAmt = 0
        //make it so it evenly buys resources if theres more than one
        while(supplyLeft && boughtAmt < 10 && this.resources[resource].amount < 20){ 
            supplyLeft = await this.MakeBuyOffer(workers, resource)
            boughtAmt++
            updateUIEvent.emit()
        }
    }
}