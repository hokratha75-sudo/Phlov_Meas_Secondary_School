import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface StudentSummary {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
  total: number;
  average: number;
  rank: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

// Mock data for 50 students with the specified grade distribution
const mockStudentsSummary: StudentSummary[] = [
  // A grade: 4% of 50 = 2 students
  { id: 1, name: "Top Student A", gender: "Female", total: 450, average: 90.0, rank: 1, grade: "A" },
  { id: 2, name: "Top Student B", gender: "Male", total: 445, average: 89.0, rank: 2, grade: "A" },

  // B grade: 0% of 50 = 0 students
  // C grade: 16% of 50 = 8 students
  { id: 3, name: "C Student 1", gender: "Female", total: 380, average: 76.0, rank: 3, grade: "C" },
  { id: 4, name: "C Student 2", gender: "Male", total: 375, average: 75.0, rank: 4, grade: "C" },
  { id: 5, name: "C Student 3", gender: "Female", total: 370, average: 74.0, rank: 5, grade: "C" },
  { id: 6, name: "C Student 4", gender: "Male", total: 365, average: 73.0, rank: 6, grade: "C" },
  { id: 7, name: "C Student 5", gender: "Female", total: 360, average: 72.0, rank: 7, grade: "C" },
  { id: 8, name: "C Student 6", gender: "Male", total: 355, average: 71.0, rank: 8, grade: "C" },
  { id: 9, name: "C Student 7", gender: "Female", total: 350, average: 70.0, rank: 9, grade: "C" },
  { id: 10, name: "C Student 8", gender: "Male", total: 345, average: 69.0, rank: 10, grade: "C" },

  // D grade: 22% of 50 = 11 students (IDs 11-21)
  ...Array.from({ length: 11 }, (_, i) => ({
    id: 11 + i,
    name: `D Student ${i + 1}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    total: 320 - (i * 5), // Decreasing scores
    average: 64 - (i * 1),
    rank: 11 + i,
    grade: "D" as const
  })),

  // E grade: 28% of 50 = 14 students (IDs 22-35)
  ...Array.from({ length: 14 }, (_, i) => ({
    id: 22 + i,
    name: `E Student ${i + 1}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    total: 280 - (i * 4),
    average: 56 - (i * 0.8),
    rank: 22 + i,
    grade: "E" as const
  })),

  // F grade: 30% of 50 = 15 students (IDs 36-50)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: 36 + i,
    name: `F Student ${i + 1}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    total: 220 - (i * 3),
    average: 44 - (i * 0.6),
    rank: 36 + i,
    grade: "F" as const
  }))
];

export function MonthlyRankingSummary() {
  // Calculate statistics
  const totalStudents = mockStudentsSummary.length;
  const femaleCount = mockStudentsSummary.filter(s => s.gender === 'Female').length;
  const passedCount = mockStudentsSummary.filter(s => s.grade !== 'F').length;
  const failedCount = totalStudents - passedCount;

  const gradeCounts = {
    A: mockStudentsSummary.filter(s => s.grade === 'A').length,
    B: mockStudentsSummary.filter(s => s.grade === 'B').length,
    C: mockStudentsSummary.filter(s => s.grade === 'C').length,
    D: mockStudentsSummary.filter(s => s.grade === 'D').length,
    E: mockStudentsSummary.filter(s => s.grade === 'E').length,
    F: mockStudentsSummary.filter(s => s.grade === 'F').length
  };

  // Split into columns for compact layout (3 columns)
  const columnCount = 3;
  const studentsPerColumn = Math.ceil(totalStudents / columnCount);
  const columns: StudentSummary[][] = [];

  for (let i = 0; i < columnCount; i++) {
    const start = i * studentsPerColumn;
    const end = start + studentsPerColumn;
    columns.push(mockStudentsSummary.slice(start, end));
  }

  return (
    <div className="space-y-6">
      <TableCaption className="text-lg font-semibold text-left">
        សម្រាប់សម្រាប់ថ្ងៃទី១ នៃខែ
      </TableCaption>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column, columnIndex) => (
          <Table key={columnIndex} className="w-full">
            <TableBody className="divide-y divide-gray-200">
              {column.map((student) => (
                <TableRow
                  key={student.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="px-4 py-3 text-sm font-medium text-gray-900 w-8">
                    {student.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900 w-24">
                    {student.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900 w-10">
                    {student.gender === 'Male' ? 'ប្រុស' : 'ស្រី'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900 w-10">
                    {student.total}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900 w-10">
                    {student.average.toFixed(1)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-900 w-8">
                    {student.rank}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <Badge
                      variant={
                        student.grade === 'F' ? 'destructive' :
                        student.grade === 'A' || student.grade === 'B' ? 'primary' :
                        student.grade === 'C' || student.grade === 'D' ? 'secondary' : 'outline'
                      }
                      className="text-xs px-2.5 py-0.5"
                    >
                      {student.grade}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="border-t pt-6 space-y-4">
        <div className="text-sm font-medium text-gray-700">
          សំណួរស្ថិតិ
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="border rounded-lg p-4">
            <div className="text-gray-500">សរុបស្តុក</div>
            <div className="font-semibold text-2xl">{totalStudents}</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-gray-500">សំខាន់ភេទ</div>
            <div className="font-semibold">ស្រី: {femaleCount} ({Math.round((femaleCount/totalStudents)*100)}%)</div>
            <div className="text-sm text-gray-600">ប្រុស: {totalStudents - femaleCount} ({Math.round(((totalStudents-femaleCount)/totalStudents)*100)}%)</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-gray-500">អត្ថបទស្ថិតិឆ្នាំ/បរិស្ថាន</div>
            <div className="font-semibold text-green-600">បាន: {passedCount} ({Math.round((passedCount/totalStudents)*100)}%)</div>
            <div className="text-sm text-red-600">មិនបាន: {failedCount} ({Math.round((failedCount/totalStudents)*100)}%)</div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">សំណួរស្ថិតិស្ថានភាព</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[['A', 'B'], ['C', 'D'], ['E', 'F']].map(([grade1, grade2]) => (
              <div key={`${grade1}-${grade2}`} className="flex items-center gap-4">
                <div className="w-8">
                  <span className="inline-block h-2 w-2 rounded
                    {grade1 === 'A' || grade1 === 'B' ? 'bg-primary' :
                     grade1 === 'C' || grade1 === 'D' ? 'bg-secondary' :
                     grade1 === 'E' ? 'bg-warning' : 'bg-destructive'}"></span>
                </div>
                <div className="flex-1">
                  <span className="font-medium">{grade1}:</span>
                  <span className="ml-2">{gradeCounts[grade1 as keyof typeof gradeCounts]} ({Math.round((gradeCounts[grade1 as keyof typeof gradeCounts]/totalStudents)*100)}%)</span>
                </div>
              </div>
            ))}
            {[['A', 'B'], ['C', 'D'], ['E', 'F']].map(([grade1, grade2]) => (
              <div key={`${grade1}-${grade2}-2`} className="flex items-center gap-4">
                <div className="w-8">
                  <span className="inline-block h-2 w-2 rounded
                    {grade2 === 'A' || grade2 === 'B' ? 'bg-primary' :
                     grade2 === 'C' || grade2 === 'D' ? 'bg-secondary' :
                     grade2 === 'E' ? 'bg-warning' : 'bg-destructive'}"></span>
                </div>
                <div className="flex-1">
                  <span className="font-medium">{grade2}:</span>
                  <span className="ml-2">{gradeCounts[grade2 as keyof typeof gradeCounts]} ({Math.round((gradeCounts[grade2 as keyof typeof gradeCounts]/totalStudents)*100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}