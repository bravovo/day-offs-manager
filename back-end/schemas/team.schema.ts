import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    maxOff: {
      type: Number,
      required: true,
    },
    maxSick: {
      type: Number,
      required: true,
    },
    system: {
      type: String,
      required: true,
      enum: ["all-in", "accum"],
    },
    members: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["super", "admin", "manager", "worker"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
