import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Users, Loader2, AlertCircle, BookOpen, GraduationCap } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../lib/axiosConfig';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

interface TeacherLoad {
  teacherId: number;
  teacherName: string;
  totalHours: number;
  subjects: string[];
  classes: string[];
}

export default function TeacherLoadSummary() {
  const { data, isLoading, error } = useQuery<TeacherLoad[]>({
    queryKey: ['schedules', 'teacher-load'],
    queryFn: async () => {
      const res = await api.get('/schedules/teacher-load');
      return res.data;
    }
  });

  const handleExport = () => {
    if (!data) return;

    const exportData = data.map(item => ({
      'ឈ្មោះគ្រូបង្រៀន (Teacher)': item.teacherName,
      'ម៉ោងបង្រៀនសរុប (Total Hours)': item.totalHours,
      'មុខវិជ្ជា (Subjects)': item.subjects.join(', '),
      'ថ្នាក់បង្រៀន (Classes)': item.classes.join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Teacher Load');

    // Customize header style if needed, but XLSX simple usage generates raw data.
    XLSX.writeFile(workbook, 'teacher_load_summary.xlsx');
  };

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
        <AlertDescription>Failed to load teacher load summary.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            របាយការណ៍ម៉ោងបង្រៀន
          </h1>
          <p className="text-gray-500 mt-1">Teacher Load Summary</p>
        </div>
        
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 shadow-md transition-all">
          <Download className="w-4 h-4 mr-2" /> Export to Excel
        </Button>
      </div>

      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="bg-gray-50/50 pb-4">
          <CardTitle className="text-lg">សង្ខេបម៉ោងបង្រៀនរបស់គ្រូម្នាក់ៗ</CardTitle>
          <CardDescription>ទិន្នន័យត្រូវបានគណនាពីកាលវិភាគរួម (Master Timetable)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100/80 border-y">
                <tr>
                  <th className="px-6 py-4 font-semibold w-16 text-center">#</th>
                  <th className="px-6 py-4 font-semibold w-64">ឈ្មោះគ្រូបង្រៀន</th>
                  <th className="px-6 py-4 font-semibold text-center w-32">ម៉ោងសរុប</th>
                  <th className="px-6 py-4 font-semibold">ថ្នាក់បង្រៀន</th>
                  <th className="px-6 py-4 font-semibold">មុខវិជ្ជា</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.map((teacher, index) => (
                  <tr key={teacher.teacherId} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-base">
                      {teacher.teacherName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                        {teacher.totalHours} ម៉ោង
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.classes.map(cls => (
                          <span key={cls} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <GraduationCap className="w-3 h-3 mr-1 opacity-70" />
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.subjects.map(sub => (
                          <span key={sub} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <BookOpen className="w-3 h-3 mr-1 opacity-70" />
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                        <p>មិនមានទិន្នន័យគ្រូបង្រៀននៅក្នុងកាលវិភាគទេ</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
