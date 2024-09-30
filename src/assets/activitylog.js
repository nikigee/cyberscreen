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

export default Activity