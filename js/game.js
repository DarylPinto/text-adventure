"use strict";
//forEach
//map
//Filter
//join
//keys
var playerTurnWasAnAction;

var player = {
	HP: 15,
	maxHP: 15,
	damage: 1,
	gold: 0,
	location: null,
	inventory: [],
	primaryWeapon: null,
	look: function(){
		var currentLocation = getAreaByLocation.apply(this, this.location);
		
		printOut("===== "+currentLocation.title+" =====")
		printOut(currentLocation.description);

		currentLocation.entities.forEach(function(entity){ //Scans current location for entities. If != false, display associated description
			if(entity.alive !== false){
				printOut(entity.env_description);
			}
		});

	},
	attack: function(){ //Method for the player to attack an entity
		
		if(inputList.indexOf("with") > -1){ //Checks if the user specified a weapon to attack with
			var attemptedTarget = inputList.slice(1, inputList.indexOf("with")).join(" ");
			var desiredWeapon = inputList.slice((inputList.indexOf("with") + 1), inputList.length).join(" ");

			this.primaryWeapon = getObjectFromArray(desiredWeapon, this.inventory);

			if(desiredWeapon === "" || desiredWeapon === null){
				printOut("You have to specify a weapon to attack with!");
			}else{
				printOut("You have no '" + desiredWeapon + "' to attack with!");
			}
			
		}else{

			// If no weapon is chosen to attack with, automatically use the strongest weapon

			var attemptedTarget = inputList.slice(1, inputList.length).join(" ");

			this.primaryWeapon = { //Temporarily set primary weapon to fists
				name: "fists",
				attack_description: "You punch %s!",
				damage: 1,
			}; 

			var mostDamage = 0;
			for(var i = 0;i < this.inventory.length;i++){ //Search inventory for weapon with highest damage value and make that the default weapon
				
				if(this.inventory[i].damage > mostDamage){

					var mostDamage = this.inventory[i].damage;

					this.primaryWeapon = this.inventory[i];
				}

			}
		}

		if(inputList[0] === "punch"){ //If player intentionally chooses to punch something, set primary weapon to fists
			var attemptedTarget = inputList.slice(1, inputList.length).join(" ");

			this.primaryWeapon = {
				name: "fists",
				attack_description: "You punch %s!",
				damage: 1,
			}; 
		}

		var currentRoomEntities = getAreaByLocation.apply(this, this.location).entities;
		var target = getObjectFromArray(attemptedTarget, currentRoomEntities);

		if(target.name && target.alive === true && attemptedTarget != undefined && this.primaryWeapon != null && this.primaryWeapon.attack_description != undefined && (desiredWeapon === undefined || getObjectFromArray(desiredWeapon, this.inventory) != "not found") ){
			
			playerTurnWasAnAction = true;

			if(target.proper_noun != true){ //Check if target is proper noun to display correct grammar
				printOut(sprintf(this.primaryWeapon.attack_description, "the " + target.name));
			}else{
				printOut(sprintf(this.primaryWeapon.attack_description, target.name));
			}
			
			target.HP -= this.primaryWeapon.damage  + this.damage;

			if(target.aggro === false){ //If enemy was passive, make them aggro now that they've been attacked
				target.aggro = true;
			}

			if(target.HP <= 0){
				target.alive = false;
				setTimeout(function(){
					printOut(target.death_message);
				}, 1000);

				if(target.spoils != undefined){

					this.inventory.push(target.spoils);

					setTimeout(function(){
						printOut(target.spoils.name + " added to inventory."); 
					}, 2000);
					
				}
			}
		}else if((this.inventory.indexOf(getObjectFromArray(desiredWeapon, this.inventory)) != -1) && (this.primaryWeapon.damage === undefined || this.primaryWeapon.attack_description === undefined)){
			printOut("'" + desiredWeapon + "' isn't a weapon!");
		}else if(attemptedTarget === undefined || attemptedTarget === ""){
			printOut("You need to specify a target to attack!")
		}else if(target.name === undefined || target.alive === false){
			printOut("There is no '" + attemptedTarget + "' to attack!");
		}else if(target.HP === undefined){
			printOut("You can't attack that!")
		}else{
			console.log("Attack error");
		}		
	},
	eat: function(){ //Method for the player to eat an item from inventory
		var target = inputList.slice(1, inputList.length).join(" ");
		var food = getObjectFromArray(target, this.inventory);

		if(food.name != undefined && target != undefined && food.edible){

			playerTurnWasAnAction = true;

			printOut("You ate the " + target + "!");
			this.HP += getObjectFromArray(food.name, this.inventory).nutrition;
			this.inventory.splice(this.inventory.indexOf(food), 1);

			if(this.HP > this.maxHP){
				this.HP = this.maxHP;
			}else if(this.HP < 0){
				this.HP = 0;
			}

			printOut("HP: " + this.HP + "/" + this.maxHP);

			if(this.HP <= 0){
				player.gameOver();
			}			
		}else if(target === undefined || target === ""){
			printOut("You need to specify food to eat!");
		}else if(food.name === undefined){
			printOut("You have no '" + target + "' to eat!");
		}
		else if(food.edible != true){
			printOut("'" + target + "' is not edible!");
		}else{
			printOut("Eat error");
		}
	},
	drop: function(){
		var target = inputList.slice(1, inputList.length).join(" ");
		var item = getObjectFromArray(target, this.inventory);

		if(item.name != undefined && target != undefined){

			playerTurnWasAnAction = true;

			printOut("You dropped the " + target + "!");

			getAreaByLocation.apply(this, this.location).entities.push(item);
			this.inventory.splice(this.inventory.indexOf(item), 1);
			

		}else if(target === undefined){
			printOut("You need to specify an item to drop!")
		}else if(item.name === undefined){
			printOut("You have no '" + target + "' to drop!");
		}else{
			printOut("drop error");
		}
	},
	take: function(){
		if(inputList[0] === "pick" && inputList[1] === "up"){
			var target = inputList.slice(2, inputList.length).join(" ");
		}else{
			var target = inputList.slice(1, inputList.length).join(" ");
		}
		
		var item = getObjectFromArray(target, getAreaByLocation.apply(this, this.location).entities);

		if(item.name != undefined && target != undefined && item.takeable){

			playerTurnWasAnAction = true;

			printOut(item.name + " added to inventory.");

			this.inventory.push(item);
			getAreaByLocation.apply(this, this.location).entities.splice(getAreaByLocation.apply(this, this.location).entities.indexOf(item), 1);
			

		}else if(target === undefined || target === ""){
			printOut("You need to specify an item to take!")
		}else if(item.takeable != true && item.name != undefined){
			printOut("You can't take '" + target + "'!");
		}else if(item.name === undefined){
			printOut("There is no '" + target + "' to take!");
		}else{
			printOut("take error");
		}
	},
	talk: function(){
		if(inputList[1] === "to" || inputList[1] === "with"){
			var attemptedTarget = inputList.slice(2, inputList.length).join(" ");
		}else{
			var attemptedTarget = inputList.slice(1, inputList.length).join(" ");
		}
		target = getObjectFromArray(attemptedTarget, getAreaByLocation.apply(this, this.location).entities);

		if(target.alive && target.dialogue != undefined){

			playerTurnWasAnAction = true;

			printOut(target.dialogue);
		}else if(target.dialogue === undefined || target.alive === false){
			printOut("You can't talk to '" + attemptedTarget + "'!");
		}else{
			printOut("Talk error");
		}
	},
	move: function(){
		if(inputList[0] === "go" || inputList[0] === "move"){
			var direction = inputList.slice(1, inputList.length).join(" ");
		}else{
			var direction = inputList.slice(0, inputList.length).join(" ");
		}

		if(direction === "north" || direction === "n"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.north === undefined){

				playerTurnWasAnAction = true;

				if(getAreaByLocation(player.location[0],player.location[1],(player.location[2] + 1),player.location[3]) === null){ //Check to see if desired destination is not defined
					printOut("This area is out of bounds!")
				}else{
					this.location[2] += 1; //increase player's y co-ordinate by 1
					this.look();
				}	

			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.north); //If desired location is blocked, display error message written for that direction
			}
		}else if(direction === "south" || direction === "s"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.south === undefined){

				playerTurnWasAnAction = true;

				if(getAreaByLocation(player.location[0],player.location[1],(player.location[2] - 1),player.location[3]) === null){ //Check to see if desired destination is not defined
					printOut("This area is out of bounds!")
				}else{
					this.location[2] -= 1; //decrease player's y co-ordinate by 1
					this.look();
				}	

			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.south); //If desired location is blocked, display error message written for that direction
			}
		}else if(direction === "east" || direction === "e"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.east === undefined){

				playerTurnWasAnAction = true;


				if(getAreaByLocation(player.location[0],(player.location[1] + 1),player.location[2],player.location[3]) === null){
					printOut("This area is out of bounds!")
				}else{
					this.location[1] += 1; //increase player's x co-ordinate by 1
					this.look();
				}	

			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.east); //If desired location is blocked, display error message written for that direction
			}
		}else if(direction === "west" || direction === "w"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.west === undefined){

				playerTurnWasAnAction = true;


				if(getAreaByLocation(player.location[0],(player.location[1] - 1),player.location[2],player.location[3]) === null){
					printOut("This area is out of bounds!")
				}else{
					this.location[1] -= 1; //decrease player's x co-ordinate by 1
					this.look();
				}	

			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.west); //If desired location is blocked, display error message written for that direction
			}
		}else{
			printOut("'" + direction + "' is not a valid direction!");
		}
	},
	moveLegacy: function(){ //Method for the player to move around the map

		var mapSize = 7; //Amount of tiles in the map is this value squared
		var player_map = player.location[0];
		var player_x = player.location[1];
		var player_y = player.location[2];
		var player_z = player.location[3];

		if(inputList[0] === "exit" && getAreaByLocation.apply(this, this.location).defaultExit != undefined){ //If room has a defaultExit property, player typing exit sends them in that direction
			var direction = getAreaByLocation.apply(this, this.location).defaultExit;
		}else if(inputList[0] === "go" || inputList[0] === "move"){

			if(inputList[1] === "outside"){
				var direction = getAreaByLocation.apply(this, this.location).defaultExit;
			}else{
				var direction = inputList.slice(1, inputList.length).join(" ");
			}

		}else{
			var direction = inputList.slice(0, inputList.length).join(" ");
		}

		var currentLocation = getAreaByLocation.apply(this, this.location).position;

		if(direction === "north" || direction === "n"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.north === undefined){ //If desired location is not blocked, move in that direction

				playerTurnWasAnAction = true;

				if(destination < 1){ //Map boundry check
					printOut("You can't go in that direction!")
				}else{ //Move player
					this.location[2] -= 1;
					this.look();
				}	
			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.north); //If desired location is blocked, display error message written for that direction
			}

		}else if(direction === "west" || direction === "w"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.west === undefined){

				playerTurnWasAnAction = true;

				var destination = currentLocation -= 1;
				
				if(destination % mapSize === 0){
					printOut("You can't go in that direction!")
				}else{
					this.location = "room" + destination.toString();
					this.look();
				}
			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.west);
			}
		}else if(direction === "east" || direction === "e"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.east === undefined){

				playerTurnWasAnAction = true;

				var destination = currentLocation += 1;
				
				if((destination - 1) % mapSize === 0){
					printOut("You can't go in that direction!")
				}else{
					this.location = "room" + destination.toString();
					this.look();
				}
			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.east);
			}
		}else if(direction === "south" || direction === "s"){
			if(getAreaByLocation.apply(this, this.location).blockedExits.south === undefined){

				playerTurnWasAnAction = true;

				var destination = currentLocation += mapSize;
				
				if(destination > Math.pow(mapSize, 2)){
					printOut("You can't go in that direction!")
				}else{
					this.location = "room" + destination.toString();
					this.look();
				}
			}else{
				printOut(getAreaByLocation.apply(this, this.location).blockedExits.south);
			}
		}else{
			printOut("'" + direction + "' is not a valid direction!");
		}
	},
	getHelp: function(){
		printOut(getAreaByLocation.apply(this, this.location).availableCommands);
	},
	viewInv: function(){ //Method for the player to view inventory
		printOut("Inventory:");
		for(var i = 0;i < this.inventory.length;i++){
			printOut("- "+ this.inventory[i].name);
		}
	},
	gameOver: function(){
		printOut("=========");
		printOut("You died!");
		printOut("=========");
		$("#command-line").css("display", "none");
	}
}

