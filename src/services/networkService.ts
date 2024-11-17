import { NetworkConfig, PingResult, ServerRegion } from "../types/network";
import { applySettings } from "./settingsService";

export const EPIC_SERVERS: ServerRegion[] = [
  { id: "eu-central", name: "Europa Central", url: "epic-games-api.arvancloud.com" },
  { id: "na-east", name: "América do Norte (Leste)", url: "epicgames-download1.akamaized.net" },
  { id: "na-west", name: "América do Norte (Oeste)", url: "download.epicgames.com" },
  { id: "sa-east", name: "América do Sul", url: "download2.epicgames.com" },
];

export const DNS_SERVERS = [
  "8.8.8.8",
  "1.1.1.1",
  "208.67.222.222",
];

export const MTU_SIZES = [1500, 1492, 1468, 1400];
export const BUFFER_SIZES = [8192, 16384, 32768, 65536];
export const TCP_WINDOW_SIZES = [65536, 131072, 262144, 524288];

export const pingServer = async (url: string): Promise<number> => {
  try {
    const result = await window.electron.invoke('ping-server', url);
    return result;
  } catch (error) {
    console.error('Erro ao fazer ping:', error);
    return -1;
  }
};

export const formatTimeEstimate = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} segundos`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minuto${minutes > 1 ? 's' : ''}${remainingSeconds > 0 ? ` e ${remainingSeconds} segundos` : ''}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hora${hours > 1 ? 's' : ''}${minutes > 0 ? ` e ${minutes} minutos` : ''}`;
  }
};

export const testConfiguration = async (
  server: ServerRegion,
  config: NetworkConfig
): Promise<PingResult> => {
  await applySettings(config);
  
  // Aguarda 2 segundos para as configurações serem aplicadas
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Faz 4 pings e pega a média
  const latency = await pingServer(server.url);
  
  return {
    timestamp: Date.now(),
    latency,
    config,
  };
};
