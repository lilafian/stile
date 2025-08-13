import { tile_types, Tile } from "./tile.js";

export function render_tiles_and_ui(tiles, simdimensions) {
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
            tile_element.style.backgroundColor = tiles[tile_index].type.color;
            tile_element.style.cursor = "pointer";

            if (window.debug_mode) {
                const temp = document.createElement("span");
                temp.innerText = `${tiles[tile_index].temperature}`;
                tile_element.appendChild(temp);
            }

            tile_element.addEventListener("mouseover", () => {
                if (window.changing_tile) {
                    tiles[tile_index] = new Tile(window.active_cursor_type);
                    render_tiles_and_ui(tiles, simdimensions);
                    return;
                }

                if (document.getElementById("infobox") !== null) document.getElementById("infobox").remove();

                const info = document.createElement("span");
                info.id = "infobox";
                info.innerHTML = `${tiles[tile_index].type.name} - ${tiles[tile_index].temperature}&deg; - Flow direction: ${tiles[tile_index].flow_direction} - Flow depth: ${tiles[tile_index].flow_depth}`;
                info.style.position = "absolute";
                info.style.bottom = "0";
                info.style.left = "100px";

                tile_element.style.border = "1px solid black";
                tile_element.style.zIndex = "10";
                document.body.appendChild(info);
            });

            tile_element.addEventListener("mouseleave", () => {
                if (document.getElementById("infobox") !== null) document.getElementById("infobox").remove();
                tile_element.style.border = "none";
                tile_element.style.zIndex = "";
            })

            tile_element.addEventListener("mousedown", () => {
                tiles[tile_index] = new Tile(window.active_cursor_type);
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

export function render_static_ui() {
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
        window.active_cursor_type = tile_types[e.target.value];
    });
    document.body.appendChild(type_dropdown);
}
