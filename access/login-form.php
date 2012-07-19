<?php
  //this code here is for the logout as the logout redirects to login
  //Start session
  session_start();
  
  //Unset the variables stored in session
  unset($_SESSION['SESS_MEMBER_ID']);
  unset($_SESSION['SESS_FIRST_NAME']);
  unset($_SESSION['SESS_LAST_NAME']);

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Task-Tracker Login</title>
  <meta http-equiv="content-type" content="text/html; charset=iso-8859-1" />
  <link rel="stylesheet" type="text/css" href="../css/login.css" />
</head>

<body>
  <div id="wrapper">
    <div id="loginForm">
      <form name="loginForm" class="box login" method="post" action="login-exec.php">
        <fieldset class="boxBody">
          <label>Username</label> <input type="text" name="login" id="login" tabindex="1" placeholder="Username" required="" /><label><a href="forgot-form.php" class="rLink" tabindex="5">Forgot your password?</a>Password</label> <input name="password" type="password" id="password" tabindex="2" required="" />
        </fieldset>
		<footer>
			<div class="submit">
			  <input type="submit" name="Submit" class="btnLogin" value="Login" tabindex="4" />
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
        <p>No account yet?</p>

        <div class="rightbut">
          <a href="register-form.php">Register</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>