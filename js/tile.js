import { tick_water_source, tick_water_flow, tick_ice, tick_lava_source, tick_lava_flow, tick_lava_cooled } from "./tick_functions.js";

export const tile_types = {
    empty: {
        name: "Empty",
        default_temperature: 0,
        color: "#202020",
        tick_function: () => {},
        can_be_water: false,
        can_be_lava: true
    },
    ground: {
        name: "Ground",
        default_temperature: 21,
        color: "#55aa55",
        tick_function: () => {},
        can_be_water: true,
        can_be_lava: true
    },
    water_source: {
        name: "Water (Source)",
        default_temperature: 12,
        color: "#5555aa",
        tick_function: tick_water_source,
        can_be_water: false,
        can_be_lava: true
    },
    water_flow: {
        name: "Water (Flow)",
        default_temperature: 12,
        color: "#555599",
        tick_function: tick_water_flow,
        can_be_water: false,
        can_be_lava: true
    },
    ice: {
        name: "Ice",
        default_temperature: -1,
        color: "#aaaaff",
        tick_function: tick_ice,
        can_be_water: false,
        can_be_lava: true
    },
    riverbank: {
        name: "Riverbank",
        default_temperature: 24,
        color: "#daddbe",
        tick_function: () => {},
        can_be_water: false,
        can_be_lava: true
    },
    lava: {
        name: "Lava (source)",
        default_temperature: 1200,
        color: "#d66b00",
        tick_function: tick_lava_source,
        can_be_water: true,
        can_be_lava: false
    },
    lava_flow: {
        name: "Lava (flow)",
        default_temperature: 900,
        color: "#b55b00",
        tick_function: tick_lava_flow,
        can_be_water: true,
        can_be_lava: false
    },
    cooled_lava: {
        name: "Lava (cooled)",
        default_temperature: 100,
        color: "#151515",
        tick_function: tick_lava_cooled,
        can_be_water: false,
        can_be_lava: true
    }
}

export class Tile {
    constructor(type) {
        if (typeof type !== "object" || !Object.values(tile_types).includes(type)) {
            console.error("Invalid type for tile");
            return;
        }

        this.type = type;
        this.temperature = type.default_temperature;
        this.spawn_tick = window.current_tick;
        this.flow_direction = null;
        this.flow_depth = 0;
    }

    insert_at_position(tiles, position, simdimensions) {
        if (typeof tiles !== "object" || typeof position !== "object" || typeof simdimensions !== "object") {
            console.error("Invalid arguments to insert_at_position");
            return;
        }

        const index = (position.y * simdimensions.x) + position.x;
        tiles[index] = this;
    }
}
