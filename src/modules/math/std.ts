import { Decimal } from "decimal.js";

Decimal.set({ precision: +process.env.math_precision! });

class Std {
  private static readonly one = new Decimal(1);
  private static readonly half = new Decimal(0.5);
  
  // [ Regex, Min Args, Max Args, Function ]
  private static readonly functions: [RegExp, number, number, (...args: Decimal[]) => Decimal][] = [
    [/^rad(ians?)?$/, 1, 1, (num) => num.mul(Decimal.acos(-1)).div(180)],
    [/^deg(rees?)?$/, 1, 1, (num) => num.mul(180).div(Decimal.acos(-1))],
    [/^floor$/, 1, 1, (num) => num.floor()],
    [/^ceil$/, 1, 1, (num) => num.ceil()],
    [/^round(ed)?$/, 1, 2, (num, num2) => num2 ? new Decimal(num.toFixed((num2.lessThan(0) || num2.greaterThan("1e+9") ? 0 : num2.floor().toNumber()), Decimal.ROUND_DOWN)) : num.round()],
    [/^(sqrt|squareroot)$/, 1, 1, (num) => num.sqrt()],
    [/^(cbrt|cuberoot)$/, 1, 1, (num) => num.cbrt()],
    [/^(rt|root)$/, 1, 2, (num, num2) => num2 ? num.pow(this.one.div(num2)) : num.sqrt()],
    [/^(ln|naturallog(arithm)?)$/, 1, 1, (num) => num.ln()],
    [/^log(arithm)?$/, 1, 2, (num, num2?: Decimal) => num2 ? num2.log(num) : num.log()],
    [/^exp(onent(ial)?)?$/, 1, 1, (num: Decimal) => num.exp()],
    [/^min(imum)?$/, 1, Infinity, (...nums) => Decimal.min(...nums)],
    [/^max(imum)?$/, 1, Infinity, (...nums) => Decimal.max(...nums)],
    [/^abs(olute)?$/, 1, 1, (num) => num.abs()],
    [/^trunc(ated?)?$/, 1, 1, (num) => num.trunc()],
    [/^rand(om)?$/, 0, 1, (num?) => Decimal.random(num ? (num.lessThan(0) || num.greaterThan("1e+9") ? undefined : num.floor().toNumber()) : undefined)],
    [/^hypot(enuse)?$/, 2, 2, (num, num2) => Decimal.hypot(num, num2)],
    [/^sine?$/, 1, 1, (num) => num.sin()],
    [/^cos(ine)?$/, 1, 1, (num) => num.cos()],
    [/^tan(gent)?$/, 1, 1, (num) => num.tan()],
    [/^a(rc)?sine?$/, 1, 1, (num) => num.asin()],
    [/^a(rc)?cos(ine)?$/, 1, 1, (num) => num.acos()],
    [/^a(rc)?tan(gent)?$/, 1, 1, (num) => num.atan()],
    [/^(csc|cosecant)$/, 1, 1, (num) => Std.one.div(num.sin())],
    [/^sec(ant)?$/, 1, 1, (num) => Std.one.div(num.cos())],
    [/^cot(angent)?$/, 1, 1, (num) => Std.one.div(num.tan())],
    [/^a(rc)?(csc|cosecant)$/, 1, 1, (num) => Std.one.div(num).asin()],
    [/^a(rc)?sec(ant)?$/, 1, 1, (num) => Std.one.div(num).acos()],
    [/^a(rc)?cot(angent)?$/, 1, 1, (num) => num.div(num.pow(2).add(1).sqrt()).acos()],
    [/^(hyperbol(a|ic)sine?|sine?h)$/, 1, 1, (num) => num.sinh()],
    [/^(hyperbol(a|ic)cos(ine)?|cos(ine)?h)$/, 1, 1, (num) => num.cosh()],
    [/^(hyperbol(a|ic)tan(gent)?|tan(gent)?h)$/, 1, 1, (num) => num.tanh()],
    [/^a(rc)?(hyperbol(a|ic)sine?|sine?h)$/, 1, 1, (num) => num.asinh()],
    [/^a(rc)?(hyperbol(a|ic)cos(ine)?|cos(ine)?h)$/, 1, 1, (num) => num.acosh()],
    [/^a(rc)?(hyperbol(a|ic)tan(gent)?|tan(gent)?h)$/, 1, 1, (num) => num.atanh()],
    [/^(hyperbol(a|ic)(csc|cosecant)|(csc|cosecant)h)$/, 1, 1, (num) => Std.one.div(num.sinh())],
    [/^(hyperbol(a|ic)sec(ant)?|sec(ant)?h)$/, 1, 1, (num) => Std.one.div(num.cosh())],
    [/^(hyperbol(a|ic)cot(angent)?|cot(angent)?h)$/, 1, 1, (num) => num.sinh().div(num.cosh())],
    [/^a(rc)?(hyperbol(a|ic)(csc|cosecant)|(csc|cosecant)h)$/, 1, 1, (num) => Std.one.div(num).add(Std.one.div(num.pow(2)).add(1).sqrt()).ln()],
    [/^a(rc)?(hyperbol(a|ic)sec(ant)?|sec(ant)?h)$/, 1, 1, (num) => Std.one.div(num).add(Std.one.div(num.pow(2)).sub(1).sqrt()).ln()],
    [/^a(rc)?(hyperbol(a|ic)cot(angent)?|cot(angent)?h)$/, 1, 1, (num) => Std.half.mul(num.add(1).div(num.sub(1)).ln())],
  ];

  public static readonly constants: { [key: string]: Decimal } = {
    pi: Decimal.acos(-1),
    tau: Decimal.acos(-1).mul(2),
    e: Decimal.exp(1),
    phi: Std.half.add(new Decimal(5).sqrt().div(2)),
  };

  public readonly modifiers: { [key: string]: (value: Decimal) => Decimal } = {
    "°": (x: Decimal) => x.mul(Std.constants.pi).div(180), // Turn degrees into radians
    // I will add factorials later (and maybe some other modifiers)
  };

  // Check if a function exists
  public isFunction(func: string): boolean {
    return Boolean(this.getFunction(func));
  }

  // Check if a constant exists
  public isConstant(constant: string): boolean {
    return Boolean(Std.constants[constant]);
  }

  // Get a function object by name
  public getFunction(func: string): [number, number, (...args: Decimal[]) => Decimal] {
    return Std.functions.find(v => v[0].test(func))?.slice(1) as any;
  }

  // Get a constant's value by name
  public getConstant(constant: string): Decimal {
    return Std.constants[constant];
  }
}

export default new Std();
