
import config from "./config.js";
import { Boids } from "./boids.js";
export default { keyDownCallback, keyUpCallback };


function keyUpCallback(event, fish) {
    switch (event.key) {
        case 'ArrowUp':
            fish.accelerating = false;
            break;
        case 'ArrowDown':
            fish.breaking = false;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            break;
        case '+':
            new Boids();
            break;
    }
}

function keyDownCallback(event, fish) {
    switch (event.key) {
        case 'ArrowUp':
            fish.accelerating = true;
            break;
        case 'ArrowDown':
            fish.breaking = true;
            break;
        case 'ArrowLeft':
            fish.rotate(config.ROTATION_ANGLE);
            break;
        case 'ArrowRight':
            fish.rotate(-config.ROTATION_ANGLE);
            break;
    }
}