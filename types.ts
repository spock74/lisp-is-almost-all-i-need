// Types definition for Parens & Power
export type Language = 'en' | 'pt-BR';

export interface LocalizedContent {
  en: string;
  'pt-BR': string;
}

export interface Lesson {
  id: string;
  title: LocalizedContent;
  description: LocalizedContent;
  content: LocalizedContent; // Markdown-like text
  initialCode: string;
  order: number;
}

export interface I18nStrings {
  title: string;
  subtitle: string;
  startCourse: string;
  adminPanel: string;
  language: string;
  runCode: string;
  output: string;
  nextLesson: string;
  prevLesson: string;
  backToCourse: string;
  editLesson: string;
  createLesson: string;
  save: string;
  cancel: string;
  delete: string;
  help: string;
  helpContent: string;
  replPlaceholder: string;
  lessonTitle: string;
  lessonContent: string;
  codeExample: string;
  syntaxError: string;
  result: string;
  syllabus: string;
}

// Lisp Interpreter Types
// Using 'any' for Env to avoid circular type issues in this interface definition
export type LispVal = 
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'symbol'; value: string }
  | { type: 'list'; value: LispVal[] }
  | { type: 'function'; value: (args: LispVal[]) => LispVal; env?: any }
  | { type: 'bool'; value: boolean }
  | { type: 'macro'; args: string[]; body: LispVal[]; env: any }; // Modified to support multiple body expressions