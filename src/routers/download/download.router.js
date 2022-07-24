let router = require("express").Router()

router.post("/",require("../../controllers/download/download.controller").getDownload)

module.exports = router
