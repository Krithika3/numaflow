import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ConnectionLineType, Edge, Node } from "react-flow-renderer";
import Graph from "./graph/Graph";
import { usePipelineFetch } from "../../utils/fetchWrappers/pipelineFetch";
import { useEdgesInfoFetch } from "../../utils/fetchWrappers/edgeInfoFetch";

import "./Pipeline.css";



export function Pipeline() {
  const { namespaceId, pipelineId } = useParams();

  const [pipelineRequestKey, setPipelineRequestKey] = useState(`${Date.now()}`);

  const [vertexPods, setVertexPods] = useState<Map<string, number>>(null);

  const [vertexRate, setVertexRate] = useState<Map<string, number>>(null);


  const {
    pipeline,
    error: pipelineError,
  } = usePipelineFetch(namespaceId, pipelineId, pipelineRequestKey);

  const [edgesInfoRequestKey, setEdgesInfoRequestKey] = useState(
    `${Date.now()}`
  );

  const {
    edgesInfo,
    error: edgesInfoError,
  } = useEdgesInfoFetch(namespaceId, pipelineId, edgesInfoRequestKey);

  useEffect(() => {
    // Refresh pipeline info every x ms
    const interval = setInterval(() => {
      setPipelineRequestKey(`${Date.now()}`);
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Refresh edgesInfo every x ms
    const interval = setInterval(() => {
      setEdgesInfoRequestKey(`${Date.now()}`);
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // This useEffect is used to obtain all the pods for a given vertex in a pipeline.
  useEffect(() => {
    const vertexToPodsMap = new Map();
    if (pipeline?.spec?.vertices) {
      Promise.all(
        pipeline?.spec?.vertices.map((vertex) => {
          return fetch(
            `/api/v1/namespaces/${namespaceId}/pipelines/${pipelineId}/vertices/${vertex.name}/pods`
          )
            .then((response) => response.json())
            .then((json) => {
              vertexToPodsMap.set(vertex.name, json.length);
            });
        })
      ).then(() => setVertexPods(vertexToPodsMap));
    }
  }, [pipeline]);

  // This useEffect is used to obtain all the rates for a given vertex in a pipeline.
  useEffect(() => {
    const vertexToRateMap = new Map();
    if (pipeline?.spec?.vertices) {
      Promise.all(
          pipeline?.spec?.vertices.map((vertex) => {
            return fetch(
                `/api/v1/namespaces/${namespaceId}/pipelines/${pipelineId}/vertices/${vertex.name}/metrics`
            )
                .then((response) => response.json())
                .then((json) => {
                 vertexToRateMap.set(vertex.name, json["processingRates"]["1m"]);
                });
          })
      ).then(() => setVertexRate(vertexToRateMap));
    }
  }, [pipeline]);

  const vertices = useMemo(() => {
    const newVertices: Node[] = [];
    if (pipeline?.spec?.vertices && vertexPods && vertexRate) {
      pipeline.spec.vertices.map((vertex) => {
        const podsLength = vertexPods.has(vertex.name)
          ? vertexPods.get(vertex.name)
          : 0;
        const newNode = {} as Node;
        newNode.id = vertex.name;
        let label;
        if (podsLength === 1) {
          label = `${vertex.name} - ${podsLength} pod`;
        } else {
          label = `${vertex.name} - ${podsLength} pods`;
        }
        newNode.data = { label: label };
        newNode.position = { x: 0, y: 0 };
        // change this in the future if you would like to make it draggable
        newNode.draggable = false;
        if (vertex.source) {
          newNode.type = "source";
          newNode.style = {
            // background: "#d5dee6",
            // boxShadow: "1",
            // color: "#333",
            // border: "1px solid #b8cee2",
          };
          newNode.data.source = vertex;
        } else if (vertex.sink) {
          newNode.type = "sink";
          newNode.style = {
            background: "#c3bbb7",
            color: "#333",
            border: "1px solid #a9a3a0",
          };
          newNode.data.sink = vertex;
        } else {
          newNode.data.udf = vertex;
          newNode.type = "udf"
          newNode.style = {
            // background: "#efdbce",
            // color: "#333",
            // border: "1px solid #f1c5a8",
          };
        }
        newNode.style.cursor = "pointer";
        newNode.style.fontFamily = "IBM Plex Sans";
        newNode.style.fontWeight = 400;
        newNode.style.fontSize = "0.50rem";

        const rate = vertexRate.has(vertex.name)
            ? vertexRate.get(vertex.name)
            : 0;
        newNode.data.rate = rate
        newVertices.push(newNode);
      });
    }
    return newVertices;
  }, [pipeline, vertexPods, vertexRate]);

  const edges = useMemo(() => {
    const newEdges: Edge[] = [];
    if (pipeline?.spec?.edges && edgesInfo) {
      pipeline.spec.edges.map((edge) => {
        edgesInfo.map((edgeInfo) => {
          if (
            edgeInfo.fromVertex === edge.from &&
            edgeInfo.toVertex === edge.to
          ) {
            const label = `${edgeInfo.ackPendingCount + edgeInfo.pendingCount}`;
            const pipelineEdge = {
              id: edge.from + "-" + edge.to,
              label,
              source: edge.from,
              target: edge.to,
              labelStyle: {
                cursor: "pointer",
                fontFamily: "IBM Plex Sans",
                fontWeight: 400,
                fontSize: "0.50rem",
              },
              data: {
                ...edgeInfo,
                conditions: edge.conditions,
                pending: edgeInfo.pendingCount,
                ackPending: edgeInfo.ackPendingCount,
                bufferLength: edgeInfo.bufferLength,
              },
            } as Edge;
            // Color the edge on isFull
            if (edgeInfo.isFull) {
              pipelineEdge.style = {
                stroke: "red",
                strokeWidth: "4px",
                fontWeight: 700,
              };
            }
            pipelineEdge.animated = true;
            pipelineEdge.type = ConnectionLineType.SmoothStep;
            newEdges.push(pipelineEdge);
          }
        });
      });
    }
    return newEdges;
  }, [pipeline, edgesInfo]);

  if (pipelineError || edgesInfoError) {
    return <div>Error</div>;
  }
  return (
    <div data-testid={"pipeline"} style={{ overflow: "scroll !important" }}>
      {pipeline?.spec &&
        edgesInfo.length > 0 &&
        edges.length > 0 &&
        vertices.length > 0 && (
          <Graph
            data={{
              ...pipeline.spec,
              edges: edges,
              vertices: vertices,
              pipeline: pipeline,
            }}
            namespaceId={namespaceId}
            pipelineId={pipelineId}
          />
        )}
    </div>
  );
}
