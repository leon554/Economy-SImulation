import { Position } from "../Util/type";
import { ResourceType } from "../Util/type";

export class drawComp{
    position: Position = {x: 0, y: 0}
    profesion: string
    drawText: string = ""

    constructor( profesion: string){
        this.profesion = profesion
    }

    setDrawText(drawText: string){
        this.drawText = drawText
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
export class isTradeable{}
export class Bank {}
export class wellfareRecievable {}

export class unskilledWork{
    ProductionResources: string[]

    constructor(outputResources: string[]){
        this.ProductionResources = outputResources

    }
}
export class skilledWork{
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
