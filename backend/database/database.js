require("dotenv").config()
const mongoose = require(`mongoose`)

const password_db = "mongodb+srv://Ash0702:Ash0702@cluster0.a9jom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const Connectto_DB = async () => {
    try {
        await mongoose.connect(password_db).then(()=>{console.log(`Connected SUccessfully`)}).catch((e)=>{console.log(`Error occured`, e)});
        console.log("Database connected Successfully");
    } catch (e) {
        console.log("Error occured", e);
    }
}

module.exports = Connectto_DB;
