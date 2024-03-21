import { LightningElement,track } from 'lwc';
import resourceFile from '@salesforce/resourceUrl/SnakeGameResource';

export default class SnakeGame extends LightningElement {
    bgImage = `${resourceFile}/Image/bg.jpg`;  
    snakeFood = `${resourceFile}/Image/SnakeFood.png`; 
    snakeHead = `${resourceFile}/Image/SnakeHead.jpg`; 
    foodSound = new Audio(`${resourceFile}/Music/food.mp3`);
    gameOverSound = new Audio(`${resourceFile}/Music/gameover.mp3`);
    moveSound = new Audio(`${resourceFile}/Music/move.mp3`);

    inputDir = {x:0,y:0};
    speed = 3;
    score = 0;
    hiscore = 0;
    lastPaintTime = 0;
    snakeArr = [{x:12,y:11}];
    food = {x:15,y:6};
    interval = 0;

    @track scoreBox = 0;
    @track hiscoreBox = 0;
    @track showPlayButton = true;
    @track showPauseButton = false;
    @track showPlayAgainButton = false;
  
    renderedCallback(){
        const containerElement = this.template.querySelector('.body');
        if(containerElement){
            containerElement.style.backgroundImage = `url(${this.bgImage})`;
            let playPromise = this.moveSound.play();
            if (playPromise !== undefined) {
                // eslint-disable-next-line no-unused-vars
                playPromise.then(_ => {
                  // Automatic playback started!
                  // Show playing UI.
                  console.log('play');
                })
                .catch(error => {
                  // Auto-play was prevented
                  // Show paused UI.
                  console.log('pause',error);
                });
            }
            this.scoreBox = 'Score: '+this.score;
            let hiscoreVal = window.sessionStorage.getItem("hiscore");
            if(hiscoreVal === null){
                this.hiscoreBox = 'HiScore: '+this.hiscore;
            }else{
                this.hiscoreBox = 'HiScore: '+ JSON.parse(hiscoreVal);
            }
            this.animateGrid();
        }
    }
    constructor(){
        super();
        this.animateGrid = this.animateGrid.bind(this);
    }
    
    animateGrid(cTime){
        const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        this.interval = requestAnimationFrame(this.animateGrid);
        //console.log('Hi',cTime);
        if((cTime - this.lastPaintTime)/1000 < 1/this.speed){
            return;
        }
        this.lastPaintTime = cTime;
        this.gameEngine();
    }

    isCollide(snake){
        // If you bump into yourself 
        //console.log('snake=',snake);
        for (let i = 1; i < this.snakeArr.length; i++) {
            //console.log('snake=>',snake[i]);
            if(snake[i].x === snake[0].x && snake[i].y === snake[0].y){
                return true;
            }
        }
        // If you bump into the wall
        if(snake[0].x >= 18 || snake[0].x <=0 || snake[0].y >= 18 || snake[0].y <=0){
            return true;
        }
        return false;
    }

    gameEngine(){
        // Part 1: Updating the snake array & Food
        if(this.isCollide(this.snakeArr)){
            this.gameOverSound.play();
            //this.musicSound.pause();
            this.inputDir =  {x: 0, y: 0}; 
            this.showPlayButton = false;
            this.showPlayAgainButton = true;
            this.snakeArr = [{x:12,y:11}];
            //this.musicSound.play();
            this.score = 0;
            this.scoreBox = 'Score: '+this.score;
            //window.cancelAnimationFrame(this.interval);
        }

        // If you have eaten the food, increment the score and regenerate the food
        if(this.snakeArr[0].y === this.food.y && this.snakeArr[0].x === this.food.x){
            this.foodSound.play();
            this.score += 1;
            if(this.score > this.hiscore){
                this.hiscore = this.score;
                window.sessionStorage.setItem("hiscore", JSON.stringify(this.hiscore));
                this.hiscoreBox = 'HiScore: '+this.hiscore;
            }
            this.scoreBox = 'Score: '+this.score;
            this.snakeArr.unshift({x: this.snakeArr[0].x + this.inputDir.x, y: this.snakeArr[0].y + this.inputDir.y});
            let a = 2;
            let b = 16;
            this.food = {x: Math.round(a + (b-a)* Math.random()), y: Math.round(a + (b-a)* Math.random())}
        }
        
       // Moving the snake
        for (let i = this.snakeArr.length - 2; i>=0; i--) { 
            this.snakeArr[i+1] = {...this.snakeArr[i]};
        }

        this.snakeArr[0].x += this.inputDir.x;
        this.snakeArr[0].y += this.inputDir.y;

        // Part 2: Display the snake and Food
        // Display the snake
        const containerElement = this.template.querySelector('.board');
        // eslint-disable-next-line @lwc/lwc/no-inner-html
        containerElement.innerHTML = "";
        this.snakeArr.forEach((e, index)=>{
            let snakeElement = document.createElement('div');
            snakeElement.style.gridRowStart = e.y;
            snakeElement.style.gridColumnStart = e.x;

            if(index === 0){
                // eslint-disable-next-line @lwc/lwc/no-inner-html
                // snakeElement.innerHTML = 'H';
                snakeElement.style.backgroundImage = `url(${this.snakeHead})`;
                snakeElement.style.backgroundSize = 'cover';
                snakeElement.classList.add('head');
            }
            else{
                snakeElement.classList.add('snake');
            }
            containerElement.appendChild(snakeElement);
        });
         // Display the food
        let foodElement = document.createElement('div');
        foodElement.style.gridRowStart = this.food.y;
        foodElement.style.gridColumnStart = this.food.x;
        // eslint-disable-next-line @lwc/lwc/no-inner-html
        //foodElement.innerHTML = 'F';
        foodElement.style.backgroundImage = `url(${this.snakeFood})`;
        foodElement.style.backgroundSize = 'cover';
        foodElement.classList.add('food')
        containerElement.appendChild(foodElement);
    }

    gameInitiate(){
        // Main logic starts here
        //this.musicSound.play();
        let hiscoreVal = window.sessionStorage.getItem("hiscore");
        if(hiscoreVal === null){
            this.hiscore = 0;
            localStorage.setItem("hiscore", JSON.stringify(this.hiscore));
        }
        else{
            this.hiscore = JSON.parse(hiscoreVal);
            this.hiscoreBox = 'HiScore: '+this.hiscore;
        }
        this.inputDir = {x: 0, y: -1};  // Start the game
        window.addEventListener('keydown', e =>{
            this.moveSound.play();
            this.showPlayButton = false;
            this.showPlayAgainButton = false;
            switch (e.key) {
                case "ArrowUp":
                   // console.log("ArrowUp");
                    this.inputDir.x = 0;
                    this.inputDir.y = -1;
                    break;
        
                case "ArrowDown":
                    //console.log("ArrowDown");
                    this.inputDir.x = 0;
                    this.inputDir.y = 1;
                    break;
        
                case "ArrowLeft":
                    //console.log("ArrowLeft");
                    this.inputDir.x = -1;
                    this.inputDir.y = 0;
                    break;
        
                case "ArrowRight":
                    //console.log("ArrowRight");
                    this.inputDir.x = 1;
                    this.inputDir.y = 0;
                    break;
                default:
                    break;
            }
        });
    }

    playGame(){
        this.gameInitiate();
        this.showPlayButton = false;
        this.showPlayAgainButton = false;
    }
    
    pauseGame(){

    }

    stopGame(){
        window.cancelAnimationFrame(this.interval);
    }

}