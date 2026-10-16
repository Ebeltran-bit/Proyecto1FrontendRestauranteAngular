import { es } from './es';

export type Language = 'es' | 'en';
export type Dictionary = typeof es;

/** Every dotted path that ends in a text, e.g. 'floor.title'. */
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Paths<Dictionary>;
export type TranslationParams = Record<string, string | number>;

export const roleKey = (role: 'manager' | 'waiter'): TranslationKey => `roles.${role}`;
