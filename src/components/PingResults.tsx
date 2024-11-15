import { PingResult, NetworkConfig } from "../types/network";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { applySettings } from "../services/settingsService";
import { toast } from "sonner";

interface PingResultsProps {
  results: PingResult[];
  showOnlyBest?: boolean;
}

export const PingResults = ({ results, showOnlyBest = false }: PingResultsProps) => {
  const sortedResults = [...results].sort((a, b) => a.latency - b.latency);
  const displayResults = showOnlyBest ? sortedResults.slice(0, 3) : sortedResults;

  const handleApply = (config: NetworkConfig) => {
    try {
      applySettings(config);
      toast.success("Configurações aplicadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao aplicar configurações");
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horário</TableHead>
            <TableHead>Latência (ms)</TableHead>
            <TableHead>DNS</TableHead>
            <TableHead>MTU</TableHead>
            <TableHead>Buffer Size</TableHead>
            <TableHead>TCP No Delay</TableHead>
            <TableHead>TCP Window</TableHead>
            <TableHead>Nagle</TableHead>
            <TableHead>QoS</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(result.timestamp).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                <span
                  className={
                    result.latency < 100
                      ? "text-green-500"
                      : result.latency < 200
                      ? "text-yellow-500"
                      : "text-red-500"
                  }
                >
                  {result.latency}ms
                </span>
              </TableCell>
              <TableCell>{result.config.dns}</TableCell>
              <TableCell>{result.config.mtu}</TableCell>
              <TableCell>{result.config.bufferSize}</TableCell>
              <TableCell>{result.config.tcpNoDelay ? "Sim" : "Não"}</TableCell>
              <TableCell>{result.config.tcpWindowSize}</TableCell>
              <TableCell>{result.config.nagleAlgorithm ? "Ativo" : "Desativado"}</TableCell>
              <TableCell>{result.config.qosEnabled ? "Ativo" : "Desativado"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApply(result.config)}
                >
                  Apply
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};