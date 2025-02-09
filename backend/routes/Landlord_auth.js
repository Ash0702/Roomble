const express = require(`express`)
const Landlord = require(`../models/Landlord_models`)
const Landlord_OTP = require(`../models/OTP_models`)
const router = express.Router();
const bcrypt = require(`bcrypt`)
// const authMiddleware = require("../middleware/auth-middleware");

async function Hashpassword(plainPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    // console.log("Hashed Password:", hashedPassword);
    return hashedPassword;
}

async function ComparePassword(enteredPassword, storedHash) {
    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    return isMatch;
}

router.post(`/Landlord_register`,async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const checkExistingUser = await Landlord.findOne({$or: [ { email }]});
        if(checkExistingUser){
            res.status(400).json({
                succcess : false,
                message : `An user already exists with the given credentials`,
                status : `400`
            })
        }
        else{
            let hashedPassword = await Hashpassword(password);
            console.log(hashedPassword);

            const newlyCreateduser = new Landlord({
                name : name, 
                email : email,
                password : hashedPassword
            })

            await newlyCreateduser.save();
            
            if (newlyCreateduser) {
                res.status(201).json({
                  success: true,
                  message: "User registered successfully!",
                });
              } else {
                res.status(400).json({
                  success: false,
                  message: "Unable to register user! please try again.",
                });
            }
        }
    } catch (e) {
        console.log(`Error occured `, e);
        res.status(500).json({
            message : "Some error in server",
            success : false
        })
    }
})


router.post(`/Landlord_Login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        let enteredPassword = password;
        const findLandlord = await Landlord.findOne({$or: [ { email }]});
        if(!findLandlord){
            res.status(404).json({
                success : false,
                message : "No user exits.",
                status : "404"
            })
        }
        else{
            let result = await ComparePassword(enteredPassword, findLandlord.password);
            
            if( result){
                res.status(200).json({
                    success : true,
                    name : findLandlord.name,
                    message : "Successful Login"
                })
            }
            else{
                res.status(401).json({
                    status : "401",
                    message : "Wrong password, entry denied",
                    success : false
                })
            }
        }

    } catch (e) {
        console.log(`Error occured `, e);
        res.status(500).json({
            message : "Some error in server",
            success : false
        })
    }
})

module.exports = router;
