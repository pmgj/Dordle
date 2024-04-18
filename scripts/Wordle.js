import Winner from "./Winner.js";
import MoveResult from "./MoveResult.js";
import NotInWordListError from "./NotInWordListError.js";

export default class Wordle {
    constructor(words) {
        this.words = words;
        this.secret = words[Math.floor(Math.random() * words.length)];
        console.log(this.secret);
        this.tries = 0;
        this.maxTries = 6;
        this.wordLength = this.secret.length;
        this.isGameOver = null;
    }
    check(value) {
        if(this.isGameOver) {
            return this.isGameOver;
        }
        if (value.length !== this.secret.length) {
            throw new Error(`The length of the word is incorrect. Must be ${this.secret.length}.`);
        }
        if (this.tries > this.maxTries) {
            throw new Error("You have no more tries.");
        }
        if (!this.words.includes(value)) {
            throw new NotInWordListError();
        }
        let result = [-1, -1, -1, -1, -1];
        for (let i = 0; i < this.secret.length; i++) {
            let number = value[i];
            if (!this.secret.includes(number)) {
                result[i] = 0;
            } else if (number === this.secret[i]) {
                result[i] = 2;
            }
        }
        for (let i = 0; i < result.length; i++) {
            if (result[i] === -1) {
                let v1 = [...this.secret].filter(v => v === value[i]).length;
                let v2 = [...value].filter(v => v === value[i]).length;
                if (v1 >= v2) {
                    result[i] = 1;
                } else {
                    let index = value.indexOf(value[i], i + 1);
                    if (index !== -1 && result[index] === -1) {
                        result[i] = 1;
                    } else {
                        result[i] = 0;
                    }
                }
            }
        }
        this.tries++;
        if (result.every(e => e === 2)) {
            this.isGameOver = new MoveResult(Winner.WIN, this.secret, result);
            return this.isGameOver;
        }
        if (this.tries === this.maxTries) {
            this.isGameOver = new MoveResult(Winner.LOSE, this.secret, result);
            return this.isGameOver;
        }
        return new MoveResult(Winner.NONE, null, result);
    }
}