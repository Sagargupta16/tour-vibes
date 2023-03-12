import React from 'react';

import Button from '../../Button/Button';
import './Post.css';

const post = props => (
  <article className="post">
    <header className="post__header">
      <h3 className="post__meta">
        Posted by {props.author} on {props.date}
      </h3>
      <h1 className="post__title">{props.title}</h1>
    </header>
    <div className="post__image">
      <img src={ "http://localhost:8000/"+props.image} alt={props.title} />
    </div>
    <div className="post__content">{props.content}</div>
    <div className="post__actions">
      <Button mode="flat" link={`feeds/`+props.id}>
        View
      </Button>
      {/* <Button mode="flat" onClick={props.onStartEdit}>
        Edit
      </Button>
      <Button mode="flat" design="danger" onClick={props.onDelete}>
        Delete
      </Button> */}
    </div>
  </article>
);

export default post;
