"use strict";

const Player = (name = "", sign = "", type = "human") => {
    const getName = () => {return name};
    const getSign = () => {return sign};
    const getType = () => {return type};
    return {getName, getSign, getType};
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
    const boardCells = document.querySelectorAll(".cell-value");
    const gameMessage = document.getElementById("game-message");
    const optionsContainer = document.getElementById("options-container");
    const ppMode = document.getElementById("player-player");
    const pbMode = document.getElementById("player-bot");
    const winAnim = document.getElementById("win-anim");
    const restartGame = document.getElementById("restart-game");
    
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

    function _ppModeClicked(e) {
        let p1 = Player("Player 1", "x");
        let p2 = Player("Player 2", "o");
        game.start(p1, p2);
        _popAnimation(optionsContainer);
    }

    function _pbModeClicked(e) {
        //TODO: to implement
    }

    const displayMessage = (messageString) => {
        gameMessage.textContent = messageString
    };

    const displayWinningAnimation = (player, tie = false) => {
        if(!tie) {
            const type = player.getType();
            console.log(type);
            winAnim.classList.add(`${type}`);
            setTimeout(() => {
                winAnim.style.transform = "scale(1)";
            }, 200);
        }
        restartGame.style.display = "block"
    }

    function _popAnimation(element) {
        element.style.transform = "scale(0.001)";
        setTimeout(() => {
            element.style.display = "none";
        }, 400)
    }

    function _handleGameRestart() {
        //TODO: clean board, restart game
    }

    boardCells.forEach((cell) => {
        cell.addEventListener("click", _handleCellClick);
    });

    restartGame.addEventListener("click", _handleGameRestart);

    ppMode.addEventListener("click", _ppModeClicked);
    pbMode.addEventListener("click", _pbModeClicked);

    return {displayMessage, displayWinningAnimation};
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
    let player1 = undefined;
    let player2 = undefined;
    let currentPlayer = undefined;
    let gameOver = true;
    let turnNumber = 0;
    const shouldAddSign = (index) => {
        return !gameBoard.getSign(index) && !gameOver;
    }
    const playTurn = (index) => {
        turnNumber++;
        gameBoard.setSign(index, currentPlayer.getSign());

        if(turnNumber > 4) { //Potential tris
            if(_checkWin()) {
                gameOver = true;
                displayController.displayMessage(`${currentPlayer.getName()} wins!!`);
                displayController.displayWinningAnimation(currentPlayer);
            }
            else if(turnNumber === 9) { //tie
                gameOver = true;
                displayController.displayMessage("Tie!!");
                displayController.displayWinningAnimation(currentPlayer, true);
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
        displayController.displayMessage(`${currentPlayer.getName()} it's your turn!`);
    }

    function _setPlayers(p1, p2) {
        player1 = p1;
        player2 = p2;
        currentPlayer = p1;
    }

    const start = (firstPlayer, secondPlayer) => {
        _setPlayers(firstPlayer, secondPlayer);
        gameOver = false; //Start the game
        displayController.displayMessage(`${firstPlayer.getName()} it's your turn!`);
    };

    const restart = () => {
        gameOver = false;
    };

    const getCurrentPlayer = () => {return currentPlayer};

    return {start, shouldAddSign, playTurn, getCurrentPlayer};
})();