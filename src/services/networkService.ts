import { NetworkConfig, PingResult, ServerRegion } from "../types/network";
import { applySettings } from "./settingsService";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const EPIC_SERVERS: ServerRegion[] = [
  { id: "eu-central", name: "Europa Central", url: "epicgames.com" },
  { id: "na-east", name: "América do Norte (Leste)", url: "epicgames.com" },
  { id: "na-west", name: "América do Norte (Oeste)", url: "epicgames.com" },
  { id: "sa-east", name: "América do Sul", url: "epicgames.com" },
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
    const { stdout } = await execAsync(`powershell -Command "Test-Connection -ComputerName ${url} -Count 4 -Quiet"`);
    const result = stdout.trim().toLowerCase() === 'true' ? 1 : 0;
    
    if (result === 1) {
      const { stdout: pingOutput } = await execAsync(`powershell -Command "(Test-Connection -ComputerName ${url} -Count 4).ResponseTime | Measure-Object -Average | Select-Object -ExpandProperty Average"`);
      return Math.round(parseFloat(pingOutput));
    }
    
    return -1;
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