//========Computer Turn========

function computerTurn(){

	if(playerTurnWasAnAction){ //Prevents computer from doing something when player move is not an action (A goblin won't attack you for checking your inventory)

		for(var i = 0;i < getAreaByLocation.apply(this, player.location).entities.length;i++){ //If any entities are aggro, attack the player
			if(getAreaByLocation.apply(this, player.location).entities[i].aggro === true && getAreaByLocation.apply(this, player.location).entities[i].alive === true && player.HP > 0){
					getAreaByLocation.apply(this, player.location).entities[i].attack();
			}
		}

	}

	playerTurnWasAnAction = false;
}

//========Entity Object Constructors========

function Weapon(name, synonyms, attack_description, env_description, damage){
	this.name = name;
	this.synonyms = synonyms;
	this.attack_description = attack_description;
	this.env_description = env_description;
	this.takeable = true;
	this.damage = damage;
}

function Food(name, nutrition){
	this.name = name;
	this.nutrition = nutrition;
	this.edible = true;
	this.takeable = true;

	if(this.name[this.name.length - 1] === "s"){
		this.env_description = "There are some " + this.name + " lying on the ground.";
	}else{
		this.env_description = "There is a " + this.name + " lying on the ground.";
	}
}

function Enemy(name, HP, damage, aggro, env_description, attack_message, spoils){
	this.name = name;
	this.alive = true;
	this.aggro = aggro;
	this.HP = HP;
	this.damage = damage;
	this.env_description = env_description;
	this.attack_message = attack_message;
	this.spoils = spoils;
	this.death_message = "The " + this.name + " collapsed to the ground."

	this.attack = function(){
		printOut(this.attack_message);
		player.HP -= this.damage;

		if(player.HP > player.maxHP){
			player.HP = player.maxHP;
		}else if(player.HP < 0){
			player.HP = 0;
		}

		printOut("HP: " + player.HP + "/" + player.maxHP);

		if(player.HP <= 0){
			player.gameOver();
		}	
	}
}

