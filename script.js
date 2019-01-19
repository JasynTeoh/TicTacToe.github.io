const boxArray = [];
const frmSizeSelection = document.getElementById('frmSizeSelection');
const gameInfo = document.getElementById('game-info');
const gameOption = document.getElementById('game-option');
const gamePart = document.getElementById('game-part');
let sizeSelected = 0;

const playerOFlag = document.getElementById('playerO');
const playerXFlag = document.getElementById('playerX');
const playerOScore = document.getElementById('playerO-score');
const playerXScore = document.getElementById('playerX-score');
const playerArray = [
    {
        playerName: "O",
        flag: playerOFlag,
        score: 0,
        scoreBoard: playerOScore
    },
    {
        playerName: "X",
        flag: playerXFlag,
        score: 0,
        scoreBoard: playerXScore
    }
]

const btnPlayAgain = document.getElementById('play-again');
const btnReset = document.getElementById('reset');
const playerType = document.getElementById('player-type')

let currentPlayer = "O";
let playedMoves = 0;
let vsPC = false;

function updateWinnerScore() {
    const winner = playerArray[(playedMoves -1) % 2];
    winner.score += 1;
};

function updateScoreBoard() {
    playerArray.forEach(element => {
        element.scoreBoard.innerHTML = element.score;
    });
};

function updateClickedItem (item) {
    item.innerHTML = currentPlayer;
};

function updatePlayedMoves () {
    playedMoves++;
};

function updateCurrentPlayer () {
    // identify next and prev player based on playedMoves
    const prevPlayer = playerArray[(playedMoves + 2 - 1) % 2];
    const nextPlayer = playerArray[playedMoves % 2];
    
    // update currentPlayer global variable
    currentPlayer = nextPlayer.playerName;
    
    // modify border class to indicate current player webpage
    prevPlayer.flag.classList.remove('borderplayer');
    nextPlayer.flag.classList.add('borderplayer');
};

function checkWon (checkPlayer) {
    // give out the score of the checkPlayer
    let matchCount =0;
    let bestMatchCount =0;
    // corner box has slightly higher points, to achieve smarter PC move
    const alphaBox = [
        boxArray[0][0],
        boxArray[0][sizeSelected-1],
        boxArray[sizeSelected-1][0],
        boxArray[sizeSelected-1][sizeSelected-1]]
    
    // loop horizontally
    for (let i = 0; i < sizeSelected; i++){
        for (let j = 0; j < sizeSelected; j++){
            if (boxArray[i][j].innerHTML == checkPlayer){
                matchCount++;
                if (alphaBox.includes(boxArray[i][j])){matchCount += 0.01}
            }
            else if(boxArray[i][j].innerHTML != ""){
                matchCount-=2;
            };

        }
        if (matchCount > bestMatchCount){bestMatchCount=matchCount};
        matchCount=0;
    }
    
    // loop vertically
    for (let i = 0; i < sizeSelected; i++){
        for (let j = 0; j < sizeSelected; j++){
            if (boxArray[j][i].innerHTML == checkPlayer){
                matchCount++;
                if (alphaBox.includes(boxArray[i][j])){matchCount += 0.01}
            }
            else if(boxArray[j][i].innerHTML != ""){
                matchCount -= 2;
            };
        }
        if (matchCount > bestMatchCount){bestMatchCount=matchCount};
        matchCount=0;
    }   
    
    // loop diagonally
    for (let i = 0; i < sizeSelected; i++){
        if (boxArray[i][i].innerHTML == checkPlayer){
            matchCount++;
            if (alphaBox.includes(boxArray[i][i])){matchCount += 0.01}
        }
        else if(boxArray[i][i].innerHTML != ""){
            matchCount -= 2;
        };
    }   
    if (matchCount > bestMatchCount){bestMatchCount=matchCount};
    matchCount=0;
    
    // loop diagonally reverse
    for (let i = 0; i < sizeSelected; i++){
        if (boxArray[i][sizeSelected-1-i].innerHTML == checkPlayer){
            matchCount++;
            if (alphaBox.includes(boxArray[i][sizeSelected-1-i])){matchCount += 0.01}
        }
        else if(boxArray[i][sizeSelected-1-i].innerHTML != ""){
            matchCount -= 2;
        };
    }   
    if (matchCount > bestMatchCount){bestMatchCount=matchCount};
    matchCount=0;
    
    return bestMatchCount;
};

function checkGameStatus (){
    let result = "";

    if (checkWon(currentPlayer) > sizeSelected) {
        alert('Congratulation!\nPlayer ' + currentPlayer + ' has won!')
        updateWinnerScore();
        updateScoreBoard();
        resetGamePart();
        result = "End";
    }
    else if (playedMoves==(sizeSelected*sizeSelected)) {
        alert('Game Draw!');
        resetGamePart();
        result = "End";
    }
    
    return result;
};

function resetGamePart () {
    const elem = document.getElementsByClassName('box')
    for (let i = 0; i < elem.length; i++){

        elem[i].innerHTML = "";
    }
    
    playedMoves = 0;

    updateCurrentPlayer();
};

function updatePlayerTypeImg () {
    if (vsPC == false){
        playerType.setAttribute("src", "./images/human.png");
    }
    else {
        playerType.setAttribute("src", "./images/computer.png");
    }
};

