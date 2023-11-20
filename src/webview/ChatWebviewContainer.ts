import * as vscode from "vscode";

export class ChatWebviewContainer {
  private readonly webview: vscode.Webview;
  private readonly onSendMessage: (message: string) => void;

  constructor({
    webview,
    onSendMessage,
  }: {
    webview: vscode.Webview;
    onSendMessage: (message: string) => void;
  }) {
    this.webview = webview;
    this.onSendMessage = onSendMessage;
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
              <button id="send-button">Send</button>
            </div>
          </div>
          <script>
            function sendMessage() {
              console.log('send message RANN');
              const inputField = document.getElementById('chat-input');
              const message = inputField.value;
              
              // Use 'window.vscode' to access the onSendMessage function
              window.vscode.postMessage(message);

              inputField.value = '';
            }

            // Use window.vscode to access the onSendMessage function
            window.vscode = acquireVsCodeApi();
            document.getElementById('send-button').addEventListener('click', sendMessage);
       </script>
        </body>
      </html>`;
  }
}
