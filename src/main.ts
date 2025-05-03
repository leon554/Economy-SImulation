import './style.css'
import { Draw} from "./draw/Draw";
import { color } from "./draw/Color";
import { Loop, onLoad } from './simulation';
import { setGAMESPEED } from './constants';

export const canvas = document.getElementById("canvas") as HTMLCanvasElement
export let d = new Draw(canvas, window.innerWidth *0.95, window.innerHeight * 0.95)
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