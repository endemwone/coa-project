let tables = document.getElementsByClassName("cache-table");

// Hide all the tables
document.getElementById("one-way-table").style.display = "none";
document.getElementById("two-way-table").style.display = "none";
document.getElementById("four-way-table").style.display = "none";

// Hide memory input
document.getElementsByClassName("address-input")[0].style.display = "none";

let hitOrMiss = ["Miss", "Miss", "Miss"];

for (let table of tables) {
    for (let i = 0, row; (row = table.rows[i]); i++) {
        if (i > 1) {
            let index = (i - 2).toString(2);
            row.cells[0].innerHTML = "000".substring(index.length) + index;
            row.cells[1].innerHTML = 0;
        }
    }
}

// Implementing LRU Cache
class Node {
    constructor(key, value, next = null, prev = null) {
        this.key = key;
        this.value = value;
        this.next = next;
        this.prev = prev;
    }
}

class LRU {
    //set default limit of 10 if limit is not passed.
    constructor(limit) {
        this.size = 0;
        this.limit = limit;
        this.head = null;
        this.tail = null;
        this.cacheMap = {};
    }

    write(key, value) {
        const existingNode = this.cacheMap[key];
        if (existingNode) {
            this.detach(existingNode);
            this.size--;
        } else if (this.size === this.limit) {
            delete this.cacheMap[this.tail.key];
            this.detach(this.tail);
            this.size--;
        }

        // Write to head of LinkedList
        if (!this.head) {
            this.head = this.tail = new Node(key, value);
        } else {
            const node = new Node(key, value, this.head);
            this.head.prev = node;
            this.head = node;
        }

        // update cacheMap with LinkedList key and Node reference
        this.cacheMap[key] = this.head;
        this.size++;
    }

    read(key) {
        const existingNode = this.cacheMap[key];
        if (existingNode) {
            const value = existingNode.value;
            // Make the node as new Head of LinkedList if not already
            if (this.head !== existingNode) {
                // write will automatically remove the node from it's position and make it a new head i.e most used
                this.write(key, value);
            }
            return key;
        }

        return "Not found";
    }

    detach(node) {
        if (node.prev !== null) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }

        if (node.next !== null) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.cacheMap = {};
    }

    // Invokes the callback function with every node of the chain and the index of the node.
    forEach(fn) {
        let node = this.head;
        let counter = 0;
        while (node) {
            fn(node, counter);
            node = node.next;
            counter++;
        }
    }

    // To iterate over LRU with a 'for...of' loop
    *[Symbol.iterator]() {
        let node = this.head;
        while (node) {
            yield node;
            node = node.next;
        }
    }
}

// Classes for tables
class OneWayTable {
    constructor() {
        this.index = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.index[i] = new LRU(1);
        }
    }
}

class TwoWayTable {
    constructor() {
        this.index = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.index[i] = new LRU(2);
        }
    }
}

class FourWayTable {
    constructor() {
        this.index = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.index[i] = new LRU(4);
        }
    }
}

const oneWayTable = new OneWayTable();
const twoWayTable = new TwoWayTable();
const fourWayTable = new FourWayTable();

// Read address input
function readAddress() {
    let address = document.getElementById("mem-address").value;
    let binary = Number(address).toString(2);

    let index = address % 8;
    let tag = binary.slice(0, -3);

    let lruOne = oneWayTable.index[index];
    let lruTwo = twoWayTable.index[index];
    let lruFour = fourWayTable.index[index];

    if (lruOne.read(address) === "Not found") {
        hitOrMiss[0] = "Miss";
    } else {
        hitOrMiss[0] = "Hit";
    }

    if (lruTwo.read(address) === "Not found") {
        hitOrMiss[1] = "Miss";
    } else {
        hitOrMiss[1] = "Hit";
    }

    if (lruFour.read(address) === "Not found") {
        hitOrMiss[2] = "Miss";
    } else {
        hitOrMiss[2] = "Hit";
    }

    alert(
        "1-way cache: " + hitOrMiss[0] + "\n" + "2-way cache: " + hitOrMiss[1] + "\n" + "4-way cache: " + hitOrMiss[2]
    );

    lruOne.write(address, 1);
    lruTwo.write(address, 1);
    lruFour.write(address, 1);

    // Update one way table
    document.getElementsByClassName("tag")[index].innerHTML = tag;
    document.getElementsByClassName("valid")[index].innerHTML = 1;
    document.getElementsByClassName("data")[index].innerHTML = address;

    // Update two way table
    document.getElementsByClassName("valid")[index + 8].innerHTML = 1;
    document.getElementsByClassName("one")[index].innerHTML = Object.keys(lruTwo.cacheMap)[0]
        ? Object.keys(lruTwo.cacheMap)[0]
        : "";
    document.getElementsByClassName("two")[index].innerHTML = Object.keys(lruTwo.cacheMap)[1]
        ? Object.keys(lruTwo.cacheMap)[1]
        : "";

    // Update four way table
    document.getElementsByClassName("valid")[index + 16].innerHTML = 1;
    document.getElementsByClassName("1")[index].innerHTML = Object.keys(lruFour.cacheMap)[0]
        ? Object.keys(lruFour.cacheMap)[0]
        : "";
    document.getElementsByClassName("2")[index].innerHTML = Object.keys(lruFour.cacheMap)[1]
        ? Object.keys(lruFour.cacheMap)[1]
        : "";
    document.getElementsByClassName("3")[index].innerHTML = Object.keys(lruFour.cacheMap)[2]
        ? Object.keys(lruFour.cacheMap)[2]
        : "";
    document.getElementsByClassName("4")[index].innerHTML = Object.keys(lruFour.cacheMap)[3]
        ? Object.keys(lruFour.cacheMap)[3]
        : "";
}

function showOneWayTable() {
    document.getElementById("one-way-table").style.display = "";
    document.getElementById("two-way-table").style.display = "none";
    document.getElementById("four-way-table").style.display = "none";
    openTables = [true, false, false];
    document.getElementsByClassName("address-input")[0].style.display = "";
}

function showTwoWayTable() {
    document.getElementById("one-way-table").style.display = "none";
    document.getElementById("two-way-table").style.display = "";
    document.getElementById("four-way-table").style.display = "none";
    openTables = [false, true, false];
    document.getElementsByClassName("address-input")[0].style.display = "";
}

function showFourWayTable() {
    document.getElementById("one-way-table").style.display = "none";
    document.getElementById("two-way-table").style.display = "none";
    document.getElementById("four-way-table").style.display = "";
    openTables = [false, false, true];
    document.getElementsByClassName("address-input")[0].style.display = "";
}
