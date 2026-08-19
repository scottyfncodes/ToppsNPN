import { useMemo } from 'react';
import { products as allProducts } from '../data/products';
import { computeProductStatus } from '../lib/deadline';
import type { Product, ProductComputed } from '../types';

export interface ProductWithComputed {
  product: Product;
  computed: ProductComputed;
}

export function useProducts(): ProductWithComputed[] {
  return useMemo(() => allProducts.map((product) => ({ product, computed: computeProductStatus(product) })), []);
}
