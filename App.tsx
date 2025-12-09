import React, { useState, useEffect, useMemo, useRef } from 'react';
import { dictionary, initialLessons } from './data';
import { Language, Lesson } from './types';
import { runLisp } from './lispInterpreter';
import { 
  Terminal, 
  BookOpen, 
  Settings, 
  HelpCircle, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Code,
  Globe,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const base = "px-4 py-2 rounded font-mono font-bold transition-all flex items-center gap-2";
  const styles = {
    primary: "bg-lisp-accent hover:bg-violet-600 text-white",
    secondary: "bg-lisp-panel hover:bg-slate-700 text-lisp-text border border-slate-600",
    danger: "bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800",
    ghost: "hover:bg-slate-800 text-slate-400 hover:text-white"
  };
  return (
    <button className={`${base} ${styles[variant as keyof typeof styles]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

const Header = ({ 
  currentLang, 
  setLang, 
  setView, 
  strings 
}: { 
  currentLang: Language, 
  setLang: (l: Language) => void, 
  setView: (v: string) => void,
  strings: any 
}) => (
  <header className="bg-lisp-bg border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
      <div className="bg-lisp-accent p-2 rounded-lg text-white">
        <Terminal size={24} />
      </div>
      <div>
        <h1 className="text-xl font-bold font-fira tracking-tight text-white">{strings.title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">{strings.subtitle}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <nav className="hidden md:flex gap-2">
        <Button variant="ghost" onClick={() => setView('home')}>{strings.syllabus}</Button>
        <Button variant="ghost" onClick={() => setView('admin')}>{strings.adminPanel}</Button>
        <Button variant="ghost" onClick={() => setView('help')}><HelpCircle size={18} /></Button>
      </nav>
      
      <div className="flex items-center bg-slate-800 rounded p-1 border border-slate-700">
        <Globe size={16} className="ml-2 text-slate-400" />
        <select 
          value={currentLang} 
          onChange={(e) => setLang(e.target.value as Language)}
          className="bg-transparent text-sm text-slate-200 p-1 outline-none font-mono cursor-pointer"
        >
          <option value="en">EN</option>
          <option value="pt-BR">PT-BR</option>
        </select>
      </div>
    </div>
  </header>
);

// --- Syntax Highlighting ---

const HighlightedCode = ({ code }: { code: string }) => {
  const tokens = useMemo(() => {
    const res: React.ReactNode[] = [];
    let rest = code;
    let i = 0;

    while (rest.length > 0) {
      // Comments
      if (rest.startsWith(';')) {
        const match = rest.match(/^;[^\n]*/);
        if (match) {
          res.push(<span key={i++} className="text-slate-500 italic">{match[0]}</span>);
          rest = rest.slice(match[0].length);
          continue;
        }
      }
      
      // Strings
      if (rest.startsWith('"')) {
        const match = rest.match(/^"[^"]*"/);
        if (match) {
          res.push(<span key={i++} className="text-yellow-300">{match[0]}</span>);
          rest = rest.slice(match[0].length);
          continue;
        }
      }

      // Numbers
      const numMatch = rest.match(/^-?\d+(\.\d+)?/);
      if (numMatch && (rest.length === numMatch[0].length || /[\s()]/.test(rest[numMatch[0].length]))) {
          res.push(<span key={i++} className="text-orange-400">{numMatch[0]}</span>);
          rest = rest.slice(numMatch[0].length);
          continue;
      }

      // Parentheses
      if (rest[0] === '(' || rest[0] === ')') {
        res.push(<span key={i++} className="text-slate-500">{rest[0]}</span>);
        rest = rest.slice(1);
        continue;
      }

      // Whitespace
      const wsMatch = rest.match(/^\s+/);
      if (wsMatch) {
        res.push(<span key={i++}>{wsMatch[0]}</span>);
        rest = rest.slice(wsMatch[0].length);
        continue;
      }

      // Symbols/Keywords
      const symMatch = rest.match(/^[^()\s]+/);
      if (symMatch) {
        const word = symMatch[0];
        let className = "text-slate-300";
        if (['def', 'define', 'lambda', 'if', 'quote', 'defmacro', 'cond', 'let'].includes(word)) {
          className = "text-violet-400 font-bold";
        } else if (['+', '-', '*', '/', 'list', 'car', 'cdr', 'cons', 'print', 't', 'nil'].includes(word)) {
          className = "text-blue-400";
        }
        res.push(<span key={i++} className={className}>{word}</span>);
        rest = rest.slice(word.length);
        continue;
      }

      // Fallback
      res.push(<span key={i++}>{rest[0]}</span>);
      rest = rest.slice(1);
    }
    return res;
  }, [code]);

  return <>{tokens}</>;
};

const CodeEditor = ({ value, onChange, placeholder, onKeyDown }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative flex-1 bg-[#0f172a] overflow-hidden">
       <pre 
          ref={preRef}
          className="absolute inset-0 p-4 m-0 pointer-events-none font-fira text-sm whitespace-pre-wrap break-all overflow-hidden"
          style={{ fontFamily: 'Fira Code, monospace' }}
       >
          <HighlightedCode code={value || ''} />
          <br />
       </pre>
       <textarea
          ref={textareaRef}
          className="absolute inset-0 w-full h-full p-4 m-0 bg-transparent text-transparent caret-white outline-none resize-none font-fira text-sm whitespace-pre-wrap break-all overflow-auto"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          style={{ fontFamily: 'Fira Code, monospace' }}
        />
    </div>
  );
};

const Repl = ({ initialCode, strings }: { initialCode: string, strings: any }) => {
  const [input, setInput] = useState(initialCode);
  const [output, setOutput] = useState("");
  
  // History State
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState("");

  useEffect(() => {
    setInput(initialCode);
    setOutput("");
    setHistoryIndex(-1);
    setTempInput("");
  }, [initialCode]);

  const handleRun = () => {
    const res = runLisp(input);
    setOutput(res);
    
    const trimmed = input.trim();
    if (trimmed) {
      setHistory(prev => {
        if (prev.length === 0 || prev[prev.length - 1] !== trimmed) {
          return [...prev, trimmed];
        }
        return prev;
      });
    }
    setHistoryIndex(-1);
    setTempInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp') {
        const target = e.target as HTMLTextAreaElement;
        // Check if cursor is on the first line
        const upToCursor = input.substring(0, target.selectionStart);
        const isFirstLine = upToCursor.indexOf('\n') === -1;

        if (isFirstLine && history.length > 0) {
            e.preventDefault();
            if (historyIndex === -1) {
                setTempInput(input);
                const newIdx = history.length - 1;
                setHistoryIndex(newIdx);
                setInput(history[newIdx]);
            } else if (historyIndex > 0) {
                const newIdx = historyIndex - 1;
                setHistoryIndex(newIdx);
                setInput(history[newIdx]);
            }
        }
    } else if (e.key === 'ArrowDown') {
        const target = e.target as HTMLTextAreaElement;
        // Check if cursor is on the last line
        const fromCursor = input.substring(target.selectionEnd);
        const isLastLine = fromCursor.indexOf('\n') === -1;

        if (isLastLine && historyIndex !== -1) {
             e.preventDefault();
             if (historyIndex < history.length - 1) {
                 const newIdx = historyIndex + 1;
                 setHistoryIndex(newIdx);
                 setInput(history[newIdx]);
             } else {
                 // Restore temp input
                 setHistoryIndex(-1);
                 setInput(tempInput);
             }
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
      <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
        <span className="text-sm font-mono text-slate-400 flex items-center gap-2">
          <Code size={14} /> REPL
        </span>
        <button 
          onClick={handleRun}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold font-mono flex items-center gap-1 transition-colors"
        >
          <Play size={12} /> {strings.runCode.toUpperCase()}
        </button>
      </div>
      <div className="flex-1 flex flex-col md:flex-row h-96 md:h-auto">
        <div className="flex-1 flex border-b md:border-b-0 md:border-r border-slate-800 min-h-[200px]">
           <CodeEditor 
             value={input} 
             onChange={(e: any) => setInput(e.target.value)} 
             onKeyDown={handleKeyDown}
             placeholder={strings.replPlaceholder} 
           />
        </div>
        <div className="flex-1 bg-[#0d1321] p-4 overflow-auto font-fira text-sm">
          <div className="text-slate-500 mb-2 uppercase text-xs tracking-wider border-b border-slate-800 pb-1">{strings.output}</div>
          <pre className={`whitespace-pre-wrap break-words ${output.startsWith('Error') ? 'text-lisp-error' : 'text-lisp-code'}`}>
            {output || "nil"}
          </pre>
        </div>
      </div>
    </div>
  );
};

const LessonView = ({ 
  lesson, 
  onNext, 
  onPrev, 
  strings, 
  currentLang 
}: { 
  lesson: Lesson, 
  onNext: () => void, 
  onPrev: () => void, 
  strings: any, 
  currentLang: Language 
}) => {
  
  const renderContent = (content: string) => {
    // Split by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Render Code Block
        const code = part.replace(/^```\s*/, '').replace(/```$/, '');
        return (
          <div key={index} className="bg-[#0d1321] rounded-lg border border-slate-800 p-4 my-4 overflow-x-auto shadow-inner">
            <pre className="font-fira text-sm">
              <HighlightedCode code={code} />
            </pre>
          </div>
        );
      }
      
      // Render Text with inline styles
      const paragraphs = part.split('\n\n').filter(p => p.trim());
      return (
        <div key={index}>
          {paragraphs.map((paragraph, pIdx) => (
            <p key={pIdx} className="mb-4 text-slate-300 font-light leading-relaxed">
              {paragraph.split(/(`[^`]+`)/).map((seg, sIdx) => {
                if (seg.startsWith('`') && seg.endsWith('`')) {
                  // Inline code
                  return <code key={sIdx} className="bg-slate-800 text-green-400 px-1 rounded font-fira text-sm border border-slate-700">{seg.slice(1, -1)}</code>;
                }
                
                // Bold text
                const boldParts = seg.split(/(\*\*[^*]+\*\*)/g);
                return boldParts.map((bPart, bIdx) => {
                  if (bPart.startsWith('**') && bPart.endsWith('**')) {
                    return <strong key={bIdx} className="text-white font-bold">{bPart.slice(2, -2)}</strong>;
                  }
                  return <React.Fragment key={bIdx}>{bPart}</React.Fragment>;
                });
              })}
            </p>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
      <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
        <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700 shrink-0">
          <span className="text-sm font-mono text-slate-400 flex items-center gap-2 uppercase">
            <BookOpen size={14} /> {strings.lessonTitle.split(' ')[0]} {lesson.order}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <h2 className="text-3xl font-bold mb-6 text-white border-b border-slate-800 pb-4">{lesson.title[currentLang]}</h2>
          
          <div className="prose prose-invert prose-lg max-w-none">
            {renderContent(lesson.content[currentLang])}
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-800">
            <Button variant="secondary" onClick={onPrev} disabled={lesson.order === 1} className={lesson.order === 1 ? 'opacity-50 cursor-not-allowed' : ''}>
              {strings.prevLesson}
            </Button>
            <Button onClick={onNext}>
              {strings.nextLesson}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-full min-h-[400px]">
        <Repl initialCode={lesson.initialCode} strings={strings} />
      </div>
    </div>
  );
};

