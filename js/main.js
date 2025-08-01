import noise from "./noisegen.js"

let current_tick = 0;
let changing_tile = false;
document.addEventListener("mousedown", () => {
    changing_tile = true;
});
document.addEventListener("mouseup", () => {
    changing_tile = false;
});


function do_water_replacement(tile, direction, flow_depth) {
    if (tile == null || tile == undefined) return;
    if (tile.type.can_be_water) {
        tile.type = tile_types.water_flow;
        tile.spawn_tick = current_tick;
        tile.flow_direction = direction;
        tile.flow_depth = flow_depth;
    }
}

function do_lava_replacement(tile, direction, flow_depth) {
    if (tile == null || tile == undefined) return;
    if (tile.type.can_be_lava) {
        tile.type = tile_types.lava_flow;
        tile.spawn_tick = current_tick;
        tile.flow_direction = direction;
        tile.flow_depth = flow_depth;
    }
}

function tick_water_source(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 0) {
        tile.type = tile_types.ice;
        tile.spawn_tick = current_tick;
        return;
    } else if (tile.temperature >= 100) {
        tile.type = tile_types.riverbank;
        tile.spawn_tick = current_tick;
        return;
    }

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);
    
    for (const [direction, tile] of Object.entries(surrounding_tiles)) {
        do_water_replacement(tile, direction, 1);
    }
}

function tick_water_flow(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 0) {
        tile.type = tile_types.ice;
        tile.spawn_tick = current_tick;
        return;
    } else if (tile.temperature >= 100) {
        tile.type = tile_types.riverbank;
        tile.spawn_tick = current_tick;
        return;
    }

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);

    if (tile.spawn_tick == current_tick) return;

    if (tile.flow_depth > 2) {
        tile.flow_direction = null;
    }

    if (tile.flow_direction !== null) {
        do_water_replacement(surrounding_tiles[tile.flow_direction], tile.flow_direction, tile.flow_depth + 1);
    }
}

function tick_lava_source(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 50) {
        tile.type = tile_types.cooled_lava;
        tile.spawn_tick = current_tick;
        return;
    }

    if (tick % 2 == 0) return;

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);
    
    for (const [direction, tile] of Object.entries(surrounding_tiles)) {
        do_lava_replacement(tile, direction, 1);
    }
}

function tick_lava_flow(tiles, tile, x, y, simdimensions) {
    if (tile.temperature <= 50) {
        tile.type = tile_types.cooled_lava;
        tile.spawn_tick = current_tick;
        return;
    }

    if (tick % 2 == 0) return;

    const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);

    if (tile.spawn_tick == current_tick) return;

    if (tile.flow_depth > 2) {
        tile.flow_direction = null;
    }

    if (tile.flow_direction !== null) {
        do_lava_replacement(surrounding_tiles[tile.flow_direction], tile.flow_direction, tile.flow_depth + 1);
    }
}

function tick_lava_cooled(tiles, tile, x, y, simdimensions) {
    if (tile.temperature > 50) {
        tile.type = tile_types.lava;
        tile.spawn_tick = current_tick;
    }
}

function tick_ice(tiles, tile, x, y, simdimensions) {
    if (tile.temperature > 0) {
        tile.type = tile_types.water_source;
        return;
    }
}

const tile_types = {
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
        default_temperature: 700,
        color: "#d66b00",
        tick_function: tick_lava_source,
        can_be_water: true,
        can_be_lava: false
    },
    lava_flow: {
        name: "Lava (flow)",
        default_temperature: 700,
        color: "#b55b00",
        tick_function: tick_lava_flow,
        can_be_water: true,
        can_be_lava: false
    },
    cooled_lava: {
        name: "Lava (cooled)",
        default_temperature: 50,
        color: "#151515",
        tick_function: tick_lava_cooled,
        can_be_water: false,
        can_be_lava: true
    }
}
let active_cursor_type = tile_types.empty;

