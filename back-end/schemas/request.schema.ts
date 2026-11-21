import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Team",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    halfDay: {
      type: Boolean,
      required: false,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["day", "sick"],
    },
    description: String,
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