function Animal(name, HP, env_description, spoils){
	this.name = name;
	this.alive = true;
	this.HP = HP;
	this.env_description = env_description;
	this.spoils = spoils;

	this.death_message = "The " + this.name + " collapsed to the ground."
}

function Person(name, synonyms, HP, env_description, dialogue){
	this.name = name;
	this.synonyms = synonyms;
	this.alive = true;
	this.HP = HP;
	this.env_description = env_description;
	this.death_message = this.name + " fell to the floor and bled out."
	this.dialogue = dialogue;
	this.proper_noun = true;
}

//========Game Locations========
var overWorld = {
	maps: [
		{
			title: "overWorld",
			tiles: [
				{
					title: "Eldirsh Village - South Side",
					coords: [0,0,0],
					blockedExits: {},
					entities: [],
					maps: [
						{
							title: "House",
							tiles: [
								{
									title: "Entrance of the House",
									coords: [0,0,0],
									blockedExits: {},
									description: "The house is dark and quiet...",
									entities: []
								},
								{
									title: "Kitchen",
									coords: [1,0,0],
									blockedExits: {},
									description: "The fridge is glowing an eerie green.",
									entities: []
								}
							]
						},
						{
							title: "House",
							tiles: [
								{
									title: "Neighbor's Foyer",
									coords: [0,0,0],
									blockedExits: {},
									description: "The house is dark and quiet...",
									entities: []
								},
								{
									title: "Neighbor's Study",
									coords: [0,-1,0],
									blockedExits: {},
									description: "The fridge is glowing an eerie green.",
									entities: []
								}
							]
						}
					]
				},
				{
					title: "Eldirsh Village - North Side",
					coords: [0,1,0],
					blockedExits: {
						north: "A large barbed wire fence bordering the town blocks the way.",
						east: "A large barbed wire fence bordering the town blocks the way."
					},
					description: "The sky is engulfed in smoke. You see fire blazing out of the windows of some houses in the distance.",
					entities: [
						new Weapon(
							"wooden spear", //name
							["family spear"], //synonyms
							"You stab %s with your wooden spear!", //Attack description
							"The family spear that has for so long hung on the wall in your house is lying on the ground, caked with dried blood.", //enviornment description
							5 //damage
						),
						new Person( //name, generic_name, HP, env_description, dialogue
							"cindy", //name
							["little girl"], //synonyms
							15, //hp
							"A little girl with a look of pure horror stands alone staring at the destruction of the town. Tears are streaming down her face.", //enviornment description
							"Cindy: The goblins... they c-came back again destroyed the town. They ran off w-with a nice lady too! Wahhh!!" //dialogue
						)
					]
				}
			]
		}
	]
}


