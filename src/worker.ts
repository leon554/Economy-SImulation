import { GATHER_AMOUNT, MAX_BUY_SELL_PRICE, MIN_VITAL_RESOURCE_AMT, TAX_RATE } from "./constants";
import { drawEntities, drawResourceTransaction, drawTransAction, getCenterPoint } from "./drawingUtil";
import { days, getResourceData, saleEvent, updateUIEvent } from "./simulation";
import { Position, ResourceType, Drawable, SellerReturnType, DenyReason} from "./type";
import { findWorkerByID, getID, profesionTable, ProfesionToResource, ResourceTable } from "./util";

export class Worker implements Drawable {
    resources: ResourceType;
    id: number;
    money: number;
    position: Position = { x: 0, y: 0 };
    data: string;
    icon: string;
    profesion: string;
    currentActivity: string = "idle"

    constructor(startingMoney: number, startingResources: ResourceType, profesion: string) {
        //add age
        //and luck
        //add global luck on working to simulate e.g storm
        //add transaction history to each worker
        //use events to handle transactions 
        this.money = startingMoney;
        this.id = getID();
        this.resources = startingResources;
        this.profesion = profesion;
        this.data = ""
        this.updateDrawData();
        this.icon = "circle";
        updateUIEvent.subscribe(() => this.updateDrawData())
    }
    protected updateDrawData() {
        console.log("draw data updated for id" + this.id)
        this.data = `ID: ${this.id}, $${Math.round(this.money)}, p${profesionTable[this.profesion]} ^ ${this.getResourcesAsString()} ^ ${this.currentActivity}`;
    }
    protected getResourcesAsString() {
        let resources: string = "";
        Object.entries(this.resources).map((entry) => {
            if(entry[1].amount > 0){
            
                resources += `${ResourceTable[entry[0]]}${entry[1].amount} s${entry[1].sellPrice}`;
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
    protected checkAndCreateResource(resourceName: string){
        if(this.resources[resourceName] == null){
            this.resources[resourceName]  = {amount: 0, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0}
        }
    }
    protected checkAndCreateResources(){
        Object.keys(ResourceTable).forEach(resource => {
            if(this.resources[resource] == null){
                this.resources[resource] = {amount: 0, buyPrice: 10, sellPrice: 10, dayPriceLastUpdated: 0}
            }
        })
    }
    public async work() {
        this.checkAndCreateResource(ProfesionToResource[this.profesion])
        for(let i = 0; i< GATHER_AMOUNT;i++){
            await drawResourceTransaction(getCenterPoint(), this.position, ProfesionToResource[this.profesion])
            this.resources[ProfesionToResource[this.profesion]].amount += 1;
            this.currentActivity = `Worked +${1}${ResourceTable[ProfesionToResource[this.profesion]]} Total ${i +1}`
            await updateUIEvent.emit()
            drawEntities()
            getResourceData()
        }
        await updateUIEvent.emit()
        drawEntities()
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
    public async makeBuyOffers(people: Worker[]){
        this.checkAndCreateResources()
        const hasBoughtArr: boolean[] = []

        hasBoughtArr.push(await this.MakeBuyOffer(people, "water", MIN_VITAL_RESOURCE_AMT))
        //hasBoughtArr.push(await  this.MakeBuyOffer(people, "sheep", MIN_VITAL_RESOURCE_AMT))
        hasBoughtArr.push(await  this.MakeBuyOffer(people, "meat", MIN_VITAL_RESOURCE_AMT))

        return hasBoughtArr.includes(true)
    }
    protected async MakeBuyOffer(people: Worker[], resource: string, minResourceAmt: number){
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
            }else{
                break
            }
        }
        return false
    }

    public async isWillingToSellX(resource: string, price: number, buyerId: number, workers: Worker[]): Promise<SellerReturnType>{
        const resourceReserveAmount = 6
        this.checkAndCreateResources()

        if(this.resources[resource].amount < resourceReserveAmount) return {saleSucces: false, denyReason: DenyReason.NotEnoughSupply}
        
        if(this.shouldReduceSellPrice(price, resource)) return {saleSucces: false, denyReason: DenyReason.OfferToLow}

        const buyer = findWorkerByID(workers, buyerId)
        const seller = this

        buyer.money -= price
        seller.resources[resource].amount--

        await updateUIEvent.emit()
        
        await drawTransAction(buyer, seller, resource)

        seller.money += (price * (1-TAX_RATE))
        buyer.resources[resource].amount++

        await updateUIEvent.emit()

        await saleEvent.emit({buyerID: buyer.id, sellerID: seller.id, amountSold: 1, price: price})

        await updateUIEvent.emit()

       this.increaseSellPriceIfSoldOut(resource, resourceReserveAmount)


        this.currentActivity = `sold ${ResourceTable[resource]} to ${buyer.id} for $${price}`
        console.log(`Buyer ${buyer.id} bought ${resource} for ${price} from seller ${seller.id}`)
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
