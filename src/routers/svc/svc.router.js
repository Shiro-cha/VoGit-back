const router = require("express").Router()

router.post("/init",require("../../controllers/svc/svc.controller").init)
router.post("/log",require("../../controllers/svc/svc.controller").getHistories)
router.post("/init/distant",require("../../controllers/svc/svc.distant.controller").init) 

module.exports = router
