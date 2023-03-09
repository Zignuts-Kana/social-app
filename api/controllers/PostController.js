/**
 * PostController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createPost : async (req,res)=>{
    try {
      const accountId = req.params.accountId;
      const user = req.user;
      console.log(req.body);
      let post;

      req.file('postImage').upload({
        // don't allow the total upload size to exceed ~10MB
        maxBytes: 10000000,
        dirname: require('path').join(sails.config.custom.appPath, '/assets/uploads')
      },async function whenDone(err, uploadedFiles) {
        if (err) {
          return res.status(400).send({Error:err});
        }

        // If no files were uploaded, respond with an error.
        if (uploadedFiles.length === 0){
          return res.status(400).send({Message:'No file was uploaded'});
        }

        // Get the base URL for our deployed application from our custom config
        // (e.g. this might be "http://foobar.example.com:1339" or "https://example.com")
        var baseUrl = sails.config.custom.baseUrl;
        let imageName = uploadedFiles[0].fd.split('\\uploads\\');

        // Save the "fd" and the url where the avatar for a user can be accessed
        post = await Post.create({
          name:req.body.name,
          description:req.body.description?req.body.description:undefined,
          owner:user.id,
          accountId,
          // Generate a unique URL where the avatar can be downloaded.
          avatarUrl: require('util').format('%s/uploads/%s', baseUrl, imageName[1]),

          // Grab the first file and use it's `fd` (file descriptor)
        //   avatarFd: uploadedFiles[0].fd
        }).fetch();
        //for add posts in account
        await Account.addToCollection(accountId,'posts').members([post.id]);

        return res.status(201).send({Message:'Post created!',post});
      });
    //   return res.status(400).send({Message:'Post not created!'});
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  toggleLike:async(req,res)=>{
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      let account = await Account.findOne({id:accountId});

      //others post to like
      const postId = req.params.postId;
      let post = await Post.findOne({id:postId}).populate('likes');

      if (!postId || !accountId || !post || !account) {
        return res.status(400).send({Message:'can not find data!'});
      }

      if (account.owner !== user.id) {
        return res.status(400).send({Message:'user can not like self!'});
      }

      const likedPost = post.likes.some((postOwner)=>postOwner.id == account.id);

      if (likedPost) {
        await Post.removeFromCollection(post.id,'likes').members([accountId]);
        return res.status(200).send({Message:'Removed Post like!',post});
      }

      await Post.addToCollection(post.id,'likes',accountId);
      return res.status(200).send({Message:'Post like successfully!',post});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  toggleDislike:async(req,res)=>{
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      let account = await Account.findOne({id:accountId});

      //others post to like
      const postId = req.params.postId;
      let post = await Post.findOne({id:postId}).populate('dislikes');

      if (!postId || !accountId || !post || !account) {
        return res.status(400).send({Message:'can not find data!'});
      }

      if (account.owner !== user.id) {
        return res.status(400).send({Message:'user can not dislike self!'});
      }

      const likedPost = post.likes.some((postOwner)=>postOwner.id == account.id);

      if (likedPost) {
        await Post.removeFromCollection(post.id,'dislikes').members([accountId]);
        return res.status(200).send({Message:'Removed Post dislikes!',post});
      }

      await Post.addToCollection(post.id,'dislikes',accountId);
      return res.status(200).send({Message:'Post dislike successfully!',post});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  postLikesList: async (req,res)=>{
    try {
      const postId = req.params.postId;
      const post = await Post.findOne({id:postId}).populate('likes');
      if (!post) {
        return res.status(400).send({Message:'Can not find post!'});
      }
      return res.status(200).send({Likes:post.likes});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  postComment:async(req,res)=>{
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      const postId = req.params.postId;
      let post = await Post.findOne({id:postId});
      if (!post) {
        return res.status(400).send({Message:'Can not find data!'});
      }
      const account = await Account.findOne({id:accountId});
      if(!account){
        return res.status(400).send({Message:'Can not find data!'});
      }

      const comment = req.body.comment;
      if (!post.comments || !post.comments.length) {
        post.comments = [{id:accountId,comment}];
      }else{
        post.comments.push({id:accountId,comment});
      }
      await Post.update({id:postId}).set(post);
      return res.status(200).send({Message:'comment added!'});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  }
};

