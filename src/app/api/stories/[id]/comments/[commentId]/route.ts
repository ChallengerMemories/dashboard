import { NextResponse } from "next/server";
import dbConnect from "@/lib/redux/dbConnect"; // Ensure path matches your database setup
import Story from "@/models/Story";

// PATCH /api/stories/[id]/comments/[commentId] - Update comment status or content
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const body = await req.json();
    const { status, name, text } = body;

    await dbConnect();

    // 1. Fetch the story document
    const story = await Story.findById(id);

    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    // 2. Use Mongoose's .id() subdocument helper to automatically handle ObjectId lookup
    const comment = story.comments.id(commentId);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    // 3. Update fields
    if (status !== undefined) comment.status = status;
    if (name !== undefined) comment.name = name;
    if (text !== undefined) comment.text = text;

    // 4. Save the story document (this enforces schema enum validations and updates DB)
    await story.save();

    return NextResponse.json(
      { message: "Comment updated successfully.", comment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update comment." },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/[id]/comments/[commentId] - Delete comment
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;

    await dbConnect();

    // Fetch the story document
    const story = await Story.findById(id);

    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    const comment = story.comments.id(commentId);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    // Remove subdocument using Mongoose's .pull()
    story.comments.pull(commentId);
    await story.save();

    return NextResponse.json(
      { message: "Comment deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete comment." },
      { status: 500 }
    );
  }
}