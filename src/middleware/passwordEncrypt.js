import bcrypt from 'bcryptjs';

const hashPassword = async (req, res, next) => {
    try {
        const {password} = req.body;
        if (password) {
            req.body.password = await bcrypt.hash(password, 10);
        }
        next();
    } catch (e) {
        res.status(500).json({message:"Cannot change password"});
    }
}

export default hashPassword;