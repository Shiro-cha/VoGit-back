const simpleGit= require("simple-git")
const fs = require("fs")
const path = require("path")

class Svc{
	
	init(req,res){
		const pathname = req.body.path
		let git = simpleGit(pathname)
		//init reposistory to a given path
		if(path){ 
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
		let reason = req.body.reason || "-"
	}
} 

module.exports = new Svc()
