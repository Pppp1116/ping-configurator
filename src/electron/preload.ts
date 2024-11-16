import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
});

export type ElectronAPI = {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
};

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}