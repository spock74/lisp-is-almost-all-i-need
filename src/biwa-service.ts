import BiwaScheme from 'biwascheme';

export type EvalResult = {
  type: 'result' | 'error' | 'stdout' | 'input';
  content: string;
};

export type OnOutputListener = (output: EvalResult) => void;

class BiwaService {
  private static instance: BiwaService;
  private interpreter: any;
  private listeners: Set<OnOutputListener> = new Set();

  private constructor() {
    this.interpreter = new BiwaScheme.Interpreter((err: Error) => {
      this.notifyListeners({ type: 'error', content: err.message || String(err) });
    });

    // Configure standard output
    BiwaScheme.Port.current_output = new BiwaScheme.Port.CustomOutput(
      (str: string) => {
        this.notifyListeners({ type: 'stdout', content: str });
      }
    );
  }

  public static getInstance(): BiwaService {
    if (!BiwaService.instance) {
      BiwaService.instance = new BiwaService();
    }
    return BiwaService.instance;
  }

  public addListener(listener: OnOutputListener) {
    this.listeners.add(listener);
  }

  public removeListener(listener: OnOutputListener) {
    this.listeners.delete(listener);
  }

  private notifyListeners(output: EvalResult) {
    this.listeners.forEach(l => l(output));
  }

  /**
   * Evaluate Scheme code.
   * If the code is not balanced (incomplete parens), it returns null or throws?
   * For the editor, we usually want to wrap in (begin ...) if multiple lines.
   */
  public async evaluate(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // BiwaScheme evaluate is essentially sync but uses callbacks for results
        this.interpreter.evaluate(code, (result: any) => {
          let serialized = "nil";
          try {
            serialized = BiwaScheme.to_write(result);
          } catch (e) {
            serialized = String(result);
          }
          resolve(serialized);
        });
      } catch (err: any) {
        this.notifyListeners({ type: 'error', content: err.message || String(err) });
        reject(err);
      }
    });
  }

  /**
   * Check if the code has balanced parentheses.
   * Useful for the terminal REPL to decide if it should evaluate or add a newline.
   */
  public isBalanced(code: string): boolean {
    let count = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '(') count++;
        if (char === ')') count--;
      }
    }
    return count <= 0; // Negative means too many closing, but we consider 0 as balanced
  }
}

export const biwaService = BiwaService.getInstance();
