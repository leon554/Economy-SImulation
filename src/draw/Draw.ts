import { color } from "./Color";

export class Draw{
    width: number;
    height: number;
    ctx : CanvasRenderingContext2D;
    canvas: HTMLCanvasElement
    defaultColor: color = new color(255,255,255)
    backgroundColor: color = new color(0,0,0)
    textRotation: number = 0;
  
    constructor(canvas: HTMLCanvasElement, width: number = 500, height: number = 500){
      this.width = width
      this.height = height
      this.ctx = canvas.getContext("2d")!
      this.canvas = canvas
      canvas.width = this.width
      canvas.height = this.height
    }
    setCanvasDimesions(){
      this.canvas.width = this.width
      this.canvas.height = this.height
    }
    Clear(){
      this.ctx.clearRect(0,0,this.width,this.height)
    }
    setDefaultColor(c: color){
      this.defaultColor = new color(c.r, c.g, c.b)
    }
    setBackgroundColor(c: color){
      this.backgroundColor = c;
    }
    fill(color: color = this.backgroundColor){
      this.ctx.fillStyle = color.getColor()
      this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
    }
    line(sx: number, sy: number, ex: number, ey: number, color: color = this.defaultColor, lineWidth: number = 1){
      this.ctx.strokeStyle = color.getColor()
      this.ctx.beginPath()
      this.ctx.moveTo(sx, sy);
      this.ctx.lineTo(ex, ey);
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke();
      this.ctx.strokeStyle = this.defaultColor.getColor()
    }
    circle(x: number, y:number, r:number, fill: boolean = true, color: color = this.defaultColor, lineWidth: number = 1){
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, 2 * Math.PI);
      this.ctx.strokeStyle = color.getColor()
      if(fill){
        this.ctx.fillStyle = color.getColor()
        this.ctx.fill()
      }
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke();
    }
    rect(x: number, y: number, width: number, height: number, fill: boolean = true, color: color = this.defaultColor, borderWidth: number =  1){
      if(fill){
        this.ctx.fillStyle = color.getColor()
        this.ctx.fillRect(x, y, width, height)
        return
      }
      this.ctx.strokeStyle = color.getColor()
      this.ctx.lineWidth = borderWidth
      this.ctx.strokeRect(x, y, width, height)
    }
    text(text: string, fontSize: number, x: number, y: number, HorAllign: HorizontalAllign = HorizontalAllign.centre, VertAllign: VerticleAllign = VerticleAllign.middle,color: color = this.defaultColor){
      this.ctx.font = `${fontSize}px sans-serif`
      this.ctx.fillStyle = color.getColor()
      this.ctx.textBaseline = VertAllign
      this.ctx.textAlign = HorAllign
      this.ctx.fillText(text, x, y)
    }
    ninetyDegText(text: string, fontSize: number, x: number, y: number, HorAllign: HorizontalAllign = HorizontalAllign.centre, VertAllign: VerticleAllign = VerticleAllign.alphabetic,color: color = this.defaultColor){
      this.ctx.translate(x, y)
      this.ctx.rotate((-90 * Math.PI)/180);
      this.text(text, fontSize, 0,0, HorAllign, VertAllign, color)
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }  
}

export enum HorizontalAllign{
    centre = "center",
    start = "start",
    end = "end"
}

export enum VerticleAllign{
    top = "top",
    middle = "middle",
    bottom = "bottom",
    alphabetic = "alphabetic"
}