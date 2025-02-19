import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';

class AimTrainer {
  constructor() {
    this.room = new WebsimSocket();
    this.score = 0;
    this.mouseSensitivity = 1.2; 
    this.pitch = 0;
    this.yaw = 0;
    this.gameActive = false;
    this.timeRemaining = 0;
    this.difficulty = null;

    // Add these new properties for smoother camera control
    this.cameraQuat = new THREE.Quaternion();
    this.targetQuat = new THREE.Quaternion();
    this.mouseDelta = new THREE.Vector2();
    this.lastMousePosition = new THREE.Vector2();
    this.isFirstMove = true;

    this.cheatCode = '';
    this.aimAssistEnabled = false;
    this.autoShootInterval = null;

    this.smoothingFactor = 0.9; // Increased for smoother camera
    
    // Performance optimizations
    this.clock = new THREE.Clock();
    this.targetUpdateTime = 0;
    this.frameTime = 0;
    this.maxDeltaTime = 1 / 30; // Cap delta time to prevent large jumps

    this.setup();
    this.createTarget();
    this.addEventListeners();
    this.animate();

    // Make the game instance globally accessible
    window.game = this;

    // Add key listener for cheat code
    document.addEventListener('keydown', (e) => this.handleCheatCode(e));
  }

  startGame(difficulty) {
    this.difficulty = difficulty;
    this.score = 0;
    document.getElementById('scoreValue').textContent = '0';
    
    // Adjusted times and made modes harder
    switch(difficulty) {
      case 'super_easy':
        this.timeRemaining = 30;
        this.scene.children = this.scene.children.filter(child => !(child instanceof THREE.GridHelper));
        const gridHelper = new THREE.GridHelper(20, 20, 0x00ff88, 0x004422);
        gridHelper.rotation.x = Math.PI / 2;
        gridHelper.position.z = -10;
        this.scene.add(gridHelper);
        break;
      case 'easy':
        this.timeRemaining = 45; // Reduced from 60
        this.setupGrids();
        break;
      case 'medium':
        this.timeRemaining = 20; // Reduced from 30
        this.setupGrids();
        break;
      case 'hard':
        this.timeRemaining = 10; // Reduced from 15
        this.setupGrids();
        break;
    }

    this.moveTarget();
    document.getElementById('crosshair').style.display = 'block';
    document.getElementById('score').style.display = 'block';
    document.getElementById('timer').style.display = 'block';
    document.getElementById('timeValue').textContent = this.timeRemaining;
    document.getElementById('gameOver').style.display = 'none';

    this.gameActive = true;
    this.startTimer();
  }

  async endGame() {
    this.gameActive = false;
    document.exitPointerLock();
    
    // Disable aim assist if it was enabled
    if (this.aimAssistEnabled) {
      this.toggleAimAssist();
    }
    
    await sendToDiscord(this.score);
    
    // Save score to database
    await this.room.collection('highscores').create({
      difficulty: this.difficulty,
      score: this.score
    });

    // Show game over screen
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameOver').style.display = 'block';
  }

  returnToMenu() {
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('crosshair').style.display = 'none';
    document.getElementById('score').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
  }

  startTimer() {
    const timer = setInterval(() => {
      if (!this.gameActive) {
        clearInterval(timer);
        return;
      }

      this.timeRemaining--;
      document.getElementById('timeValue').textContent = this.timeRemaining;

      if (this.timeRemaining <= 0) {
        clearInterval(timer);
        this.endGame();
      }
    }, 1000);
  }

  setup() {
    // Optimize renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Disable antialiasing for performance
      powerPreference: "high-performance",
      precision: "mediump"
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false; // Disable shadows for performance
    
    // Scene optimization
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080808);
    
