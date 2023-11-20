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
    resolveWebviewView(webviewView: vscode.WebviewView) {
      chatWebviewPanel = new ChatWebviewContainer({
        webview: webviewView.webview,
        onSendMessage: sendMessageFromWebview,
      });
    },
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("codriver.chat2", chatPanel2)
  );

  let chats: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" },
  ];

  context.subscriptions.push(
    vscode.commands.registerCommand("codriver.chat2.startChat", async () => {
      // Get the OpenAI API key
      vscode.window.showInformationMessage("star Chat running");
      const openAIApiKey = await apiKeyManager.getOpenAIApiKey();

      // Initialize the OpenAI client
      const openai = new OpenAI({
        apiKey: openAIApiKey,
      });

      // Perform chat completions
      const chatCompletion = await openai.chat.completions.create({
        messages: chats,
        model: "gpt-3.5-turbo",
        stream: true,
      });

      // Process the chat completions
      // var completion: string = "\n";
      for await (const chunk of chatCompletion) {
        const completion = chunk.choices[0].delta.content;
        console.log(completion);
        // Display the completion in the webview
        chatWebviewPanel?.update(`<div>${completion}</div>`);
      }
    })
  );

  // Function to handle messages sent from the webview
  function sendMessageFromWebview(message: string) {
    // Add the user's message to the chats array
    vscode.window.showInformationMessage("Message received by extension");
    chats.push({ role: "user", content: message });

    // Handle sending the updated chats array to the API and processing the response
    processUserMessage(message);
  }

  // Function to process user messages and interact with the OpenAI API
  async function processUserMessage(message: string) {
    // Handle sending the updated chats array to the API and processing the response
    vscode.window.showInformationMessage("req sent to processuserMessage");
    try {
      // Get the OpenAI API key
      const openAIApiKey = await apiKeyManager.getOpenAIApiKey();

      // Initialize the OpenAI client
      const openai = new OpenAI({
        apiKey: openAIApiKey,
      });

      // Perform chat completions
      const chatCompletion = await openai.chat.completions.create({
        messages: chats,
        model: "gpt-3.5-turbo",
        stream: true,
      });

      // Process the chat completions
      for await (const chunk of chatCompletion) {
        const completion = chunk.choices[0].delta.content;
        console.log(completion);
        vscode.window.showInformationMessage(
          "chat completion content: " + completion
        );
        // Display the completion in the webview
        chatWebviewPanel?.update(`<div>${completion}</div>`);
      }

      // Additional logic after processing the API response
      // ...
    } catch (error) {
      // Handle errors
      console.error("Error processing user message:", error);

      // You might want to update the webview with an error message or take other actions
      chatWebviewPanel?.update(`<div>Error processing user message</div>`);
    }
  }
};

export const deactivate = () => {};
