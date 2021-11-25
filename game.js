"use strict";

const Player = (name = "", sign = "", type = "human") => {
    const getName = () => {return name};
    const getSign = () => {return sign};
    const getType = () => {return type}; //human or bot
    return {getName, getSign, getType};
};

const BotPlayer = (sign, aiLevel = 0) => {
    const player = Player("Bot", sign, "bot");
    const getAiLevel = () => {return aiLevel};
    
    /* Sleep function @play */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function _easyAi() {
        const cellsInd = gameBoard.getFreeCellsInd();
        console.log(cellsInd);
        const rndIndex = cellsInd[Math.floor(Math.random() * cellsInd.length)];
        displayController.displayBotPlayerSign(rndIndex, sign);
        return rndIndex;
    }

    function _normalAi() {
        //TODO: to implement
        throw Error;
    }

    function _hardAi() {
        //TODO: to implement
        throw Error;
    }

    const play = async() => {
        await sleep(800); //Simulate bot thinking
        switch (aiLevel) {
            case 0:
                game.playTurn(_easyAi());
                break;
            case 2:
                game.playTurn(_hardAi());
                break;
            default:
                game.playTurn(_normalAi());
                break;
        }
    };

    return {...player, getAiLevel, play};
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

    const getFreeCellsInd = () => {
        let freeCellsInd = [];
        for(let i = 0; i < 9; i++) {
            if(_boardStatus[i] === "") {freeCellsInd.push(i)};
        }
        return freeCellsInd;
    };

    return {setSign, getSign, clearStatus, getFreeCellsInd};
})();

