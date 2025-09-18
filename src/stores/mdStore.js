import { defineStore } from 'pinia'
import { reactive } from 'vue'

import { magicDice } from "@/assets/md_magicdie"

// Helper classes
class Entry {
    constructor(props = {}) {
        const {
            id = Date.now(),
            content = "..."
        } = props;
        this.id = id;
        this.content = content;
    }
}

class Activity {
    constructor() {
        const storedLog = localStorage.getItem("cyberlog");
        if (storedLog) {
            this.log = JSON.parse(storedLog); // retrieve cached log
        } else {
            this.log = [];
        }

    }

    write(content) {
        this.log.push(new Entry({ content: content }));

        // save to storage
        localStorage.setItem("cyberlog", JSON.stringify(this.log));
    }

    clear() {
        this.log = []; // clear

        localStorage.removeItem("cyberlog");
    }

    write_obj(props = {}) {
        this.log.push(new Entry(props));

        localStorage.setItem("cyberlog", JSON.stringify(this.log));
    }
}


// The store itself
export const useMagicDice = defineStore('md', () => {
    const md = reactive(magicDice);
    const cyberlog = reactive(new Activity());

    // convinence quick roll function for app, combining magic dice and the log function
    const roll = (input) => {
        const r = md.Dice.x(input);

        md.diceHistory.push(r);

        cyberlog.write(`rolled ${r.dice}, total: ${r.total}`)

        return r;
    }


    return { md, cyberlog, roll };
})


