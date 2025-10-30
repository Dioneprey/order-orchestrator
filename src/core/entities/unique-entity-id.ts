import { v7 as uuidv7 } from 'uuid';

export class UniqueEntityID {
  private value: string;

  toString() {
    return this.value;
  }

  constructor(value?: string) {
    this.value = value ?? uuidv7();
  }
}
