// implement your posts router here
const Post = require('./posts-model');
const express = require('express');

const router = express.Router();

// Posts Endpoints

// | 1 | GET    | /api/posts              | Returns **an array of all the post objects** contained in the database                                                          |
router.get('/', (req,res) => {
    Post.find(req.query)
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ message: "The posts information could not be retrieved" })
        });
});

// | 2 | GET    | /api/posts/:id          | Returns **the post object with the specified id**                                                                               |
router.get('/:id', (req,res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist" });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ message: "The post information could not be retrieved" });
        });
});

// | 3 | POST   | /api/posts              | Creates a post using the information sent inside the request body and returns **the newly created post object**                 |
router.post('/', (req, res) => {
    const newPost = req.body;
    if(!newPost.title || !newPost.contents){
        res.status(400).json({ message: "Please provide title and contents for the post" });
    }else{
        Post.insert(newPost)
            .then(({id}) => {
                return Post.findById(id)
            })
            .then(post => {
                res.status(201).json(post)
            })
            .catch(err => {
                res.status(500).json({ message: "There was an error while saving the post to the database" });
            })  
    }
})

// | 4 | PUT    | /api/posts/:id          | Updates the post with the specified id using data from the request body and **returns the modified document**, not the original |
router.put('/:id', async (req, res) => {
    const {id} = req.params;
    // const {title, contents} = req.body
    const changes = req.body;
    try{
        if(!changes.title || !changes.contents){
            res.status(400).json({ message: "Please provide title and contents for the post" });
        }else{
            const updatedPost = await Post.findById(id)
            if(!updatedPost){
                res.status(404).json({ message: "The post with the specified ID does not exist" });
            }else{
                await Post.update(id, changes)
                const updatedPost = await Post.findById(id)
                res.status(200).json(updatedPost)
            }
        }
    }catch(err){
        res.status(500).json({ message: "The post information could not be modified" });
    }
})

// | 5 | DELETE | /api/posts/:id          | Removes the post with the specified id and returns the **deleted post object**                                                  |
router.delete('/:id', async (req, res) => {
    try{
        const deletedPost = await Post.findById(req.params.id)
        if(!deletedPost){
            res.status(404).json({ message: "The post with the specified ID does not exist" });
        }else{
            await Post.remove(req.params.id)
            res.status(200).json(deletedPost)
        }
    }catch(err){
        res.status(500).json(err);
    }
});

// | 6 | GET    | /api/posts/:id/comments | Returns an **array of all the comment objects** associated with the post with the specified id                                  |
router.get('/:id/comments', async (req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            res.status(404).json({ message: "The post with the specified ID does not exist" });
        }else{
            const postComments = await Post.findPostComments(req.params.id)
            res.status(200).json(postComments)
        }
    }catch(err){
        res.status(500).json(err);
    }
})
module.exports = router;