"use strict";

var player = {
	HP: 15,
	maxHP: 15,
	damage: 1,
	gold: 0,
	location: [overWorld, 0, 0, 0],
	inventory: [],
	primaryWeapon: null,
	look: function(){
		var currentLocation = getAreaByLocation[player.location];
		
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

		var currentRoomEntities = getAreaByLocation[player.location].entities;
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

			getAreaByLocation[player.location].entities.push(item);
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
		
		var item = getObjectFromArray(target, getAreaByLocation[player.location].entities);

		if(item.name != undefined && target != undefined && item.takeable){

			playerTurnWasAnAction = true;

			printOut(item.name + " added to inventory.");

			this.inventory.push(item);
			getAreaByLocation[player.location].entities.splice(getAreaByLocation[player.location].entities.indexOf(item), 1);
			

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
		target = getObjectFromArray(attemptedTarget, getAreaByLocation[player.location].entities);

		if(target.alive && target.dialogue != undefined){

			playerTurnWasAnAction = true;

			printOut(target.dialogue);
		}else if(target.dialogue === undefined || target.alive === false){
			printOut("You can't talk to '" + attemptedTarget + "'!");
		}else{
			printOut("Talk error");
		}
	},
	move: function(){ //Method for the player to move around the map

		var mapSize = 7; //Amount of tiles in the map is this value squared

		if(inputList[0] === "exit" && getAreaByLocation[player.location].defaultExit != undefined){ //If room has a defaultExit property, player typing exit sends them in that direction
			var direction = getAreaByLocation[player.location].defaultExit;
		}else if(inputList[0] === "go" || inputList[0] === "move"){

			if(inputList[1] === "outside"){
				var direction = getAreaByLocation[player.location].defaultExit;
			}else{
				var direction = inputList.slice(1, inputList.length).join(" ");
			}

		}else{
			var direction = inputList.slice(0, inputList.length).join(" ");
		}

		var currentLocation = getAreaByLocation[player.location].position;

		if(direction === "north" || direction === "n"){
			if(getAreaByLocation[player.location].blockedExits.north === undefined){ //If desired location is not blocked, move in that direction

				playerTurnWasAnAction = true;

				var destination = currentLocation -= mapSize;

				if(destination < 1){ //Map boundry check
					printOut("You can't go in that direction!")
				}else{ //Move player
					this.location = "room" + destination.toString();
					this.look();
				}	
			}else{
				printOut(getAreaByLocation[player.location].blockedExits.north); //If desired location is blocked, display error message written for that direction
			}

		}else if(direction === "west" || direction === "w"){
			if(getAreaByLocation[player.location].blockedExits.west === undefined){

				playerTurnWasAnAction = true;

				var destination = currentLocation -= 1;
				
				if(destination % mapSize === 0){
					printOut("You can't go in that direction!")
				}else{
					this.location = "room" + destination.toString();
					this.look();
				}
			}else{
				printOut(getAreaByLocation[player.location].blockedExits.west);
			}
		}else if(direction === "east" || direction === "e"){
			if(getAreaByLocation[player.location].blockedExits.east === undefined){

				playerTurnWasAnAction = true;

				var destination = currentLocation += 1;
				
				if((destination - 1) % mapSize === 0){
					printOut("You can't go in that direction!")
				}else{
					this.location = "room" + destination.toString();
					this.look();
				}
			}else{
				printOut(getAreaByLocation[player.location].blockedExits.east);
			}
		}else if(direction === "south" || direction === "s"){
			if(getAreaByLocation[player.location].blockedExits.south === undefined){

				playerTurnWasAnAction = true;

				var destination = currentLocation += mapSize;
				
				if(destination > Math.pow(mapSize, 2)){
					printOut("You can't go in that direction!")
				}else{
					this.location = "room" + destination.toString();
					this.look();
				}
			}else{
				printOut(getAreaByLocation[player.location].blockedExits.south);
			}
		}else{
			printOut("'" + direction + "' is not a valid direction!");
		}
	},
	getHelp: function(){
		printOut(getAreaByLocation[player.location].availableCommands);
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