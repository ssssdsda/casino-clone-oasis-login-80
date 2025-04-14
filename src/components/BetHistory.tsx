
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BetRecord {
  id: string;
  timestamp: string;
  betAmount: number;
  multiplier: string;
  winAmount: number;
}

interface BetHistoryProps {
  history: BetRecord[];
}

const BetHistory: React.FC<BetHistoryProps> = ({ history }) => {
  return (
    <div>
      <div className="text-xs mb-1 text-gray-400">BET HISTORY</div>
      <ScrollArea className="h-36 rounded border border-gray-800">
        <div className="p-2">
          {history.length > 0 ? (
            history.map(bet => (
              <div 
                key={bet.id} 
                className="text-xs border-b border-gray-800 py-1 flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="text-gray-400">{bet.timestamp}</span>
                  <span>৳{bet.betAmount.toFixed(2)} × {bet.multiplier}</span>
                </div>
                <span className={bet.winAmount > bet.betAmount ? "text-green-400" : "text-red-400"}>
                  ৳{bet.winAmount.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No bets yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BetHistory;
