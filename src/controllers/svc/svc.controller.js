const simpleGit= require("simple-git")
const {Client} = require("ssh2")
const fs = require("fs")
const path = require("path")
const os = require("os")

class Svc{
	
	init(req,res){
		const pathname = req.body.path
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
									res.send("Container created")
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
	
	getContainers(req,res){
		
		fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
			let containers = JSON.parse(data.toString())
			if(!err){
				res.json(containers)
			}else{
				res.status(500)
				res.json({message:"error on server"})
			}
		})
		
		
	}

	getHistories(req,res){
		let reposistoryDir = req.body.path
		if(reposistoryDir){
			fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
				if(err) throw err
				let reposistoryAvaible = JSON.parse(data.toString())["local"]
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
						let git = simpleGit(reposistoryDir)
							git.log(function(err,history){
								if(err) throw err
									res.json(history)
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
		
	}
	checkout(req,res){
		let tags =  req.body.tags
		let reposistoryDir = req.body.path
		
		if(tags && reposistoryDir){
			
			fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
				
				if(err) throw err
					if(err) throw err
					let reposistoryAvaible = JSON.parse(data.toString())["local"]
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
							let git = simpleGit(reposistoryDir)
							
							//execute git checkout :tags
							
							git.checkout(tags,function(err){
								if(!err){
									git.log(function(err,history){
										if(err) throw err
											res.json(history)
									})	
								}else{
									res.status(500)
									res.json({message:"Error in the local file"})
								}
								
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
					let hostname = "localhost"
					let username = os.userInfo().username
					let password = "amsterdam007"
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
										let reposistoryAvaible = JSON.parse(data.toString())["local"]
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
	
	
	//add container
	
	addContainer(req,res){
		
		
		let reposistoryDir = req.body.path
		let message = req.body.message
		let files = []
		if(reposistoryDir){
			fs.readFile(path.join(__dirname,"../../../data/history.json"),function(err,data){
				if(err) throw err
					let reposistoryAvaible = JSON.parse(data.toString())["local"]
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
							let git = simpleGit(reposistoryDir)
							
							git.add(files || ".",function(err,log){
								
								git.commit(`${message}`,function(err,sortie){
									if(sortie){
										git.log(function(err,history){
											if(err) throw err
												res.json(history)
										})
									}
								})
								
								
							})
							
							
							
						}else{
							res.status(404)
							res.json({message:"This container already exist yet",isEmpty:true})
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
		
		
	}
} 

module.exports = new Svc()