const AdminPanel = ({ 
  lessons, 
  setLessons, 
  strings, 
  currentLang 
}: { 
  lessons: Lesson[], 
  setLessons: (l: Lesson[]) => void, 
  strings: any, 
  currentLang: Language 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Lesson | null>(null);

  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setFormState({ ...lesson });
  };

  const createNew = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      order: lessons.length + 1,
      title: { en: "New Lesson", "pt-BR": "Nova Lição" },
      description: { en: "Description", "pt-BR": "Descrição" },
      content: { en: "Content here...", "pt-BR": "Conteúdo aqui..." },
      initialCode: "()"
    };
    setEditingId(newLesson.id);
    setFormState(newLesson);
  };

  const save = () => {
    if (!formState) return;
    if (lessons.find(l => l.id === formState.id)) {
      setLessons(lessons.map(l => l.id === formState.id ? formState : l));
    } else {
      setLessons([...lessons, formState]);
    }
    setEditingId(null);
    setFormState(null);
  };

  const deleteLesson = (id: string) => {
    if (confirm("Are you sure?")) {
      setLessons(lessons.filter(l => l.id !== id));
      setEditingId(null);
    }
  };

  if (editingId && formState) {
    return (
      <div className="max-w-4xl mx-auto bg-lisp-panel p-8 rounded-lg shadow-xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Settings className="text-lisp-accent" /> {strings.editLesson}
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-slate-500 mb-1">Title (EN)</label>
              <input 
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white"
                value={formState.title.en}
                onChange={e => setFormState({...formState, title: {...formState.title, en: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-500 mb-1">Título (PT)</label>
              <input 
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-white"
                value={formState.title['pt-BR']}
                onChange={e => setFormState({...formState, title: {...formState.title, 'pt-BR': e.target.value}})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-500 mb-1">Content (EN) - Supports Markdown</label>
            <textarea 
              className="w-full h-32 bg-slate-900 border border-slate-700 p-2 rounded text-white font-mono text-sm"
              value={formState.content.en}
              onChange={e => setFormState({...formState, content: {...formState.content, en: e.target.value}})}
            />
          </div>

           <div>
            <label className="block text-xs uppercase text-slate-500 mb-1">Conteúdo (PT)</label>
            <textarea 
              className="w-full h-32 bg-slate-900 border border-slate-700 p-2 rounded text-white font-mono text-sm"
              value={formState.content['pt-BR']}
              onChange={e => setFormState({...formState, content: {...formState.content, 'pt-BR': e.target.value}})}
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-500 mb-1">Initial Code</label>
            <textarea 
              className="w-full h-32 bg-slate-900 border border-slate-700 p-2 rounded text-lisp-code font-fira text-sm"
              value={formState.initialCode}
              onChange={e => setFormState({...formState, initialCode: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-700">
            <Button onClick={save}><Save size={16} /> {strings.save}</Button>
            <Button variant="secondary" onClick={() => setEditingId(null)}><X size={16} /> {strings.cancel}</Button>
            <Button variant="danger" className="ml-auto" onClick={() => deleteLesson(formState.id)}><Trash2 size={16} /> {strings.delete}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">{strings.adminPanel}</h2>
        <Button onClick={createNew}><Plus size={16} /> {strings.createLesson}</Button>
      </div>

      <div className="grid gap-4">
        {lessons.sort((a,b) => a.order - b.order).map(lesson => (
          <div key={lesson.id} className="bg-lisp-panel p-4 rounded border border-slate-700 flex justify-between items-center hover:border-lisp-accent transition-colors">
            <div>
              <span className="font-mono text-lisp-accent font-bold mr-3">#{lesson.order}</span>
              <span className="text-lg font-medium">{lesson.title[currentLang]}</span>
            </div>
            <Button variant="secondary" onClick={() => startEdit(lesson)}>{strings.editLesson}</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseList = ({ 
  lessons, 
  onSelect, 
  strings, 
  currentLang 
}: { 
  lessons: Lesson[], 
  onSelect: (id: string) => void, 
  strings: any, 
  currentLang: Language 
}) => (
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-lisp-accent to-purple-400">
        {strings.title}
      </h2>
      <p className="text-slate-400 text-xl max-w-2xl mx-auto">{strings.subtitle}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {lessons.sort((a,b) => a.order - b.order).map((lesson) => (
        <div 
          key={lesson.id} 
          onClick={() => onSelect(lesson.id)}
          className="group bg-lisp-panel border border-slate-700 hover:border-lisp-accent hover:shadow-2xl hover:shadow-violet-900/20 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="bg-slate-900 text-lisp-accent font-mono text-xs px-2 py-1 rounded border border-slate-700">
              MODULE {lesson.order}
            </span>
            <ChevronRight className="text-slate-600 group-hover:text-lisp-accent transition-colors" />
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{lesson.title[currentLang]}</h3>
          <p className="text-slate-400 text-sm">{lesson.description[currentLang]}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState('home'); // home, lesson, admin, help
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

  const strings = dictionary[lang];

  const currentLesson = useMemo(() => 
    lessons.find(l => l.id === currentLessonId), 
  [lessons, currentLessonId]);

  const goToLesson = (id: string) => {
    setCurrentLessonId(id);
    setView('lesson');
  };

  const handleNext = () => {
    if (!currentLesson) return;
    const next = lessons.find(l => l.order === currentLesson.order + 1);
    if (next) goToLesson(next.id);
    else setView('home');
  };

  const handlePrev = () => {
    if (!currentLesson) return;
    const prev = lessons.find(l => l.order === currentLesson.order - 1);
    if (prev) goToLesson(prev.id);
  };

  return (
    <div className="min-h-screen bg-lisp-bg text-lisp-text font-sans selection:bg-lisp-accent selection:text-white">
      <Header currentLang={lang} setLang={setLang} setView={setView} strings={strings} />
      
      <main className="p-4 md:p-8">
        {view === 'home' && (
          <CourseList 
            lessons={lessons} 
            onSelect={goToLesson} 
            strings={strings} 
            currentLang={lang} 
          />
        )}
        
        {view === 'lesson' && currentLesson && (
          <LessonView 
            lesson={currentLesson} 
            onNext={handleNext} 
            onPrev={handlePrev} 
            strings={strings}
            currentLang={lang}
          />
        )}

        {view === 'admin' && (
          <AdminPanel 
            lessons={lessons} 
            setLessons={setLessons} 
            strings={strings} 
            currentLang={lang} 
          />
        )}

        {view === 'help' && (
          <div className="max-w-2xl mx-auto bg-lisp-panel p-8 rounded-lg border border-slate-700 text-center">
            <HelpCircle size={48} className="mx-auto text-lisp-accent mb-4" />
            <h2 className="text-2xl font-bold mb-4">{strings.help}</h2>
            <p className="text-slate-300 leading-relaxed">{strings.helpContent}</p>
            <Button className="mt-6 mx-auto" onClick={() => setView('home')}>{strings.backToCourse}</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;