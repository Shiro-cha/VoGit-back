const express = require("express")
const bodyparser = require("body-parser")
const path = require("path")
const session = require("express-session")

//initilalize express app

let app = express()

//set up session middelware

app.use(session({
	resave:true,
	saveUninitialized:true,
	secret: 'keyboard cat',
	cookie: {maxAge:9900000}
}))

//set up bodyparsermiddelware

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())


//set up public folder

app.use(express.static(path.join(__dirname,"public")))

//set router

let router = require("./src/routers/index")(app)


//start server 

app.listen(process.env.PORT||3001,function(err){
    if(err) throw err
    console.log(`server start at port ${process.env.PORT || 3001} ...`)
})

