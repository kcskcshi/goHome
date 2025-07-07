import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { getStoredNickname, generateNickname, setStoredNickname } from '@/utils/nickname';

interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
  dinoY: number;
  dinoVelocity: number;
  obstacles: Array<{ x: number; y: number; type: 'cactus' | 'pterodactyl' }>;
  gameSpeed: number;
  isDucking: boolean;
}

const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const GROUND_Y = 0;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 40;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 40;
const PTERODACTYL_HEIGHT = 30;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const DINO_START_X = 50; // 공룡 시작 위치 (좌측 끝)

// 도트 공룡 SVG 컴포넌트
const DotDino = ({ x, y, size = 32 }: { x: number; y: number; size?: number }) => (
  <svg
    x={x}
    y={y}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    style={{ position: 'absolute', imageRendering: 'pixelated' }}
  >
    {/* 몸통 */}
    <rect x="2" y="7" width="8" height="5" fill="#6ee7b7" />
    {/* 다리 */}
    <rect x="3" y="12" width="2" height="2" fill="#6ee7b7" />
    <rect x="7" y="12" width="2" height="2" fill="#6ee7b7" />
    {/* 꼬리 */}
    <rect x="0" y="9" width="2" height="2" fill="#34d399" />
    {/* 머리 */}
    <rect x="9" y="5" width="4" height="3" fill="#6ee7b7" />
    {/* 눈 */}
    <rect x="12" y="6" width="1" height="1" fill="#222" />
  </svg>
);

// 도트 운석 SVG 컴포넌트
const DotMeteor = ({ x, y, size = 16 }: { x: number; y: number; size?: number }) => (
  <svg
    x={x}
    y={y}
    width={size}
    height={size}
    viewBox="0 0 12 12"
    style={{ position: 'absolute', imageRendering: 'pixelated' }}
  >
    {/* 운석 본체 */}
    <rect x="3" y="3" width="6" height="6" fill="#f87171" />
    {/* 불꽃 꼬리 */}
    <rect x="2" y="7" width="2" height="2" fill="#fbbf24" />
    <rect x="1" y="9" width="1" height="1" fill="#f59e42" />
  </svg>
);

// 도트 익룡 SVG 컴포넌트 (2프레임)
const DotPteranodon = ({ x, y, size = 20, frame = 0 }: { x: number; y: number; size?: number; frame?: number }) => (
  <svg
    x={x}
    y={y}
    width={size}
    height={size}
    viewBox="0 0 20 12"
    style={{ position: 'absolute', imageRendering: 'pixelated' }}
  >
    {/* 몸통 */}
    <rect x="8" y="5" width="4" height="2" fill="#a3a3a3" />
    {/* 머리 */}
    <rect x="12" y="5" width="2" height="1" fill="#a3a3a3" />
    {/* 날개 프레임 */}
    {frame === 0 ? (
      <>
        <rect x="4" y="7" width="6" height="1" fill="#a3a3a3" />
        <rect x="2" y="8" width="2" height="1" fill="#a3a3a3" />
      </>
    ) : (
      <>
        <rect x="4" y="4" width="6" height="1" fill="#a3a3a3" />
        <rect x="2" y="3" width="2" height="1" fill="#a3a3a3" />
      </>
    )}
  </svg>
);

// 도트 지면 SVG 컴포넌트 (반복 패턴)
const DotGround = ({ width, y = 160 }: { width: number; y?: number }) => (
  <svg
    x={0}
    y={y}
    width={width}
    height={16}
    viewBox={`0 0 ${width} 16`}
    style={{ position: 'absolute', imageRendering: 'pixelated' }}
  >
    {/* 반복되는 도트 패턴 */}
    {Array.from({ length: Math.ceil(width / 8) }).map((_, i) => (
      <rect key={i} x={i * 8} y={8 + (i % 2) * 2} width={8} height={4} fill="#a16207" />
    ))}
  </svg>
);

