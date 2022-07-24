const router = require("express").Router()

router.post("/init",require("../../controllers/svc/svc.controller").init)

module.exports = router
