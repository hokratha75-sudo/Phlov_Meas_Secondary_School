import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axiosConfig';

export interface LeaveBalance {
  id: number;
  teacherId: number;
  academicYear: string;
  allowedDays: number;
  usedDays: number;
  remainingDays: number;
}

export const useLeaveBalance = (teacherId: number | undefined) => {
  return useQuery<LeaveBalance>({
    queryKey: ['leaveBalance', teacherId],
    queryFn: async () => {
      const res = await api.get('/leave-requests/leave-balances', {
        params: { teacherId }
      });
      return res.data;
    },
    enabled: !!teacherId,
  });
};
