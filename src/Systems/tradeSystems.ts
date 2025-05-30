import { ECS, Entity } from "../Util/ecs"
import { Inventory, UnSkilledWork, DrawComp, IsTradeable} from "../Components/components"
import { checkAndCreateResources} from "../Util/util"
import { ResourceTable } from "../simulationCreator"
import { GATHER_AMOUNT, TAX_RATE } from "../constants"
import { drawOneWayTransaction, getCenterPoint, UpdateDrawText, drawTransaction} from "./drawSystems"
import { QolManager } from "../Util/qolManager"
import { SellerReturnType, DenyReason, ResourceType } from "../Util/type"
import { calculateResourceData } from "../Util/log"
import { saleEvent } from "../simulation"
import { setCurrentActivity } from "./utilSystems"


export async function Work(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(Inventory, UnSkilledWork, DrawComp)

    for(const entity of entities){
        const drawdata = ecs.getComponent(entity, DrawComp)
        const workdata = ecs.getComponent(entity, UnSkilledWork)
        const inventoryData = ecs.getComponent(entity, Inventory)

        checkAndCreateResources(inventoryData!.resources)

        for(const outputResource of workdata!.productionResources){
            await drawOneWayTransaction(getCenterPoint(), drawdata!.position, ResourceTable[outputResource], ecs)
            inventoryData!.resources[outputResource].amount += GATHER_AMOUNT;
            calculateResourceData(ecs)
            setCurrentActivity(`Worked ${ResourceTable[outputResource]} +${GATHER_AMOUNT}`, entity, ecs)
            UpdateDrawText(ecs)
        }
    }
}

export async function MakeTrades(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(Inventory, DrawComp, IsTradeable)

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
        for (const potentialSeller of ecs.getEntitiesWithComponents(IsTradeable, Inventory)) {
            if(potentialSeller == entity) continue

            setCurrentActivity(`Offer To ${potentialSeller} for ${ResourceTable[resource]} $${inventoryData!.resources[resource].buyPrice}`, entity, ecs)
            const buyOfferSucces = await isWillingToSellX(resource, inventoryData!.resources[resource].buyPrice, entity, potentialSeller, ecs)
                
            if(buyOfferSucces.denyReason != DenyReason.NotEnoughSupply) NoSupply = false
            if(buyOfferSucces.saleSucces){
                setCurrentActivity(`Bought ${ResourceTable[resource]} from ${potentialSeller} for $${inventoryData!.resources[resource].buyPrice}`, entity, ecs)
                UpdateDrawText(ecs)
                inventoryData!.resources[resource].buyPrice -= inventoryData!.resources[resource].buyPrice > 1 ? 1 : 0
                return true
            }
        }
            
        if(NoSupply == false){
            inventoryData!.resources[resource].buyPrice++
        }else break
    }
    setCurrentActivity(`Buy Failed for ${ResourceTable[resource]}`, entity, ecs)
    UpdateDrawText(ecs)
    return false
}

async function isWillingToSellX(resource: string, price: number, buyerID: number, sellerID: number, ecs: ECS): Promise<SellerReturnType>{
    const inventoryData = ecs.getComponent(sellerID, Inventory)

    checkAndCreateResources(inventoryData!.resources)

    if(QolManager.bestSellResourceForQol(inventoryData!.resources) != (resource)) return {saleSucces: false, denyReason: DenyReason.NotEnoughSupply}
        
    if(isOfferHighEnough(price, resource, inventoryData!.resources)) return {saleSucces: false, denyReason: DenyReason.OfferToLow}

    if(price <  inventoryData!.resources[resource].minSellPrice) return {saleSucces: false, denyReason: DenyReason.OfferToLow}

    const buyer = ecs.getComponent(buyerID, Inventory)
    const seller = ecs.getComponent(sellerID, Inventory)

    buyer!.money -= price
    seller!.resources[resource].amount--

    await UpdateDrawText(ecs)
        
    await drawTransaction(buyerID, sellerID, resource, ecs)

    const tax = (price * TAX_RATE)
    const profit = price - tax
    seller!.money += profit
    buyer!.resources[resource].amount++

    setCurrentActivity(`Sold ${ResourceTable[resource]} r$${price} p$${Math.round(profit*100)/100 } t$${Math.round(tax*100)/100}`, sellerID, ecs)
    await UpdateDrawText(ecs)

    await saleEvent.emit({buyerID: buyerID, sellerID: sellerID, amountSold: 1, price: price, resource: resource}, ecs)

    await UpdateDrawText(ecs)

    increaseSellPriceIfSoldOut(resource, seller!, sellerID, ecs)

    return {saleSucces: true, denyReason: DenyReason.None}
}

function isOfferHighEnough(offerPrice: number, resource: string, resources: ResourceType){
    if(offerPrice >=  resources[resource].sellPrice) return false
    return true
}
export function reducePricesIfNecasary(ecs: ECS){
    const entities = ecs.getEntitiesWithComponents(Inventory)
    for(const entity of entities){
        const invData = ecs.getComponent(entity, Inventory)
        const bestSellResource = QolManager.bestSellResourceForQol(invData!.resources)
        if(bestSellResource === "") continue
        if(invData!.resources[bestSellResource].sellPrice < 1) continue
        invData!.resources[bestSellResource].sellPrice--
        setCurrentActivity(`Reduced Price ${ResourceTable[bestSellResource]} to ${invData!.resources[bestSellResource].sellPrice}`, entity, ecs)
    }
}
function increaseSellPriceIfSoldOut(resource: string, seller: Inventory, sellerID: Entity, ecs:ECS){
    if(QolManager.bestSellResourceForQol(seller.resources) == resource) return 
    seller.resources[resource].sellPrice += 1
    setCurrentActivity(`Increase Price ${ResourceTable[resource]} to $${seller.resources[resource].sellPrice}`, sellerID, ecs)
}