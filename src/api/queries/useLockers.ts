import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { lockerKeys } from './queryKeys';

export type Locker = any;

const fetchLockers = async (): Promise<{ data: Locker[], meta: any }> => {
  return await api.get('/lockers');
};

const fetchLockerById = async (id: string): Promise<{ data: Locker }> => {
  return await api.get(`/lockers/${id}`);
};

const createLocker = async (data: Partial<Locker>): Promise<{ data: Locker }> => {
  return await api.post('/lockers', data);
};

const assignLocker = async ({ id, data }: { id: string; data: any }): Promise<{ data: Locker }> => {
  return await api.post(`/lockers/${id}/assign`, data);
};

const releaseLocker = async (id: string): Promise<{ data: Locker }> => {
  return await api.post(`/lockers/${id}/release`);
};

const updateLocker = async ({ id, data }: { id: string; data: Partial<Locker> }): Promise<{ data: Locker }> => {
  return await api.put(`/lockers/${id}`, data);
};

const fetchLockerHistory = async (id: string): Promise<{ data: any[] }> => {
  return await api.get(`/lockers/${id}/history`);
};

export const useLockerList = () => {
  return useQuery({
    queryKey: lockerKeys.lists(),
    queryFn: fetchLockers,
  });
};

export const useLockerDetail = (id: string) => {
  return useQuery({
    queryKey: lockerKeys.detail(id),
    queryFn: () => fetchLockerById(id),
    enabled: !!id,
  });
};

export const useLockerHistory = (id: string) => {
  return useQuery({
    queryKey: lockerKeys.history(id),
    queryFn: () => fetchLockerHistory(id),
    enabled: !!id,
  });
};

export const useCreateLocker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLocker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockerKeys.lists() });
    },
  });
};

export const useAssignLocker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignLocker,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lockerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lockerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: lockerKeys.history(variables.id) });
    },
  });
};

export const useReleaseLocker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseLocker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lockerKeys.lists() });
    },
  });
};

export const useUpdateLocker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLocker,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lockerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lockerKeys.detail(variables.id) });
    },
  });
};
