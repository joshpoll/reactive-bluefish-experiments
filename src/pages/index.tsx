import Image from "next/image";
import { Inter } from "next/font/google";
import { TodoStore } from "./api/TodoStore";
import { Bluefish } from "./api/Bluefish";
import { Row } from "./api/Row";
import { Rect } from "./api/Rect";
import { useState } from "react";
import { Group } from "./api/Group";

// const todoStore = new TodoStore();

// todoStore.addTodo("read MobX tutorial");
// console.log(todoStore.report());

// todoStore.addTodo("try MobX");
// console.log(todoStore.report());

// todoStore.todos[0].completed = true;
// console.log(todoStore.report());

// todoStore.todos[1].task = "try MobX in own project";
// console.log(todoStore.report());

// todoStore.todos[0].task = "grok MobX tutorial";
// console.log(todoStore.report());

const inter = Inter({ subsets: ["latin"] });

const RowTest = ({
  spacing,
  horizontal,
}: {
  spacing: number;
  horizontal: boolean;
}) => {
  // eslint-disable-next-line react/display-name
  return (
    <Bluefish width={500} height={180}>
      <Row id={"row"} spacing={spacing} horizontal={horizontal}>
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <Bluefish width={240} height={180}>
          <Rect
            id="singleRect"
            x={xPos}
            y={20}
            width={50}
            height={50}
            fill="red"
          />
        </Bluefish>
        <RowTest spacing={spacing} horizontal={horizontal} />
        <Bluefish width={1000} height={180}>
          <Group id="group">
            <Row id="outerRow" x={50} spacing={spacing * 2}>
              <Rect id="innerRect1" width={width} height={50} fill="magenta" />
              <Row id="innerRow" spacing={spacing}>
                <Rect id="innerRect2" width={50} height={50} fill="blue" />
                <Rect id="innerRect3" width={50} height={50} fill="green" />
                <Rect id="innerRect4" width={50} height={50} fill="yellow" />
              </Row>
              {/* <Rect id="innerRect5" width={50} height={50} fill="purple" />
              <Rect id="innerRect6" width={50} height={50} fill="purple" />
              <Rect id="innerRect7" width={50} height={50} fill="purple" />
              <Rect id="innerRect8" width={50} height={50} fill="purple" /> */}
              {Array.from({ length: 1000 }).map((_, i) => (
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
      </div>
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
