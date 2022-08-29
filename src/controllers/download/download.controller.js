const fs = require("fs")
const simpleGit= require("simple-git")
const {Client} = require("ssh2")
const SftpClient = require("../../../api/ssh2-sftp-client")
const path = require("path")
let os = require("os")



class Download{
	verifyReposDownload(req,res){
		
		fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
			if (err) throw err
				
				if(data.toString()!==""){
					
					let session = JSON.parse(data.toString())
					// initialize parameter for reposistory init
					const pathname = req.body.path 
					//initialize parameter for ssh connexion
					let hostname = session.host.hostname
					let username =session.host.username
					let password = session.host.password
					// check if there are something in the session file
					if(hostname && username && password && pathname){
						
						fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
							
							let myhistory =data.toString()
							let fileAlreadyExist = false
							myhistory = JSON.parse(myhistory)
							
							for( let i = 0 ; i<myhistory["distant"].length ; i++){
								if(myhistory["distant"][i].path===pathname){
									fileAlreadyExist=true
									break
								}
							}
							
							if(fileAlreadyExist){
								//container exist
								res.json({message:"Container exist" , isSuccess:true})
							}else{
								//container will be created
								
								//create a connexion
								const conn =new Client()
								
								//when the connexion is ready
								conn.on("ready",function(){
									console.log("Client::ready")
									
									//execute the shell command ` cd /path/to/new/reposistroy && git init`
									conn.exec(`cd "${pathname}" && git init `,function(err,stream){
										if (err) throw err
											
											//when the command is finish 
											stream.on("close",function(code,signal){
												
												//when  the shell return 0 (success)
												if(code===0){
													
													//end the ssh connnexion  (when the ending process is finish)
													conn.end().on("close",function(){
														console.log("endinng connexion")
														
														//saving reposistory info to the json file
														fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
															let myHistory = JSON.parse(data.toString())
															let fileAlreadyExist = false
															
															//check if the parametre in the history.json file is setup
															if(myHistory["distant"]){
																//check if file is already in the distant reposistory
																for(let i = 0;i < myHistory["distant"].length ; i++){
																	if(myHistory["distant"][i].path===pathname){
																		fileAlreadyExist=true
																		break
																	}
																}
																
																//if file exist in the history , send this message
																if(fileAlreadyExist){
																	res.send("Container already exist")
																}else{
																	
																	//if file is not in the history yet
																	myHistory["distant"].push({path:pathname})
																	fs.writeFile(path.join(__dirname,"../../../data/history.json"),JSON.stringify(myHistory),function(err){
																		if(err) throw err
																			res.json({message:"Container created automaticaly" , isSuccess:true})
																	})
																}
																
																// if the history.json file is not setup for the  action
															}else{
																res.status(403)
																res.send("error on the db file")
															}
															
														})
														
													})
													//the return code 1 mean file not found
												}else if(code===1){
													res.status(403)
													res.json({message:"file not found"})
													
													//the other return status code are unkown	
												}else{
													res.status(403)
													res.json({message:"unkwon error"})
												}
												
												
												
												
											}).on("data",function(data){
												console.log(data.toString())
											})
											
									})
									
									
									
								}).connect({
									port:22,
				   hostname:hostname,
				   username:username,
				   password:password
								})
								
							}
							
						})
						
					}else{
						
						res.status(403)
						res.json({message:"Not connected"})	
						
					}	
					
				}else{
					res.status(403)
					res.json({message:"Not connected"})
				}
		})
		
		
	}
	
	verifyReposUpload(req,res){

						fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
							
							let myhistory =data.toString()
							let fileAlreadyExist = false
							myhistory = JSON.parse(myhistory)
							const pathname = req.body.path
							if(pathname){
							for( let i = 0 ; i<myhistory["local"].length ; i++){
								if(myhistory["local"][i].path===pathname){
									fileAlreadyExist=true
									break
								}
							}
							}else{
								res.json({message:"no path selected"})
							}
							if(fileAlreadyExist){
								//container exist
								res.json({message:"Container exist" , isSuccess:true})
							}else{
								//container will be created
								let git = simpleGit(pathname)
								//init reposistory to a given path
								if(pathname){
								git.init().then(function(r){
									fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
										let myhistory =data.toString()
										let fileAlreadyExist = false
										myhistory = JSON.parse(myhistory)
										
										for( let i = 0 ; i<myhistory["local"].length ; i++){
											if(myhistory["local"][i].path===pathname){
												fileAlreadyExist=true
												break
											}
										}
										if(fileAlreadyExist){
											res.send("Container already exist")
										}else{
											myhistory["local"].push({path:pathname})
											if( myhistory["local"]){
												fs.writeFile(path.join(__dirname,"../../../data/history.json"),JSON.stringify(myhistory),function(err){
													if(err) throw err
														res.json({message:"Container created automaticaly" , isSuccess:true})
												})
											}else{
												res.send("error on the db file")
											}
										}
										
									}) 
								}).catch(function(err){
									console.log(err)
									res.send(err)
								})
								
								
							}else{
								res.json({message:"no path selected"})
							}
								
							}
							
						})
		
	}
	
	
    getDownload(req,res){
        let file = req.body.file
        let pathname = req.body.path
        let message = req.body.message
        let isDirectory = req.body.isDirectory 
        if(file && pathname && message){
			
			fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
				if (err) throw err
					
					if(data.toString()!==""){
						
						
						let session = JSON.parse(data.toString())
						// initialize parameter for reposistory init
						const pathname = req.body.path 
						//initialize parameter for ssh connexion
						let hostname = session.host.hostname
						let username =session.host.username
						let password = session.host.password
						// check if there are something in the session file
						if(hostname && username && password){
							
							fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
								let myhistory =data.toString()
								let repoIsAvaible = false
								myhistory = JSON.parse(myhistory)
								
								for( let i = 0 ; i<myhistory["local"].length ; i++){
									if(myhistory["local"][i].path===pathname){
										repoIsAvaible=true
										break
									}
								}
								
								
								
									
									let conn = new Client()
									//execute git checkout :tags with ssh connexion
									conn.on("ready",function(){
										console.log("Client::ready")
										
										conn.exec(`cd "${pathname}" && git add ${"."} && git commit -m "${message}"`,function(err,stream){
											
											
											let logData = ""
											stream.on("data",function(data){
												logData = logData+data.toString()
												console.log(logData)
											})
											 
											stream.on("close",function(code,signal){
												console.log(code)
												
												conn.end().on("close",function(err){
													if(err) throw err
													conn = new SftpClient()
													conn.connect({
														port:22,
						  								hostname:hostname,
														username:username,
						  								password:password
													}).then(function(){
														let fullPath = path.join(pathname,file)
														console.log(fullPath) 
													//	if(fs.existsSync(`/home/shiro/VoGit/download/${file}`)){
															
															if(isDirectory){
																console.log(fullPath)
																return	conn.downloadDir(fullPath , `/home/${os.userInfo().username}/VoGit/download/${file}`)
															}else{
																return conn.get(fullPath , `/home/${os.userInfo().username}/VoGit/download/${file}`)	
															}
															
													//	}
														
													}).then(function(sortie){
														console.log(sortie.toString())
														
															let git = new simpleGit(`/home/${os.userInfo().username}/VoGit/download/`)
															git.init(function(err){
																git.add(".",function(err){
																	git.commit(message,function(err,sortie){
																		res.json({message:`Downloading "${file}" success`,isSuccess:true})
																	})
																})
															})
															
																
														
														
													}).catch(function(err){
														res.send("Error on download")
													})
												})
												
												
												})
												
											})
											
										
										
									}).connect({
										port:22,
										hostname:hostname,
										username:username,
										password:password
									})
									
// 								}else{
// 									res.status(404)
// 									res.json({message:"Container not found"})
// 								}
								
							})
							
							
						}else{
							res.status(403)
							res.json({message:"Not connected"})
						}
						
					}
			})
		}else{
			res.json({message:"no file selected"})
		}
    }
    upload(req,res){
		let file = req.body.file
		let pathname = req.body.path
		let message = req.body.message
		let isDirectory = req.body.isDirectory
		if(file && pathname && message){
			
			fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
				if (err) throw err
					
					if(data.toString()!==""){
						
						
						let session = JSON.parse(data.toString())
						// initialize parameter for reposistory init
						const pathname = req.body.path 
						//initialize parameter for ssh connexion
						let hostname = session.host.hostname
						let username =session.host.username
						let password = session.host.password
						// check if there are something in the session file
						if(hostname && username && password){
							
							fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
								let myhistory =data.toString()
								let repoIsAvaible = false
								myhistory = JSON.parse(myhistory)
								
								for( let i = 0 ; i<myhistory["distant"].length ; i++){
									if(myhistory["distant"][i].path===pathname){
										repoIsAvaible=true
										break
									}
								}
								
								
								if(repoIsAvaible){
									
									let conn = new Client()
									//execute git checkout :tags with ssh connexion
									conn.on("ready",function(){
										console.log("Client::ready")
										
										conn.exec(`cd "${pathname}" && git add ${"."} && git commit -m "${message}"`,function(err,stream){
											
											
											let logData = ""
											stream.on("data",function(data){
												logData = logData+data.toString()
												console.log(logData)
											})
											
											stream.on("close",function(code,signal){
												console.log(code)
												
												conn.end().on("close",function(err){
													if(err) throw err
														conn = new SftpClient()
														conn.connect({
															port:22,
						   hostname:hostname,
						   username:username,
						   password:password
														}).then(function(){
															let fullPath = path.join(pathname,file)
															
															
															if(isDirectory){
																console.log(fullPath)
																return	conn.uploadDir(fullPath , `/home/${username}/VoGit/upload/${file}`)
															}else{
																return conn.put(fullPath , `/home/${username}/VoGit/download/${file}`)	
															}
															
														}).then(function(sortie){
															
															
															//ssh connexion hereee
															const conn = new Client()
															//execute git checkout :tags with ssh connexion
															conn.on("ready",function(){
																console.log("Client::ready")
																
																conn.exec(`cd "/home/shiro/VoGit/upload/" && git init && git add ${"."} && git commit -m "${message}"`,function(err,stream){
																	
																	
																	let logData = ""
																	stream.on("data",function(data){
																		logData = logData+data.toString()
																		console.log(logData)
																	})
																	
																	stream.on("close",function(code,signal){
																		
																		res.send("upload success")
																	})
																	
																})
																
																
															}).connect({
																port:22,
						  hostname:hostname,
						  username:username,
						  password:password
															})
																
															
															
														})
												})
												
												
											})
											
										})
										
										
										
									}).connect({
										port:22,
					hostname:hostname,
					username:username,
					password:password
									})
									
								}else{
									res.status(404)
									res.json({message:"Container not found"})
								}
								
							})
							
							
						}else{
							res.status(403)
							res.json({message:"Not connected"})
						}
						
					}
			})
		}else{
			res.json({message:"no file selected"})
		}
	}
}

module.exports = new Download()
