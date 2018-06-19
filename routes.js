
var Images = require('./models/Images');
var mime = require('mime');
var  size = 3;
var path = require('path');
var express = require('express');
var fs  =  require('fs');



function checkfiletype(file,cb)
{
    console.log("myfile "+JSON.stringify(file)); 
    const  filetypes = /gif|jpg|jpeg|png/;
    console.log('extname '+(path.extname(file.originalname).substring(1)));

    const extname = filetypes.test((path.extname(file.originalname).substring(1)).toLowerCase());

    if(extname)
    {
        return cb(null,true);

    }else
    {
        return cb("Error : file size must be image or gif");
    }
}

module.exports = function(app){

    app.post('/uploadfile',(req,res,next)=>{
        
        var multer = require('multer');

        var mystorage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './uploads/')
            },
            filename: function (req, file, cb) {
                console.log('exts '+path.extname(file.originalname));
                cb(null,`${file.fieldname}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
            }
        });

        var uploads = multer({storage : mystorage 
            , fileFilter : function(req,file,cb){
            checkfiletype(file,cb);},
            limits:{fileSize : size*1028*1028},
           
        }).array('file');

        uploads(req,res,function(err){
            if (err) {
                console.log("error occuring while uploading image" + err);
                if(err.code=="LIMIT_FILE_SIZE")
                {
                    res.json({
                        success: false,
                        message: "file size must be less then "+size+" MB"
                    }); 
                }else
                {
                    res.json({
                        success: false,
                        message: err
                    });
                }
                
            }else
            {
                res.json({
                    success: true,
                    message: 'File uploaded!'
                });
    
                console.log(req.files.length);
                console.log(req.files);

                for(var i=0;i<req.files.length;i++)
                {
                    var img = new Images({
                    name : req.files[i].filename,
                    originalname : req.files[i].originalname,
                    type : (path.extname(req.files[i].originalname).substring(1)).toLowerCase(),
                    created : Date.now(),
                    download : 0 ,
                    views : 0
                });
    
                img.save();
                }
            }
            

        });

    });


    app.get('/getimagefile',function(req,res,next){

         console.log(req.query);
        // const { limit = 10, skip = 0, page = 1 } = req.query; 
        Images.find({type:{'$ne':'gif'}})
        .sort({created : -1})
        .skip(parseInt(req.query.limit) * ((parseInt(req.query.page-1))))
        .limit(parseInt(req.query.limit))
        .then((images) =>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({"Images":images});
        })
    });


    app.get('/gettrendingimagefile',function(req,res,next){

        console.log(req.query);
       // const { limit = 10, skip = 0, page = 1 } = req.query; 
       Images.find({type:{'$ne':'gif'}})
       .sort({download : -1})
       .skip(parseInt(req.query.limit) * ((parseInt(req.query.page-1))))
       .limit(parseInt(req.query.limit))
       .then((images) =>{
           res.statusCode = 200;
           res.setHeader('Content-Type', 'application/json');
           res.json({"Images":images});
       })
   });
       

    app.get('/getgiffile',function(req,res,next){
        console.log(req.query);
        // const { limit = 10, skip = 0, page = 1 } = req.query; 
        Images.find({type:'gif'})
        .sort({created : -1})
        .skip(parseInt(req.query.limit) * ((parseInt(req.query.page-1))))
        .limit(parseInt(req.query.limit))
        .then((images) =>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({"Images":images});
        
        })
    });

    app.get('/gettrendinggiffile',function(req,res,next){
        console.log(req.query);
        // const { limit = 10, skip = 0, page = 1 } = req.query; 
        Images.find({type:'gif'})
        .sort({download : -1})
        .skip(parseInt(req.query.limit) * ((parseInt(req.query.page-1))))
        .limit(parseInt(req.query.limit))
        .then((images) =>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({"Images":images});
        
        })
    });

    app.post('/downloadfile',function(req,res,next){

        console.log(req.body);

        Images.findOneAndUpdate({_id:req.body.id},{$inc:{'download':1}}).exec((err)=>{
          if(err==null)
          {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.json({
                success: true,
                message: "file downloaded successfully"
            }); 
          }else
          {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.json({
                success: false,
                message: "file downloaded successfully"
            }); 
          }
        },(res)=>{
          console.log(res);
        });
    });


    app.post('/deletefile',(req,res,next) => {

        console.log(req.body);
 
        Images.find({'_id':{$in:req.body.id}})
        .then((data)=>{
            console.log(data);
            if(data!=null)
            {
                async = require('async');
                var myParallelTasks = [];

                data.forEach(function(image){
                    var filepaths =  image.name;
                    var fileid = image._id
                    fs.exists("./uploads/"+filepaths,(exist)=>{
                        if(exist)
                        {
                            console.log('names  '+  filepaths);
                           
                            Images.findByIdAndRemove(fileid)
                            .then(function(img){
                                fs.unlink("./uploads/"+filepaths,function(callback)
                                {
                                
                                });
                            },(err)=>next(err))
                            .catch((err) =>next(err));
                        }else
                        {
                            console.log('file not founds'); 
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({
                                success: false,
                                message: "file not found"
                            }); 
                            err = new Error("File Not Found");
                            return(next(err));  
                        }
                    });
                });

                async.parallel( myParallelTasks, function()
                {
                    console.log('file deleted successfully');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({
                        success: true,
                        message: "file deleted successfully"
                    }); 
                    console.log( "all done" );          
                });
            
            }else{
                console.log('file not founds'); 
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    success: false,
                    message: "file not found"
                }); 
                return(next(err));
            }
        })
        .catch((err) => next(err))

    });
}