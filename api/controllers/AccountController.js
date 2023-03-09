/* eslint-disable eqeqeq */
/**
 * AccountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createAccount : async(req,res)=>{
    try {
      const {name} = req.body;
      let user = req.user;
      const account = await Account.create({name,owner:user.id}).fetch();
      user = await User.find({id:user.id}).populate('accounts');
      return res.status(200).json({Message:'Account Create Success!',account,user});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  getAccountDetail:async(req,res)=>{
    try {
      const accountId=req.params.accountId;
      const account = await Account.find({id:accountId}).populate('user');
      if (!account) {
        return res.status(400).send({Message:'Account not found!'});
      }
      return res.status(200).send({account});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  accountFollow:async(req,res)=>{
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      const followId = req.params.followId;

      let account = await Account.findOne({id:accountId}).populate('follows');
      const followedAccount = account.follows.some((follow)=>follow.id == followId);

      if(followedAccount){
        return res.status(400).send({Message:'Account already followed!'});
      }

      let follow = await Account.findOne({id:followId});
      if (follow.owner == user.id) {
        return res.status(400).send({Message:'User can not follow self!'});
      }

      await Account.addToCollection(accountId,'follows',followId);
      await Account.addToCollection(followId,'followings',accountId);

      return res.status(200).send({Message:'Account followed!'});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  accountFollowingList:async(req,res)=>{
    try {
      const accountId = req.params.accountId;
      const account = await Account.findOne({id:accountId}).populate('followings');
      if(!account){
        return res.status(400).send({Message:'Can not find Account!'});
      }
      return res.status(200).send({Followings:account.followings});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  accountFollowList:async(req,res)=>{
    try{
      const accountId = req.params.accountId;
      const account = await Account.findOne({id:accountId}).populate('follows');
      if(!account){
        return res.status(400).send({Message:'Can not find Account!'});
      }
      return res.status(200).send({Followings:account.follows});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },getCurrentAccount:async(req,res)=>{
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      const account = await Account.findOne({id:accountId});
      if (account.owner !== user.id) {
        return res.status(400).send({Message:'Enter others account!'});
      }
      return res.status(200).send({user:user.fullName,account});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  }
};

