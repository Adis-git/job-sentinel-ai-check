
// Type definitions for Chrome extension API
declare namespace chrome {
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
    }

    export function query(queryInfo: object, callback: (tabs: Tab[]) => void): void;
    export function sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
  }

  export namespace runtime {
    export function onMessage(callback: (message: any, sender: any, sendResponse: any) => void): void;
    export function sendMessage(message: any, callback?: (response: any) => void): void;
  }
}
