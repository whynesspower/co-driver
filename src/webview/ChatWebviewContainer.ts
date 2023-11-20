import * as vscode from "vscode";

export class ChatWebviewContainer {
  private readonly webview: vscode.Webview;

  constructor({ webview }: { webview: vscode.Webview }) {
    this.webview = webview;
    this.update("");
  }

  async update(chatContent: string) {
    this.webview.html = this.getHtml(chatContent);
  }

  private getHtml(chatContent: string): string {
    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none';" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
          <div id="chat-container">
            <div id="chat-messages">${chatContent}</div>
            <div id="chat-input-container">
              <input type="text" id="chat-input" />
              <button onclick="sendMessage()">Send</button>
            </div>
          </div>
          <script>
            function sendMessage() {
              const inputField = document.getElementById('chat-input');
              const message = inputField.value;
              // Add logic here to send the message to the API and update chat
              inputField.value = ''; // Clear the input field after sending
            }
          </script>
        </body>
      </html>`;
  }
}
