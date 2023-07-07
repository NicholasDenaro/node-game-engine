export class Rectangle {
  constructor(public x: number, public y: number, public width: number, public height: number) {
  }

  intersects(other: Rectangle): boolean {
    return !(
      this.x > other.x + other.width
      || this.x + this.width < other.x
      || this.y > other.y + other.height
      || this.y + this.height < other.y
    );
  }

  /**
   * Direction in radians
   * @param other 
   */
  direction(other: Rectangle): number {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    const cxo = other.x + other.width / 2;
    const cyo = other.y + other.height /2;

    return Math.atan2(cyo - cy, cxo - cx);
  }
}