import { ResourceType } from "./type"
import { resourceAmountData } from "./log"

export class QolManager{

    public static calculateQOL(resources: ResourceType){
        let qol = 0
        Object.entries(resources).forEach(r => {
            qol += Math.log(r[1].amount + 1)
        })
        return qol
    }
    public static bestBuyResourcesForQol(resources: ResourceType){
        
        let maxQolIncrease = 0
        let maxQolResources: string[] = []

        Object.entries(resources).forEach(resource => {

            const qolBefore = QolManager.calculateQOL(resources)
            resources[resource[0]].amount++

            const qolAfter = QolManager.calculateQOL(resources)
            resources[resource[0]].amount--

            const qolIncrease = qolAfter - qolBefore

            if(qolIncrease > maxQolIncrease && resourceAmountData[resource[0]] != 0){
                maxQolIncrease = qolIncrease
                maxQolResources = [resource[0]]
            }
            else if(maxQolIncrease == qolIncrease && resourceAmountData[resource[0]] != 0){
                maxQolResources.push(resource[0])
            }
        })
        return maxQolResources
    }
    public static bestSellResourceForQol(resources: ResourceType){
        let minQolDecrease = -Infinity
        let minQolResource: string = ""

        const resourcesData = Object.entries(resources)

        for(const resource of resourcesData){
            if(resource[1].amount <= 1) continue

            const qolBefore = QolManager.calculateQOL(resources)
            resources[resource[0]].amount--

            const qolAfter = QolManager.calculateQOL(resources)
            resources[resource[0]].amount++

            const qolDecrease = qolAfter - qolBefore

            if(minQolDecrease > qolDecrease) continue

            minQolDecrease = qolDecrease
            minQolResource = resource[0]
        }
                
        if(QolManager.checkAllNonZeroResourcesEqual(resources)) return ""
        if(!QolManager.checkOnlyOneHighestResource(resources)) return ""
        return minQolResource
    }
    private static checkAllNonZeroResourcesEqual(resources: ResourceType){
        let resourceData = Object.values(resources)
 
        if (resourceData.length === 0) return true;
        resourceData = resourceData.filter(rd => rd.amount > 0)
        if(resourceData.length === 0) return true

        const checkAmount = resourceData[0].amount
        return resourceData.every(r => r.amount === checkAmount)
    }
    private static checkOnlyOneHighestResource(resources: ResourceType){
        //checks if theres one maximum e.g 20, 3, 15 true, 20, 20, 13 false
        const maxResourceAmt = Math.max(...Object.values(resources).map(r => r.amount))
        const amtOfResourcesAtMax = Object.values(resources).filter(r => r.amount == maxResourceAmt)
        return (amtOfResourcesAtMax.length > 1) ? false : true 
    }
}