module.exports = function(app){
    app.use("/files",require("./files/files.router"))
    app.use("/connect",require("./connect/connect.router"))
    app.use("/transfert",require("./download/download.router"))
	app.use("/svc",require("./svc/svc.router"))
}
