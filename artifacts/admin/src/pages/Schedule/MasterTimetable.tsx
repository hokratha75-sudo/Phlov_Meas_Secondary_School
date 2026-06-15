import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Download, Upload, Trash2, FileSpreadsheet, Plus, AlertCircle, 
  Search, Filter, Printer, Loader2 
} from 'lucide-react';
import api from '../../lib/axiosConfig';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '../../components/ui/alert-dialog';
import { useToast } from '../../hooks/use-toast';

interface ScheduleEntry {
  id: number;
  class_id: number;
  class_name: string;
  homeroom_teacher: string;
  total_hours: string;
  day_code: string;
  day_name_kh: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string;
  room_code: string;
}

const DAYS_ORDER = ['M', 'T', 'W', 'R', 'F', 'S'];
const DAYS_MAP: Record<string, string> = {
  'M': 'ចន្ទ',
  'T': 'អង្គារ',
  'W': 'ពុធ',
  'R': 'ព្រហស្បតិ៍',
  'F': 'សុក្រ',
  'S': 'សៅរ៍'
};

export default function MasterTimetable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isImporting, setIsImporting] = useState(false);

  // Fetch Master Schedule
  const { data: schedulesData, isLoading, error } = useQuery({
    queryKey: ['schedules', 'master'],
    queryFn: async () => {
      const res = await api.get('/schedules/master');
      return res.data;
    }
  });

  // Extract unique classes
  const classesList = useMemo(() => {
    if (!schedulesData) return [];
    return Object.keys(schedulesData).sort();
  }, [schedulesData]);

  // Compute conflicts (Teacher/Room double bookings)
  const conflicts = useMemo(() => {
    if (!schedulesData) return { teachers: new Set(), rooms: new Set() };
    
    const teacherMap: Record<string, string[]> = {}; // "day-period-teacher" -> [classNames]
    const roomMap: Record<string, string[]> = {};    // "day-period-room" -> [classNames]
    
    Object.values(schedulesData as Record<string, any>).forEach(cls => {
      Object.entries(cls.days || {}).forEach(([day, periods]: [string, any]) => {
        Object.entries(periods).forEach(([period, details]: [string, any]) => {
          const tKey = `${day}-${period}-${details.teacher}`;
          const rKey = `${day}-${period}-${details.room}`;
          
          if (!teacherMap[tKey]) teacherMap[tKey] = [];
          teacherMap[tKey].push(cls.className);
          
          if (!roomMap[rKey]) roomMap[rKey] = [];
          roomMap[rKey].push(cls.className);
        });
      });
    });

    const conflictTeachers = new Set<string>();
    const conflictRooms = new Set<string>();

    Object.entries(teacherMap).forEach(([key, classes]) => {
      if (classes.length > 1) conflictTeachers.add(key);
    });
    Object.entries(roomMap).forEach(([key, classes]) => {
      if (classes.length > 1) conflictRooms.add(key);
    });

    return { teachers: conflictTeachers, rooms: conflictRooms };
  }, [schedulesData]);

  // Handle Export Combined
  const handleExportCombined = () => {
    window.open(api.defaults.baseURL + '/schedules/export/combined', '_blank');
  };

  // Handle Export Template
  const handleExportTemplate = () => {
    window.open(api.defaults.baseURL + '/schedules/export/template', '_blank');
  };

  // Handle Import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/schedules/import', formData);
      
      let desc = `ជោគជ័យ: ${res.data.successCount}, បរាជ័យ: ${res.data.failedCount}`;
      if (res.data.failedCount > 0 && res.data.errors) {
        const firstFew = res.data.errors.slice(0, 3).map((e: any) => `ជួរទី ${e.row}: ${e.error} ${e.message ? '('+e.message+')' : ''}`).join('\n');
        desc += `\n\nបញ្ហា:\n${firstFew}`;
        if (res.data.errors.length > 3) desc += `\n... ព្រមទាំង ${res.data.errors.length - 3} បញ្ហាផ្សេងទៀត។`;
      }
      
      toast({
        title: res.data.failedCount > 0 ? "មានកំហុសខ្លះក្នុងការនាំចូល" : "នាំចូលជោគជ័យ",
        description: <div className="whitespace-pre-line">{desc}</div>,
        variant: res.data.failedCount > 0 ? "destructive" : "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ['schedules', 'master'] });
    } catch (err: any) {
      const respData = err.response?.data;
      let desc = respData?.error || err.message;
      
      if (respData?.errors && respData.errors.length > 0) {
        const firstFew = respData.errors.slice(0, 3).map((e: any) => `ជួរទី ${e.row}: ${e.error} ${e.message ? '('+e.message+')' : ''}`).join('\n');
        desc += `\n\nបញ្ហា:\n${firstFew}`;
        if (respData.errors.length > 3) desc += `\n... ព្រមទាំង ${respData.errors.length - 3} បញ្ហាផ្សេងទៀត។`;
      }

      toast({
        title: "បរាជ័យក្នុងការនាំចូល",
        description: <div className="whitespace-pre-line">{desc}</div>,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Delete All
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete('/schedules/batch?confirmAll=true');
    },
    onSuccess: () => {
      toast({ title: "លុបជោគជ័យ", description: "កាលវិភាគទាំងអស់ត្រូវបានលុប។" });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'master'] });
    },
    onError: (err: any) => {
      toast({ title: "បរាជ័យ", description: "មិនអាចលុបកាលវិភាគបានទេ។", variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load master schedule.</AlertDescription>
      </Alert>
    );
  }

  const displayData = selectedClass === 'all' 
    ? schedulesData 
    : { [selectedClass]: schedulesData[selectedClass] };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">កាលវិភាគរួម (Master Timetable)</h1>
          <p className="text-gray-500 mt-1">គ្រប់គ្រងកាលវិភាគសម្រាប់គ្រប់ថ្នាក់ទាំងអស់</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> លុបទាំងអស់
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>តើអ្នកពិតជាចង់លុបកាលវិភាគទាំងអស់មែនទេ?</AlertDialogTitle>
                <AlertDialogDescription>
                  សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ វានឹងលុបកាលវិភាគសម្រាប់គ្រប់ថ្នាក់ទាំងអស់ជាអចិន្ត្រៃយ៍។
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>បោះបង់</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-red-600">
                  យល់ព្រមលុប
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleExportTemplate}>
            <Download className="w-4 h-4 mr-2" /> ទាញយកទម្រង់
          </Button>

          <input type="file" accept=".xlsx" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} 
            នាំចូល Excel
          </Button>

          <Button variant="outline" onClick={handleExportCombined}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Export រួម
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>តារាងកាលវិភាគ</CardTitle>
            <div className="w-64">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="ជ្រើសរើសថ្នាក់" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ទាំងអស់ (All Classes)</SelectItem>
                  {classesList.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-gray-50 border-r z-10 w-24">ថ្នាក់</th>
                <th className="px-4 py-3 w-32 border-r">គ្រូបន្ទុកថ្នាក់</th>
                {DAYS_ORDER.map(d => (
                  <th key={d} className="px-4 py-3 border-r min-w-[180px]">{DAYS_MAP[d]}</th>
                ))}
                <th className="px-4 py-3 text-center">ម៉ោងសរុប</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(displayData || {}).map(([className, classData]: [string, any]) => (
                <tr key={className} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold sticky left-0 bg-white border-r z-10 text-center text-lg">{className}</td>
                  <td className="px-4 py-3 border-r text-gray-600 font-medium">
                    {classData.homeroomTeacher || 'N/A'}
                  </td>
                  {DAYS_ORDER.map(d => {
                    const dayData = classData.days?.[DAYS_MAP[d]];
                    return (
                      <td key={d} className="px-2 py-2 border-r align-top">
                        {dayData ? (
                          <div className="flex flex-col gap-1">
                            {Object.entries(dayData).map(([period, details]: [string, any]) => {
                              const tKey = `${DAYS_MAP[d]}-${period}-${details.teacher}`;
                              const rKey = `${DAYS_MAP[d]}-${period}-${details.room}`;
                              const hasConflict = conflicts.teachers.has(tKey) || conflicts.rooms.has(rKey);
                              
                              return (
                                <div 
                                  key={period} 
                                  className={`p-2 rounded text-xs border ${
                                    hasConflict 
                                      ? 'bg-red-50 border-red-200 text-red-800' 
                                      : 'bg-white border-gray-200'
                                  }`}
                                >
                                  <div className="font-semibold flex justify-between">
                                    <span className="text-blue-700">P{period}: {details.subject}</span>
                                    <span className="text-gray-500">[{details.room}]</span>
                                  </div>
                                  <div className="text-gray-600 mt-0.5">{details.teacher}</div>
                                  {hasConflict && (
                                    <div className="text-[10px] text-red-600 font-semibold mt-1 flex items-center">
                                      <AlertCircle className="w-3 h-3 mr-1 inline" /> ជាន់ម៉ោង
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-gray-300 text-center italic py-4">-</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center font-bold text-blue-600 text-lg">
                    {classData.totalHours}
                  </td>
                </tr>
              ))}
              {(!displayData || Object.keys(displayData).length === 0) && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    មិនមានទិន្នន័យកាលវិភាគទេ (No schedule data found)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
