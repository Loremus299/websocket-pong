import express, { type Express, type Request, type Response } from "express";

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("HELLO FROM THE SERVER SIDE!");
});

app.listen(3000);
