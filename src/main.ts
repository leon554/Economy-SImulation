import './style.css'
import { Draw} from "./draw/Draw";
import { color } from "./draw/Color";
import { ecs, Loop, onLoad } from './simulation';
import { setGAMESPEED } from './constants';
import { drawEntities, setEntitiesPos } from './Systems/drawSystems';
import { setConfig } from './constants';

export const canvas = document.getElementById("canvas") as HTMLCanvasElement
export let d = new Draw(canvas,Math.min(window.innerWidth *0.95, 1000), window.innerHeight * 0.8)
d.fill(new color(0,0,0))

const DELAY_BETWEEN_LOOP_ITERATIONS = 100
export let isPaused = true;

await onLoad()
async function startInterval() {
  const runTask = async () => {
    await Loop();
    setTimeout(runTask, DELAY_BETWEEN_LOOP_ITERATIONS);
  };
  await runTask();
}



startInterval();

const rangeslider = document.getElementById("gamespeed") as HTMLInputElement
rangeslider.oninput = e => {
  const trarget = e.target as HTMLInputElement
  setGAMESPEED(Number(trarget.value))
}

const pausebtn = document.getElementsByClassName("pausebtn")[0] as HTMLButtonElement

pausebtn.onclick = e => {
  isPaused = !isPaused
  const target = e.target as HTMLButtonElement
  target.innerHTML = (isPaused) ? "Play" : "Pause"
  if(isPaused) alert("Note simulation will pause after day is finished")
}

window.addEventListener('resize', () => {
  setEntitiesPos(ecs)
  d.width = Math.min(window.innerWidth *0.95, 1000)
  d.height = window.innerHeight * 0.8
  d.setCanvasDimesions()
  drawEntities(ecs)
});

function setupSlider(id: string, configKey: string, displayId: string, parseFn: (val: string) => any) {
  const input = document.getElementById(id) as HTMLInputElement;
  const display = document.getElementById(displayId) as HTMLElement;

  input.addEventListener('input', () => {
    const value = parseFn(input.value);
    setConfig(configKey, value);
    if(id === "taxSlider" || id === "profitMarginSlider"){
      display.textContent = (Math.round(value*100*100)/100).toString() + "%";
    }else{
      display.textContent = value.toString();
    }
  });

  if(id === "taxSlider" || id === "profitMarginSlider"){
    display.textContent = (Math.round(parseFn(input.value)*100*100)/100).toString() + "%";
  }else{
    display.textContent = parseFn(input.value).toString();
  }
}

function setupCheckbox(id: string, configKey: string) {
  const checkbox = document.getElementById(id) as HTMLInputElement;
  checkbox.addEventListener('change', () => {
    setConfig(configKey, checkbox.checked);
  });
}


setupSlider('gatherSlider', 'GATHER_AMOUNT', 'gatherVal', parseInt);
setupSlider('minVitalSlider', 'MIN_VITAL_RESOURCE_AMT', 'minVitalVal', parseInt);
setupSlider('taxSlider', 'TAX_RATE', 'taxVal', parseFloat);
setupSlider('welfareMultiplierSlider', 'WELLFARE_MULTIPLIER', 'welfareMultiplierVal', parseFloat);
setupSlider('profitMarginSlider', 'SPECIALISED_PROFIT_MARGIN', 'profitMarginVal', parseFloat);

setupCheckbox('welfareCheckbox', 'PAY_WELFARE_TO_LOWEST_QOL');
setupCheckbox('minimalDataCheckbox', 'SHOW_MINIMAL_ENTITY_DATA');