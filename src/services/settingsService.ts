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
    // Obter configurações atuais do Windows usando PowerShell
    const currentSettings = await getCurrentWindowsSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
    return currentSettings;
  } catch (error) {
    console.error('Erro ao fazer backup das configurações:', error);
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
    console.error('Erro ao restaurar configurações:', error);
    throw error;
  }
};

export const revertToDefault = async (): Promise<NetworkConfig> => {
  try {
    await applyWindowsSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Erro ao reverter configurações:', error);
    throw error;
  }
};

export const applySettings = async (config: NetworkConfig) => {
  try {
    await applyWindowsSettings(config);
  } catch (error) {
    console.error('Erro ao aplicar configurações:', error);
    throw error;
  }
};

// Funções auxiliares para interagir com o Windows
async function getCurrentWindowsSettings(): Promise<NetworkConfig> {
  // Executar comandos PowerShell para obter configurações atuais
  const command = `
    $dns = Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses | Select-Object -First 1
    $mtu = Get-NetIPInterface | Where-Object {$_.InterfaceAlias -eq 'Ethernet'} | Select-Object -ExpandProperty NlMtu
    $tcpParams = Get-NetTCPSetting
    $qos = Get-NetQosPolicy | Where-Object {$_.Name -eq 'DefaultPolicy'} | Select-Object -ExpandProperty Enabled
    
    @{
      dns = $dns
      mtu = $mtu
      bufferSize = $tcpParams.ReceiveBufferSize
      tcpNoDelay = !$tcpParams.DelayedAckTimeout
      tcpWindowSize = $tcpParams.WindowSize
      nagleAlgorithm = $tcpParams.NagleAlgorithm
      qosEnabled = $qos
    } | ConvertTo-Json
  `;

  // Em uma implementação real, isso executaria o PowerShell
  // Por enquanto, retornamos as configurações padrão
  return DEFAULT_SETTINGS;
}

async function applyWindowsSettings(config: NetworkConfig): Promise<void> {
  // Executar comandos PowerShell para aplicar as configurações
  const command = `
    # Configurar DNS
    Set-DnsClientServerAddress -InterfaceAlias 'Ethernet' -ServerAddresses ${config.dns}
    
    # Configurar MTU
    Set-NetIPInterface -InterfaceAlias 'Ethernet' -NlMtuBytes ${config.mtu}
    
    # Configurar TCP
    Set-NetTCPSetting -SettingName InternetCustom -ReceiveBufferSize ${config.bufferSize}
    Set-NetTCPSetting -SettingName InternetCustom -WindowSize ${config.tcpWindowSize}
    Set-NetTCPSetting -SettingName InternetCustom -DelayedAckTimeout ${config.tcpNoDelay ? 0 : 1}
    Set-NetTCPSetting -SettingName InternetCustom -NagleAlgorithm ${config.nagleAlgorithm}
    
    # Configurar QoS
    ${config.qosEnabled ? 'Enable' : 'Disable'}-NetQosPolicy -Name 'DefaultPolicy'
  `;

  // Em uma implementação real, isso executaria o PowerShell
  console.log('Aplicando configurações:', config);
}