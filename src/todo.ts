interface Todo {
  id: number;
  parentId: number | null;
  childIds: number[];
  body: string;
  isComplete: boolean;
}

interface Todos {
  [id: number]: Todo;
}

const TODO_REGEX = /- \[( |x)\] (.*)/;

export class TodoList {
  _todos: Todos;
  _root: Todo;
  _nextId: number;

  constructor() {
    this._todos = {};
    this._root = {
      id: -1,
      parentId: null,
      childIds: [],
      body: "",
      isComplete: false,
    };
    this._nextId = 0;
  }

  static parse(text: string): TodoList {
    const todoList = new TodoList();

    const parentIdStack: { id: number; indentation: number }[] = [];
    const lines = text.split("\n");
    lines.forEach((line) => {
      const match = line.match(TODO_REGEX);
      if (!match) {
        return;
      }

      const [, check, body] = match;
      const isComplete = check === "x";

      const indentation = getIndentation(line);
      let parentId: number | undefined = undefined;
      while (parentIdStack.length > 0) {
        const {
          id: potentialParentId,
          indentation: potentialParentIndentatoin,
        } = parentIdStack[parentIdStack.length - 1];

        if (indentation <= potentialParentIndentatoin) {
          parentIdStack.pop();
        } else {
          parentId = potentialParentId;
          break;
        }
      }
      const id = todoList.addTodo(body, isComplete, parentId);

      parentIdStack.push({ id, indentation });
    });

    return todoList;
  }

  addTodo(body: string, isComplete: boolean, parentId?: number): number {
    const newTodo: Todo = {
      id: this._nextId,
      parentId: null,
      childIds: [],
      body,
      isComplete,
    };

    if (parentId !== undefined) {
      const parentTodo = this._todos[parentId];

      newTodo.parentId = parentId;
      parentTodo.childIds.push(newTodo.id);
    } else {
      this._root.childIds.push(newTodo.id);
    }

    this._todos[newTodo.id] = newTodo;
    this._nextId++;

    return newTodo.id;
  }

  completeTodo(
    id: number,
    recurseDown: boolean = true,
    recurseUp: boolean = true
  ): void {
    const todo = this._todos[id];
    todo.isComplete = true;

    if (recurseDown) {
      todo.childIds.forEach((childId) =>
        this.completeTodo(childId, true, false)
      );
    }

    if (recurseUp && todo.parentId !== null) {
      const parent = this._todos[todo.parentId];
      if (parent.childIds.every((childId) => this._todos[childId].isComplete)) {
        this.completeTodo(parent.id, false, true);
      }
    }
  }

  uncompleteTodo(
    id: number,
    recurseDown: boolean = true,
    recurseUp: boolean = true
  ): void {
    const todo = this._todos[id];
    todo.isComplete = false;

    if (recurseDown) {
      todo.childIds.forEach((childId) =>
        this.uncompleteTodo(childId, true, false)
      );
    }

    if (recurseUp && todo.parentId !== null) {
      this.uncompleteTodo(todo.parentId, false, true);
    }
  }

  toggleTodo(id: number): void {
    if (this._todos[id].isComplete) {
      this.uncompleteTodo(id);
    } else {
      this.completeTodo(id);
    }
  }

  toString(): string {
    return this._root.childIds.map((cId) => this.stringifyTodo(cId)).join("\n");
  }

  private stringifyTodo(id: number, level: number = 0): string {
    const todo = this._todos[id];
    const marker = `- [${todo.isComplete ? "x" : " "}] `;
    const indentation = " ".repeat(level * 2);

    const stringified = `${indentation}${marker}${todo.body}`;
    const stringifiedChildren = todo.childIds.map((cId) =>
      this.stringifyTodo(cId, level + 1)
    );

    return [stringified, ...stringifiedChildren].join("\n");
  }

  body(id: number): string {
    return this._todos[id].body;
  }

  isComplete(id: number): boolean {
    return this._todos[id].isComplete;
  }

  parentId(id: number): number | null {
    return this._todos[id].parentId;
  }
}

function getIndentation(line: string): number {
  const match = line.match(/^(\s*)/);
  if (!match) {
    return 0;
  }
  return match[1].length;
}

// export function deleteTodo(todos: Todo[], id: number) {
//   const index = todos.findIndex((t) => t.id === id);
//   const todo = todos[index];

//   todo.childIds.map((cId) => deleteTodo(todos, cId));
//   todos.splice(index, 1);

//   if (todo.parentId) {
//     const parentIndex = todos.findIndex((t) => t.id === todo.parentId);
//   }
// }
