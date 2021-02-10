const functions = require("firebase-functions");

const app = require("express")();

const { db } = require("./util/admin");

const FBAuth = require("./util/FBAuth");

const cors = require("cors");
app.use(cors());

const {
  getAllPosts,
  createPost,
  getPost,
  commentOnPost,
  likePost,
  unlikePost,
  deletePost,
} = require("./handlers/posts");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");

//Post routes
app.get("/posts", getAllPosts); //Getting All posted posts
app.post("/post", FBAuth, createPost); //Creating a post and publish it

app.get("/post/:postId", getPost);
app.post("/post/:postId/comment", FBAuth, commentOnPost);
app.get("/post/:postId/like", FBAuth, likePost);
app.get("/post/:postId/unlike", FBAuth, unlikePost);
app.delete("/post/:postId", FBAuth, deletePost);

//Users Routes
app.post("/signup", signUp); //Signing up a new user
app.post("/login", login); //Logging in a new user
app.post("/user/profileImg", FBAuth, uploadImage); //Uploading profile picture to a user
app.post("/user", FBAuth, addUserDetails); //Adding Bio,Website and location to user details
app.get("/user", FBAuth, getAuthenticatedUser); //Getting all profile details of an authenticated user.
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.region("europe-west1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("/likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            read: false,
            postId: doc.id,
            type: "like",
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.deleteNotificationsOnUnlike = functions
  .region("europe-west1")
  .firestore.document("/likes/{id}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .then((res) => {
        return res.json({ message: "Notification deleted successfully!" });
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.createNotificationOnComment = functions
  .region("europe-west1")
  .firestore.document("/comments/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            read: false,
            postId: doc.id,
            type: "comment",
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.onUserImageChange = functions
  .region("europe-west1")
  .firestore.document("/users/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());

    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("Image has changed!");
      let batch = db.batch();
      return db
        .collection("/posts")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const post = db.doc(`/posts/${doc.id}`);
            batch.update(post, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err });
        });
    } else return true;
  });

exports.onPostDelete = functions
  .region("europe-west1")
  .firestore.document(`/posts/{postId}`)
  .onDelete((snapshot, context) => {
    const postId = context.params.postId;
    let batch = db.batch();
    return db
      .collection("/comments")
      .where("postId", "==", postId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          console.log("Comment being deleted");
          console.log(doc.data());
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("/likes").where("postId", "==", postId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          console.log("Like being deleted");
          console.log(doc.data());
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("/notifications")
          .where("postId", "==", postId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          console.log("Notification being deleted");
          console.log(doc.data());
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err });
      });
  });
