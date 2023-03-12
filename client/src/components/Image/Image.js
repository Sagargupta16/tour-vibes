import React from 'react';

import './Image.css';

const Image = props => (
  <div
    className="image"
    style={{
      backgroundImage: `url('${props.imageUrl}')`,
      backgroundSize: props.contain ? 'contain' : 'cover',
      backgroundPosition: props.left ? 'left' : 'center'
    }}
  />
);

export default Image;
