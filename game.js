// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
const game = {
    redScore: 0,
    blueScore: 0,
    gameRunning: true
};

// Car class
class Car {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.color = color;
        this.width = 35;
        this.height = 25;
        this.acceleration = 0.4;
        this.maxSpeed = 10;
        this.friction = 0.96;
        this.boostPower = 100;
        this.maxBoost = 150;
        this.boostRecharge = 1.2;
        this.isBoosting = false;
    }

    handleInput(keys, playerControls) {
        const up = keys[playerControls.up];
        const down = keys[playerControls.down];
        const left = keys[playerControls.left];
        const right = keys[playerControls.right];
        const boost = keys[playerControls.boost];

        if (up) {
            this.vx += Math.cos(this.angle) * this.acceleration;
            this.vy += Math.sin(this.angle) * this.acceleration;
        }
        if (down) {
            this.vx -= Math.cos(this.angle) * this.acceleration * 0.5;
            this.vy -= Math.sin(this.angle) * this.acceleration * 0.5;
        }
        if (left) this.angle -= 0.1;
        if (right) this.angle += 0.1;

        if (boost && this.boostPower > 0) {
            this.isBoosting = true;
            this.vx += Math.cos(this.angle) * 0.7;
            this.vy += Math.sin(this.angle) * 0.7;
            this.boostPower -= 1.5;
        } else {
            this.isBoosting = false;
        }

        if (this.boostPower < this.maxBoost) {
            this.boostPower += this.boostRecharge;
        }
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;

        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < this.width / 2) {
            this.x = this.width / 2;
            this.vx *= -0.5;
        }
        if (this.x > canvas.width - this.width / 2) {
            this.x = canvas.width - this.width / 2;
            this.vx *= -0.5;
        }
        if (this.y < this.height / 2) {
            this.y = this.height / 2;
            this.vy *= -0.5;
        }
        if (this.y > canvas.height - this.height / 2) {
            this.y = canvas.height - this.height / 2;
            this.vy *= -0.5;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw rocket body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(-this.width / 3, 0);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Draw nose cone (lighter color)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2 - 5, -4);
        ctx.lineTo(this.width / 2 - 5, 4);
        ctx.closePath();
        ctx.fill();

        // Draw window
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(-this.width / 8, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw fins
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7;
        // Left fin
        ctx.beginPath();
        ctx.moveTo(-this.width / 3, 0);
        ctx.lineTo(-this.width / 2.5, this.height / 2 + 3);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        // Right fin
        ctx.beginPath();
        ctx.moveTo(-this.width / 3, 0);
        ctx.lineTo(-this.width / 2.5, -this.height / 2 - 3);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw boost flame
        if (this.isBoosting) {
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, -this.height / 3);
            ctx.lineTo(-this.width / 2 - 8, -this.height / 4);
            ctx.lineTo(-this.width / 2 - 5, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, this.height / 3);
            ctx.lineTo(-this.width / 2 - 8, this.height / 4);
            ctx.lineTo(-this.width / 2 - 5, 0);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        // Draw boost bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 20, this.y + 25, 40, 8);
        // Draw boost bar
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 20, this.y + 25, (this.boostPower / this.maxBoost) * 40, 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 20, this.y + 25, 40, 8);
    }

    collidesWith(ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        return distance < this.width / 2 + ball.radius;
    }
}

// Ball class
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 10;
        this.friction = 0.99;
        this.gravity = 0;
    }

    update() {
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.8;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -0.8;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.8;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -0.8;
        }
    }

    draw() {
        ctx.fillStyle = '#ff9900';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    collideWith(car) {
        const dx = this.x - car.x;
        const dy = this.y - car.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const minDist = this.radius + car.width / 2;

        if (distance < minDist) {
            const angle = Math.atan2(dy, dx);
            const carSpeed = Math.sqrt(car.vx ** 2 + car.vy ** 2);
            const force = 12 + carSpeed * 1.5;
            this.vx = Math.cos(angle) * force;
            this.vy = Math.sin(angle) * force;
            return true;
        }
        return false;
    }
}

// Initialize game objects
const redCar = new Car(200, 400, '#ff3333');
const blueCar = new Car(1000, 400, '#3333ff');
const ball = new Ball(600, 400);

const keys = {};

// Control configurations
const redCarControls = {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    boost: 'q'
};

const blueCarControls = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    boost: ' '
};

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Draw goals
function drawField() {
    // Field background
    ctx.fillStyle = '#1a4d2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Field lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    // Border
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Center line
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Center circle
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Goal areas (red left)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
    ctx.fillRect(0, canvas.height / 2 - 80, 80, 160);

    // Goal areas (blue right)
    ctx.fillStyle = 'rgba(0, 0, 255, 0.15)';
    ctx.fillRect(canvas.width - 80, canvas.height / 2 - 80, 80, 160);

    // Goal boxes (red)
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, canvas.height / 2 - 80, 80, 160);

    // Goal boxes (blue)
    ctx.strokeStyle = '#6666ff';
    ctx.strokeRect(canvas.width - 80, canvas.height / 2 - 80, 80, 160);
}

// Check scoring
function checkGoals() {
    const goalYMin = canvas.height / 2 - 100;
    const goalYMax = canvas.height / 2 + 100;
    
    // Ball in right goal (red scores)
    if (ball.x + ball.radius > canvas.width && ball.y > goalYMin && ball.y < goalYMax) {
        game.redScore++;
        console.log('🔴 Red scores! Total: ' + game.redScore);
        resetPositions();
    }
    // Ball in left goal (blue scores)
    else if (ball.x - ball.radius < 0 && ball.y > goalYMin && ball.y < goalYMax) {
        game.blueScore++;
        console.log('🔵 Blue scores! Total: ' + game.blueScore);
        resetPositions();
    }
}

function resetPositions() {
    redCar.x = 200;
    redCar.y = 400;
    redCar.vx = 0;
    redCar.vy = 0;
    redCar.boostPower = 100;
    blueCar.x = 1000;
    blueCar.y = 400;
    blueCar.vx = 0;
    blueCar.vy = 0;
    blueCar.boostPower = 100;
    ball.x = 600;
    ball.y = 400;
    ball.vx = 0;
    ball.vy = 0;
}

// Draw score on canvas
function drawScore() {
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    
    // Red score
    ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.fillText(game.redScore, canvas.width / 4, 100);
    
    // Blue score
    ctx.fillStyle = 'rgba(100, 100, 255, 0.8)';
    ctx.fillText(game.blueScore, (canvas.width / 4) * 3, 100);
    
    ctx.textAlign = 'left';
}

// Update score display in UI
function updateUI() {
    document.getElementById('redScore').textContent = game.redScore;
    document.getElementById('blueScore').textContent = game.blueScore;
}

// Game loop
function gameLoop() {
    // Update
    redCar.handleInput(keys, redCarControls);
    blueCar.handleInput(keys, blueCarControls);
    redCar.update();
    blueCar.update();
    ball.update();

    // Collision detection
    ball.collideWith(redCar);
    ball.collideWith(blueCar);

    // Check scoring
    checkGoals();

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    redCar.draw();
    blueCar.draw();
    ball.draw();
    drawScore();

    updateUI();

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
