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

export class BaseWork{
    ProductionResources: string[]

    constructor(outputResources: string[]){
        this.ProductionResources = outputResources

    }
}
export class SkilledWork{

}
