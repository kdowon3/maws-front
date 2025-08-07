
import React from "react";
import { List, Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: "table" | "card";
  handleViewChange: (view: "table" | "card") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, handleViewChange }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={view === "table" ? "default" : "outline"}
        size="icon"
        onClick={() => handleViewChange("table")}
        className={view === "table" ? "bg-brand-blue hover:bg-brand-lightBlue" : ""}
      >
        <List size={18} />
      </Button>
      <Button
        variant={view === "card" ? "default" : "outline"}
        size="icon"
        onClick={() => handleViewChange("card")}
        className={view === "card" ? "bg-brand-blue hover:bg-brand-lightBlue" : ""}
      >
        <Grid2X2 size={18} />
      </Button>
    </div>
  );
};

export default ViewToggle;
