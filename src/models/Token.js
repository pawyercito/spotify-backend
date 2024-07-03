import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  idToken: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  clientId: { type: String, required: true },
});

const Token = mongoose.model("Token", TokenSchema);
export default Token;
