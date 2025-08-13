import noise from "./noisegen.js";
import { Tile, tile_types } from "./tile.js";
import { Dim2 } from "./dim2.js";
import { get_tile_at_position, get_surrounding_tiles_large, get_tile_position } from "./tile_functions.js";

export function generate_tiles(tiles, simdimensions) {
    noise.seed(Date.now());
    for (let y = 0; y < simdimensions.y; y++) {
        for (let x = 0; x < simdimensions.x; x++) {
            const noise_scale = 10;
            const noise_threshold = -0.3;
            const noise_value = noise.perlin2(x / noise_scale, y / noise_scale);
            if (noise_value > noise_threshold) {
                const tile = new Tile(tile_types.ground);
                tile.insert_at_position(tiles, new Dim2(x, y), simdimensions);
            } else {
                const tile = new Tile(tile_types.water_source);
                tile.insert_at_position(tiles, new Dim2(x, y), simdimensions);
            }
        }
    }

    for (let y = 0; y < simdimensions.y; y++) {
        for (let x = 0; x < simdimensions.x; x++) {
            const tile_at_pos = get_tile_at_position(tiles, new Dim2(x, y), simdimensions)
            if (tile_at_pos.type === tile_types.water_source || tile_at_pos.type === tile_types.water_flow) {
                const surrounding = get_surrounding_tiles_large(tiles, x, y, simdimensions);
                for (const [direction, new_tile] of Object.entries(surrounding)) {
                    if (new_tile == null || new_tile == undefined || new_tile.type == tile_types.water_source || new_tile.type == tile_types.water_flow) continue;
                    const bank_tile = new Tile(tile_types.riverbank);
                    const pos = get_tile_position(tiles.indexOf(new_tile), simdimensions);
                    bank_tile.insert_at_position(tiles, pos, simdimensions);
                }
            }
        }
    }
}

