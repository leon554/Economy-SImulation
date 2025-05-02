import { ECS, Entity } from "../ecs"
import { Inventory, unskilledWork, drawComp, isTradeable } from "../Components/components"
import { checkAndCreateResources, ResourceTable} from "../Util/util"
import { GATHER_AMOUNT, TAX_RATE } from "../constants"
import { drawOneWayTransaction, getCenterPoint, UpdateDrawText, drawTransaction} from "./drawSystems"
import { QolManager } from "../Util/qolManager"
import { SellerReturnType, DenyReason, ResourceType } from "../Util/type"
import { days } from "../simulation"
import { MAX_BUY_SELL_PRICE } from "../constants"
import { calculateResourceData } from "../Util/log"
import { saleEvent } from "../simulation"


export async function Work(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(Inventory, unskilledWork, drawComp)

    for(const entity of entities){
        const drawdata = ecs.getComponent(entity, drawComp)
        const workdata = ecs.getComponent(entity, unskilledWork)
        const inventoryData = ecs.getComponent(entity, Inventory)

        checkAndCreateResources(inventoryData!.resources)

        for(const outputResource of workdata!.ProductionResources){
            await drawOneWayTransaction(getCenterPoint(), drawdata!.position, ResourceTable[outputResource], ecs)
            inventoryData!.resources[outputResource].amount += GATHER_AMOUNT;
                
            UpdateDrawText(ecs)
        }
    }

    calculateResourceData(ecs)
}

export async function MakeTrades(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(Inventory, drawComp, isTradeable)

    let buyDemand = true;
    while (buyDemand) {
        buyDemand = false
        for(const entity of entities){
            const buyStatus = await makeBuyOffers(entity, ecs)
            if (buyStatus) buyDemand = true;
        }
    }
}


async function  makeBuyOffers(entity: Entity, ecs: ECS){
    const inventoryData = ecs.getComponent(entity, Inventory)

    checkAndCreateResources(inventoryData!.resources)

    const hasBoughtArr: boolean[] = []
    const buyResources =  QolManager.bestBuyResourcesForQol(inventoryData!.resources)
    for(const buyResource of buyResources){
        hasBoughtArr.push(await MakeBuyOffer(buyResource, entity, ecs))
    }

    return hasBoughtArr.includes(true)
}

export async function MakeBuyOffer(resource: string, entity: Entity, ecs: ECS){
    const inventoryData = ecs.getComponent(entity, Inventory)

    if(inventoryData!.resources[resource].buyPrice >= inventoryData!.money) return false 

    let NoSupply = false
    while(inventoryData!.resources[resource].buyPrice < inventoryData!.money && NoSupply == false){
        NoSupply = true
        for (const potentialSeller of ecs.getEntitiesWithComponents(isTradeable, Inventory)) {
            if(potentialSeller == entity) continue

            const buyOfferSucces = await isWillingToSellX(resource, inventoryData!.resources[resource].buyPrice, entity, potentialSeller, ecs)
                
            if(buyOfferSucces.denyReason != DenyReason.NotEnoughSupply) NoSupply = false
            if(buyOfferSucces.saleSucces){
                inventoryData!.resources[resource].buyPrice -= inventoryData!.resources[resource].buyPrice > 1 ? 1 : 0
                return true
            }
        }
            
        if(inventoryData!.resources[resource].buyPrice < MAX_BUY_SELL_PRICE && NoSupply == false){
            inventoryData!.resources[resource].buyPrice++
        }else break
    }
    return false
}

async function isWillingToSellX(resource: string, price: number, buyerID: number, sellerID: number, ecs: ECS): Promise<SellerReturnType>{
    const resourceReserveAmount = 6
    const inventoryData = ecs.getComponent(sellerID, Inventory)

    checkAndCreateResources(inventoryData!.resources)

    if(QolManager.bestSellResourceForQol(inventoryData!.resources) != (resource)) return {saleSucces: false, denyReason: DenyReason.NotEnoughSupply}
        
    if(shouldReduceSellPrice(price, resource, inventoryData!.resources)) return {saleSucces: false, denyReason: DenyReason.OfferToLow}

    if(price <  inventoryData!.resources[resource].minSellPrice) return {saleSucces: false, denyReason: DenyReason.OfferToLow}

    const buyer = ecs.getComponent(buyerID, Inventory)
    const seller = ecs.getComponent(sellerID, Inventory)

    buyer!.money -= price
    seller!.resources[resource].amount--

    await UpdateDrawText(ecs)
        
    await drawTransaction(buyerID, sellerID, resource, ecs)

    seller!.money += (price * (1-TAX_RATE))
    buyer!.resources[resource].amount++

    await UpdateDrawText(ecs)

    await saleEvent.emit({buyerID: buyerID, sellerID: sellerID, amountSold: 1, price: price, resource: resource}, ecs)

    await UpdateDrawText(ecs)

    increaseSellPriceIfSoldOut(resource, resourceReserveAmount, seller!)

    return {saleSucces: true, denyReason: DenyReason.None}
}

function shouldReduceSellPrice(offerPrice: number, resource: string, resources: ResourceType){
    if(offerPrice >  resources[resource].sellPrice) return false

    if(resources[resource].dayPriceLastUpdated < days){
        resources[resource].sellPrice -= resources[resource].sellPrice > 1 ? 1 : 0
        resources[resource].dayPriceLastUpdated = days
    }

    return true
}
function increaseSellPriceIfSoldOut(resource: string, resourceReserveAmount: number, seller: Inventory){
    //change this to reduce selle price if its not the chosen sell item
    if(seller.resources[resource].amount > resourceReserveAmount) return 
        seller.resources[resource].sellPrice += (seller.resources[resource].sellPrice < MAX_BUY_SELL_PRICE) ? 1: 0
    }