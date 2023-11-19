import * as vscode from "vscode";

const OPEN_AI_API_KEY_SECRET_KEY = "codriver.openAI.apiKey";

export class ApiKeyManager {
  private readonly secretStorage: vscode.SecretStorage;

  constructor({ secretStorage }: { secretStorage: vscode.SecretStorage }) {
    this.secretStorage = secretStorage;
  }

  async clearOpenAIApiKey(): Promise<void> {
    await this.secretStorage.delete(OPEN_AI_API_KEY_SECRET_KEY);
  }

  async getOpenAIApiKey(): Promise<string | undefined> {
    return this.secretStorage.get(OPEN_AI_API_KEY_SECRET_KEY);
  }

  private async storeApiKey(apiKey: string): Promise<void> {
    return this.secretStorage.store(OPEN_AI_API_KEY_SECRET_KEY, apiKey);
  }

  async enterOpenAIApiKey() {
    await this.clearOpenAIApiKey();

    const apiKey = await vscode.window.showInputBox({
      title: "Enter your Open AI API key",
      ignoreFocusOut: true,
      placeHolder: "Open AI API key",
    });

    if (apiKey == null) {
      return; // user aborted input
    }

    await this.storeApiKey(apiKey);

    vscode.window.showInformationMessage("OpenAI API key stored.");
  }
}
