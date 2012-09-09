<?php
       //Start session
       session_start();
       
       //Include database connection details
       require_once('config.php');
       
       //Array to store validation errors
       $errmsg_arr = array();
       
       //Validation error flag
       $errflag = false;
       
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
       
       //Function to sanitize values received from the form. Prevents SQL injection
       function clean($str) {
               $str = @trim($str);
               if(get_magic_quotes_gpc()) {
                       $str = stripslashes($str);
               }
               return mysql_real_escape_string($str);
       }
       // function to validate an email address
       function validEmail($email) {
          /*
          Returns false if the email address is valid!
          */
          $isValid = false;
          $atIndex = strrpos($email, "@");
          if (is_bool($atIndex) && !$atIndex) {
                 $isValid = true;
          } else {
                 $domain = substr($email, $atIndex+1);
                 $local = substr($email, 0, $atIndex);
                 $localLen = strlen($local);
                 $domainLen = strlen($domain);
                 if ($localLen < 1 || $localLen > 64) {
                        // local part length exceeded
                        $isValid = true;
                 } else if ($domainLen < 1 || $domainLen > 255) {
                        // domain part length exceeded
                        $isValid = true;
                 }  else if ($local[0] == '.' || $local[$localLen-1] == '.') {
                        // local part starts or ends with '.'
                        $isValid = true;
                 } else if (preg_match('/\\.\\./', $local)) {
                        // local part has two consecutive dots
                        $isValid = true;
                 } else if (!preg_match('/^[A-Za-z0-9\\-\\.]+$/', $domain)) {
                        // character not valid in domain part
                        $isValid = true;
                 }  else if (preg_match('/\\.\\./', $domain)) {
                        // domain part has two consecutive dots
                        $isValid = true;
                 } else if (!preg_match('/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/', str_replace("\\\\","",$local))) {
                        // character not valid in local part unless 
                        // local part is quoted
                        if (!preg_match('/^"(\\\\"|[^"])+"$/', str_replace("\\\\","",$local))) {
                               $isValid = true;
                        }
                 } if ($isValid && !(checkdnsrr($domain,"MX") || checkdnsrr($domain,"A"))) {
                        // domain not found in DNS
                        $isValid = true;
                 }
          }
          return $isValid;
       }
       
       //Sanitize the POST values
       $fname = clean($_POST['fname']);
       $lname = clean($_POST['lname']);
       $email = clean($_POST['email']);
       $login = clean($_POST['login']);
       $password = clean($_POST['password']);
       $cpassword = clean($_POST['cpassword']);
       
       //Input Validations
       if($fname == '') {
               $errmsg_arr[] = 'First name missing';
               $errflag = true;
       }
       if($lname == '') {
               $errmsg_arr[] = 'Last name missing';
               $errflag = true;
       }
       if($lname == '') {
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
       if( validEmail($email) ) {
               $errmsg_arr[] = 'Email address not valid';
               $errflag = true;
       }
       
       //Check for duplicate email
       if($email != '') {
               $qry = "SELECT * FROM tt_users WHERE u_email='$email'";
               $result = mysql_query($qry);
               if($result) {
                       if(mysql_num_rows($result) > 0) {
                               $errmsg_arr[] = 'Email already in use';
                               $errflag = true;
                       }
                       @mysql_free_result($result);
               }
               else {
                       die("Mail query failed");
               }
       }

       //Check for duplicate login ID
       if($login != '') {
               $qry = "SELECT * FROM tt_users WHERE u_username='$login'";
               $result = mysql_query($qry);
               if($result) {
                       if(mysql_num_rows($result) > 0) {
                               $errmsg_arr[] = 'Username already in use';
                               $errflag = true;
                       }
                       @mysql_free_result($result);
               }
               else {
                       die("Login query failed");
               }
       }
       
       //If there are input validations, redirect back to the registration form
       if($errflag) {
               $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
               session_write_close();
               header("location: register-form.php");
               exit();
       }

       //Create INSERT query
       $qry = "INSERT INTO tt_users(u_firstname, u_lastname, u_email, u_username, u_password) VALUES('$fname','$lname','$email','$login','".md5($_POST['password'])."')";
       $result = @mysql_query($qry);
       
       //Check whether the query was successful or not
       if($result) {
               header("location: register-success.php");
               exit();
       }else {
               die("Query failed");
       }
?>