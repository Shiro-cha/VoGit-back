let router = require("express").Router()

router.post("/verify/download",require("../../controllers/download/download.controller").verifyReposDownload)
router.post("/verify/upload",require("../../controllers/download/download.controller").verifyReposUpload)
router.post("/download",require("../../controllers/download/download.controller").getDownload)

module.exports = router 
