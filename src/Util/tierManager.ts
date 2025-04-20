
interface ResourceRecipeType{
    outputResources: string[]
    inputResources: string[]
}
export class TierManager {

    static recipes : ResourceRecipeType[] = []
    static resourceTiers: {[key: string]: number} = {}

    static calculateTiers(){
        let tempRecipes = [...this.recipes]
        const tempResourceTiers: {[key: string]: number} = {}
        
        tempRecipes = [...this.GetTierOneResources(tempResourceTiers, tempRecipes)]
        
        while(tempRecipes.length > 0){
            const validGradingResource = tempRecipes.filter((r) => {
                const inputResourcePresenceArr = r.inputResources.map(inputResource => {
                    if(tempResourceTiers[inputResource] != null){
                        return true
                    }
                    else return false
                })
                return (inputResourcePresenceArr.includes(false)) ? false : true
            })
            this.calculateTiersOfValidResource(tempResourceTiers, tempRecipes)
            tempRecipes = tempRecipes.filter(r => !validGradingResource.includes(r))
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
    static addRecipe(outputResources: string[], inputResources: string[]) {
        for(const recipe of this.recipes){
            if(this.arraysContainSameValues(recipe.inputResources, inputResources) &&
               this.arraysContainSameValues(recipe.outputResources, outputResources)){
                return
            }
        }
        this.recipes.push({ outputResources, inputResources })
    }
    private static arraysContainSameValues(a: string[], b: string[]): boolean {
        return a.length === b.length &&
               [...a].sort().every((val, i) => val === [...b].sort()[i]);
      }
}