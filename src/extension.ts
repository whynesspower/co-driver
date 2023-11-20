import axios from "axios";
import * as vscode from "vscode";
import { ApiKeyManager } from "./ApiKeyManager";
import { WebviewContainer } from "./webview/WebviewContainer";
import OpenAI from "openai";
import { ChatWebviewContainer } from "./webview/ChatWebviewContainer"; // Adjust the path based on your project structure

export const activate = async (context: vscode.ExtensionContext) => {
  vscode.window.showInformationMessage("ACTIVATED");
  const apiKeyManager = new ApiKeyManager({
    secretStorage: context.secrets,
  });

  let webviewPanel: WebviewContainer | undefined;

  const chatPanel: vscode.WebviewViewProvider = {
    async resolveWebviewView(webviewView: vscode.WebviewView) {
      webviewPanel = new WebviewContainer({
        webview: webviewView.webview,
      });
    },
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("codriver.chat", chatPanel)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codriver.enterOpenAIApiKey",
      apiKeyManager.enterOpenAIApiKey.bind(apiKeyManager)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codriver.clearOpenAIApiKey", async () => {
      await apiKeyManager.clearOpenAIApiKey();
      vscode.window.showInformationMessage("OpenAI API key cleared.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codriver.chat.explainCode", async () => {
      const activeEditor = vscode.window.activeTextEditor;
      const document = activeEditor?.document;
      const range = activeEditor?.selection;

      if (range == null || document == null) {
        return;
      }

      const selectedText = document.getText(range);

      if (selectedText.length === 0) {
        return;
      }

      const openAIApiKey = await apiKeyManager.getOpenAIApiKey();

      const openai = new OpenAI({
        apiKey: openAIApiKey,
      });

      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Explain the code below:\n\n ${selectedText}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });
      const completion = chatCompletion.choices[0]?.message?.content || "";
      await vscode.commands.executeCommand("codriver.chat.focus");
      await webviewPanel?.update(completion);
    })
  );

  // adding the chatwindow
  let chatWebviewPanel: ChatWebviewContainer | undefined;

  const chatPanel2: vscode.WebviewViewProvider = {
    async resolveWebviewView(webviewView: vscode.WebviewView) {
      chatWebviewPanel = new ChatWebviewContainer({
        webview: webviewView.webview,
      });
    },
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("codriver.chat2", chatPanel2)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("codriver.chat2.startChat", async () => {
      const welcomeMessage = "Welcome to the custom chat!";
      await chatWebviewPanel?.update(`<div>${welcomeMessage}</div>`);

      // Handle other commands or interactions as needed
      // For example, you can add a message to the chat when the user clicks a button in the editor

      // You may want to add logic here to send the selected code to the chat

      // Example: Adding a message to the chat when user selects code

      // await chatWebviewPanel?.update(`<div>${message}</div>`);
    })
  );
};

export const deactivate = () => {};
