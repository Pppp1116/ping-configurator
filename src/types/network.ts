export interface NetworkConfig {
  dns: string;
  mtu: number;
  bufferSize: number;
}

export interface ServerRegion {
  id: string;
  name: string;
  url: string;
}

export interface PingResult {
  timestamp: number;
  latency: number;
  config: NetworkConfig;
}