var testRoom = {
	title: "Test Room",
	coords: [99,99,99],
	blockedExits: {
		north: "This is a test room, so there are no exits.",
		west: "This is a test room, so there are no exits.",
		east: "This is a test room, so there are no exits.",
		south: "This is a test room, so there are no exits."
	},
	description: "The area by your feet is sandy. The soothing sounds of the ocean are coming from behind. Straight ahead of you there is a massive lush jungle towering above (But not really because this room is merely a simulation used for testing.)",
	entities: [
		new Enemy(
			"goblin", //name
			10, //hp
			2, //damage
			false, //aggro by default
			"Next to the jungle entrance there is a small goblin carefully picking berries from a bush.", //enviornment description
			"The goblin bites your arm!", //attack message
			new Food("berries", 2) //spoils
		),
		new Enemy(
			"witch", //name
			5, //hp
			10, //damage
			false, //aggro by default
			"A witch is circling around you in the air on her broomstick", //enviornment description
			"The witch shoots you with a fireball spell!", //attack message
			new Food("halloween candy", 4) //spoils
		),
		new Animal(
			"pig", //name
			5, //hp
			"To the right there is a pig wandering aimlessly by the waterfront.", //enviornment description
			new Food("raw porkchop", 4) //spoils
		),
		new Weapon(
			"sharp stick", //name
			["twig"], //synonyms
			"You stab %s with your sharp stick!", //Attack description
			"A sharp stick is lying on the ground.", //enviornment description
			5 //damage
		)
	]
};

