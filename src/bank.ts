import { MIN_VITAL_RESOURCE_AMT, TAX_RATE, WELLFARE_MULTIPLIER } from "./constants";
import { drawMoneyTransaction} from "./drawingUtil";
import {  entities, resourcePrices, saleEvent, updateUIEvent } from "./simulation";
import { Position, Drawable, SaleType} from "./type";
import { getID, } from "./util";
import { Worker } from "./worker";

export class Bank implements Drawable {
    id: number;
    money: number;
    position: Position = { x: 0, y: 0 };
    data: string;
    icon: string;
    profesion= "bank";


    constructor(startingMoney: number) {
        this.money = startingMoney;
        this.id = getID();
        this.data = "BANK"
        this.updateDrawData();
        this.icon = "circle";
        saleEvent.subscribe((saleData) => this.handleSaleTax(saleData))
        updateUIEvent.subscribe(() => this.updateDrawData())
    }
    private updateDrawData() {
        this.data = `$${Math.round(this.money)}`;
    }
    public async work() {
        const workers = entities.filter(e => e instanceof Worker)
        //add event to update ui
        for(const e of workers){
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
    private async payWelfare(resource: string, worker: Worker){
        const wellFareAmt = (resourcePrices[resource] != null) ? resourcePrices[resource].avgSellPrice : 10
        if(this.money < wellFareAmt * WELLFARE_MULTIPLIER) return
        this.money -= wellFareAmt * WELLFARE_MULTIPLIER
        updateUIEvent.emit()
        await drawMoneyTransaction(this.position, worker.position)
        worker.money += wellFareAmt * WELLFARE_MULTIPLIER
        updateUIEvent.emit()
    }
    async handleSaleTax(saleData: SaleType){
        const sellerPos = entities.find(e => saleData.sellerID == e.id)!.position
        const bankPos = this.position

        await drawMoneyTransaction(sellerPos, bankPos)

        this.money += (saleData.price * TAX_RATE)

        updateUIEvent.emit()

    }

    
}