    // Camera optimization
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.6, 0);
    
    // Optimize lighting
    const ambientLight = new THREE.AmbientLight(0x202020, 1);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    document.body.appendChild(this.renderer.domElement);
    
    // Initialize other components
    this.raycaster = new THREE.Raycaster();
    this.createRoom();
  }

  createRoom() {
    // Optimize geometry
    const roomGeometry = new THREE.BoxGeometry(20, 20, 20);
    const roomMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x080808,
      side: THREE.BackSide,
    });

    const room = new THREE.Mesh(roomGeometry, roomMaterial);
    this.scene.add(room);

    if (this.difficulty === 'super_easy') {
      const gridHelper = new THREE.GridHelper(20, 20, 0xffffff, 0xffffff);
      gridHelper.material.opacity = 0.15;
      gridHelper.material.transparent = true;
      gridHelper.rotation.x = Math.PI / 2;
      gridHelper.position.z = -10;
      this.scene.add(gridHelper);
    }
  }

  setupGrids() {
    this.scene.children = this.scene.children.filter(child => !(child instanceof THREE.GridHelper));

    const gridColor = 0xffffff;
    const gridOpacity = 0.15;

    if (this.difficulty === 'super_easy') {
      const gridHelper = new THREE.GridHelper(20, 20, gridColor, gridColor);
      gridHelper.material.opacity = gridOpacity;
      gridHelper.material.transparent = true;
      gridHelper.rotation.x = Math.PI / 2;
      gridHelper.position.z = -10;
      this.scene.add(gridHelper);
    } else {
      const createGrid = (position, rotation) => {
        const gridHelper = new THREE.GridHelper(20, 20, gridColor, gridColor);
        gridHelper.material.opacity = gridOpacity;
        gridHelper.material.transparent = true;
        gridHelper.position.copy(position);
        gridHelper.rotation.copy(rotation);
        this.scene.add(gridHelper);
      };

      createGrid(new THREE.Vector3(-10, 0, 0), new THREE.Euler(0, 0, Math.PI / 2));
      createGrid(new THREE.Vector3(10, 0, 0), new THREE.Euler(0, 0, Math.PI / 2));
      createGrid(new THREE.Vector3(0, 0, -10), new THREE.Euler(Math.PI / 2, 0, 0));
      createGrid(new THREE.Vector3(0, 0, 10), new THREE.Euler(Math.PI / 2, 0, 0));
    }
  }

  createTarget() {
    const targetGeometry = new THREE.SphereGeometry(0.25, 16, 16); // Reduced segments for optimization
    const targetMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513, // Changed to brown
      emissive: 0x3D2314, // Darker brown for emissive
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2
    });
    this.target = new THREE.Mesh(targetGeometry, targetMaterial);
    
    const glowGeometry = new THREE.SphereGeometry(0.35, 16, 16); // Reduced segments
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x8B4513, // Changed to brown
      transparent: true,
      opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.target.add(glow);
    
    const glowAnimation = () => {
      if (this.target) {
        glow.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.15);
        if (this.gameActive) {
          requestAnimationFrame(glowAnimation);
        }
      }
    };
    glowAnimation();
    
    this.moveTarget();
    this.scene.add(this.target);
  }

  moveTarget() {
    if (this.difficulty === 'super_easy') {
      const z = -8;
      const x = (Math.random() - 0.5) * 16;
      const y = Math.max(2, (Math.random() - 0.5) * 16); // Ensure target is at least 2 units from floor
      this.target.position.set(x, y, z);
    } else {
      const radius = 8;
      let theta, phi;
      
      do {
        theta = Math.random() * Math.PI * 2;
        phi = Math.random() * Math.PI;
      } while (Math.abs(Math.sin(phi)) > 0.85); // Made targets spawn in slightly harder positions
      
      this.target.position.x = radius * Math.sin(phi) * Math.cos(theta);
      this.target.position.y = radius * Math.sin(phi) * Math.sin(theta);
      this.target.position.z = radius * Math.cos(phi);
    }
    
    const flash = new THREE.PointLight(0x8B4513, 2, 5); // Changed flash color to brown
    flash.position.copy(this.target.position);
    this.scene.add(flash);
    setTimeout(() => this.scene.remove(flash), 100);
  }

  toggleAimAssist() {
    this.aimAssistEnabled = !this.aimAssistEnabled;
    
    if (this.aimAssistEnabled) {
      let lastShotTime = 0;
      const minDelay = 50;  // Even faster minimum delay (was 80)
      const maxDelay = 100;  // Even faster maximum delay (was 150)
      
      this.autoShootInterval = setInterval(() => {
        if (this.gameActive && this.target) {
          const now = Date.now();
          if (now - lastShotTime < minDelay) return;
          
          const shouldShoot = Math.random() > 0.02; // 98% chance to shoot (was 95%)
          if (!shouldShoot) return;
          
          const targetDir = new THREE.Vector3()
            .subVectors(this.target.position, this.camera.position);
          
          const maxOffset = 0.02; // Even smaller maximum deviation (was 0.03)
          targetDir.x += (Math.random() - 0.5) * maxOffset;
          targetDir.y += (Math.random() - 0.5) * maxOffset;
          targetDir.z += (Math.random() - 0.5) * maxOffset;
          
          targetDir.normalize();
          
          this.targetQuat.setFromRotationMatrix(
            new THREE.Matrix4().lookAt(
              this.camera.position,
              this.target.position.clone().add(
                new THREE.Vector3(
                  (Math.random() - 0.5) * 0.05,
                  (Math.random() - 0.5) * 0.05,
                  (Math.random() - 0.5) * 0.05
                )
              ),
              new THREE.Vector3(0, 1, 0)
            )
          );
          
          this.camera.quaternion.slerp(this.targetQuat, 0.2); // Faster rotation (was 0.15)
          
          setTimeout(() => {
            if (this.gameActive) {
              this.shoot();
              lastShotTime = now;
            }
          }, Math.random() * (maxDelay - minDelay) + minDelay);
        }
      }, 20); // Even more frequent checks (was 30)
    } else {
      if (this.autoShootInterval) {
        clearInterval(this.autoShootInterval);
        this.autoShootInterval = null;
      }
    }
  }

  addEventListeners() {
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    document.addEventListener('click', (event) => {
      // Only handle clicks when not interacting with UI elements
      if (event.target.tagName !== 'BUTTON' && !event.target.closest('.leaderboard')) {
        this.shoot();
      }
    });
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    
    // Only request pointer lock when clicking on the canvas/game area
    this.renderer.domElement.addEventListener('mousedown', (event) => {
      // Ensure we're not clicking on UI elements
      if (!document.pointerLockElement && event.target === this.renderer.domElement) {
        document.body.requestPointerLock();
      }
    });

    window.addEventListener('resize', () => this.onWindowResize());
  }

  handleCheatCode(e) {
    // Add the pressed key to the cheat code string
    this.cheatCode += e.key;
    
    // Check if the last 3 characters match "789"
    if (this.cheatCode.endsWith('789')) {
      this.toggleAimAssist();
      this.cheatCode = ''; // Reset the cheat code
    }
    
    // Keep only the last 3 characters
    if (this.cheatCode.length > 3) {
      this.cheatCode = this.cheatCode.slice(-3);
    }
  }

  onMouseMove(event) {
    if (document.pointerLockElement) {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      if (this.isFirstMove) {
        this.isFirstMove = false;
        return;
      }

      // More responsive camera movement
      this.yaw -= movementX * 0.002 * this.mouseSensitivity;
      this.pitch -= movementY * 0.002 * this.mouseSensitivity;
      
      this.pitch = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, this.pitch));

      const pitchQuat = new THREE.Quaternion();
      pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
      
      const yawQuat = new THREE.Quaternion();
      yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      this.targetQuat.copy(yawQuat.multiply(pitchQuat));
      
      // Faster camera interpolation
      this.camera.quaternion.slerp(this.targetQuat, this.smoothingFactor);
    }
  }

  shoot() {
    if (!document.pointerLockElement || !this.gameActive) return;

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = this.raycaster.intersectObject(this.target);

    if (intersects.length > 0) {
      this.score++;
      document.getElementById('scoreValue').textContent = this.score;
      
      const hitEffect = document.createElement('div');
      hitEffect.className = 'hit-effect';
      document.body.appendChild(hitEffect);
      setTimeout(() => hitEffect.remove(), 200);
      
      this.moveTarget();
    }
  }

  onPointerLockChange() {
    if (document.pointerLockElement) {
      this.isFirstMove = true;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = Math.min(this.clock.getDelta(), this.maxDeltaTime);
    this.frameTime += delta;
    
    // Limit updates to 60fps
    if (this.frameTime >= 1 / 60) {
      this.frameTime = 0;
      this.renderer.render(this.scene, this.camera);
    }
  }
}

new AimTrainer();