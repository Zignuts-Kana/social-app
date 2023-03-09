/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcryptjs = require('bcryptjs');
module.exports = {
  ragisterUser:async (req,res)=>{
    try {
      const {name,email,password} = req.body;
      const hashPassword = bcryptjs.hashSync(password, 8);
      let user = await User.create({fullName:name,emailAddress:email,password:hashPassword}).fetch();

      return res.status(201).json({Message:'New user created',user});
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },loginUser:async (req,res)=>{
    try {
      const {email,password}= req.body;
      let user = await User.findOne({ emailAddress:email });

      if (!user || !user.password) {
        return res.status(400).send({ Message: 'User Not Found!' });
      }

      const matchPassword = bcryptjs.compareSync(password, user.password);

      if (!matchPassword) {
        return res.status(401).send({ Message: 'Credencials Miss Mach!' });
      }

      const token = sails.helpers.jwtTokenGenerater(user.id);
      user = await User.update({id:user.id}).set({authToken:token.token}).fetch();
      user = user[0];
      return res.status(200).json(token);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },logOut:async(req,res)=>{
    try {
      const user = req.user;
      await User.update({id:user.id}).set({authToken:''}).fetch();
      return res.status(200).json('User logout Successfully!');
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },getLoginUser:async(req,res)=>{
    try {
      const user = req.user;
      return res.status(400).send({user});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  }

};

