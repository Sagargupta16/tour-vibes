import React from 'react'
import classes from './navbar.module.css'

const navbar = () => {
  return (
    <div className={classes.nav_main}>
        <div className={classes.nav_logo}>
            <h1>Tour Vibes</h1>
        </div>
        <div className={classes.nav_links}>
            <div>
                <a href='/'>My Journals</a>
                <a href='/'>Feeds</a>
                <a href='/'>Favorites</a>
            </div>
            <div>
                <a href='/'>Sign In</a>
                <a href='/'>Sign Up</a>
            </div>
        </div>
    </div>
  )
}

export default navbar
