import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './mongodb/connect.js';
import userAuth from './routes/userAuth.js';
import dalleRoutes from './routes/dalleRoutes.js'
import postRoutes from './routes/postRoutes.js'
dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.json());
app.use(cors());


app.use('/api/auth', userAuth);

app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

app.get('/', async (req, res) => {
    res.status(200).json({
        message: 'Hello from dall e',
    })
})

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);
        app.listen(process.env.PORT, () => console.log(`Server is running on port http://localhost:${process.env.PORT}`))
    } catch (e) {
        console.log(e);
    }
};

startServer();
