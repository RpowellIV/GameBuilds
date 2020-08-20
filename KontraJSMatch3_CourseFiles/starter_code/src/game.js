import Grid from './grid.js';
import Board from './board.js';
import Block from "./block.js";

const { init, GameLoop, Sprite, initPointer, track, load, on, Pool } = kontra;

export default class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.numCols = 8;
      this.numRows = 8;  
      this.blockSize = 35;

      this.init();
    }

    init() {
        // initilaize kontra
        console.log('intialize game');
        const {canvas, context} = init();
        this.canvas = canvas;
        this.context = context;

        initPointer();

        // create game loop here
        this.gameLoop = GameLoop({
            update: this.update.bind(this),
            render: this.render.bind(this),
        });

        // creat our grid
        this.createGrid();

        // create board
        this.createBoard();


        // load assets
        this.load();

    }

    render() {
        //render our sprites w/ Kontra
        this.grid.render();

        if (this.blockPool) {
            this.blockPool.getAliveObjects().forEach((block) => {
                if (block.selected) {
                   block.context.globalAlpha = 0.6;
                } else {
                    block.context.globalAlpha = 1; 
                }
                block.render();
                block.context.globalAlpha = 1; 
            });
        }
    }

    update() {
        //update sprites w/ Kontra
        if (this.blockPool) {
          this.blockPool.update();  
        }
    }

    load() {
        // loads game assets w/ Kontra
        console.log('loading game assets');

        on('assetLoaded', (asset, url) => {
           asset.id = url; 
        });

        // load promise
        load(
            'assets/images/wl35.png',
            'assets/images/ol35.png',
            'assets/images/sc35.png',
            'assets/images/newgl35.png',
            'assets/images/bl35.jpg',
            'assets/images/ind35.png',
            'assets/images/star35.png',
            'assets/images/rl35.jpg',
            'assets/images/bhand35.jpg',
        ).then((assets) => {
            this.assets = assets;
            // start game
            this.start();
            // console.log(this.assets);
        }).catch((error) => {
            console.log(error);
        });
    }

    start() {
        //starts game loop
        console.log('starts game');
        this.gameLoop.start();
        this.drawBoard();
    }

    createGrid() {
        this.grid = new Grid({
            numRows: this.numRows,
            numCols: this.numCols,
            cellSize: this.blockSize + 4, // based on size of beans img
            x: 25, // space between sides
            y: 180, // space betweemn edges
            color:'green',

        });
    }

    createBoard() {
        // will show 8x8 empty array in console 
        this.board = new Board(
            this,
            this.numRows,
            this.numCols,
            6,
            false
        );
        // window.board = this.board;

        this.blockPool = Pool({
            create: () => {
                return new Block();
            }
        });
    }

    drawBoard() {
        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                const x = 28 + j * (this.blockSize + 4);
                const y = 183 + i * (this.blockSize + 4);
                
                const block = this.blockPool.get({
                    x,
                    y,
                    row: i,
                    col: j,
                    image: this.assets[this.board.grid[i][j]],
                    // without kontra will keep and destroy object
                    ttl: Infinity,
                });
                // console.log(block);
                block.onDown = () => {
                    this.pickBlock(block);
                }
                track(block);
            }
        }
    }

    pickBlock(block) {
        if (this.isBoardBlocked) {
            return;
        }

        // if first block picked

        if (!this.selectedBlock) {
            block.selected = true;
            this.selectedBlock = block;
        } else {
            // 2nd block is our target
            this.targetlBlock = block;

            if (this.board.checkAdjacent(this.selectedBlock, this.targetlBlock)) {
                this.isBoardBlocked = true;

                this.swapBlocks(this.selectedBlock, this.targetlBlock);
            } else {
                // if isnt valid selection
               this.clearSelection();
            }
        }
    }

    swapBlocks(block1, block2) {
        // swap block locations
        const tempX = block1.x;
        const tempY = block1.y;
        block1.x = block2.x;
        block1.y = block2.y;
        block2.x = tempX;
        block2.y = tempY;

        this.board.swap(block1, block2);


        if (!this.isReversingSwap) {
        // check for chains
            const chains = this.board.findAllChains();

            if (chains.length > 0) {
                this.updateBoard();
            } else {
                this.isReversingSwap = true;
                // run swap block recusively
                this.swapBlocks(block1, block2);
            }  
        } else {
            this.isReversingSwap = false;
            this.clearSelection();
        }
    }

    clearSelection() {
        this.isBoardBlocked = false;
        this.selectedBlock.selcted = false;
        this.selectedBlock = null;
    }

    updateBoard() {
        this.board.clearChains();
        this.board.updateGrid();

        const chains = this.board.findAllChains();

        //allows to update board or clears selction for new choice
        if (chains.length > 0) {
            this.updateBoard();
        } else {
            this.clearSelection();
        }
    }

    getBlockFromColRow(position) {
        let foundBlock;

        this.blockPool.getAliveObjects().some((block) => {
            if (block.row === position.row && block.col === position.col) {
                foundBlock = block;
                return true;
            }
            return false;
        });

        return foundBlock;
    }

    dropBlock(sourceRow, targetRow, col) {
        const block = this.getBlockFromColRow({col, row: sourceRow});
        const targetY = 183 + targetRow * (this.blockSize + 4);
        block.row = targetRow;
        block.y = targetY;
    }

    dropReserveBlock(sourceRow, targetRow, col) {
        const x = 28 + col * (this.blockSize + 4);;
        const y = 183 + targetRow * (this.blockSize + 4);

        const block = this.blockPool.get({
            x,
            y,
            col,
            row: targetRow,
            image: this.assets[this.board.grid[targetRow][col]],
            ttl: Infinity,
        });
        block.onDown = () => {
            this.pickBlock(block);
        };
        track(block);
    }
}