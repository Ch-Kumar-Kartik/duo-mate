import type {
  IListMessagesOptions,
  IListMessagesResponse,
  IGmailMessage,
} from "../types/email.js";

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export class GmailClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  async listMessages(
    options: IListMessagesOptions,
  ): Promise<IListMessagesResponse> {
    const url = new URL(`${GMAIL_API_BASE}/messages`);

    if (options.query !== undefined) {
      url.searchParams.set("q", options.query);
    }

    if (options.maxResults !== undefined) {
      url.searchParams.set("maxResults", options.maxResults.toString());
    }

    if (options.pageToken) {
      url.searchParams.set("pageToken", options.pageToken);
    }

    for (const labelId of options.labelIds ?? []) {
      url.searchParams.append("labelIds", labelId);
    }

    const response = await fetch(url.toString(), {
      headers: this.headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token expired");
      }
      throw new Error("Failed to list messages");
    }

    const data = (await response.json()) as IListMessagesResponse;
    return data;
  }

  async getMessage(messageId: string): Promise<IGmailMessage> {
    const url = new URL(`${GMAIL_API_BASE}/messages/${messageId}?format=full`);
    const response = await fetch(url.toString(), {
      headers: this.headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Token expired");
      }
      throw new Error("Failed to get message");
    }

    const data = (await response.json()) as IGmailMessage;
    return data;
  }

  async getMessagesBatch(messageIds: string[]): Promise<IGmailMessage[]> {
    const chunkSize = 10;
    const results: IGmailMessage[] = [];

    for (let i = 0; i < messageIds.length; i += chunkSize) {
      const chunk = messageIds.slice(i, i + chunkSize);

      const chunkResults = await Promise.all(
        chunk.map((id) => this.getMessage(id)),
      );

      results.push(...chunkResults);

      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      if (i + chunkSize < messageIds.length) {
        await sleep(100);
      }
    }
    return results;
  }

  async listAllMessages(
    options: IListMessagesOptions,
    maxPages?: number,
  ): Promise<{ id: string; threadId: string }[]> {
    const allMessages: { id: string; threadId: string }[] = [];

    let pageToken: string | undefined = options.pageToken;
    let pagesFetched = 0;

    while (true) {
      if (maxPages !== undefined && pagesFetched >= maxPages) {
        break;
      }

      const result = await this.listMessages({
        ...options,
        pageToken,
      });

      if (result.messages?.length) {
        allMessages.push(...result.messages);
      }

      pagesFetched += 1;

      if (!result.nextPageToken) {
        break;
      }

      pageToken = result.nextPageToken;
    }

    return allMessages;
  }
}
