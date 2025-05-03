import { Position } from "../Util/type";
import { ResourceType } from "../Util/type";

export class DrawComp{
    position: Position = {x: 0, y: 0}
    profesion: string
    drawText: string = ""

    constructor( profesion: string){
        this.profesion = profesion
    }
}
export class Inventory{
    resources: ResourceType;
    money: number

    constructor(resources: ResourceType, money: number){
        this.resources = resources
        this.money = money
    }
}
export class UnSkilledWork{
    productionResources: string[]

    constructor(outputResources: string[]){
        this.productionResources = outputResources
    }
}
export class SkilledWork{
    inputResources: string[]
    outputResources: string[]
    totalBought: number = 0
    totalBoughtPrice: number = 0
    avgBuyPrice: number = 0
    profit: number = 0

    constructor(inputResources: string[], outputResources: string[]){
        this.inputResources = inputResources
        this.outputResources = outputResources
    }
}
export class ActivityTracker{
    currentActivity: string =""
    constructor(){}
}
export class IsTradeable{}
export class Bank {}
export class WellfareRecievable {}


