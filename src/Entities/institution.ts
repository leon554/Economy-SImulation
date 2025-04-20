import {updateUIEvent } from "../simulation";
import { Position, Drawable, EntityType} from "../Util/type";
import {  getID, } from "../Util/util";
import { baseWorker } from "./baseWorker";

export abstract class Institution implements Drawable {
    type = EntityType.institution
    id: number;
    money: number;
    position: Position = { x: 0, y: 0 };
    drawData: string;
    profesion: string;
    currentActivity: string = "idle"

    constructor(startingMoney: number, profesion: string) {
        this.money = startingMoney;
        this.id = getID();
        this.drawData = ""
        this.profesion = profesion
        this.updateDrawData();
        updateUIEvent.subscribe(() => this.updateDrawData())
    }
    private updateDrawData() {
        this.drawData = `$${Math.round(this.money)}^${this.currentActivity}`;
    }
    abstract work(entities: baseWorker[]): Promise<void>;
}
