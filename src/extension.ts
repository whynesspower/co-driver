import axios from "axios";
import * as vscode from "vscode";
import { ApiKeyManager } from "./ApiKeyManager";
import { WebviewContainer } from "./webview/WebviewContainer";
import OpenAI from "openai";

export const activate = async (context: vscode.ExtensionContext) => {
  vscode.window.showInformationMessage("ACTIVATEDD.");
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

  // context.subscriptions.push(
  //   vscode.commands.registerCommand("codriver.chat.baat", async () => {
  //     const activeEditor = vscode.window.activeTextEditor;
  //     const document = activeEditor?.document;
  //     const range = activeEditor?.selection;

  //     if (range == null || document == null) {
  //       return;
  //     }

  //     const selectedText = document.getText(range);

  //     if (selectedText.length === 0) {
  //       return;
  //     }

  //     const openAIApiKey = await apiKeyManager.getOpenAIApiKey();
  //     const openai = new OpenAI({
  //       apiKey: openAIApiKey,
  //     });

  //     const chatCompletion = await openai.chat.completions.create({
  //       messages: [{ role: "user", content: "Explain me this code" }],
  //       model: "gpt-3.5-turbo",
  //       stream: true,
  //     });

  //     for await (const chat of chatCompletion) {
  //       process.stdout.write(chat.choices[0]?.delta?.content || "");
  //     }

  //     const completion = response.data.choices[0].text;

  //     await vscode.commands.executeCommand("codriver.chat.focus");
  //     await webviewPanel?.update(completion);
  //   })
  // );

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
      // const response = await axios.post(
      //   `https://api.openai.com/v1/completions`,
      //   {
      //     model: "text-davinci-003",
      //     prompt: `Explain the code below:\n\n ${selectedText}`,
      //     max_tokens: 1024,
      //     temperature: 0,
      //     // top_p is excluded because temperature is set
      //     best_of: 1,
      //     frequency_penalty: 0,
      //     presence_penalty: 0,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${openAIApiKey}`,
      //     },
      //   }
      // );

      // const completion = response.data.choices[0].text;
      const completion = chatCompletion.choices[0]?.message?.content || "";
      await vscode.commands.executeCommand("codriver.chat.focus");
      await webviewPanel?.update(completion);
    })
  );
};

export const deactivate = async () => {};
