class Download{
    getDownload(req,res){
        res.send("download")
    }
}

module.exports = new Download()