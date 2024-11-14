import { PingResult } from "../types/network";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PingResultsProps {
  results: PingResult[];
}

export const PingResults = ({ results }: PingResultsProps) => {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};