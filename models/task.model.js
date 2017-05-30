'use strict';

var db = require('./database');
var Sequelize = require('sequelize');

// Make sure you have `postgres` running!

var Task = db.define('Task', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  due: Sequelize.DATE
}, {
  //---------VVVV---------  your code below  ---------VVV----------
  getterMethods: {
    timeRemaining: function() {
      if (!this.due) {
        return Infinity;
      } else {
        return (this.due - Date.now())
      }
    },

    overdue: function() {
      return (Date.now() > this.due) && !this.complete;
    }
  },

  classMethods: {
    clearCompleted: function() {
        return Task.destroy({
          where: {
            complete: true
          }
        });
      },

      completeAll: function() {
        return Task.update(
                { complete: true},
                { where: { complete: false } } )
      }
    },

    instanceMethods: {
      addChild: function(nameObj) {
        return Task.create(nameObj)
                .then(child => {
                  return child.setParent(this);
                })
      },

      getChildren: function() {
        return Task.findAll({
          where: {
            parentId: this.id
          }
        })
      },

      getSiblings: function() {
        return Task.findAll({
          where: {
            parentId: this.parentId,
            id : {$ne: this.id}
          }
        })
      }
    },

    hooks: {
      beforeDestroy: function(task, opts) {
        return Task.destroy({
          where: {
            parentId: task.id
          }
        })
      }
    }




  //---------^^^---------  your code above  ---------^^^----------
});

Task.belongsTo(Task, {as: 'parent'});





module.exports = Task;

