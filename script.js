let tables = document.getElementsByClassName("cache-table");

// Hide all the tables
document.getElementById("one-way-table").style.display = "none";
document.getElementById("two-way-table").style.display = "none";
document.getElementById("four-way-table").style.display = "none";
document.getElementById("eight-way-table").style.display = "none";

// Hide memory input
document.getElementsByClassName("address-input")[0].style.display = "none";

// Hide stats table
document.getElementsByClassName("stats-table")[0].style.display = "none";

let hitOrMiss = ["Miss", "Miss", "Miss", "Miss"];
let total = 0;
let hits = [0, 0, 0, 0];
let misses = [0, 0, 0, 0];

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
        this.index = new Array(4);
        for (let i = 0; i < 8; i++) {
            this.index[i] = new LRU(2);
        }
    }
}

class FourWayTable {
    constructor() {
        this.index = new Array(2);
        for (let i = 0; i < 8; i++) {
            this.index[i] = new LRU(4);
        }
    }
}

class EightWayTable {
    constructor() {
        this.index = new Array(1);
        for (let i = 0; i < 8; i++) {
            this.index[i] = new LRU(8);
        }
    }
}

const oneWayTable = new OneWayTable();
const twoWayTable = new TwoWayTable();
const fourWayTable = new FourWayTable();
const eightWayTable = new EightWayTable();

// Read address input
function readAddress() {
    let address = document.getElementById("mem-address").value;
    let word = Math.floor(address / 4);
    let binary = Number(address).toString(2);

    let indexOneWay = word % 8;
    let indexTwoWay = word % 4;
    let indexFourWay = word % 2;
    let tag = binary.slice(0, -3);

    console.log(indexOneWay);

    let lruOne = oneWayTable.index[indexOneWay];
    let lruTwo = twoWayTable.index[indexTwoWay];
    let lruFour = fourWayTable.index[indexFourWay];
    let lruEight = eightWayTable.index[0];

    if (lruOne.read(address) === "Not found") {
        hitOrMiss[0] = "Miss";
        misses[0]++;
        total++;
    } else {
        hitOrMiss[0] = "Hit";
        hits[0]++;
        total++;
    }

    if (lruTwo.read(address) === "Not found") {
        hitOrMiss[1] = "Miss";
        misses[1]++;
        total++;
    } else {
        hitOrMiss[1] = "Hit";
        hits[1]++;
        total++;
    }

    if (lruFour.read(address) === "Not found") {
        hitOrMiss[2] = "Miss";
        misses[2]++;
        total++;
    } else {
        hitOrMiss[2] = "Hit";
        hits[2]++;
        total++;
    }

    if (lruEight.read(address) === "Not found") {
        hitOrMiss[3] = "Miss";
        misses[3]++;
        total++;
    } else {
        hitOrMiss[3] = "Hit";
        hits[3]++;
        total++;
    }

    document.getElementById("one-way").innerHTML = hitOrMiss[0];
    document.getElementById("two-way").innerHTML = hitOrMiss[1];
    document.getElementById("four-way").innerHTML = hitOrMiss[2];
    document.getElementById("eight-way").innerHTML = hitOrMiss[3];

    document.getElementById("hit-one").innerHTML = parseFloat(hits[0] / total).toFixed(2);
    document.getElementById("hit-two").innerHTML = parseFloat(hits[1] / total).toFixed(2);
    document.getElementById("hit-four").innerHTML = parseFloat(hits[2] / total).toFixed(2);
    document.getElementById("hit-eight").innerHTML = parseFloat(hits[3] / total).toFixed(2);

    document.getElementById("miss-one").innerHTML = parseFloat(misses[0] / total).toFixed(2);
    document.getElementById("miss-two").innerHTML = parseFloat(misses[1] / total).toFixed(2);
    document.getElementById("miss-four").innerHTML = parseFloat(misses[2] / total).toFixed(2);
    document.getElementById("miss-eight").innerHTML = parseFloat(misses[3] / total).toFixed(2);

    lruOne.write(address, 1);
    lruTwo.write(address, 1);
    lruFour.write(address, 1);
    lruEight.write(address, 1);

    // Update one way table
    document.getElementsByClassName("tag")[indexOneWay].innerHTML = tag;
    document.getElementsByClassName("valid")[indexOneWay].innerHTML = 1;
    document.getElementsByClassName("data")[indexOneWay].innerHTML = address;

    // Update two way table
    document.getElementsByClassName("valid")[indexTwoWay + 8].innerHTML = 1;
    document.getElementsByClassName("one")[indexTwoWay].innerHTML = Object.keys(lruTwo.cacheMap)[0]
        ? Object.keys(lruTwo.cacheMap)[0]
        : "";
    document.getElementsByClassName("two")[indexTwoWay].innerHTML = Object.keys(lruTwo.cacheMap)[1]
        ? Object.keys(lruTwo.cacheMap)[1]
        : "";

    // Update four way table
    document.getElementsByClassName("valid")[indexFourWay + 12].innerHTML = 1;
    document.getElementsByClassName("1")[indexFourWay].innerHTML = Object.keys(lruFour.cacheMap)[0]
        ? Object.keys(lruFour.cacheMap)[0]
        : "";
    document.getElementsByClassName("2")[indexFourWay].innerHTML = Object.keys(lruFour.cacheMap)[1]
        ? Object.keys(lruFour.cacheMap)[1]
        : "";
    document.getElementsByClassName("3")[indexFourWay].innerHTML = Object.keys(lruFour.cacheMap)[2]
        ? Object.keys(lruFour.cacheMap)[2]
        : "";
    document.getElementsByClassName("4")[indexFourWay].innerHTML = Object.keys(lruFour.cacheMap)[3]
        ? Object.keys(lruFour.cacheMap)[3]
        : "";

    // Update eight way table
    document.getElementsByClassName("valid")[14].innerHTML = 1;
    document.getElementsByClassName("11")[0].innerHTML = Object.keys(lruEight.cacheMap)[0]
        ? Object.keys(lruEight.cacheMap)[0]
        : "";
    document.getElementsByClassName("22")[0].innerHTML = Object.keys(lruEight.cacheMap)[1]
        ? Object.keys(lruEight.cacheMap)[1]
        : "";
    document.getElementsByClassName("33")[0].innerHTML = Object.keys(lruEight.cacheMap)[2]
        ? Object.keys(lruEight.cacheMap)[2]
        : "";
    document.getElementsByClassName("44")[0].innerHTML = Object.keys(lruEight.cacheMap)[3]
        ? Object.keys(lruEight.cacheMap)[3]
        : "";
    document.getElementsByClassName("55")[0].innerHTML = Object.keys(lruEight.cacheMap)[4]
        ? Object.keys(lruEight.cacheMap)[4]
        : "";
    document.getElementsByClassName("66")[0].innerHTML = Object.keys(lruEight.cacheMap)[5]
        ? Object.keys(lruEight.cacheMap)[5]
        : "";
    document.getElementsByClassName("77")[0].innerHTML = Object.keys(lruEight.cacheMap)[6]
        ? Object.keys(lruEight.cacheMap)[6]
        : "";
    document.getElementsByClassName("88")[0].innerHTML = Object.keys(lruEight.cacheMap)[7]
        ? Object.keys(lruEight.cacheMap)[7]
        : "";
}

