import { NetworkConfig, PingResult, ServerRegion } from "../types/network";
import { applySettings } from "./settingsService";

export const EPIC_SERVERS: ServerRegion[] = [
  { id: "eu-central", name: "Europa Central", url: "epicgames.com" },
  { id: "na-east", name: "América do Norte (Leste)", url: "epicgames.com" },
  { id: "na-west", name: "América do Norte (Oeste)", url: "epicgames.com" },
  { id: "sa-east", name: "América do Sul", url: "epicgames.com" },
];

export const DNS_SERVERS = [
  "8.8.8.8", // Google
  "1.1.1.1", // Cloudflare
  "208.67.222.222", // OpenDNS
];

export const MTU_SIZES = [1500, 1492, 1468, 1400];
export const BUFFER_SIZES = [8192, 16384, 32768, 65536];
export const TCP_WINDOW_SIZES = [65536, 131072, 262144, 524288];

export const pingServer = async (url: string): Promise<number> => {
  try {
    const command = `Test-Connection -ComputerName ${url} -Count 1 -Quiet`;
    // Em uma implementação real, isso executaria o PowerShell
    // Por enquanto, simulamos um ping aleatório entre 20ms e 200ms
    const randomPing = Math.floor(Math.random() * (200 - 20 + 1)) + 20;
    return randomPing;
  } catch (error) {
    console.error('Erro ao fazer ping:', error);
    return -1;
  }
};

export const testConfiguration = async (
  server: ServerRegion,
  config: NetworkConfig
): Promise<PingResult> => {
  // Aplicar configurações no Windows
  await applySettings(config);
  
  // Aguardar um momento para as configurações serem aplicadas
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Testar o ping
  const latency = await pingServer(server.url);
  
  return {
    timestamp: Date.now(),
    latency,
    config,
  };
};