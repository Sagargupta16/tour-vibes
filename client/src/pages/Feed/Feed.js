import React, { Fragment } from 'react';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import useFeed from '../../hooks/useFeed';
import './Feed.css';

function Feed({ token, name }) {
   const {
      posts,
      postsLoading,
      isEditing,
      editPost,
      editLoading,
      error,
      setError,
      goToPage,
      startEdit,
      cancelEdit,
      finishEdit,
      deletePost,
      lastPage,
      postPage
   } = useFeed(token, 'http://localhost:8000/feed/posts');

   return (
      <Fragment>
         <ErrorHandler error={error} onHandle={() => setError(null)} />
         <FeedEdit
            editing={isEditing}
            selectedPost={editPost}
            loading={editLoading}
            onCancelEdit={cancelEdit}
            onFinishEdit={finishEdit}
         />
         <p className="text">Welcome {name || localStorage.getItem('name')}!</p>
         <section className="feed__control">
            <Button
               mode="raised"
               design="accent"
               onClick={() => {
                  cancelEdit();
                  startEdit(null);
               }}
            >
               New Post
            </Button>
         </section>
         <section className="feed">
            {postsLoading && (
               <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <Loader />
               </div>
            )}
            {posts.length === 0 && !postsLoading && <p className="no-post">No posts found.</p>}
            {!postsLoading && (
               <Paginator
                  onPrevious={() => goToPage('previous')}
                  onNext={() => goToPage('next')}
                  lastPage={lastPage}
                  currentPage={postPage}
               >
                  {posts.map((post) => (
                     <Post
                        key={post._id}
                        id={post._id}
                        author={post.creator.name}
                        date={new Date(post.createdAt).toLocaleDateString('en-US')}
                        title={post.title}
                        image={post.imageUrl}
                        content={post.content}
                        onStartEdit={() => startEdit(post._id)}
                        onDelete={() => deletePost(post._id)}
                     />
                  ))}
               </Paginator>
            )}
         </section>
      </Fragment>
   );
}

export default Feed;
