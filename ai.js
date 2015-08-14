var _ = require('lodash');
var creeps = require('creeps');
var ai = function() {};
module.exports = ai;

/*
 * On Console do (for simulation):
 * require('ai').initRoom(Game.rooms.sim, 'build');
*/

ai.rooms = {};

ai.setupRoom = function(room, mode) {
	if(mode === 'build') {
		room.memory.miners = [];
		
		_.forOwn(room.find(FIND_SOURCES), function(source) {
			
			var x = source.pos.x;
			var y = source.pos.y;
			var data = room.lookForAtArea('terrain', y - 1, x - 1, y + 1, x + 1);
			
			for(var dx = -1; dx <= 1; dx++) {
				for(var dy = -1; dy <= 1; dy++) {
					if(data[y+dy] && data[y+dy][x+dx]) {
						var terrain = data[y+dy][x+dx][0];
						
						if(terrain === 'plain') {							
							var miner = {};
							miner.x = x+dx;
							miner.y = y+dy;
							miner.source = source.id;
							miner.creep = null;
							room.memory.miners.push(miner);
						}
					}
				}
			}
			
			/*
			_.forOwn(, function(data) {
				console.log(data);
			});
			*/
			
		});
	}
};

ai.initRoom = function(room, mode) {
	if(mode === 'build') {
		room.memory.mode = 'build';
		room.memory.taskCount = {};
		ai.updateTaskCount(room);
	}
};

ai.updateTaskCount = function(room) {
	var level = room.controller.level;
	if(room.memory.mode == 'build') {
		if(level === 1) {
			room.memory.taskCount.harvester = 3;
			room.memory.taskCount.builder = 2;
			room.memory.taskCount.defender = 0;
			room.memory.taskCount.filler = 0;
			room.memory.taskCount.store = 0;
			room.memory.taskCount.truck = 0;
			room.memory.taskCount.cable = 0;
			room.memory.taskCount.plug = 0;
		} else {
			room.memory.taskCount.harvester = 0;
			room.memory.taskCount.builder = 1;
			room.memory.taskCount.defender = 0;
			room.memory.taskCount.filler = 1;
			room.memory.taskCount.mining = room.getTaskCount('harvest');
			room.memory.taskCount.store = room.getTaskCount('store');
			room.memory.taskCount.truck = room.getTaskCount('truck');
			room.memory.taskCount.cable = 0; //room.getTaskCount('cable') + 2;
			room.memory.taskCount.plug = room.getTaskCount('plug');
		}
	}
	
	/*
	room.memory.taskCount.harvester = 0;
	room.memory.taskCount.builder = 1;
	room.memory.taskCount.defender = 0;
	room.memory.taskCount.mining = 2;
	room.memory.taskCount.store = 1;
	room.memory.taskCount.truck = 1;
	room.memory.taskCount.cable = 0;
	room.memory.taskCount.plug = 0
	*/
};

ai.getSpawn = function(room) {
	var spawns = room.find(FIND_MY_SPAWNS);
	if(spawns.length > 0) {
		return spawns[0];
	}
    return null;
};

ai.createCreep = function(room, unit, task) {
	var spawn = ai.getSpawn(room);
	var energyLimit = room.energyCapacityAvailable;
	return creeps.create(spawn, unit, task, energyLimit);
};

ai.tick = function() {

	var tick = Game.time % 10;
	
	if(tick === 0) {
	    _.forOwn(Game.rooms, function(room) {
	        if(room.memory.mode === 'build') {
	            ai.doModeBuild(room);
	        }
	    });
	}
	
	if(tick === 5) {
	    _.forOwn(Game.rooms, function(room) {
	        if(room.memory.mode === 'build') {
	            _.forOwn(room.memory.tasks, function(tasks, type) {
	            	_.forOwn(tasks, function(task, id) {
	            		if(task.creep) {
	            			var creep = Game.getObjectById(task.creep);
	            			if(creep === null) {
	            				task.creep = null;
	            			}
	            		}
	            	}); 
	            });
	        }
	    });
	}
	
	if(tick === 1) {
	    _.forOwn(Game.rooms, function(room) {
	    	if(room.memory.tasks.link) {
	            _.forOwn(room.memory.tasks.link, function(task) {
	            	var source = Game.getObjectById(task.source);
	            	var target = Game.getObjectById(task.target);
            		
	            	if(source && target && target.energy === 0 && source.energy > 0 && source.cooldown <= 0) {
	            		source.transferEnergy(target);
	            	}
	            	
	            });
	    	}
	    });
	}

};

ai.build = function() {
	
};

ai.doModeBuild = function(room) {

	var counts = {};
	
	ai.updateTaskCount(room);

    _.forOwn(room.find(FIND_MY_CREEPS), function(creep) {
        var task = creep.memory.taskDefault;
        if(counts[task] === undefined) {
        	counts[task] = 0;
        }

        counts[task]++;
    });

    _.forOwn(room.memory.taskCount, function(count, task) {
    	if(count > 0 && (counts[task] === undefined || counts[task] < count)) {
    		switch(task) {
    			case 'harvester':
    				ai.createCreep(room, 'worker', task);
    				return false;
    			case 'builder':
    				ai.createCreep(room, 'builder', task);
    				return false;
    			case 'defender':
    				ai.createCreep(room, 'defender', task);
    				return false;
    			case 'mining':
    				ai.createCreep(room, 'miner', task);
    				return false;
    			case 'store':
    				ai.createCreep(room, 'store', task);
    				return false;
    			case 'truck':
    				ai.createCreep(room, 'truck', task);
    				return false;
    			case 'cable':
    				ai.createCreep(room, 'cable', task);
    				return false;
    			case 'plug':
    				ai.createCreep(room, 'plug', task);
    				return false;
    			case 'filler':
    				ai.createCreep(room, 'filler', task);
    				return false;
    				
    		} 
    	}
    });

};
