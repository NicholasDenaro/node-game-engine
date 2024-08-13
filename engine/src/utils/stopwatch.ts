export class Stopwatch {
  private startTime: number = 0;
  private endTime: number = 0;
  private elapsedTime: number = 0;
  private running: number = 0;
  constructor() {

  }

  start(): void {
    this.running = 1;
    this.elapsedTime = 0;
    this.startTime = performance.now();
  }

  stop(): void {
    this.running = 0;
    this.endTime = performance.now();
    this.elapsedTime = this.endTime - this.startTime;
  }

  resume(): void {
    this.running = 1;
    this.startTime = performance.now();
  }

  time(): number {
    return this.elapsedTime + this.running * (performance.now() - this.startTime);
  }
}