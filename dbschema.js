let db = {
    "posts": [
        {
            userHandle:'user',                                  //User Owner of the posts
            body:'This is the post body',                       //Body of the post
            createdAt: "2020-04-24T20:10:32.599Z",              //Time the post was created
            likeCount: 5,
            commentCount: 2             
        }
    ],
    "users":[
        {
            userId: '6Mjpd2Rj6OdRK2aWJBT8HBYMzhR2',
            email: 'user2@email.com',
            handle: 'new2',
            createdAt: '2020-04-24T21:06:27.126Z',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/socialapp-1439f.appspot.com/o/229721008697.png?alt=media',
            bio: 'Hello, my name is user, nice to meet you!',
            website:'https://user.com',
            location: 'Debrecen, HU'
        }
    ],
    "comments": [
        {
            userHandle:'user',
            screamID: 'sdadsaiopda',
            body: 'dasdsokpa',
            createdAt: '2020-04-24T21:06:27.126Z'
        }
    ],
    "notifications":[
        {
            reciepient: 'user',
            sender: 'john',
            read: 'true | false',
            postId: 'dsadjasiodsadjsa',
            type: 'like | comment',
            createdAt: '2020-05-05T22:06:27.126Z'
        }
    ]
};