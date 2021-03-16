import { homedir } from "os";
import { join } from "path";
import * as vscode from "vscode";
import { getFormattedDate } from "./date";

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
}

export function deactivate() {}
