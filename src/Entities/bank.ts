import { MIN_VITAL_RESOURCE_AMT, PAY_WELFARE_TO_LOWEST_QOL, TAX_RATE, WELLFARE_MULTIPLIER } from "../constants";
import { drawOneWayTransaction} from "../Util/drawingUtil";
import { saleEvent, updateUIEvent } from "../simulation";
import { Drawable, SaleType, EntityType} from "../Util/type";
import { resourcePrices } from "../Util/log";
import { baseWorker } from "./baseWorker";
import { Institution } from "./institution";

export class Bank extends Institution implements Drawable {
    type = EntityType.bank

    constructor(startingMoney: number) {
        super(startingMoney, "bank")
        saleEvent.subscribe((saleData: SaleType, entities: baseWorker[]) => this.handleSaleTax(saleData, entities))
    }

    public async work(entities: baseWorker[]) {
        let smallestQolEntity: baseWorker = entities[0]
        for(const e of entities){
            const meatAmt = e.resources["meat"].amount
            const waterAmt = e.resources["water"].amount
            const minResourceAmt = (MIN_VITAL_RESOURCE_AMT - 2 > 0) ? MIN_VITAL_RESOURCE_AMT - 2 : MIN_VITAL_RESOURCE_AMT

            if(meatAmt < minResourceAmt){
                await this.payWelfare(this.calcWelfareAmtForResource("meat"), e)
            }
            if(waterAmt < minResourceAmt){
                await this.payWelfare(this.calcWelfareAmtForResource("water"), e)
            }

            if(!PAY_WELFARE_TO_LOWEST_QOL) continue
            smallestQolEntity = (e.getQol() < smallestQolEntity.getQol()) ? e : smallestQolEntity
        }

        if(!PAY_WELFARE_TO_LOWEST_QOL) return
        if(smallestQolEntity.money > 1000) return
        await this.payWelfare(20, smallestQolEntity)

    }
    private async payWelfare(wellFareAmt: number, worker: baseWorker){
        
        
        if(this.money < wellFareAmt * WELLFARE_MULTIPLIER) return
        this.money -= wellFareAmt * WELLFARE_MULTIPLIER

        updateUIEvent.emit()
        await drawOneWayTransaction(this.position, worker.position, "💰")

        worker.money += wellFareAmt * WELLFARE_MULTIPLIER
        this.currentActivity = `Paid ${worker.id} $${wellFareAmt * WELLFARE_MULTIPLIER}`

        updateUIEvent.emit()
    }
    private calcWelfareAmtForResource(resource: string){
        return (resourcePrices[resource] != null) ? resourcePrices[resource].avgSellPrice : 10
    }
    async handleSaleTax(saleData: SaleType, entities: baseWorker[]) {
        const sellerPos = entities.find(e => saleData.sellerID == e.id)!.position
        const bankPos = this.position

        await drawOneWayTransaction(sellerPos, bankPos, "💰")

        this.money += (saleData.price * TAX_RATE)
        this.currentActivity = `Recieved $${Math.round(saleData.price * TAX_RATE)} from ${saleData.sellerID}`
        updateUIEvent.emit()
    }  
}
