import { useLocation } from "react-router-dom";
import "../home/home.css";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { DentalArchitectureDiagram } from "./DentalArchitectureDiagram";

export function ArchitectureSvgPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isDental = location.pathname.includes("dental") || searchParams.get("view") === "dental";

  return (
    <div className="home" style={{ padding: 24, background: "#fff" }}>
      {isDental ? <DentalArchitectureDiagram /> : <ArchitectureDiagram />}
    </div>
  );
}
