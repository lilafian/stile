import { tile_types, Tile } from "./tile.js";
import { Dim2 } from "./dim2.js";
import { render_tiles_and_ui, render_static_ui } from "./render.js";
import { do_water_surrounding_check_replacement, do_lava_surrounding_check_replacement, do_temperature_adjustment } from "./tile_replacement_functions.js";
import { generate_tiles } from "./tilegen.js";

window.current_tick = 0;
window.changing_tile = false;
window.debug_mode = false;
window.active_cursor_type = tile_types.empty;

document.addEventListener("mousedown", () => {
    window.changing_tile = true;
});

document.addEventListener("mouseup", () => {
    window.changing_tile = false;
});

function do_tile_logic(tiles, simdimensions) {
    for (let y = 0; y < simdimensions.y; y++) {
        for (let x = 0; x < simdimensions.x; x++) {
            const tile_index = (y * simdimensions.x) + x;
            const tile = tiles[tile_index];
            tile.type.tick_function(tiles, tile, x, y, simdimensions);

            do_temperature_adjustment(tiles, x, y, simdimensions);
            do_water_surrounding_check_replacement(tiles, tile, x, y, simdimensions);
            do_lava_surrounding_check_replacement(tiles, tile, x, y, simdimensions);
        }
    }
}

function tick(tiles, simdimensions) {
    window.current_tick++;
    do_tile_logic(tiles, simdimensions);
    render_tiles_and_ui(tiles, simdimensions);
}

function main() {
    const tiles = [];
    
    const params = new URLSearchParams(window.location.search);
    let width = params.get("width");
    let height = params.get("height");
    let tickspeed = params.get("tickspeed");
    if (width == null) width = 30;
    if (height == null) height = 30;
    if(params.get("debug")) {
        window.debug_mode = true;
    }

    for (let i = 0; i < width * height; i++) {
        tiles[i] = new Tile(tile_types.empty);
    }

    let tick_cooldown = null;
    if (tickspeed == null) {
        tick_cooldown = 500;
    } else {
        tick_cooldown = 1000 / tickspeed;
    }

    console.log(`Creating simulation, height = ${height}, width = ${width}`);
    const simdimensions = new Dim2(width, height);

    generate_tiles(tiles, simdimensions);
    render_tiles_and_ui(tiles, simdimensions);
    render_static_ui();

    setInterval(() => {tick(tiles, simdimensions)}, tick_cooldown);
}

main();
