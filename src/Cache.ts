import { ICache } from './Cache.types';

export class Cache implements ICache {
  private cache: Map<string, any> = new Map();
  
  public put = (key: string, value?: any): void => {
    this.cache.set(key, value || true);
  }
  
  public match = (key: string): boolean => {
    return this.cache.has(key);
  }
  
  public get = <T = any>(key: string): T | false => {
    if (!this.cache.has(key)) {
      return false;
    }
    
    return this.cache.get(key);
  }
  
  public items = <T = any>(): Map<string, T> => this.cache;

  public remove = (key: string): boolean => {
    if (!this.cache.has(key)) {
      return false;
    }
    
    this.cache.delete(key);
    
    return true;
  }
}