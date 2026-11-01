/**
 * HIGHWAY DRIVE — OOP CHALLENGE
 * Complete 2D Car Traffic Simulator with Python OOP Quiz Mechanics
 */

// ==========================================
// 1. SOUND SYSTEM (Web Audio API Synthesizer)
// ==========================================
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.engineOsc = null;
    this.engineGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.setupEngineSound();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setupEngineSound() {
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch (e) {
      // Audio fallback
    }
  }

  setEnginePitch(speedRatio) {
    if (!this.ctx || !this.engineOsc || !this.enabled) return;
    const targetFreq = 40 + speedRatio * 50;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    this.engineGain.gain.setTargetAtTime(0.04, this.ctx.currentTime, 0.05);
  }

  stopEngine() {
    if (!this.ctx || !this.engineGain) return;
    this.engineGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.05);
  }

  playCrash() {
    if (!this.ctx || !this.enabled) return;
    this.stopEngine();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playCorrect() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playGameOver() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.6);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopEngine();
    }
    return this.enabled;
  }
}

// ==========================================
// 2. PYTHON OOP QUIZ MANAGER
// ==========================================
class OOPQuizManager {
  constructor() {
    this.originalQuestions = [
      {
        question: "Which OOP concept hides internal data and methods?",
        answer: "encapsulation"
      },
      {
        question: "Which concept allows a class to inherit another class?",
        answer: "inheritance"
      },
      {
        question: "Which concept means one name with many forms?",
        answer: "polymorphism"
      },
      {
        question: "What is a blueprint for creating objects in Python?",
        answer: "class"
      },
      {
        question: "What is an instance of a class called?",
        answer: "object"
      },
      {
        question: "Which keyword is used to create a class in Python?",
        answer: "class"
      },
      {
        question: "Which constructor method is commonly called when an object is created?",
        answer: "init"
      },
      {
        question: "Which OOP concept represents showing only essential details?",
        answer: "abstraction"
      },
      {
        question: "Which parameter in Python methods refers to the current instance?",
        answer: "self"
      },
      {
        question: "Which built-in function is used to call methods of a parent class?",
        answer: "super"
      }
    ];

    this.unusedIndices = [];
    this.currentQuestion = null;
    this.resetCycle();
  }

  resetCycle() {
    this.unusedIndices = this.originalQuestions.map((_, i) => i);
  }

  getRandomQuestion() {
    if (this.unusedIndices.length === 0) {
      this.resetCycle();
    }
    const randomIndex = Math.floor(Math.random() * this.unusedIndices.length);
    const questionIndex = this.unusedIndices.splice(randomIndex, 1)[0];
    this.currentQuestion = this.originalQuestions[questionIndex];
    return this.currentQuestion;
  }

