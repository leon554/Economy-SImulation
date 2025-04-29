import { ResourceTable } from "./util"

interface ResourceRecipeType{
    outputResources: string[]
    inputResources: string[]
}
export class TierManager {

    static recipes : ResourceRecipeType[] = []
    static resourceTiers: {[key: string]: number} = {}


    static addRecipe(outputResources: string[], inputResources: string[]) {
        for(const recipe of this.recipes){
            if(this.arraysContainSameValues(recipe.inputResources, inputResources) &&
               this.arraysContainSameValues(recipe.outputResources, outputResources)){
                return
            }
        }
        this.recipes.push({ outputResources, inputResources })
    }
    static getTierString(){
        let outputString = "Tiers: "
        Object.entries(this.resourceTiers).forEach(resourceTier => {
            outputString += `${ResourceTable[resourceTier[0]]} T${resourceTier[1]} `
        })
        return outputString
    }
    static calculateTiers(){
        let tempRecipes = [...this.recipes]
        const tempResourceTiers: {[key: string]: number} = {}
        
        tempRecipes = [...this.GetTierOneResources(tempResourceTiers, tempRecipes)]
        
        let previousLength = -1;
        while (tempRecipes.length > 0) {
            if (tempRecipes.length === previousLength) {
                throw new Error("Stuck in tier calculation. Unresolved recipes:" + tempRecipes)
            }
            previousLength = tempRecipes.length;

            const validGradingResource = tempRecipes.filter((r) => {
                return r.inputResources.every(input => tempResourceTiers[input] != null);
            });

            this.calculateTiersOfValidResource(tempResourceTiers, validGradingResource);
            tempRecipes = tempRecipes.filter(r => !validGradingResource.includes(r));
        }
        this.resourceTiers = tempResourceTiers

    }
    private static calculateTiersOfValidResource(resourceTiers: {[key: string]: number}, resourceRecipes: ResourceRecipeType[]){
        resourceRecipes.forEach(r => {
            if(r.inputResources.length == 1){    
                r.outputResources.forEach(outputResource => {
                    resourceTiers[outputResource] = resourceTiers[r.inputResources[0]] + 1  
                })
            }else{
                let tierSum = 0
                r.inputResources.forEach(i => tierSum += resourceTiers[i])
                r.outputResources.forEach(outputResource => {
                    resourceTiers[outputResource] = tierSum
                })
            }
        })
    }
    private static GetTierOneResources(resourceTiers: {[key: string]: number}, resourceRecipes: ResourceRecipeType[]){
        return resourceRecipes.filter(recipe => {
            if(recipe.inputResources.length == 0){
                recipe.outputResources.forEach(outputResource => {
                    resourceTiers[outputResource] = 1
                })
                return false
            }
            return true
        })
    }
    private static arraysContainSameValues(a: string[], b: string[]): boolean {
        return a.length === b.length &&
               [...a].sort().every((val, i) => val === [...b].sort()[i]);
    }
    
}