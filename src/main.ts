import './style.css'
import { Draw} from "./draw/Draw";
import { color } from "./draw/Color";
import { Loop } from './simulation';

const canvas = document.getElementById("canvas") as HTMLCanvasElement
export let d = new Draw(canvas, window.innerWidth *0.95, window.innerHeight * 0.95)
d.fill(new color(0,0,0))

const DELAY_BETWEEN_LOOP_ITERATIONS = 100
function startInterval() {
  const runTask = async () => {
    await Loop() 
    setTimeout(runTask, DELAY_BETWEEN_LOOP_ITERATIONS); 
  };
  runTask(); 
}
startInterval();