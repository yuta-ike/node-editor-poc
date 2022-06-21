import { useCallback, useRef, useState } from "react";
import useCursorPos from "./utils/getCursorPos";
import Draggable from "react-draggable";
import { Edge, GraphNodeClass } from "./editor/node";
import { getPointPos, isSameEdge } from "./editor/helper";
import Line from "./components/Line";
import LineUI from "./components/presentation/LineUI";
import classNames from "classnames";

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

const INIT_NODES = [
  new GraphNodeClass(
    {
      label: "Node 01",
      color: "#fda4aeed",
    },
    {
      pos: {
        x: 0,
        y: 0,
      },
      inPoints: [
        { type: "number", label: "input", limit: null },
        { type: "number", label: "input", limit: null },
      ],
      outPoints: [
        { type: "number", label: "yes", limit: null },
        { type: "number", label: "no", limit: null },
      ],
    }
  ),
  new GraphNodeClass(
    {
      label: "Node 02",
      color: "#14b8a5ed",
    },
    {
      pos: {
        x: 100,
        y: 100,
      },
      inPoints: [{ type: "number", label: "input", limit: null }],
      outPoints: [
        { type: "number", label: "yes", limit: null },
        { type: "number", label: "no", limit: null },
      ],
    }
  ),
  new GraphNodeClass(
    {
      label: "Node 03",
      color: "#fb923ced",
    },
    {
      pos: {
        x: 300,
        y: 100,
      },
      inPoints: [
        { type: "number", label: "input", limit: null },
        { type: "number", label: "input", limit: null },
      ],
      outPoints: [{ type: "number", label: "no", limit: null }],
    }
  ),
];

const App: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNodeClass[]>(INIT_NODES);
  const [edges, setEdges] = useState<Edge[]>([]);

  const pointRefs = useRef<Record<string, Record<number, HTMLButtonElement>>>(
    {}
  );

  const [tmpEdgeStartNodeId, setTempEdgeStartNodeId] = useState<{
    nodeId: string;
    pointId: number;
  } | null>(null);

  const cursorPos = useCursorPos(tmpEdgeStartNodeId != null);

  const getNode = useCallback(
    (nodeId: string) => {
      return nodes.find(({ id }) => id === nodeId) ?? null;
    },
    [nodes]
  );

  return (
    <div
      className="m-8 relative draggable-parent border border-blue-100 min-h-screen"
      onClick={() => setTempEdgeStartNodeId(null)}
    >
      {tmpEdgeStartNodeId != null &&
        (() => {
          const tmpStartNode = getNode(tmpEdgeStartNodeId.nodeId);
          if (tmpStartNode == null) {
            return null;
          }
          const startPointPos = getPointPos(
            "out",
            tmpStartNode,
            tmpEdgeStartNodeId.pointId
          );
          return (
            <div className="absolute top-0 left-0 w-full h-full" key="temp">
              <LineUI
                startPos={startPointPos}
                delta={{
                  x: cursorPos.x - 32 - startPointPos.x,
                  y: cursorPos.y - 32 - startPointPos.y,
                }}
              />
            </div>
          );
        })()}
      {edges.map((edge) => (
        <Line
          key={`${edge.start.nodeId}_${edge.start.pointId}_${edge.end.nodeId}_${edge.end.pointId}`}
          edge={edge}
          getNode={getNode}
          onDelete={() =>
            setEdges((edges) => edges.filter((e) => !isSameEdge(e, edge)))
          }
        />
      ))}

      {nodes.map((node) => (
        <Draggable
          key={node.id}
          position={node.pos}
          bounds=".draggable-parent"
          defaultClassName="!absolute top-0 left-0"
          onDrag={(_, data) =>
            setNodes((nodes) =>
              nodes.map((n) =>
                n.id !== node.id
                  ? n
                  : n.setPos({ x: Math.round(data.x), y: Math.round(data.y) })
              )
            )
          }
        >
          <div
            className="w-40 h-20 rounded shadow flex items-center justify-center relative text-white"
            style={{ background: node.node.color }}
          >
            {node.node.label}
            <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-evenly">
              {node.inPoints.map((point, i) => (
                <button
                  key={i}
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tmpEdgeStartNodeId == null) return;
                    const tmpEdgeStartNode = getNode(tmpEdgeStartNodeId.nodeId);
                    if (tmpEdgeStartNode == null) return;

                    if (
                      node.canConnect(
                        i,
                        tmpEdgeStartNode,
                        tmpEdgeStartNodeId.pointId
                      )
                    ) {
                      setEdges((prev) => [
                        ...prev,
                        {
                          start: tmpEdgeStartNodeId,
                          end: {
                            nodeId: node.id,
                            pointId: i,
                          },
                        },
                      ]);
                      setTempEdgeStartNodeId(null);
                    }
                  }}
                >
                  <div
                    className={classNames(
                      "w-5 h-5 rounded-full border-2 border-white transition",
                      tmpEdgeStartNodeId == null
                        ? "bg-green-500 border-white hover:scale-110"
                        : tmpEdgeStartNodeId != null &&
                          node.canConnect(
                            i,
                            // @ts-ignore
                            getNode(tmpEdgeStartNodeId.nodeId),
                            tmpEdgeStartNodeId.pointId
                          )
                        ? "bg-green-500 border-white scale-100 hover:scale-110"
                        : "bg-gray-300 border-gray-100 cursor-not-allowed scale-50"
                    )}
                  />
                  <div className="text-white absolute top-full left-1/2 leading-none -translate-x-1/2 text-sm">
                    {point.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 inset-x-0 translate-y-1/2 flex justify-evenly">
              {node.outPoints.map((point, i) => (
                <button
                  key={i}
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tmpEdgeStartNodeId == null) {
                      setTempEdgeStartNodeId({ nodeId: node.id, pointId: i });
                    }
                  }}
                >
                  <div
                    className={classNames(
                      "w-5 h-5 rounded-full border-2 border-white transition",
                      tmpEdgeStartNodeId == null
                        ? "hover:scale-110 bg-yellow-500"
                        : "scale-50 cursor-not-allowed bg-gray-300"
                    )}
                  />
                  <div className="text-white absolute bottom-full left-1/2 leading-none -translate-x-1/2 text-sm">
                    {point.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Draggable>
      ))}
    </div>
  );
};

export default App;
