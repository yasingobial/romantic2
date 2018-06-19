var mongoose = require('mongoose');

var imageschema=mongoose.Schema({
    name:{
      type:String,
      required: true
    },
    originalname:{
      type:String,
      required: true
    },
    type:{
      type:String,
      require : true
    },
    created:{
      type:Date,
      default:Date.now
    },
    download:{
      type:Number
    },
    views:{
      type:Number
    }
});


module.exports = mongoose.model('image',imageschema);
