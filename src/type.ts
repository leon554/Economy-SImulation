export interface Position{
    x: number
    y: number
}
export interface ResourceType{
    [key: string]: {amount: number, sellPrice: number, buyPrice: number, dayPriceLastUpdated: number}
}
export interface ResourceData{ amount: number; sellPrice: number; buyPrice: number } 
export interface Drawable{
    data: string
    position: Position
    icon: string
    profesion: string
}

export interface SellerReturnType{
    saleSucces: boolean
    denyReason: DenyReason
}
export enum DenyReason{
    NotEnoughSupply,
    OfferToLow,
    None
}
export interface SaleType{
    sellerID: number
    buyerID: number
    amountSold: number
    price: number
}