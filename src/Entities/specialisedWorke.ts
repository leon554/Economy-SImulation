import { Drawable, ResourceType, EntityType, SaleType} from "../Util/type"
import { calculateResourceData } from "../Util/log"
import { baseWorker } from "./baseWorker"
import { currentSimulationStep, saleEvent, updateUIEvent } from "../simulation"
import { TierManager } from "../Util/tierManager"
import { ResourceTable, shuffleArray } from "../Util/util"
import { SPECIALISED_PROFIT_MARGIN, TAX_RATE } from "../constants"


export class SpecialisedWorker extends baseWorker implements Drawable{
    type = EntityType.specialisedWorker
    inputResources: string[]
    outputResources: string[]
    private totalBought: number = 0
    private totalBoughtPrice: number = 0
    private avgBuyPrice: number = 0
    private profit: number = 0

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string, inputResource: string[], outputResource: string[]){
        super(startingMoney, startingResources, profesion)
        this.inputResources = [...inputResource]
        this.outputResources = [...outputResource]
        TierManager.addRecipe(outputResource, inputResource)
        saleEvent.subscribe((saleData: SaleType, _) => this.updateAvgBuyData(saleData))
    }
    private updateAvgBuyData(saleData: SaleType){
        if(saleData.sellerID == this.id && this.outputResources.includes(saleData.resource)){
            this.profit += saleData.price
        }

        if(saleData.buyerID != this.id || currentSimulationStep == "Trading") return
        this.totalBought++
        this.totalBoughtPrice += saleData.price
        this.profit -= saleData.price
        this.avgBuyPrice = this.totalBoughtPrice/this.totalBought

        const outputPrice = ((this.inputResources.length * this.avgBuyPrice)/this.outputResources.length) * (1 + SPECIALISED_PROFIT_MARGIN) 
        for(const resource of this.outputResources){
            this.resources[resource].minSellPrice = outputPrice / (1-TAX_RATE)
        }
    }

    async work(workers: baseWorker[]){
        this.checkAndCreateResources()
       
        const minOutputResourceAmt = Math.min(...this.outputResources.map(outputResource => this.resources[outputResource].amount))
        if(minOutputResourceAmt/2 > SpecialisedWorker.getBiggestNonOutputResource(this.resources, this.outputResources)) return 

        for(const inputResource of this.inputResources){
            await this.offerAndBuyResource(inputResource, workers)
        }
        this.inputResources = shuffleArray(this.inputResources)
        this.createOutputResources(workers)
    }

    private createOutputResources(workers: baseWorker[]){
        if(!this.inputResources.every(inputResource => this.resources[inputResource].amount > 1)) return 

        const minInputResourceAmt = Math.min(...this.inputResources.map(inputResource => this.resources[inputResource].amount))
        const minOutputResourceAmt = Math.min(...this.outputResources.map(outputResource => this.resources[outputResource].amount))
        
        if(minOutputResourceAmt/2 > SpecialisedWorker.getBiggestNonOutputResource(this.resources, this.outputResources)) return 

        const produceAmt = minInputResourceAmt - SpecialisedWorker.getSmallestResouceAmt(this.resources)
        if(produceAmt <= 0) return

        for(let i = 0; i < produceAmt; i++){
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
        while(supplyLeft && boughtAmt < workers.length && this.resources[resource].amount < 20){ 
            supplyLeft = await this.MakeBuyOffer(workers, resource)
            boughtAmt++
            updateUIEvent.emit()
        }
    }
    private static getSmallestResouceAmt(resources: ResourceType){
        return Math.min(...Object.values(resources).filter(r => r.amount != 0).map(r => r.amount))
    }
    private static getBiggestNonOutputResource(resources: ResourceType, outputResources: string[]){
        const nonOutputResources = Object.entries(resources).filter(r => !outputResources.includes(r[0]))
        return Math.max(...nonOutputResources.map(r => r[1].amount))
    }
}