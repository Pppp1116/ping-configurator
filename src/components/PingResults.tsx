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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};