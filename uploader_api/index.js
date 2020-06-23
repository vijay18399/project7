var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var fileupload = require('express-fileupload');
var app = express();
var mime = require('mime-types')
var port = process.env.PORT || 3000;
var path = require('path');
app.use(cors());
app.use(fileupload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('uploads'))
app.post("/upload", function(req, res) {
  console.log(req.files);
  const file = req.files.file;
  const original = file.name;
  const mimetype= file.mimetype;
  console.log(file,original,mimetype);
  const ext = path.extname(original).slice(1);
  file.name  = new Date().valueOf()+'.'+ext;
  const  image = ['jpg', 'png', 'gif', 'jpeg'];
  const video = ['mp4', 'mov', 'mpg', 'flv','mkv','avi','3gp'];
  const audio =['mp3','m4a','wav'];
  const lang=['cpp','txt','c','java','py','go','cs','r','html','css','rb','perl','sql','js','ts'];
  const compress=['zip','rar','7z'];
  const documents=['ppt','doc','pptx','docx','pdf'];
  const pc =['exe','msi'];
  const data =['csv','xlsv','xls'];

  if(image.includes(ext)){
  type = 'image';
  }
  else if(video.includes(ext)){
    type = 'video';
  } else if(audio.includes(ext)){
    type = 'audio';
  } else if(compress.includes(ext)){
    type = 'compress';
  }   else if(documents.includes(ext)){
    type = 'documents';
  }  else if(pc.includes(ext)){
    type = 'pc';
  } else if(lang.includes(ext)){
    type = 'lang';
  }else if(data.includes(ext)){
    type = 'data'
  }else if(ext == 'apk'){
    type = 'android'
  }else{
    type = ext
  }


  file.mv('./uploads/' + file.name, function(err, result) {
   if(err) 
{
  res.send({
    err,
    success: false,
    message: "File upload  failed!",
   });
}
   res.send({
     mimetype:mimetype,
     ext:ext,
    success: true,
    message: "File uploaded!",
    file:file.name,
    original:original,
    type:type
   });
  })
 })

app.listen(port, function() {
  console.log("chat services working in http://localhost:" + port);
});
