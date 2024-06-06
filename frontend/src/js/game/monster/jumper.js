import { Rectangle } from "../../core/rectangle.js"
import { Sheet } from "../sheet/sheet.js";
import { canvas_filled_circle } from "../../core/render.js";
import { MonsterStrategy } from "./strategy.js";
import { OnDeath } from "./on_death.js";
import { ENEMIES_DATA, ENUMS_DATA } from "../../core/fetch.js";
import { random_f_in_range } from "../../core/rng.js";

const DATA = ENEMIES_DATA.jumper;
const MODIFIER = ENUMS_DATA.Modifier;
const MONSTER_TYPE = ENUMS_DATA.MonsterType;

export class Jumper{
    constructor(player_level, loc){
        this.type = MONSTER_TYPE.Jumper;
        this.rect = new Rectangle({
            x: loc.x,
            y: loc.y,
            w: DATA.dimension.width,
            h: DATA.dimension.height
        });
        
        const sheet_data = DATA.sheet_data;
        this.sheet = new Sheet({...sheet_data, hp: sheet_data.hp + player_level});
        this.strategy = new MonsterStrategy({...DATA.strategy, sheet: this.sheet});
        this.on_death = new OnDeath({...DATA.on_death});
    };

    draw() {
        canvas_filled_circle(this.rect.location, this.rect.dimension, {fill_style: DATA.color.body, hp: this.sheet.get_specific_health_fields()});
    };
    
    update(player) {
        this.strategy.execute(player, this.rect.location, this.sheet);
    };

    take_damage(value) {
        this.sheet.set_specific_modifier_value(MODIFIER.Hp, -value);
    };

    movement_menu(value) {
        this.rect.location.x += random_f_in_range(-value,value);
        this.rect.location.y += random_f_in_range(-value,value);
    };
    
    is_dead(){
        return this.sheet.get_modifier_value(MODIFIER.Hp) <= 0;
    };
};