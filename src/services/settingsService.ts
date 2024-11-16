import { NetworkConfig } from "../types/network";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    const currentSettings = await getCurrentWindowsSettings();
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
    await applyWindowsSettings(settings);
    return settings;
  } catch (error) {
    console.error('Erro ao restaurar:', error);
    throw error;
  }
};

export const revertToDefault = async (): Promise<NetworkConfig> => {
  try {
    await applyWindowsSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Erro ao reverter:', error);
    throw error;
  }
};

export const applySettings = async (config: NetworkConfig) => {
  try {
    await applyWindowsSettings(config);
  } catch (error) {
    console.error('Erro ao aplicar:', error);
    throw error;
  }
};

async function getCurrentWindowsSettings(): Promise<NetworkConfig> {
  const { stdout: dnsOutput } = await execAsync('powershell -Command "Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses | Select-Object -First 1"');
  const { stdout: mtuOutput } = await execAsync('powershell -Command "Get-NetIPInterface | Where-Object {$_.InterfaceAlias -eq \'Ethernet\'} | Select-Object -ExpandProperty NlMtu"');
  const { stdout: tcpOutput } = await execAsync('powershell -Command "Get-NetTCPSetting -SettingName InternetCustom | ConvertTo-Json"');
  const { stdout: qosOutput } = await execAsync('powershell -Command "Get-NetQosPolicy | Where-Object {$_.Name -eq \'DefaultPolicy\'} | Select-Object -ExpandProperty Enabled"');

  const tcpSettings = JSON.parse(tcpOutput);

  return {
    dns: dnsOutput.trim(),
    mtu: parseInt(mtuOutput.trim()),
    bufferSize: tcpSettings.ReceiveBufferSize,
    tcpNoDelay: !tcpSettings.DelayedAckTimeout,
    tcpWindowSize: tcpSettings.WindowSize,
    nagleAlgorithm: tcpSettings.NagleAlgorithm,
    qosEnabled: qosOutput.trim().toLowerCase() === 'true'
  };
}

async function applyWindowsSettings(config: NetworkConfig): Promise<void> {
  const commands = [
    `Set-DnsClientServerAddress -InterfaceAlias 'Ethernet' -ServerAddresses ${config.dns}`,
    `Set-NetIPInterface -InterfaceAlias 'Ethernet' -NlMtuBytes ${config.mtu}`,
    `Set-NetTCPSetting -SettingName InternetCustom -ReceiveBufferSize ${config.bufferSize}`,
    `Set-NetTCPSetting -SettingName InternetCustom -WindowSize ${config.tcpWindowSize}`,
    `Set-NetTCPSetting -SettingName InternetCustom -DelayedAckTimeout ${config.tcpNoDelay ? 0 : 1}`,
    `Set-NetTCPSetting -SettingName InternetCustom -NagleAlgorithm ${config.nagleAlgorithm}`,
    `${config.qosEnabled ? 'Enable' : 'Disable'}-NetQosPolicy -Name 'DefaultPolicy'`
  ];

  for (const command of commands) {
    await execAsync(`powershell -Command "${command}"`);
  }
}