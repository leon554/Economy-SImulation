

export let GAME_SPEED = 1
export function setGAMESPEED(speed: number){
    GAME_SPEED = speed
}

export let GATHER_AMOUNT = 5;
export let MIN_VITAL_RESOURCE_AMT = 1;
export let TAX_RATE = 0.2;
export let WELLFARE_MULTIPLIER = 3;
export let PAY_WELFARE_TO_LOWEST_QOL = false;
export let SPECIALISED_PROFIT_MARGIN = 0.8;
export let SHOW_MINIMAL_ENTITY_DATA = false;


export function setConfig(key: string, value: any) {
  if (key in configSetters) configSetters[key](value);
}

const configSetters: {[key: string]: any} = {
  GATHER_AMOUNT: (val: number) => (GATHER_AMOUNT = val),
  MIN_VITAL_RESOURCE_AMT: (val: number) => (MIN_VITAL_RESOURCE_AMT = val),
  TAX_RATE: (val: number) => (TAX_RATE = val),
  WELLFARE_MULTIPLIER: (val: number) => (WELLFARE_MULTIPLIER = val),
  PAY_WELFARE_TO_LOWEST_QOL: (val: boolean) => (PAY_WELFARE_TO_LOWEST_QOL = val),
  SPECIALISED_PROFIT_MARGIN: (val: number) => (SPECIALISED_PROFIT_MARGIN = val),
  SHOW_MINIMAL_ENTITY_DATA: (val: boolean) => (SHOW_MINIMAL_ENTITY_DATA = val),
};