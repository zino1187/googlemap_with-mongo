var http=require("http");
var express=require("express"); //외부
var bodyParser=require("body-parser");//외부
var mongo = require("mongodb");//외부  + ejs 

var client=mongo.MongoClient;

var app=express();
var server=http.createServer(app);

//각종 미들웨어 설정
app.set("view engine", "ejs"); //반드시 views 디렉터리에 ejs 넣어둬야함
											//ejs 확장자를 명시할 필요없다..
											//fs.readFile()+ejs.render() 도 필요없고, response.render
app.use(express.static(__dirname));// 도메인뒤에 html 명칭만 넣으면
													//해당 html 을 다운로드 받게됨..
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//등록 요청 처리 
app.use("/map/regist", function(request, response){
	var lat=request.body.lat;//위도값	
	var lng=request.body.lng;//경로값
	var selectedIcon=request.body.selectedIcon; //이미지명
	var msg=request.body.msg;//메세지
		
	console.log(lat, lng, selectedIcon);	

	client.connect("mongodb://localhost:27017/", function(error, con){
		if(error){
			console.log(error);
		}else{
			console.log("접속 성공");

			var db=con.db("front"); //사용할 db
			var obj={lat:lat,lng:lng,icon:selectedIcon,msg:msg};

			db.collection("googlemap").insertOne(obj, function(err,result){
				if(err){
					console.log(err);
				}else{
					console.log("등록성공",result);
				}
				con.close();
			});
		}
	});
	
});

//목록 가져오기  보여지는 것는 구글맵...
app.use("/map/list", function(request, response){

	client.connect("mongodb://localhost:27017/", function(error, con){
		if(error){
			console.log(error);
		}else{
			var db=con.db("front");
			db.collection("googlemap").find().toArray(function(err, result){
				if(err){
					console.log(err);
				}else{
					console.log("조회성공", result);
					response.render("googlemap", {
						records:result
					});
				}
				con.close();
			});
		}
	});	
});


server.listen(7777, function(){
	console.log("웹서버가 7777포트에서 실행중...");
});

