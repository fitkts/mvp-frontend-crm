import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { payrollKeys } from './queryKeys';

const fetchPayrolls = async (filters?: any) => {
  return await api.get('/payrolls', { params: filters });
};

const updatePayrollStatus = async ({ id, status }: { id: number; status: string }) => {
  return await api.put(`/payrolls/${id}/status`, { status });
};

const generatePayrolls = async (period: string) => {
  return await api.post('/payrolls/generate', { period });
};

export const usePayrolls = (filters?: any) => {
  return useQuery({
    queryKey: payrollKeys.list(filters),
    queryFn: () => fetchPayrolls(filters),
  });
};

export const useUpdatePayrollStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePayrollStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
};

export const useGeneratePayrolls = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generatePayrolls,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
};
