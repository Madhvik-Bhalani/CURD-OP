const mongoose=require("mongoose")
const validator=require("validator")
const unival=require("mongoose-unique-validator")

const scm=new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20,


    },
    mail: {
        type: String,
        required: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error;
            }

        }
    },
    mno: {
        type: Number,
        required: true,
        unique: true,
        validate(val) {
            if (val.toString().length < 10) {
                throw new Error;
            }

        }
    },
    pass: {
        type: String,
        required: true
    },
    time: {
        type: String,
        default: new Date().toString()
    },
    token: {
        type: String
    }
})
scm.plugin(unival)
const delemodel=new mongoose.model(`${process.env.DMOD}`,scm)

module.exports=delemodel