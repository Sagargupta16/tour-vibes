import React from 'react';

import './Paginator.css';

const paginator = (props) => (
  <>
    <div className="paginator">{props.children}</div>
    <div className="paginator__controls">
      {props.currentPage > 1 && (
        <button className="paginator__control" onClick={props.onPrevious}>
          Previous
        </button>
      )}
      {props.currentPage < props.lastPage && (
        <button className="paginator__control" onClick={props.onNext}>
          Next
        </button>
      )}
    </div>
  </>
);

export default paginator;
