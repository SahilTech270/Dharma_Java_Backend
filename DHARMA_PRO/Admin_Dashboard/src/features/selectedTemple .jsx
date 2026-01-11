import React, { useState } from "react";
import TempleSelector from "./TempleSelector";
import SlotManager from "./SlotManager";

export default function AdminAddSlots() {
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [slotsData, setSlotsData] = useState({});

  return selectedTemple ? (
    <SlotManager
      templeName={selectedTemple}
      slots={slotsData[selectedTemple] || []}
      onBack={() => setSelectedTemple(null)}
      onUpdateSlots={(updated) =>
        setSlotsData({ ...slotsData, [selectedTemple]: updated })
      }
    />
  ) : (
    <TempleSelector onSelectTemple={setSelectedTemple} />
  );
}
