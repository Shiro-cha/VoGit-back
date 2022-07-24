let router = require("express").Router()

router.post("/",require("../../controllers/files/files.controller").getFiles)

module.exports = router