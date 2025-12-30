"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 蛇の色の配列
const SNAKE_COLORS = ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"];

type Position = {
  x: number;
  y: number;
};

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const CELL_SIZE = 12;
const INITIAL_SPEED = 150;

export function AutoSnakeGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 縦方向は固定（ブロックサイズは固定のまま、横方向の可動範囲のみレスポンシブにする）
  const gridHeight = GRID_SIZE;
  const [gridWidth, setGridWidth] = useState<number>(GRID_SIZE);

  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 5 },
    { x: 9, y: 5 },
    { x: 8, y: 5 },
    { x: 7, y: 5 },
    { x: 6, y: 5 },
  ]);
  const [food, setFood] = useState<Position>({ x: 15, y: 8 });
  const directionRef = useRef<Direction>("RIGHT");

  // BlogCard と同じ親コンテナ幅に追従して「横方向の列数」だけ可変にする
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const widthPx = el.clientWidth;
      const cols = Math.max(8, Math.floor(widthPx / CELL_SIZE));
      setGridWidth(cols);
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 盤面サイズ変更時に蛇/餌が範囲外に出ないように調整
  useEffect(() => {
    setSnake((prev) =>
      prev.map((p) => ({
        x: ((p.x % gridWidth) + gridWidth) % gridWidth,
        y: ((p.y % gridHeight) + gridHeight) % gridHeight,
      })),
    );
    setFood((prev) => ({
      x: ((prev.x % gridWidth) + gridWidth) % gridWidth,
      y: ((prev.y % gridHeight) + gridHeight) % gridHeight,
    }));
  }, [gridHeight, gridWidth]);

  const getNextHead = useCallback(
    (head: Position, dir: Direction): Position => {
      const next = { ...head };
      switch (dir) {
        case "UP":
          next.y -= 1;
          break;
        case "DOWN":
          next.y += 1;
          break;
        case "LEFT":
          next.x -= 1;
          break;
        case "RIGHT":
          next.x += 1;
          break;
      }
      // 壁との衝突チェック - 反対側から出現
      if (next.x < 0) next.x = gridWidth - 1;
      if (next.x >= gridWidth) next.x = 0;
      if (next.y < 0) next.y = gridHeight - 1;
      if (next.y >= gridHeight) next.y = 0;
      return next;
    },
    [gridHeight, gridWidth],
  );

  // 餌の生成
  const generateFoodAvoidingSnake = useCallback(
    (occupied: Position[]) => {
      // 盤面が埋まりきっている場合の無限ループ回避
      const maxTries = gridWidth * gridHeight * 2;
      for (let i = 0; i < maxTries; i++) {
        const candidate = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight),
        };
        const overlaps = occupied.some(
          (s) => s.x === candidate.x && s.y === candidate.y,
        );
        if (!overlaps) return candidate;
      }
      // フォールバック（基本ここには来ない）
      return { x: 0, y: 0 };
    },
    [gridHeight, gridWidth],
  );

  // AI自動操縦 - 食べ物に向かって移動
  const calculateNextDirection = useCallback(
    (
      snakeHead: Position,
      foodPos: Position,
      currentDir: Direction,
    ): Direction => {
      const possibleDirections: Direction[] = [];

      // X軸の差
      if (foodPos.x > snakeHead.x && currentDir !== "LEFT") {
        possibleDirections.push("RIGHT");
      } else if (foodPos.x < snakeHead.x && currentDir !== "RIGHT") {
        possibleDirections.push("LEFT");
      }

      // Y軸の差
      if (foodPos.y > snakeHead.y && currentDir !== "UP") {
        possibleDirections.push("DOWN");
      } else if (foodPos.y < snakeHead.y && currentDir !== "DOWN") {
        possibleDirections.push("UP");
      }

      // 現在の方向を維持できる場合は維持
      if (possibleDirections.length === 0) {
        return currentDir;
      }

      // ランダムに方向を選択（より自然な動きに）
      return possibleDirections[
        Math.floor(Math.random() * possibleDirections.length)
      ];
    },
    [],
  );

  const isSafeMove = useCallback(
    (nextHead: Position, snakeBody: Position[]) => {
      // 新しい頭が既存の体と重ならないか
      // - 食べない場合は尾が1つ消えるので「現在の尾」は踏める
      const bodyToCheck = snakeBody.slice(0, -1);
      return !bodyToCheck.some((s) => s.x === nextHead.x && s.y === nextHead.y);
    },
    [],
  );

  const getSafeNextDirection = useCallback(
    (snakeBody: Position[], foodPos: Position, currentDir: Direction) => {
      const head = snakeBody[0];
      const preferred = calculateNextDirection(head, foodPos, currentDir);

      const candidates: Direction[] = [
        preferred,
        currentDir,
        "UP",
        "DOWN",
        "LEFT",
        "RIGHT",
      ];

      // 重複排除しつつ、反対方向（即Uターン）を除外
      const seen = new Set<Direction>();
      const filtered = candidates.filter((d) => {
        if (seen.has(d)) return false;
        seen.add(d);
        if (currentDir === "UP" && d === "DOWN") return false;
        if (currentDir === "DOWN" && d === "UP") return false;
        if (currentDir === "LEFT" && d === "RIGHT") return false;
        if (currentDir === "RIGHT" && d === "LEFT") return false;
        return true;
      });

      for (const dir of filtered) {
        const nextHead = getNextHead(head, dir);
        if (isSafeMove(nextHead, snakeBody)) return dir;
      }
      return null;
    },
    [calculateNextDirection, getNextHead, isSafeMove],
  );

  // ゲームループ
  useEffect(() => {
    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const safeDir = getSafeNextDirection(
          newSnake,
          food,
          directionRef.current,
        );

        // 詰み状態（どこに動いても衝突する）ではリセットせず、その場で停止
        if (!safeDir) {
          return prevSnake;
        }

        directionRef.current = safeDir;

        const head = newSnake[0];
        const nextHead = getNextHead(head, safeDir);

        // 餌を食べたかチェック（unshiftの前に判定）
        const ateFood = nextHead.x === food.x && nextHead.y === food.y;

        newSnake.unshift(nextHead);

        // このゲームは「餌を食べても長さを一定」にする（不具合修正）
        newSnake.pop();

        if (ateFood) {
          setFood(generateFoodAvoidingSnake(newSnake));
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [food, generateFoodAvoidingSnake, getNextHead, getSafeNextDirection]);

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full">
      <div
        className="relative bg-transparent rounded-lg"
        style={{
          width: gridWidth * CELL_SIZE,
          height: gridHeight * CELL_SIZE,
        }}
      >
        {/* 蛇 */}
        {snake.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            className="absolute transition-all duration-75"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: SNAKE_COLORS[index % SNAKE_COLORS.length],
            }}
          />
        ))}

        {/* 餌 */}
        <div
          className="absolute"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: "#F27059",
          }}
        />
      </div>
    </div>
  );
}
