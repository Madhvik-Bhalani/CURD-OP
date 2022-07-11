const mongoose=require("mongoose")
const con=async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}`)
       console.log("connection done.!");
    } catch (error) {
        console.log("connection error"+error);
        
    }
}

con()