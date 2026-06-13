import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';

interface TimeSlot {
    period: number;
    startTime: string;
    endTime: string;
    subject?: string;
    teacher?: string;
    room?: string;
}

interface TimetableProps {
    classId: string;
    semester: string;
    academicYear: number;
}

const Timetable: React.FC<TimetableProps> = ({ classId, semester, academicYear }) => {
    const [schedule, setSchedule] = useState<Record<string, TimeSlot[]>>({});
    const [loading, setLoading] = useState(true);
    
    const weekdays = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];
    
    useEffect(() => {
        if (classId) {
            fetchSchedule();
        }
    }, [classId, semester, academicYear]);
    
    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/schedules/class/${classId}`, {
                params: { semester, academicYear }
            });
            
            // Organize by weekday
            const organized: Record<string, TimeSlot[]> = {};
            response.data.forEach((item: any) => {
                if (!organized[item.day_name_kh]) {
                    organized[item.day_name_kh] = [];
                }
                organized[item.day_name_kh].push({
                    period: item.period_number,
                    startTime: item.start_time.slice(0, 5),
                    endTime: item.end_time.slice(0, 5),
                    subject: item.subject_name,
                    teacher: item.teacher_name,
                    room: item.room_code
                });
            });
            setSchedule(organized);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const getCellContent = (day: string, period: number) => {
        const daySchedule = schedule[day];
        if (!daySchedule) return null;
        return daySchedule.find(slot => slot.period === period);
    };
    
    if (loading) {
        return <div className="flex justify-center p-8">កំពុងទាញយកកាលវិភាគ... (Loading timetable...)</div>;
    }
    
    return (
        <div className="timetable-container">
            <style>{`
                .timetable-container {
                    font-family: 'Noto Sans Khmer', sans-serif;
                    overflow-x: auto;
                }
                .timetable-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .timetable-table th {
                    background: #1e3a5f;
                    color: white;
                    padding: 12px;
                    text-align: center;
                    font-weight: 600;
                }
                .timetable-table td {
                    border: 1px solid #e2e8f0;
                    padding: 12px;
                    vertical-align: top;
                    min-width: 100px;
                }
                .period-cell {
                    background: #f8fafc;
                    font-weight: 600;
                    text-align: center;
                }
                .subject-cell {
                    background: white;
                }
                .subject-name {
                    font-weight: 600;
                    color: #1e3a5f;
                }
                .teacher-name, .room-code {
                    font-size: 11px;
                    color: #64748b;
                    margin-top: 4px;
                }
                .empty-cell {
                    background: #f1f5f9;
                    color: #94a3b8;
                    text-align: center;
                }
                @media print {
                    .timetable-container {
                        margin: 0;
                        padding: 0;
                    }
                    .no-print { display: none; }
                }
            `}</style>
            
            <table className="timetable-table">
                <thead>
                    <tr>
                        <th>ម៉ោង</th>
                        {weekdays.map(day => <th key={day}>{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {periods.map(period => {
                        // Find any existing period time to show or use default
                        let periodTimeStr = "";
                        for (const day of weekdays) {
                            const found = schedule[day]?.find(s => s.period === period);
                            if (found) {
                                periodTimeStr = `${found.startTime} - ${found.endTime}`;
                                break;
                            }
                        }
                        
                        return (
                            <tr key={period}>
                                <td className="period-cell">
                                    <div>ម៉ោង {period}</div>
                                    {periodTimeStr && (
                                        <div className="text-xs text-gray-500">
                                            {periodTimeStr}
                                        </div>
                                    )}
                                </td>
                                {weekdays.map(day => {
                                    const cell = getCellContent(day, period);
                                    return (
                                        <td key={day} className={cell ? 'subject-cell' : 'empty-cell'}>
                                            {cell ? (
                                                <div>
                                                    <div className="subject-name">{cell.subject}</div>
                                                    <div className="teacher-name">គ្រូ៖ {cell.teacher}</div>
                                                    <div className="room-code">បន្ទប់៖ {cell.room}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm">- ទំនេរ -</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Timetable;
