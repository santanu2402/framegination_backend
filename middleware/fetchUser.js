import jwt from 'jsonwebtoken';

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Authenticate with valid token" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        console.log(data);
        req.user = data.info;
        console.log(req.user.id);
        next();
    } catch (err) {
        res.status(401).send({ error: "Authenticate with valid token" });
    }
};

export default fetchuser;
