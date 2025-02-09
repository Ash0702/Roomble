const mongoose = require(`mongoose`)

const LandlordSchema = new mongoose.Schema({
    name : {type : String, required : true, trim : true},
    email : {type : String, required : true, trim : true, unique : true}, 
    password : {type : String, required : true},
    propertyList : {type : Array, default : []}
}, {timestamps:true});

module.exports = mongoose.model(`Landlord`, LandlordSchema);
