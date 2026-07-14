import { defineStore } from 'pinia'
import { reactive } from 'vue'

import { magicDice } from "@/assets/md_magicdie"

// Helper classes
class Entry {
    constructor(props = {}) {
        const {
            id = Date.now(),
            content = "...",
            isDateMarker = false,
            timestamp = Date.now()
        } = props;
        this.id = id;
        this.content = content;
        this.isDateMarker = isDateMarker;
        this.timestamp = timestamp;
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

    _checkDate(timestamp) {
        const date = new Date(timestamp);
        
        if (this.log.length === 0) {
            this._writeDateMarker(date);
            return;
        }

        const lastEntry = this.log[this.log.length - 1];
        const lastDate = new Date(lastEntry.timestamp || lastEntry.id);
        
        if (date.toDateString() !== lastDate.toDateString()) {
            this._writeDateMarker(date);
        }
    }

    _writeDateMarker(date) {
        const day = date.getDate();
        let suffix = "th";
        if (day % 10 === 1 && day !== 11) suffix = "st";
        else if (day % 10 === 2 && day !== 12) suffix = "nd";
        else if (day % 10 === 3 && day !== 13) suffix = "rd";

        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();

        const dateStr = `---- ${month} ${day}${suffix}, ${year} ----`;
        const markerTime = date.getTime() - 1;
        this.log.push(new Entry({ content: dateStr, isDateMarker: true, id: 'marker-' + markerTime, timestamp: markerTime }));
    }

    write(content) {
        const now = Date.now();
        this._checkDate(now);
        this.log.push(new Entry({ content: content, id: now, timestamp: now }));

        // save to storage
        localStorage.setItem("cyberlog", JSON.stringify(this.log));
    }

    clear() {
        this.log = []; // clear

        localStorage.removeItem("cyberlog");
    }

    write_obj(props = {}) {
        const now = props.timestamp || props.id || Date.now();
        this._checkDate(now);
        this.log.push(new Entry({ ...props, id: props.id || now, timestamp: now }));

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


