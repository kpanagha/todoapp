const router = require("express").Router();
const List = require("../models/list.js");
const User = require("../models/user.js");

//create
router.post("/addTask", async (req, res) => {
  try {
    // console.log(req.body);
    const { title, id } = req.body;
    const existingUser = await User.findById(id);
    if (existingUser) {
      const list = new List({ title, user: existingUser });
      await list.save().then(() => res.status(200).json({ list }));
      existingUser.list.push(list);
      existingUser.save();
    }
  } catch (error) {
    console.log(error);
  }
});
  // router.put("/updateTask/:id", async (req, res) => {
  //   try {
  //     console.log(req.body,"hii");
  //     const { task } = req.body;
  //     console.log(req.params.id);
  //     const list = await List.findByIdAndUpdate(req.params.id, { title:task },{new:true});
  //     list.save().then(() => res.status(200).json({ message: "Task Updated" }));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
  router.put("/updateTask/:id", async (req, res) => {
    try {
      console.log(req.body,"hii");
      const { task } = req.body;
      console.log(req.params.id);
      const list = await List.findByIdAndUpdate(req.params.id, { title:task },{new:true});
      list.save().then(() => res.status(200).json({ message: "Task Updated" }));
    } catch (error) {
      console.log(error);
    }
  });
  router.delete("/deleteTask/:id", async (req, res) => {
    try {
      // console.log(req.body,"iddd");
      // console.log(req.params.id);
      await List.findByIdAndDelete(req.params.id).then(() =>
      res.status(200).json({ message: "Task Deleted" })
    );
     
    } catch (error) {
      console.log(error);
    }
  });
//   const deleteTask = async (id, userId) => {
//     try {
//         const response = await axios.delete(`http://localhost:1000/api/v2/deleteTask/${id}/${userId}`);
//         console.log(response);
//         if (response.status === 200) {
//             setTodos(todos.filter((todo) => todo._id !== id));
//         } else {
//             console.error('Failed to delete task. Server returned status:', response.status);
//         }
//     } catch (error) {
//         console.error('Error deleting task:', error);
//         if (error.response) {
//             console.error('Response data:', error.response.data);
//             console.error('Response status:', error.response.status);
//             console.error('Response headers:', error.response.headers);
//         }
//     }
// };

  router.get("/getTasks/:id", async (req, res) => {
    const list = await List.find({ user: req.params.id }).sort({ createdAt: -1 });
    if (list.length !== 0) {
      res.status(200).json({ list });
    } else {
      res.status(200).json({ message: "No tasks found" });
    }
  });



module.exports = router;