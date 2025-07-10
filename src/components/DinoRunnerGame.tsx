import React, { useEffect, useRef, useState } from "react";
import { useSupabase } from '@/hooks/useSupabase';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 200;
const GROUND_Y = 150;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 40;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -9; // 점프 높이 낮춤
const OBSTACLE_WIDTH = 14; // 장애물 너비 축소
const OBSTACLE_HEIGHT = 28; // 장애물 높이 축소

function drawDotDino(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 몸통
  ctx.fillStyle = "#6ee7b7";
  ctx.fillRect(x + 8, y + 20, 24, 14);
  // 다리
  ctx.fillRect(x + 12, y + 34, 6, 6);
  ctx.fillRect(x + 22, y + 34, 6, 6);
  // 꼬리
  ctx.fillStyle = "#34d399";
  ctx.fillRect(x, y + 26, 8, 8);
  // 머리
  ctx.fillStyle = "#6ee7b7";
  ctx.fillRect(x + 28, y + 10, 10, 10);
  // 눈
  ctx.fillStyle = "#222";
  ctx.fillRect(x + 36, y + 14, 2, 2);
}

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function DinoRunnerGame({ uuid, nickname }: { uuid: string, nickname: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const { addGameScore, fetchDinoScores } = useSupabase();
  const [saveMsg, setSaveMsg] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  const dino = useRef({
    x: 50,
    y: GROUND_Y - DINO_HEIGHT,
    vy: 0,
    isJumping: false,
  });

  const jumpCount = useRef(0); // 2단 점프용
  const obstacles = useRef<Obstacle[]>([]);
  const speed = useRef(6);
  const animationRef = useRef(0);

  const resetGame = () => {
    dino.current = {
      x: 50,
      y: GROUND_Y - DINO_HEIGHT,
      vy: 0,
      isJumping: false,
    };
    jumpCount.current = 0; // 점프 카운트 초기화
    obstacles.current = [];
    setScore(0);
    speed.current = 6;
    setIsGameOver(false); // isGameOver가 false로 바뀌면 useEffect에서 gameLoop 시작
    // animationRef.current = requestAnimationFrame(gameLoop); // 이 부분 제거
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // 👉 일반 점프 (2단 점프)
    if ((e.code === "Space" || e.code === "ArrowUp")) {
      e.preventDefault();
      if (jumpCount.current < 2) {
        dino.current.vy = JUMP_VELOCITY;
        dino.current.isJumping = true;
        jumpCount.current += 1;
      }
    }
  };

  // 모바일 터치 점프 핸들러
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (jumpCount.current < 2) {
      dino.current.vy = JUMP_VELOCITY;
      dino.current.isJumping = true;
      jumpCount.current += 1;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // useEffect에서 최초 1회만 gameLoop를 시작하는 구조 →
    // isGameOver가 false로 바뀔 때마다 gameLoop를 시작하도록 개선
    if (!isGameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver && !hasSaved && uuid && nickname) {
      (async () => {
        try {
          const scores = await fetchDinoScores();
          console.log('[DinoRunner] fetchDinoScores:', scores);
          const myScore = scores.find(s => s.uuid === uuid);
          console.log('[DinoRunner] uuid:', uuid, 'nickname:', nickname, 'score:', score, 'myScore:', myScore);
          if (!myScore || score > myScore.score) {
            console.log('[DinoRunner] addGameScore 호출');
            await addGameScore(score, uuid, nickname, 'dino');
            setSaveMsg('신기록! 랭킹에 반영됩니다.');
          } else {
            setSaveMsg('기존 최고점 미달, 저장되지 않습니다.');
          }
          setHasSaved(true);
        } catch (err) {
          console.error('[DinoRunner] 저장 실패', err);
          setSaveMsg('저장 실패! 다시 시도해 주세요.');
          setHasSaved(true);
        }
      })();
    }
    if (!isGameOver) {
      setHasSaved(false);
      setSaveMsg('');
    }
    // eslint-disable-next-line
  }, [isGameOver, uuid, nickname]);

  const gameLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || isGameOver) return;

    // 배경색 채우기 (회색톤)
    ctx.fillStyle = "#2d333b";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // draw ground
    ctx.fillStyle = "#444c56";
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

    // update dino
    dino.current.vy += GRAVITY;
    dino.current.y += dino.current.vy;
    if (dino.current.y >= GROUND_Y - DINO_HEIGHT) {
      dino.current.y = GROUND_Y - DINO_HEIGHT;
      dino.current.vy = 0;
      dino.current.isJumping = false;
      jumpCount.current = 0; // 바닥에 닿으면 점프 카운트 초기화
    }

    // draw dino (도트 스타일)
    drawDotDino(ctx, dino.current.x, dino.current.y);

    // 난이도 조절: 점수 500점 단위로 속도/장애물 생성 확률/크기 증가
    const difficulty = Math.floor(score / 500);
    // 기본값: 0.02, 500점마다 0.005씩 증가(최대 0.05)
    const obstacleProb = Math.min(0.02 + difficulty * 0.005, 0.05);
    // 장애물 크기도 500점마다 2px씩 증가(최대 30)
    const obsWidth = Math.min(OBSTACLE_WIDTH + difficulty * 2, 30);
    const obsHeight = Math.min(OBSTACLE_HEIGHT + difficulty * 2, 40);
    if (Math.random() < obstacleProb) {
      obstacles.current.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y - obsHeight,
        width: obsWidth,
        height: obsHeight,
      });
    }

    // update obstacles
    obstacles.current.forEach((obs) => {
      obs.x -= speed.current;
    });
    obstacles.current = obstacles.current.filter((obs) => obs.x + obs.width > 0);

    // draw obstacles
    ctx.fillStyle = "#2ea043"; // 더 진한 녹색
    obstacles.current.forEach((obs) => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // collision detection
    let collided = false;
    obstacles.current.forEach((obs) => {
      const dx = dino.current.x;
      const dy = dino.current.y;
      if (
        dx < obs.x + obs.width &&
        dx + DINO_WIDTH > obs.x &&
        dy < obs.y + obs.height &&
        dy + DINO_HEIGHT > obs.y
      ) {
        collided = true;
      }
    });
    if (collided) {
      setIsGameOver(true);
      cancelAnimationFrame(animationRef.current);
      return;
    }

    // draw score
    ctx.fillStyle = "#adbac7"; // 밝은 회색
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);

    // update score and speed
    setScore((prev) => prev + 1);
    if (score > 0 && score % 500 === 0) {
      speed.current += 1; // 500점마다 속도 증가
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        background: "#22272e",
        minHeight: "320px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "100vw",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ color: "#adbac7" }}>Dino Runner</h2>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: "1px solid #444c56",
          background: "#2d333b",
          borderRadius: "6px",
          display: "block",
          margin: "0 auto",
          maxWidth: "100%",
          height: "auto",
          boxSizing: "border-box",
        }}
        onTouchStart={handleTouchStart}
      />
      <div style={{ marginTop: "10px", color: "#adbac7" }}>Score: {score}</div>
      {isGameOver && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ color: "#f85149", fontSize: "20px", marginBottom: "12px" }}>Game Over!</div>
          <div style={{ color: '#adbac7', marginTop: 8 }}>{saveMsg}</div>
          <button
            onClick={resetGame}
            style={{
              background: "#238636",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 28px",
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "background 0.2s",
            }}
          >
            재시작
          </button>
        </div>
      )}
      {/* 디노러너 랭킹 (금은동) 제거됨 */}
    </div>
  );
} 