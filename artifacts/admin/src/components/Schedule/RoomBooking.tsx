import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axiosConfig';

interface Room {
    id: number;
    room_code: string;
    room_name_kh: string;
    capacity: number;
    room_type: string;
}

interface Booking {
    id: number;
    room_id: number;
    room_code: string;
    room_name_kh: string;
    booking_title_kh: string;
    booking_title_en: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    organizer_name: string | null;
    purpose: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

const RoomBooking: React.FC = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'history'>('calendar');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');

    const { data: rooms = [] } = useQuery<Room[]>({
        queryKey: ['rooms'],
        queryFn: async () => {
            const res = await api.get('/schedules/rooms');
            return res.data;
        }
    });

    const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<Booking[]>({
        queryKey: ['roomBookings'],
        queryFn: async () => {
            const res = await api.get('/schedules/rooms/bookings');
            return res.data;
        }
    });

    // We can also fetch room availability, but let's focus on the bookings list for management
    const filteredBookings = bookings.filter(b => {
        if (viewMode === 'calendar') {
            const bDate = new Date(b.booking_date).toISOString().split('T')[0];
            return bDate === selectedDate && (selectedRoomId === '' || b.room_id === Number(selectedRoomId));
        }
        return selectedRoomId === '' || b.room_id === Number(selectedRoomId);
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/schedules/rooms/bookings/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomBookings'] })
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            await api.put(`/schedules/rooms/bookings/${id}`, data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomBookings'] })
    });

    const handleDelete = (id: number) => {
        if (window.confirm('តើអ្នកពិតជាចង់លុបការកក់បន្ទប់នេះមែនទេ?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleUpdateStatus = (booking: Booking, newStatus: string) => {
        statusMutation.mutate({
            id: booking.id,
            data: {
                roomId: booking.room_id,
                bookingTitleKh: booking.booking_title_kh,
                bookingTitleEn: booking.booking_title_en,
                bookingDate: new Date(booking.booking_date).toISOString().split('T')[0],
                startTime: booking.start_time,
                endTime: booking.end_time,
                status: newStatus
            }
        });
    };

    return (
        <div className="room-booking-container bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">ការកក់បន្ទប់ (Room Booking)</h2>
                <div className="flex gap-3">
                    <button 
                        onClick={() => { setEditingBooking(null); setShowForm(!showForm); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        + កក់បន្ទប់ថ្មី (New Booking)
                    </button>
                </div>
            </div>

            {showForm && (
                <BookingForm 
                    rooms={rooms}
                    booking={editingBooking} 
                    onClose={() => { setShowForm(false); setEditingBooking(null); }} 
                />
            )}

            <div className="flex gap-4 mb-6 border-b pb-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        className={`px-4 py-1.5 rounded-md ${viewMode === 'calendar' ? 'bg-white shadow font-semibold' : 'text-gray-600'}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        ប្រចាំថ្ងៃ (Daily Calendar)
                    </button>
                    <button 
                        className={`px-4 py-1.5 rounded-md ${viewMode === 'history' ? 'bg-white shadow font-semibold' : 'text-gray-600'}`}
                        onClick={() => setViewMode('history')}
                    >
                        ប្រវត្តិ (History)
                    </button>
                </div>

                {viewMode === 'calendar' && (
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                )}

                <select 
                    value={selectedRoomId} 
                    onChange={(e) => setSelectedRoomId(e.target.value ? Number(e.target.value) : '')}
                    className="p-2 border rounded-md"
                >
                    <option value="">-- បន្ទប់ទាំងអស់ (All Rooms) --</option>
                    {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.room_name_kh} ({r.room_code})</option>
                    ))}
                </select>
            </div>

            {isLoadingBookings ? (
                <div className="p-8 text-center text-gray-500">កំពុងទាញយកទិន្នន័យ...</div>
            ) : filteredBookings.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-900/50">
                    មិនមានទិន្នន័យការកក់បន្ទប់ទេ (No bookings found)
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-200">
                                <th className="p-3 font-semibold text-gray-700">ថ្ងៃខែ (Date)</th>
                                <th className="p-3 font-semibold text-gray-700">ម៉ោង (Time)</th>
                                <th className="p-3 font-semibold text-gray-700">បន្ទប់ (Room)</th>
                                <th className="p-3 font-semibold text-gray-700">កម្មវិធី (Event)</th>
                                <th className="p-3 font-semibold text-gray-700">ស្ថានភាព (Status)</th>
                                <th className="p-3 font-semibold text-gray-700">សកម្មភាព (Actions)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(b => (
                                <tr key={b.id} className="border-b hover:bg-gray-50 dark:bg-gray-900/50">
                                    <td className="p-3">
                                        {new Date(b.booking_date).toLocaleDateString('km-KH')}
                                    </td>
                                    <td className="p-3 font-medium text-blue-700">
                                        {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                                    </td>
                                    <td className="p-3">
                                        <span className="font-bold">{b.room_name_kh}</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-semibold">{b.booking_title_kh}</div>
                                        <div className="text-xs text-gray-500">{b.organizer_name}</div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold
                                            ${b.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                              b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                              b.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {b.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            {b.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(b, 'approved')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">យល់ព្រម</button>
                                                    <button onClick={() => handleUpdateStatus(b, 'rejected')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">បដិសេធ</button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => { setEditingBooking(b); setShowForm(true); }}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                                            >
                                                កែប្រែ
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(b.id)}
                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm"
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

const BookingForm: React.FC<{ rooms: Room[]; booking: Booking | null; onClose: () => void }> = ({ rooms, booking, onClose }) => {
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        roomId: booking?.room_id || '',
        bookingTitleKh: booking?.booking_title_kh || '',
        bookingTitleEn: booking?.booking_title_en || '',
        bookingDate: booking?.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : '',
        startTime: booking?.start_time || '',
        endTime: booking?.end_time || '',
        organizerName: booking?.organizer_name || '',
        organizerContact: '', // Assuming not strictly tracked in history interface
        purpose: booking?.purpose || '',
        status: booking?.status || 'pending'
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (booking) {
                return await api.put(`/schedules/rooms/bookings/${booking.id}`, data);
            } else {
                return await api.post('/schedules/rooms/bookings', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roomBookings'] });
            onClose();
        },
        onError: (err: any) => {
            alert(err.response?.data?.error || 'មានបញ្ហាក្នុងការរក្សាទុក');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            ...formData,
            roomId: Number(formData.roomId)
        });
    };

    return (
        <div className="mb-8 p-5 bg-purple-50 rounded-lg border border-purple-200 relative">
            <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
            <h3 className="text-lg font-bold mb-4">{booking ? 'កែប្រែការកក់ (Edit Booking)' : 'បន្ថែមការកក់បន្ទប់ (New Booking)'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">បន្ទប់ (Room)*</label>
                    <select required className="w-full p-2 border rounded" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                        <option value="">-- ជ្រើសរើស --</option>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name_kh}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ថ្ងៃទី (Date)*</label>
                    <input required type="date" className="w-full p-2 border rounded" value={formData.bookingDate} onChange={e => setFormData({...formData, bookingDate: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ឈ្មោះកម្មវិធី (ខ្មែរ)*</label>
                    <input required type="text" className="w-full p-2 border rounded" value={formData.bookingTitleKh} onChange={e => setFormData({...formData, bookingTitleKh: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ឈ្មោះកម្មវិធី (English)*</label>
                    <input required type="text" className="w-full p-2 border rounded" value={formData.bookingTitleEn} onChange={e => setFormData({...formData, bookingTitleEn: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ចាប់ពីម៉ោង (Start)*</label>
                    <input required type="time" className="w-full p-2 border rounded" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ដល់ម៉ោង (End)*</label>
                    <input required type="time" className="w-full p-2 border rounded" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">អ្នករៀបចំ (Organizer)</label>
                    <input type="text" className="w-full p-2 border rounded" value={formData.organizerName} onChange={e => setFormData({...formData, organizerName: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ស្ថានភាព (Status)</label>
                    <select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as Booking['status']})}>
                        <option value="pending">រង់ចាំ (Pending)</option>
                        <option value="approved">យល់ព្រម (Approved)</option>
                        <option value="rejected">បដិសេធ (Rejected)</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">គោលបំណង (Purpose)</label>
                    <textarea className="w-full p-2 border rounded" rows={2} value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}></textarea>
                </div>
                <div className="md:col-span-2 mt-2">
                    <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 w-full md:w-auto">
                        រក្សាទុក (Save Booking)
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomBooking;
