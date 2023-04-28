const mongoose=require("mongoose");
const connectDB=async()=>{
    return mongoose
    .connect("mongodb://0.0.0.0/contact")
    .then(()=>console.log(`connection to database established....`))
    .catch((err)=>console.log(err));
};

module.exports=connectDB;