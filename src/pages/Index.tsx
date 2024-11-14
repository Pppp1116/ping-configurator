import { useState } from "react";
import { NetworkConfig, PingResult, ServerRegion } from "../types/network";
import {
  EPIC_SERVERS,
  DNS_SERVERS,
  MTU_SIZES,
  BUFFER_SIZES,
  TCP_WINDOW_SIZES,
  testConfiguration,
} from "../services/networkService";
import { PingResults } from "../components/PingResults";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Index = () => {
  const [selectedServer, setSelectedServer] = useState<ServerRegion | null>(null);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);

  const startTesting = async () => {
    if (!selectedServer) {
      toast.error("Por favor, selecione um servidor primeiro");
      return;
    }

    setTesting(true);
    const newResults: PingResult[] = [];

    try {
      // Testar todas as combinações possíveis
      const tcpWindowSizes = TCP_WINDOW_SIZES;
      const tcpNoDelayOptions = [true, false];
      const nagleOptions = [true, false];
      const qosOptions = [true, false];

      for (const dns of DNS_SERVERS) {
        for (const mtu of MTU_SIZES) {
          for (const bufferSize of BUFFER_SIZES) {
            for (const tcpWindowSize of tcpWindowSizes) {
              for (const tcpNoDelay of tcpNoDelayOptions) {
                for (const nagleAlgorithm of nagleOptions) {
                  for (const qosEnabled of qosOptions) {
                    const config: NetworkConfig = {
                      dns,
                      mtu,
                      bufferSize,
                      tcpNoDelay,
                      tcpWindowSize,
                      nagleAlgorithm,
                      qosEnabled,
                    };

                    const result = await testConfiguration(selectedServer, config);
                    newResults.push(result);
                    setResults([...newResults]);
                    
                    // Pausa breve entre testes
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
              }
            }
          }
        }
      }
      toast.success("Testes concluídos!");
    } catch (error) {
      toast.error("Erro ao realizar os testes");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-light p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">
            Otimizador de Rede Windows 11 para Epic Games
          </h1>
          <p className="text-lg opacity-90">
            Teste diferentes configurações de rede para encontrar a melhor conexão
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Selecione o Servidor
              </label>
              <Select
                onValueChange={(value) =>
                  setSelectedServer(
                    EPIC_SERVERS.find((s) => s.id === value) || null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {EPIC_SERVERS.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={startTesting}
              disabled={testing || !selectedServer}
              className="w-full"
            >
              {testing ? (
                <>
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-sky-400 opacity-75"></span>
                  Testando...
                </>
              ) : (
                "Iniciar Testes"
              )}
            </Button>

            {results.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Resultados</h2>
                <PingResults results={results} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;