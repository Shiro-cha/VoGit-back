const router = require("express").Router()

//distant
router.post("/init/distant",require("../../controllers/svc/svc.distant.controller").init) 
router.post("/log/distant",require("../../controllers/svc/svc.distant.controller").getHistories) 
router.post("/checkout/distant",require("../../controllers/svc/svc.distant.controller").checkout)
router.post("/switch/distant",require("../../controllers/svc/svc.distant.controller").switchTags)
router.post("/add/distant",require("../../controllers/svc/svc.distant.controller").addContainer)

//local

router.post("/init",require("../../controllers/svc/svc.controller").init)
router.post("/containers",require("../../controllers/svc/svc.controller").getContainers)
router.post("/log",require("../../controllers/svc/svc.controller").getHistories)
router.post("/checkout",require("../../controllers/svc/svc.controller").checkout)
router.post("/switch",require("../../controllers/svc/svc.controller").switchTags)
router.post("/add",require("../../controllers/svc/svc.controller").addContainer)


module.exports = router
