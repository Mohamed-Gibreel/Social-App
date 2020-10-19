const functions = require('firebase-functions');

const app = require('express')();

const { db } = require('./util/admin');

const FBAuth = require('./util/FBAuth')

const {getAllPosts , createPost, getPost, commentOnPost, likePost, unlikePost, deletePost} = require('./handlers/posts')
const {signUp, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead} = require('./handlers/users')

//Post routes
app.get('/posts', getAllPosts);                     //Getting All posted posts
app.post('/post', FBAuth, createPost);              //Creating a post and publish it

app.get('/post/:postId', getPost);
app.post('/post/:postId/comment',FBAuth, commentOnPost);
app.get('/post/:postId/like',FBAuth, likePost);
app.get('/post/:postId/unlike',FBAuth, unlikePost);
app.delete('/post/:postId',FBAuth, deletePost);

//Users Routes
app.post('/signup',signUp)                          //Signing up a new user
app.post('/login', login)                           //Logging in a new user
app.post('/user/profileImg',FBAuth, uploadImage)    //Uploading profile picture to a user
app.post('/user', FBAuth, addUserDetails)           //Adding Bio,Website and location to user details
app.get('/user', FBAuth, getAuthenticatedUser)      //Getting all profile details of an authenticated user.
app.get('/user/:handle',getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead)

exports.api = functions.region('europe-west1').https.onRequest(app);

exports.createNotificationOnLike = functions.region('europe-west1').firestore.document('/likes/{id}')
    .onCreate((snapshot) => {
        db.doc(`/posts/${snapshot.data().postId}`).get()
            .then( doc => {
                if(doc.exists){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        read: false,
                        postId: doc.id,
                        type: 'like',
                    })
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err)
                return;
            })
});

exports.deleteNotificationsOnUnlike = functions.region('europe-west1').firestore.document('/likes/{id}')
    .onDelete(snapshot => {
        db.doc(`/notifications/${snapshot.id}`).delete()
            .then(()=>{
            return res.json({message: 'Notification deleted successfully!'});
        })
        .catch(err =>{
            console.error(err);
            return res.status('500').json({err: error});
        })
});

exports.createNotificationOnComment = functions.region('europe-west1').firestore.document('/comments/{id}')
    .onCreate((snapshot) => {
        db.doc(`/posts/${snapshot.data().postId}`).get()
            .then( doc => {
                if(doc.exists){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        read: false,
                        postId: doc.id, 
                        type: 'comment',
                    })
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err)
                return;
            })
});