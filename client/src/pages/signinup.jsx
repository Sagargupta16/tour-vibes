import React from 'react'
import classes from './signinup.module.css'

const signin = () => {
  const signUpButton = document.getElementById('signUp');
	const signInButton = document.getElementById('signIn');
	const container = document.getElementById('container');

	signUpButton.addEventListener('click', () => {
		container.classList.add("right-panel-active");
	});
	signInButton.addEventListener('click', () => {
		container.classList.remove("right-panel-active");
	});
  return (
    <div className={classes.signin_main}>
      
      <div class="container" id="container">
      <div class="form-container sign-up-container">

      <form >
      	<h1>Create Account</h1>
      	 {/* <div class="social-container">
      		<a href="#" class="social"><i class="fa fa-facebook"></i></a>
      		<a href="#" class="social"><i class="fa fa-google"></i></a>
      		<a href="#" class="social"><i class="fa fa-linkedin"></i></a>
      	</div>
      	<span>or use your email for registration</span>  */}
      	<input type="text" name="name" placeholder="Name" required/>
      	<input type="number" name="phone" placeholder="Phone number" required/>
      	{/* <!-- <input type="tel" minlength="10" maxlength="10" name="phone" placeholder="Phone number" required> --> */}
      	<input type="password" name="password" placeholder="Password" required/>


      	<button >SignUp</button>
      </form>
      </div>
      <div class="form-container sign-in-container">
      	<form>
      		<h1>Sign In</h1>
      		{/* <!-- <div class="social-container">
      		<a href="#" class="social"><i class="fa fa-facebook"></i></a>
      		<a href="#" class="social"><i class="fa fa-google"></i></a>
      		<a href="#" class="social"><i class="fa fa-linkedin"></i></a>
      	</div>
      	<span>or use your account</span> --> */}
      	<input type="number" name="number" placeholder="phone number"/>
      	<input type="password" name="password" placeholder="Password"/>
      	<a href="#">Forgot Your Password</a>

      	<a href="card"><div style="background-color: #FF4B2B; text-decoration: none;border-radius: 30%;padding:1em;color: white;">Sign In</div></a>
      	</form>
      </div>
      <div class="overlay-container">
      	<div class="overlay">
      		<div class="overlay-panel overlay-left">
      			<h1>Welcome Back!</h1>
      			<p>To keep connected with us please login with your personal info</p>
      			<a href="card"><button class="ghost" id="signIn" >Sign In</button></a>
      		</div>
      		<div class="overlay-panel overlay-right">
      			<h1>Hello!</h1>
      			<p>Enter your details and start journey with us</p>
      			<button class="ghost" id="signUp">Sign Up</button>
      		</div>
      	</div>
      </div>
      </div>
    </div>
  )
}

export default signin;
