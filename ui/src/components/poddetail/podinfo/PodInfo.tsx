import Box from "@mui/material/Box";
import { Pod, PodDetail } from "../../../utils/models/pods";
import { getPodContainerUsePercentages } from "../../../utils";

import "./PodInfo.css";
import {Paper, Table, TableCell, TableContainer, TableRow} from "@mui/material";
import TableBody from "@mui/material/TableBody";

export interface PodInfoProps {
  pod: Pod;
  podDetail: PodDetail;
  containerName: string;
}

const podInfoSx = {
  display: "flex",
  flexDirection: "row",
  marginLeft: "40px"
};

export function PodInfo({ pod, podDetail, containerName }: PodInfoProps) {
  const resourceUsage = getPodContainerUsePercentages(
    pod,
    podDetail,
    containerName
  );

  // CPU
  let usedCPU: string | undefined =
    podDetail.containerMap.get(containerName)?.cpu;
  let specCPU: string | undefined =
    pod.containerSpecMap.get(containerName)?.cpu;
  if (!usedCPU) {
    usedCPU = "?";
  }
  if (!specCPU) {
    specCPU = "?";
  }
  let cpuPercent = "unavailable";
  if (resourceUsage.cpuPercent) {
    cpuPercent = `${resourceUsage.cpuPercent.toFixed(2)}%`;
  }
  // Memory
  let usedMem: string | undefined =
    podDetail.containerMap.get(containerName)?.memory;
  let specMem: string | undefined =
    pod.containerSpecMap.get(containerName)?.memory;
  if (!usedMem) {
    usedMem = "?";
  }
  if (!specMem) {
    specMem = "?";
  }
  let memPercent = "unavailable";
  if (resourceUsage.memoryPercent) {
    memPercent = `${resourceUsage.memoryPercent.toFixed(2)}%`;
  }
  return (
    <Box data-testid="podInfo" sx={podInfoSx}>
      {/*<Box sx={podDataColumnSx}>*/}
      {/*  <Box sx={podDataRowSx}>*/}
      {/*    <Box sx={podDataRowTagSx}>Name:</Box>*/}
      {/*    <Box>{podDetail.name}</Box>*/}
      {/*  </Box>*/}
      {/*</Box>*/}
      {/*<Box sx={podDataColumnSx}>*/}
      {/*  <Box sx={podDataRowSx}>*/}
      {/*    <Box sx={podDataRowTagSx}>CPU %:</Box>*/}
      {/*    <Box>{cpuPercent}</Box>*/}
      {/*  </Box>*/}
      {/*  <Box sx={podDataRowSx}>*/}
      {/*    <Box sx={podDataRowTagSx}>CPU:</Box>*/}
      {/*    <Box>{`${usedCPU} / ${specCPU}`}</Box>*/}
      {/*  </Box>*/}
      {/*</Box>*/}
      {/*<Box sx={podDataColumnSx}>*/}
      {/*  <Box sx={podDataRowSx}>*/}
      {/*    <Box sx={podDataRowTagSx}>Memory %:</Box>*/}
      {/*    <Box>{memPercent}</Box>*/}
      {/*  </Box>*/}
      {/*  <Box sx={podDataRowSx}>*/}
      {/*    <Box sx={podDataRowTagSx}>Memory:</Box>*/}
      {/*    <Box>{`${usedMem} / ${specMem}`}</Box>*/}
      {/*  </Box>*/}
      {/*</Box>*/}
      <TableContainer
          component={Paper}
          sx={{ borderBottom: 1, borderColor: "divider", width: 500, boxShadow: 1 }}
      >
        <Table aria-label="edge-info">
          <TableBody>
            <TableRow data-testid="name">
              <TableCell>Name</TableCell>
              <TableCell>{podDetail.name}</TableCell>
            </TableRow>
            <TableRow data-testid="CPU %">
              <TableCell>CPU %</TableCell>
              <TableCell>{cpuPercent}</TableCell>
            </TableRow>
            <TableRow data-testid="CPU">
              <TableCell>CPU</TableCell>
              <TableCell>{`${usedCPU} / ${specCPU}`}</TableCell>
            </TableRow>
            <TableRow data-testid="Memory %">
              <TableCell>Memory %</TableCell>
              <TableCell>{memPercent}</TableCell>
            </TableRow>
            <TableRow data-testid="Memory">
              <TableCell>Memory</TableCell>
              <TableCell>{`${usedMem} / ${specMem}`}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
