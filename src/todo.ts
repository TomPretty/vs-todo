const INDENTATION_PER_LEVEL = 2;

class Todo {
  _body: string;
  _isComplete: boolean;
  _children: Todo[];

  constructor(body: string, isComplete: boolean, children: Todo[]) {
    this._body = body;
    this._isComplete = isComplete;
    this._children = children;
  }

  toString(level: number): string {
    const pad = " ".repeat(level * INDENTATION_PER_LEVEL);
    const checkbox = `- [${this._isComplete ? "x" : " "}] `;

    const str = `${pad}${checkbox}${this._body}`;

    return [
      str,
      ...this._children.map((child) => child.toString(level + 1)),
    ].join("\n");
  }

  numTodos(): number {
    return this._children.reduce(
      (numTodos: number, todo: Todo) => numTodos + todo.numTodos(),
      1
    );
  }

  allTodos(): Todo[] {
    return [];
    // return [this, ...this._children.map((child) => child.allTodos()).flat()];
  }
}

export class TodoList {
  _todos: Todo[];

  constructor(todos: Todo[]) {
    this._todos = todos;
  }

  static fromText(text: string): TodoList {
    const lines = text.split("\n");
    const todos: Todo[] = [];
    let currentLine = 0;
    while (currentLine < lines.length && lines[currentLine]) {
      const { todo, nextLine } = parseTodo(lines, currentLine);
      todos.push(todo);
      currentLine = nextLine;
    }
    return new TodoList(todos);
  }

  toString(): string {
    return this._todos.map((todo) => todo.toString(0)).join("\n");
  }

  numTodos(): number {
    return this._todos.reduce(
      (numTodos: number, todo: Todo) => numTodos + todo.numTodos(),
      0
    );
  }

  completeTodo(line: number): void {
    // const allTodos = this._todos.map((todo) => todo.allTodos()).flat();
    // allTodos[line]._isComplete = true;
  }
}

interface TodoParseResult {
  todo: Todo;
  nextLine: number;
}

const TODO_REGEX = /- \[( |x)\] (.*)/;

function parseTodo(lines: string[], currentLine: number): TodoParseResult {
  const line = lines[currentLine];
  const match = line.match(TODO_REGEX);
  if (!match) {
    throw Error();
  }
  const [, check, body] = match;
  const isComplete = check === "x";

  let children: Todo[] = [];
  let nextLine = currentLine + 1;
  while (true) {
    if (!isChild(lines, currentLine, nextLine)) {
      break;
    }

    const { todo: child, nextLine: newNextLine } = parseTodo(lines, nextLine);
    children.push(child);

    nextLine = newNextLine;
  }

  const todo = new Todo(body, isComplete, children);
  return { todo, nextLine };
}

function isChild(
  lines: string[],
  parentLine: number,
  childLine: number
): boolean {
  const parentIndentation = getIndentation(lines[parentLine]);
  const childIndentation = getIndentation(lines[childLine]);

  return parentIndentation < childIndentation;
}

function getIndentation(line: string): number {
  const match = line.match(/^(\s*)/);
  if (!match) {
    return 0;
  }
  return match[1].length;
}
