"use strict";

var originalPlayerInput;
var playerInput;
var inputList; 

function printOut(content){//Prints content on screen
	$("#main-area").append("<p></p>");
	$("#main-area p").last().append(content);
	$("body").animate({ scrollTop: $("#main-area").height() });
}

function submitCommand(){//Writes command to variable and prints it on screen
	originalPlayerInput = $("#command-line").val();

	$("#command-line").val("");

	if(originalPlayerInput === ""){ //Don't show anything on screen if the player hits enter without inputting a command
		return
	}else{
		printOut("> " + originalPlayerInput);
	}

}

function sprintf(str) {
	var args = Array.prototype.slice.call(arguments);
	return args.shift().replace(/%(s|d)/g, function(){
	return args.shift();
	});
}

function searchArray(item, array){//Search array for item with a name property, returns item
	
	var searchResult = null;

	for(var i = 0;i < array.length;i++){ 

		var nameList = array[i].name.split(" "); //If user only types last word of item (e.g. 'berries' instead of 'poison berries') accept that answer

		if(item === array[i].name || (item === "the " + array[i].name) || item === nameList[nameList.length - 1] || (item === "the " + nameList[nameList.length - 1]) ){
			var searchResult = array[i];
		}else if(array[i].synonyms != undefined){ //Check to see if object has any synonyms. If user types a synonym, return the object
			for(var j = 0;j < array[i].synonyms.length;j++){

				var synonymList = array[i].synonyms[j].split(" "); //If user only types last word of an item's synonym (e.g. 'girl' instead of 'little girl') accept that answer

				if(item === array[i].synonyms[j] || item === "the " + array[i].synonyms[j] || item === synonymList[synonymList.length - 1] || item === "the " + synonymList[synonymList.length - 1] ){
					var searchResult = array[i];
				}	

			}
		}
	}

	return searchResult;
}

function processInput(){//Determines what to do with the command

	playerInput = originalPlayerInput.toLowerCase();

	inputList = playerInput.split(" ");

    switch(inputList[0]) {
    	case "": //Don't show anything on screen if the player hits enter without inputting a command
	        return
        break;
        case "look":
	        player.look();
        break;
        case "attack":
        case "hit":
        case "punch":
        case "kill":
	        player.attack();
        break;
        case "inv":
        case "inventory":
	        player.viewInv();
        break;
        case "eat":
	        player.eat();
        break;
        case "drop":
	        player.drop();
        break;
        case "get":
        case "pick":
        case "take":
	        player.take();
        break;
        case "help":
        	player.getHelp();
        break;
        case "talk":
	        player.talk();
        break;
        case "die":
	        player.gameOver();
        break;
        case "go":
        case "move":
        case "exit":
        case "north":
        case "n":
        case "west":
        case "w":
        case "east":
        case "e":
        case "south":
        case "s":
	        player.move();
        break;

        default: printOut("'" + originalPlayerInput + "' is not a valid command.");
    }
}



$(document).keydown(function(e) { //Enter Key submits whatever is in the command-line
    switch(e.which) {
        case 13: // Enter Key
	        submitCommand();
	        processInput();
	        setTimeout(function(){
	        	computerTurn();
	        }, 1000);
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});