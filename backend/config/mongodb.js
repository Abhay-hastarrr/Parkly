import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("DB Connected");
    });

    // Use the full connection string from env as-is. Do not append a DB name here,
    // because the URI may already include one and/or query parameters.
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
}

export default connectDB;
