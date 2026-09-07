class BingoGame {
    constructor() {
        this.board = [];
        this.calledNumbers = new Set();
        this.gameWon = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.newGame();
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetBoard());
        document.getElementById('callNumberBtn').addEventListener('click', () => this.callNumber());
    }

    generateBoard() {
        const ranges = {
            B: [1, 15],
            I: [16, 30],
            N: [31, 45],
            G: [46, 60],
            O: [61, 75]
        };

        const letters = ['B', 'I', 'N', 'G', 'O'];
        this.board = [];

        for (let row = 0; row < 5; row++) {
            const boardRow = [];
            for (let col = 0; col < 5; col++) {
                if (row === 2 && col === 2) {
                    // Free space in center
                    boardRow.push({ number: 'FREE', isFree: true, marked: true });
                } else {
                    const letter = letters[col];
                    const [min, max] = ranges[letter];
                    let number;
                    let unique = false;

                    while (!unique) {
                        number = Math.floor(Math.random() * (max - min + 1)) + min;
                        unique = !boardRow.some(cell => cell.number === number) &&
                                 (row === 0 || !this.board[row - 1].some(cell => cell.number === number));
                    }

                    boardRow.push({ number, isFree: false, marked: false });
                }
            }
            this.board.push(boardRow);
        }
    }

    renderBoard() {
        const boardDiv = document.getElementById('bingoBoard');
        boardDiv.innerHTML = '';

        this.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell';
                if (cell.marked) cellDiv.classList.add('marked');
                if (cell.isFree) cellDiv.classList.add('free');
                cellDiv.textContent = cell.number;
                cellDiv.dataset.row = rowIndex;
                cellDiv.dataset.col = colIndex;

                if (!cell.isFree) {
                    cellDiv.addEventListener('click', () => this.toggleCell(rowIndex, colIndex));
                }

                boardDiv.appendChild(cellDiv);
            });
        });
    }

    toggleCell(row, col) {
        if (!this.board[row][col].isFree) {
            this.board[row][col].marked = !this.board[row][col].marked;
            this.renderBoard();
            this.checkForBingo();
        }
    }

    callNumber() {
        if (this.gameWon) {
            alert('Game already won! Start a new game.');
            return;
        }

        let number;
        let unique = false;

        while (!unique) {
            number = Math.floor(Math.random() * 75) + 1;
            unique = !this.calledNumbers.has(number);
        }

        this.calledNumbers.add(number);
        this.updateCalledNumbers();
        this.markNumber(number);
        this.updateGameStatus();
    }

    markNumber(number) {
        this.board.forEach(row => {
            row.forEach(cell => {
                if (cell.number === number) {
                    cell.marked = true;
                }
            });
        });
        this.renderBoard();
        this.checkForBingo();
    }

    updateCalledNumbers() {
        const container = document.getElementById('calledNumbers');
        container.innerHTML = '';

        const sortedNumbers = Array.from(this.calledNumbers).sort((a, b) => a - b);
        sortedNumbers.forEach(num => {
            const badge = document.createElement('div');
            badge.className = 'number-badge';
            badge.textContent = num;
            container.appendChild(badge);
        });

        document.getElementById('calledCount').textContent = this.calledNumbers.size;
    }

    checkForBingo() {
        // Check rows
        for (let row = 0; row < 5; row++) {
            if (this.board[row].every(cell => cell.marked)) {
                return this.declareWinner(`Row ${row + 1}`);
            }
        }

        // Check columns
        for (let col = 0; col < 5; col++) {
            if (this.board.every(row => row[col].marked)) {
                return this.declareWinner(`Column ${col + 1}`);
            }
        }

        // Check diagonals
        if (this.board.every((row, i) => row[i].marked)) {
            return this.declareWinner('Diagonal (top-left to bottom-right)');
        }

        if (this.board.every((row, i) => row[4 - i].marked)) {
            return this.declareWinner('Diagonal (top-right to bottom-left)');
        }
    }

    declareWinner(pattern) {
        if (this.gameWon) return;
        this.gameWon = true;

        const bingoDiv = document.createElement('div');
        bingoDiv.className = 'bingo';
        bingoDiv.innerHTML = `
            <h2>🎉 BINGO! 🎉</h2>
            <p>Winner: ${pattern}</p>
            <p>Numbers called: ${this.calledNumbers.size}</p>
        `;
        document.body.appendChild(bingoDiv);

        document.getElementById('gameStatus').textContent = 'WON!';
        document.getElementById('gameStatus').style.color = '#10b981';
    }

    updateGameStatus() {
        const status = this.gameWon ? 'WON!' : `${this.calledNumbers.size} numbers called`;
        document.getElementById('gameStatus').textContent = status;
    }

    resetBoard() {
        this.board.forEach(row => {
            row.forEach(cell => {
                if (!cell.isFree) {
                    cell.marked = false;
                }
            });
        });
        this.renderBoard();
        this.gameWon = false;
        document.getElementById('gameStatus').textContent = 'Ready';
        document.getElementById('gameStatus').style.color = '#667eea';
        
        const bingoDiv = document.querySelector('.bingo');
        if (bingoDiv) bingoDiv.remove();
    }

    newGame() {
        this.generateBoard();
        this.calledNumbers.clear();
        this.gameWon = false;
        this.updateCalledNumbers();
        this.renderBoard();
        document.getElementById('gameStatus').textContent = 'Ready';
        document.getElementById('gameStatus').style.color = '#667eea';
        
        const bingoDiv = document.querySelector('.bingo');
        if (bingoDiv) bingoDiv.remove();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
});