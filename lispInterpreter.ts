import { LispVal } from './types';

// 1. Tokenizer
const tokenize = (input: string): string[] => {
  return input
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .replace(/'/g, " ' ") // Handle quote shorthand
    .split(/\s+/)
    .filter((t) => t.length > 0);
};

// 2. Parser
const parse = (tokens: string[]): LispVal => {
  if (tokens.length === 0) throw new Error("Unexpected EOF");
  const token = tokens.shift()!;

  if (token === '(') {
    const list: LispVal[] = [];
    while (tokens.length > 0 && tokens[0] !== ')') {
      list.push(parse(tokens));
    }
    tokens.shift(); // consume ')'
    return { type: 'list', value: list };
  } else if (token === ')') {
    throw new Error("Unexpected )");
  } else if (token === "'") {
    // Expand 'x to (quote x)
    return { type: 'list', value: [{ type: 'symbol', value: 'quote' }, parse(tokens)] };
  } else {
    return atom(token);
  }
};

const atom = (token: string): LispVal => {
  const num = Number(token);
  if (!isNaN(num)) return { type: 'number', value: num };
  if (token.startsWith('"') && token.endsWith('"')) return { type: 'string', value: token.slice(1, -1) };
  if (token === 't') return { type: 'bool', value: true };
  if (token === 'nil') return { type: 'bool', value: false };
  return { type: 'symbol', value: token };
};

// 3. Environment
export class Env {
  vars: Record<string, LispVal>;
  outer: Env | null;

  constructor(outer: Env | null = null) {
    this.outer = outer;
    this.vars = {};
  }

  get(name: string): LispVal {
    if (name in this.vars) return this.vars[name];
    if (this.outer) return this.outer.get(name);
    throw new Error(`Symbol '${name}' not found`);
  }

  set(name: string, value: LispVal) {
    this.vars[name] = value;
  }
}

// Standard Library
const stdLib = (env: Env) => {
  env.set('+', { type: 'function', value: (args) => ({ type: 'number', value: args.reduce((a, b) => a + ((b as any).value as number), 0) }) });
  env.set('-', { type: 'function', value: (args) => ({ type: 'number', value: ((args[0] as any).value as number) - ((args[1] as any)?.value as number || 0) }) });
  env.set('*', { type: 'function', value: (args) => ({ type: 'number', value: args.reduce((a, b) => a * ((b as any).value as number), 1) }) });
  env.set('/', { type: 'function', value: (args) => ({ type: 'number', value: ((args[0] as any).value as number) / ((args[1] as any).value as number) }) });
  
  // List manipulation
  env.set('list', { type: 'function', value: (args) => ({ type: 'list', value: args }) });
  env.set('car', { type: 'function', value: (args) => {
    const list = args[0];
    if (list.type !== 'list') throw new Error("car expects a list");
    return list.value[0] || { type: 'bool', value: false };
  }});
  env.set('cdr', { type: 'function', value: (args) => {
    const list = args[0];
    if (list.type !== 'list') throw new Error("cdr expects a list");
    return { type: 'list', value: list.value.slice(1) };
  }});
  env.set('cons', { type: 'function', value: (args) => {
    if(args.length !== 2) throw new Error("cons expects 2 arguments");
    const head = args[0];
    const tail = args[1];
    if(tail.type === 'list') return { type: 'list', value: [head, ...tail.value] };
    return { type: 'list', value: [head, tail] }; 
  }});
  
  // Logic & IO
  env.set('print', { type: 'function', value: (args) => {
      // In a real REPL this might log to console, but we return the value to be displayed if it's the last one
      return args[0];
  }});
  env.set('eq', { type: 'function', value: (args) => {
    const a = args[0];
    const b = args[1];
    return { type: 'bool', value: (a as any).value === (b as any).value && a.type === b.type };
  }});
  
  // Progn/Begin (evaluates arguments in order, returns last)
  env.set('begin', { type: 'function', value: (args) => {
    return args[args.length - 1] || { type: 'bool', value: false };
  }});
  env.set('progn', { type: 'function', value: (args) => {
    return args[args.length - 1] || { type: 'bool', value: false };
  }});
};

// 4. Macro Expander
const macroExpand = (x: LispVal, env: Env): LispVal => {
  // If not a list or empty list, return as is
  if (x.type !== 'list' || x.value.length === 0) return x;

  const list = x.value;
  const op = list[0];

  // If operation is a symbol, it might be a macro call or a special form
  if (op.type === 'symbol') {
    // 1. Quote: Do not expand inside quote
    if (op.value === 'quote') return x;

    // 2. Define: (def name val) -> Expand val, but NOT name
    if (op.value === 'def' || op.value === 'define') {
      return {
        type: 'list',
        value: [op, list[1], macroExpand(list[2], env)]
      };
    }

    // 3. Lambda: (lambda (args) body...) -> Expand body expressions, but NOT args
    if (op.value === 'lambda') {
      const params = list[1];
      const body = list.slice(2);
      return {
        type: 'list',
        value: [op, params, ...body.map(e => macroExpand(e, env))]
      };
    }

    // 4. Defmacro: Don't expand definition signature
    if (op.value === 'defmacro') {
      return x;
    }

    // 5. Check Environment for Macro definition
    try {
      const val = env.get(op.value);
      if (val.type === 'macro') {
        // IT IS A MACRO CALL
        // Pass UNEVALUATED arguments to the macro body
        const args = list.slice(1);
        const macroEnv = new Env(val.env);
        
        // Bind arguments
        val.args.forEach((argName, i) => {
          macroEnv.set(argName, args[i] || { type: 'bool', value: false });
        });

        // Evaluate the body of the macro. 
        // We evaluate all expressions in the macro body, returning the result of the last one.
        // The result of this evaluation is the *Expanded Code*.
        let expandedCode: LispVal = { type: 'bool', value: false };
        for (const expr of val.body) {
          expandedCode = evalLisp(expr, macroEnv);
        }

        // Recursively expand the result (macros can generate macros or more macro calls)
        return macroExpand(expandedCode, env);
      }
    } catch (e) {
      // Symbol not found or not a macro, continue to standard expansion
    }
  }

  // If not a macro call or special form, recursively expand all elements of the list
  return {
    type: 'list',
    value: list.map(v => macroExpand(v, env))
  };
};

// 5. Evaluator
const evalLisp = (x: LispVal, env: Env): LispVal => {
  if (x.type === 'symbol') return env.get(x.value);
  if (x.type !== 'list') return x;
  
  const list = x.value;
  if (list.length === 0) return x; // nil

  const op = list[0];

  // Special Forms
  if (op.type === 'symbol') {
    if (op.value === 'quote') return list[1]; // (quote x)
    
    if (op.value === 'def' || op.value === 'define') {
      const sym = list[1];
      if (sym.type !== 'symbol') throw new Error("Definition must start with a symbol");
      const val = evalLisp(list[2], env);
      env.set(sym.value, val);
      return { type: 'symbol', value: sym.value };
    }
    
    if (op.value === 'if') {
      const test = evalLisp(list[1], env);
      if ((test.type === 'bool' && test.value === false) || (test.type === 'list' && test.value.length === 0)) {
        return list[3] ? evalLisp(list[3], env) : { type: 'bool', value: false };
      }
      return evalLisp(list[2], env);
    }
    
    if (op.value === 'lambda') {
      const params = (list[1] as any).value.map((p: any) => p.value);
      const bodyExprs = list.slice(2); // Support multiple expressions in body
      return {
        type: 'function',
        value: (args: LispVal[]) => {
          const newEnv = new Env(env);
          params.forEach((p: string, i: number) => newEnv.set(p, args[i]));
          
          let result: LispVal = { type: 'bool', value: false };
          for (const expr of bodyExprs) {
            result = evalLisp(expr, newEnv);
          }
          return result;
        },
        env: env // Capture closure
      };
    }

    // Definition of a macro
    // (defmacro name (args) body...)
    if (op.value === 'defmacro') {
      const sym = list[1];
      if (sym.type !== 'symbol') throw new Error("Macro name must be a symbol");
      const params = (list[2] as any).value.map((p: any) => p.value);
      const body = list.slice(3); // Capture all body expressions
      
      env.set(sym.value, {
        type: 'macro',
        args: params,
        body: body,
        env: env
      });
      return { type: 'symbol', value: sym.value };
    }
  }

  // Function Application
  const proc = evalLisp(op, env);
  if (proc.type === 'function') {
    const args = list.slice(1).map((arg) => evalLisp(arg, env));
    return proc.value(args);
  }

  throw new Error(`Unknown operator or function: ${JSON.stringify(op)}. Ensure you are not trying to call a macro as a function without expansion.`);
};

// Helper to stringify result
export const lispToString = (val: LispVal): string => {
  if (val.type === 'number') return val.value.toString();
  if (val.type === 'string') return `"${val.value}"`;
  if (val.type === 'symbol') return val.value;
  if (val.type === 'bool') return val.value ? 't' : 'nil';
  if (val.type === 'list') return `(${val.value.map(lispToString).join(' ')})`;
  if (val.type === 'function') return `<function>`;
  if (val.type === 'macro') return `<macro>`;
  return '';
};

// Main Runner
export const runLisp = (code: string): string => {
  try {
    const tokens = tokenize(code);
    const env = new Env();
    stdLib(env);
    
    let lastResult = "nil";

    // Loop through all expressions in the input
    while (tokens.length > 0) {
      // 1. Parse
      const ast = parse(tokens);
      
      // 2. Expand Macros
      const expandedAst = macroExpand(ast, env);
      
      // 3. Eval
      const result = evalLisp(expandedAst, env);
      
      lastResult = lispToString(result);
    }

    return lastResult;
  } catch (e: any) {
    return `Error: ${e.message}`;
  }
};