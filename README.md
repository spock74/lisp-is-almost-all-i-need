# Parens & Power: The Lisp Way

Parens & Power is an interactive, web-based educational platform designed to teach the fundamentals of Common Lisp, with a specific focus on functional programming concepts, homoiconicity, and metaprogramming via macros. Inspired by the classic "Structure and Interpretation of Computer Programs" (SICP), this application provides a hands-on environment where users can read lessons and immediately execute Lisp code in a custom-built, client-side interpreter.

## Features

### Interactive Learning Environment
*   **Split-Pane Interface:** View educational content alongside a functional REPL (Read-Eval-Print Loop).
*   **Syntax Highlighting:** Custom token-based syntax highlighting for Lisp code within the editor and lesson content.
*   **Bilingual Support:** Full localization support for English and Portuguese (PT-BR).

### Custom Lisp Interpreter
The application includes a fully functional Lisp interpreter written in TypeScript, running entirely in the browser.
*   **Tokenizer & Parser:** Converts string input into Abstract Syntax Trees (AST).
*   **Environment Model:** Implements scope handling, closures, and variable lookup.
*   **Macro System:** Features a dedicated macro expansion phase, allowing users to define new syntactic constructs using `defmacro`.
*   **Core Primitives:** Includes standard arithmetic operations, list manipulation (`car`, `cdr`, `cons`, `list`), logic, and flow control.

### Course Management
*   **Lesson Navigation:** Sequential progression through modules covering atoms, lists, functions, and macros.
*   **Admin Panel:** A built-in interface to create, edit, and delete lessons locally, enabling easy curriculum development.

### REPL Features
*   **Command History:** Navigate through previously executed commands using Up/Down arrow keys.
*   **Multiline Editing:** Support for complex function definitions.
*   **Error Reporting:** Clear feedback for syntax errors or runtime exceptions.

## Technical Stack

*   **Frontend Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Build Tool:** Vite (Recommended)

## Project Structure

*   **src/lispInterpreter.ts**: The core logic of the language. Contains the `tokenize`, `parse`, `macroExpand`, and `evalLisp` functions.
*   **src/App.tsx**: The main React component tree, layout, and view state management.
*   **src/data.ts**: Contains the initial curriculum data and localization strings.
*   **src/types.ts**: TypeScript definitions for the Lisp AST (`LispVal`), Environment, and Application interfaces.

## Lisp Dialect Details

The interpreter implements a simplified Lisp dialect suitable for educational purposes.

*   **Variables:** Defined using `(def variable value)`.
*   **Functions:** Defined using `(def name (lambda (args) body))`.
*   **Macros:** Defined using `(defmacro name (args) body)`.
*   **Homoiconicity:** Code is treated as data using the quote operator `'`.

## Usage

1.  Clone the repository.
2.  Install dependencies using `npm install`.
3.  Start the development server using `npm run dev`.
4.  Open the application in your browser.

## License

This project is open source and available for educational use.