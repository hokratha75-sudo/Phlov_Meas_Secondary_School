import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosConfig';

interface ScheduleFormProps {
    classId?: number;
    initialData?: any;
    onClose?: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ classId: defaultClassId, initialData, onClose }) => {
    const queryClient = useQueryClient();
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [conflictError, setConflictError] = useState<{ error: string, message: string } | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        classId: defaultClassId || initialData?.class_id || '',
        subjectId: initialData?.subject_id || '',
        teacherId: initialData?.teacher_id || '',
        roomId: initialData?.room_id || '',
        weekdayId: initialData?.weekday_id || 1,
        periodId: initialData?.period_id || 1,
        semester: initialData?.semester || '1',
        academicYear: initialData?.academic_year || new Date().getFullYear()
    });

    const [batchData, setBatchData] = useState([{ ...formData }]);

    // Fetch necessary dropdown data
    const { data: classes = [] } = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classrooms')).data });
    const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects')).data });
    const { data: teachers = [] } = useQuery({ queryKey: ['teachers'], queryFn: async () => (await api.get('/teachers')).data });
    const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: async () => (await api.get('/schedules/rooms')).data });

    // Mock periods and weekdays (could be fetched if API provides them)
    const weekdays = [
        { id: 1, name: 'ចន្ទ (Mon)' }, { id: 2, name: 'អង្គារ (Tue)' }, { id: 3, name: 'ពុធ (Wed)' },
        { id: 4, name: 'ព្រហស្បតិ៍ (Thu)' }, { id: 5, name: 'សុក្រ (Fri)' }, { id: 6, name: 'សៅរ៍ (Sat)' }
    ];
    const periods = [
        { id: 1, name: 'ម៉ោងទី ១ (07:00 - 08:00)' }, { id: 2, name: 'ម៉ោងទី ២ (08:00 - 09:00)' },
        { id: 3, name: 'ម៉ោងទី ៣ (09:00 - 10:00)' }, { id: 4, name: 'ម៉ោងទី ៤ (10:00 - 11:00)' },
        { id: 5, name: 'ម៉ោងទី ៥ (13:00 - 14:00)' }, { id: 6, name: 'ម៉ោងទី ៦ (14:00 - 15:00)' },
        { id: 7, name: 'ម៉ោងទី ៧ (15:00 - 16:00)' }, { id: 8, name: 'ម៉ោងទី ៨ (16:00 - 17:00)' }
    ];

    const singleMutation = useMutation({
        mutationFn: async (data: any) => {
            if (initialData?.id) {
                return await api.put(`/schedules/${initialData.id}`, data);
            }
            return await api.post('/schedules', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            setSuccessMessage('បានរក្សាទុកដោយជោគជ័យ (Saved successfully)');
            setConflictError(null);
            setTimeout(() => { if (onClose) onClose(); }, 1500);
        },
        onError: (err: any) => {
            if (err.response?.status === 409) {
                setConflictError({
                    error: err.response.data.error,
                    message: err.response.data.message
                });
            } else {
                setConflictError({ error: 'System Error', message: 'មានបញ្ហាក្នុងការរក្សាទុក (Failed to save)' });
            }
        }
    });

    const batchMutation = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post('/schedules/batch', payload);
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            if (res.data.errors && res.data.errors.length > 0) {
                setConflictError({ 
                    error: 'Partial Success', 
                    message: `បញ្ជូលជោគជ័យចំនួន ${res.data.insertedIds.length} តែមាន Error ចំនួន ${res.data.errors.length}`
                });
            } else {
                setSuccessMessage('បានរក្សាទុកដោយជោគជ័យទាំងអស់ (All saved successfully)');
                setConflictError(null);
                setTimeout(() => { if (onClose) onClose(); }, 1500);
            }
        },
        onError: () => {
            setConflictError({ error: 'Batch Error', message: 'បរាជ័យការបញ្ចូលទិន្នន័យច្រើន (Failed to batch import)' });
        }
    });

    const handleSubmitSingle = (e: React.FormEvent) => {
        e.preventDefault();
        setConflictError(null);
        singleMutation.mutate({
            classId: Number(formData.classId),
            subjectId: Number(formData.subjectId),
            teacherId: Number(formData.teacherId),
            roomId: Number(formData.roomId),
            weekdayId: Number(formData.weekdayId),
            periodId: Number(formData.periodId),
            semester: String(formData.semester),
            academicYear: Number(formData.academicYear)
        });
    };

    const handleSubmitBatch = (e: React.FormEvent) => {
        e.preventDefault();
        setConflictError(null);
        const formatted = batchData.map(b => ({
            classId: Number(b.classId),
            subjectId: Number(b.subjectId),
            teacherId: Number(b.teacherId),
            roomId: Number(b.roomId),
            weekdayId: Number(b.weekdayId),
            periodId: Number(b.periodId),
            semester: String(b.semester),
            academicYear: Number(b.academicYear)
        }));
        batchMutation.mutate({ schedules: formatted });
    };

    const addBatchRow = () => {
        setBatchData([...batchData, { ...batchData[batchData.length - 1] }]);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-4xl mx-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    {initialData ? 'កែប្រែកាលវិភាគ (Edit Schedule)' : 'បន្ថែមម៉ោងបង្រៀន (Add Schedule)'}
                </h2>
                {!initialData && (
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            type="button"
                            className={`px-4 py-1.5 rounded-md ${!isBatchMode ? 'bg-white shadow font-semibold' : 'text-gray-600'}`}
                            onClick={() => setIsBatchMode(false)}
                        >
                            បញ្ចូលម្តងមួយ (Single)
                        </button>
                        <button 
                            type="button"
                            className={`px-4 py-1.5 rounded-md ${isBatchMode ? 'bg-white shadow font-semibold' : 'text-gray-600'}`}
                            onClick={() => setIsBatchMode(true)}
                        >
                            បញ្ចូលច្រើន (Batch)
                        </button>
                    </div>
                )}
            </div>

            {conflictError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                    <div className="flex items-start">
                        <div className="text-red-600 text-xl mr-3">⚠️</div>
                        <div>
                            <h4 className="font-bold text-red-800">បញ្ហាកាលវិភាគជាន់គ្នា (Conflict Warning): {conflictError.error}</h4>
                            <p className="text-red-700">{conflictError.message}</p>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-800 font-medium rounded-md border border-green-200">
                    ✅ {successMessage}
                </div>
            )}

            {!isBatchMode ? (
                <form onSubmit={handleSubmitSingle} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-semibold mb-1">ថ្នាក់ (Class)*</label>
                        <select required className="w-full p-2.5 border rounded-lg focus:ring-2" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                            <option value="">ជ្រើសរើស (Select)</option>
                            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">មុខវិជ្ជា (Subject)*</label>
                        <select required className="w-full p-2.5 border rounded-lg focus:ring-2" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                            <option value="">ជ្រើសរើស (Select)</option>
                            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameKh} ({s.nameEn})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">គ្រូ (Teacher)*</label>
                        <select required className="w-full p-2.5 border rounded-lg focus:ring-2" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
                            <option value="">ជ្រើសរើស (Select)</option>
                            {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.nameKh}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">បន្ទប់ (Room)*</label>
                        <select required className="w-full p-2.5 border rounded-lg focus:ring-2" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                            <option value="">ជ្រើសរើស (Select)</option>
                            {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.room_name_kh}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">ថ្ងៃ (Weekday)*</label>
                        <select required className="w-full p-2.5 border rounded-lg focus:ring-2" value={formData.weekdayId} onChange={e => setFormData({...formData, weekdayId: Number(e.target.value)})}>
                            {weekdays.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">ម៉ោងទី (Period)*</label>
                        <select required className="w-full p-2.5 border rounded-lg focus:ring-2" value={formData.periodId} onChange={e => setFormData({...formData, periodId: Number(e.target.value)})}>
                            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">ឆមាស (Semester)</label>
                        <select className="w-full p-2.5 border rounded-lg focus:ring-2" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                            <option value="1">ឆមាសទី ១ (Semester 1)</option>
                            <option value="2">ឆមាសទី ២ (Semester 2)</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2 mt-auto">
                        <div className="flex gap-3 justify-end pt-5 border-t">
                            {onClose && <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">បិទ (Close)</button>}
                            <button type="submit" disabled={singleMutation.isPending} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50">
                                {singleMutation.isPending ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក (Save)'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmitBatch} className="space-y-4">
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-100 text-sm">
                                    <th className="p-2 border font-semibold">ថ្នាក់ (Class)</th>
                                    <th className="p-2 border font-semibold">មុខវិជ្ជា (Subject)</th>
                                    <th className="p-2 border font-semibold">គ្រូ (Teacher)</th>
                                    <th className="p-2 border font-semibold">បន្ទប់ (Room)</th>
                                    <th className="p-2 border font-semibold">ថ្ងៃ (Day)</th>
                                    <th className="p-2 border font-semibold">ម៉ោង (Period)</th>
                                    <th className="p-2 border font-semibold w-10">លុប</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="p-1 border">
                                            <select required className="w-full p-1.5 border-none outline-none bg-transparent" value={row.classId} onChange={e => { const nd = [...batchData]; nd[index].classId = e.target.value; setBatchData(nd); }}>
                                                <option value=""></option>
                                                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1 border">
                                            <select required className="w-full p-1.5 border-none outline-none bg-transparent" value={row.subjectId} onChange={e => { const nd = [...batchData]; nd[index].subjectId = e.target.value; setBatchData(nd); }}>
                                                <option value=""></option>
                                                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameKh}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1 border">
                                            <select required className="w-full p-1.5 border-none outline-none bg-transparent" value={row.teacherId} onChange={e => { const nd = [...batchData]; nd[index].teacherId = e.target.value; setBatchData(nd); }}>
                                                <option value=""></option>
                                                {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.nameKh}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1 border">
                                            <select required className="w-full p-1.5 border-none outline-none bg-transparent" value={row.roomId} onChange={e => { const nd = [...batchData]; nd[index].roomId = e.target.value; setBatchData(nd); }}>
                                                <option value=""></option>
                                                {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.room_name_kh}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1 border">
                                            <select required className="w-full p-1.5 border-none outline-none bg-transparent" value={row.weekdayId} onChange={e => { const nd = [...batchData]; nd[index].weekdayId = Number(e.target.value); setBatchData(nd); }}>
                                                {weekdays.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1 border">
                                            <select required className="w-full p-1.5 border-none outline-none bg-transparent" value={row.periodId} onChange={e => { const nd = [...batchData]; nd[index].periodId = Number(e.target.value); setBatchData(nd); }}>
                                                {periods.map(p => <option key={p.id} value={p.id}>{p.name.split(' ')[0] + ' ' + p.name.split(' ')[1]}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1 border text-center">
                                            <button type="button" onClick={() => setBatchData(batchData.filter((_, i) => i !== index))} className="text-red-500 font-bold hover:bg-red-100 rounded p-1" disabled={batchData.length === 1}>×</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                        <button type="button" onClick={addBatchRow} className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300 font-medium">
                            + ថែមបន្ទាត់ (Add Row)
                        </button>
                        <div className="flex gap-3">
                            {onClose && <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-semibold">បិទ (Close)</button>}
                            <button type="submit" disabled={batchMutation.isPending} className="px-8 py-2.5 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 shadow-md">
                                {batchMutation.isPending ? 'កំពុងបញ្ចូល...' : 'រក្សាទុកទាំងអស់ (Save Batch)'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ScheduleForm;
