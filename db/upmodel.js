const mongoose = require("mongoose")
const unival = require("mongoose-unique-validator")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const scm = new mongoose.Schema({
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

// hashing
scm.pre("save", async function (next) {
    try {
        if (this.isModified("pass")) {
            this.pass = await bcrypt.hash(this.pass, 12)
            next()
        }
    } catch (error) {
        console.log("hash error" + error);
        
    }
})

// token
scm.methods.gentoken = async function () {
    try {
        token = await jwt.sign({ _id: this._id}, `${process.env.KEY}`)
        return token;
    } catch (e) {
        console.log("token" + e);
    }
    
    
}

const upmodel = new mongoose.model(`${process.env.SMOD}`, scm)
module.exports = upmodel