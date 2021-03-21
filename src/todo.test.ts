import { TodoList } from "./todo";

describe("TodoList.addTodo", () => {
  it("adds a todo", () => {
    const todoList = new TodoList();

    const id = todoList.addTodo("a", false);

    expect(todoList.body(id)).toBe("a");
    expect(todoList.isComplete(id)).toBeFalsy();
  });
});

// describe.only("parse", () => {
//   it.only("parses a single unchecked todo", () => {
//     const text = `
//     - [ ] a
//     `;

//     const { 0: todo } = parse(text);

//     expect(todo.body).toBe("a");
//     expect(todo.isComplete).toBeFalsy();
//   });

//   it("parses a single unchecked todo", () => {
//     const text = `
//     - [x] a
//     `;

//     const { 0: todo } = parse(text);

//     expect(todo.body).toBe("a");
//     expect(todo.isComplete).toBeTruthy();
//   });

//   it("parses multiple top level todos", () => {
//     const text = `
//     - [ ] a
//     - [ ] b
//     `;

//     const { 0: a, 1: b } = parse(text);

//     expect(a.body).toEqual("a");
//     expect(a.nextId).toEqual(b.id);
//     expect(a.prevId).toBeNull();

//     expect(b.body).toEqual("b");
//     expect(b.nextId).toBeNull();
//     expect(b.prevId).toEqual(a.id);
//   });

//   it("parses a nested todo", () => {
//     const text = `
//     - [ ] a
//       - [ ] a1
//     `;

//     const { 0: a, 1: a1 } = parse(text);

//     expect(a1.parentId).toBe(a.id);
//   });

//   it("parses multiple nested todos", () => {
//     const text = `
//     - [ ] a
//       - [ ] a1
//       - [ ] a2
//     `;

//     const { 0: a, 1: a1, 2: a2 } = parse(text);

//     expect(a2.parentId).toBe(a.id);
//   });

//   it("parses a todo after a nested todo", () => {
//     const text = `
//     - [ ] a
//       - [ ] a1
//         - [ ] a1i
//       - [ ] a2
//     `;

//     const { 0: a, 3: a2 } = parse(text);

//     expect(a2.parentId).toBe(a.id);
//   });

//   it("parses child relationships", () => {
//     const text = `
//     - [ ] a
//       - [ ] a1
//       - [ ] a2
//     `;

//     const { 0: a, 1: a1, 2: a2 } = parse(text);

//     expect(a.childIds).toEqual([a1.id, a2.id]);
//   });
// });

describe("TodoList.completeTodo", () => {
  it("completes a single todo", () => {
    const todoList = new TodoList();
    const id = todoList.addTodo("a", false);

    todoList.completeTodo(id);

    expect(todoList.isComplete(id)).toBeTruthy();
  });

  it("completes a todo and all its children", () => {
    const todoList = new TodoList();
    const pId = todoList.addTodo("p", false);
    const c1Id = todoList.addTodo("c1", false, pId);
    const c2Id = todoList.addTodo("c2", false, pId);

    todoList.completeTodo(pId);

    expect(todoList.isComplete(c1Id)).toBeTruthy();
    expect(todoList.isComplete(c2Id)).toBeTruthy();
  });

  it("completes a parent todo if it was the last uncompleted child", () => {
    const todoList = new TodoList();
    const pId = todoList.addTodo("p", false);
    const cId = todoList.addTodo("c", false, pId);

    todoList.completeTodo(cId);

    expect(todoList.isComplete(pId)).toBeTruthy();
  });

  describe("TodoList.uncompleteTodo", () => {
    it("uncompletes a single todo", () => {
      const todoList = new TodoList();
      const id = todoList.addTodo("a", true);

      todoList.uncompleteTodo(id);

      expect(todoList.isComplete(id)).toBeFalsy();
    });

    it("uncompletes a todo and all its children", () => {
      const todoList = new TodoList();
      const pId = todoList.addTodo("p", true);
      const c1Id = todoList.addTodo("c1", true, pId);
      const c2Id = todoList.addTodo("c2", true, pId);

      todoList.uncompleteTodo(pId);

      expect(todoList.isComplete(c1Id)).toBeFalsy();
      expect(todoList.isComplete(c2Id)).toBeFalsy();
    });

    it("uncompletes a parent todo", () => {
      const todoList = new TodoList();
      const pId = todoList.addTodo("p", true);
      const cId = todoList.addTodo("c", true, pId);

      todoList.uncompleteTodo(cId);

      expect(todoList.isComplete(pId)).toBeFalsy();
    });
  });
});

