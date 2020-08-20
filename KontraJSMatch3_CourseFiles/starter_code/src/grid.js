const { Sprite, Pool } = kontra;

export default class Grid {
    constructor(config) {
        this.numRows = config.numRows;
        this.numCols = config.numCols;
        this.cellSize = config.cellSize;
        this.color = config.color;
        this.x = config.x;
        this.y = config.y;

        this.height = this.numRows * this.cellSize;
        this.width = this.numCols * this.cellSize; 

        this.backgroundSprite = null;
        this.gridSpritesPool = Pool({
            create: Sprite,
        });

        this.init();
    }

    init() {
        this.backgroundSprite = Sprite({
          x: this.x,
          y: this.y,
          color: 'black',
          width: this.width,
          height: this.height,
        });

        // vertical grid lines
        for ( let i = 0; i < this.width + this.cellSize; i += this.cellSize) {
            this.gridSpritesPool.get({
                x: this.x + i,
                y: this.y + 0,
                color: this.color,
                width: 1,
                height: this.height
            });
            
            // const sprite = Sprite({
            //     x: this.x + i,
            //     y: this.y + 0,
            //     color: this.color,
            //     width: 1,
            //     height: this.height,
            //   });
            //   this.gridSprites.push(sprite);
        }

        
        // horizontal grid lines
        for ( let i = 0; i < this.height + this.cellSize; i += this.cellSize) {
            // const sprite = Sprite
            this.gridSpritesPool.get({
                x: this.x + 0,
                y: this.y + i,
                color: this.color,
                width: this.width,
                height: 1,
              });
            //   this.gridSprites.push(sprite);
        }
    }

    render() {
        if (this.backgroundSprite) {
            this.backgroundSprite.context.globalAlpha = .2; // for intial
            this.backgroundSprite.render(); 
            this.backgroundSprite.context.globalAlpha = 1; // lines rendered after
        }
        this.gridSpritesPool.render();
        // this.gridSprites.forEach((sprite) => {
        //     sprite.render();
        // });
    }
}