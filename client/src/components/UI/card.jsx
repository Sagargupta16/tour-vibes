import React from 'react'
import classes from './card.module.css'

const card = (props) => {
    const {title, date, content, image} = props.data;
  return (
    <div className={classes.card_main}>
        <div className={classes.card_image}>
            <img src={image} alt="card_image"/>
        </div>
        <div className={classes.card_title}>
            <h1>{title}</h1>
        </div>
        <div className={classes.card_date}>
            <h2>{date}</h2>
        </div>
        <div className={classes.card_content}>
            <p>{content}</p>
        </div>
    </div>
  )
}

export default card
