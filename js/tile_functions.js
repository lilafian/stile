import { Dim2 } from "./dim2.js";

export function get_tile_position(index, simdimensions) {
    const x = index % simdimensions.x;
    const y = (index - x) / simdimensions.x;

    return new Dim2(x, y);
}

export function get_tile_at_position(tiles, position, simdimensions) {
    if (position.x >= simdimensions.x || position.y >= simdimensions.y) return null;
    const index = (position.y * simdimensions.x) + position.x;
    return tiles[index];
}

export function get_surrounding_tiles(tiles, x, y, simdimensions) {
    const up_tile = get_tile_at_position(tiles, new Dim2(x, y - 1), simdimensions);
    const down_tile = get_tile_at_position(tiles, new Dim2(x, y + 1), simdimensions);
    const left_tile = get_tile_at_position(tiles, new Dim2(x - 1, y), simdimensions);
    const right_tile = get_tile_at_position(tiles, new Dim2(x + 1, y), simdimensions);

    return {
        north: up_tile,
        south: down_tile,
        east: right_tile,
        west: left_tile
    };
}

export function get_surrounding_tiles_large(tiles, x, y, simdimensions) {
    const tileso = get_surrounding_tiles(tiles, x, y, simdimensions);
    tileso.northeast = get_tile_at_position(tiles, new Dim2(x + 1, y - 1), simdimensions);
    tileso.southeast = get_tile_at_position(tiles, new Dim2(x + 1, y + 1), simdimensions);
    tileso.northwest = get_tile_at_position(tiles, new Dim2(x - 1, y - 1), simdimensions);
    tileso.southwest = get_tile_at_position(tiles, new Dim2(x - 1, y + 1), simdimensions);
    return tileso;
}
