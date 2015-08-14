Spawn.prototype.mayDrainEnergy = function() {
    return (this.memory.energyAllowDrain === undefined || this.memory.energyAllowDrain) && this.energy >= this.energyCapacity;
};

Creep.prototype.getTask = function() {
    var task = null;
    if(this.memory.taskId && this.memory.taskType) {
        task = this.room.getTask(this.memory.taskId, this.memory.taskType);
        if(task === null) {
            this.memory.taskId = null;
            this.memory.taskType = null;
        }
    }
    return task;
};

Creep.prototype.getSource = function() {
    var object = null;
    if(this.memory.source) {
        object = Game.getObjectById(this.memory.source);
        if(object === null) {
            this.memory.source = null;
        }
    }
    return object;
};

Creep.prototype.setSource = function(source) {
    this.memory.source = source ? source.id : null;
};

Creep.prototype.resetSource = function() {
    this.memory.source = null;
};

Creep.prototype.resetTarget = function() {
    this.memory.target = null;
};

Creep.prototype.setTarget = function(target) {
    this.memory.target = target ? target.id : null;
};

Creep.prototype.getTarget = function() {
    var object = null;
    if(this.memory.target) {
        object = Game.getObjectById(this.memory.target);
        if(object === null) {
            this.memory.target = null;
        }
    }
    return object;
};

Creep.prototype.getCarryFree = function() {
    return (this.carryCapacity - this.carry.energy);
};

Creep.prototype.isCarryFull = function() {
    return (this.getCarryFree() <= 0);
};

Creep.prototype.setTask = function(task) {
	this.memory.task = task;
	this.resetSource();
	this.resetTarget();
};

Creep.prototype.resetTask = function() {
	this.memory.task = this.memory.taskDefault;
	this.resetSource();
	this.resetTarget();
};

Creep.prototype.resetCommands = function() {
	this.memory.commands = [];
};

Creep.prototype.appendCommand = function(command, param1, param2) {
	this.memory.commands.push({command: command, param1: param1, param2: param2});
};

Creep.prototype.prependCommand = function(command, param1, param2) {
	this.memory.commands.unshift({command: command, param1: param1, param2: param2});
};

Creep.prototype.getNextCommand = function() {
	var length = this.memory.commands.length;
	if(length > 0) {
		return this.memory.commands[0];
	}
	return null;
};

Creep.prototype.clearNextCommand = function() {
	this.memory.commands.shift();
	return;
};
