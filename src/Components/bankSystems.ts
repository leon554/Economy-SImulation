import { ECS, Entity } from "../ecs"
import { SaleType } from "../Util/type"
import { Bank, drawComp, Inventory } from "./components"
import { drawOneWayTransaction, UpdateDrawText } from "./drawSystems"
import { TAX_RATE } from "../constants"
import { MIN_VITAL_RESOURCE_AMT, PAY_WELFARE_TO_LOWEST_QOL, WELLFARE_MULTIPLIER} from "../constants"
import { QolManager } from "../Entities/qolManager"
import { resourcePrices } from "../Util/log"




export async function handleSaleTax(saleData: SaleType, ecs: ECS) {
    console.log("sdsd")
    const sellerPos = ecs.getComponent(saleData.sellerID, drawComp)
    const banks = ecs.getEntitiesWithComponents(Bank)
    const bankPos = ecs.getComponent(banks[0], drawComp)

    if(sellerPos == undefined || bankPos == undefined) return

    await drawOneWayTransaction(sellerPos.position, bankPos.position, "💰", ecs)

    const bankInventory = ecs.getComponent(banks[0], Inventory)
    if(bankInventory == undefined)throw new Error("Bank should have invetory componenet");
    

    bankInventory.money += (saleData.price * TAX_RATE)
    UpdateDrawText(ecs)
}  


async function work(ecs: ECS) {
    let smallestQolEntity: Entity = 0

    const entities = ecs.getEntitiesWithComponents(drawComp, Inventory)
    for(const e of entities){
        const invetory = ecs.getComponent(e, Inventory)

        const meatAmt = invetory!.resources["meat"].amount
        const waterAmt = invetory!.resources["water"].amount
        const minResourceAmt = (MIN_VITAL_RESOURCE_AMT - 2 > 0) ? MIN_VITAL_RESOURCE_AMT - 2 : MIN_VITAL_RESOURCE_AMT

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
    const bankEntity = ecs.getEntitiesWithComponents(Bank)[0]
    const bankPos = ecs.getComponent(bankEntity, drawComp)
    const bankInv = ecs.getComponent(bankEntity, Inventory)
    const recipiantPos = ecs.getComponent(recipiantID, drawComp)
    const recipiantInv = ecs.getComponent(recipiantID, Inventory)


    if(bankInv!.money < wellFareAmt * WELLFARE_MULTIPLIER) return
    bankInv!.money -= wellFareAmt * WELLFARE_MULTIPLIER

    UpdateDrawText(ecs)
    await drawOneWayTransaction(bankPos!.position, recipiantPos!.position, "💰", ecs)

    recipiantInv!.money += wellFareAmt * WELLFARE_MULTIPLIER

    UpdateDrawText(ecs)
}
function calcWelfareAmtForResource(resource: string){
    return (resourcePrices[resource] != null) ? resourcePrices[resource].avgSellPrice : 10
}