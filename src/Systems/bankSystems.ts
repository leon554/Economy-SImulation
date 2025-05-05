import { ECS, Entity } from "../Util/ecs"
import { SaleType } from "../Util/type"
import { Bank, DrawComp, Inventory, WellfareRecievable } from "../Components/components"
import { drawOneWayTransaction, UpdateDrawText } from "./drawSystems"
import { TAX_RATE } from "../constants"
import { MIN_VITAL_RESOURCE_AMT, PAY_WELFARE_TO_LOWEST_QOL, WELLFARE_MULTIPLIER} from "../constants"
import { QolManager } from "../Util/qolManager"
import { resourceAvgPriceData } from "../Util/log"
import { checkAndCreateResources } from "../Util/util"
import { setCurrentActivity } from "./utilSystems"


export async function handleSaleTax(saleData: SaleType, ecs: ECS) {
    const sellerPos = ecs.getComponent(saleData.sellerID, DrawComp)
    const banks = ecs.getEntitiesWithComponents(Bank)

    for(const bank of banks){
        const bankPos = ecs.getComponent(bank, DrawComp)
        const bankInventory = ecs.getComponent(bank, Inventory)

        if(sellerPos == undefined || bankPos == undefined) return

        await drawOneWayTransaction(sellerPos.position, bankPos.position, "💰", ecs)
        if(bankInventory == undefined)throw new Error("Bank should have invetory componenet");
    

        bankInventory.money += (saleData.price * TAX_RATE)/banks.length
        setCurrentActivity(`Rec $${(Math.round((saleData.price * TAX_RATE/banks.length)*100)/100)} f${saleData.sellerID} ST: $${saleData.price}`, bank, ecs)
        UpdateDrawText(ecs)
    }
}  

export async function handleWelfarePayments(ecs: ECS) {
    let smallestQolEntity: Entity = 0

    const entities = ecs.getEntitiesWithComponents(DrawComp, Inventory, WellfareRecievable)
    for(const e of entities){
        const invetory = ecs.getComponent(e, Inventory)
        checkAndCreateResources(invetory!.resources)

        const meatAmt = invetory!.resources["meat"].amount
        const waterAmt = invetory!.resources["water"].amount
        const minResourceAmt = MIN_VITAL_RESOURCE_AMT

        if(meatAmt < minResourceAmt){
            await payWelfare(calcWelfareAmtForResource("meat"), e, ecs)
        }
        if(waterAmt < minResourceAmt){
            await payWelfare(calcWelfareAmtForResource("water"), e, ecs)
        }

        if(!PAY_WELFARE_TO_LOWEST_QOL) continue
        const smallestQol = QolManager.calculateQOL(ecs.getComponent(smallestQolEntity, Inventory)!.resources)
        smallestQolEntity = (QolManager.calculateQOL(invetory!.resources) < smallestQol) ? e : smallestQolEntity
    }

    if(!PAY_WELFARE_TO_LOWEST_QOL) return
    if(ecs.getComponent(smallestQolEntity, Inventory)!.money > 1000) return
    await payWelfare(20, smallestQolEntity, ecs)

}
async function payWelfare(wellFareAmt: number, recipiantID: Entity, ecs: ECS){
    const bankEntities = ecs.getEntitiesWithComponents(Bank)

    for(const bankEntity of bankEntities){
        const bankPos = ecs.getComponent(bankEntity, DrawComp)
        const bankInv = ecs.getComponent(bankEntity, Inventory)
        const recipiantPos = ecs.getComponent(recipiantID, DrawComp)
        const recipiantInv = ecs.getComponent(recipiantID, Inventory)
    
    
        if(bankInv!.money < wellFareAmt * WELLFARE_MULTIPLIER) return
        bankInv!.money -= wellFareAmt * WELLFARE_MULTIPLIER
        setCurrentActivity(`Paying ${recipiantID} $${Math.round(wellFareAmt * WELLFARE_MULTIPLIER*100)/100}`, bankEntity, ecs)
    
        UpdateDrawText(ecs)
        await drawOneWayTransaction(bankPos!.position, recipiantPos!.position, "💰", ecs)
    
        recipiantInv!.money += wellFareAmt * WELLFARE_MULTIPLIER
        setCurrentActivity(`Paid ${recipiantID} $${Math.round(wellFareAmt * WELLFARE_MULTIPLIER*100)/100}`, bankEntity, ecs)
    
        UpdateDrawText(ecs)
    }
}
function calcWelfareAmtForResource(resource: string){
    return (resourceAvgPriceData[resource] != null) ? resourceAvgPriceData[resource].avgSellPrice : 10
}