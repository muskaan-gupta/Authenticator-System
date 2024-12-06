import mongoose from "mongoose";
import dotenv from "dotenv";

const dbconnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URI}/${process.env.DB_NAME}`
    );
    console.log(
      `\n MongoDb connected !!!! db_HOST : ${connectionInstance.connection.host}`
    );
    console.log(`Server is running on port ${process.env.PORT}`);
  } catch (error) {
    console.log("Error in Connection", error);
    process.exit(1);
  }
};
export { dbconnect };
