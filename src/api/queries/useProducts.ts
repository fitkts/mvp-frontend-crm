import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { productKeys } from './queryKeys';

export type Product = any; // Adjust when type definition is centralized

const fetchProducts = async (filters?: any): Promise<{ data: Product[], meta: any }> => {
  return await api.get('/products', { params: filters });
};

const fetchProductById = async (id: number): Promise<{ data: Product }> => {
  return await api.get(`/products/${id}`);
};

const createProduct = async (data: Partial<Product>): Promise<{ data: Product }> => {
  return await api.post('/products', data);
};

const updateProduct = async ({ id, data }: { id: number; data: Partial<Product> }): Promise<{ data: Product }> => {
  return await api.put(`/products/${id}`, data);
};

const deleteProduct = async (id: number): Promise<any> => {
  return await api.delete(`/products/${id}`);
};

export const useProductList = (filters?: any) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
  });
};

export const useProductDetail = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
