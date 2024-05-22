import { Position } from '../models.ts';

class Point implements Position {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static of(x: number, y: number) {
    return new Point(x, y);
  }

  static from({ x, y }: { x: number; y: number }) {
    return Point.of(x, y);
  }

  add(point: Position) {
    return Point.of(this.x + point.x, this.y + point.y);
  }

  multiply(multiplier: number) {
    return Point.of(this.x * multiplier, this.y * multiplier);
  }

  subtract(point: Position) {
    return Point.of(this.x - point.x, this.y - point.y);
  }

  divide(multiplier: number) {
    return Point.of(this.x / multiplier, this.y / multiplier);
  }

  get [Symbol.toStringTag]() {
    return `Point(${this.x}, ${this.y})`;
  }

  value() {
    return { x: this.x, y: this.y };
  }
}

export default Point;
