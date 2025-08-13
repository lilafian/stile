import { get_surrounding_tiles } from "./tile_functions.js";
import { do_water_replacement, do_lava_replacement } from "./tile_replacement_functions.js";
import { tile_types } from "./tile.js";

export function tick_water_source(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 0) {
        tile.type = tile_types.ice;
        tile.spawn_tick = window.current_tick;
        return;
    } else if (tile.temperature >= 100) {
        tile.type = tile_types.riverbank;
        tile.spawn_tick = window.current_tick;
        return;
    }

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);
    
    for (const [direction, tile] of Object.entries(surrounding_tiles)) {
        do_water_replacement(tile, direction, 1);
    }
}

export function tick_water_flow(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 0) {
        tile.type = tile_types.ice;
        tile.spawn_tick = window.current_tick;
        return;
    } else if (tile.temperature >= 100) {
        tile.type = tile_types.riverbank;
        tile.spawn_tick = window.current_tick;
        return;
    }

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);

    if (tile.spawn_tick == window.current_tick) return;

    if (tile.flow_depth > 2) {
        tile.flow_direction = null;
    }

    if (tile.flow_direction !== null) {
        do_water_replacement(surrounding_tiles[tile.flow_direction], tile.flow_direction, tile.flow_depth + 1);
    }
}

export function tick_lava_source(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 50) {
        tile.type = tile_types.cooled_lava;
        tile.spawn_tick = window.current_tick;
        return;
    }

    if (tick % 2 == 0) return;

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);
    
    for (const [direction, tile] of Object.entries(surrounding_tiles)) {
        do_lava_replacement(tile, direction, 1);
    }
}

export function tick_lava_flow(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 50) {
        tile.type = tile_types.cooled_lava;
        tile.spawn_tick = window.current_tick;
        return;
    }

    if (tick % 2 == 0) return;

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);

    if (tile.spawn_tick == window.current_tick) return;

    if (tile.flow_depth > 2) {
        tile.flow_direction = null;
    }

    if (tile.flow_direction !== null) {
        do_lava_replacement(surrounding_tiles[tile.flow_direction], tile.flow_direction, tile.flow_depth + 1);
    }
}

export function tick_lava_cooled(tiles, tile, x, y, simdimensions) {
    if (tile.temperature > 50) {
        tile.type = tile_types.lava;
        tile.spawn_tick = window.current_tick;
    }
}

export function tick_ice(tiles, tile, x, y, simdimensions) {
    if (tile.temperature > 0) {
        tile.type = tile_types.water_source;
        tile.spawn_tick = window.current_tick;
    }
}
