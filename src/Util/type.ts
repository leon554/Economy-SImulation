import type { Bank } from "../Entities/bank";
import type { SpecialisedWorker } from "../Entities/specialisedWorke";
import type { unSkilledWorker } from "../Entities/unskilledWorker";

export interface Position{
    x: number
    y: number
}
export interface ResourceType{
    [key: string]: {amount: number, sellPrice: number, buyPrice: number, dayPriceLastUpdated: number}
}
export interface ResourceData{ amount: number; sellPrice: number; buyPrice: number } 
export interface Drawable{
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
    None
}
export interface SaleType{
    sellerID: number
    buyerID: number
    amountSold: number
    price: number
}
export enum EntityType {
    unSkilledWorker ="unSkilledWorker",
    specialisedWorker="specialisedWorker",
    bank="bank",
    baseWorker="baseWorker",
    institution="institution",
}
export interface entitiesInCategoriesType{
    unSkilledWorkers: unSkilledWorker[]
    specialisedWorkers: SpecialisedWorker[]
    banks: Bank[]
}
export const entitiesInCategoriesIntitial = {
    unSkilledWorkers: [],
    specialisedWorkers: [],
    banks: [],
}
