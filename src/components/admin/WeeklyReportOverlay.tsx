
import React from "react";
import WeeklyReport from "@/pages/Reports";

interface WeeklyReportOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const WeeklyReportOverlay: React.FC<WeeklyReportOverlayProps> = ({
  open, onClose
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg w-[90%] max-w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Weekly Report</h2>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <WeeklyReport />
      </div>
    </div>
  );
};
