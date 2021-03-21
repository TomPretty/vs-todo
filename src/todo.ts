interface Todo {
  id: number;
  // tree relationship
  parentId: number | null;
  childIds: number[];
  // double linked list
  nextId: number | null;
  prevId: number | null;
  // data
  body: string;
  isComplete: boolean;
}

interface Todos {
  [id: number]: Todo;
}

export class TodoList {
  _todos: Todos = {};
  _nextId = 0;

  static parse(text: string): TodoList {
    const todoList = new TodoList();

    return todoList;
  }

  addTodo(body: string, isComplete: boolean, parentId?: number): number {
    const newTodo: Todo = {
      id: this._nextId++,
      parentId: null,
      childIds: [],
      nextId: null,
      prevId: null,
      body,
      isComplete,
    };

    if (parentId !== undefined) {
      const parentTodo = this._todos[parentId];

      // wire up tree relationships
      newTodo.parentId = parentId;
      parentTodo.childIds.push(newTodo.id);

      // wire up linked list relationships
      if (parentTodo.nextId) {
        const nextTodo = this._todos[parentTodo.nextId];

        parentTodo.nextId = newTodo.id;
        newTodo.prevId = parentTodo.id;
        newTodo.nextId = nextTodo.id;
        nextTodo.prevId = newTodo.id;
      }
    }

    this._todos[newTodo.id] = newTodo;

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

  body(id: number): string {
    return this._todos[id].body;
  }

  isComplete(id: number): boolean {
    return this._todos[id].isComplete;
  }
}

// const TODO_REGEX = /- \[( |x)\] (.*)/;

// export function parse(text: string): Todos {
//   const lines = text.split("\n");

//   const todos: Todos = { nextId: 0 };
//   let nextId = 0;
//   const indentations: number[] = [];
//   lines.forEach((line) => {
//     const match = line.match(TODO_REGEX);
//     if (!match) {
//       return;
//     }
//     const [, check, body] = match;
//     const isComplete = check === "x";

//     const indentation = getIndentation(line);
//     let parentId: number | null = null;
//     if (nextId === 0) {
//       parentId = null;
//     } else if (indentation > indentations[nextId - 1]) {
//       parentId = todos[nextId - 1].id;
//     } else {
//       for (let i = indentations.length - 1; i > -1; i--) {
//         if (indentation === indentations[i]) {
//           parentId = todos[i].parentId;
//           break;
//         }
//       }
//     }
//     indentations.push(indentation);

//     todos[nextId] = {
//       id: nextId,
//       parentId,
//       childIds: [],
//       nextId: null,
//       prevId: nextId === 0 ? null : nextId - 1,
//       body,
//       isComplete,
//     };
//     nextId++;
//   });

//   todos.nextId = nextId;

//   Object.values(todos).forEach((todo: Todo) => {
//     if (todo.parentId !== null) {
//       todos[todo.parentId].childIds.push(todo.id);
//     }
//     if (todo.prevId !== null) {
//       todos[todo.prevId].nextId = todo.id;
//     }
//   });

//   return todos;
// }

// function getIndentation(line: string): number {
//   const match = line.match(/^(\s*)/);
//   if (!match) {
//     return 0;
//   }
//   return match[1].length;
// }

// export function createChildTodo(todos: Todos, id: number) {
//   const todo = todos[id];
//   const child: Todo = {
//     id: todos.nextId,
//     parentId: todo.id,
//     nextId: todo.nextId,
//     prevId: todo.id,
//     childIds: [],
//     isComplete: false,
//     body: "",
//   };

//   if (todo.nextId) {
//     todos[todo.nextId].prevId = child.id;
//   }
//   todo.nextId = child.id;
//   todo.childIds = [child.id, ...todo.childIds];

//   todos[child.id] = child;
//   todos.nextId++;
//   uncompleteTodo(todos, id, false, true);
// }

// export function createSiblingTodo(todos: Todo[], id: number) {
//   const todo = todos[id];
//   const sibling: Todo = {
//     id: todos.length,
//     parentId: todo.parentId,
//     childIds: [],
//     isComplete: false,
//     body: "",
//   };
//   if (todo.parentId !== null) {
//     const parent = todos[todo.parentId];
//     const indexOfTodo = parent.childIds.findIndex((cId) => cId === todo.id);
//     parent.childIds.splice(indexOfTodo + 1, 0, sibling.id);
//     uncompleteTodo(todos, parent.id, false, true);
//   }
//   todos.push(sibling);

//   const newTodoLineNumber = getLastDescendant(todos, id) + 1;
//   return newTodoLineNumber;
// }

// export function deleteTodo(todos: Todo[], id: number) {
//   const index = todos.findIndex((t) => t.id === id);
//   const todo = todos[index];

//   todo.childIds.map((cId) => deleteTodo(todos, cId));
//   todos.splice(index, 1);

//   if (todo.parentId) {
//     const parentIndex = todos.findIndex((t) => t.id === todo.parentId);
//   }
// }

// function getLastDescendant(todos: Todo[], id: number): number {
//   const todo = todos[id];
//   if (todo.childIds.length > 0) {
//     return getLastDescendant(todos, todo.childIds[todo.childIds.length - 1]);
//   }
//   return id;
// }

// export function format(todos: Todo[]) {
//   return todos
//     .filter((todo) => todo.parentId === null)
//     .map((todo) => formatTodo(todos, todo))
//     .join("\n");
// }

// const INDENTATION_PER_LEVEL = 2;

// function formatTodo(todos: Todo[], todo: Todo, level: number = 0): string {
//   const indentation = " ".repeat(INDENTATION_PER_LEVEL * level);
//   const marker = `- [${todo.isComplete ? "x" : " "}] `;

//   return [
//     `${indentation}${marker}${todo.body}`,
//     ...todo.childIds.map((cId) => formatTodo(todos, todos[cId], level + 1)),
//   ].join("\n");
// }
