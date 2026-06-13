import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosConfig';

interface Exam {
    id: number;
    exam_name_kh: string;
    exam_name_en: string;
    subject_id: number;
    class_id: number;
    room_id: number;
    exam_date: string;
    start_time: string;
    end_time: string;
    proctor_teacher_id?: number | null;
    total_students: number;
    notes?: string | null;
}

const ExamSchedule: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);

    // Filters could be expanded (e.g. by class_id)
    const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${lastDay}`;

    const { data: exams = [], isLoading } = useQuery<Exam[]>({
        queryKey: ['exams', startDate, endDate],
        queryFn: async () => {
            const res = await api.get('/schedules/exams', { params: { startDate, endDate } });
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/schedules/exams/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams'] });
        }
    });

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('តើអ្នកពិតជាចង់លុបការប្រឡងនេះមែនទេ? (Are you sure?)')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="exam-schedule-container bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .exam-schedule-container { box-shadow: none; border: none; padding: 0; }
                }
            `}</style>
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">កាលវិភាគប្រឡង (Exam Schedule)</h2>
                <div className="flex gap-3 no-print">
                    <button 
                        onClick={() => { setEditingExam(null); setShowForm(!showForm); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        + បន្ថែមការប្រឡង (Add Exam)
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        🖨️ បោះពុម្ព (Print)
                    </button>
                </div>
            </div>

            {showForm && (
                <ExamForm 
                    exam={editingExam} 
                    onClose={() => { setShowForm(false); setEditingExam(null); }} 
                />
            )}

            <div className="flex justify-between items-center mb-4 no-print bg-gray-50 p-3 rounded-lg border dark:bg-gray-900/50">
                <button 
                    onClick={() => {
                        if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
                        else { setSelectedMonth(m => m - 1); }
                    }}
                    className="px-4 py-1.5 bg-white border rounded hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                    ← ខែមុន
                </button>
                <span className="font-semibold text-lg text-blue-800">
                    {getKhmerMonth(selectedMonth)} {selectedYear}
                </span>
                <button 
                    onClick={() => {
                        if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
                        else { setSelectedMonth(m => m + 1); }
                    }}
                    className="px-4 py-1.5 bg-white border rounded hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                    ខែក្រោយ →
                </button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-gray-500">កំពុងទាញយកទិន្នន័យ...</div>
            ) : exams.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-900/50">
                    មិនមានកាលវិភាគប្រឡងក្នុងខែនេះទេ (No exams scheduled for this month)
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-200">
                                <th className="p-3 font-semibold text-gray-700">កាលបរិច្ឆេទ (Date)</th>
                                <th className="p-3 font-semibold text-gray-700">ម៉ោង (Time)</th>
                                <th className="p-3 font-semibold text-gray-700">ការប្រឡង (Exam)</th>
                                <th className="p-3 font-semibold text-gray-700">បន្ទប់ (Room)</th>
                                <th className="p-3 font-semibold text-gray-700">អនុរក្ស (Proctor ID)</th>
                                <th className="p-3 font-semibold text-gray-700 no-print">សកម្មភាព (Actions)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map(exam => (
                                <tr key={exam.id} className="border-b hover:bg-gray-50 dark:bg-gray-900/50">
                                    <td className="p-3">
                                        {new Date(exam.exam_date).toLocaleDateString('km-KH')}
                                    </td>
                                    <td className="p-3 text-blue-700 font-medium">
                                        {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold">{exam.exam_name_kh}</div>
                                        <div className="text-xs text-gray-500">{exam.exam_name_en}</div>
                                    </td>
                                    <td className="p-3">ID: {exam.room_id}</td>
                                    <td className="p-3">{exam.proctor_teacher_id ? `Teacher ID: ${exam.proctor_teacher_id}` : '- គ្មាន -'}</td>
                                    <td className="p-3 no-print">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setEditingExam(exam); setShowForm(true); }}
                                                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                                            >
                                                កែប្រែ
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(exam.id)}
                                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                            >
                                                លុប
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const ExamForm: React.FC<{ exam: Exam | null; onClose: () => void }> = ({ exam, onClose }) => {
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        examNameKh: exam?.exam_name_kh || '',
        examNameEn: exam?.exam_name_en || '',
        subjectId: exam?.subject_id || '',
        classId: exam?.class_id || '',
        roomId: exam?.room_id || '',
        examDate: exam?.exam_date ? new Date(exam.exam_date).toISOString().split('T')[0] : '',
        startTime: exam?.start_time || '',
        endTime: exam?.end_time || '',
        proctorTeacherId: exam?.proctor_teacher_id || '',
        totalStudents: exam?.total_students || 0,
        notes: exam?.notes || ''
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (exam) {
                return await api.put(`/schedules/exams/${exam.id}`, data);
            } else {
                return await api.post('/schedules/exams', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams'] });
            onClose();
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || 'មានបញ្ហាក្នុងការរក្សាទុក (Error saving)');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            subjectId: Number(formData.subjectId),
            classId: Number(formData.classId),
            roomId: Number(formData.roomId),
            proctorTeacherId: formData.proctorTeacherId ? Number(formData.proctorTeacherId) : null,
            totalStudents: Number(formData.totalStudents)
        };
        mutation.mutate(payload);
    };

    return (
        <div className="mb-8 p-5 bg-blue-50 rounded-lg border border-blue-200 relative no-print">
            <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
            <h3 className="text-lg font-bold mb-4">{exam ? 'កែប្រែការប្រឡង (Edit Exam)' : 'បន្ថែមការប្រឡងថ្មី (New Exam)'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">ឈ្មោះការប្រឡង (ខ្មែរ)*</label>
                    <input required type="text" className="w-full p-2 border rounded" value={formData.examNameKh} onChange={e => setFormData({...formData, examNameKh: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ឈ្មោះការប្រឡង (អង់គ្លេស)*</label>
                    <input required type="text" className="w-full p-2 border rounded" value={formData.examNameEn} onChange={e => setFormData({...formData, examNameEn: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">មុខវិជ្ជា (Subject ID)*</label>
                    <input required type="number" className="w-full p-2 border rounded" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ថ្នាក់ (Class ID)*</label>
                    <input required type="number" className="w-full p-2 border rounded" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">បន្ទប់ (Room ID)*</label>
                    <input required type="number" className="w-full p-2 border rounded" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ថ្ងៃប្រឡង (Date)*</label>
                    <input required type="date" className="w-full p-2 border rounded" value={formData.examDate} onChange={e => setFormData({...formData, examDate: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ម៉ោងចាប់ផ្តើម (Start)*</label>
                    <input required type="time" className="w-full p-2 border rounded" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ម៉ោងបញ្ចប់ (End)*</label>
                    <input required type="time" className="w-full p-2 border rounded" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">គ្រូអនុរក្ស (Proctor ID)</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.proctorTeacherId} onChange={e => setFormData({...formData, proctorTeacherId: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ចំនួនសិស្ស (Total Students)</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.totalStudents} onChange={e => setFormData({...formData, totalStudents: Number(e.target.value)})} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">ចំណាំ (Notes)</label>
                    <textarea className="w-full p-2 border rounded" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
                <div className="md:col-span-2 mt-2">
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 w-full md:w-auto">
                        រក្សាទុក (Save)
                    </button>
                </div>
            </form>
        </div>
    );
};

const getKhmerMonth = (month: number): string => {
    const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
                    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    return months[month];
};

export default ExamSchedule;
