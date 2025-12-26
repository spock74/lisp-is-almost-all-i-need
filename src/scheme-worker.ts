/**
 * Ultra-robust DOM shim for BiwaScheme in a Web Worker.
 * This satisfies jQuery/Sizzle feature detection during load.
 */
const shimDOM = () => {
  const createNode = (name = "div") => ({
    nodeName: name.toUpperCase(),
    style: {},
    setAttribute: function() { return this; },
    getAttribute: function() { return null; },
    appendChild: function(child: any) { 
      if (child) child.parentNode = this; 
      return child; 
    },
    removeChild: function() { return this; },
    cloneNode: function() { return createNode(this.nodeName); },
    getElementsByTagName: function() { return []; },
    querySelectorAll: function() { return []; },
    querySelector: function() { return null; },
    matches: function() { return false; },
    closest: function() { return null; },
    nodeType: 1,
    parentNode: null,
    checked: false,
    disabled: false,
    ownerDocument: null as any
  });

  const doc: any = {
    nodeType: 9,
    nodeName: "#document",
    createElement: createNode,
    createComment: createNode,
    createDocumentFragment: createNode,
    createTextNode: (text: string) => ({ nodeType: 3, nodeValue: text, parentNode: null }),
    documentElement: createNode("html"),
    body: createNode("body"),
    head: createNode("head"),
    getElementsByTagName: function() { return []; },
    getElementById: function() { return null; },
    querySelectorAll: function() { return []; },
    querySelector: function() { return null; },
    addEventListener: function() {},
    removeEventListener: function() {},
    cookie: ""
  };
  doc.documentElement.ownerDocument = doc;

  const win: any = {
    window: null as any,
    self: null as any,
    document: doc,
    navigator: { 
      userAgent: "Mozilla/5.0 (Worker)",
      platform: "web",
      appName: "Netscape"
    },
    location: { 
      href: "http://localhost",
      origin: "http://localhost",
      protocol: "http:",
      host: "localhost",
      hostname: "localhost",
      port: "",
      pathname: "/",
      search: "",
      hash: ""
    },
    addEventListener: function() {},
    removeEventListener: function() {},
    getComputedStyle: function() { return { getPropertyValue: function() { return ""; } }; },
    Image: function() {},
    Date: Date,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval
  };
  win.window = win;
  win.self = win;

  // Set global variables safely
  (self as any).window = win;
  (self as any).document = doc;
  // self.navigator and self.location are read-only in Workers, 
  // but Sizzle should find them on the fake 'window' object.
};

shimDOM();

// Use dynamic import to ensure shims are applied BEFORE BiwaScheme initializes
let BiwaScheme: any;
let biwa: any;

self.onmessage = async function(e: MessageEvent) {
  const { code, type } = e.data;
  
  if (type === 'ping') {
    console.log("[Worker] Ping received. Pre-loading BiwaScheme...");
    try {
      if (!BiwaScheme) {
        // @ts-ignore
        const module = await import("biwascheme");
        BiwaScheme = module.default || module;
      }
      if (!biwa) {
        biwa = new BiwaScheme.Interpreter((err: Error) => {
          self.postMessage({ type: 'error', content: err.message || String(err) });
        });
      }
      self.postMessage({ type: 'pong', content: "Worker ready" });
      console.log("[Worker] Pre-load complete.");
    } catch (err: any) {
      console.error("[Worker] Pre-load failed:", err);
    }
    return;
  }

  if (!code || code.trim() === "") return;
  
  console.log("[Worker] Received code:", code);
  
  try {
    if (!BiwaScheme) {
      console.log("[Worker] Loading BiwaScheme (on-demand)...");
      // @ts-ignore
      const module = await import("biwascheme");
      BiwaScheme = module.default || module;
      console.log("[Worker] BiwaScheme loaded.");
    }

    if (!biwa) {
      console.log("[Worker] Initializing Interpreter (on-demand)...");
      biwa = new BiwaScheme.Interpreter((err: Error) => {
        console.error("[Worker] Interpreter error callback:", err);
        self.postMessage({ type: 'error', content: err.message || String(err) });
      });
      console.log("[Worker] Interpreter initialized.");
    }

    // Always update the current output port to the latest message context
    BiwaScheme.Port.current_output = new BiwaScheme.Port.CustomOutput(
      (str: string) => {
        self.postMessage({ type: 'stdout', content: str });
      }
    );

    // Wrap in (begin ...) if not already, to handle multiple top-level expressions
    const wrappedCode = code.trim().startsWith("(") && code.trim().endsWith(")") && !code.trim().includes("\n") 
      ? code 
      : `(begin ${code}\n)`;

    console.log("[Worker] Evaluating code...");
    biwa.evaluate(wrappedCode, (result: any) => {
      console.log("[Worker] Evaluation finished.");
      let serialized = "nil";
      try {
        serialized = BiwaScheme.to_write(result);
      } catch (e) {
        serialized = String(result);
      }
      
      self.postMessage({ 
        type: 'result', 
        content: serialized
      });
    });
  } catch (err: any) {
    console.error("[Worker] Global catch block:", err);
    self.postMessage({ type: 'error', content: err.message || String(err) });
  }
};
