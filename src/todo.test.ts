import {
  completeTodo,
  format,
  parse,
  toggleTodo,
  uncompleteTodo,
  createChildTodo,
} from "./todo";

describe("parse", () => {
  it("parses a single unchecked todo", () => {
    const text = `
    - [ ] a
    `;

    const [todo] = parse(text);

    expect(todo.body).toBe("a");
    expect(todo.isComplete).toBeFalsy();
  });

  it("parses a single unchecked todo", () => {
    const text = `
    - [x] a
    `;

    const [todo] = parse(text);

    expect(todo.body).toBe("a");
    expect(todo.isComplete).toBeTruthy();
  });

  it("parses multiple top level todos", () => {
    const text = `
    - [ ] a
    - [ ] b
    `;

    const todos = parse(text);

    expect(todos.map((todo) => todo.body)).toEqual(["a", "b"]);
  });

  it("parses a nested todo", () => {
    const text = `
    - [ ] a
      - [ ] a1
    `;

    const [a, a1] = parse(text);

    expect(a1.parentId).toBe(a.id);
  });

  it("parses multiple nested todos", () => {
    const text = `
    - [ ] a
      - [ ] a1
      - [ ] a2
    `;

    const [a, a1, a2] = parse(text);

    expect(a1.parentId).toBe(a.id);
    expect(a2.parentId).toBe(a.id);
  });

  it("parses a todo after a nested todo", () => {
    const text = `
    - [ ] a
      - [ ] a1
        - [ ] a1i
      - [ ] a2
    `;

    const [a, , , a2] = parse(text);

    expect(a2.parentId).toBe(a.id);
  });

  it("parses child relationships", () => {
    const text = `
    - [ ] a
      - [ ] a1
      - [ ] a2
    `;

    const [a, a1, a2] = parse(text);

    expect(a.childIds).toEqual([a1.id, a2.id]);
  });
});

describe("completeTodo", () => {
  it("completes a single todo", () => {
    const text = `
    - [ ] a
    `;

    const [todo] = parse(text);
    completeTodo([todo], todo.id);

    expect(todo.isComplete).toBeTruthy();
  });

  it("completes a todo and all its children", () => {
    const text = `
    - [ ] a
      - [ ] a1
      - [ ] a2
    `;

    const todos = parse(text);
    completeTodo(todos, todos[0].id);

    expect(todos.every((todo) => todo.isComplete)).toBeTruthy();
  });

  it("completes a parent todo if it was the last uncompleted child", () => {
    const text = `
    - [ ] a
      - [x] a1
      - [ ] a2
    `;

    const todos = parse(text);
    completeTodo(todos, todos[2].id);

    expect(todos[0].isComplete).toBeTruthy();
  });
});

describe("uncompleteTodo", () => {
  it("uncompletes a single todo", () => {
    const text = `
    - [x] a
    `;

    const [todo] = parse(text);
    uncompleteTodo([todo], todo.id);

    expect(todo.isComplete).toBeFalsy();
  });

  it("uncompletes a todo and all its children", () => {
    const text = `
    - [x] a
      - [x] a1
      - [x] a2
    `;

    const todos = parse(text);
    uncompleteTodo(todos, todos[0].id);

    expect(todos.map((todo) => todo.isComplete)).toEqual([false, false, false]);
  });

  it("uncompletes a parent todo", () => {
    const text = `
    - [x] a
      - [x] a1
    `;

    const todos = parse(text);
    uncompleteTodo(todos, todos[1].id);

    expect(todos.map((todo) => todo.isComplete)).toEqual([false, false]);
  });
});

describe("toggleTodo", () => {
  it("completes an uncompleted todo", () => {
    const text = `
    - [ ] a
    `;

    const [todo] = parse(text);
    toggleTodo([todo], todo.id);

    expect(todo.isComplete).toBeTruthy();
  });

  it("uncompletes a completed todo", () => {
    const text = `
    - [x] a
    `;

    const [todo] = parse(text);
    toggleTodo([todo], todo.id);

    expect(todo.isComplete).toBeFalsy();
  });
});

describe("createChildTodo", () => {
  it("creates a child todo", () => {
    const text = `
    - [ ] a
    `;

    const todos = parse(text);
    createChildTodo(todos, 0);

    const [a, a1] = todos;

    expect(a.childIds).toEqual([a1.id]);
    expect(a1.parentId).toEqual(a.id);
  });

  it("uncompletes the parent todo", () => {
    const text = `
    - [x] a
    `;

    const [a] = parse(text);
    createChildTodo([a], a.id);

    expect(a.isComplete).toBeFalsy();
  });
});

describe("format", () => {
  it("prints a todo list", () => {
    const text = `
    - [x] a
    - [ ] b
    `;

    const todos = parse(text);
    const formatted = format(todos);

    expect(formatted).toEqual("- [x] a\n- [ ] b");
  });

  it("prints a todo list with nested todos", () => {
    const text = `
    - [ ] a
      - [ ] a1
        - [ ] a1i
    `;

    const todos = parse(text);
    const formatted = format(todos);

    expect(formatted).toEqual("- [ ] a\n  - [ ] a1\n    - [ ] a1i");
  });
});
