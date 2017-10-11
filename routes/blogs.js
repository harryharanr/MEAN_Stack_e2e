const User = require('../models/user'); // Import User Model Schema
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken'); // Compact, URL-safe means of representing claims to be transferred between two parties.
const config = require('../config/database'); // Import database configuration

module.exports = (router) => { 

    router.post('/newBlog',(req,res) => {
        if(!req.body.title){
            return res.json({ success: false , message:'Blog Title is required'});
        } else {
            if(!req.body.body){
                return res.json({ success: false , message:'Blog Body is required' });
            } else {
               if(!req.body.createdBy) {
                    return res.json({ success: false , message:'There is no creator to this blog' });
               } else {
                    const blog = new Blog({
                        title : req.body.title,
                        body : req.body.body,
                        createdBy : req.body.createdBy
                    });

                    blog.save((err) => {
                        if(err) {
                            if(err.errors){
                                    if(err.errors.title){
                                        return res.json({ success: false , message: err.errors.title.message });
                                    } else {
                                        if(err.errors.body){
                                            return res.json({ success:false , message: err.errors.body.message });
                                        } else {
                                            return res.json({ success:false , message: err.errmsg });
                                        }
                                    } 
                                } else {
                                    return res.json({ success:false , message: err });
                                }
                        } else {
                            res.json({ success:true , message:'Blog saved!'});
                        }
                    });
               }
            }
        }
    });

    router.get('/allBlogs',(req,res)=>{
        Blog.find({} , (err,blogs) => {
            if(err){
                res.json({ success:false , message:err });
            } else {
                if(!blogs){
                    res.json({ success: false , message: 'No blogs found!'});
                } else {
                    res.json({ success:true , message: blogs });
                }
            }
        }).sort({ '_id': -1 });
    });

    router.get('/singleBlog/:id',(req,res)=>{
        if(!req.params.id){
            res.json({ success:false , message:'No blog id was provided!!'});
        } else {
            Blog.findOne({ _id: req.params.id } , (err,blog) => {
                    if(err){
                        res.json({ success:false , message:'Not a valid blog id!!' });
                    } else {
                        if(!blog){
                            res.json({ success:false , message: 'No blog found!'});
                        } else {
                            User.findOne({ _id:req.decoded.userId }, (err,user) => {
                                if(err){
                                    res.json({ success:false , message:err });
                                } else {
                                    if(!user){
                                        res.json({ success:false , message:'Unable to authenticate user'});
                                    } else {
                                        if(user.username !== blog.createdBy){
                                            res.json({ success:false , message:'You are not authorized to edit this blog'});
                                        } else {
                                            res.json({ success:true , message:blog});
                                        }
                                    }
                                }
                            });
                       }
                    }
            });
        }
    });

    router.put('/updateBlog',(req,res)=> {
        if(!req.body._id){
            res.json({ success:false , message:'No blog id provided!!'});
        } else {
            Blog.findOne({ _id: req.body._id } , (err , blog) => {
                if(err){
                    res.json({ success:false , message : 'Not a valid blog ID!!'});
                } else {
                    if(!blog){
                        res.json({ success:false , message:'Blog id was not found!!'});
                    } else {
                        //Accessing decoded object from authentication.js to check whether the same person who created this post updates it
                        User.findOne({ _id: req.decoded.userId} , (err , user)=> {
                            if(err){
                                res.json({ success:false , message:err });
                            } else {
                                if(!user){
                                    res.json({ success:false , message:'Unable to authenticate user'});
                                } else {
                                    if(user.username !== blog.createdBy){
                                        res.json({ success:false , message:'You are not authorized to edit this blog!!'});
                                    } else {
                                        blog.title = req.body.title;
                                        blog.body = req.body.body;
                                        blog.save((err)=>{
                                            if(err){
                                                res.json({ success:false , message:err});
                                            } else {
                                                res.json({ success:true , message: 'Blog Updated!'});
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.delete('/deleteBlog/:id',(req,res) => {
        if(!req.params.id){
            res.json({ success:false , message:'No id was provided'});
        } else {
            Blog.findOne({ _id:req.params.id } , (err , blog) => {
                if(err){
                    res.json({ success:false , message:'Invalid id'});
                } else {
                    if(!blog){
                        res.json({ success:false , message:'Blog was not found'});
                    } else {
                        User.findOne({ _id:req.decoded.userId } , (err , user)  => {
                            if(err){
                                res.json({ success:false , message:err});
                            } else {
                                if(!user){
                                    res.json({ success:false , message:'Unable to authenticate the user!'});
                                } else {
                                    if(user.username !== blog.createdBy){
                                        res.json({ success:false , message:'You are not authorized to delete this post!'});
                                    } else {
                                        blog.remove((err) =>{
                                            if(err){
                                                res.json({ success:false , message:err});
                                            } else {
                                                res.json({ success:true , message:'Blog was deleted!!'});
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.put('/likeBlog' , (req,res)=>{
        console.log(req.body);
        if(!req.body.id){
            res.json({ success:false , message:'No id was provided!'});
        } else {
            Blog.findOne({ _id: req.body.id} , (err,blog)=>{
                if(err){
                    res.json({ success:false , message:'Invalid blog id!'});
                } else {
                    if(!blog){
                        res.json({ success:false , message:'That blog was not found!'});
                    } else {
                        User.findOne({ _id:req.decoded.userId} , (err,user) =>{
                            if(err){
                                res.json({ success:false , message:'Something went wrong'});
                            } else {
                                if(!user){
                                    res.json({ success:false , message:'Could not authenticate user!'});
                                } else {

                                    if(user.username === blog.createdBy){
                                        res.json({ success:false , message:'You cannot like the posts you created!'});
                                    } else {

                                        if(blog.likedBy.includes(user.username)){
                                            res.json({ success:false , message:'You already liked this post!'});
                                        } else {
                                            if(blog.dislikedBy.includes(user.username)){ //If user already disliked this post
                                                blog.dislikes--;
                                                const arrayIndex = blog.dislikedBy.indexOf(user.username);
                                                blog.dislikedBy.splice(arrayIndex , 1);
                                                blog.likes++;
                                                blog.likedBy.push(user.username);
                                                blog.save((err)=>{
                                                    if(err){
                                                        res.json({ success:false , message:'Something went wrong'});
                                                    } else {
                                                        console.log('Blog liked');
                                                        res.json({ success:true , message:'Blog liked!'});
                                                    }
                                                });
                                            } else { //If the user has never touched this post before
                                                blog.likes++;
                                                blog.likedBy.push(user.username);
                                                blog.save((err)=>{
                                                    if(err){
                                                        res.json({ success:false , message:'Something went wrong'});
                                                    } else {
                                                        console.log('Blog liked');
                                                        res.json({ success:true , message:'Blog liked!'});
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.put('/dislikeBlog' , (req,res)=>{
        console.log(req.body);
        if(!req.body.id){
            res.json({ success:false , message:'No id was provided!'});
        } else {
            Blog.findOne({ _id: req.body.id} , (err,blog)=>{
                if(err){
                    res.json({ success:false , message:'Invalid blog id!'});
                } else {
                    if(!blog){
                        res.json({ success:false , message:'That blog was not found!'});
                    } else {
                        User.findOne({ _id:req.decoded.userId} , (err,user) =>{
                            if(err){
                                res.json({ success:false , message:'Something went wrong'});
                            } else {
                                if(!user){
                                    res.json({ success:false , message:'Could not authenticate user!'});
                                } else {

                                    if(user.username === blog.createdBy){
                                        res.json({ success:false , message:'You cannot dislike the posts you created!'});
                                    } else {

                                        if(blog.dislikedBy.includes(user.username)){
                                            res.json({ success:false , message:'You already disliked this post!'});
                                        } else {
                                            if(blog.likedBy.includes(user.username)){ //If user already disliked this post
                                                blog.likes--;
                                                const arrayIndex = blog.likedBy.indexOf(user.username);
                                                blog.likedBy.splice(arrayIndex , 1);
                                                blog.dislikes++;
                                                blog.dislikedBy.push(user.username);
                                                blog.save((err)=>{
                                                    if(err){
                                                        res.json({ success:false , message:'Something went wrong'});
                                                    } else {
                                                        res.json({ success:true , message:'Blog disliked!'});
                                                    }
                                                });
                                            } else { //If the user has never touched this post before
                                                blog.dislikes++;
                                                blog.dislikedBy.push(user.username);
                                                blog.save((err)=>{
                                                    if(err){
                                                        res.json({ success:false , message:'Something went wrong'});
                                                    } else {
                                                        res.json({ success:true , message:'Blog disliked!'});
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    return router;
}