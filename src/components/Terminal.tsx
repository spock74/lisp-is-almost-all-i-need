import React, { useState, useEffect, useMemo, useRef } from 'react';
import { biwaService, EvalResult } from '../biwa-service';
import Prism from 'prismjs';
import 'prismjs/components/prism-lisp';

/**
 * Terminal component providing a persistent REPL interface.
 * Now with syntax highlighting and prompt at the top.
 */
const Terminal = ({ outputs, onExecute }: { outputs: EvalResult[], onExecute: (code: string) => void }) => {
  const [currentLine, setCurrentLine] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Highlighting helper
  const highlight = (code: string) => {
    return Prism.highlight(code, Prism.languages.lisp, 'lisp');
  };

  useEffect(() => {
    // Scroll to top when entries change because input is at the top? 
    // Actually, usually in this reversed mode, we want to stay at the top or just have normal order.
    // If input is at the top, history is below. 
    // If we want newest history right below input, we'd reverse outputs.
    // The user said "transferir o prompt para o topo do repl".
    // I'll put Input first, then the history (normal order: oldest to newest).
  }, [outputs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const code = currentLine.trim();
      if (e.shiftKey) return;

      if (biwaService.isBalanced(currentLine)) {
        e.preventDefault();
        if (code) {
          onExecute(currentLine);
          setHistory(prev => [...prev, currentLine]);
          setHistoryIndex(-1);
          setCurrentLine('');
        }
      }
    } else if (e.key === 'ArrowUp') {
      const target = e.target as HTMLTextAreaElement;
      const isFirstLine = currentLine.substring(0, target.selectionStart).indexOf('\n') === -1;

      if (isFirstLine && history.length > 0) {
        e.preventDefault();
        if (historyIndex === -1) {
          setTempInput(currentLine);
          const newIdx = history.length - 1;
          setHistoryIndex(newIdx);
          setCurrentLine(history[newIdx]);
        } else if (historyIndex > 0) {
          const newIdx = historyIndex - 1;
          setHistoryIndex(newIdx);
          setCurrentLine(history[newIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      const target = e.target as HTMLTextAreaElement;
      const isLastLine = currentLine.substring(target.selectionEnd).indexOf('\n') === -1;

      if (isLastLine && historyIndex !== -1) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          const newIdx = historyIndex + 1;
          setHistoryIndex(newIdx);
          setCurrentLine(history[newIdx]);
        } else {
          setHistoryIndex(-1);
          setCurrentLine(tempInput);
        }
      }
    }
  };

  // Grouping logic: Collect entries into interactions starting with an 'input'
  const interactionGroups = useMemo(() => {
    const groups: EvalResult[][] = [];
    let currentGroup: EvalResult[] = [];

    outputs.forEach((entry) => {
      if (entry.type === 'input') {
        if (currentGroup.length > 0) groups.push(currentGroup);
        currentGroup = [entry];
      } else {
        currentGroup.push(entry);
      }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
  }, [outputs]);

  return (
    <div 
      className="flex-1 bg-[#0d1321] p-4 overflow-auto font-fira text-sm custom-scrollbar flex flex-col gap-4" 
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
    >
      {/* 1. Active Input Line (Now at the Top) */}
      <div className="flex gap-2 sticky top-0 bg-[#0d1321] pb-2 border-b border-slate-800 z-10">
        <span className="text-lisp-accent font-bold mt-0.5 whitespace-nowrap">
          biwascheme&gt;
        </span>
        <div className="flex-1 relative min-h-[1.5em]">
          {/* Highlight Layer */}
          <pre 
            className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words m-0 p-0 text-lisp-code leading-[1.5] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: highlight(currentLine + (currentLine.endsWith('\n') ? ' ' : '')) }}
          />
          {/* Input Layer */}
          <textarea
            ref={inputRef}
            rows={currentLine.split('\n').length || 1}
            className="w-full bg-transparent border-none outline-none resize-none text-transparent caret-white p-0 m-0 overflow-hidden leading-[1.5] relative z-10 block"
            style={{ height: 'auto', background: 'transparent' }}
            value={currentLine}
            onChange={(e) => setCurrentLine(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoFocus
          />
        </div>
      </div>

      {/* 2. Historical Output (Below Input) */}
      <div className="flex flex-col gap-4">
        {[...interactionGroups].reverse().map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1 border-b border-slate-800/30 pb-2">
            {group.map((entry, i) => (
              <div key={i} className={`mb-1 break-words p-2 rounded ${
                entry.type === 'error' ? 'bg-red-900/10 text-lisp-error border-l-2 border-lisp-error' : 
                entry.type === 'result' ? 'text-lisp-accent font-bold' : 
                entry.type === 'input' ? 'text-slate-500 italic text-xs' : 'text-lisp-code'
              }`}>
                {entry.type === 'result' && <span className="mr-2 text-slate-500">=&gt;</span>}
                {entry.type === 'input' && <span className="mr-2">&gt;</span>}
                
                {entry.type === 'input' || entry.type === 'result' ? (
                  <span dangerouslySetInnerHTML={{ __html: highlight(entry.content) }} />
                ) : (
                  entry.content
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