const displayController = (() => {
    const boardCells = document.querySelectorAll(".cell-value");
    const gameMessage = document.getElementById("game-message");
    const optionsContainer = document.getElementById("options-container");
    const ppMode = document.getElementById("player-player");
    const pbMode = document.getElementById("player-bot");
    const winAnim = document.getElementById("win-anim");
    const restartGame = document.getElementById("restart-game");
    /* Difficulty modal */
    const pbModalContainer = document.getElementById("pb-modal");
    const modalContent = pbModalContainer.querySelector(".modal-content");
    const difficultySlider = document.getElementById("difficulty-slider");
    const difficultyLbl = document.getElementById("difficulty-lbl");
    const xBtn = document.getElementById("x-btn");
    const oBtn = document.getElementById("o-btn");

    function _handleCellClick(e) {
        const index = e.target.dataset.index
        if(game.shouldAddSign(index) && index !== undefined) { //if undefined the click event target is the icon and not the cell
            _displayPlayerSign(e.target, game.getCurrentPlayer().getSign());
            game.playTurn(index);
        }
    }
    
    function _displayPlayerSign(cell, sign) {
        cell.classList.add(`${sign}`);
    }

    function displayBotPlayerSign(cellIndex, sign) {
        const cell = document.getElementById(`cell${cellIndex}`);
        cell.querySelector(".cell-value").classList.add(`${sign}`);
    }

    function _ppModeClicked() {
        let p1 = Player("Player 1", "x");
        let p2 = Player("Player 2", "o");
        game.start(p1, p2);
        document.documentElement.style.setProperty("--anim-pop", "pop-anim");
        _popAnimation(optionsContainer);
    }
    
    function _pbModeClicked() {
        document.documentElement.style.setProperty("--anim-pop", "pop-anim");
        _pushModal(pbModalContainer);
    }

    function _handleDifficultyInput(e) {
        document.documentElement.style.setProperty("--anim-pop", "pop-anim");
        let botSign = e.currentTarget.dataset.val;
        let botPlayer = BotPlayer(botSign, +difficultySlider.value);
        botSign === "x" ? game.start(botPlayer, Player("Human", "o", "human")) :
            game.start(Player("Human", "x", "human"), botPlayer);
        
        _popModal(pbModalContainer);
        _popAnimation(optionsContainer);
        difficultySlider.value = "1"; //reset to normal
    }

    function _pushModal(modal) {
        modal.style.display = "flex";
        setTimeout(() => {
            modalContent.style.transform = "scale(1)";
        }, 200);
    }

    function _popModal(modal) {
        modalContent.style.transform = "scale(0.001)";
        setTimeout(() => {
            modal.style.display = "none";
        }, 400);
    }

    const displayMessage = (messageString) => {
        gameMessage.textContent = messageString
    };

    const displayResultAnimation = (shouldPlayPlayerAnim, player = undefined) => {
        if(shouldPlayPlayerAnim && player !== undefined) {
            const type = player.getType();
            console.log(type);
            winAnim.classList.add(`${type}`);
            _highlightWinComb(game.getWinningCombination());
        }
        restartGame.classList.add("active");
    }

    function _highlightWinComb(comb) {
        comb.forEach(cellInd => {
            document.getElementById(`cell${cellInd}`).classList.add("win");
        });
    } 

    function _removeCombHighlighting(comb) {
        comb.forEach(cellInd => {
            document.getElementById(`cell${cellInd}`).classList.remove("win");
        });
    }

    function _popAnimation(element) {
        element.classList.remove("active");
    }

    function _handleGameRestart() {
        _removeCombHighlighting(game.getWinningCombination());
        _cleanBoard();
        _cleanWinAnimationAndReset();
    }

    function _cleanWinAnimationAndReset() {
        winAnim.classList.remove("bot", "human");
        restartGame.classList.remove("active");
    }

    function _cleanBoard() {
        const cellsToClean = [...boardCells].filter(cell => cell.classList.contains("o") || cell.classList.contains("x"));
        let arrayLen = cellsToClean.length;
        let intId;
        intId = setInterval(() => {
            let rndIndex = Math.floor(Math.random() * arrayLen);
            console.log(arrayLen);
            let cell = cellsToClean[rndIndex]
            cell.classList.add("clean");
            cellsToClean.splice(rndIndex, 1)
            arrayLen--;
            console.log(arrayLen);
            if(arrayLen <= 0) {
                clearInterval(intId);
                intId = null;
                game.restart() // Restart game at the end of the cleaning
            }
            setTimeout(() => {
                cell.classList.remove("clean", "x", "o");
            }, 250, cell);
        }, 100, arrayLen);
    }

    function _isClickOutsideModal(e) {
        if(e.target == pbModalContainer) {
            _popModal(pbModalContainer);
        }
    }

    function _changeDifficulty(e) {
        const value = e.target.value;
        switch(value) {
            case("0"):
                console.log("easy");
                difficultyLbl.textContent = "Easy";
                break;
            case("2"):
                console.log("hard");
                difficultyLbl.textContent = "Hard";
                break;
            default:
                console.log("normal");
                difficultyLbl.textContent = "Normal";
                break;
        }
    }

    /* Event listeners */

    boardCells.forEach((cell) => {
        cell.addEventListener("click", _handleCellClick);
    });

    restartGame.addEventListener("click", _handleGameRestart);

    difficultySlider.addEventListener("input", _changeDifficulty);
    xBtn.addEventListener("click", _handleDifficultyInput);
    oBtn.addEventListener("click", _handleDifficultyInput);

    window.addEventListener("click", _isClickOutsideModal);
    ppMode.addEventListener("click", _ppModeClicked);
    pbMode.addEventListener("click", _pbModeClicked);

    return {displayMessage, displayResultAnimation, displayBotPlayerSign};
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
    let winningCombination = [];
    let gameOver = true;
    let turnNumber = 0;
    const shouldAddSign = (index) => {
        return !gameBoard.getSign(index) && !gameOver && currentPlayer.getType() !== "bot";
    }
    const playTurn = (index) => {
        turnNumber++;
        gameBoard.setSign(index, currentPlayer.getSign());

        if(turnNumber > 4) { //Potential tris
            winningCombination = _searchWinningCombination();
            if(winningCombination.length !== 0) { // Winning comb
                gameOver = true;
                displayController.displayMessage(`${currentPlayer.getName()} wins!!`);
                displayController.displayResultAnimation(winningCombination, currentPlayer);
            }
            else if(turnNumber === 9) { //tie
                gameOver = true;
                displayController.displayMessage("Tie!!");
                displayController.displayResultAnimation(false);
            }
        }
        if(!gameOver) {_switchCurrentPlayer();}
    };

    function _searchWinningCombination() {
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
                console.log(combination);
                return combination; // Win combination found
            }

        }
        return []; // search failed
    }

    function _switchCurrentPlayer() {
        if(currentPlayer === player1) {
            currentPlayer = player2;
        }
        else {
            currentPlayer = player1;
        }
        displayController.displayMessage(`${currentPlayer.getName()} it's your turn!`);
        if(currentPlayer.getType() === "bot") {
            currentPlayer.play();
        }
    }

    function _setPlayers(p1, p2) {
        player1 = p1;
        player2 = p2;
        currentPlayer = p1;
    }

    const start = (firstPlayer, secondPlayer) => {
        //TODO: handle bot player
        _setPlayers(firstPlayer, secondPlayer);
        gameOver = false; //Start the game
        displayController.displayMessage(`${currentPlayer.getName()} it's your turn!`);
        if(currentPlayer.getType() === "bot") {
            currentPlayer.play();
        }
    };

    const restart = () => {
        turnNumber = 0;
        winningCombination = [];
        gameBoard.clearStatus();
        start(player1, player2); //Start with the same players
    };

    const getCurrentPlayer = () => {return currentPlayer};
    const getWinningCombination = () => {return winningCombination}

    return {start, restart, shouldAddSign, playTurn, getCurrentPlayer, getWinningCombination};
})();