function pcNextMove () {
    
    let newBoxArray = [];
    const prevPlayer = playerArray[(playedMoves + 2 - 1) % 2].playerName;

    // Identify remaining selectable boxes (empty box)
    for (let i = 0; i < sizeSelected; i++){
        for (let j = 0; j < sizeSelected; j++){
            if (boxArray[i][j].innerHTML == "") {
                newBoxArray.push(boxArray[i][j]);
            };
        }
    };    

    let i =  newBoxArray.length - 1;
    let bestMove = {position: newBoxArray[i], point: 0};
    
    // find out opponent current point
    let currOpponentMatchPoint = checkWon(prevPlayer);
    let newOpponentMatchPoint = 0;
    let matchPoint = 0;
    let counterMove = {position: newBoxArray[i], point: 0};

    while (newBoxArray.length > 1) {
        // create a random index to randomise the starting position
        i = Math.floor(Math.random()*newBoxArray.length);
        
        // put in pseudo move and get match point from checkWon function
        newBoxArray[i].innerHTML = currentPlayer;
        matchPoint = checkWon(currentPlayer);
        newOpponentMatchPoint = checkWon(prevPlayer);
        newBoxArray[i].innerHTML = "";
        
        // Best move: save move if that is a better move
        if (matchPoint > bestMove.point){
            bestMove.position = newBoxArray[i];
            bestMove.point = matchPoint;
        }

        // Counter move: save move if that is a better move to stop opponent winning
        if ((currOpponentMatchPoint - newOpponentMatchPoint) > counterMove.point){
            counterMove.position = newBoxArray[i];
            counterMove.point = currOpponentMatchPoint - newOpponentMatchPoint;
        }

        // delete move if that equivalent or worst than current identified move
        newBoxArray.splice(i,1);
        
        matchPoint = 0;
    }
    
    // update selected box
    // counter opponent's move when opponent is near to winning point
    if (currOpponentMatchPoint > sizeSelected-2) {
        counterMove.position.innerHTML = currentPlayer;   
    }
    else {
        bestMove.position.innerHTML = currentPlayer;
    }

    console.log(prevPlayer, currOpponentMatchPoint);
    console.log(currentPlayer, bestMove.point);

};

function gamePartInitialise() {
    // create number of boxes as per user's selection
    for (let i = 0; i < sizeSelected; i++) {

        const newRow = document.createElement('div');
        newRow.setAttribute('id','gamePartRow')
        newRow.setAttribute('class','m-0 d-flex');

        boxArray.push([]);

        for (let j = 0; j < sizeSelected; j++) {
            const newCol = document.createElement('div');
            // give unique id name and common class of box
            newCol.setAttribute('id', i.toString() + j.toString());
            newCol.setAttribute('class','box');
            
            // square size
            newCol.style.height = 'calc(27vw/' + sizeSelected + ')'
            newCol.style.width = 'calc(27vw/' + sizeSelected + ')'
            newCol.style.fontSize = 'calc(27vw/' + sizeSelected + ')'
            
            // add into html
            newRow.appendChild(newCol);

            // add into js array
            boxArray[i].push(newCol);
        }

        gamePart.appendChild(newRow);
        
    }
}

function gameInitialise () {
    // hide sizeSelection and unhide remaining game parts
    frmSizeSelection.classList.add('hidden');
    gamePart.classList.remove('hidden');
    gameInfo.classList.remove('hidden');
    gameOption.classList.remove('hidden');

    // Create boxes
    gamePartInitialise();
    
    updateScoreBoard();
    
    for (let i = 0; i < boxArray.length; i++){
        for (let j = 0; j < boxArray[0].length; j++){

            boxArray[i][j].onclick = function (event) {
                const clickedElem = event.target;
                
                if (clickedElem.innerHTML == "") {
                    
                    // Update Clicked Item
                    updateClickedItem(clickedElem);
                    
                    // Update playedMoves
                    updatePlayedMoves();
                    
                    // check played moves
                    if (checkGameStatus() == "End") {return}
                    
                    // Current Player
                    updateCurrentPlayer();
                    
                    // Play next move if next player is computer player
                    if (currentPlayer == "X" && vsPC == true) {
                        pcNextMove();
                        updatePlayedMoves();
                        if (checkGameStatus() == "End") {return}
                        updateCurrentPlayer();
                    }
                }
            };
        }
    };
        
    // Change player type
    playerType.onclick = function (event) {
        resetGamePart();

        playerArray.forEach(element => {
            element.score = 0;
        });
        updateScoreBoard();
        vsPC = !vsPC;
        updatePlayerTypeImg();
    }
    
    // Reset only the game board for the same player
    btnPlayAgain.onclick = function (event) {
        event.preventDefault();
        resetGamePart();
    }
};

function formInitialise () {
    frmSizeSelection.onsubmit = function (event){
        event.preventDefault();
        let elemSizeSelected = document.getElementById('sizeSelection'); 
        sizeSelected = Number(elemSizeSelected.value); 

        if (!isNaN(sizeSelected) && sizeSelected >= 3 && sizeSelected <= 10){
            gameInitialise();
        }
        else{
            alert('Please enter only numeric input between 3-10')
        }
        // clear field for new input
        elemSizeSelected.value = '';
    }
}

formInitialise();