const { createHmac, randomBytes, hash } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/auth");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String, // Fixed typo here
      required: true,
    },
    profileImageURL: { // Fixed typo in key name
      type: String,
      default: "/images/defaultProfileImage.png", // Fixed typo here
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next(); // Fixed this line

  const salt = randomBytes(17).toString("hex"); // Ensure salt is in hex format
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;

  next();
});

userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
    const user = await this.findOne({ email });
    if(!user) throw new Error('User not found!');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256', salt)
        .update(password)
        .digest('hex');

    if(hashedPassword !== userProvidedHash) throw new Error('Incorrect Password!');

    const token = createTokenForUser(user);
    return token;
});

const User = model("user", userSchema); // Changed model name to User

module.exports = User;