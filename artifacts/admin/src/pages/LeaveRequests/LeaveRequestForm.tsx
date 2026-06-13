import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosConfig';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';
import { useLeaveBalance } from '@/hooks/useLeaveBalance';
import { exportLeaveRequestToWord } from '@/utils/exportToWord';
import { FileText, Save, ArrowLeft } from 'lucide-react';

interface LeaveFormInputs {
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    actingTeacher: string;
    addressDuringLeave: string;
}

const LeaveRequestForm: React.FC = () => {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<LeaveFormInputs>({
        defaultValues: {
            leaveType: 'ANNUAL',
            startDate: '',
            endDate: '',
            totalDays: 0,
            reason: '',
            actingTeacher: '',
            addressDuringLeave: ''
        }
    });

    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const leaveType = watch('leaveType');
    const allFormValues = watch();

    // Fetch leave balance
    const { data: balance, isLoading: isLoadingBalance } = useLeaveBalance(user?.id);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end >= start) {
                // Calculate days (inclusive)
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setValue('totalDays', diffDays);
            } else {
                setValue('totalDays', 0);
            }
        }
    }, [startDate, endDate, setValue]);

    const mutation = useMutation({
        mutationFn: async (data: LeaveFormInputs) => {
            const formattedReason = data.actingTeacher 
                ? `${data.reason}\n(អ្នកជំនួស៖ ${data.actingTeacher})`
                : data.reason;

            return await api.post('/leave-requests', {
                teacherId: user?.id,
                leaveType: data.leaveType,
                startDate: data.startDate,
                endDate: data.endDate,
                totalDays: data.totalDays,
                reason: formattedReason,
                addressDuringLeave: data.addressDuringLeave
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
            alert('ពាក្យសុំត្រូវបានបញ្ជូនដោយជោគជ័យ!');
            setLocation('/leave-requests');
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || 'មានបញ្ហាក្នុងការបញ្ជូនពាក្យសុំ');
        }
    });

    const onSubmit = (data: LeaveFormInputs) => {
        if (data.totalDays <= 0) {
            alert('កាលបរិច្ឆេទមិនត្រឹមត្រូវទេ (Invalid dates)');
            return;
        }
        if (leaveType === 'ANNUAL' && balance && data.totalDays > balance.remainingDays) {
            alert(`ច្បាប់ប្រចាំឆ្នាំមិនគ្រប់គ្រាន់ទេ (នៅសល់ ${balance.remainingDays} ថ្ងៃ)`);
            return;
        }
        mutation.mutate(data);
    };

    const handleDownloadWord = () => {
        exportLeaveRequestToWord({
            nameKh: user?.nameKh || '',
            gender: (user as any)?.gender || 'male',
            officerId: (user as any)?.officerId || user?.id?.toString() || '',
            position: (user as any)?.position || 'គ្រូបង្រៀន',
            leaveType: allFormValues.leaveType,
            startDate: allFormValues.startDate,
            endDate: allFormValues.endDate,
            totalDays: allFormValues.totalDays,
            reason: allFormValues.reason,
            actingTeacher: allFormValues.actingTeacher,
            addressDuringLeave: allFormValues.addressDuringLeave,
        }, `Leave_Request_${user?.nameKh || 'Teacher'}.doc`);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8 font-khmer dark:bg-gray-900/50">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setLocation('/leave-requests')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>ត្រឡប់ក្រោយ</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">បំពេញពាក្យសុំច្បាប់ឈប់សម្រាក</h1>
                </div>

                {/* Balance Info */}
                {!isLoadingBalance && balance && (
                    <div className="mb-6 bg-white border border-blue-200 shadow-sm p-4 rounded-xl flex justify-between items-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">ព័ត៌មានច្បាប់ឈប់សម្រាកប្រចាំឆ្នាំ</h3>
                                <p className="text-sm text-gray-500">អ្នកអាចប្រើប្រាស់បានតាមចំនួនដែលនៅសល់</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{balance.remainingDays} <span className="text-sm font-normal text-gray-500">ថ្ងៃនៅសល់</span></div>
                            <div className="text-sm text-gray-400">ប្រើរួច៖ {balance.usedDays} ថ្ងៃ</div>
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Leave Type */}
                                <div className="space-y-2 col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700">ប្រភេទច្បាប់ឈប់សម្រាក <span className="text-red-500">*</span></label>
                                    <select 
                                        {...register('leaveType')}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-900/50"
                                    >
                                        <option value="ANNUAL">ច្បាប់ឈប់សម្រាកប្រចាំឆ្នាំ</option>
                                        <option value="SHORT_TERM">ច្បាប់ឈប់សម្រាករយៈពេលខ្លី</option>
                                        <option value="SICK_LEAVE">ច្បាប់សម្រាកព្យាបាលជំងឺ</option>
                                        <option value="PERSONAL">ច្បាប់សម្រាកកិច្ចការផ្ទាល់ខ្លួន</option>
                                        <option value="MATERNITY">ច្បាប់សម្រាកលំហែមាតុភាព</option>
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">ចាប់ពីថ្ងៃទី <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        {...register('startDate', { required: true })} 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-900/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">ដល់ថ្ងៃទី <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        {...register('endDate', { required: true })} 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-900/50"
                                    />
                                </div>

                                {/* Total Days Badge */}
                                <div className="col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 dark:bg-gray-900/50">
                                    <span className="text-gray-600 font-medium">ចំនួនថ្ងៃសរុប៖</span>
                                    <span className="text-2xl font-bold text-blue-600">{watch('totalDays')}</span>
                                    <span className="text-gray-600 font-medium">ថ្ងៃ</span>
                                </div>

                                {/* Reason */}
                                <div className="space-y-2 col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700">មូលហេតុនៃការឈប់សម្រាក <span className="text-red-500">*</span></label>
                                    <textarea 
                                        {...register('reason', { required: true })} 
                                        placeholder="សូមបញ្ជាក់មូលហេតុឱ្យបានច្បាស់លាស់..."
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 dark:bg-gray-900/50"
                                    />
                                    {errors.reason && <span className="text-red-500 text-sm">សូមបំពេញមូលហេតុ</span>}
                                </div>

                                {/* Acting Teacher */}
                                <div className="space-y-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">គ្រូទទួលបន្ទុកជំនួស (បើមាន)</label>
                                    <input 
                                        type="text" 
                                        {...register('actingTeacher')} 
                                        placeholder="ឈ្មោះគ្រូបង្រៀនជំនួស"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-900/50"
                                    />
                                </div>

                                {/* Address during leave */}
                                <div className="space-y-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">អាសយដ្ឋានក្នុងពេលច្បាប់ <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        {...register('addressDuringLeave', { required: true })} 
                                        placeholder="អាសយដ្ឋាន ឬ លេខទូរស័ព្ទ"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-900/50"
                                    />
                                    {errors.addressDuringLeave && <span className="text-red-500 text-sm">សូមបំពេញអាសយដ្ឋាន</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={handleDownloadWord}
                                    className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                >
                                    <FileText className="w-5 h-5" />
                                    ទាញយកជា Word (លិខិតសុំច្បាប់)
                                </button>
                                
                                <button 
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 transition-all shadow-sm"
                                >
                                    <Save className="w-5 h-5" />
                                    {mutation.isPending ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនពាក្យសុំ'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestForm;

