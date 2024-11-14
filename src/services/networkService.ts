import { NetworkConfig, PingResult, ServerRegion } from "../types/network";

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

export const pingServer = async (url: string): Promise<number> => {
  const start = performance.now();
  try {
    await fetch(`https://${url}/ping`, { mode: 'no-cors' });
    return Math.round(performance.now() - start);
  } catch (error) {
    return -1;
  }
};

export const testConfiguration = async (
  server: ServerRegion,
  config: NetworkConfig
): Promise<PingResult> => {
  const latency = await pingServer(server.url);
  return {
    timestamp: Date.now(),
    latency,
    config,
  };
};