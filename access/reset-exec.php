<?php

       //Start session
       session_start();

       //Include database connection details
       require_once('config.php');
       
       // set the default timezone to use.
       date_default_timezone_set('UTC');
       $now = time();

       //Function to sanitize values received from the form. Prevents SQL injection
       function clean($str) {
               $str = @trim($str);
               if(get_magic_quotes_gpc()) {
                       $str = stripslashes($str);
               }
               return mysql_real_escape_string($str);
       }

       //Sanitize the POST values
       $email = clean($_POST['email']);
       $login = clean($_POST['login']);
       $password = clean($_POST['password']);
       $cpassword = clean($_POST['cpassword']);

       //Array to store validation errors
       $errmsg_arr = array();
       
       //Validation error flag
       $errflag = false;

       if($email == '') {
               $errmsg_arr[] = 'Email address missing';
               $errflag = true;
       }
       if($login == '') {
               $errmsg_arr[] = 'Login ID missing';
               $errflag = true;
       }
       if($password == '') {
               $errmsg_arr[] = 'Password missing';
               $errflag = true;
       }
       if($cpassword == '') {
               $errmsg_arr[] = 'Confirm password missing';
               $errflag = true;
       }
       if( strcmp($password, $cpassword) != 0 ) {
               $errmsg_arr[] = 'Passwords do not match';
               $errflag = true;
       }


       //Connect to mysql server
       $link = mysql_connect(DB_HOST, DB_USER, DB_PASSWORD);
       if(!$link) {
               die('Failed to connect to server: ' . mysql_error());
       }
       
       //Select database
       $db = mysql_select_db(DB_DATABASE);
       if(!$db) {
               die("Unable to select database");
       }
       
       //Check email address against user and pickup timestamp
       if($email != '') {
               $qry="SELECT u_timestamp FROM tt_users WHERE u_email='$email' AND u_username='$login'";
               //$qry = "SELECT * FROM tt_users WHERE u_email='$email'";
               $result = mysql_query($qry);
               if($result) {
                       if(mysql_num_rows($result) > 0) {
                               //Valid account
                               $row = mysql_fetch_assoc($result);
                               $ts = $row["u_timestamp"];
                               //$24hourlater = time() + (1 * 24 * 60 * 60);
                               //To get the difference in days we have to divide by 86400 ( 24 x 60 x 60 )
                               $diff = ($now-$ts)/86400;
                               if ($diff < 0 || $diff > 1) {
                               		$errmsg_arr[] = 'Authentication session is expired';
                              		$errflag = true;
                               }
                               @mysql_free_result($result);
                       } else {
                              $errmsg_arr[] = 'You don’t seem to have a valid account, please contact info@t.oolbox.com';
                              $errflag = true;
                       }
               } else {
                  die("Mail query failed");
                  $errflag = true;
               }
       } else {
          $errmsg_arr[] = 'Contact info@t.oolbox.com';
          $errflag = true;
       }
       
       //If there are input validations, redirect back to the registration form
       if($errflag) {
		   $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
		   session_write_close();
		   header("location: register-form.php");
		   exit();
       } else {
		   //save new pass in the database
		   $qry = "UPDATE tt_users SET u_password='$password', u_temppass='' WHERE u_email='$email'";
		   $result = @mysql_query ($qry); // Run the query. 
		   if (mysql_affected_rows() == 1) { // If it ran OK.
				   @mysql_free_result($result);
				   //login
				   $qry="SELECT * FROM tt_users WHERE u_email='$email'";
				   $result=mysql_query($qry);
				   //Check whether the query was successful or not
				   if($result) {
						   if(mysql_num_rows($result) == 1) {
								   //Login Successful
								   session_regenerate_id();
								   $member = mysql_fetch_assoc($result);
								   $_SESSION['SESS_MEMBER_ID'] = $member['u_id'];
								   $_SESSION['SESS_FIRST_NAME'] = $member['u_firstname'];
								   $_SESSION['SESS_LAST_NAME'] = $member['u_lastname'];
								   session_write_close();
								   header("location: ../index.php");
								   exit();
						   } else {
								   //Login failed
								   header("location: login-failed.php");
								   exit();
						   }
				   } else {
						   die("Query failed");
				   }
			} else {
				   $errmsg_arr[] = 'Query failed';
				   $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
				   session_write_close();
				   header("location: reset-form.php");
				   exit();
		   }
       }
?>