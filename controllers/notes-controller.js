const asyncHandler = require("express-async-handler");
const Note = require("../models/Note");
const User = require("../models/User");

// @desc Get All Notes
// @route GET /notes
// @acess Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();

  if (!notes?.length) {
    return res.status(400).json({ message: "Notes not found" });
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  console.log(notesWithUser);

  res.json(notesWithUser);
});

// @desc Post Note
// @route POST /notes
// @acess Private
const createNewNote = asyncHandler(async (req, res) => {
  const { userid, title, text } = req.body;
  console.log("create note [POST]");
  console.log(userid);
  console.log(req.body)

  if (!userid || !title || !text) {
    return res.status(400).json({ message: "All fileds are required" });
  }

  const note = await Note.create({ title, text, user: userid });
  if (note) {
    res.json({ message: `Note ${note.title} created` });
  } else {
    res.status(400).json({ message: "Invalid note data recieved" });
  }
});

// @desc Update Note
// @route PATCH /notes
// @acess Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, title, text, completed } = req.body;
  if (!id || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note note found" });
  }

  note.title = title;
  note.text = text;
  if (completed) {
    note.completed = completed;
  }
  const updatedNote = await note.save();
  res.json({ message: `Note ${updatedNote.title} updated` });
});

// @desc Delete Note
// @route DELETE /notes
// @acess Private
const deleteNote = asyncHandler(async (req, res) => {
  const id = req.body.id;

  if (!id) {
    return res.status(400).json({ message: "Note ID is required" });
  }

  const note = await Note.findById(id).exec();
  console.log(note);
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }
  const result = await note.deleteOne();
  const reply = `Note ${result.title} deleted`;
  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
