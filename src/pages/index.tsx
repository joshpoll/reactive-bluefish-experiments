import Image from "next/image";
import { Inter } from "next/font/google";
import { Bluefish } from "./api/Bluefish";
import { Row } from "./api/Row";
import { Rect } from "./api/Rect";
import { useState } from "react";
import { Group } from "./api/Group";
import { Align, Alignment1D, Alignment2D } from "./api/Align";
import { Ref } from "./api/Ref";

const inter = Inter({ subsets: ["latin"] });

const RowTest = ({
  spacing,
  horizontal,
}: {
  spacing: number;
  horizontal: boolean;
}) => {
  return (
    <Bluefish width={500} height={180}>
      <Row id={"row"} spacing={spacing}>
        {Array.from({ length: 1000 }).map((_, i) => (
          <Rect
            key={i}
            id={`rect${i}`}
            width={50}
            height={50}
            fill={i % 3 === 0 ? "red" : i % 3 === 1 ? "blue" : "green"}
          />
        ))}
        {/* <Rect id="rect1" width={50} height={50} fill="red" />
  <Rect id="rect2" width={50} height={50} fill="blue" />
  <Rect id="rect3" width={50} height={50} fill="green" />
  <Rect id="rect4" width={50} height={50} fill="yellow" />
  <Rect id="rect5" width={50} height={50} fill="purple" />
  <Rect id="rect6" width={50} height={50} fill="orange" /> */}
      </Row>
    </Bluefish>
  );
};

export default function Home() {
  const [spacing, setSpacing] = useState(10);
  const [horizontal, setHorizontal] = useState(true);
  const [width, setWidth] = useState(50);

  const [xPos, setXPos] = useState(10);

  const [alignment, setAlignment] = useState<Alignment2D>("center");

  const [verticalAlignment, setVerticalAlignment] =
    useState<Alignment1D>("top");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* <Bluefish width={500} height={500}>
        <Rect id="rect1" x={0} y={0} width={width} height={50} fill="red" />
      </Bluefish> */}
      {/* <Bluefish width={240} height={180}>
          <Rect
            id="singleRect"
            x={xPos}
            y={20}
            width={50}
            height={50}
            fill="red"
          />
        </Bluefish> */}
      {/* <RowTest spacing={spacing} horizontal={horizontal} /> */}
      <Bluefish width={1000} height={180}>
        <Group id="group">
          <Row id="outerRow" x={50} spacing={spacing * 2}>
            <Rect
              // x={500}
              id="innerRect1"
              width={width}
              height={50}
              fill="magenta"
            />
            <Row id="innerRow" spacing={spacing}>
              <Rect id="innerRect2" width={50} height={50} fill="blue" />
              <Rect id="innerRect3" width={50} height={50} fill="green" />
              <Rect id="innerRect4" width={50} height={50} fill="yellow" />
            </Row>
            {Array.from({ length: 500 }).map((_, i) => (
              <Rect
                key={i}
                id={`rect${i}`}
                width={50}
                height={50}
                fill={i % 3 === 0 ? "red" : i % 3 === 1 ? "blue" : "green"}
              />
            ))}
          </Row>
          <Rect
            id="singleRect"
            x={xPos}
            y={20}
            width={50}
            height={50}
            fill="red"
          />
        </Group>
      </Bluefish>
      {/* Alignment Tests */}
      <Bluefish width={1000} height={180}>
        <Align x={0} y={0} id="align1-old" alignment={alignment}>
          <Rect
            id="innerRect11-old"
            x={50}
            width={100}
            height={150}
            fill="steelblue"
          />
          <Rect id="innerRect21-old" width={50} height={50} fill="lightgreen" />
        </Align>
      </Bluefish>
      <Bluefish id={"ref-test"} width={1000} height={200}>
        <Align id="align1" alignment={"left"}>
          <Rect
            id="innerRect11"
            x={32}
            y={45}
            width={100}
            height={150}
            fill="steelblue"
          />
          <Rect id="innerRect21" width={50} height={50} fill="lightgreen" />
        </Align>
        <Align id="align2" alignment={verticalAlignment}>
          <Ref id="ref1" refId="innerRect11" />
          <Ref id="ref2" refId="innerRect21" />
        </Align>
        {/* <Align id="align3" alignment="centerRight">
          <Ref id="ref3" refId="innerRect21" />
          <Rect id="innerRect31" width={20} height={20} fill="magenta" />
        </Align> */}
      </Bluefish>
      {/* create a dropdown for picking the alignment */}
      <select
        value={alignment}
        onChange={(e) => setAlignment(e.target.value as Alignment2D)}
      >
        <option value="topLeft">Top Left</option>
        <option value="topCenter">Top Center</option>
        <option value="topRight">Top Right</option>
        <option value="centerLeft">Center Left</option>
        <option value="center">Center</option>
        <option value="centerRight">Center Right</option>
        <option value="bottomLeft">Bottom Left</option>
        <option value="bottomCenter">Bottom Center</option>
        <option value="bottomRight">Bottom Right</option>
      </select>
      <select
        value={verticalAlignment}
        onChange={(e) => setVerticalAlignment(e.target.value as Alignment1D)}
      >
        <option value="top">Top</option>
        <option value="centerVertically">Center</option>
        <option value="bottom">Bottom</option>
      </select>
      <input
        type="range"
        min="0"
        max="50"
        value={xPos}
        onInput={(e) => setXPos(+e.currentTarget.value)}
      />
      <input
        type="range"
        min="0"
        max="10"
        value={spacing}
        onInput={(e) => setSpacing(+e.currentTarget.value)}
      />
      <input
        type="checkbox"
        checked={horizontal}
        onChange={() => {
          setHorizontal((prev) => !prev);
        }}
      />
      <input
        type="range"
        min="20"
        max="100"
        value={width}
        onInput={(e) => setWidth(+e.currentTarget.value)}
      />
    </main>
  );
}
