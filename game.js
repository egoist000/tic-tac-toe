"use strict";

const Player = (name = "", sign = "") => {
    const getName = () => {return name};
    const getSign = () => {return sign};
    return {getName, getSign};
};

const gameBoard = (() => {
    const _boardStatus = [
        "", "", "",
        "", "", "",
        "", "", ""
    ];

    const setSign = (index, sign) => {
        _boardStatus[index] = sign;
    };

    const getSign = (index) => {
        return _boardStatus[index];
    };

    const clearStatus = () => {
        for(let i = 0; i < _boardStatus.length; i++) {
            _boardStatus[i] = "";
        }
    };
    return {setSign, getSign, clearStatus};
})();

const displayController = (() => {
    const boardCells = document.querySelectorAll(".board-cell");
    function _handleCellClick(e) {
        const index = e.target.dataset.index
        if(game.shouldAddSign(index) && index !== undefined) { //if undefined the click event target is the icon and not the cell
            console.log(index);
            _displayPlayerSign(e.target, game.getCurrentPlayer().getSign());
            game.playTurn(index);
        }
        else {return}
    }
    
    function _displayPlayerSign(cell, sign) {
        cell.classList.add(`${sign}`);
    }

    boardCells.forEach((cell) => {
        cell.addEventListener("click", _handleCellClick);
    });

})();

const game = (() => {
    const _WINNING_COMBINATIONS = [ 
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    const player1 = Player("Mario", "x");
    const player2 = Player("Luigi", "o");
    let currentPlayer = player1;
    let gameOver = false;
    let turnNumber = 0;
    const shouldAddSign = (index) => {
        return !gameBoard.getSign(index) && !gameOver;
    }
    const playTurn = (index) => {
        turnNumber++;
        gameBoard.setSign(index, currentPlayer.getSign());
        if(turnNumber === 9) { //tie
            gameOver = true;
            //TODO: Display tie message
            console.log("tie!!");
        }
        if(turnNumber > 4) { //Potential tris
            if(_checkWin()) {
                gameOver = true;
                //TODO: Display winner name
                console.log(`${currentPlayer.getName()} wins!!`);
            }
        }
        if(!gameOver) {_switchCurrentPlayer();}
    };
    function _checkWin() {
        const sign = currentPlayer.getSign();
        for(let i = 0; i < _WINNING_COMBINATIONS.length; i++) {
            let combination = _WINNING_COMBINATIONS[i];
            let win = true;
            for(let j = 0; j < 3; j++) {
                if(gameBoard.getSign(combination[j]) !== sign) {
                    win = false;
                    break;
                }
            }
            if(win) {
                return true;
            }
        }
        return false;
    }
    function _switchCurrentPlayer() {
        if(currentPlayer === player1) {
            currentPlayer = player2;
        }
        else {
            currentPlayer = player1;
        }
    }
    const getCurrentPlayer = () => {return currentPlayer};

    return {shouldAddSign, playTurn, getCurrentPlayer};
})();