import { UI } from "../../../core/canvas.js";
import { UPGRADE_DATA, SHOP_SHELF_DATA, fetch_get } from "../../../core/fetch.js";

const DATA = [];

for (let i = 0; i < SHOP_SHELF_DATA.length; i++) {
    const item = SHOP_SHELF_DATA[i];
    item.selected = false;

    DATA.push(item);
};

export class ShopBar{
    constructor() {
        this.rarity = UPGRADE_DATA.rarity;
        this.skill_selected = null;
        this.selected_shelf_item = null;
        this.data = DATA;
        this.reset_cost = 200;
    };

    html_build_shop(player, callback) {

        const section = `
            <div id="shop-container">
                <div id="shop-container-header">
                    <h2 id="shop-container-header-gold">💳 ${player.inventory.get_gold()}</h2>
                    <h2 id="shop-container-header-title">SHOP</h2>
                    <button id="shop-container-close">X</button>
                </div>
                <div id="shop-container-shelf">
                    ${this.html_build_shop_shelf()}
                </div>
                <div id="shop-container-buttons">
                    <button id="shop-purchase">
                        <h4>PURCHASE</h4>
                    </button>
                    <button id="shop-reset">
                        <h4>RESET</h4>
                    <p>(💳 ${this.reset_cost})</p>
                </button>
                </div>
            </div>
        `;

        UI.insertAdjacentHTML( 'beforeend', section);
        this.html_style_shop_shelf();
        this.html_shop_click_item();
        this.html_shop_click_skill();
        this.html_shop_click_purchase(player, callback);
        this.html_shop_click_reset(player);
        this.html_shop_close();
        callback.update_loadout();
    };

    html_build_shop_shelf() {
        let section = ``;

        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];

            section += `
                <div class="shop-container-shelf-items" id="shop-container-shelf-${i}">
                    <h3>${item.name}</h3>
                    <h5>${item.rarity}</h5>
                    <ul>
                        <li>Cooldown: ${item.cooldown}</li>
                        <li>Value: ${item.value}</li>
                    </ul>
                    <h4>💳 ${item.gold}</h4>
                </div>
            `;
        };

        return section;
    };

    html_style_shop_shelf(){
        const shelf = document.getElementById('shop-container-shelf');
        const divs = shelf.querySelectorAll('div');
        divs.forEach((div) => style_shop(div, this));
    };

    html_shop_click_item() {
        const shelf = document.getElementById('shop-container-shelf');
        const divs = shelf.querySelectorAll('div');
        divs.forEach((div) => div.addEventListener('mousedown', () => handle_item_click(div, this)));
    };

    html_shop_click_skill(){
        const skills = document.getElementById('skill-container');
        const divs = skills.querySelectorAll('div');
        divs.forEach(div => div.addEventListener('mousedown', () => handle_skill_click(div, this)));
    };

    html_shop_click_purchase(player, callback) {
        const button = document.getElementById('shop-purchase');
        button.addEventListener('click', () => handle_button_click_purchase(this, player, callback));
    };

    html_shop_click_reset(player){
        const button = document.getElementById('shop-reset');
        button.addEventListener('click', () => handle_button_click_reset(this, player));
    };
 
    html_shop_close() {
        const button = document.getElementById('shop-container-close');

        const handle = () => {
            UI.removeChild(document.getElementById('shop-container'));
            UI.removeChild(document.getElementById('skill-container'));
            button.removeEventListener('click', handle);
        };

        button.addEventListener('click', handle);
    };
};

function update_gold(player, cost){
    player.inventory.minus_gold(cost)
    document.getElementById('shop-container-header-gold').innerHTML = `💳 ${player.inventory.get_gold()}`;
};

function update_shelf(shop_instance){
    const shelf = document.getElementById('shop-container-shelf');
    const divs = shelf.querySelectorAll('div');
    divs.forEach(div => {
        shelf.removeChild(div);
    });
    shelf.innerHTML = shop_instance.html_build_shop_shelf();
}

function update_img(shop_instance){
    const skill = document.getElementById(`skill-${shop_instance.skill_selected}`);
    skill.querySelector('img').src = shop_instance.selected_shelf_item.img;
}