var room42 = {
	position: 42,
	blockedExits: {
		north: "A large barbed wire fence borders the town. It appears to be impossible to cross.",
		east: "A large barbed wire fence borders the town. It appears to be impossible to cross."
	},
	description: "The sky is engulfed in smoke. You see fire blazing out of the windows of some houses in the distance.",
	entities: [
		new Weapon(
			"wooden spear", //name
			["family spear"], //synonyms
			"You stab %s with your wooden spear!", //Attack description
			"The family spear that has for so long hung on the wall in your house is lying on the ground, caked with dried blood.", //enviornment description
			5 //damage
		),
		new Person( //name, generic_name, HP, env_description, dialogue
			"cindy", //name
			["little girl"], //synonyms
			15, //hp
			"A little girl with a look of pure horror stands alone staring at the destruction of the town. Tears are streaming down her face.", //enviornment description
			"Cindy: The goblins... they c-came back again destroyed the town. They ran off w-with a nice lady too! Wahhh!!" //dialogue
		)
	]
};

var room49 = {
	position: 49,
	defaultExit: "north",
	blockedExits: {
		east: "\"It looks like I can't exit the house this way.\"",
		west: "\"It looks like I can't exit the house this way.\"",
		south: "\"It looks like I can't exit the house this way.\""
	},
	description: "The room is dark and lifeless. You can hear screaming coming from outside the door at the north end of the house.",
	entities: []
};

function startGame(){

	playerTurnWasAnAction = false;
	player.location = [overWorld, 0, 0, 0];

	setTimeout(function(){
		printOut("\"Mama...\"");
	}, 500);
	setTimeout(function(){
		printOut("\"What's that noise coming from outside?\"");
	}, 2000);
	setTimeout(function(){
		printOut("Mom: I don't know, sweetie. Don't be afraid. Just stay here under the blankets... e-everything is going to be alright.");
	}, 4500);
	setTimeout(function(){
		printOut("A bloodcurdling shriek can be heard faintly from the window.");
	}, 8500);
	setTimeout(function(){
		printOut("Mom: Don't move. I'm going outside to protect you.");
	}, 11000);
	setTimeout(function(){
		printOut("\"MAMA! WHY ARE YOU TAKING THE FAMILY SPEAR?\"");
	}, 15000);
	setTimeout(function(){
		printOut("\"PLEASE DON'T GO!\"");
	}, 17000);
	setTimeout(function(){
		printOut("\"Please...\"");
	}, 19500);
	setTimeout(function(){
		printOut("\"don't leave me.\"");
	}, 21000);
	setTimeout(function(){
		printOut("The door slams shut. The house is quiet.");
	}, 24000);
	setTimeout(function(){
		printOut("...");
	}, 27000);
	setTimeout(function(){
		printOut("...");
	}, 30000);
	setTimeout(function(){
		printOut("Mom: AHHH! GET- OFF ME YOU BEAST! AHHHHHH!");
	}, 34500);
	setTimeout(function(){
		player.look()
	}, 37000);
	setTimeout(function(){
		$("#command-line").css("margin-bottom", "0px");
		$("#command-line").focus();
	}, 38000);

}

function startGameIndev(){

	playerTurnWasAnAction = false;
	player.location = [overWorld, 0, 0, 0];

	player.look()
	setTimeout(function(){
		$(".command-wrapper").css("margin-bottom", "0px");
		$("#command-line").focus();
	}, 500);

}

startGameIndev();

//TODO: Fix getAreaByLocation to work with new map layouts