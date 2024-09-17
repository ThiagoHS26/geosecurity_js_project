'use strict'
import User from "../models/user.model.js";

const registerUser = async(req, res) => {
    try {
        const {name,email,password,role} = req.body;
        const user = new User({name,email,password,role});
        await user.save();
        res.status(201).json({message: "User registered successfully"});
    } catch (e) {
        res.status(500).json({error:e.message});
    }
}

const getUsers = async(req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

const updateUser = async(req, res) => {
    try {
        const {id} = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {new: true});
        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

const getUserById = async(req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({message: "User not found"});
        res.json(user);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

const deleteUser = async(req, res) => {
    try {
        const {id} = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({message: "User not found"});
        res.json(deletedUser);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
}

const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { password }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Password updated" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}


export default {
    registerUser,
    getUsers,
    updateUser,
    getUserById,
    deleteUser,
    updatePassword
};
