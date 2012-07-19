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
$email = clean($_POST['email']);

//Input Validations
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
                       $member = mysql_fetch_assoc($result);
                       $firstname = $member['u_firstname'];
                       $username = $member['u_username'];
                       // Get a timestamp
                       $ts = time();
                       // Create a new, random password
                       $p = substr (MD5(uniqid(rand(),1)), 3, 10);
               } else {
                       $errmsg_arr[] = 'User not found in database';
                       $errflag = true;
               }
               @mysql_free_result($result);
       }
       else {
               $errmsg_arr[] = 'Request password query failed';
               $errflag = true;
       }
}

//If there are input validations, redirect back to the registration form
if($errflag) {
       $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
       session_write_close();
       header("location: forgot-form.php");
       exit();
} else {
       //create query
       $qry = "UPDATE tt_users SET u_timestamp='$ts', u_temppass=MD5('$p') WHERE u_email='$email' ";
       $result = @mysql_query ($qry); // Run the query. 
       if (mysql_affected_rows() == 1) { // If it ran OK.
               $resetToken = "?MT=".MD5($p);
               $resetURL = BASE_URL.RESET_FILE.$resetToken;
               emailpass($firstname, $email, $resetURL);
       } else {
               $errmsg_arr[] = 'Reset password query failed';
               $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
               session_write_close();
               header("location: forgot-form.php");
               exit();
       }
}

function emailpass($firstname, $email, $resetURL){
        $subject = "Task-Tracker | Password reset";
        $body = "Hi ".$firstname.",\n";
        $body .= "Someone (hopefully you) has requested to reset your password at Task-Tracker. \n";
        $body .= "If you did not request this reset, please ignore this message.\n";
        $body .= "\nTo reset your password, please visit the following page:\n";
        $body .= $resetURL." \n";
        $body .= "\nWhen you visit the above page (which you must do within 24 hours), you will be prompted to enter a new password. After you have submitted the form, you can log in normally using the new password you set.\n";
        $body .= "\nKind regards from the Task-Tracker team\n";
        $body .= "info@t.oolbox.com";

        if (mail($email, $subject, $body)) {
               session_write_close();
               header("location: forgot-success.php");
               exit();
       } else {
               $errmsg_arr[] = 'Password delivery failed... Please contact us at info@t.oolbox.com';
               $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
               session_write_close();
               header("location: forgot-form.php");
               exit();
       }
}

?>