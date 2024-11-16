import { NetworkConfig } from "../types/network";

const SETTINGS_KEY = 'network_settings_backup';
const DEFAULT_SETTINGS: NetworkConfig = {
  dns: "8.8.8.8",
  mtu: 1500,
  bufferSize: 65536,
  tcpNoDelay: true,
  tcpWindowSize: 65536,
  nagleAlgorithm: false,
  qosEnabled: true
};

export const backupCurrentSettings = async () => {
  try {
    const currentSettings = await window.electron.invoke('get-current-settings');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
    return currentSettings;
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    throw error;
  }
};

export const restoreSettings = async (): Promise<NetworkConfig | null> => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (!savedSettings) return null;

    const settings: NetworkConfig = JSON.parse(savedSettings);
    await window.electron.invoke('apply-settings', settings);
    return settings;
  } catch (error) {
    console.error('Erro ao restaurar:', error);
    throw error;
  }
};

export const revertToDefault = async (): Promise<NetworkConfig> => {
  try {
    await window.electron.invoke('apply-settings', DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Erro ao reverter:', error);
    throw error;
  }
};

export const applySettings = async (config: NetworkConfig) => {
  try {
    await window.electron.invoke('apply-settings', config);
  } catch (error) {
    console.error('Erro ao aplicar:', error);
    throw error;
  }
};