describe("TodoList.toggleTodo", () => {
  it("completes an uncompleted todo", () => {
    const todoList = new TodoList();
    const id = todoList.addTodo("a", false);

    todoList.toggleTodo(id);

    expect(todoList.isComplete(id)).toBeTruthy();
  });

  it("uncompletes a completed todo", () => {
    const todoList = new TodoList();
    const id = todoList.addTodo("a", true);

    todoList.toggleTodo(id);

    expect(todoList.isComplete(id)).toBeFalsy();
  });
});

// describe("createChildTodo", () => {
//   it("creates a child todo", () => {
//     const text = `
//     - [ ] a
//     `;

//     const todos = parse(text);
//     createChildTodo(todos, 0);

//     const { 0: a, 1: a1 } = todos;

//     expect(a.childIds).toEqual([a1.id]);
//     expect(a.nextId).toBe(a1.id);

//     expect(a1.parentId).toBe(a.id);
//     expect(a1.prevId).toBe(a.id);
//     expect(a1.nextId).toBeNull();
//   });

//   it("uncompletes the parent todo", () => {
//     const text = `
//     - [x] a
//     `;

//     const [a] = parse(text);
//     createChildTodo([a], a.id);

//     expect(a.isComplete).toBeFalsy();
//   });
// });

// describe("createSiblingTodo", () => {
//   it("creates a sibling todo", () => {
//     const text = `
//     - [ ] a
//     `;

//     const todos = parse(text);
//     createSiblingTodo(todos, 0);

//     const [, b] = todos;

//     expect(b.parentId).toBeNull();
//   });

//   it("uncompletes the parent todo", () => {
//     const text = `
//     - [x] a
//       - [x] a1
//     `;

//     const todos = parse(text);
//     createSiblingTodo(todos, 1);

//     const [a] = todos;

//     expect(a.isComplete).toBeFalsy();
//   });
// });

// describe("deleteTodo", () => {
//   it("deletes a todo", () => {
//     const text = `
//     - [ ] a
//     - [ ] b
//     `;

//     const todos = parse(text);
//     deleteTodo(todos, 0);

//     expect(todos.length).toEqual(1);
//     expect(todos[0].body).toEqual("b");
//   });

//   it("deletes all nested todos", () => {
//     const text = `
//     - [ ] a
//       - [ ] a1
//         - [ ] a1i
//       - [ ] a2
//     - [ ] b
//     `;

//     const todos = parse(text);
//     deleteTodo(todos, 0);

//     expect(todos.length).toEqual(1);
//     expect(todos[0].body).toEqual("b");
//   });

//   it("completes the parent todo if it was the last uncompleted child", () => {
//     const text = `
//     - [ ] a
//       - [x] a1
//       - [ ] a2
//     `;

//     const todos = parse(text);
//     deleteTodo(todos, 2);

//     expect(todos[0].isComplete).toBeTruthy();
//   });
// });

// describe("format", () => {
//   it("prints a todo list", () => {
//     const text = `
//     - [x] a
//     - [ ] b
//     `;

//     const todos = parse(text);
//     const formatted = format(todos);

//     expect(formatted).toEqual("- [x] a\n- [ ] b");
//   });

//   it("prints a todo list with nested todos", () => {
//     const text = `
//     - [ ] a
//       - [ ] a1
//         - [ ] a1i
//     `;

//     const todos = parse(text);
//     const formatted = format(todos);

//     expect(formatted).toEqual("- [ ] a\n  - [ ] a1\n    - [ ] a1i");
//   });
// });