export default function DinoRunnerGame() {
  const animationRef = useRef<number | undefined>(undefined);
  const { addGameScore } = useSupabase();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('dino-high-score') || '0'),
    dinoY: GROUND_Y,
    dinoVelocity: 0,
    obstacles: [],
    gameSpeed: 5,
    isDucking: false,
  });
  const [nickname, setNicknameState] = useState<string>(() => {
    let n = getStoredNickname();
    if (!n) {
      n = generateNickname();
      setStoredNickname(n);
    }
    return n;
  });
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [pteranodonFrame, setPteranodonFrame] = useState(0);

  // 게임 루프
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying) return;

    setGameState(prev => {
      // 디노 점프 물리
      let newDinoY = prev.dinoY + prev.dinoVelocity;
      let newDinoVelocity = prev.dinoVelocity + GRAVITY;
      if (newDinoY >= GROUND_Y) {
        newDinoY = GROUND_Y;
        newDinoVelocity = 0;
      }
      // 장애물 이동
      const newObstacles = prev.obstacles
        .map(obs => ({ ...obs, x: obs.x - prev.gameSpeed }))
        .filter(obs => obs.x > -OBSTACLE_WIDTH);
      // 새 장애물 생성 (우측에서 등장, y좌표 랜덤)
      if (Math.random() < 0.02) {
        const isPterodactyl = Math.random() < 0.3;
        newObstacles.push({
          x: GAME_WIDTH,
          y: isPterodactyl ? (Math.random() < 0.5 ? 30 : 60) : GROUND_Y, // 익룡은 공중, 운석은 지면
          type: isPterodactyl ? 'pterodactyl' : 'cactus',
        });
      }
      // 충돌 감지 (기존 로직 유지)
      const dinoHitbox = {
        x: DINO_START_X, // 공룡을 좌측 끝에 고정
        y: prev.isDucking ? newDinoY + 20 : newDinoY,
        width: DINO_WIDTH,
        height: prev.isDucking ? DINO_HEIGHT / 2 : DINO_HEIGHT,
      };
      const collision = newObstacles.some(obs => {
        const obsHitbox = {
          x: obs.x,
          y: obs.y,
          width: OBSTACLE_WIDTH,
          height: obs.type === 'pterodactyl' ? PTERODACTYL_HEIGHT : OBSTACLE_HEIGHT,
        };
        return (
          dinoHitbox.x < obsHitbox.x + obsHitbox.width &&
          dinoHitbox.x + dinoHitbox.width > obsHitbox.x &&
          dinoHitbox.y < obsHitbox.y + obsHitbox.height &&
          dinoHitbox.y + dinoHitbox.height > obsHitbox.y
        );
      });
      if (collision) {
        // 게임 오버 시 최고점이면 자동 저장
        if (prev.score > prev.highScore) {
          addGameScore(prev.score, 'temp-uuid', nickname, 'dino');
        }
        return {
          ...prev,
          isPlaying: false,
          isGameOver: true,
          dinoY: newDinoY,
          dinoVelocity: newDinoVelocity,
          obstacles: newObstacles,
          highScore: Math.max(prev.highScore, prev.score),
        };
      }
      // 점수 증가
      const newScore = prev.score + 1;
      const newHighScore = Math.max(prev.highScore, newScore);
      // 속도 증가
      const newGameSpeed = 5 + Math.floor(newScore / 1000);
      return {
        ...prev,
        score: newScore,
        highScore: newHighScore,
        dinoY: newDinoY,
        dinoVelocity: newDinoVelocity,
        obstacles: newObstacles,
        gameSpeed: newGameSpeed,
      };
    });
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, addGameScore, nickname]);

  // 게임 시작
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false,
      score: 0,
      dinoY: GROUND_Y,
      dinoVelocity: 0,
      obstacles: [],
      gameSpeed: 5,
      isDucking: false,
    }));
  };

  // 점프
  const jump = () => {
    if (!gameState.isPlaying || gameState.dinoY !== GROUND_Y) return;
    setGameState(prev => ({
      ...prev,
      dinoVelocity: JUMP_FORCE,
    }));
  };

  // 숙이기
  const duck = (isDucking: boolean) => {
    if (!gameState.isPlaying) return;
    setGameState(prev => ({
      ...prev,
      isDucking,
    }));
  };

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        duck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        duck(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying]);

  // 게임 루프 시작/정지
  useEffect(() => {
    if (gameState.isPlaying) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameLoop]);

  // 하이스코어 저장
  useEffect(() => {
    if (gameState.highScore > 0) {
      localStorage.setItem('dino-high-score', gameState.highScore.toString());
    }
  }, [gameState.highScore]);

  // 익룡 프레임 애니메이션
  useEffect(() => {
    if (!gameState.isPlaying) return;
    const interval = setInterval(() => {
      setPteranodonFrame(f => (f + 1) % 2);
    }, 200);
    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

  // 점수 저장
  const saveScore = async () => {
    if (!nickname.trim()) return;
    
    try {
      await addGameScore(gameState.score, 'temp-uuid', nickname, 'dino');
      setShowScoreInput(false);
      alert('점수가 저장되었습니다!');
    } catch (error) {
      console.error('Score save failed:', error);
      alert('점수 저장에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-github-text font-bold text-xl mb-3">🦖 Dino Runner</h3>
        <p className="text-github-muted text-base mb-4">
          스페이스바 또는 ↑로 점프, ↓로 숙이기
        </p>
      </div>
      {/* 도트 게임 화면 */}
      <div className="relative flex justify-center items-end" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: '#1c2128', borderRadius: 8, border: '1px solid #30363d' }}>
        {/* 지면 */}
        <DotGround width={GAME_WIDTH} y={GROUND_Y + DINO_HEIGHT} />
        {/* 공룡 */}
        <DotDino x={DINO_START_X} y={gameState.dinoY + (gameState.isDucking ? 20 : 0)} size={gameState.isDucking ? DINO_HEIGHT / 2 : DINO_HEIGHT} />
        {/* 장애물 */}
        {gameState.obstacles.map((obs, i) =>
          obs.type === 'cactus' ? (
            <DotMeteor key={i} x={obs.x} y={obs.y} size={OBSTACLE_WIDTH} />
          ) : (
            <DotPteranodon key={i} x={obs.x} y={obs.y} size={OBSTACLE_WIDTH} frame={pteranodonFrame} />
          )
        )}
        {/* 점수판 */}
        <div style={{ position: 'absolute', left: 10, top: 10, color: '#f0f6fc', fontFamily: 'monospace', fontSize: 18, textShadow: '1px 1px 0 #222' }}>
          Score: {gameState.score}<br />
          High Score: {gameState.highScore}<br />
          Speed: {gameState.gameSpeed}
        </div>
      </div>
      {/* 게임 컨트롤 */}
      <div className="flex justify-center space-x-4">
        {!gameState.isPlaying && !gameState.isGameOver && (
          <button
            onClick={startGame}
            className="bg-yellow-600 text-white px-6 py-2 rounded font-bold border-2 border-yellow-300 shadow-dot hover:bg-yellow-700 transition-colors"
            style={{ fontFamily: 'monospace', fontSize: 18 }}
          >
            게임 시작
          </button>
        )}
        {gameState.isGameOver && (
          <div className="text-center space-y-3">
            <div className="text-github-text font-bold text-lg">
              게임 오버! 점수: {gameState.score}
            </div>
            {!showScoreInput ? (
              <button
                onClick={() => setShowScoreInput(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded font-bold border-2 border-yellow-300 shadow-dot hover:bg-yellow-700 transition-colors"
                style={{ fontFamily: 'monospace', fontSize: 16 }}
              >
                점수 저장하기
              </button>
            ) : (
              <form onSubmit={e => { e.preventDefault(); saveScore(); }} className="flex flex-col items-center space-y-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNicknameState(e.target.value)}
                  placeholder="닉네임 입력"
                  className="px-2 py-1 border rounded text-black"
                  style={{ fontFamily: 'monospace', fontSize: 16 }}
                />
                <button
                  type="submit"
                  className="bg-yellow-600 text-white px-4 py-1 rounded font-bold border-2 border-yellow-300 shadow-dot hover:bg-yellow-700 transition-colors"
                  style={{ fontFamily: 'monospace', fontSize: 16 }}
                >
                  저장
                </button>
              </form>
            )}
            <button
              onClick={startGame}
              className="bg-gray-700 text-white px-4 py-2 rounded font-bold border-2 border-gray-400 shadow-dot hover:bg-gray-800 transition-colors"
              style={{ fontFamily: 'monospace', fontSize: 16 }}
            >
              다시 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 