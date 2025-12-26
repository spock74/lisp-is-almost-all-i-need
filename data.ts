import { Lesson, I18nStrings } from './types';

export const dictionary: Record<string, I18nStrings> = {
  en: {
    title: "Parens & Power",
    subtitle: "Mastering Lisp: From Atoms to Macros",
    startCourse: "Start Course",
    adminPanel: "Admin Panel",
    language: "Language",
    runCode: "Eval",
    output: "Output",
    nextLesson: "Next Lesson >",
    prevLesson: "< Previous",
    backToCourse: "Back to Syllabus",
    editLesson: "Edit Lesson",
    createLesson: "Create Lesson",
    save: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    help: "Help",
    helpContent: "Welcome to the Platform. Use the course viewer to navigate through the SICP-inspired lessons. The interpreter below allows you to run Lisp code live. The Admin panel allows adding new lessons to the local JSON store.",
    replPlaceholder: ";; Type your Lisp code here...",
    lessonTitle: "Title (EN/PT)",
    lessonContent: "Content (Markdown Supported)",
    codeExample: "Initial Code Example",
    syntaxError: "Syntax Error",
    result: "Result",
    syllabus: "Syllabus"
  },
  'pt-BR': {
    title: "Parênteses & Poder",
    subtitle: "Dominando Lisp: De Átomos a Macros",
    startCourse: "Iniciar Curso",
    adminPanel: "Painel Admin",
    language: "Idioma",
    runCode: "Avaliar",
    output: "Saída",
    nextLesson: "Próxima Lição >",
    prevLesson: "< Anterior",
    backToCourse: "Voltar ao Currículo",
    editLesson: "Editar Lição",
    createLesson: "Criar Lição",
    save: "Salvar Alterações",
    cancel: "Cancelar",
    delete: "Excluir",
    help: "Ajuda",
    helpContent: "Bem-vindo à plataforma. Use o visualizador de cursos para navegar pelas lições inspiradas no SICP. O interpretador abaixo permite executar código Lisp ao vivo. O painel Admin permite adicionar novas lições ao armazenamento local.",
    replPlaceholder: ";; Digite seu código Lisp aqui...",
    lessonTitle: "Título (EN/PT)",
    lessonContent: "Conteúdo (Suporta Markdown)",
    codeExample: "Exemplo de Código Inicial",
    syntaxError: "Erro de Sintaxe",
    result: "Resultado",
    syllabus: "Currículo"
  }
};

