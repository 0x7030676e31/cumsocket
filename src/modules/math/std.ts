import Decimal from "decimal.js";

Decimal.set({ precision: +process.env.math_precision! });

class Std {
  private static readonly one = new Decimal(1);
  private static readonly half = new Decimal(0.5);
  
  private static readonly functions: { [key: string]: [number, number, (...args: Decimal[]) => Decimal] } = {
    rad: [1, 1, (num) => num.mul(Decimal.acos(-1)).div(180)],
    deg: [1, 1, (num) => num.mul(180).div(Decimal.acos(-1))],
    floor: [1, 1, (num) => num.floor()],
    ceil: [1, 1, (num) => num.ceil()],
    round: [1, 2, (num, num2) => num2 ? new Decimal(num.toFixed((num2.lessThan(0) || num2.greaterThan("1e+9") ? 0 : num2.floor().toNumber()), Decimal.ROUND_DOWN)) : num.round()],
    sqrt: [1, 1, (num) => num.sqrt()],
    cbrt: [1, 1, (num) => num.cbrt()],
    ln: [1, 1, (num) => num.ln()],
    log: [1, 2, (num, num2?: Decimal) => num2 ? num2.log(num) : num.log()],
    exp: [1, 1, (num: Decimal) => num.exp()],
    min: [1, Infinity, (...nums) => Decimal.min(...nums)],
    max: [1, Infinity, (...nums) => Decimal.max(...nums)],
    abs: [1, 1, (num) => num.abs()],
    trunc: [1, 1, (num) => num.trunc()],
    rand: [0, 1, (num?) => Decimal.random(num ? (num.lessThan(0) || num.greaterThan("1e+9") ? undefined : num.floor().toNumber()) : undefined)],
    sin: [1, 1, (num) => num.sin()],
    cos: [1, 1, (num) => num.cos()],
    tan: [1, 1, (num) => num.tan()],
    csc: [1, 1, (num) => Std.one.div(num.sin())],
    sec: [1, 1, (num) => Std.one.div(num.cos())],
    cot: [1, 1, (num) => Std.one.div(num.tan())],
    asin: [1, 1, (num) => num.asin()],
    acos: [1, 1, (num) => num.acos()],
    atan: [1, 1, (num) => num.atan()],
    acsc: [1, 1, (num) => Std.one.div(num).asin()],
    asec: [1, 1, (num) => Std.one.div(num).acos()],
    acot: [1, 1, (num) => num.div(num.pow(2).add(1).sqrt()).acos()],
    sinh: [1, 1, (num) => num.sinh()],
    cosh: [1, 1, (num) => num.cosh()],
    tanh: [1, 1, (num) => num.tanh()],
    csch: [1, 1, (num) => Std.one.div(num.sinh())],
    sech: [1, 1, (num) => Std.one.div(num.cosh())],
    coth: [1, 1, (num) => num.sinh().div(num.cosh())],
    asinh: [1, 1, (num) => num.asinh()],
    acosh: [1, 1, (num) => num.acosh()],
    atanh: [1, 1, (num) => num.atanh()],
    acsch: [1, 1, (num) => Std.one.div(num).add(Std.one.div(num.pow(2)).add(1).sqrt()).ln()],
    asech: [1, 1, (num) => Std.one.div(num).add(Std.one.div(num.pow(2)).sub(1).sqrt()).ln()],
    acoth: [1, 1, (num) => Std.half.mul(num.add(1).div(num.sub(1)).ln())],
    hypot: [2, 2, (num, num2) => Decimal.hypot(num, num2)],
    // gamma: [1, 1, (num) => ],
  };

  // only for functions
  private static readonly alternatives: { [key: string]: string[] } = {
    rad: ["radian", "radians"],
    deg: ["degree", "degrees"],
    round: ["rnd", "rounded"],
    sqrt: ["squareroot"],
    cbrt: ["cuberoot"],
    ln: ["naturallog"],
    log: ["logarithm"],
    exp: ["exponent"],
    min: ["minimum"],
    max: ["maximum"],
    abs: ["absolute"],
    trunc: ["truncate", "truncated"],
    rand: ["random"],
    sin: ["sine"],
    cos: ["cosine"],
    tan: ["tangent"],
    asin: ["arcsin", "arcsine", "asine"],
    acos: ["arccos", "arccosine", "acosine"],
    atan: ["arctan", "arctangent", "atangent"],
    csc: ["cosecant"],
    sec: ["secant"],
    cot: ["cotangent"],
    acsc: ["arccsc", "arccosecant", "acosecant"],
    asec: ["arcsec", "arcsecant", "asecant"],
    acot: ["arccot", "arccotangent", "acotangent"],
    sinh: ["sineh", "sinehyperbolic", "sinehyperbola"],
    cosh: ["cosineh", "cosinehyperbolic", "cosinehyperbola"],
    tanh: ["tangenth", "tangenthyperbolic", "tangenthyperbola"],
    asinh: ["arcsinh", "arcsineh", "asineh", "asinehyperbolic", "asinehyperbola"],
    acosh: ["arccosh", "arccosineh", "acosineh", "acosinehyperbolic", "acosinehyperbola"],
    atanh: ["arctanh", "arctangenth", "atangenth", "atangenthyperbolic", "atangenthyperbola"],
    csch: ["cosecanth", "cosecanthyperbolic", "cosecanthyperbola"],
    sech: ["secanth", "secanthyperbolic", "secanthyperbola"],
    coth: ["cotangenth", "cotangenthyperbolic", "cotangenthyperbola"],
    acsch: ["arccsch", "arccosecanth", "acosecanth", "acosecanthyperbolic", "acosecanthyperbola"],
    aseh: ["arcsech", "arcsecanth", "asecanth", "asecanthyperbolic", "asecanthyperbola"],
    acoth: ["arccoth", "arccotangenth", "acotangenth"],
    hypot: ["hypotenuse"],
  }

  public static readonly constants: { [key: string]: Decimal } = {
    pi: Decimal.acos(-1),
    tau: Decimal.acos(-1).mul(2),
    e: Decimal.exp(1),
    phi: Std.half.add(new Decimal(5).sqrt().div(2)),
  };

  public readonly modifiers: { [key: string]: (value: Decimal) => Decimal } = {
    "°": (x: Decimal) => x.mul(180).div(Std.constants.pi),
    // I will add factorials later (and maybe some other modifiers)
  };

  public isFunction(func: string): boolean {
    return Boolean(this.getFunction(func));
  }

  public isConstant(constant: string): boolean {
    return Boolean(Std.constants[constant]);
  }

  public getFunction(func: string): [number, number, (...args: Decimal[]) => Decimal] {
    return Std.functions[Object.entries(Std.alternatives).find(([_, values]) => values.includes(func))?.[0] ?? func];
  }

  public getConstant(constant: string): Decimal {
    return Std.constants[constant];
  }
}

export default new Std();
