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
    vscode.commands.registerCommand("vs-todo.createTodo", () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        // parseTodoList(editor.document.getText());
        // editor.edit((editBuilder) => {
        //   editBuilder.insert(editor.selection.active, "\r\n- [ ] ");
        // });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vs-todo.completeTodo", () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const todoList = TodoList.fromText(editor.document.getText());

        const currentLine = editor.selection.active.line;

        const startPosition = new vscode.Position(0, 0);
        const endPosition = new vscode.Position(editor.document.lineCount, 0);
        const range = new vscode.Range(startPosition, endPosition);

        editor.edit((editBuilder) => {
          editBuilder.replace(range, todoList.toString() + "\n");
        });
      }
    })
  );
}

export function deactivate() {}