export const initialLessons: Lesson[] = [
  {
    id: '1',
    order: 1,
    title: {
      en: "1. The Elements of Programming",
      'pt-BR': "1. Os Elementos da Programação"
    },
    description: {
      en: "Understanding primitive expressions, combinations, and abstraction.",
      'pt-BR': "Entendendo expressões primitivas, combinações e abstração."
    },
    content: {
      en: "In Lisp, everything is an **Expression**. \n\nWe start with **Atoms** (numbers, strings) and combine them into **Lists**. The first element of a list is treated as the function to apply to the rest. This is called *Prefix Notation*.\n\nExample: `(+ 1 2)` adds 1 and 2.",
      'pt-BR': "Em Lisp, tudo é uma **Expressão**. \n\nComeçamos com **Átomos** (números, strings) e os combinamos em **Listas**. O primeiro elemento de uma lista é tratado como a função a ser aplicada ao restante. Isso é chamado de *Notação Prefixada*.\n\nExemplo: `(+ 1 2)` soma 1 e 2."
    },
    initialCode: "(+ 137 349)\n\n(- 1000 334)\n\n(* 5 99)\n\n(/ 10 5)\n\n(+ 2.7 10)"
  },
  {
    id: '2',
    order: 2,
    title: {
      en: "2. Naming and the Environment",
      'pt-BR': "2. Nomeação e o Ambiente"
    },
    description: {
      en: "Using 'define' to create variables and maintain state.",
      'pt-BR': "Usando 'define' para criar variáveis e manter estado."
    },
    content: {
      en: "A critical aspect of a programming language is the means it provides for using names to refer to computational objects. In Lisp, we use `define` to name things.\n\nOnce defined, the symbol stays in the **Global Environment**.",
      'pt-BR': "Um aspecto crítico de uma linguagem de programação é o meio que ela fornece para usar nomes para se referir a objetos computacionais. Em Lisp, usamos `define` para nomear coisas.\n\nUma vez definido, o símbolo permanece no **Ambiente Global**."
    },
    initialCode: "(define size 2)\n(define pi 3.14159)\n(define radius 10)\n\n(* pi (* radius radius))"
  },
  {
    id: '3',
    order: 3,
    title: {
      en: "3. Procedures as Abstractions",
      'pt-BR': "3. Procedimentos como Abstrações"
    },
    description: {
      en: "Defining functions with lambda.",
      'pt-BR': "Definindo funções com lambda."
    },
    content: {
      en: "We can name compound operations. We define a function using `(define name (lambda (params) body))`. Scheme also provides a shorthand: `(define (name params) body)`.\n\nThis powerful technique allows us to abstract away complexity.",
      'pt-BR': "Podemos nomear operações compostas. Definimos uma função usando `(define nome (lambda (params) corpo))`. Scheme também fornece um atalho: `(define (nome params) corpo)`.\n\nEssa técnica poderosa nos permite abstrair a complexidade."
    },
    initialCode: "(define square (lambda (x) (* x x)))\n\n(square 21)\n\n(define (sum-squares x y)\n  (+ (square x) (square y)))\n\n(sum-squares 3 4)"
  },
  {
    id: '4',
    order: 4,
    title: {
      en: "4. Code is Data (Homoiconicity)",
      'pt-BR': "4. Código é Dado (Homoiconicidade)"
    },
    description: {
      en: "The quote operator and the structure of lists.",
      'pt-BR': "O operador quote e a estrutura de listas."
    },
    content: {
      en: "**Homoiconicity** means the code is written in the same data structure that the language can manipulate (Lists).\n\nUse `'` (quote) to stop evaluation. `(+ 1 2)` runs the code. `'(+ 1 2)` gives you the list of data.",
      'pt-BR': "**Homoiconicidade** significa que o código é escrito na mesma estrutura de dados que a linguagem pode manipular (Listas).\n\nUse `'` (quote) para parar a avaliação. `(+ 1 2)` roda o código. `'(+ 1 2)` te dá a lista de dados."
    },
    initialCode: "(define my-code '(+ 1 2))\n\n(car my-code) ;; returns the symbol +\n(cdr my-code) ;; returns (1 2)\n\n(list 'a 'b 'c)"
  },
  {
    id: '5',
    order: 5,
    title: {
      en: "5. Metaprogramming with Macros",
      'pt-BR': "5. Metaprogramação com Macros"
    },
    description: {
      en: "Introduction to macros: functions that write code.",
      'pt-BR': "Introdução a macros: funções que escrevem código."
    },
    content: {
      en: "Normal functions evaluate their arguments. **Macros** receive the unevaluated arguments (the code itself), transform them, and return new code to be executed.\n\nThis allows you to change the syntax of the language. In the example below, we create an `infix` macro that allows us to write `(infix 1 + 2)` instead of `(+ 1 2)`.",
      'pt-BR': "Funções normais avaliam seus argumentos. **Macros** recebem os argumentos não avaliados (o próprio código), os transformam e retornam novo código para ser executado.\n\nIsso permite que você altere a sintaxe da linguagem. No exemplo abaixo, criamos uma macro `infix` que nos permite escrever `(infix 1 + 2)` em vez de `(+ 1 2)`."
    },
    initialCode: ";; A macro that takes arguments and rearranges them\n(define-macro (infix a op b)\n  (list op a b))\n\n;; Now we can use infix notation!\n(infix 10 + 20)\n\n(infix 5 * 5)"
  },
  {
    id: '6',
    order: 6,
    title: {
      en: "6. Syntactic Abstraction",
      'pt-BR': "6. Abstração Sintática"
    },
    description: {
      en: "Creating new control structures like 'when'.",
      'pt-BR': "Criando novas estruturas de controle como 'when'."
    },
    content: {
      en: "In many languages, if you want a new control flow keyword (like `unless` or `until`), you have to wait for the compiler writers to add it. In Lisp, you write it yourself.\n\nHere we implement `when`, which is like an `if` without an else clause, useful for side effects.",
      'pt-BR': "Em muitas linguagens, se você quer uma nova palavra-chave de controle de fluxo (como `unless` ou `until`), você tem que esperar que os criadores do compilador a adicionem. Em Lisp, você mesmo a escreve.\n\nAqui implementamos `when`, que é como um `if` sem cláusula else, útil para efeitos colaterais."
    },
    initialCode: ";; 'when' expands to an 'if' with '#f' as the else branch\n(define-macro (when condition action)\n  (list 'if condition action '#f))\n\n(when (eq? 10 10)\n  (print \"Math still works!\"))\n\n(when (eq? 1 2)\n  (print \"This will not print\"))"
  },
  {
    id: '7',
    order: 7,
    title: {
      en: "7. The Power of Abstraction: let1",
      'pt-BR': "7. O Poder da Abstração: let1"
    },
    description: {
      en: "Implementing local variables using macros.",
      'pt-BR': "Implementando variáveis locais usando macros."
    },
    content: {
      en: "We can even create variable binding structures. A `let` block is actually just syntactic sugar for a `lambda` function applied to values.\n\n`let1` creates a single local variable. The macro transforms:\n`(let1 x 10 body)`\ninto:\n`((lambda (x) body) 10)`",
      'pt-BR': "Podemos até criar estruturas de vinculação de variáveis. Um bloco `let` é na verdade apenas açúcar sintático para uma função `lambda` aplicada a valores.\n\n`let1` cria uma única variável local. A macro transforma:\n`(let1 x 10 corpo)`\nem:\n`((lambda (x) corpo) 10)`"
    },
    initialCode: ";; Define let1 macro\n(define-macro (let1 var val body)\n  (list (list 'lambda (list var) body) val))\n\n;; Use it to define a local scope\n(let1 x 5\n  (* x x))\n\n;; x is not defined here\n;; (print x) would fail"
  }
];