function preload() {
	// Load the player sprite sheet
	this.load.spritesheet('player', './Cute_Fantasy_Free/Player/Player.png', {
			frameWidth: 32,
			frameHeight: 32
	});

	// Load the actions sprite sheet for cutting animation
	this.load.spritesheet('actions', './Cute_Fantasy_Free/Player/Player_Actions.png', {
			frameWidth: 32,
			frameHeight: 32
	});

	this.load.image('land', './Cute_Fantasy_Free/Tiles/FarmLand_Tile.png');

	this.load.image('tree', './Cute_Fantasy_Free/Outdoor decoration/Oak_Tree.png');
	this.load.spritesheet('campfire', './asset/Animated Campfire/spr_campfire_starting.png', {
		frameWidth: 64,
		frameHeight: 64  
});
}

function create() {


	this.land = this.add.tileSprite(320, 180, 1000, 1000, 'land'); 
		
	this.anims.create({
		key: 'burning',
		frames: this.anims.generateFrameNumbers('campfire', { start: 0, end: 7 }), 
		frameRate: 10,
		repeat: -1  
});

this.campLocationX = 80
this.campLocationY = 300


this.campfire = this.add.sprite(this.campLocationX, this.campLocationY, 'campfire').setOrigin(0.5, 0.5);
this.campfire.setScale(1.5);
this.campfire.anims.play('burning'); 	

	this.trees = [];

	const maxTrees = 5;
	const treeMargin = 50; 
	for (let i = 0; i < maxTrees; i++) {
			let randomX, randomY, isPositionValid;
			do {
					randomX = Phaser.Math.Between(50, 590);
					randomY = Phaser.Math.Between(90, 310);
					
					isPositionValid = true; 
					
					// Check if the new tree is too close to any of the existing trees
					this.trees.forEach(tree => {
							const distance = Phaser.Math.Distance.Between(randomX, randomY, tree.x, tree.y);
							if (distance < treeMargin) {
									isPositionValid = false;
							}
					});

			} while (!isPositionValid); // Keep finding a valid position if the current one is invalid

			// Add the tree after finding a valid position
			const tree = this.add.image(randomX, randomY, 'tree');
			tree.setScale(1.5); 
			tree.setDepth(1);
			this.trees.push(tree); // Add to the trees array
	}



	this.player = this.physics.add.sprite(100, 100, 'player');
	this.player.setDepth(2); 


	this.anims.create({
			key: 'walk-down',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
	});

	this.anims.create({
			key: 'walk-left',
			frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
			frameRate: 10,
			repeat: -1
	});

	this.anims.create({
			key: 'walk-right',
			frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
			frameRate: 10,
			repeat: -1
	});

	this.anims.create({
			key: 'walk-up',
			frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
			frameRate: 10,
			repeat: -1
	});

	this.anims.create({
			key: 'chopping',
			frames: this.anims.generateFrameNumbers('actions', { start: 0, end: 5 }), 
			frameRate: 10,
			repeat: -1
	});
	this.anims.create({
		key: 'chopping2',
		frames: this.anims.generateFrameNumbers('actions', { start: 6, end: 10 }), 
		frameRate: 10,
		repeat: -1
});
this.anims.create({
	key: 'chopping3',
	frames: this.anims.generateFrameNumbers('actions', { start: 11, end: 15 }), 
	frameRate: 10,
	repeat: -1
});


	this.cutTimerText = this.add.text(16, 16, '', {
			fontSize: '18px',
			fill: '#fff'
	});

	this.playerRest = this.add.text(180, 180, '', {
		fontSize: '18px',
		fill: '#fff'
});

	 this.stamina = 20
	this.staminaText = this.add.text(this.cameras.main.width - 160, 16, `Stamina: ${this.stamina}`, {
		fontSize: '18px',
		fill: '#fff',
		align: 'right'
});

	// Initialize a timer event
	this.timerEvent = null;
}
function update() {
	const cursors = this.input.keyboard.createCursorKeys();
	let isPlayerMoving = false;
	
	const visionDistance = 1000;
	let nearestTree = null;
	let minDistance = visionDistance;
	
	// Find the nearest tree
	this.trees.forEach(tree => {
			const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, tree.x, tree.y);
			if (distance < minDistance) {
					minDistance = distance;
					nearestTree = tree;
			}
	});
	
	if (nearestTree) {
    const speed = 100; // Adjust speed as needed

		if (this.stamina === 0) {
			this.cutTimerText.setText('Not enough stamina. Woodcutter resting...');
	
			const directionX = this.campLocationX - this.player.x;
			const directionY = this.campLocationY - this.player.y;
			const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
			const normalizedX = directionX / magnitude;
			const normalizedY = directionY / magnitude;
			const speed = 100; // Adjust speed as needed
	
			this.player.setVelocity(normalizedX * speed, normalizedY * speed);
	
			// Determine the direction for animation
			if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
					// Moving more horizontally
					this.player.anims.play(normalizedX > 0 ? 'walk-right' : 'walk-left', true);
			} else {
					// Moving more vertically
					this.player.anims.play(normalizedY > 0 ? 'walk-down' : 'walk-up', true);
			}
	
    } else {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearestTree.x, nearestTree.y);
        this.player.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
            this.player.anims.play(Math.cos(angle) > 0 ? 'walk-right' : 'walk-left', true);
        } else {
            this.player.anims.play(Math.sin(angle) > 0 ? 'walk-down' : 'walk-up', true);
        }
        isPlayerMoving = true;

			}


					const cutDistance = 10;
					if (minDistance < cutDistance) {
							this.player.setVelocity(0);
							this.player.anims.stop();
	
							if (this.stamina > 0) {	

									this.player.anims.play('chopping', true);
	
									if (!this.timerEvent) {
											let countdown = 5;
											this.cutTimerText.setText(`Cutting: ${countdown} seconds`);
	
											this.timerEvent = this.time.addEvent({
													delay: 1000,
													callback: () => {
															countdown--;
															this.cutTimerText.setText(`Cutting: ${countdown} seconds`);
															if (countdown <= 0) {
																	this.cutTimerText.setText('Tree cut down!');
																	nearestTree.destroy(); // Remove the tree
																	this.timerEvent.remove(false);
																	this.timerEvent = null;
																	this.player.anims.stop();
																	this.trees = this.trees.filter(t => t !== nearestTree);
	
																	this.stamina -= 10;
																	this.stamina = Phaser.Math.Clamp(this.stamina, 0, 100);
																	this.staminaText.setText(`Stamina: ${this.stamina}`);
	
																	if (this.stamina === 0) {
																		this.time.delayedCall(10000, () => {
																				this.stamina = 100;
																				this.staminaText.setText(`Stamina: ${this.stamina}`);
																				this.playerRest.setText('');
																		});
																	}
	
																	const treeRespawnDelay = 15000; // 15 seconds
																	const treeMargin = 50; // Minimum distance between trees
	
																	this.time.delayedCall(treeRespawnDelay, () => {
																			let randomX, randomY, isPositionValid;
	
																			do {
																					randomX = Phaser.Math.Between(50, 590);
																					randomY = Phaser.Math.Between(90, 310);
	
																					isPositionValid = true;
	
																					this.trees.forEach(tree => {
																							const distance = Phaser.Math.Distance.Between(randomX, randomY, tree.x, tree.y);
																							if (distance < treeMargin) {
																									isPositionValid = false;
																							}
																					});
	
																			} while (!isPositionValid);
	
																			const newTree = this.add.image(randomX, randomY, 'tree');
																			newTree.setScale(1.5);
																			newTree.setDepth(1);
																			this.trees.push(newTree);
																	}, [], this);
															}
													},
													callbackScope: this,
													loop: true
											});
									}
							} 
					}
				}

 
    }


		






const config = {
	type: Phaser.AUTO,
	width: 640,
	height: 360,
	backgroundColor: "b9eaff",
	physics: {
			default: 'arcade',
			arcade: {
					gravity: { y: 0 },  // No gravity for this top-down game
					debug: false
			}
	},
	scene: {
			preload,
			create,
			update
	}
}

const game = new Phaser.Game(config);
