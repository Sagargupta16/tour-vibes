import React from 'react'
import classes from './signinup.module.css'

const signin = () => {
  	
  return (
    <div className={classes.signinup_main}>
	  <div className={classes.signinup_container}>
		<div className={classes.signin_form}>
		  <h1>Sign In</h1>
		  <form>
			  <input type="email" name="email" id="email" placeholder="Enter your email" />
			  <input type="password" name="password" id="password" placeholder="Enter your password" />
			  <button type="submit">Sign In</button>
		  </form>
		  <div className={classes.signin_form_footer}>
			  <p>Don't have an account? <a href="/signup">Sign Up</a></p>
		  </div>
		</div>
		<div className={classes.signup_form}>
		  <h1>Sign Up</h1>
		  <form>
			  <input type="text" name="name" id="name" placeholder="Enter your name" />
			  <input type="email" name="email" id="email" placeholder="Enter your email" />
			  <input type="password" name="password" id="password" placeholder="Enter your password" />
			  <button type="submit">Sign Up</button>
		  </form>
		  <div className={classes.signup_form_footer}>
			  <p>Already have an account? <a href="/signin">Sign In</a></p>
		</div>
		</div>
	</div>
      
    </div>
  )
}

export default signin;
