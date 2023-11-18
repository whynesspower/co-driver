import * as vscode from "vscode";
import axios from "axios";
import OpenAI from "openai";
const openai = new OpenAI();
require("dotenv").config();

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "co-driver" is now active!');

  let disposable = vscode.commands.registerCommand(
    "co-driver.startChat",
    async () => {
      // Open a panel for the chat
      const panel = vscode.window.createWebviewPanel(
        "co-driverChat",
        "Co-Driver Chat",
        vscode.ViewColumn.One,
        {}
      );

      // Set up the initial message
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" },
      ];

      // Function to send a message and update thde chat
      const sendMessage = async (content: string, role: string) => {
        messages.push({ role, content });

        try {
          const response = await openai.chat.completions.create({
            messages: [
              { role: "system", content: "You are a helpful assistant." },
            ],
            model: "gpt-3.5-turbo",
          });

          console.log(response.choices[0]);

          // const reply = response.data.choices[0].message.content;
          const reply = response.choices[0].message.content
            ? response.choices[0].message.content
            : undefined;
          // const reply = "First Reply from GPT";
          // Update the chat panel
          panel.webview.html = getChatHtml(messages, reply);
          console.log(messages);
        } catch (error) {
          console.error("Error sending message to API:", error);
        }
      };

      // Set up the initial chat panel content
      panel.webview.html = getChatHtml(messages);

      vscode.window.showInformationMessage("Start Chat Function running!");
      // Handle user input and call sendMessage
      const disposableInput = vscode.window.onDidChangeTextEditorSelection(
        (event) => {
          const editor = vscode.window.activeTextEditor;

          if (editor) {
            const selection = editor.selection;
            const userMessage = editor.document.getText(selection);

            if (userMessage.trim() !== "") {
              sendMessage(userMessage, "user");
            }
          }
        }
      );

      context.subscriptions.push(disposableInput);
    }
  );

  context.subscriptions.push(disposable);
}

function getChatHtml(
  messages: { role: string; content: string }[],
  reply?: string
): string {
  const chatHistory = messages
    .map((message) => {
      const roleClass =
        message.role === "user" ? "user-message" : "assistant-message";
      return `<div class="${roleClass}">${message.content}</div>`;
    })
    .join("");

  const replyHtml = reply
    ? `<div class="assistant-message">${reply}</div>`
    : "";

  return `
      <html>
          <head>
              <style>
                  body {
                      font-family: 'Arial', sans-serif;
                      margin: 10px;
                  }
                  .chat-panel {
                      display: flex;
                      flex-direction: column;
                      height: 100%;
                  }
                  .chat-history {
                      flex: 1;
                      overflow-y: auto;
                  }
                  .user-message {
                      background-color: #e6f7ff;
                      padding: 8px;
                      border-radius: 8px;
                      margin-bottom: 8px;
                      max-width: 70%;
                      align-self: flex-end;
                      color: black;
                  }
                  .assistant-message {
                      background-color: #f0f0f0;
                      padding: 8px;
                      border-radius: 8px;
                      margin-bottom: 8px;
                      max-width: 70%;
                      color: black;
                  }
                  .input-container {
                      display: flex;
                      margin-top: 10px;
                  }
                  .message-input {
                      flex: 1;
                      margin-right: 10px;
                      padding: 8px;
                      border-radius: 8px;
                      border: 1px solid #ccc;
                      color: black;
                  }
                  .send-button {
                      padding: 8px;
                      border: 1px solid #ccc;
                      border-radius: 8px;
                      cursor: pointer;
                  }
              </style>
          </head>
          <body>
              <div class="chat-panel">
                  <div class="chat-history">${chatHistory}${replyHtml}</div>
                  <div class="input-container">
                      <input type="text" class="message-input" id="userMessage" placeholder="Type your message...">
                      <div class="send-button" onclick="sendMessage()">Send</div>
                  </div>
              </div>
              <script>
                  function sendMessage() {
                      const userMessage = document.getElementById('userMessage').value;
                      vscode.postMessage({
                          command: 'sendMessage',
                          text: userMessage
                      });
                  }
              </script>
          </body>
      </html>
  `;
}
