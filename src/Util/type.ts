

export interface Position{
    x: number
    y: number
}
export interface ResourceType{
    [key: string]: {amount: number, sellPrice: number, buyPrice: number, dayPriceLastUpdated: number, tier: number, minSellPrice: number}
}
export interface ResourceData{ amount: number; sellPrice: number; buyPrice: number } 
export interface Drawable{
    id: number
    drawData: string
    position: Position
    profesion: string
}
export interface SellerReturnType{
    saleSucces: boolean
    denyReason: DenyReason
}
export enum DenyReason{
    NotEnoughSupply,
    OfferToLow,
    None,
    Qol ="qol",
}
export interface SaleType{
    sellerID: number
    buyerID: number
    amountSold: number
    price: number
    resource: string
}
export enum SimulationStep{
    Working = "Working",
    Trading = "Trading",
    Consuming = "Consuming",
    Idle ="Idle"
}
export const entitiesInCategoriesIntitial = {
    unSkilledWorkers: [],
    specialisedWorkers: [],
    banks: [],
}
