let router = require("express").Router()

router.post("/",require("../../controllers/connect/connect.controller").getConnect)

module.exports = router