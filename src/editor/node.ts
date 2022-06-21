export type GraphNode = {
  id: string;
  node: EditorNode;
  pos: Coordinate;
  inPoints: {
    type: string;
    label: string;
    limit: number | null;
  }[];
  outPoints: {
    type: string;
    label: string;
    limit: number | null;
  }[];
};

export type EditorNode = {
  label: string;
  color: string;
};

export type Edge = {
  start: {
    nodeId: string;
    pointId: number;
  };
  end: {
    nodeId: string;
    pointId: number;
  };
};

export type UnfixedEdge = {
  start: string;
  end: Coordinate;
};

export type Point = {
  type: string;
  label: string;
  limit: number | null;
};

export type Coordinate = {
  x: number;
  y: number;
};

export class GraphNodeClass {
  static id = 0;

  public id: string;
  public node: EditorNode;
  public pos: {
    x: number;
    y: number;
  };
  public inPoints: {
    type: string;
    label: string;
    limit: number | null;
  }[];
  public outPoints: {
    type: string;
    label: string;
    limit: number | null;
  }[];

  constructor(
    node: EditorNode,
    {
      pos,
      inPoints,
      outPoints,
    }: {
      pos?: Coordinate;
      inPoints?: Point[];
      outPoints?: Point[];
    } = {}
  ) {
    this.id = `${GraphNodeClass.id++}`;
    this.node = node;
    this.pos = pos ?? { x: 0, y: 0 };
    this.inPoints = inPoints ?? [];
    this.outPoints = outPoints ?? [];
  }

  setPos(coordinate: Coordinate) {
    this.pos = coordinate;
    return this;
  }

  canConnect(
    pointId: number,
    counterNode: GraphNodeClass,
    counterPointId: number
  ) {
    return !(this.id === counterNode.id);
  }
}
