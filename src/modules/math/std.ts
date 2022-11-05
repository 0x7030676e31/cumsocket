import Decimal from "decimal.js";

class Std {
  public readonly functions: { [key: string]: [number, number, (...args: Decimal[]) => Decimal] } = {

  };

  public readonly constants: { [key: string]: Decimal } = {

  };

  public get one(): Decimal {
    return new Decimal(1);
  }

  public get half(): Decimal {
    return new Decimal(0.5);
  }
}

export default new Std();
