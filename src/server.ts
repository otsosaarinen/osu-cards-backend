require("dotenv").config();
import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript server");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
