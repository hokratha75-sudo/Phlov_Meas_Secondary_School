import { ExactStudentData, ExactTemplateData } from '@/types/student-id';

// ─────────────────────────────────────────────────────────────────
// Template Engine — resolves {{token}} placeholders to real values
// ─────────────────────────────────────────────────────────────────

type DataContext = {
  student: ExactStudentData;
  template: ExactTemplateData;
};

/** Build a flat lookup map from the context */
function buildLookup(ctx: DataContext): Record<string, string> {
  const { student: s, template: t } = ctx;
  return {
    // Student fields
    'student.id':             s.id,
    'student.nameKh':         s.nameKh,
    'student.nameEn':         s.nameEn || '',
    'student.gender':         s.gender,
    'student.dob':            s.dob,
    'student.grade':          s.grade,
    'student.academicYear':   s.academicYear,
    'student.phone':          s.phone,
    'student.birthPlace':     s.birthPlace,
    'student.fatherName':     s.fatherName,
    'student.motherName':     s.motherName,
    'student.parentPhone':    s.parentPhone,
    'student.currentAddress': s.currentAddress,
    'student.photo':          s.photo || '',
    'student.qrCodeUrl':      s.qrCodeUrl || '',
    // Template / School fields
    'template.department':    t.department,
    'template.schoolNameKh':  t.schoolNameKh,
    'template.schoolNameEn':  t.schoolNameEn,
    'template.slogan':        t.slogan,
    'template.principalName': t.principalName,
    'template.logo':          t.logo,
    'template.issueDate':     t.issueDate,
    'template.expiryDate':    t.expiryDate,
    'template.khmerDate':     t.khmerDate,
    'template.issueLocation': t.issueLocation,
  };
}

/**
 * Resolve a string that may contain zero or more {{token}} placeholders.
 *
 * Examples:
 *   resolveContent('{{student.nameKh}}', ctx)  →  "សុខ សុផាត"
 *   resolveContent('ID: {{student.id}}', ctx)  →  "ID: S-2024-001"
 *   resolveContent('Hello World', ctx)          →  "Hello World"
 */
export function resolveContent(input: string, ctx: DataContext): string {
  const lookup = buildLookup(ctx);
  return input.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
    const trimmed = key.trim();
    return lookup[trimmed] ?? `{{${trimmed}}}`;
  });
}

/**
 * Resolve just a data key (no braces).
 * Used when an element has `dataKey = "student.photo"`.
 *
 * Returns the raw value (could be a URL string).
 */
export function resolveDataKey(dataKey: string, ctx: DataContext): string {
  const lookup = buildLookup(ctx);
  return lookup[dataKey.trim()] ?? '';
}

/**
 * Resolve content for an element:
 * - If element has a dataKey, use it to override the content field
 * - Otherwise resolve any {{tokens}} in the content string
 */
export function resolveElementContent(
  content: string,
  dataKey: string | undefined,
  ctx: DataContext
): string {
  if (dataKey) {
    return resolveDataKey(dataKey, ctx);
  }
  return resolveContent(content, ctx);
}

/**
 * Get all available token keys as a flat list.
 * Useful for autocomplete in the Properties Panel.
 */
export function getAvailableTokens(ctx: DataContext): string[] {
  return Object.keys(buildLookup(ctx));
}
