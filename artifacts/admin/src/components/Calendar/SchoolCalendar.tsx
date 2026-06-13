import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosConfig';

interface CalendarEvent {
    id: number;
    event_date: string;
    event_type: string;
    event_name_kh: string;
    event_name_en: string;
    description: string | null;
    is_holiday: boolean;
    affects_classes: boolean;
}

const SchoolCalendar: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
        queryKey: ['calendarEvents', selectedMonth, selectedYear],
        queryFn: async () => {
            const res = await api.get('/schedules/calendar', {
                params: { month: selectedMonth + 1, year: selectedYear }
            });
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/schedules/calendar/events/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    });

    const handleDelete = (id: number) => {
        if (window.confirm('តើអ្នកពិតជាចង់លុបព្រឹត្តិការណ៍នេះមែនទេ? (Are you sure?)')) {
            deleteMutation.mutate(id);
        }
    };

    const getEventColor = (type: string, isHoliday: boolean) => {
        if (isHoliday) return 'bg-red-100 text-red-800 border-red-200';
        if (type === 'exam') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (type === 'meeting') return 'bg-purple-100 text-purple-800 border-purple-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
        <div className="school-calendar bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">ប្រតិទិនសាលា (School Calendar)</h2>
                <div className="flex gap-4 items-center">
                    <button 
                        onClick={() => { setEditingEvent(null); setShowForm(!showForm); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        + បន្ថែមព្រឹត្តិការណ៍ (Add Event)
                    </button>
                </div>
            </div>

            {showForm && (
                <EventForm 
                    event={editingEvent} 
                    onClose={() => { setShowForm(false); setEditingEvent(null); }} 
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={() => {
                        if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(prev => prev - 1); }
                        else setSelectedMonth(prev => prev - 1);
                    }}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded border dark:bg-gray-900/50"
                >
                    ← ខែមុន
                </button>
                <span className="px-6 py-2 bg-blue-50 text-blue-800 font-bold text-lg rounded-full shadow-sm">
                    {getKhmerMonth(selectedMonth)} {selectedYear}
                </span>
                <button 
                    onClick={() => {
                        if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(prev => prev + 1); }
                        else setSelectedMonth(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded border dark:bg-gray-900/50"
                >
                    ខែក្រោយ →
                </button>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-500">កំពុងទាញយកទិន្នន័យ...</div>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1">
                        {['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'].map(day => (
                            <div key={day} className="text-center font-bold py-2 bg-gray-50 text-gray-600 rounded text-sm dark:bg-gray-900/50">
                                {day}
                            </div>
                        ))}
                        
                        {days.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} className="h-24 bg-gray-50/50 rounded border border-transparent dark:bg-gray-900/50"></div>;
                            }
                            const dayEvents = events.filter(e => {
                                const ed = new Date(e.event_date);
                                return ed.getDate() === day && ed.getMonth() === selectedMonth && ed.getFullYear() === selectedYear;
                            });
                            
                            return (
                                <div key={`day-${day}`} className="h-28 border rounded p-1 flex flex-col hover:border-blue-400 hover:shadow-md transition-all bg-white relative group dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                                    <div className="text-right text-sm font-bold text-gray-600 p-1">{day}</div>
                                    <div className="flex-1 overflow-y-auto space-y-1 mt-1 no-scrollbar">
                                        {dayEvents.map(event => (
                                            <div 
                                                key={event.id} 
                                                onClick={() => { setEditingEvent(event); setShowForm(true); }}
                                                className={`text-xs p-1 rounded truncate border cursor-pointer hover:opacity-80 ${getEventColor(event.event_type, event.is_holiday)}`}
                                                title={event.event_name_kh}
                                            >
                                                {event.event_name_kh}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-8 space-y-3 border-t pt-6">
                        <h3 className="font-semibold text-gray-800 text-lg">បញ្ជីព្រឹត្តិការណ៍ក្នុងខែនេះ</h3>
                        {events.length === 0 ? (
                            <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded border border-dashed text-center dark:bg-gray-900/50">
                                មិនមានព្រឹត្តិការណ៍ទេ
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {events.map(event => (
                                    <div key={event.id} className={`p-4 rounded-xl border shadow-sm ${getEventColor(event.event_type, event.is_holiday)}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-base">{event.event_name_kh}</div>
                                                <div className="text-sm opacity-80">{event.event_name_en}</div>
                                            </div>
                                            <span className="text-sm font-bold bg-white/50 px-2 py-1 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                                                {new Date(event.event_date).toLocaleDateString('km-KH')}
                                            </span>
                                        </div>
                                        {event.description && <div className="mt-2 text-sm opacity-90">{event.description}</div>}
                                        <div className="mt-4 flex gap-2 justify-end">
                                            <button onClick={() => { setEditingEvent(event); setShowForm(true); }} className="px-3 py-1 bg-white/60 hover:bg-white text-gray-800 rounded text-xs font-semibold transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                                                កែប្រែ
                                            </button>
                                            <button onClick={() => handleDelete(event.id)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-semibold transition-colors">
                                                លុប
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const EventForm: React.FC<{ event: CalendarEvent | null; onClose: () => void }> = ({ event, onClose }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        eventDate: event?.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
        eventType: event?.event_type || 'event',
        eventNameKh: event?.event_name_kh || '',
        eventNameEn: event?.event_name_en || '',
        description: event?.description || '',
        isHoliday: event?.is_holiday || false,
        affectsClasses: event?.affects_classes ?? true
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (event) return await api.put(`/schedules/calendar/events/${event.id}`, data);
            return await api.post('/schedules/calendar/events', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
            onClose();
        },
        onError: (err: any) => alert(err.response?.data?.error || 'Error saving event')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 relative shadow-inner">
            <button onClick={onClose} className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
            <h3 className="text-xl font-bold mb-5 text-slate-800">{event ? 'កែប្រែព្រឹត្តិការណ៍ (Edit Event)' : 'បន្ថែមព្រឹត្តិការណ៍ថ្មី (New Event)'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">ថ្ងៃទី (Date)*</label>
                    <input required type="date" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">ប្រភេទ (Type)*</label>
                    <select required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})}>
                        <option value="event">ធម្មតា (General Event)</option>
                        <option value="exam">ការប្រឡង (Exam)</option>
                        <option value="meeting">ប្រជុំ (Meeting)</option>
                        <option value="holiday">ថ្ងៃឈប់សម្រាក (Holiday)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">ឈ្មោះព្រឹត្តិការណ៍ (ខ្មែរ)*</label>
                    <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.eventNameKh} onChange={e => setFormData({...formData, eventNameKh: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">ឈ្មោះព្រឹត្តិការណ៍ (English)*</label>
                    <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.eventNameEn} onChange={e => setFormData({...formData, eventNameEn: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={formData.isHoliday} onChange={e => setFormData({...formData, isHoliday: e.target.checked})} />
                        <span className="font-medium text-slate-700">ជាថ្ងៃឈប់សម្រាកបុណ្យជាតិ (National Holiday)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={formData.affectsClasses} onChange={e => setFormData({...formData, affectsClasses: e.target.checked})} />
                        <span className="font-medium text-slate-700">ប៉ះពាល់ការសិក្សា (Affects Classes)</span>
                    </label>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1 text-slate-700">ព័ត៌មានបន្ថែម (Description)</label>
                    <textarea className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="md:col-span-2 mt-2 border-t pt-4">
                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all w-full md:w-auto">
                        {event ? 'រក្សាទុកការប្រែប្រួល' : 'បង្កើតព្រឹត្តិការណ៍'}
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

export default SchoolCalendar;
