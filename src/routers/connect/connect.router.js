let router = require("express").Router()

router.post("/",require("../../controllers/connect/connect.controller").getConnect)
router.post("/logout",require("../../controllers/connect/connect.controller").removeConnexion)


module.exports = router
