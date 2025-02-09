const mongoose = require(`mongoose`);

const LandlordSchema_OTP = new mongoose.Schema({
    name : {type : String, required : true, trim : true},
    email : {type : String, required : true, trim : true, unique : true}, 
    password : {type : String, required : true},
    OTP : {type : String},
    propertyList : {type : Array, default : []},
    createdat : {type : Date, default : Date.now, expires : 300}
});

module.exports = mongoose.model("LandLord_OTP", LandlordSchema_OTP);
