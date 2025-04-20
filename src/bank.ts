import { MIN_VITAL_RESOURCE_AMT, TAX_RATE, WELLFARE_MULTIPLIER } from "./constants";
import { drawMoneyTransaction} from "./drawingUtil";
import { saleEvent, updateUIEvent } from "./simulation";
import { Position, Drawable, SaleType} from "./type";
import { EntityType, getID, } from "./util";
import { resourcePrices } from "./log";
import { baseWorker } from "./baseWorker";

export class Bank implements Drawable {
    type = EntityType.bank
    id: number;
    money: number;
    position: Position = { x: 0, y: 0 };
    drawData: string;
    icon: string;
    profesion= "bank";


    constructor(startingMoney: number) {
        this.money = startingMoney;
        this.id = getID();
        this.drawData = "BANK"
        this.updateDrawData();
        this.icon = "circle";
        saleEvent.subscribe((saleData, entities: baseWorker[]) => this.handleSaleTax(saleData, entities))
        updateUIEvent.subscribe(() => this.updateDrawData())
    }
    private updateDrawData() {
        this.drawData = `$${Math.round(this.money)}`;
    }
    public async work(entities: baseWorker[]) {
       
        //add event to update ui
        for(const e of entities){
            const sheepAmt = e.resources["meat"].amount
            const waterAmt = e.resources["water"].amount
            const minResourceAmt = (MIN_VITAL_RESOURCE_AMT - 2 > 0) ? MIN_VITAL_RESOURCE_AMT - 2 : MIN_VITAL_RESOURCE_AMT

            if(sheepAmt < minResourceAmt){
                await this.payWelfare("meat", e)
            }
            if(waterAmt < minResourceAmt){
                await this.payWelfare("water", e)
            }
        }

    }
    private async payWelfare(resource: string, worker: baseWorker){
        const wellFareAmt = (resourcePrices[resource] != null) ? resourcePrices[resource].avgSellPrice : 10
        if(this.money < wellFareAmt * WELLFARE_MULTIPLIER) return
        this.money -= wellFareAmt * WELLFARE_MULTIPLIER
        updateUIEvent.emit()
        await drawMoneyTransaction(this.position, worker.position)
        worker.money += wellFareAmt * WELLFARE_MULTIPLIER
        updateUIEvent.emit()
    }
    async handleSaleTax(saleData: SaleType, entities: baseWorker[]) {
        const sellerPos = entities.find(e => saleData.sellerID == e.id)!.position
        const bankPos = this.position

        await drawMoneyTransaction(sellerPos, bankPos)

        this.money += (saleData.price * TAX_RATE)

        updateUIEvent.emit()

    }

    
}
