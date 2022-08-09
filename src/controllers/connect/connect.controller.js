const Client = require("../../../api/ssh2-sftp-client")
const path = require("path")
let client = new Client()

class Connect{

    getConnect(req,res){
        let hostname = req.body.hostname
        let username = req.body.username
        let password = req.body.password
		let connected = req.session.connected
		console.log("connexion ...")
        if(hostname && username && password){
			try{
			
				client.connect({
				hostname:hostname,
				 port:22,
				 username:username,
				 password:password 
				}).then(function(){
					//set host information
					console.log("hererererere!!!!")
					req.session.host = {
						hostname:hostname,
						port:22,
						username:username,
						password:password 
					}
					try{
						client.cwd().then(function(home){
							//if cwd function successed
							
							req.session.path ={
								home:home,
								sep:client.remotePathSep
							}
							client.end().then(function(){
							//if all process successed
								res.json({message:"success",isSuccess:true,remote:{host:req.session.host,path:req.session.path}})
								
							}).catch(function(err){
							//if end connexion failed	
								
								res.json({message:"error while trying to close connexion",isSuccess:false})
							})	
						}).catch(function(err){
							//if cwd function failed
							
							res.json({message:"error while trying to get path info",isSuccess:false})
						})
						
					}catch(err){ 
						res.send(err)
					}
					
				}).catch(function(err){
					//connexion error 
						res.setStatus(401)
						res.json({message:"error while trying to connect",isSuccess:false})
						 
						
				})
				
			}catch(error){
				res.json({message:"error ...."})
			}
           
        }else{
            res.json({message:"Field are not valid"})
        }
    }

}
module.exports = new Connect()
