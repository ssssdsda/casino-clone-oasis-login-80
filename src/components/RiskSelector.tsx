
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define risk levels enum
export enum RISK_LEVELS {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

type RiskSelectorProps = {
  selectedRisk: RISK_LEVELS;
  onSelectRisk: (risk: RISK_LEVELS) => void;
};

const RiskSelector = ({ selectedRisk, onSelectRisk }: RiskSelectorProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">Risk Level</h3>
      
      <RadioGroup
        defaultValue={selectedRisk}
        onValueChange={(value) => onSelectRisk(value as RISK_LEVELS)}
        className="space-y-2"
      >
        <div className="flex items-center">
          <RadioGroupItem
            value={RISK_LEVELS.LOW}
            id="risk-low"
            className="border-green-500"
          />
          <Label 
            htmlFor="risk-low"
            className={`ml-2 font-medium cursor-pointer ${
              selectedRisk === RISK_LEVELS.LOW ? 'text-green-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Low Risk
          </Label>
          <span className="ml-auto text-sm text-green-500">1.5x - 2x</span>
        </div>
        
        <div className="flex items-center">
          <RadioGroupItem
            value={RISK_LEVELS.MEDIUM}
            id="risk-medium"
            className="border-amber-500"
          />
          <Label 
            htmlFor="risk-medium"
            className={`ml-2 font-medium cursor-pointer ${
              selectedRisk === RISK_LEVELS.MEDIUM ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            Medium Risk
          </Label>
          <span className="ml-auto text-sm text-amber-500">5x - 10x</span>
        </div>
        
        <div className="flex items-center">
          <RadioGroupItem
            value={RISK_LEVELS.HIGH}
            id="risk-high"
            className="border-red-500"
          />
          <Label 
            htmlFor="risk-high"
            className={`ml-2 font-medium cursor-pointer ${
              selectedRisk === RISK_LEVELS.HIGH ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            High Risk
          </Label>
          <span className="ml-auto text-sm text-red-500">10x - 100x</span>
        </div>
      </RadioGroup>
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Higher risk means higher potential rewards but lower chances of winning.
      </div>
    </div>
  );
};

export default RiskSelector;
