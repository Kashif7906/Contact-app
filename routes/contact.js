const { validateContact, Contact } = require("../models/Contact");
const auth = require("../middlewares/auth");

const mongoose = require("mongoose");
const router = require("express").Router();

// create contact.
router.post("/contact", auth, async (req, res) => {
  const { error } = validateContact(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, address, email, phone } = req.body;

  try {
    const newContact = new Contact({
      name,
      address,
      email,
      phone,
      postedBy: req.user._id,
    });
    const result = await newContact.save();

    return res.status(201).json({ ...result._doc });
  } catch (err) {
    console.log(err);
  }
});

//get contact.
// router.get("/mycontacts", auth, async (req, res) => {

//   try {
//     const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
//       "postedBy",
//       "-password"
//     );

//     return res.status(200).json({ contacts: myContacts.reverse() });
//   } catch (err) {
//     console.log(err);
//   }
// });


// get paginated results
router.get("/mycontacts", auth, async (req, res) => {

  try {
    const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 5;
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    ).skip(page * limit)
    .limit(limit);

    const response={
      page:page+1,
      limit,
      myContacts,
    }

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
});



// update contact.
router.put("/contact", auth, async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "no id specified." });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await Contact.findOne({ _id: id });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't edit other people contacts!" });

    const updatedData = { ...req.body, id: undefined };
    const result = await Contact.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    return res.status(200).json({ ...result._doc });
  } catch (err) {
    console.log(err);
  }
});

// delete a contact by id
router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });
  try {
    const contact = await Contact.findOne({ _id: id });
    if (!contact) return res.status(400).json({ error: "no contact found" });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't delete other people contacts!" });

    const result = await Contact.deleteOne({ _id: id });
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );

    return res
      .status(200)
      .json({ ...contact._doc, myContacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});

// search by id.
router.get("/contactById/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await Contact.findOne({ _id: id });

    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
  }
});
//search by email
router.get("/contactByEmail/:emailID", auth, async (req, res) => {
  const { emailID } = req.params;

  if (!emailID) return res.status(400).json({ error: "no email specified." });

  if (!mongoose.isValidObjectId(emailID))
    return res.status(400).json({ error: "please enter a valid email" });

  try {
    const contact = await Contact.findOne({ email: emailID });

    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;