  validate(userAnswer) {
    if (!this.currentQuestion || !userAnswer) return false;
    // Clean string: lowercase, strip all leading/trailing and inner quotes or underscores
    const cleanUser = userAnswer
      .trim()
      .toLowerCase()
      .replace(/__init__/g, "init")
      .replace(/['"_]/g, "");
    
    const cleanTarget = this.currentQuestion.answer
      .trim()
      .toLowerCase()
      .replace(/['"_]/g, "");

    return cleanUser === cleanTarget;
  }
}

// ==========================================
// 3. ROAD & ENVIRONMENT SYSTEM
// ==========================================
class RoadEnvironment {
  constructor(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;

    // Road geometry
    this.grassWidth = 60;
    this.roadLeft = this.grassWidth;
    this.roadWidth = this.width - (this.grassWidth * 2);
    this.roadRight = this.roadLeft + this.roadWidth;
    this.laneCount = 3;
    this.laneWidth = this.roadWidth / this.laneCount;

    // Lane centers (0: Left, 1: Middle, 2: Right)
    this.laneCenters = [
      this.roadLeft + this.laneWidth * 0.5,
      this.roadLeft + this.laneWidth * 1.5,
      this.roadLeft + this.laneWidth * 2.5
    ];

    // Scrolling dashed road markings
    this.dashOffset = 0;
    this.dashLength = 40;
    this.dashGap = 35;

    // Trees on road shoulders
    this.trees = [];
    this.initTrees();
  }

  initTrees() {
    const totalTrees = 14;
    const spacing = (this.height + 100) / (totalTrees / 2);
    for (let i = 0; i < totalTrees; i++) {
      const side = (i % 2 === 0) ? 'left' : 'right';
      const x = (side === 'left') ? 28 : (this.width - 28);
      const y = (Math.floor(i / 2) * spacing) - 50;
      this.trees.push({
        x: x + (Math.random() * 8 - 4),
        y: y,
        radius: 16 + Math.random() * 4,
        color: (i % 3 === 0) ? '#15803d' : (i % 3 === 1 ? '#166534' : '#14532d')
      });
    }
  }

  update(speed) {
    // Scroll lane dividers
    this.dashOffset = (this.dashOffset + speed) % (this.dashLength + this.dashGap);

    // Scroll roadside trees
    for (let tree of this.trees) {
      tree.y += speed;
      if (tree.y > this.height + 40) {
        tree.y = -40;
      }
    }
  }

  draw(ctx) {
    // 1. Grass Shoulders
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, this.grassWidth, this.height);
    ctx.fillRect(this.roadRight, 0, this.grassWidth, this.height);

    // Subtle grass texture lines
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1;
    for (let y = 10; y < this.height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(24, y + 6);
      ctx.moveTo(this.width - 24, y);
      ctx.lineTo(this.width - 8, y + 6);
      ctx.stroke();
    }

    // 2. Asphalt Road
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(this.roadLeft, 0, this.roadWidth, this.height);

    // 3. Road Shoulder Solid White Edges
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.roadLeft, 0);
    ctx.lineTo(this.roadLeft, this.height);
    ctx.moveTo(this.roadRight, 0);
    ctx.lineTo(this.roadRight, this.height);
    ctx.stroke();

    // 4. White Dashed Lane Dividers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([this.dashLength, this.dashGap]);
    ctx.lineDashOffset = -this.dashOffset;

    // Divider 1 (between lane 0 and 1)
    const div1X = this.roadLeft + this.laneWidth;
    ctx.beginPath();
    ctx.moveTo(div1X, 0);
    ctx.lineTo(div1X, this.height);
    ctx.stroke();

    // Divider 2 (between lane 1 and 2)
    const div2X = this.roadLeft + this.laneWidth * 2;
    ctx.beginPath();
    ctx.moveTo(div2X, 0);
    ctx.lineTo(div2X, this.height);
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash

    // 5. Draw Roadside Trees
    for (let tree of this.trees) {
      // Tree shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(tree.x + 3, tree.y + 4, tree.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tree foliage
      ctx.fillStyle = tree.color;
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2);
      ctx.fill();

      // Highlight circle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(tree.x - 3, tree.y - 3, tree.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ==========================================
// 4. PLAYER CAR CLASS
// ==========================================
class PlayerCar {
  constructor(road) {
    this.road = road;
    this.width = 44;
    this.height = 76;

    // Center in middle lane (Lane 1)
    this.currentLane = 1;
    this.targetX = this.road.laneCenters[this.currentLane];
    this.x = this.targetX;
    this.y = this.road.height - 130;

    // Speeds (km/h scale mapped to game loop)
    this.minSpeed = 50;
    this.maxSpeed = 150;
    this.speed = 70; // Starting speed in km/h
    this.targetSpeed = 70;
  }

  reset() {
    this.currentLane = 1;
    this.targetX = this.road.laneCenters[this.currentLane];
    this.x = this.targetX;
    this.speed = 70;
    this.targetSpeed = 70;
  }

  changeLane(direction) {
    if (direction === 'left' && this.currentLane > 0) {
      this.currentLane--;
    } else if (direction === 'right' && this.currentLane < this.road.laneCount - 1) {
      this.currentLane++;
    }
    this.targetX = this.road.laneCenters[this.currentLane];
  }

  accelerate() {
    this.targetSpeed = Math.min(this.maxSpeed, this.targetSpeed + 15);
  }

  brake() {
    this.targetSpeed = Math.max(this.minSpeed, this.targetSpeed - 15);
  }

  update() {
    // Smooth lane transition interpolation
    this.x += (this.targetX - this.x) * 0.22;

    // Smooth speed change
    this.speed += (this.targetSpeed - this.speed) * 0.1;

    // Strict boundary enforcement
    const halfWidth = this.width / 2;
    const minX = this.road.roadLeft + halfWidth + 4;
    const maxX = this.road.roadRight - halfWidth - 4;
    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
  }

  draw(ctx) {
    const rx = this.x - this.width / 2;
    const ry = this.y - this.height / 2;

    ctx.save();

    // 1. Car Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.drawRoundedRect(ctx, rx + 4, ry + 6, this.width, this.height, 8);
    ctx.fill();

    // 2. Main Blue Body
    const grad = ctx.createLinearGradient(rx, ry, rx + this.width, ry);
    grad.addColorStop(0, '#1d4ed8');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(1, '#1e40af');
    ctx.fillStyle = grad;
    this.drawRoundedRect(ctx, rx, ry, this.width, this.height, 8);
    ctx.fill();

    // 3. Wheels (4 rubber tires)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx - 3, ry + 10, 4, 14); // Front-Left
    ctx.fillRect(rx + this.width - 1, ry + 10, 4, 14); // Front-Right
    ctx.fillRect(rx - 3, ry + this.height - 24, 4, 14); // Rear-Left
    ctx.fillRect(rx + this.width - 1, ry + this.height - 24, 4, 14); // Rear-Right

    // 4. Roof / Cockpit (Dark Tinted Glass)
    ctx.fillStyle = '#0b132b';
    this.drawRoundedRect(ctx, rx + 6, ry + 18, this.width - 12, this.height - 36, 5);
    ctx.fill();

    // 5. Front Windshield (curved reflection)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(rx + 8, ry + 22);
    ctx.lineTo(rx + this.width - 8, ry + 22);
    ctx.lineTo(rx + this.width - 11, ry + 32);
    ctx.lineTo(rx + 11, ry + 32);
    ctx.closePath();
    ctx.fill();

    // 6. Rear Windshield
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rx + 9, ry + this.height - 28, this.width - 18, 7);

    // 7. Headlights (Bright Yellow-White)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(rx + 5, ry + 2, 7, 4);
    ctx.fillRect(rx + this.width - 12, ry + 2, 7, 4);

    // 8. Taillights (Red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rx + 5, ry + this.height - 4, 8, 3);
    ctx.fillRect(rx + this.width - 13, ry + this.height - 4, 8, 3);

    // 9. Racing Stripe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx + this.width / 2 - 2, ry + 4, 4, 12);
    ctx.fillRect(rx + this.width / 2 - 2, ry + this.height - 18, 4, 14);

    ctx.restore();
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  getBounds() {
    // Tighter collision hitbox for fair gameplay
    const paddingX = 4;
    const paddingY = 5;
    return {
      left: this.x - this.width / 2 + paddingX,
      right: this.x + this.width / 2 - paddingX,
      top: this.y - this.height / 2 + paddingY,
      bottom: this.y + this.height / 2 - paddingY
    };
  }
}

// ==========================================
// 5. TRAFFIC VEHICLES (Cars, Trucks, Buses)
// ==========================================
class TrafficVehicle {
  constructor(lane, y, type, road) {
    this.lane = lane;
    this.road = road;
    this.x = this.road.laneCenters[lane];
    this.y = y;
    this.type = type; // 'car', 'truck', 'bus'

    this.initProperties();
  }

  initProperties() {
    if (this.type === 'car') {
      this.width = 42;
      this.height = 74;
      this.baseSpeed = 35 + Math.random() * 15; // km/h
      const colors = ['#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#ea580c', '#0284c7'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    } else if (this.type === 'truck') {
      this.width = 46;
      this.height = 110;
      this.baseSpeed = 25 + Math.random() * 10;
      this.color = '#78350f'; // Brown/heavy body
      this.cabColor = '#b45309';
    } else if (this.type === 'bus') {
      this.width = 46;
      this.height = 135;
      this.baseSpeed = 20 + Math.random() * 12;
      this.color = '#f59e0b'; // School/transit yellow
      this.stripeColor = '#1e3a8a';
    }
  }

  update(playerSpeedKmh) {
    // Relative speed: Player travels forward at playerSpeedKmh, vehicle at baseSpeed
    // Pixels per frame delta
    const relativeSpeedKmh = playerSpeedKmh - this.baseSpeed;
    const speedPixels = relativeSpeedKmh * 0.12;
    this.y += speedPixels;
  }

  draw(ctx) {
    const rx = this.x - this.width / 2;
    const ry = this.y - this.height / 2;

    ctx.save();

    // Vehicle Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(rx + 3, ry + 4, this.width, this.height);

    if (this.type === 'car') {
      this.drawCar(ctx, rx, ry);
    } else if (this.type === 'truck') {
      this.drawTruck(ctx, rx, ry);
    } else if (this.type === 'bus') {
      this.drawBus(ctx, rx, ry);
    }

    ctx.restore();
  }

  drawCar(ctx, rx, ry) {
    // Tires
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx - 2, ry + 8, 3, 14);
    ctx.fillRect(rx + this.width - 1, ry + 8, 3, 14);
    ctx.fillRect(rx - 2, ry + this.height - 22, 3, 14);
    ctx.fillRect(rx + this.width - 1, ry + this.height - 22, 3, 14);

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(rx, ry, this.width, this.height);

    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx + 5, ry + 16, this.width - 10, this.height - 32);
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(rx + 7, ry + 18, this.width - 14, 10);

    // Rear lights (facing player coming from behind)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rx + 4, ry + this.height - 3, 7, 3);
    ctx.fillRect(rx + this.width - 11, ry + this.height - 3, 7, 3);
  }

  drawTruck(ctx, rx, ry) {
    // Tires (6 wheels)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx - 2, ry + 8, 3, 14);
    ctx.fillRect(rx + this.width - 1, ry + 8, 3, 14);
    ctx.fillRect(rx - 2, ry + 50, 3, 14);
    ctx.fillRect(rx + this.width - 1, ry + 50, 3, 14);
    ctx.fillRect(rx - 2, ry + this.height - 20, 3, 14);
    ctx.fillRect(rx + this.width - 1, ry + this.height - 20, 3, 14);

    // Cargo Container (Rear)
    ctx.fillStyle = '#475569';
    ctx.fillRect(rx + 2, ry + 36, this.width - 4, this.height - 38);
    // Corrugation lines on cargo
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let ly = ry + 44; ly < ry + this.height - 8; ly += 10) {
      ctx.beginPath();
      ctx.moveTo(rx + 4, ly);
      ctx.lineTo(rx + this.width - 4, ly);
      ctx.stroke();
    }

    // Cab (Front)
    ctx.fillStyle = this.cabColor;
    ctx.fillRect(rx, ry, this.width, 34);

    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx + 4, ry + 10, this.width - 8, 14);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(rx + 6, ry + 12, this.width - 12, 10);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rx + 4, ry + this.height - 3, 8, 3);
    ctx.fillRect(rx + this.width - 12, ry + this.height - 3, 8, 3);
  }

