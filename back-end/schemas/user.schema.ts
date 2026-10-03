import mongoose, { Schema } from "mongoose";

import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Електронна пошта повинна мати правильний формат",
      ],
    },
    firstName: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return v.length >= 2 && v.length <= 15;
        },
        message: () => `Ім'я має бути довжиною від 2 до 15 символів`,
      },
    },
    lastName: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return v.length >= 2 && v.length <= 25;
        },
        message: () => `Прізвище має бути довжиною від 2 до 25 символів`,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super", "admin", "manager", "worker", "user"],
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePasswords = function (pass: string) {
  return bcrypt.compare(pass, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
