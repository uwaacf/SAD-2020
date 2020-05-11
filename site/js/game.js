(function() {
    "use strict";

    let id = x => document.getElementById(x);
    let qs = x => document.querySelector(x);

    let gameover;
    let components;
    let ctx;
    let player;
    const PLAYER_SIZE = 32;
    const WIDTH = 1024;
    const HEIGHT = 768;
    let TILE_SIZE = 32;
    const TILE_HEIGHT = HEIGHT / TILE_SIZE - 4;
    const TILE_WIDTH = WIDTH / TILE_SIZE;
    const GROUND_HEIGHT = 64;
    let TOP_X_SPEED = 6;
    let TOP_Y_SPEED = 8;
    const x = 160;
    let tick;
    let dist;
    let slow = 0;
    let cd = 0;
    let vy;
    let vx;
    let toggle;
    let onToggle;
    let interval;
    let bg;
    let arrow;
    // < 0 types are dangerous
    let LASER = -4; // tile -> EMPTY/DANGER
    let LASER_BASE = -3; // tile -> EMPTY/DANGER
    let SPIKE = -2; // tile
    let DANGER = -1;
    // these are passthrough
    let EMPTY = 0; // tile
    let TOGGLE_SWITCH = 1;
    let WIN = 2;
    // >= WALL types are impassable
    let WALL = 3; // tile
    let TOGGLE_WALL_A = 4; // tile EMPTY/WALL
    let TOGGLE_WALL_B = 5; // tile EMPTY/WALL

    function init() {
        ctx = id('game-view').getContext('2d');
        player = new Component(PLAYER_SIZE, PLAYER_SIZE, 'run1', x, HEIGHT / 2, "player");
        window.addEventListener('keydown', slowDown);
        window.addEventListener('keyup', run);
        let canvas = id('game-view');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.addEventListener('mousedown', slowDown);
        canvas.addEventListener('mouseup', run);
        id('menu-view').addEventListener('click', start);
        gameover = new Vue({
            el: '#gameover',
            data: {
                distance: 0,
                death: ''
            }
        });
        bg = new Image();
        bg.src = 'img/game/gfloor.png';
        arrow = new Image();
        arrow.src = 'img/game/arrow.png';
    }

    function slowDown() {
        if (!slow) {
            slow = tick + 5;
        }
    }

    function run() {
        slow = 0;
        TOP_Y_SPEED *= -1;
    }

    function start() {
        id('menu-view').classList.add('hidden');
        id('gameover').classList.remove('hidden');
        interval = setInterval(updateGameArea, 20);
        tick = 0;
        dist = 50;
        player.y = HEIGHT / 2;
        components = [];
        cd = 30;
        vy = 3;
        vx = 4;
        toggle = false;
    }

    class Component {
        constructor(width, height, src, x, y, type, update) {
            this.type = type;
            this.src = src;
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.image = new Image();
            switch (type) {
                case (LASER):
                case (LASER_BASE):
                    this.image.src = `img/game/${this.src}1.png`;
                    this.timer = tick - update;
                    this.update = this.updateLaser;
                    break;
                case (TOGGLE_SWITCH):
                    this.update = this.updateSwitch;
                    break;
                case (TOGGLE_WALL_A):
                    this.update = () => this.updateToggle(false);
                    break
                case (TOGGLE_WALL_B):
                    this.update = () => this.updateToggle(true);
                    break;
                default:
                    this.image.src = `img/game/${src}.png`;
                    this.update = update || this.updateDefault;
            }
        }

        updateDefault() {
            ctx.drawImage(this.image,
                Math.trunc(this.x),
                Math.trunc(this.y),
                this.width, this.height);
        }

        updateLaser() {
            while (this.timer < tick) {
                if (this.image.src.includes(`${this.src}2`)) {
                    this.image.src = `img/game/${this.src}3.png`;
                    this.type = LASER;
                } else if (this.image.src.includes(`${this.src}3`)) {
                    this.image.src = `img/game/${this.src}1.png`;
                    this.type = EMPTY;
                    this.timer += 60;
                } else {
                    this.image.src = `img/game/${this.src}2.png`;
                    this.type = EMPTY;
                }
                this.timer += 30;
            }
            this.updateDefault();
        }

        updateToggle(typeA) {
            if (typeA == toggle) {
                this.image.src = 'img/game/block-b.png';
                this.type = EMPTY;
            } else {
                this.image.src = 'img/game/block-a.png';
                this.type = WALL;
            }
            this.updateDefault();
        }

        updateSwitch() {
            if (toggle) {
                this.image.src = 'img/game/switch-a.png';
            } else {
                this.image.src = 'img/game/switch-b.png';
            }
            this.updateDefault();
        }
    }

    function updateMissile() {
        if (this.x < WIDTH) {
            this.x -= 5;
        } else {
            if (this.y < player.y) {
                this.y += 4;
            } else if (this.y > player.y) {
                this.y -= 4;
            }
        }
        this.updateDefault();
    }

    function updateGameArea() {
        tick++;
        cd -= vx;
        dist += vx;
        drawGround();
        if (dist <= tick * Math.log(tick) / 1.9) {
            gameOver('got caught by the police.');
        }
        if (Math.min(Math.sqrt(dist), 50) / 30000 > Math.random()) {
            missile(WIDTH + length, player.y);
        }
        if (cd <= 0) {
            if (dist > 30000) {
                pattern5();
            } else {
                let random = Math.trunc(Math.random() * 6);
                switch (random) {
                    case 0:
                    case 1:
                        pattern1(Math.trunc(Math.random() * 3 + 4));
                        break;
                    case 2:
                        pattern2();
                        break;
                    case 3:
                        pattern3(Math.trunc(Math.random() * 2 + 2));
                        break;
                    case 4:
                        pattern4();
                        break;
                    default:
                        let length = Math.trunc(TILE_WIDTH * (Math.random() + 1)) * TILE_SIZE;
                        randomTerrain(length);
                        cd += length + TILE_SIZE * 3;
                }
            }
        }
        let remove = [];
        components.forEach((c) => {
            c.x -= vx;
            if (c.x + c.width < -TILE_SIZE * 2) {
                remove.push(c);
            }
            if (c.type >= 0) {
                c.update();
            }
        });
        // Force dangerous elements to the front
        components.forEach((c) => {
            if (c.type < 0) {
                c.update();
            }
        });
        drawUI();
        updatePlayer();
        remove.forEach((c) => {
            components.splice(components.indexOf(c), 1);
        });
    }

    function drawGround() {
        ctx.drawImage(bg, -dist % WIDTH + WIDTH, 0);
        ctx.drawImage(bg, -dist % WIDTH, 0);
    }

    function drawUI() {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${Math.round(dist / 10)}m`, 450, 25);
        ctx.fillStyle = '#ff0000';
        ctx.font = '18px Consolas';
        ctx.fillText(`${Math.round(dist / 10 - tick * Math.log(tick) / 19)}m`, 30, 400);
        ctx.drawImage(arrow, 5, 387);
    }

    function updatePlayer() {
        let top = false;
        let bottom = false;
        let front = false;
        let back = false;
        let onType = [];
        components.forEach((c) => {
            // Adjust hitbox numbers as needed.
            if (c.type === EMPTY) {
                return;
            }
            let on = false;
            if (c.x < x + PLAYER_SIZE - 12 && c.x + c.width > x + 12) {
                if (c.y < player.y) {
                    if (c.y + c.height >= player.y + 6) {
                        on = true;
                        if (c.type !== TOGGLE_SWITCH) {
                            top = true;
                            player.y = c.y + c.height - 6;
                        }
                    }
                } else if (c.y < player.y + player.height) {
                    on = true;
                    if (c.type !== TOGGLE_SWITCH) {
                        bottom = true;
                        player.y = c.y - player.height;
                    }
                }
            } else if (c.y < player.y + PLAYER_SIZE && c.y + c.height > player.y + 12) {
                if (c.x < player.x) {
                    if (c.x + c.width >= player.x + 7) {
                        on = true;
                        back = c.type !== TOGGLE_SWITCH;
                    }
                } else if (c.x < player.x + player.width - 7) {
                    front = c.type !== TOGGLE_SWITCH;
                    on = true;
                }
            }
            if (on) {
                onType.push(c.type);
            }
        });
        // Set wall collision
        if (player.y + player.height > HEIGHT - GROUND_HEIGHT || player.y < GROUND_HEIGHT) {
            gameOver('ran into the trench and got caught.');
        }

        let curOnToggle = false;
        onType.forEach((type) => {
            switch (type) {
                case SPIKE:
                    gameOver('tripped and fell into a pit.');
                    break;
                case LASER:
                    gameOver('got zapped by a laser.');
                    break;
                case DANGER:
                    gameOver('ran straight into a missile and blew up.');
                    break;
                case TOGGLE_SWITCH:
                    if (!onToggle) {
                        toggle = !toggle;
                    }
                    onToggle = true;
                    curOnToggle = true;
                    break;
                case WALL:
                    vx *= 0.9;
                    break;
                case WIN:
                    // do something? Liek change logo
                    gameOver('escaped!');
                    break;
                default:
                    break;
            }
        });
        onToggle = curOnToggle;

        // calculate physics
        if (slow && slow < tick) {
            vx *= 0.75;
            vy *= 0.75;
        } else {
            vx = TOP_X_SPEED * 0.03 + vx * 0.97;
            if (TOP_X_SPEED > 0 && TOP_X_SPEED - vx < 0.01) {
                vx = TOP_X_SPEED;
            }
            vy = TOP_Y_SPEED * 0.1 + vy * 0.9;
        }
        if ((vy > 0 && !bottom) || (vy < 0 && !top)) {
            player.y += vy;
        } else {
            vy = 0;
        }
        if (vx > 0 && front) {
            vx = -vx;
        } else if (vx < 0 && back) {
            vx = 0;
        }
        player.image.src = `img/game/run${Math.trunc(tick / 3) % 3 + 1}.png`;
        player.update();
    }

    function gameOver(reason) {
        clearInterval(interval);
        gameover.distance = Math.round(dist) / 10;
        gameover.death = reason;
        id('menu-view').classList.remove('hidden');
    }

    /* Block gen */

    const BLANK_COL = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const L = [
        [1, 1, 1],
        [1, 0, 0]
    ];
    const RL = [
        [1, 1, 1],
        [0, 0, 1]
    ];
    const T = [
        [1, 1, 1],
        [0, 1, 0]
    ];
    const Z = [
        [1, 1, 0],
        [0, 1, 1]
    ];
    const RZ = [
        [0, 1, 1],
        [1, 1, 0]
    ];
    const O = [
        [1, 1],
        [1, 1]
    ];
    const ARCHETYPES = [L, RL, T, Z, RZ, O];

    // random openings
    function pattern1(openings) {
        let difficulty = Math.min(Math.sqrt(dist), 50);
        let length = 0;
        let tiles = [];
        let nextY = Math.trunc(Math.random() * (TILE_HEIGHT - 4));
        for (let i = 0; i < openings; i++) {
            let h = 4;
            let y = nextY;
            let w = TILE_SIZE * 2;
            for (let x = 0; x < 2; x++) {
                let col = new Array(TILE_HEIGHT).fill(WALL);
                let laser = difficulty / 150 > Math.random();
                col[y] = laser ? LASER_BASE : EMPTY;
                for (let j = 1; j <= h; j++) {
                    col[y + j] = laser ? LASER : EMPTY;
                }
                tiles.push(col);
            }
            let buffer = 0;
            if (openings != i + 1) {
                buffer = Math.trunc(Math.random() * 4 + 8);
                nextY = Math.trunc(Math.random() * (TILE_HEIGHT - h));
                let spiked = Math.abs(y - nextY) < 12 && difficulty / 70 > Math.random();
                for (let x = 0; x < buffer; x++) {
                    let col = [];
                    for (let j = 0; j < TILE_HEIGHT; j++) {
                        if (nextY < y) {
                            if (y + h < j) {
                                col.push(WALL);
                            } else {
                                if (buffer === x + 1 && spiked && nextY + h + 1 < j) {
                                    col.push(SPIKE);
                                } else {
                                    col.push(EMPTY);
                                }
                            }
                        } else if (nextY > y) {
                            if (j < y) {
                                col.push(WALL);
                            } else {
                                if (buffer === x + 1 && spiked && nextY - 1 > j) {
                                    col.push(SPIKE);
                                } else {
                                    col.push(EMPTY);
                                }
                            }
                        } else {
                            if (j < y || y + h < j) {
                                col.push(WALL);
                            } else {
                                col.push(EMPTY);
                            }
                        }
                    }
                    tiles.push(col);
                }
            }
            length += w + buffer * TILE_SIZE;
        }
        for (let i = 0; i < tiles.length; i++) {
            addColumn(tiles[i], WIDTH + i * TILE_SIZE);
        }
        cd = length + TILE_SIZE * 8;
    }

    // homing missiles
    function pattern2() {
        let length = 0;
        let waves = Math.trunc(Math.random() * 5) + 6;
        randomTerrain(waves * TILE_SIZE * 3, dist / 2);
        for (let i = 0; i < waves; i++) {
            missile(WIDTH + length + TILE_SIZE * 8, player.y);
            length += TILE_SIZE * 5;
        }
        cd = length;
    }

    // super tunnel
    function pattern3(segments) {
        let difficulty = Math.min(Math.sqrt(dist), 50);
        let tiles = [];
        let h = 6;
        let y = Math.trunc(Math.random() * (TILE_HEIGHT - h - 2)) + 1;
        let length = TILE_SIZE;
        if (difficulty / 50 > Math.random()) {
            let front = new Array(TILE_HEIGHT).fill(SPIKE);
            for (let i = 0; i < h; i++) {
                front[i + y] = EMPTY;
            }
            tiles.push(front);
        }
        for (let i = 0; i < segments; i++) {
            let type = Math.trunc(Math.random() * 6);
            let spike = 0;
            let spike2 = -Math.trunc(Math.random() * 5) - 10;
            let len = 15 + Math.trunc(Math.random() * 5);
            for (let seg = 0; seg < len; seg++) {
                let col = new Array(TILE_HEIGHT).fill(WALL);
                let fillType = false;
                for (let x = 0; x < h; x++) {
                    col[x + y] = EMPTY;
                }
                let a = y + h - 1;
                let b = y;
                switch (type) {
                    case 0:
                        a = y;
                        b = y + h - 1;
                    case 1:
                        if (spike <= 0 && Math.random() < 0.1) {
                            spike += Math.trunc(Math.random() * 3) + difficulty / 10;
                        }
                        if (spike2 < 0 && Math.random() > 0.1) {
                            spike2 *= -1;
                        }
                        if (spike2 > 0) {
                            spike2--;
                            col[a] = SPIKE;
                        }
                        if (spike > 0) {
                            spike--;
                            col[b] = SPIKE;
                        }
                        break;
                    case 2:
                        if (seg % 8 === 5 || seg % 8 === 6) {
                            if (Math.random() < difficulty / 60) {
                                fillType = LASER;
                                col[y] = LASER_BASE;
                            }
                        }
                        break;
                    case 3:
                        if (seg % 6 === 3) {
                            if (Math.random() < difficulty / 70) {
                                fillType = LASER;
                                col[y] = LASER_BASE;
                            }
                        }
                        break;
                    case 4:
                        if (seg % 5 === 0) {
                            if (Math.random() > 0.7) {
                                missile(WIDTH + length, player.y);
                            }
                        }
                        break;
                    default:
                        if (seg < 4) {
                            break;
                        } else if (seg <= 8) {
                            col.fill(EMPTY);
                        }
                        if (seg === 8) {
                            let locs = [];
                            for (let i = 2; i < TILE_HEIGHT - 2; i++) {
                                if (Math.abs(i - y) > 3 && Math.abs(i - y - h) > 3) {
                                    locs.push(i);
                                }
                            }
                            col[locs[Math.trunc(Math.random() * locs.length)]] = TOGGLE_SWITCH;
                        }
                        if (seg === 9) {
                            if (Math.random() > 0.8) {
                                fillType = toggle ? TOGGLE_WALL_B : TOGGLE_WALL_A;
                            } else {
                                fillType = toggle ? TOGGLE_WALL_A : TOGGLE_WALL_B;
                            }
                            col[y] = fillType;
                        }
                }
                if (fillType) {
                    for (let x = 1; x < h; x++) {
                        col[x + y] = fillType;
                    }
                }
                tiles.push(col);
                length += TILE_SIZE;
            }
        }
        for (let i = 0; i < tiles.length; i++) {
            addColumn(tiles[i], WIDTH + i * TILE_SIZE);

        }
        cd = length + TILE_SIZE * 7;
    }

    // forced locked door
    function pattern4() {
        let goodPath = Math.random() > 0.5;
        let topA = Math.random() > 0.5;
        let path1 = 1;
        let path2 = 12;
        let h = 6;
        let tiles = [];
        let length = 0;
        tiles.push(BLANK_COL);
        let lever = new Array(TILE_HEIGHT).fill(EMPTY);
        lever[Math.trunc(Math.random() * 2) + 9] = TOGGLE_SWITCH;
        tiles.push(lever);
        let front = new Array(TILE_HEIGHT).fill(WALL);
        for (let i = 0; i < TILE_HEIGHT; i++) {
            if (i > path1 && i < path1 + h) {
                front[i] = topA ? TOGGLE_WALL_A : TOGGLE_WALL_B;
            } else if (i > path2 && i < path2 + h) {
                front[i] = !topA ? TOGGLE_WALL_A : TOGGLE_WALL_B;
            }
        }
        tiles.push(front);
        let top = Math.trunc(Math.random() * 4);
        let bot = Math.trunc(Math.random() * 4) + 4;
        if (goodPath) {
            let temp = top;
            top = bot;
            bot = temp;
        }
        for (let x = 0; x < 20; x++) {
            let col = [];
            for (let i = 0; i < TILE_HEIGHT; i++) {
                if (i > path1 && i < path1 + h) {
                    col.push(pattern4Helper(x, i - path1, top));
                } else if (i > path2 && i < path2 + h) {
                    col.push(pattern4Helper(x, i - path2, bot));
                } else {
                    col.push(WALL);
                }
            }
            tiles.push(col);
            length += TILE_SIZE;
        }
        for (let i = 0; i < tiles.length; i++) {
            addColumn(tiles[i], WIDTH + i * TILE_SIZE);
        }
        cd = length + TILE_SIZE * 10;
    }

    // 0~2 are easier, 3~5 are harder
    function pattern4Helper(x, offset, type) {
        let difficulty = Math.min(Math.sqrt(dist), 50);
        switch (type) {
            case 0:
                return EMPTY;
            case 1:
                return offset === 1 && x > 2 && x < 17 ? SPIKE : EMPTY;
            case 2:
                return offset === 5 && x > 2 && x < 17 ? SPIKE : EMPTY;
            case 3:
                if (x % 8 === 2) {
                    if (offset === 1) {
                        return LASER_BASE;
                    }
                    return LASER;
                } else {
                    return EMPTY;
                }
            case 4:
                if (x > 10) {
                    return WALL;
                } else if (x > 9) {
                    return SPIKE;
                }
                return EMPTY;
            case 5:
                if (x % 4 === 2) {
                    if (offset === 1) {
                        return LASER_BASE;
                    }
                    return LASER;
                } else {
                    return EMPTY;
                }
            case 6:
                return Math.random() < difficulty / 250 ? SPIKE : EMPTY;
            case 7:
                let sin_base = Math.sin(x / 1.4 + dist) * 1.2 + 1;
                return offset >= sin_base && offset <= sin_base + 4.3 ? EMPTY : SPIKE;
        }
    }

    // exit
    function pattern5() {
        addColumn(new Array(TILE_HEIGHT).fill(WIN), WIDTH);
        cd = WIDTH * 5;
    }

    // Add square, wall, or other such thing
    function randomTerrain(length, lvl) {
        let tilelen = Math.trunc(length / TILE_SIZE);
        let tiles = new Array(tilelen);
        let difficulty = Math.min(Math.sqrt(lvl || dist), 30);
        for (let i = 0; i < tilelen; i++) {
            tiles[i] = new Array(TILE_HEIGHT).fill(EMPTY);
        }
        for (let i = 0; i < tilelen - 1; i += 6) {
            if (difficulty > Math.random()) {
                let blockType = ARCHETYPES[Math.trunc(Math.random() * ARCHETYPES.length)];
                let shape = blockGen(rotate(blockType, Math.trunc(Math.random() * 4)), difficulty / 100 > Math.random());
                transcribe(shape, tiles, i + Math.trunc(Math.random() * 3), 2 * Math.trunc(Math.random() * 10));
            }
        }
        for (let i = 0; i < tiles.length; i++) {
            addColumn(tiles[i], WIDTH + i * TILE_SIZE);
        }
    }

    // rotates shape the number of turns given
    function rotate(shape, turns) {
        if (turns == 0) {
            return shape;
        } else if (turns == 2) {
            // reflect
            let newShape = [];
            for (let i = shape.length - 1; i >= 0; i--) {
                let col = [];
                for (let j = 0; j < shape[i].length; j++) {
                    col.push(shape[i][j]);
                }
                newShape.push(col);
            }
            return newShape;
        }
        let newShape = [];
        for (let i = 0; i < shape[0].length; i++) {
            let row = [];
            for (let j = 0; j < shape.length; j++) {
                row.push(shape[j][i]);
            }
            newShape.push(row);
        }
        return rotate(newShape, turns - 1);
    }

    function blockGen(archetype, spiked) {
        spiked = spiked || false;
        let block = [];
        let first = spiked;
        for (let i = 0; i < archetype.length; i++) {
            let col1 = [];
            let col2 = [];
            let encountered = false;
            for (let j = 0; j < archetype[i].length; j++) {
                if (first && archetype[i][j] == 1) {
                    col1.push(SPIKE);
                    col1.push(SPIKE);
                    col2.push(WALL);
                    col2.push(WALL);
                    encountered = true;
                } else {
                    switch (archetype[i][j]) {
                        case 0:
                            col1.push(EMPTY);
                            col1.push(EMPTY);
                            col2.push(EMPTY);
                            col2.push(EMPTY);
                            break;
                        case 1:
                            col1.push(WALL);
                            col1.push(WALL);
                            col2.push(WALL);
                            col2.push(WALL);
                            break;
                    }
                }
            }
            block.push(col1);
            block.push(col2);
            first = !encountered && first;
        }
        return block;
    }

    function missile(x, y) {
        components.push(new Component(TILE_SIZE, TILE_SIZE, 'projectile', x, y, DANGER, updateMissile));
    }

    function transcribe(shape, map, x, y) {
        if (shape.length + x > map.length || shape[0].length + y > map[0].length) {
            return;
        }
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (map[x + i][y + j] != WALL) {
                    map[x + i][y + j] = shape[i][j];
                }
            }
        }
    }

    // Generate a column of components at the xOffset
    function addColumn(col, x) {
        if (col.length != TILE_HEIGHT) {
            console.error(`Bad size: expected ${TILE_HEIGHT} but got ${col.length}`);
            return;
        }
        let offset = Math.round(Math.random() * 200);
        for (let i = 0; i < col.length; i++) {
            let c = col[i];
            switch (c) {
                case SPIKE:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'pit', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case WALL:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'block', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case LASER:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'laser', x, i * TILE_SIZE + GROUND_HEIGHT, c, offset));
                    break;
                case LASER_BASE:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'laserbase', x, i * TILE_SIZE + GROUND_HEIGHT, c, offset));
                    break;
                case TOGGLE_SWITCH:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'switch-a', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case TOGGLE_WALL_A:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'block-a', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case TOGGLE_WALL_B:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'block-b', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case WIN:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'win', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
            }
        }
    }
    window.addEventListener('load', init);
})();