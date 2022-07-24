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
					for( let i = 0 ; i<myhistory.length ; i++){
						if(myhistory[i].path===pathname){
							fileAlreadyExist=true
							break
						}
					}
					if(fileAlreadyExist){
						res.send("already in history")
					}else{
						myhistory.push({path:pathname})
						if( myhistory){
							fs.writeFile(path.join(__dirname,"../../../data/history.json"),JSON.stringify(myhistory),function(err){
								if(err) throw err
									res.send("finished")
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
} 

module.exports = new Svc()
