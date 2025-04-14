
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { RISK_LEVELS, RiskLevel, ROWS_BY_RISK } from '@/utils/gameLogic';

interface RiskSelectorProps {
  selectedRisk: RiskLevel;
  onRiskChange: (risk: RiskLevel) => void;
  selectedRows: number;
  onRowsChange: (rows: number) => void;
}

const RiskSelector: React.FC<RiskSelectorProps> = ({
  selectedRisk,
  onRiskChange,
  selectedRows,
  onRowsChange
}) => {
  const handleRowsChange = (values: number[]) => {
    onRowsChange(values[0]);
  };
  
  const availableRows = ROWS_BY_RISK[selectedRisk];
  const minRows = availableRows[0];
  const maxRows = availableRows[availableRows.length - 1];
  
  return (
    <div>
      <div className="mb-4">
        <div className="text-xs mb-1 text-gray-400">RISK</div>
        <div className="flex gap-1">
          <button 
            onClick={() => onRiskChange(RISK_LEVELS.LOW)}
            className={`flex-1 py-2 text-center text-sm rounded-md ${
              selectedRisk === RISK_LEVELS.LOW ? "bg-green-600 text-white font-bold" : "bg-gray-700"
            }`}
          >
            LOW
          </button>
          <button 
            onClick={() => onRiskChange(RISK_LEVELS.MEDIUM)}
            className={`flex-1 py-2 text-center text-sm rounded-md ${
              selectedRisk === RISK_LEVELS.MEDIUM ? "bg-green-600 text-white font-bold" : "bg-gray-700"
            }`}
          >
            MEDIUM
          </button>
          <button 
            onClick={() => onRiskChange(RISK_LEVELS.HIGH)}
            className={`flex-1 py-2 text-center text-sm rounded-md ${
              selectedRisk === RISK_LEVELS.HIGH ? "bg-green-600 text-white font-bold" : "bg-gray-700"
            }`}
          >
            HIGH
          </button>
        </div>
      </div>
      
      <div>
        <div className="text-xs mb-1 text-gray-400">NUMBER OF ROWS</div>
        <div className="py-2">
          <Slider 
            value={[selectedRows]} 
            min={minRows} 
            max={maxRows}
            step={2}
            className="my-4"
            onValueChange={handleRowsChange}
          />
          <div className="text-center font-bold text-green-400">{selectedRows} ROWS</div>
        </div>
      </div>
    </div>
  );
};

export default RiskSelector;
