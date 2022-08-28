const {Client} = require("ssh2")
const fs = require("fs")
const path = require("path")



class SvcDistant{
	
	init(req,res){
		//get session from file session.json
		fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
			if (err) throw err
			let session = JSON.parse(data.toString())
			// initialize parameter for reposistory init
			const pathname = req.body.path
			const message = req.body.message
			//initialize parameter for ssh connexion
			let hostname = session.host.hostname
			let username =session.host.username
			let password = session.host.password
			// check if there are something in the session file
			if(hostname && username && password && pathname){

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
													res.send("Container created ")
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
		
			}else{
				
					res.status(403)
					res.json({message:"Not connected"})	
				
			}		
		})

		
		
		
	}
	getHistories(req,res){
		
		fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
			let stringData = data.toString()
			if (err) throw err
				
				if(stringData){
					
					let session = JSON.parse(data.toString())
					// initialize parameter for reposistory init
					const pathname = req.body.path 
					//initialize parameter for ssh connexion
					let hostname = session.host.hostname
					let username =session.host.username
					let password = session.host.password
					let logData = ""
					// check if there are something in the session file
					if(hostname && username && password && pathname){
						//check history begin here
						let reposistoryDir = req.body.path
						if(reposistoryDir){
							fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
								if(err) throw err
									let reposistoryAvaible = JSON.parse(data.toString())["distant"]
									let repoIsAvaible = false
									if(reposistoryAvaible){
										
										for(let i = 0 ; i< reposistoryAvaible.length ; i++){
											if(reposistoryAvaible[i].path===reposistoryDir){
												repoIsAvaible = true
												break
											}
										}
										console.log("checking repos")
										if(repoIsAvaible){
											console.log("Log !!!!!!!!!")	
											
											//ssh connexion hereee
											const conn = new Client()
											
											conn.on("ready",function(){
												console.log("Client::ready")
												
												//execute the shell command ` cd /path/to/new/reposistroy && git log`
												conn.exec(`cd "${pathname}" &&  git log `,function(err,stream){
													if (err) throw err
														stream.on("data",function(data){
															logData =logData+data.toString()
															console.log(logData)
														})
														stream.on("close",function(code,signal){
															
							
																
																//close connexion
																conn.end().on("close",function(){
																	
																	console.log("Ending connexion")
																	
																	if(0<logData.toString().split("\n").length && (logData.toString().split("\n").length % 6) === 0){
																		let listBegin = 0
																		let listStringData = logData.toString().split("\n")
																		let listStringDataLength = listStringData.length
																		let reposistoryNumber = listStringDataLength / 6
																		let reposList = []
																		for(let i = 1 ; i <= reposistoryNumber ; i++){
																			let oneRepos =listStringData.slice(listBegin,i*6)
																			let commit = oneRepos[0].split(" ")[1]
																			let author = oneRepos[1].split(": ")[1]
																			let date = oneRepos[2].split(":  ")[1]
																			let message = oneRepos[4]
																			
																			reposList.push({hash:commit,date:date,message:message,author:author})
																			
																			listBegin = i*6 
																		}
																		
																		logData=""
																		res.json({All:reposList,Latest:reposList[0]})
																	}else{
																		
																		res.status(500)
																		res.send("Error on your VoGit")
																	}
																	
																	
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
											res.json({message:"This container doesn't exist yet",isEmpty:false})
										}
										
									}else{
										res.status(500)
										res.json({message:"Error in the local database"})
									}
							})
						}else{
							res.status(404)
							res.json({message:"Container not found",isEmpty:true})
						}
						
					}else{
						res.status(403)
						res.json({message:"Not connected"})	
					}
					
				}else{
					res.status(500)
					res.send("error on the server")
				}
		})
		
	}
	
	//check out
	
	checkout(req,res){
		
		
		fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
			let stringData = data.toString()
			console.log("hellllllllo")
			if (err) throw err
				
			if(stringData){
				let session = JSON.parse(data.toString())
				// initialize parameter for reposistory init
				const pathname = req.body.path 
				//initialize parameter for ssh connexion
				let hostname = session.host.hostname
				let username =session.host.username
				let password = session.host.password
				let logData = ""
				// check if there are something in the session file
				if(hostname && username && password && pathname){
					//check history begin here
		
					
					let tags =  req.body.tags
					let reposistoryDir = req.body.path
					
					if(tags && reposistoryDir){
						
						fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
							
							if(err) throw err
								if(err) throw err
									let reposistoryAvaible = JSON.parse(data.toString())["distant"]
									console.log(reposistoryAvaible)
									let repoIsAvaible = false
									
									
									for(let i = 0 ; i< reposistoryAvaible.length ; i++){
										if(reposistoryAvaible[i].path===reposistoryDir){
											repoIsAvaible = true
											break
										}
									}
									console.log(reposistoryDir)
									if(repoIsAvaible){
										console.log("Log !!!!!!!!!")	
										
										//ssh connexion hereee
										const conn = new Client()
										//execute git checkout :tags with ssh connexion
										conn.on("ready",function(){
											console.log("Client::ready")
											
											conn.exec(`cd "${pathname}" && git checkout ${tags} `,function(err,stream){
											
												console.log("closing...")
												stream.on("data",function(data){
													console.log(data.toString())
												})
												
												stream.on("close",function(code,signal){
													
													if(err) throw err
													//code === 0 mean success
													if(code ===0){
														
														res.status(200)
														res.json({message:"Checkout version success",isSuccess:true})
														
														
													}else{
														res.status(500)
														res.json({message:"Checkout version error",isSuccess:false})
													}
													
												})
												
											})
							
					
										}).connect({
											port:22,
								 hostname:hostname,
								username:username,
					 			password:password
										})
										
										
										
									}else{
										res.status(500)
										res.json({message:"Error in the local database"})
									}
									
						})
						
						
					}else{
						res.status(401)
						res.json({message:"Field are not vaid"})	
					}
					
					
					
				}else{
					res.status(403)
					res.json({message:"Not connected"})	
				}
				
			}else{
				res.status(500)
				res.send("error on the server")
			}
					
			
			
		})
		
		
	}
	
	addContainer(req,res){
		
		
		
		fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
			let stringData = data.toString()
			if (err) throw err
				
				if(stringData){
					let session = JSON.parse(data.toString())
					// initialize parameter for reposistory init
					const pathname = req.body.path 
					//initialize parameter for ssh connexion
					let hostname = session.host.hostname
					let username =session.host.username
					let password = session.host.password
					let logData = ""
					// check if there are something in the session file
					if(hostname && username && password && pathname){
						//check history begin here
						
						
						let message = req.body.message
						let reposistoryDir = req.body.path
						let files = req.body.files || []
						
						if(reposistoryDir){
							
							fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
								
								if(err) throw err
									if(err) throw err
										let reposistoryAvaible = JSON.parse(data.toString())["distant"]
										let repoIsAvaible = false
										
										
										for(let i = 0 ; i< reposistoryAvaible.length ; i++){
											if(reposistoryAvaible[i].path===reposistoryDir){
												repoIsAvaible = true
												break
											}
										}
										console.log("checking repos")
										if(repoIsAvaible){
											console.log("Log !!!!!!!!!")	
											
											//ssh connexion hereee
											const conn = new Client()
											//execute git checkout :tags with ssh connexion
											conn.on("ready",function(){
												console.log("Client::ready")
												console.log(files)
												conn.exec(`cd "${pathname}" && git add ${"."} && git commit -m "${message}"`,function(err,stream){
													
						
													let logData = ""
													stream.on("data",function(data){
														logData = logData+data.toString()
														console.log(logData)
													})
													
													stream.on("close",function(code,signal){
														console.log(code)
															//code === 0 mean success
														conn.exec(`cd "${pathname}" && git log`,function(err,stream){
																if(err) throw err
																	let logData =""
																stream.on("data",function(data){
																	logData = logData+data.toString()
																})
																stream.on("close",function(code,signal){
																
																	if(code===0){
																		
																		//close connexion
																		conn.end().on("close",function(){
																			
																			console.log("Ending connexion")
																			
																			if(0<logData.toString().split("\n").length && (logData.toString().split("\n").length % 6) === 0){
																				let listBegin = 0
																				let listStringData = logData.toString().split("\n")
																				let listStringDataLength = listStringData.length
																				let reposistoryNumber = listStringDataLength / 6
																				let reposList = []
																				for(let i = 1 ; i <= reposistoryNumber ; i++){
																					let oneRepos =listStringData.slice(listBegin,i*6)
																					let commit = oneRepos[0].split(" ")[1]
																					let author = oneRepos[1].split(": ")[1]
																					let date = oneRepos[2].split(":  ")[1]
																					let message = oneRepos[4]
																					
																					reposList.push({hash:commit,date:date,message:message,author:author})
																					
																					listBegin = i*6 
																				}
																				
																				logData=""
																				res.json({All:reposList,Latest:reposList[0]})
																			}else{
																				
																				res.status(500)
																				res.send("Error on your VoGit")
																			}
																			
																			
																		})
																		
																		
																	}else if(code===1){
																		res.status(403)
																		res.json({message:"file not found"})
																		
																		//the other return status code are unkown	
																	}else{
																		res.status(403)
																		res.json({message:"unkwon error"})
																	}
																	
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
											res.status(500)
											res.json({message:"Error in the local database"})
										}
										
							})
							
							
						}else{
							res.status(401)
							res.json({message:"Field are not vaid"})	
						}
						
						
						
					}else{
						res.status(403)
						res.json({message:"Not connected"})	
					}
					
				}else{
					res.status(500)
					res.send("error on the server")
				}
				
				
				
		})
		
		
	}
	
	
	switchTags(req,res){
		
		
		fs.readFile(path.join(__dirname,"../../../data/session.json"),function(err,data){
			let stringData = data.toString()
			if (err) throw err
				
				if(stringData){
					let session = JSON.parse(data.toString())
					// initialize parameter for reposistory init
					const pathname = req.body.path 
					//initialize parameter for ssh connexion
					let hostname = session.host.hostname
					let username =session.host.username
					let password = session.host.password
					let logData = ""
					// check if there are something in the session file
					if(hostname && username && password && pathname){
						//check history begin here
						
						
						let message = req.body.message
						let reposistoryDir = req.body.path
						let files = req.body.files || []
						
						if(reposistoryDir){
							
							fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
								
								if(err) throw err
									if(err) throw err
										let reposistoryAvaible = JSON.parse(data.toString())["distant"]
										let repoIsAvaible = false
										
										
										for(let i = 0 ; i< reposistoryAvaible.length ; i++){
											if(reposistoryAvaible[i].path===reposistoryDir){
												repoIsAvaible = true
												break
											}
										}
										console.log("checking repos")
										if(repoIsAvaible){
											console.log("Log !!!!!!!!!")	
											
											//ssh connexion hereee
											const conn = new Client()
											//execute git checkout :tags with ssh connexion
											conn.on("ready",function(){
												console.log("Client::ready")
												console.log(files)
												conn.exec(`cd "${pathname}" && git switch -`,function(err,stream){
													
													
													let logData = ""
													stream.on("data",function(data){
														logData = logData+data.toString()
														console.log(logData)
													})
													
													stream.on("close",function(code,signal){
														console.log(code)
														res.json({message:"Switch to the initial head"})
														
													})
													
												})
												
												
											}).connect({
												port:22,
					  hostname:hostname,
					  username:username,
					  password:password
											})
											
											
											
										}else{
											res.status(500)
											res.json({message:"Error in the local database"})
										}
										
							})
							
							
						}else{
							res.status(401)
							res.json({message:"Field are not vaid"})	
						}
						
						
						
					}else{
						res.status(403)
						res.json({message:"Not connected"})	
					}
					
				}else{
					res.status(500)
					res.send("error on the server")
				}
				
				
				
		})
		
	}
	
	
} 

module.exports = new SvcDistant()
