<?php
  session_start();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="content-type" content="text/html; charset=iso-8859-1" />

  <title>Task-Tracker Register</title>
  <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
  <link rel="stylesheet" type="text/css" href="../css/login.css" />
</head>

<body>
  <div id="wrapper">
    <div id="loginForm">
      <form name="loginForm" class="box login" method="post" action="register-exec.php">
        <?php
			if( isset($_SESSION['ERRMSG_ARR']) && is_array($_SESSION['ERRMSG_ARR']) && count($_SESSION['ERRMSG_ARR']) >0 ) {
			  echo '<div class="fail"><p><strong>Register Failed</strong><br/>';
			  foreach($_SESSION['ERRMSG_ARR'] as $msg) {
				echo $msg,'<br />'; 
			  }
			  unset($_SESSION['ERRMSG_ARR']);
			  echo '</p></div>';
			}
		?>

        <fieldset class="boxBody">
          <label>First Name</label> <input type="text" name="fname" id="fname" tabindex="1" placeholder="First Name" required="" /><label>Last Name</label> <input type="text" name="lname" id="lname" tabindex="2" placeholder="Last Name" required="" /><label>Email address</label> <input type="text" name="email" id="email" tabindex="3" placeholder="user@domain.com" required="" /><label>Username</label> <input type="text" name="login" id="login" tabindex="4" placeholder="Username" required="" /><label>Password</label> <input name="password" type="password" id="password" tabindex="5" placeholder="Password" required="" /><label>Confirm Password</label> <input name="cpassword" type="password" id="cpassword" tabindex="6" placeholder="Password" required="" />
        </fieldset>
	
		<footer>
			<div class="submit">
			  <input type="submit" name="Submit" class="btnLogin" value="Register" tabindex="7" />
			</div>
		</footer>
		
      </form>
    </div>

    <div id="right-wrapper">
      <div id="logo">
        <a href="<?php echo BASE_URL ?>">
        <div class="rightbut">
        	<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="61px" height="61px" viewBox="0 0 61 61" enable-background="new 0 0 61 61" xml:space="preserve">
            <path class="svglogo" d="M60.792,30.396c0,16.789-13.608,30.396-30.396,30.396S0,47.185,0,30.396C0,13.609,13.608,0,30.396,0S60.792,13.609,60.792,30.396z M10,20v9h40v-9H10z M19,51h27v-9H19V51z M19,31v9h19v-9H19z M38.078,9H18.975v9h19.104V9z"/>
          </svg>
        </div>
        </a>
      </div>

      <div id="reglog">
        <p>Allready have an account?</p>

        <div class="rightbut">
          <a href="login-form.php">Login</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
