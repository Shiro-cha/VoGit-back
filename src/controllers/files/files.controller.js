const path = require("path")
const fs = require("fs")
const Client = require("../../../api/ssh2-sftp-client")
let client = new Client()

class Files{

    getFiles(req,res){
		
		//get session 
		
		fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
			if(!err){
				let session = JSON.parse(data.toString())
				if(session){
					
					//path to list the content
					const path = req.body.path || session.path.home
					let host = session.host
					
					// if user in not the remote
					
					const hostname = req.body.hostname
					if(hostname){
						host.hostname=hostname
					}
					
					
					//the host connexion information
					
					
					
					//only if the client have set the host information
					
					if(host){
						
						client.connect(host).then(function(){
							
							//get the list of the remote path
							return client.list(path)
						}).then(function(files){
							
							//if there is some file send the files as response 
							
							if(files){
								
								// response if there are file to list
								
								client.end().then(function(){
									//if all process successed
									for(let i = 0; i < files.length;i++){
										if(files[i].type!=="d"){
											
											if(files[i].name.lastIndexOf(".") != -1 && files[i].name.lastIndexOf(".") !==0){
												files[i].type = files[i].name.slice(files[i].name.lastIndexOf(".")+1,files[i].name.length)
											}
											
										}
										files[i].path = path
									}
									
									res.json({files:files,isSuccess:true})
									
								}).catch(function(err){
									//if end connexion failed	
									
									res.json({message:"error while trying to close connexion",isSuccess:false})
								})
							}else{
								
								// resopnse if there are no file to list
								
								res.json({message:`There is no file ${path}`,isSuccess:false})
							}
						}).catch(function(err){
							
							//if there are some error while listing files
							if(err) throw err
							client.end().then(function(){
								res.json({message:"Folder not found or not a folder",isSuccess:false})
							})
							
							
						}).catch(function(err){
							
							//if there are some error while connection to remote host
							res.json({message:"connexion error"})
						})
						
						
					}else{
						res.json({message:"You are not connected to any host"})
					}			
					
					
					
				}else{
					res.status(401)
					res.send("Session unauhtorized")
				}	
			}else{
				res.status(500)
				res.send("error on the server")
			}
			
		})
		
		
        //connect with ssh protocole to the remote host
    }

}
module.exports = new Files()
