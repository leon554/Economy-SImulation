import { MAX_BUY_SELL_PRICE, MIN_VITAL_RESOURCE_AMT, TAX_RATE } from "../constants";
import {drawTransaction} from "../Util/drawingUtil";
import { days, saleEvent, updateUIEvent } from "../simulation";
import { Position, ResourceType, Drawable, SellerReturnType, DenyReason, EntityType} from "../Util/type";
import { findWorkerByID, getID, profesionTable, ResourceTable } from "../Util/util";



export abstract class baseWorker implements Drawable{
    type = EntityType.baseWorker
    resources: ResourceType;
    id: number;
    money: number;
    position: Position = { x: 0, y: 0 };
    drawData: string;
    profesion: string;
    currentActivity: string = "idle"

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string) { 
        this.money = startingMoney;
        this.id = getID();
        this.resources = startingResources;
        this.profesion = profesion;
        this.drawData = ""
        this.updateDrawData();
        updateUIEvent.subscribe(() => this.updateDrawData())
    }
    protected updateDrawData() {
        this.drawData = `ID: ${this.id}, $${Math.round(this.money)}, p${profesionTable[this.profesion]} ^ ${this.getResourcesAsString()} ^ ${this.currentActivity}`;
    }
    protected getResourcesAsString() {
        let resources: string = "";
        Object.entries(this.resources).map((entry) => {
            if(entry[1].amount > 0){
                resources += `${ResourceTable[entry[0]]}${entry[1].amount}`;
            }
        });
        return resources;
    }
    public printStats() {
        let resources: string = "";
        Object.entries(this.resources).map((entry) => {
            resources += `${entry[0]}: ${entry[1]} \n`;
        });
        console.log(
            `------Worker-ID: ${this.id}------\nMoney: ${this.money}\nResources-----------------\n${resources}--------------------------`
        );
    }
    protected checkAndCreateResources(){
        Object.keys(ResourceTable).forEach(resource => {
            if(this.resources[resource] == null){
                this.resources[resource] = {amount: 0, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0, tier: 1}
            }
        })
    }

    public consumeResources(){
        this.resources["water"].amount -= 1
        this.resources["meat"].amount -= 1
        this.currentActivity = `Consumed 1${ResourceTable["water"]} & 1${ResourceTable["sheep"]}`

        if(this.resources["water"].amount < 0 || this.resources["meat"].amount < 0){
            return false
        }else{
            return true
        }
    }
    
    abstract work(entities: baseWorker[]) : Promise<void>

    public async makeBuyOffers(people: baseWorker[]){
        this.checkAndCreateResources()
        const hasBoughtArr: boolean[] = []

        hasBoughtArr.push(await this.MakeBuyOffer(people, "water", MIN_VITAL_RESOURCE_AMT))
        hasBoughtArr.push(await this.MakeBuyOffer(people, "meat", MIN_VITAL_RESOURCE_AMT))

        return hasBoughtArr.includes(true)
    }
    protected async MakeBuyOffer(people: baseWorker[], resource: string, minResourceAmt: number){
        if(this.resources[resource].amount >= minResourceAmt) return false
        if(this.resources[resource].buyPrice >= this.money) return false 

        let NoSupply = false

        while(this.resources[resource].buyPrice < this.money && NoSupply == false){
            //make event that fires to check if anyone is selleing resource x
            NoSupply = true
            for (const potentialSeller of people) {
                if(potentialSeller.id == this.id) continue

                this.currentActivity = `Offer to ${potentialSeller.id} for ${ResourceTable[resource]}`
                const buyOfferSucces = await potentialSeller.isWillingToSellX(resource, this.resources[resource].buyPrice, this.id, people)
                
                if(buyOfferSucces.denyReason != DenyReason.NotEnoughSupply) NoSupply = false
                if(buyOfferSucces.saleSucces){
                    this.currentActivity = `Bought ${ResourceTable[resource]} from ${potentialSeller.id}`
                    this.resources[resource].buyPrice -= this.resources[resource].buyPrice > 1 ? 1 : 0
                    return true
                }
            }
            
            if(this.resources[resource].buyPrice < MAX_BUY_SELL_PRICE ){
                this.resources[resource].buyPrice++
            }else break
        }
        return false
    }

    public async isWillingToSellX(resource: string, price: number, buyerId: number, workers: baseWorker[]): Promise<SellerReturnType>{
        const resourceReserveAmount = 6
        this.checkAndCreateResources()

        if(this.resources[resource].amount < resourceReserveAmount) return {saleSucces: false, denyReason: DenyReason.NotEnoughSupply}
        
        if(this.shouldReduceSellPrice(price, resource)) return {saleSucces: false, denyReason: DenyReason.OfferToLow}

        const buyer = findWorkerByID(workers, buyerId)
        const seller = this

        buyer.money -= price
        seller.resources[resource].amount--

        await updateUIEvent.emit()
        
        await drawTransaction(buyer, seller, resource)

        seller.money += (price * (1-TAX_RATE))
        buyer.resources[resource].amount++

        await updateUIEvent.emit()

        await saleEvent.emit({buyerID: buyer.id, sellerID: seller.id, amountSold: 1, price: price}, workers)

        await updateUIEvent.emit()

       this.increaseSellPriceIfSoldOut(resource, resourceReserveAmount)


        this.currentActivity = `sold ${ResourceTable[resource]} to ${buyer.id} for $${price}`
        return {saleSucces: true, denyReason: DenyReason.None}
    }

    protected shouldReduceSellPrice(offerPrice: number, resource: string){
        if(offerPrice > this.resources[resource].sellPrice ) return false

        if(this.resources[resource].dayPriceLastUpdated < days){
            this.resources[resource].sellPrice -= this.resources[resource].sellPrice > 1 ? 1 : 0
            this.resources[resource].dayPriceLastUpdated = days
        }

        return true
    }
    protected increaseSellPriceIfSoldOut(resource: string, resourceReserveAmount: number){
        if(this.resources[resource].amount > resourceReserveAmount) return 
        
        this.resources[resource].sellPrice += (this.resources[resource].sellPrice < MAX_BUY_SELL_PRICE) ? 1: 0
    }
}

