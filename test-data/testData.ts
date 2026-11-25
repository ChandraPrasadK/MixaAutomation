import products from './products.json';
import locales from './locales.json';

export type Product = (typeof products)[number];
export type LocaleConfig = (typeof locales)[number];

export { products, locales };
