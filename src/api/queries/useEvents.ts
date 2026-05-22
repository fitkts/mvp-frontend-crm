import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { eventKeys } from './queryKeys';

const fetchEvents = async (filters?: any) => {
  return await api.get('/events', { params: filters });
};

const createEvent = async (data: any) => {
  return await api.post('/events', data);
};

const updateEvent = async ({ id, data }: { id: number; data: any }) => {
  return await api.put(`/events/${id}`, data);
};

const deleteEvent = async (id: number) => {
  return await api.delete(`/events/${id}`);
};

export const useEvents = (filters?: any) => {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => fetchEvents(filters),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};
