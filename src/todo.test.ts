import { TodoList } from "./todo";

describe("TodoList.addTodo", () => {
  it("adds a todo", () => {
    const todoList = new TodoList();

    const id = todoList.addTodo("a", false);

    expect(todoList.body(id)).toBe("a");
    expect(todoList.isComplete(id)).toBeFalsy();
  });
});

describe("TodoList.parse", () => {
  it("parses a single unchecked todo", () => {
    const text = `
    - [ ] a
    `;

    const todoList = TodoList.parse(text);

    expect(todoList.body(0)).toBe("a");
    expect(todoList.isComplete(0)).toBeFalsy();
  });

  it("parses a single checked todo", () => {
    const text = `
    - [x] a
    `;

    const todoList = TodoList.parse(text);

    expect(todoList.body(0)).toBe("a");
    expect(todoList.isComplete(0)).toBeTruthy();
  });

  it("parses multiple top level todos", () => {
    const text = `
    - [ ] a
    - [ ] b
    `;

    const todoList = TodoList.parse(text);

    expect(todoList.body(0)).toBe("a");
    expect(todoList.body(1)).toBe("b");
  });

  it("parses a nested todo", () => {
    const text = `
    - [ ] a
      - [ ] a1
      - [ ] a2
    `;

    const todoList = TodoList.parse(text);

    expect(todoList.parentId(1)).toBe(0);
    expect(todoList.parentId(2)).toBe(0);
  });

  it("parses a todo after a nested todo", () => {
    const text = `
    - [ ] a
      - [ ] a1
        - [ ] a1i
      - [ ] a2
    `;

    const todoList = TodoList.parse(text);

    expect(todoList.parentId(3)).toBe(0);
  });
});

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

describe("TodoList.toString", () => {
  it("stringifies a single completed todo", () => {
    const todoList = new TodoList();
    todoList.addTodo("a", true);

    const stringified = todoList.toString();

    expect(stringified).toEqual("- [x] a");
  });

  it("stringifies a single uncompleted todo", () => {
    const todoList = new TodoList();
    todoList.addTodo("a", false);

    const stringified = todoList.toString();

    expect(stringified).toEqual("- [ ] a");
  });

  it("stringifies multiple top level todos", () => {
    const todoList = new TodoList();
    todoList.addTodo("a", true);
    todoList.addTodo("b", true);

    const stringified = todoList.toString();

    expect(stringified).toEqual("- [x] a\n- [x] b");
  });

  it("stringifies nested todos", () => {
    const todoList = new TodoList();
    const id = todoList.addTodo("a", true);
    todoList.addTodo("a1", true, id);

    const stringified = todoList.toString();

    expect(stringified).toEqual("- [x] a\n  - [x] a1");
  });
});
