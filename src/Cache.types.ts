export interface ICache {
  put: <T = any>(key: string, value?: T) => void;
  match: (key: string) => boolean;
  get: <T = any>(key: string) => T | false;
  remove: (key: string) => boolean;
  items?: <T = any>() => Map<string, T>;
}