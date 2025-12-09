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
      en: "Using 'def' to create variables and maintain state.",
      'pt-BR': "Usando 'def' para criar variáveis e manter estado."
    },
    content: {
      en: "A critical aspect of a programming language is the means it provides for using names to refer to computational objects. In Lisp, we use `define` (or `def`) to name things.\n\nOnce defined, the symbol stays in the **Global Environment**.",
      'pt-BR': "Um aspecto crítico de uma linguagem de programação é o meio que ela fornece para usar nomes para se referir a objetos computacionais. Em Lisp, usamos `define` (ou `def`) para nomear coisas.\n\nUma vez definido, o símbolo permanece no **Ambiente Global**."
    },
    initialCode: "(def size 2)\n(def pi 3.14159)\n(def radius 10)\n\n(* pi (* radius radius))"
  },
  {
    id: '3',
    order: 3,
    title: {
      en: "3. Procedures as Abstractions",
      'pt-BR': "3. Procedimentos como Abstrações"
    },
    description: {
      en: "Defining functions with lambda and defun.",
      'pt-BR': "Definindo funções com lambda e defun."
    },
    content: {
      en: "We can name compound operations. We define a function using `(def name (lambda (params) body))`.\n\nThis powerful technique allows us to abstract away complexity.",
      'pt-BR': "Podemos nomear operações compostas. Definimos uma função usando `(def nome (lambda (params) corpo))`.\n\nEssa técnica poderosa nos permite abstrair a complexidade."
    },
    initialCode: "(def square (lambda (x) (* x x)))\n\n(square 21)\n\n(def sum-squares (lambda (x y)\n  (+ (square x) (square y))))\n\n(sum-squares 3 4)"
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
    initialCode: "(def my-code '(+ 1 2))\n\n(car my-code) ;; returns the symbol +\n(cdr my-code) ;; returns (1 2)\n\n(list 'a 'b 'c)"
  }
];
