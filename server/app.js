import express from "express";
import cors from "cors"
import channelRouter from "./routes/channel.routes.js";
import mainRouter from "./routes/main.routes.js";
import receiptRouter from "./routes/receipt.routes.js";

const app = express();

app.use(cors({
    origin: "*"
}));
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))

app.use(mainRouter);
app.use("/receipt", receiptRouter);
app.use("/send", channelRouter);

export {app};