function showOneWayTable() {
    document.getElementById("one-way-table").style.display = "";
    document.getElementById("two-way-table").style.display = "none";
    document.getElementById("four-way-table").style.display = "none";
    document.getElementById("eight-way-table").style.display = "none";
    document.getElementsByClassName("address-input")[0].style.display = "";
    document.getElementsByClassName("stats-table")[0].style.display = "";
}

function showTwoWayTable() {
    document.getElementById("one-way-table").style.display = "none";
    document.getElementById("two-way-table").style.display = "";
    document.getElementById("four-way-table").style.display = "none";
    document.getElementById("eight-way-table").style.display = "none";
    document.getElementsByClassName("address-input")[0].style.display = "";
    document.getElementsByClassName("stats-table")[0].style.display = "";
}

function showFourWayTable() {
    document.getElementById("one-way-table").style.display = "none";
    document.getElementById("two-way-table").style.display = "none";
    document.getElementById("four-way-table").style.display = "";
    document.getElementById("eight-way-table").style.display = "none";
    document.getElementsByClassName("address-input")[0].style.display = "";
    document.getElementsByClassName("stats-table")[0].style.display = "";
}

function showEightWayTable() {
    document.getElementById("one-way-table").style.display = "none";
    document.getElementById("two-way-table").style.display = "none";
    document.getElementById("four-way-table").style.display = "none";
    document.getElementById("eight-way-table").style.display = "";
    document.getElementsByClassName("address-input")[0].style.display = "";
    document.getElementsByClassName("stats-table")[0].style.display = "";
}
