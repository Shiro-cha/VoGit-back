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
		
			}		
		})

		
		
		
	}
	
	
} 

module.exports = new SvcDistant()
