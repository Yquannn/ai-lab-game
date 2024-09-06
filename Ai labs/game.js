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
}

function create() {


	this.land = this.add.tileSprite(320, 180, 1000, 1000, 'land'); 

	this.trees = [];

	const maxTrees = 10;
	const treeMargin = 50; 
	for (let i = 0; i < maxTrees; i++) {
			let randomX, randomY, isPositionValid;
			do {
					randomX = Phaser.Math.Between(50, 590);
					randomY = Phaser.Math.Between(70, 310);
					
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
			key: 'chop1',
			frames: this.anims.generateFrameNumbers('actions', { start: 0, end: 3 }), 
			frameRate: 10,
			repeat: 0
	});

	this.anims.create({
			key: 'chop2',
			frames: this.anims.generateFrameNumbers('actions', { start: 4, end: 7 }), 
			frameRate: 10,
			repeat: 0 
	});	this.anims.create({
		key: 'chop3',
		frames: this.anims.generateFrameNumbers('actions', { start: 8, end: 11 }), // Adjust frame range as needed
		frameRate: 10,
		repeat: 0 // Animation will play once
});
this.anims.create({
	key: 'chop4',
	frames: this.anims.generateFrameNumbers('actions', { start: 12, end: 15 }), 
	frameRate: 10,
	repeat: 0 
});
this.anims.create({
	key: 'chop5',
	frames: this.anims.generateFrameNumbers('actions', { start: 3, end: 6 }), 
	frameRate: 10,
	repeat: 0 
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
			const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearestTree.x, nearestTree.y);
			this.player.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100);
	
			if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
					this.player.anims.play(Math.cos(angle) > 0 ? 'walk-right' : 'walk-left', true);
			} else {
					this.player.anims.play(Math.sin(angle) > 0 ? 'walk-down' : 'walk-up', true);
			}
			isPlayerMoving = true;
	
			const cutDistance = 10;
			if (minDistance < cutDistance) {
					this.player.setVelocity(0);
					this.player.anims.stop();
					
					// Check if stamina is 0
					if (this.stamina > 0) {
							this.player.anims.play('chop1', true); // Play the chopping animation
	
							// Only display the countdown if the timer hasn't started
							if (!this.timerEvent) {
									let countdown = 5;
									this.cutTimerText.setText(`Cutting: ${countdown} seconds`);
	
									// Start the countdown timer
									this.timerEvent = this.time.addEvent({
											delay: 1000,
											callback: () => {
													countdown--;
													this.cutTimerText.setText(`Cutting: ${countdown} seconds`);   
													if (countdown <= 0) {
															this.cutTimerText.setText('Tree cut down!');
															nearestTree.destroy(); // Remove the tree
															this.timerEvent.remove(false); // Stop the timer event
															this.timerEvent = null; // Reset the timer event
															this.player.anims.stop(); // Stop the chopping animation
															this.trees = this.trees.filter(t => t !== nearestTree); // Remove the tree from the array
															
															// Decrease stamina
															this.stamina -= 10;
															this.stamina = Phaser.Math.Clamp(this.stamina, 0, 100); // Ensure stamina is between 0 and 100
															this.staminaText.setText(`Stamina: ${this.stamina}`);
															
															if (this.stamina === 0) {
																	// Player needs to rest
																	this.playerRest = this.add.text(160, 160, `Woodcutter is tired. Resting...`, {
																			fontSize: '16px',
																			fill: '#fff'
																	});
	
																	// Disable player controls and stop player movement
																	this.player.setVelocity(0);
																	this.player.anims.stop();
	
																	// Rest period for 10 seconds to restore stamina
																	this.time.delayedCall(10000, () => {
																			this.stamina = 100;
																			this.staminaText.setText(`Stamina: ${this.stamina}`);
																			this.playerRest.setText(''); // Clear the rest message
																	});
	
																	// Add a delay before respawning the tree
																	const treeRespawnDelay = 15000; // 15 seconds
																	const treeMargin = 50; // Minimum distance between trees
	
																	this.time.delayedCall(treeRespawnDelay, () => {
																			let randomX, randomY, isPositionValid;
																	
																			do {
																					// Generate random positions for the new tree
																					randomX = Phaser.Math.Between(50, 590);
																					randomY = Phaser.Math.Between(70, 310);
																	
																					isPositionValid = true; // Assume position is valid at the start
																	
																					// Check if the new tree is too close to any of the existing trees
																					this.trees.forEach(tree => {
																							const distance = Phaser.Math.Distance.Between(randomX, randomY, tree.x, tree.y);
																							if (distance < treeMargin) {
																									isPositionValid = false; // If too close, mark position as invalid
																							}
																					});
																	
																			} while (!isPositionValid); // Keep finding a valid position if the current one is invalid
																	
																			// After 15 seconds, add a new tree at a valid random position
																			const newTree = this.add.image(randomX, randomY, 'tree');
																			newTree.setScale(1.5);
																			newTree.setDepth(1);
																			this.trees.push(newTree); // Add the new tree to the array
																	}, [], this);
															}
													}
											},
											callbackScope: this,
											loop: true // Ensure the timer repeats every second
									});
							}
					} else {
							this.cutTimerText.setText('Not enough stamina to cut the tree.');
							// Optionally play a sound or animation indicating the player is too tired
					}
			}
	}
	

	// Player movement control when not cutting trees
	// if (!isPlayerMoving) {
	// 		this.player.setVelocity(0);

	// 		if (cursors.left.isDown) {
	// 				this.player.setVelocityX(-100);
	// 				this.player.anims.play('walk-left', true);
	// 		} else if (cursors.right.isDown) {
	// 				this.player.setVelocityX(100);
	// 				this.player.anims.play('walk-right', true);
	// 		} else if (cursors.up.isDown) {
	// 				this.player.setVelocityY(-100);
	// 				this.player.anims.play('walk-up', true);
	// 		} else if (cursors.down.isDown) {
	// 				this.player.setVelocityY(100);
	// 				this.player.anims.play('walk-down', true);
	// 		} else {
	// 				this.player.anims.stop();
	// 		}
	// }
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
