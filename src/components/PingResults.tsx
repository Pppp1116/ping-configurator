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
import { CheckCircle2, XCircle } from "lucide-react";

interface PingResultsProps {
  results: PingResult[];
  showOnlyBest?: boolean;
}

export const PingResults = ({ results, showOnlyBest = false }: PingResultsProps) => {
  const sortedResults = [...results].sort((a, b) => a.latency - b.latency);
  const displayResults = showOnlyBest ? sortedResults.slice(0, 3) : sortedResults;

  const handleApply = async (config: NetworkConfig) => {
    try {
      await applySettings(config);
      toast.success("Configurações aplicadas com sucesso!", {
        description: "As novas configurações foram aplicadas ao Windows."
      });
    } catch (error) {
      toast.error("Erro ao aplicar configurações", {
        description: "Verifique se você tem permissões de administrador."
      });
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horário</TableHead>
            <TableHead>Latência</TableHead>
            <TableHead>DNS</TableHead>
            <TableHead>MTU</TableHead>
            <TableHead>Buffer Size</TableHead>
            <TableHead>TCP No Delay</TableHead>
            <TableHead>TCP Window</TableHead>
            <TableHead>Nagle</TableHead>
            <TableHead>QoS</TableHead>
            <TableHead>Status</TableHead>
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
                      ? "text-green-500 font-medium"
                      : result.latency < 200
                      ? "text-yellow-500 font-medium"
                      : "text-red-500 font-medium"
                  }
                >
                  {result.latency === -1 ? "Timeout" : `${result.latency}ms`}
                </span>
              </TableCell>
              <TableCell>{result.config.dns}</TableCell>
              <TableCell>{result.config.mtu}</TableCell>
              <TableCell>{result.config.bufferSize}</TableCell>
              <TableCell>
                {result.config.tcpNoDelay ? <CheckCircle2 className="text-green-500 h-4 w-4" /> : <XCircle className="text-red-500 h-4 w-4" />}
              </TableCell>
              <TableCell>{result.config.tcpWindowSize}</TableCell>
              <TableCell>
                {result.config.nagleAlgorithm ? <CheckCircle2 className="text-green-500 h-4 w-4" /> : <XCircle className="text-red-500 h-4 w-4" />}
              </TableCell>
              <TableCell>
                {result.config.qosEnabled ? <CheckCircle2 className="text-green-500 h-4 w-4" /> : <XCircle className="text-red-500 h-4 w-4" />}
              </TableCell>
              <TableCell>
                {result.latency === -1 ? (
                  <XCircle className="text-red-500 h-4 w-4" />
                ) : (
                  <CheckCircle2 className="text-green-500 h-4 w-4" />
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApply(result.config)}
                  disabled={result.latency === -1}
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