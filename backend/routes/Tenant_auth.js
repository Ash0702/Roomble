const express = require(`express`)
const Tenant = require(`../models/Tenant_models`)
const {Landlord_OTP, Tenant_OTP} = require(`../models/OTP_models`)
const router = express.Router();
const bcrypt = require(`bcrypt`)
const Sendmail = require(`../helper_funcs/mailSender`)
// const authMiddleware = require("../middleware/auth-middleware");

/*Contains authenticate/Tenant_Login, authenticate/Tenant_register, authenticate/verifyTenant */

async function Hashpassword(plainPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}

async function ComparePassword(enteredPassword, storedHash) {
    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    return isMatch;
}

router.post(`/Tenant_register`,async (req, res) => {
    try {
        const { name, email, password, locality, gender, religion, alcohol, veg, pets } = req.body;
        const checkExistingUser = await Tenant.findOne({$or: [ { email }]});
        if(checkExistingUser){
            res.status(400).json({
                succcess : false,
                message : `An user already exists with the given credentials`,
                status : `400`
            })
        }
        else{

            //If the user again requests OTP this should handle it, it updates the TenantSchema with a new OTP. The frontend guys can keep a minimum
            //time limit to requests OTP.Tenant_OTP schema expires in 5mins
            const checkExistingUser_withOTP = await Tenant_OTP.findOne({$or: [ { email }]});
            if(checkExistingUser_withOTP){
                let new_OTP = (Math.floor(100000 + Math.random() * 900000)).toString()
                await Sendmail(email, `Welcome once again to Roomble`, new_OTP);
                await checkExistingUser_withOTP.updateOne(
                    { email: email },  // Find user by email
                    { $set: { OTP: new_OTP } }  // Update the name field
                );
                
                res.json({
                    message : "New OTP sent"
                })
                return;
            }

            let hashedPassword = await Hashpassword(password);
            console.log(hashedPassword);

            let generated_OTP = (Math.floor(100000 + Math.random() * 900000)).toString();

            const newlyCreateduser = new Tenant_OTP({
                name : name, 
                email : email,
                password : hashedPassword,
                OTP : generated_OTP,
                locality : locality,
                religion : religion,
                alcohol : alcohol,
                pets : pets,
                veg : veg,
                gender : gender
            })

            //Creating a Landlord OTP type schema and saving it
            await newlyCreateduser.save();
            
            if (newlyCreateduser) {
                await Sendmail(email, `Welcome to Roomble!!`, `Your OTP is ${generated_OTP}`);
                res.redirect(`authenticate/verifyTenant/${newlyCreateduser._id}`);
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


router.post(`/verifyTenant/:id`, async (req, res) => {
    try {
        const {Entered_OTP} = req.body;
        const userid = req.params.id;
        if(!userid){
            res.json({
                message : "OTP isn't generated, Try again"
            })
        }
        else{
            const Tenant_withOTP = await Tenant_OTP.findById(userid);
            //If cannot find user in Tenant_OTp schema
            if(!Tenant_withOTP){
                res.status(404).json({
                    success : false,
                    message : "Your session has expired"
                })
            }
            else{
                //Pretty self explanatory lines..
                if(Entered_OTP === Tenant_withOTP.OTP){

                    const newTenant = new Tenant({
                        name : Tenant_withOTP.name,
                        email :Tenant_withOTP.email,
                        password : Tenant_withOTP.password,
                        locality : Tenant_withOTP.locality,
                        gender : Tenant_withOTP.gender,
                        religion : Tenant_withOTP.religion,
                        alcohol : Tenant_withOTP.alcohol,
                        veg : Tenant_withOTP.veg,
                        pets : Tenant_withOTP.pets,
                      
                    })

                    await newTenant.save();

                    res.status(201).json({
                        success : true,
                        message : "User successfully registered"

                    })
                }
            }
        }
    } catch(e){
        console.log(`Motherfucking error occureed`,e);
        res.status(500).json({
            success : false,
            message : "Some error in server"
        })
    }
})



router.post(`/Tenant_login`, async (req, res) => {
    try {
        const { email, password } = req.body;
        let enteredPassword = password;
        const findTenant = await Tenant.findOne({$or: [ { email }]});
        if(!findTenant){
            res.status(404).json({
                success : false,
                message : "No user exits.",
                status : "404"
            })
        }
        else{
            let result = await ComparePassword(enteredPassword, findTenant.password);
            
            if( result){
                res.status(200).json({
                    success : true,
                    name : findTenant.name,
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