function remove_item(shop_instance){
    const index = shop_instance.data.indexOf(shop_instance.selected_shelf_item);
    shop_instance.data.splice(index, 1);
}

function handle_button_click_purchase(shop_instance, player, callback) {
    if(shop_instance.skill_selected && shop_instance.selected_shelf_item) {
        if(player.inventory.get_gold() >= shop_instance.selected_shelf_item.gold) {
            update_gold(player, shop_instance.selected_shelf_item.gold);
            update_img(shop_instance);
            player.set_ability(shop_instance.skill_selected, shop_instance.selected_shelf_item);
            remove_item(shop_instance);
            update_shelf(shop_instance);
            shop_instance.html_style_shop_shelf();
            shop_instance.html_shop_click_item();
            callback.update_loadout();
            style_skills_reset(shop_instance);
            style_items_reset(shop_instance);
        };
    };
};

async function handle_button_click_reset(shop_instance, player) {
    if(player.inventory.get_gold() >= shop_instance.reset_cost){
        update_gold(player, shop_instance.reset_cost);
        shop_instance.data = await fetch_get("ability/db/shop");
        update_shelf(shop_instance);
        shop_instance.html_style_shop_shelf();
        shop_instance.html_shop_click_item();
    };
};

function style_skills_reset(shop_instance) {
    const skills = document.getElementById('skill-container');
    const divs = skills.querySelectorAll('div');
    divs.forEach(div => {
        deselect_skill(div, shop_instance);
    });
};

function style_items_reset(shop_instance) {
    const shelf = document.getElementById('shop-container-shelf');
    const divs = shelf.querySelectorAll('div');
    divs.forEach(div => {
        const index = div_id(div, 3);
        const color = shop_instance.rarity[shop_instance.data[index].rarity].color;
        deselect_item(div, shop_instance, color);
    });
};

function style_shop(div, shop_instance) {
    const index = div_id(div, 3);
    const color = shop_instance.rarity[shop_instance.data[index].rarity].color;

    div.style.opacity = "0.6";
    div.style.boxShadow = `1px 0 10px rgba(${color}, 1)`;
    div.style.backgroundColor = `rgba(${color}, 0.3)`;
    div.style.border = `3px solid rgba(${color}, 0.8)`;
    const h5 = div.querySelector('h5');
    h5.style.color = `rgba(${color}, 1)`;
};

function handle_item_click(div, shop_instance){
    const shelf = document.getElementById('shop-container-shelf');
    const divs = shelf.querySelectorAll('div');
    const index = div_id(div, 3);
    const color = shop_instance.rarity[shop_instance.data[index].rarity].color;

    divs.forEach((div) => {
        const index = div_id(div, 3);
        const color = shop_instance.rarity[shop_instance.data[index].rarity].color;
        deselect_item(div, shop_instance, color);
    })

    select_item(div, shop_instance, color);
};

function select_item(div, shop_instance, color){
    div.style.scale = "1.1";
    div.style.backgroundColor = `rgba(${color}, 0.4)`;
    div.style.opacity = "1";    

    const index = div.id.split('-')[3];
    shop_instance.selected_shelf_item = shop_instance.data[index];
};

function deselect_item(div, shop_instance, color){
    div.style.scale = "1.00";
    div.style.backgroundColor = `rgba(${color}, 0.3)`;
    div.style.opacity = "0.6";

    shop_instance.selected_shelf_item = null;
};

function handle_skill_click(div, shop_instance) {
    const skills = document.getElementById('skill-container');
    const divs = skills.querySelectorAll('div');
    divs.forEach((div) => {
        deselect_skill(div, shop_instance);
    })
    select_skill(div, shop_instance);
};

function select_skill(div, shop_instance){
    div.style.scale = "1.05";
    div.style.borderWidth = "5px";
    shop_instance.skill_selected = div_id(div, 1);
};

function deselect_skill(div, shop_instance){
    div.style.scale = "1.00";
    div.style.borderWidth = "1px";
    shop_instance.skill_selected = null;
};

function div_id(div, i){
    return div.id.split('-')[i]
};