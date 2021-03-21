import { homedir } from "os";
import { join } from "path";
import * as vscode from "vscode";
import { getFormattedDate } from "./date";
import { TodoList } from "./todo";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vs-todo.open", async () => {
      const value = await vscode.window.showInputBox();
      if (value === undefined) {
        return;
      }
      const formattedDate = getFormattedDate(value);
      const todoPath = join(homedir(), "todos", `${formattedDate}.md`);
      const uri = vscode.Uri.file(todoPath);
      const edit = new vscode.WorkspaceEdit();
      edit.createFile(uri, { ignoreIfExists: true });
      await vscode.workspace.applyEdit(edit);
      vscode.commands.executeCommand("vscode.open", uri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vs-todo.completeTodo", () => {
      runTodoCommand((todoList, currentLine) =>
        todoList.completeTodo(currentLine)
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vs-todo.uncompleteTodo", () => {
      runTodoCommand((todoList, currentLine) =>
        todoList.uncompleteTodo(currentLine)
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vs-todo.toggleTodo", () => {
      runTodoCommand((todoList, currentLine) =>
        todoList.toggleTodo(currentLine)
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vs-todo.createChildTodo", () => {
      runTodoCommand((todoList, currentLine) =>
        todoList.addTodo("", false, currentLine)
      );
    })
  );
}

function runTodoCommand(
  command: (todoList: TodoList, currentLine: number) => void,
  onDidFormat?: () => void
) {
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const todoList = TodoList.parse(editor.document.getText());
    const currentLine = editor.selection.active.line;

    command(todoList, currentLine);
    formatFile(todoList, editor);

    if (onDidFormat) {
      onDidFormat();
    }
  }
}

function formatFile(todoList: TodoList, editor: vscode.TextEditor) {
  const startPosition = new vscode.Position(0, 0);
  const endPosition = new vscode.Position(editor.document.lineCount, 0);
  const range = new vscode.Range(startPosition, endPosition);

  editor.edit((editBuilder) => {
    editBuilder.replace(range, todoList.toString() + "\n");
  });
}

async function moveCursorToEndOfLine(numLinesDown: number = 0) {
  await vscode.commands.executeCommand("cursorMove", {
    to: "down",
    by: "line",
    value: numLinesDown,
  });
  await vscode.commands.executeCommand("cursorMove", {
    to: "wrappedLineEnd",
  });
}

export function deactivate() {}
