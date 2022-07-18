import {useState, useEffect, Dispatch, SetStateAction} from "react";
import Box from "@mui/material/Box";
import { EventType } from "@visx/event/lib/types";
import { PodsHeatMap } from "./PodsHeatMap";
import { Pod, PodDetail } from "../../utils/models/pods";

import "./SearchablePodsHeatMap.css";

interface PodsHeatMapProps {
  pods: Pod[];
  podsDetailMap: Map<string, PodDetail>;
  onPodClick: (e: Element | EventType, pod: Pod) => void;
  selectedPod: Pod | undefined;
  setSelectedPod: Dispatch<SetStateAction<Pod>>;
}

export const SearchablePodsHeatMap = ({
  pods,
  podsDetailMap,
  onPodClick,
  selectedPod,
  setSelectedPod,
}: PodsHeatMapProps) => {
  const [search] = useState<string>("");
  const [filteredPods, setFilteredPods] = useState<Pod[]>(pods);

  useEffect(() => {
    if (!search) {
      setFilteredPods(pods);
      return;
    }

    const filteredPods = [];

    pods.map((pod) => {
      if (pod.name.toLowerCase().includes(search)) {
        filteredPods.push(pod);
        setSelectedPod(pod);
      }
    });

    setFilteredPods(filteredPods);
  }, [pods, search]);

  return (
    <Box
      data-testid={"searchable-pods"}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          marginBottom: "5px",
        }}
      >
        Click on different pod hexagons under CPU/MEM display to switch to different pods
      </Box>
      <PodsHeatMap
        pods={filteredPods}
        podsDetailMap={podsDetailMap}
        onPodClick={onPodClick}
        selectedPod={selectedPod}
      />
    </Box>
  );
};
