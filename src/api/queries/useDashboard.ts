import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { dashboardKeys } from './queryKeys';

const fetchDashboardStats = async () => {
  return await api.get('/dashboard/stats');
};

const fetchDashboardTrends = async () => {
  return await api.get('/dashboard/trends');
};

const fetchRecentActivities = async () => {
  return await api.get('/dashboard/activities');
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'stats'],
    queryFn: fetchDashboardStats,
  });
};

export const useDashboardTrends = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'trends'],
    queryFn: fetchDashboardTrends,
  });
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'activities'],
    queryFn: fetchRecentActivities,
  });
};
