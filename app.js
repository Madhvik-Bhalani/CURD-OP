require("dotenv").config()
// db and model
require("./db/conn.js")
const upmodel = require("./db/upmodel")
const delemodel = require("./db/delete")
// 
const hbs = require("hbs")
const path = require("path")

const express = require("express")
const app = express()

staticpath = path.join(__dirname, "./static")
app.use(express.static(staticpath))

app.set("view engine", "hbs")
viewpath = path.join(__dirname, "./templates/views")
app.set("views", viewpath)
hbs.registerPartials(path.join(__dirname, "./templates/partials"))

// for req.body
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// ck parser
const ck = require("cookie-parser")
app.use(ck())

// bcrypt
const bcrypt = require("bcryptjs")



app.get("/", async (req, res) => {
    try {
        res.render("index")
    } catch (error) {
        res.statusCode = 404
        res.send(error)
    }
})

// sign up
app.get("/signup", async (req, res) => {
    try {
        res.render("signup.hbs")
    } catch (error) {
        res.send(error)

    }

})
app.post("/signup", async (req, res) => {
    try {
        
        if (req.body.pass == req.body.cpass) {

            const data = new upmodel({
                name: req.body.name,
                mail: req.body.mail,
                mno: req.body.mno,
                pass: req.body.pass
            })
           

            const token = await data.gentoken()
            await data.save()
            //    store token 2nd method (1st in dynamic backend folder)
            await upmodel.updateOne({ mail: req.body.mail }, { $set: { token: token } })

            res.cookie("uptoken", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true
            })

            res.render("index.hbs")
        } else {
            res.send("pass and cpass not matched")
        }
    } catch (error) {
        res.send("sign up" + error)
    }
})
app.get("/signin", async (req, res) => {
    try {
        res.render("signin.hbs")
    } catch (error) {
        res.send(error)

    }

})

app.post("/signin", async (req, res) => {
    try {
        const mail = req.body.mail
        curpass = req.body.pass;
        // for delete req
        if (await delemodel.findOne({ mail })) {
            const mdata = await delemodel.findOne({ mail })
            const data3 = new upmodel({
                name: mdata.name,
                mail: mdata.mail,
                mno: mdata.mno,
                pass: mdata.pass,
                token: mdata.token

            })
            await upmodel.insertMany([data3])
            await delemodel.deleteOne({ mail: mail })


        }
        // for check in sign up
        const data = await upmodel.findOne({ mail })

        uppass = data.pass

        const valid = await bcrypt.compare(curpass, uppass)

        if (valid) {
            // gentoken
            const token = await data.gentoken()
            //    set cookie
            res.cookie("intoken", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true
            })

            //    clear sign up ck
            res.clearCookie("uptoken")
            // update token
            await upmodel.updateOne({ mail }, { $set: { token: token } })
            res.render("index")

        } else {
            res.send("details not match")
        }
    } catch (error) {
        res.send("sign in=>AC does not exist" + error);

    }
})

// delete
const auth = require("./auth")
app.get("/delete", auth, async (req, res) => {
    try {
        res.render("delete.hbs")
    } catch (error) {
        res.send("delete error" + error);

    }

})

app.post("/delete", async (req, res) => {
    try {
        const mail = req.body.mail;
        const data2 = await upmodel.findOne({ mail })

        const valid=await bcrypt.compare(req.body.pass,data2.pass)
        
        // save to another
        if(valid){
            const data = new delemodel({
                name: data2.name,
                mail: data2.mail,
                mno: data2.mno,
                pass: data2.pass,
                token: data2.token,
    
            })
            await data.save()

         
            // delete from umodel
            await upmodel.deleteOne({ mail: mail })
            setTimeout(async () => {
                await delemodel.deleteOne({ mail: mail })
    
            }, 120000);
    
    
    
            res.render("index")

        }
        else{
            res.send("details does not match")
        }


    } catch (error) {
        res.send(`delete error=>${error}`)
    }
})
// update data
app.get("/update", async (req, res) => {
    try {
        res.render("update.hbs")
    } catch (error) {
        res.send(`update error=>${error}`)

    }
})

app.post("/update", async (req, res) => {
    try {
        const mail = req.body.mail
        const data = await upmodel.findOne({ mail })
        
        const pass = data.pass
        const valid = await bcrypt.compare(req.body.pass, pass)
        if (valid) {
            
            res.render("udata.hbs", {
                name: data.name,
                mail: data.mail,
                mno: data.mno
            })
        }
        else {
            res.send("details does not match")
        }
    } catch (error) {

        res.send(`update error=>${error}`)

    }
})
// new data update
app.post("/udata", async (req, res) => {
    try {
        const mail = req.body.mail
        uname = req.body.name
        mno = req.body.mno
        pass = req.body.pass
        if ((mno.length == 10 && mno.toString().charAt(0)>=7) && (uname.length >= 3 && uname.length<=20) && (pass.length >= 3)) {
            hashpass = await bcrypt.hash(pass, 12)
            await upmodel.updateOne({ mail }, { $set: { name: req.body.name, mno: req.body.mno, pass: hashpass } })
            res.render("index")

        }
        else {
            res.send("fill all data\n1.name and pass must be contain atlest 3 char\n2.mno must be 10 digits (first char should be >=7)")
        }




    } catch (error) {
        res.send(`new data=>${error}`)

    }
})
// logout
app.get("/logout", async (req, res) => {
    try {
        res.clearCookie("uptoken")
        res.clearCookie("intoken")
        res.render("index")
    } catch (e) {
        res.send("log out error" + e);
    }
})
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`server start at ${port}`);
})