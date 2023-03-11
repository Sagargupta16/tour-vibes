import React from 'react'
import classes from './blog.module.css'

const blog = (props) => {
    const {Title , Content , Author , Date , Image} = props;
  return (
    <div className={classes.blog_main}>
        
        <div className={classes.blog_container}>
            <div className={classes.blog_title}>
                <h1>{Title}</h1>
            </div>
            <div className={classes.blog_image}>
                <img src= {Image} alt="blog_image" />
            </div>
            <div className={classes.blog_content}>
                <p>{Content}</p>
            </div>
            <div className={classes.blog_author}>
                <p>{Author}</p>
            </div>
            <div className={classes.blog_date}>
                <p>{Date}</p>
            </div>
        </div>
    </div>
  )
}

export default blog
