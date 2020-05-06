(function() {
    "use strict";

    let id = x => document.getElementById(x);
    let qs = x => document.querySelector(x);

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
    // < 0 types are dangerous
    let LASER = -4;
    let LASER_BASE = -3;
    let SPIKE = -2; // tile
    let DANGER = -1;
    // these are passthrough
    let EMPTY = 0; // tile
    let TOGGLE_SWITCH = 1;
    let KEY = 2;
    // >= WALL types are impassable
    let WALL = 3; // tile
    let TOGGLE_WALL_A = 4;
    let TOGGLE_WALL_B = 5;

    function init() {
        ctx = id('game-view').getContext('2d');
        // player = new Component(PLAYER_SIZE, PLAYER_SIZE, "run", x, HEIGHT / 2, "image");
        player = new Component(PLAYER_SIZE, PLAYER_SIZE, "green", x, HEIGHT / 2, "player");
        // components.push(player);
        window.addEventListener('keydown', slowDown);
        window.addEventListener('keyup', run);
        let canvas = id('game-view');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.addEventListener('mousedown', slowDown);
        canvas.addEventListener('mouseup', run);
        id('menu-view').addEventListener('click', start);
    }

    function slowDown() {
        if (!slow) {
            slow = tick;
        }
    }

    function run() {
        slow = 0;
        TOP_Y_SPEED *= -1;
    }

    function start() {
        id('menu-view').classList.add('hidden');
        id('message').innerText = "You got caught.";
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
        constructor(width, height, color, x, y, type, update) {
            this.type = type;
            if (type == 'image') {
                this.image = new Image();
            }
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.color = color;
            this.update = update || this.updateDefault;
        }

        updateDefault() {
            if (this.type == 'image') {
                ctx.drawImage(this.image,
                    Math.trunc(this.x),
                    Math.trunc(this.y),
                    this.width, this.height);
            } else {
                ctx.fillStyle = this.color;
                ctx.fillRect(Math.trunc(this.x), Math.trunc(this.y), this.width, this.height);
            }
        }
    }

    function updateMissile() {
        this.updateDefault();
        if (this.x < WIDTH) {
            this.x -= 5;
        } else {
            if (this.y < player.y) {
                this.y += 4;
            } else if (this.y > player.y) {
                this.y -= 4;
            }
        }
    }

    // states are two things: (color, type)
    function updateLaser(times, states) {
        this.updateDefault();
        if (!this.timer) {
            this.state = 0;
            this.timer = tick + times[0];
        }
        if (this.timer < tick) {
            this.state = (this.state + 1) % times.length;
            this.timer = tick + times[this.state];
            let nextState = states[this.state];
            this.color = nextState[0];
            this.type = nextState[1];
        }
    }

    function updateToggle(typeA) {
        this.updateDefault();
        if (typeA == toggle) {
            this.color = 'lightgray';
            this.type = EMPTY;
        } else {
            this.color = 'gray';
            this.type = WALL;
        }
    }

    function updateGameArea() {
        tick++;
        cd -= vx;
        dist += vx;
        drawGround();
        drawUI();
        if (dist <= tick * 4.5) {
            // gameOver();
        }
        if (Math.min(Math.sqrt(dist), 50) / 10000 > Math.random()) {
            components.push(new Component(TILE_SIZE, 24, "red", WIDTH + length, player.y, DANGER, updateMissile));
        }
        if (cd <= 0) {
            let random = Math.trunc(Math.random() * 8);
            console.log(random);
            switch (random) {
                case 0:
                case 1:
                    pattern1(Math.trunc(Math.random() * 3 + 4));
                    break;
                case 2:
                    pattern2();
                    break;
                case 3:
                    pattern3();
                    break;
                case 4:
                    pattern4();
                    break;
                case 5:
                    pattern5();
                    break;
                default:
                    let length = Math.trunc(TILE_WIDTH * (Math.random() + 1)) * TILE_SIZE;
                    randomTerrain(length);
                    cd += length + TILE_SIZE * 3;
            }
        }
        updatePlayer();
        let remove = [];
        components.forEach((c) => {
            if (c.type === 'image') {
                c.image.src = `img/${c.color}${tick % 3 + 1}.png`;
            }
            c.x -= vx;
            if (c.x + c.width < -TILE_SIZE * 2) {
                remove.push(c);
            }
            c.update();
        });
        remove.forEach((c) => {
            components.splice(components.indexOf(c), 1);
        });
    }

    function drawGround() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, HEIGHT - GROUND_HEIGHT + TILE_SIZE, WIDTH, GROUND_HEIGHT - TILE_SIZE);
        ctx.fillRect(0, 0, WIDTH, GROUND_HEIGHT - TILE_SIZE);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, TILE_SIZE);
        ctx.fillRect(0, GROUND_HEIGHT - TILE_SIZE, WIDTH, TILE_SIZE);
    }

    function drawUI() {
        ctx.strokeStyle = '#000';
        ctx.font = '36px Arial';
        ctx.strokeText(`${Math.round(dist) / 10}m traveled`, 100, 100);
        ctx.strokeText(`${Math.round(dist - tick * 4.5) / 10}m away`, 100, 200);
    }

    function updatePlayer() {
        let top = false;
        let bottom = false;
        let front = false;
        let back = false;
        let onType = [];
        components.forEach((c) => {
            // Adjust hitbox numbers as needed.
            let on = false;
            if (c.x < x + PLAYER_SIZE - 6 && c.x + c.width > x + 6) {
                if (c.y < player.y) {
                    if (c.y + c.height >= player.y) {
                        top = true;
                        player.y = c.y + c.height;
                        on = true;
                    }
                } else if (c.y < player.y + player.height) {
                    bottom = true;
                    player.y = c.y - player.height;
                    on = true;
                }
            }
            if (c.y < player.y + PLAYER_SIZE - 6 && c.y + c.height > player.y + 6) {
                if (c.x < player.x) {
                    if (c.x + c.width >= player.x) {
                        on = true;
                        back = true;
                    }
                } else if (c.x < player.x + player.width) {
                    front = true;
                    on = true;
                }
            }
            if (on) {
                onType.push(c.type);
            }
        });
        // Set wall collision
        if (player.y + player.height > HEIGHT - GROUND_HEIGHT || player.y < GROUND_HEIGHT) {
            gameOver();
        }

        onType.forEach((type) => {
            switch (type) {
                case SPIKE:
                case LASER:
                case DANGER:
                    gameOver();
                    break;
                case TOGGLE_SWITCH:
                    toggle = !toggle;
                    break;
                case WALL:
                    vx *= 0.9;
                default:
                    break;
            }
        });

        // calculate physics
        if (slow && slow + 5 < tick) {
            vx *= 0.91;
            vy *= 0.91;
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
        // player.image.src = `img/${player.color}${Math.trunc(tick / 3) % 3 + 1}.png`;
        player.update();
    }

    function gameOver() {
        clearInterval(interval);
        id('menu-view').classList.remove('hidden');
    }

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
                let col = [];
                for (let j = 0; j < TILE_HEIGHT; j++) {
                    if (j < y || j > y + h) {
                        col.push(WALL);
                    } else {
                        col.push(EMPTY);
                    }
                }
                tiles.push(col);
            }
            let buffer = 0;
            if (openings != i + 1) {
                buffer = Math.trunc(Math.random() * 4 + 8);
                nextY = Math.trunc(Math.random() * (TILE_HEIGHT - h));
                let spiked = Math.abs(y - nextY) < 12 && difficulty / 100 > Math.random();
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
        cd = length + TILE_SIZE * 5;
    }

    // homing missiles
    function pattern2() {
        let length = 0;
        let waves = Math.trunc(Math.random() * 3) + 4;
        for (let i = 0; i < waves; i++) {
            components.push(new Component(TILE_SIZE, 24, "red", WIDTH + length, player.y, DANGER, updateMissile));
            length += 100;
        }
        randomTerrain(length, dist / 2);
        cd = length + TILE_SIZE * 2;
    }

    // forced locked door
    function pattern3() {
        let difficulty = Math.min(Math.sqrt(dist), 50);
        let goodPath = Math.random() > 0.5;
        let topA = Math.random() > 0.5;
        let tiles = [];
        let length = 0;
        cd = length + 64;
        tiles.push(BLANK_COL);
        tiles.push(BLANK_COL);

    }

    // timer based
    function pattern4() {

    }

    // narrowing
    function pattern5() {

    }

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
                console.log(col);
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
        for (let i = 0; i < col.length; i++) {
            let c = col[i];
            switch (c) {
                case SPIKE:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'red', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case WALL:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'blue', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case LASER:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'orange', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case TOGGLE_SWITCH:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'yellow', x, i * TILE_SIZE + GROUND_HEIGHT, c));
                    break;
                case TOGGLE_WALL_A:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'gray', x, i * TILE_SIZE + GROUND_HEIGHT, c, () => updateToggle(false)));
                    break;
                case TOGGLE_WALL_B:
                    components.push(new Component(TILE_SIZE, TILE_SIZE, 'lightgray', x, i * TILE_SIZE + GROUND_HEIGHT, c, () => updateToggle(true)));
                    break;
            }
        }
    }
    window.addEventListener('load', init);
})();