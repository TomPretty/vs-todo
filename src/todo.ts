export interface Todo {
  id: number;
  parentId: number | null;
  childIds: number[];
  body: string;
  isComplete: boolean;
}

const TODO_REGEX = /- \[( |x)\] (.*)/;

export function parse(text: string): Todo[] {
  const lines = text.split("\n");

  let nextId = 0;
  const indentations: number[] = [];
  const todos: Todo[] = [];
  lines.forEach((line) => {
    const match = line.match(TODO_REGEX);
    if (!match) {
      return;
    }
    const [, check, body] = match;
    const isComplete = check === "x";

    const indentation = getIndentation(line);
    let parentId: number | null = null;
    if (todos.length === 0) {
      parentId = null;
    } else if (indentation > indentations[indentations.length - 1]) {
      parentId = todos[todos.length - 1].id;
    } else {
      for (let i = indentations.length - 1; i > -1; i--) {
        if (indentation === indentations[i]) {
          parentId = todos[i].parentId;
          break;
        }
      }
    }
    indentations.push(indentation);

    todos.push({ id: nextId++, parentId, childIds: [], body, isComplete });
  });

  todos.forEach((todo) => {
    if (todo.parentId !== null) {
      todos[todo.parentId].childIds.push(todo.id);
    }
  });

  return todos;
}

function getIndentation(line: string): number {
  const match = line.match(/^(\s*)/);
  if (!match) {
    return 0;
  }
  return match[1].length;
}

export function completeTodo(
  todos: Todo[],
  id: number,
  recurseDown: boolean = true,
  recurseUp: boolean = true
) {
  const todo = todos[id];
  todo.isComplete = true;

  if (recurseDown) {
    todo.childIds.forEach((childId) =>
      completeTodo(todos, childId, true, false)
    );
  }

  if (recurseUp && todo.parentId !== null) {
    const parent = todos[todo.parentId];
    if (parent.childIds.every((childId) => todos[childId].isComplete)) {
      completeTodo(todos, parent.id, false, true);
    }
  }
}

export function uncompleteTodo(
  todos: Todo[],
  id: number,
  recurseDown: boolean = true,
  recurseUp: boolean = true
) {
  const todo = todos[id];
  todo.isComplete = false;

  if (recurseDown) {
    todo.childIds.forEach((childId) =>
      uncompleteTodo(todos, childId, true, false)
    );
  }

  if (recurseUp && todo.parentId !== null) {
    uncompleteTodo(todos, todo.parentId, false, true);
  }
}

export function toggleTodo(todos: Todo[], id: number) {
  if (todos[id].isComplete) {
    uncompleteTodo(todos, id);
  } else {
    completeTodo(todos, id);
  }
}

export function createChildTodo(todos: Todo[], id: number) {
  const todo = todos[id];
  const child: Todo = {
    id: todos.length,
    parentId: todo.id,
    childIds: [],
    isComplete: false,
    body: "",
  };
  todo.childIds = [child.id, ...todo.childIds];
  todos.push(child);
  uncompleteTodo(todos, id, false, true);
}

export function createSiblingTodo(todos: Todo[], id: number) {
  const todo = todos[id];
  const sibling: Todo = {
    id: todos.length,
    parentId: todo.parentId,
    childIds: [],
    isComplete: false,
    body: "",
  };
  if (todo.parentId !== null) {
    const parent = todos[todo.parentId];
    const indexOfTodo = parent.childIds.findIndex((cId) => cId === todo.id);
    parent.childIds.splice(indexOfTodo + 1, 0, sibling.id);
    uncompleteTodo(todos, parent.id, false, true);
  }
  todos.push(sibling);

  const newTodoLineNumber = getLastDescendant(todos, id) + 1;
  return newTodoLineNumber;
}

function getLastDescendant(todos: Todo[], id: number): number {
  const todo = todos[id];
  if (todo.childIds.length > 0) {
    return getLastDescendant(todos, todo.childIds[todo.childIds.length - 1]);
  }
  return id;
}

export function format(todos: Todo[]) {
  return todos
    .filter((todo) => todo.parentId === null)
    .map((todo) => formatTodo(todos, todo))
    .join("\n");
}

const INDENTATION_PER_LEVEL = 2;

function formatTodo(todos: Todo[], todo: Todo, level: number = 0): string {
  const indentation = " ".repeat(INDENTATION_PER_LEVEL * level);
  const marker = `- [${todo.isComplete ? "x" : " "}] `;

  return [
    `${indentation}${marker}${todo.body}`,
    ...todo.childIds.map((cId) => formatTodo(todos, todos[cId], level + 1)),
  ].join("\n");
}
