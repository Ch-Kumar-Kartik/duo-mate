import axios from "axios";
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

    const response = await axios.get<IListMessagesResponse>(url.toString(), {
      headers: this.headers,
      validateStatus: null,
    });

    if (response.status === 401) {
      throw new Error("Token expired");
    }

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Failed to list messages: HTTP ${response.status}`);
    }

    return response.data;
  }

  async getMessage(messageId: string): Promise<IGmailMessage> {
    const url = `${GMAIL_API_BASE}/messages/${messageId}?format=full`;

    const response = await axios.get<IGmailMessage>(url, {
      headers: this.headers,
      validateStatus: null,
    });

    if (response.status === 401) {
      throw new Error("Token expired");
    }

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Failed to get message ${messageId}: HTTP ${response.status}`,
      );
    }

    return response.data;
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

      if (i + chunkSize < messageIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
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
