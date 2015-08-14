Room.prototype.addTask = function(type, task) {
	var id = this.memory.tasksNextId;
	this.memory.tasksNextId++;
	
	if(this.memory.tasks[type] === undefined) {
		this.memory.tasks[type] = {};
	}
	
	this.memory.tasks[type][id] = task;
};

Room.prototype.setParking = function(x, y) {
	this.memory.parking = {x: x, y: y};
};

/*
require('rooms'); Game.rooms.W1N1.addTaskStore(14, 6, [TOP_LEFT, TOP]);
require('rooms'); Game.rooms.W1N1.addTaskTruck(14, 6);
require('rooms'); Game.rooms.W1N1.addTaskStore(9, 11, [LEFT, BOTTOM]);
require('rooms'); Game.rooms.W1N1.addTaskTruck(9, 11);

require('rooms'); Game.rooms.W1N1.addTaskCable(13, 9, LEFT);
require('rooms'); Game.rooms.W1N1.addTaskCable(14, 8, BOTTOM_LEFT);

require('rooms'); Game.rooms.W1N1.addTaskTruck(12, 9, 30, 14);

require('rooms'); Game.rooms.W1N1.addTaskTruck(12, 9, 11, 9);

require('rooms'); Game.rooms.W1N1.addTaskLink('55cdb3ac835d6e1f0ae12df3', '55cdb20382b8afe409de3e24');
*/

Room.prototype.addTaskStore = function(x, y, sources) {
	var task = {};
	task.location = {x: x, y: y};
	task.creep = null;
	task.sources = sources;
	this.addTask('store', task);
};

Room.prototype.addTaskTruck = function(sourceX, sourceY, targetX, targetY) {
	var task = {};
	task.locationSource = {x: sourceX, y: sourceY};
	task.locationTarget = {x: targetX, y: targetY};
	task.creep = null;
	this.addTask('truck', task);
};

Room.prototype.addTaskCable = function(x, y, source) {
	var task = {};
	task.location = {x: x, y: y};
	task.source = source;
	task.creep = null;
	this.addTask('cable', task);
};

Room.prototype.addTaskPlug = function(x, y, source, target) {
	var task = {};
	task.location = {x: x, y: y};
	task.source = source;
	task.target = target;
	task.creep = null;
	this.addTask('plug', task);
};

Room.prototype.addTaskLink = function(source, target) {
	var task = {};
	task.source = source;
	task.target = target;
	this.addTask('link', task);
};

Room.prototype.getTask = function(id, type) {
	if(this.memory.tasks[type] === undefined || this.memory.tasks[type][id] === undefined) {
		return null;
	}
	return this.memory.tasks[type][id];
};

Room.prototype.getTaskCount = function(type) {
	if(this.memory.tasks[type] === undefined) {
		return 0;
	}
	return _.size(this.memory.tasks[type]);
};

Room.prototype.assignFreeTask = function(type, creep) {
	
	var taskAssigned = null;
	
	if(this.memory.tasks === undefined || this.memory.tasks[type] === undefined) {
		return null;
	}
	
	_.forOwn(this.memory.tasks[type], function(task, id) {
		if(task.creep) {
			return true;
		}		
		
		task.creep = creep.id;
		
		creep.memory.taskId = id;
		creep.memory.taskType = type;
		
		taskAssigned = task;
		
		return false;
	});
	
	return taskAssigned;
};

Room.prototype.setup = function(reset) {
	
	if(this.memory.tasksNextId === undefined) {
		this.memory.tasksNextId = 0;
	}
	
	if(this.memory.tasks === undefined) {
		this.memory.tasks = {};
	}
	
	var _this = this;

	/*
	['harvest'].forEach(function(task) {
		if(_this.memory.tasks[task] === undefined) {
			_this.memory.tasks[task] = {};
		}
	});
	*/
	
	if(reset) {
		this.memory.tasks.harvest = undefined;
	}
	
	if(this.memory.tasks.harvest === undefined) {
		this.memory.tasks.harvest = {};
		
		_.forOwn(this.find(FIND_SOURCES), function(source) {
			
			var x = source.pos.x;
			var y = source.pos.y;
			var data = _this.lookForAtArea('terrain', y - 1, x - 1, y + 1, x + 1);
			
			for(var dx = -1; dx <= 1; dx++) {
				for(var dy = -1; dy <= 1; dy++) {
					if(data[y+dy] && data[y+dy][x+dx]) {
						var terrain = data[y+dy][x+dx][0];
						
						if(terrain === 'plain') {							
							var task = {};
							task.location = {x: x + dx, y: y + dy};
							task.source = source.id;
							task.creep = null;
							
							_this.addTask('harvest', task);
						}
					}
				}
			}
		
		});	
		
	}
	
};