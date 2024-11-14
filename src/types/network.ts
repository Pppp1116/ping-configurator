export interface NetworkConfig {
  dns: string;
  mtu: number;
  bufferSize: number;
  tcpNoDelay: boolean;
  tcpWindowSize: number;
  nagleAlgorithm: boolean;
  qosEnabled: boolean;
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