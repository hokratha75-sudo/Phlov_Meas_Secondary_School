import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
  math: number;
  science: number;
  english: number;
  history: number;
  geography: number;
  total: number;
  average: number;
  rank: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

// Mock data based on the requirements (50 students)
const mockStudents: Student[] = [
  { id: 1, name: "John Doe", gender: "Male", math: 85, science: 78, english: 92, history: 88, geography: 80, total: 423, average: 84.6, rank: 1, grade: "A" },
  { id: 2, name: "Jane Smith", gender: "Female", math: 92, science: 88, english: 95, history: 90, geography: 85, total: 450, average: 90.0, rank: 2, grade: "A" },
  { id: 3, name: "Michael Johnson", gender: "Male", math: 45, science: 52, english: 48, history: 50, geography: 40, total: 235, average: 47.0, rank: 48, grade: "F" },
  { id: 4, name: "Emily Davis", gender: "Female", math: 78, science: 82, english: 75, history: 80, geography: 70, total: 385, average: 77.0, rank: 15, grade: "C" },
  { id: 5, name: "David Wilson", gender: "Male", math: 65, science: 70, english: 68, history: 72, geography: 60, total: 335, average: 67.0, rank: 30, grade: "D" },
  // Adding more mock data to reach 50 students with the specified distribution
  ...Array.from({ length: 45 }, (_, i) => ({
    id: i + 6,
    name: `Student ${i + 6}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    math: Math.floor(Math.random() * 40) + 60, // 60-100
    science: Math.floor(Math.random() * 40) + 60,
    english: Math.floor(Math.random() * 40) + 60,
    history: Math.floor(Math.random() * 40) + 60,
    geography: Math.floor(Math.random() * 40) + 60,
    total: 0,
    average: 0,
    rank: i + 6,
    grade: "F" // Will calculate properly below
  }))
].map((student, index) => {
  // Calculate total and average
  const total = student.math + student.science + student.english + student.history + student.geography;
  const average = total / 5;

  // Determine grade based on average
  let grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  if (average >= 90) grade = 'A';
  else if (average >= 80) grade = 'B';
  else if (average >= 70) grade = 'C';
  else if (average >= 60) grade = 'D';
  else if (average >= 50) grade = 'E';
  else grade = 'F';

  return {
    ...student,
    total,
    average,
    grade
  };
});

// Sort by average descending for ranking
mockStudents.sort((a, b) => b.average - a.average);
// Assign ranks
mockStudents.forEach((student, index) => {
  student.rank = index + 1;
});

export function DetailedScoreTable() {
  return (
    <div className="space-y-6">
      <TableCaption className="text-lg font-semibold text-left">
        តារាងពិន្ទុលម្អិតប្រចាំខែ
      </TableCaption>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ល.រ
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              គោត្តនាម និង នាម
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ភេទ
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              គណិតវិទ្យា
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              រូបវិទ្យា
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              អង់គ្លេស
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ប្រវត្តិវិទ្យា
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ភូមិវិទ្យា
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ពិន្ទុរួម
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              មធ្យមភាគ
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ចំណាត់ថ្នាក់
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              និទ្ទេស
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {mockStudents.map((student) => (
            <TableRow
              key={student.id}
              className={student.grade === 'F' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
            >
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {student.id}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.name}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.gender === 'Male' ? 'ប្រុស' : 'ស្រី'}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.math}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.science}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.english}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.history}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.geography}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.total}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.average.toFixed(1)}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.rank}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                <Badge
                  variant={student.grade === 'F' ? 'destructive' : 'secondary'}
                  className={student.grade === 'F' ? 'text-white' : undefined}
                >
                  {student.grade}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}