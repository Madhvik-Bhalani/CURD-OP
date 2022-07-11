const jwt=require("jsonwebtoken")

const auth=async function(req,res,next){
    try {
        // uptoken=req.cookies.uptoken
        intoken=req.cookies.intoken
        data=await jwt.verify(intoken,`${process.env.KEY}`)
        // console.log(data);
        next();
    } catch (error) {
        console.log("sign in first"+error);
        res.render("outwarn.hbs")
        
    }

}


module.exports=auth