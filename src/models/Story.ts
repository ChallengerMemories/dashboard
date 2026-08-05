import mongoose, { Schema } from 'mongoose';

const storySchema = new Schema({
  name:      { type: String, required: true },
  email:     { type: String },
  title:     { type: String, required: true },
  narrative: { type: String, required: true },
  mission:   { type: String, enum: ["challenger", "columbia"], required: true },
  country:   { type: String },
  state:     { type: String },
  imageUrl:  { type: String },

  // Media attachments
  media: [
    {
      url:  { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
    },
  ],

  // ✅ Added comments subdocument array
  comments: [
    {
      name: { type: String, required: true },
      email: { type: String },
      text: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  category: { type: String, enum: ["public", "heritage"], default: "public" },
  relation: {
    type: String,
    enum: ["immediate-family", "friend", "colleague", "public-observer"],
    default: "public-observer",
  },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "published", "archived"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// Bust model cache so schema updates apply immediately
delete (mongoose.models as any).Story;
const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

export default Story;