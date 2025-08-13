import { tile_types } from "./tile.js";
import { get_surrounding_tiles_large } from "./tile_functions.js";

export function do_water_replacement(tile, direction, flow_depth) {
    if (tile == null || tile == undefined) return;
    if (tile.type.can_be_water) {
        tile.type = tile_types.water_flow;
        tile.spawn_tick = window.current_tick;
        tile.flow_direction = direction;
        tile.flow_depth = flow_depth;
        tile.temperature = tile.type.default_temperature;
    }
}

export function do_lava_replacement(tile, direction, flow_depth) {
    if (tile == null || tile == undefined) return;
    if (tile.type.can_be_lava) {
        tile.type = tile_types.lava_flow;
        tile.spawn_tick = window.current_tick;
        tile.flow_direction = direction;
        tile.flow_depth = flow_depth;
        tile.temperature = tile.type.default_temperature;
    }
}

export function do_water_surrounding_check_replacement(tiles, tile, x, y, simdimensions) {
    let water_surrounding = 0;
    const surrounding_tiles_large = get_surrounding_tiles_large(tiles, x, y, simdimensions);
    for (const new_tile of Object.values(surrounding_tiles_large)) {
        if (new_tile == undefined || new_tile.type == tile_types.empty) continue;
        if (new_tile.type == tile_types.water_source || new_tile.type == tile_types.water_flow) {
            water_surrounding++;
        }
    }
    if (water_surrounding >= 4) {
        do_water_replacement(tile, null, null);
    }
}

export function do_lava_surrounding_check_replacement(tiles, tile, x, y, simdimensions) {
    let lava_surrounding = 0;
    const surrounding_tiles_large = get_surrounding_tiles_large(tiles, x, y, simdimensions);
    for (const new_tile of Object.values(surrounding_tiles_large)) {
        if (new_tile == undefined || new_tile.type == tile_types.empty) continue;
        if (new_tile.type == tile_types.lava || new_tile.type == tile_types.lava_flow) {
            lava_surrounding++;
        }
    }
    if (lava_surrounding >= 4) {
        do_lava_replacement(tile, null, null);
    }
}

export function do_temperature_adjustment(tiles, x, y, simdimensions) {
    const neighbors = get_surrounding_tiles_large(tiles, x, y, simdimensions);
    const tile_index = (y * simdimensions.x) + x;
    const tile = tiles[tile_index];
    let neighbor_temps = [];
    for (const tile of Object.values(neighbors)) {
        if (tile == null || tile == undefined) continue;
        neighbor_temps.push(tile.temperature);
    }

    const neighbor_average_temp = neighbor_temps.reduce((a, b) => a + b, 0) / neighbor_temps.length;
    tile.temperature += Math.round((neighbor_average_temp - tile.temperature) * 0.1);
}
