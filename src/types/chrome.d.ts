
// Type definitions for Chrome extension API
declare namespace chrome {
  export namespace runtime {
    interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
    }

    export function getManifest(): any;
    export function getURL(path: string): string;
    export function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    export function sendMessage(
      extensionId: string,
      message: any,
      responseCallback?: (response: any) => void
    ): void;
    
    export const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
    };
    
    export const onInstalled: {
      addListener(callback: (details: {
        reason: string;
        previousVersion?: string;
        id?: string;
      }) => void): void;
    };
  }

  export namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      favIconUrl?: string;
      index: number;
      windowId: number;
      highlighted: boolean;
      active: boolean;
      pinned: boolean;
      audible?: boolean;
      discarded: boolean;
      autoDiscardable: boolean;
      groupId: number;
      status?: string;
    }

    export function query(queryInfo: object, callback: (tabs: Tab[]) => void): void;
    export function sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
    
    export const onUpdated: {
      addListener(
        callback: (tabId: number, changeInfo: { status?: string, url?: string }, tab: Tab) => void
      ): void;
      removeListener(
        callback: (tabId: number, changeInfo: { status?: string, url?: string }, tab: Tab) => void
      ): void;
    };
  }

  export namespace action {
    export function setBadgeText(details: {
      text: string;
      tabId?: number;
    }): void;
    
    export function setBadgeBackgroundColor(details: {
      color: string;
      tabId?: number;
    }): void;
  }
}
