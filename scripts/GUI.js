import words from "./words_en.js";
import Wordle from "./Wordle.js";
import Winner from "./Winner.js";
import NotInWordListError from "./NotInWordListError.js";

class GUI {
    constructor() {
        let tBodies = document.querySelectorAll("tbody");
        this.wordle = [{ game: new Wordle(words), row: 0, col: 0, currentWord: "", tbody: tBodies[0], isOver: false }, { game: new Wordle(words), row: 0, col: 0, currentWord: "", tbody: tBodies[1], isOver: false }];
    }
    showWord(mr, tabindex) {
        if (this.wordle[tabindex].isOver) return;
        let bgStyles = ["bg-secondary", "bg-warning", "bg-success"];
        let bdStyles = ["border-secondary", "border-warning", "border-success"];
        let endOfGame = () => {
            this.wordle[tabindex].col = 0;
            this.wordle[tabindex].currentWord = "";
            if (this.wordle[tabindex].isOver) return;
            this.wordle[tabindex].row++;
            if (mr.winner === Winner.WIN) {
                let j = 1, td = this.wordle[tabindex].tbody.rows[this.wordle[tabindex].row - 1].cells[0];
                let endanim = cell => {
                    cell.dataset.animation = "bounce";
                    if (cell.nextSibling) {
                        setTimeout(() => endanim(cell.nextSibling), j++ * 100);
                    }
                };
                endanim(td);
                this.wordle[tabindex].isOver = true;
            }
            let message = document.querySelector("#message");
            if (this.wordle.every(w => w.isOver)) {
                window.onkeyup = undefined;
                message.textContent = "Congratulations!";
                message.className = "bg-success text-white";
                message.style.visibility = "visible";
            } else if (mr.winner === Winner.LOSE) {
                window.onkeyup = undefined;
                message.textContent = `You lose! Correct words: ${results.map(mr => mr.code.toUpperCase())}`;
                message.className = "bg-secondary text-white";
                message.style.visibility = "visible";
            }
        };
        let styleKeyboard = () => {
            for (let i = 0; i < mr.hint.length; i++) {
                let index = mr.hint[i];
                let letter = this.wordle[tabindex].currentWord[i].toLowerCase();
                let b = document.querySelector(`button[data-value='${letter}']`);
                let bStyles2 = ["--bs-secondary-color", "--bs-warning", "--bs-success"];
                b.dataset[`color${tabindex}`] = bStyles2[index];
                if (b.dataset.color0 && b.dataset.color1) {
                    b.classList.remove("bg-secondary-subtle");
                    b.classList.add("text-white");
                    b.style.backgroundImage = `linear-gradient(to right, var(${b.dataset.color0}) 50%, var(${b.dataset.color1}) 50%)`;
                }
            }
            endOfGame();
        };
        let animation = cell => {
            cell.dataset.animation = "flip-in";
            cell.onanimationend = () => {
                cell.dataset.animation = "flip-out";
                cell.classList.add("text-white");
                cell.classList.add(bgStyles[mr.hint[cell.cellIndex]]);
                cell.classList.add(bdStyles[mr.hint[cell.cellIndex]]);
                cell.onanimationend = () => {
                    cell.onanimationend = undefined;
                    if (cell.nextSibling) {
                        animation(cell.nextSibling);
                    } else {
                        styleKeyboard();
                    }
                };
            };
        };
        let td = this.wordle[tabindex].tbody.rows[this.wordle[tabindex].row].cells[0];
        animation(td);
    }
    checkWord() {
        for (let i = 0; i < this.wordle.length; i++) {
            try {
                let temp = this.wordle[i].game.check(this.wordle[i].currentWord);
                this.showWord(temp, i);
            } catch (ex) {
                if (ex instanceof NotInWordListError) {
                    let tr = this.wordle[i].tbody.rows[this.wordle[i].row];
                    for (let j = 0; j < tr.cells.length; j++) {
                        tr.cells[j].dataset.animation = "shake";
                        tr.cells[j].onanimationend = () => {
                            tr.cells[j].dataset.animation = "";
                        };
                    }
                }
            }
        }
    }
    removeLetter() {
        for (let i = 0; i < this.wordle.length; i++) {
            let temp = this.wordle[i];
            if (temp.col === 0) {
                return;
            }
            temp.currentWord = temp.currentWord.slice(0, -1);
            temp.col--;
            if (!temp.isOver) {
                let td = temp.tbody.rows[temp.row].cells[temp.col];
                td.textContent = "";
                td.dataset.animation = "";
            }
        }
    }
    addLetter(letter) {
        for (let i = 0; i < this.wordle.length; i++) {
            let temp = this.wordle[i];
            if (temp.currentWord.length >= temp.game.wordLength) {
                return;
            }
            if (!temp.isOver) {
                let td = temp.tbody.rows[temp.row].cells[temp.col];
                td.textContent = letter;
                td.dataset.animation = "pop";
            }
            temp.currentWord += letter;
            temp.col++;
        }
    }
    process(key) {
        switch (key) {
            case "Enter":
                this.checkWord();
                break;
            case "Backspace":
                this.removeLetter();
                break;
            default:
                if (key >= 'a' && key <= 'z')
                    this.addLetter(key);
        }
    }
    keyPressed(evt) {
        this.process(evt.key);
    }
    buttonPressed(evt) {
        this.process(evt.currentTarget.dataset.value);
    }
    fillBoard() {
        for (let i = 0; i < this.wordle.length; i++) {
            const element = this.wordle[i];
            let rows = "";
            for (let i = 0; i < element.game.maxTries; i++) {
                rows += "<tr>";
                for (let j = 0; j < element.game.wordLength; j++) {
                    rows += "<td></td>";
                }
                rows += "</tr>";
            }
            element.tbody.innerHTML = rows;
        }
    }
    registerEvents() {
        this.fillBoard();
        window.onkeyup = this.keyPressed.bind(this);
        let buttons = document.querySelectorAll("button");
        buttons.forEach(b => b.onclick = this.buttonPressed.bind(this));
    }
}
let gui = new GUI();
gui.registerEvents();