// I know that there is EventEmitter in node.js, but I want to have own, small and simple one

export type callback = (...args: any[]) => any | Promise<any>;
export default class EventEmitter {
  private _listeners: { [key: string]: callback[] } = {};
  private _once: { [key: string]: callback[] } = {};

  // add a listener to an event
  public on(event: string, callback: callback): this {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return this;
  }

  // add a listener to an event that will only be called once
  public once(event: string, callback: callback): this {
    if (!this._once[event]) this._once[event] = [];
    this._once[event].push(callback);
    return this;
  }

  // remove all listeners from an event
  public clearListeners(event: string): this {
    this._listeners[event] = [];
    this._once[event] = [];
    return this;
  }

  // remove all listeners
  public clearAllListeners(): this {
    this._listeners = {};
    this._once = {};
    return this;
  }

  // emit once events
  private _emitOnce(event: string, ...args: any[]): number {
    if (!this._once[event]) return 0;
    this._once[event].forEach((callback) => callback(...args));
    const length = this._once[event].length;
    this._once[event] = [];
    return length;
  }

  // emit event
  protected emit(event: string, ...args: any[]): number {
    const once = this._emitOnce(event, ...args);
    if (!this._listeners[event]) return once;
    this._listeners[event].forEach((callback) => callback(...args));
    return once + this._listeners[event].length;
  }
}