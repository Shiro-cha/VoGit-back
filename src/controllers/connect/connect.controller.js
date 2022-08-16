const Client = require("../../../api/ssh2-sftp-client")
const path = require("path")
const fs = require("fs")
let client = new Client()

class Connect{

    getConnect(req,res){
        let hostname = req.body.hostname
        let username = req.body.username
        let password = req.body.password
		let connected = req.session.connected
		console.log("connexion ...")
        if(hostname && username && password){
			console.log("hererererere!!!!")
			try{
			
				client.connect({
				hostname:hostname,
				 port:22,
				 username:username,
				 password:password 
				}).then(function(){
					//set host information
					console.log("hererererere!!!!")
					let host = {
						hostname:hostname,
						port:22,
						username:username,
						password:password 
					}
					try{
						client.cwd().then(function(home){
							//if cwd function successed
							
							let pathInfo ={
								home:home,
								sep:client.remotePathSep
							}
							fs.writeFile(path.join(__dirname,"../../../data/session.json"),JSON.stringify({host:host,path:pathInfo}),function(err){
						console.log("writiing file")
								
								client.end().then(function(){
									//if all process successed
									res.json({message:"success",isSuccess:true,remote:{host:host,path:pathInfo}})
									
								}).catch(function(err){ 
									//if end connexion failed	
									
									res.json({message:"error while trying to close connexion",isSuccess:false})
								})	
								
								
							})
						
						}).catch(function(err){
							//if cwd function failed
							console.log("error path info")
							res.json({message:"error while trying to get path info",isSuccess:false})
						})
						
					}catch(err){ 
						res.send(err)
					}
					
				}).catch(function(err){
					//connexion error 
						res.status(401)
						res.json({message:"error while trying to connect",isSuccess:false})
						 
						
				})
				
			}catch(error){
				if(error){
					throw error
				}
				res.status(403)
				res.json({message:"error ...."})
			}
           
        }else{
			res.status(401)
            res.json({message:"Field are not valid"})
        }
    }
    removeConnexion(req,res){
		fs.writeFile(path.join(__dirname,"../../../data/session.json"),"",function(err){
			if(err){
				res.json({message:"Logout failed",isSuccess:false})
			}else{
				res.json({message:"Logout success",isSuccess:true})
			}
		})
	}

}
module.exports = new Connect()