class Dim2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Tile {
    constructor(type) {
        if (typeof type !== "object" || !Object.values(tile_types).includes(type)) {
            console.error("Invalid type for tile");
            return;
        }

        this.type = type;
        this.temperature = type.default_temperature;
        this.spawn_tick = current_tick;
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

function get_tile_position(index, simdimensions) {
    const x = index % simdimensions.x;
    const y = (index - x) / simdimensions.x;

    return new Dim2(x, y);
}

function get_tile_at_position(tiles, position, simdimensions) {
    const index = (position.y * simdimensions.x) + position.x;
    return tiles[index];
}

function get_surrounding_tiles(tiles, x, y, simdimensions) {
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

function get_surrounding_tiles_large(tiles, x, y, simdimensions) {
    const tileso = get_surrounding_tiles(tiles, x, y, simdimensions);
    tileso.northeast = get_tile_at_position(tiles, new Dim2(x + 1, y - 1), simdimensions);
    tileso.southeast = get_tile_at_position(tiles, new Dim2(x + 1, y + 1), simdimensions);
    tileso.northwest = get_tile_at_position(tiles, new Dim2(x - 1, y - 1), simdimensions);
    tileso.southwest = get_tile_at_position(tiles, new Dim2(x - 1, y + 1), simdimensions);
    return tileso;
}

function render_tiles_and_ui(tiles, simdimensions) {
    const tile_eles = document.querySelectorAll(".tile");
    const tick_counter = document.querySelector("#tick");
    for (const tile of tile_eles) {
        tile.remove();
    }
    if (tick_counter !== null) tick_counter.remove();

    for (let y = 0; y < simdimensions.y; y++) {
        for (let x = 0; x < simdimensions.x; x++) {
            const tile_index = (y * simdimensions.x) + x;
            const tile_element = document.createElement("div");
            tile_element.className = "tile";
            tile_element.style.position = "absolute";
            tile_element.style.left = `${x * 30}px`;
            tile_element.style.top = `${y * 30}px`;
            tile_element.style.width = "30px";
            tile_element.style.height = "30px";
            tile_element.style.border = "1px solid #555555";
            tile_element.style.backgroundColor = tiles[tile_index].type.color;
            tile_element.style.cursor = "pointer";

            tile_element.addEventListener("mouseover", () => {
                if (changing_tile) {
                    tiles[tile_index] = new Tile(active_cursor_type);
                    render_tiles_and_ui(tiles, simdimensions);
                    return;
                }

                tile_element.innerHTML = "";
                if (document.getElementById("infobox") !== null) document.getElementById("infobox").remove();

                const info = document.createElement("span");
                info.id = "infobox";
                noise.seed(123);
                info.innerHTML = `${tiles[tile_index].type.name} - ${tiles[tile_index].temperature}&deg; - Flow direction: ${tiles[tile_index].flow_direction} - Flow depth: ${tiles[tile_index].flow_depth}`;
                info.style.position = "absolute";
                info.style.bottom = "0";
                info.style.left = "100px";
                document.body.appendChild(info);
            });

            tile_element.addEventListener("mouseleave", () => {
                if (document.getElementById("infobox") !== null) document.getElementById("infobox").remove();
                tile_element.innerHTML = "";
            })

            tile_element.addEventListener("mousedown", () => {
                tiles[tile_index] = new Tile(active_cursor_type);
                render_tiles_and_ui(tiles, simdimensions);
            })

            document.body.appendChild(tile_element);
        }
    }

    const tick_number = document.createElement("span");
    tick_number.id = "tick";
    tick_number.innerText = `Tick ${current_tick}`;
    tick_number.style.position = "absolute";
    tick_number.style.bottom = "0";
    document.body.appendChild(tick_number);
}

function render_static_ui() {
    const type_dropdown = document.createElement("select");
    type_dropdown.style.position = "absolute";
    type_dropdown.style.bottom = "0";
    type_dropdown.style.right = "0";
    for (const [type_val, type] of Object.entries(tile_types)) {
        const option = document.createElement("option");
        option.innerText = type.name;
        option.value = type_val;
        type_dropdown.appendChild(option);
    }
    type_dropdown.addEventListener("change", (e) => {
        active_cursor_type = tile_types[e.target.value];
    });
    document.body.appendChild(type_dropdown);
}

function generate_tiles(tiles, simdimensions) {
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

function do_tile_logic(tiles, simdimensions) {
    for (let y = 0; y < simdimensions.y; y++) {
        for (let x = 0; x < simdimensions.x; x++) {
            const tile_index = (y * simdimensions.x) + x;
            const tile = tiles[tile_index];
            tile.type.tick_function(tiles, tile, x, y, simdimensions);

            const surrounding_tiles = get_surrounding_tiles(tiles, x, y, simdimensions);
            let temperatures = [];
            for (const new_tile of Object.values(surrounding_tiles)) {
                if (new_tile == undefined || new_tile.type == tile_types.empty) continue;
                temperatures.push(new_tile.temperature);
            }
            
            temperatures.push(2 * tile.temperature);

            let total = 0;
            for (const temp of temperatures) {
                total += temp;
            }
            tile.temperature = Math.floor(total / ( temperatures.length + 1 ));

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
    }
}

function tick(tiles, simdimensions) {
    current_tick++;
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
