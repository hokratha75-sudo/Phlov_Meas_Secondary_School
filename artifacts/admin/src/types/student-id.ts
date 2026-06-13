export interface ExactStudentData {
  id: string;
  nameKh: string;
  nameEn?: string;
  gender: string;
  dob: string;
  grade: string;
  academicYear: string;
  phone: string;
  photo?: string;
  qrCodeUrl?: string;
  birthPlace: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  currentAddress: string;
}

export interface ExactTemplateData {
  department: string;
  schoolNameKh: string;
  schoolNameEn: string;
  slogan: string;
  principalName: string;
  logo: string;
  frontBg: string;
  backBg: string;
  signature?: string;
  stamp?: string;
  issueDate: string;
  expiryDate: string;
  khmerDate: string;
  issueLocation: string;
  theme: string;
  layout: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  headerBg: string;
  textColor: string;
  titleColor: string;
}

export interface CardProps {
  student: ExactStudentData;
  template: ExactTemplateData;
  theme: ThemeConfig;
}
