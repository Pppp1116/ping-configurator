import { useState, useEffect } from "react";
import { NetworkConfig, PingResult, ServerRegion } from "../types/network";
import {
  EPIC_SERVERS,
  DNS_SERVERS,
  MTU_SIZES,
  BUFFER_SIZES,
  TCP_WINDOW_SIZES,
  testConfiguration,
} from "../services/networkService";
import {
  backupCurrentSettings,
  restoreSettings,
  revertToDefault,
} from "../services/settingsService";
import { PingResults } from "../components/PingResults";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Index = () => {
  const [selectedServer, setSelectedServer] = useState<ServerRegion | null>(null);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [showBestResults, setShowBestResults] = useState(false);

  const calculateTotalTests = () => {
    return (
      DNS_SERVERS.length *
      MTU_SIZES.length *
      BUFFER_SIZES.length *
      TCP_WINDOW_SIZES.length *
      2 * // tcpNoDelay options
      2 * // nagleAlgorithm options
      2 // qosEnabled options
    );
  };

  const updateEstimatedTime = (completedTests: number, elapsedTime: number) => {
    const totalTests = calculateTotalTests();
    const remainingTests = totalTests - completedTests;
    const timePerTest = elapsedTime / completedTests;
    const estimatedRemainingTime = remainingTests * timePerTest;
    setEstimatedTime(Math.ceil(estimatedRemainingTime / 1000)); // Convert to seconds
  };

  const handleBackup = async () => {
    try {
      await backupCurrentSettings();
      toast.success("Backup das configurações realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer backup das configurações");
    }
  };

  const handleRestore = async () => {
    try {
      const settings = await restoreSettings();
      if (settings) {
        toast.success("Configurações restauradas com sucesso!");
      } else {
        toast.error("Nenhum backup encontrado");
      }
    } catch (error) {
      toast.error("Erro ao restaurar configurações");
    }
  };

  const handleRevertToDefault = async () => {
    try {
      await revertToDefault();
      toast.success("Configurações revertidas para o padrão!");
    } catch (error) {
      toast.error("Erro ao reverter configurações");
    }
  };

  const startTesting = async () => {
    if (!selectedServer) {
      toast.error("Por favor, selecione um servidor primeiro");
      return;
    }

    setTesting(true);
    setShowBestResults(false);
    const newResults: PingResult[] = [];
    const startTime = Date.now();
    const totalTests = calculateTotalTests();
    let completedTests = 0;

    try {
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
                    completedTests++;
                    
                    const progress = (completedTests / totalTests) * 100;
                    setProgress(progress);
                    
                    if (completedTests > 0) {
                      updateEstimatedTime(completedTests, Date.now() - startTime);
                    }
                    
                    setResults([...newResults]);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
              }
            }
          }
        }
      }
      
      setShowBestResults(true);
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <Button onClick={handleBackup} variant="outline">
                  Use Backup
                </Button>
                <Button onClick={handleRevertToDefault} variant="outline">
                  Revert to Default
                </Button>
              </div>
              {estimatedTime !== null && testing && (
                <div className="text-sm text-gray-600">
                  Tempo estimado: {estimatedTime} segundos
                </div>
              )}
            </div>

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

            {testing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-gray-600 text-center">
                  {Math.round(progress)}% completo
                </p>
              </div>
            )}

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
                <h2 className="text-xl font-semibold mb-4">
                  {showBestResults ? "Melhores Resultados" : "Resultados"}
                </h2>
                <PingResults results={results} showOnlyBest={showBestResults} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;