  drawBus(ctx, rx, ry) {
    // Long Bus Body
    ctx.fillStyle = this.color;
    ctx.fillRect(rx, ry, this.width, this.height);

    // Decorative Blue Stripe
    ctx.fillStyle = this.stripeColor;
    ctx.fillRect(rx, ry + 22, this.width, 6);

    // Roof Vents
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(rx + 10, ry + 40, this.width - 20, 16);
    ctx.fillRect(rx + 10, ry + 80, this.width - 20, 16);

    // Front Windshield
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(rx + 4, ry + 4, this.width - 8, 12);

    // Rear Window
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rx + 6, ry + this.height - 12, this.width - 12, 6);

    // Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(rx + 3, ry + this.height - 4, 8, 4);
    ctx.fillRect(rx + this.width - 11, ry + this.height - 4, 8, 4);
  }

  getBounds() {
    const paddingX = 4;
    const paddingY = 6;
    return {
      left: this.x - this.width / 2 + paddingX,
      right: this.x + this.width / 2 - paddingX,
      top: this.y - this.height / 2 + paddingY,
      bottom: this.y + this.height / 2 - paddingY
    };
  }
}

// ==========================================
// 6. MAIN GAME ENGINE
// ==========================================
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Subsystems
    this.sound = new SoundSystem();
    this.quizManager = new OOPQuizManager();
    this.road = new RoadEnvironment(this.canvas.width, this.canvas.height);
    this.player = new PlayerCar(this.road);

    // Gameplay State
    this.state = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'QUIZ' | 'GAME_OVER'
    this.traffic = [];
    this.score = 0;
    this.distanceMetres = 0;
    this.bestScore = parseInt(localStorage.getItem('highway_best_score') || '0', 10);

    // Spawning parameters
    this.spawnTimer = 0;
    this.spawnInterval = 85; // frames between traffic spawns

    // DOM UI Elements
    this.hudScore = document.getElementById('hudScore');
    this.hudDistance = document.getElementById('hudDistance');
    this.hudSpeed = document.getElementById('hudSpeed');
    this.hudBest = document.getElementById('hudBest');
    this.soundBtn = document.getElementById('soundBtn');
    this.pauseBtn = document.getElementById('pauseBtn');

    this.startScreen = document.getElementById('startScreen');
    this.pauseScreen = document.getElementById('pauseScreen');
    this.quizScreen = document.getElementById('quizScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');

    this.startBestScore = document.getElementById('startBestScore');
    this.startGameBtn = document.getElementById('startGameBtn');
    this.resumeBtn = document.getElementById('resumeBtn');
    this.restartGameBtn = document.getElementById('restartGameBtn');

    this.quizQuestionText = document.getElementById('quizQuestionText');
    this.quizAnswerInput = document.getElementById('quizAnswerInput');
    this.quizFeedback = document.getElementById('quizFeedback');
    this.quizForm = document.getElementById('quizForm');

    this.finalScoreVal = document.getElementById('finalScoreVal');
    this.finalDistVal = document.getElementById('finalDistVal');
    this.finalBestVal = document.getElementById('finalBestVal');

    this.initUI();
    this.initControls();

    // Start Animation Loop
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  initUI() {
    this.hudBest.textContent = this.bestScore;
    this.startBestScore.textContent = this.bestScore;

    this.startGameBtn.addEventListener('click', () => {
      this.sound.init();
      this.startGame();
    });

    this.resumeBtn.addEventListener('click', () => {
      this.resumeGame();
    });

    this.restartGameBtn.addEventListener('click', () => {
      this.sound.init();
      this.restartGame();
    });

    this.pauseBtn.addEventListener('click', () => {
      this.togglePause();
    });

    this.soundBtn.addEventListener('click', () => {
      const active = this.sound.toggle();
      this.soundBtn.textContent = active ? '🔊' : '🔇';
    });

    this.quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleQuizSubmit();
    });
  }

  initControls() {
    window.addEventListener('keydown', (e) => {
      // Don't capture arrow keys if user is typing into the quiz input
      if (this.state === 'QUIZ') return;

      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.changeLane('left');
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.changeLane('right');
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.accelerate();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.brake();
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }
    });

    // Touch / On-screen buttons
    document.getElementById('touchLeft').addEventListener('click', () => {
      if (this.state === 'PLAYING') this.player.changeLane('left');
    });
    document.getElementById('touchRight').addEventListener('click', () => {
      if (this.state === 'PLAYING') this.player.changeLane('right');
    });
    document.getElementById('touchGas').addEventListener('click', () => {
      if (this.state === 'PLAYING') this.player.accelerate();
    });
    document.getElementById('touchBrake').addEventListener('click', () => {
      if (this.state === 'PLAYING') this.player.brake();
    });
  }

  showScreen(screen) {
    this.startScreen.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.quizScreen.classList.remove('active');
    this.gameOverScreen.classList.remove('active');

    if (screen) {
      screen.classList.add('active');
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.distanceMetres = 0;
    this.traffic = [];
    this.spawnTimer = 0;
    this.player.reset();
    this.showScreen(null);
  }

  restartGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.distanceMetres = 0;
    this.traffic = [];
    this.spawnTimer = 0;
    this.player.reset();
    this.showScreen(null);
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.sound.stopEngine();
      this.showScreen(this.pauseScreen);
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.state = 'PLAYING';
    this.showScreen(null);
  }

  // ==========================================
  // TRAFFIC SPAWNER
  // ==========================================
  spawnTraffic() {
    this.spawnTimer++;

    // Dynamically adjust spawn rate based on score
    const targetInterval = Math.max(45, 85 - Math.floor(this.score / 60) * 5);

    if (this.spawnTimer >= targetInterval) {
      this.spawnTimer = 0;

      // Choose a lane (0, 1, or 2)
      const availableLanes = [0, 1, 2];
      
      // Filter out lanes that already have a vehicle near the top spawn region (-150 to 50)
      const validLanes = availableLanes.filter(lane => {
        return !this.traffic.some(v => v.lane === lane && v.y < 90);
      });

      if (validLanes.length === 0) return;

      const lane = validLanes[Math.floor(Math.random() * validLanes.length)];

      // Choose vehicle type based on score
      const types = ['car', 'car', 'truck'];
      if (this.score > 80) types.push('bus');
      if (this.score > 150) types.push('truck', 'bus');
      const selectedType = types[Math.floor(Math.random() * types.length)];

      const spawnY = -90;
      this.traffic.push(new TrafficVehicle(lane, spawnY, selectedType, this.road));
    }
  }

  // ==========================================
  // COLLISION & QUIZ MECHANISM
  // ==========================================
  checkCollisions() {
    const pBounds = this.player.getBounds();

    for (let vehicle of this.traffic) {
      const vBounds = vehicle.getBounds();

      // Standard AABB Collision Check
      const collides = !(
        pBounds.right < vBounds.left ||
        pBounds.left > vBounds.right ||
        pBounds.bottom < vBounds.top ||
        pBounds.top > vBounds.bottom
      );

      if (collides) {
        this.triggerCollision();
        break;
      }
    }
  }

  triggerCollision() {
    // 1. Immediately stop gameplay
    this.state = 'QUIZ';
    // 2. Play crash sound effect
    this.sound.playCrash();

    // 3. Freeze all positions and show Quiz popup
    const q = this.quizManager.getRandomQuestion();
    this.quizQuestionText.textContent = q.question;
    this.quizAnswerInput.value = '';
    this.quizFeedback.textContent = '';
    this.quizFeedback.className = 'feedback-message';

    this.showScreen(this.quizScreen);

    // Auto-focus input for rapid seamless answering
    setTimeout(() => {
      this.quizAnswerInput.focus();
    }, 150);
  }

  handleQuizSubmit() {
    const rawAnswer = this.quizAnswerInput.value;
    const isCorrect = this.quizManager.validate(rawAnswer);

    if (isCorrect) {
      // SUCCESS BEHAVIOUR
      this.sound.playCorrect();
      this.quizFeedback.className = 'feedback-message correct';
      this.quizFeedback.textContent = 'CORRECT! YOU GET ANOTHER CHANCE!';

      // Give player a brief safety separation so they don't immediately re-collide
      for (let v of this.traffic) {
        if (Math.abs(v.y - this.player.y) < 120 && v.lane === this.player.currentLane) {
          v.y -= 160; // Push collided vehicle slightly ahead
        }
      }

      // Resume game after brief visual celebration
      setTimeout(() => {
        this.showScreen(null);
        this.state = 'PLAYING';
      }, 1000);

    } else {
      // WRONG ANSWER BEHAVIOUR -> GAME OVER
      this.sound.playGameOver();
      this.quizFeedback.className = 'feedback-message wrong';
      this.quizFeedback.textContent = 'WRONG ANSWER! GAME OVER!';

      setTimeout(() => {
        this.triggerGameOver();
      }, 1000);
    }
  }

  triggerGameOver() {
    this.state = 'GAME_OVER';
    this.sound.stopEngine();

    // Update High Score
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('highway_best_score', this.bestScore.toString());
      this.hudBest.textContent = this.bestScore;
      this.startBestScore.textContent = this.bestScore;
    }

    this.finalScoreVal.textContent = this.score;
    this.finalDistVal.textContent = `${Math.floor(this.distanceMetres)} m`;
    this.finalBestVal.textContent = this.bestScore;

    this.showScreen(this.gameOverScreen);
  }

  // ==========================================
  // GAME LOOP
  // ==========================================
  loop() {
    if (this.state === 'PLAYING') {
      // 1. Update Road Scenery movement
      const speedPixelScale = this.player.speed * 0.12;
      this.road.update(speedPixelScale);

      // 2. Update Player
      this.player.update();
      this.sound.setEnginePitch(this.player.speed / this.player.maxSpeed);

      // 3. Distance & Scoring Rules: +10 pts for every 100 metres
      const deltaDist = (this.player.speed * 1000 / 3600) / 60; // metres per frame
      this.distanceMetres += deltaDist;
      this.score = Math.floor(this.distanceMetres / 100) * 10;

      // 4. Update Traffic
      this.spawnTraffic();
      for (let i = this.traffic.length - 1; i >= 0; i--) {
        const v = this.traffic[i];
        v.update(this.player.speed);

        // Remove offscreen vehicles below or above screen
        if (v.y > this.canvas.height + 150) {
          this.traffic.splice(i, 1);
        }
      }

      // 5. Collision Check
      this.checkCollisions();

      // 6. Update HUD
      this.hudScore.textContent = this.score;
      this.hudDistance.textContent = `${Math.floor(this.distanceMetres)} m`;
      this.hudSpeed.textContent = `${Math.round(this.player.speed)} km/h`;
    }

    // Render Scene
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Road and Nature
    this.road.draw(this.ctx);

    // 2. Draw Traffic Vehicles
    for (let vehicle of this.traffic) {
      vehicle.draw(this.ctx);
    }

    // 3. Draw Player's Blue Car
    this.player.draw(this.ctx);
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
