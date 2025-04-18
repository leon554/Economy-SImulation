import { Drawable, ResourceType } from "./type"
import { Worker } from "./worker"
import { entities } from "./simulation"


export class SpecialisedWorker extends Worker implements Drawable{
    inputResource: string
    outputResource: string

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string, inputResource: string, outputResource: string){
        super(startingMoney, startingResources, profesion)
        this.inputResource = inputResource
        this.outputResource = outputResource
    }
    //make it so worker sells for higer than buy
    //make it so worker doesnt by all the supply
    override async work(){
        this.checkAndCreateResources()
        let supplyLeft = true
        let boughtAmt = 0
        while(supplyLeft && boughtAmt < 10 && this.resources[this.outputResource].amount < 20){
            supplyLeft = await this.MakeBuyOffer(entities.filter(e => e instanceof Worker), this.inputResource, Number.MAX_VALUE)
            boughtAmt++
        }

        if(this.resources[this.inputResource].amount > 1){
            for(let i = 0; i < this.resources[this.inputResource].amount; i++){
                this.resources[this.outputResource].amount += 1;
                this.resources[this.inputResource].amount -= 1;
            }
        }
    }
}