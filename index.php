<?php
	require_once('access/auth.php');
?>
	
<html>
<head>
	<title>Task Tracker</title>
	<!--  <script type="text/javascript" src="http://code.jquery.com/jquery-1.7.1.min.js"></script> -->
	<script type="text/javascript" src="js/jquery-1.6.4.js"></script>
	<script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat.js"></script>
	<script type="text/javascript" src="js/jquery.corner.js"></script>
	<script type="text/javascript" src="js/moautocomplete.js"></script>
	<script type="text/javascript" src="js/jQueryRotate.2.1.js"></script>
	<!-- <script type="text/javascript" src="js/jquery.color.js"></script> -->
	<script data-main="js/main" type="text/javascript" src="js/require.js"></script>
	<link href='http://fonts.googleapis.com/css?family=Ubuntu:300,400,500' rel='stylesheet' type='text/css'>
	<link href='css/styles.css' rel='stylesheet' type='text/css'>
	<script type="text/javascript" src="js/tt/tt.js"></script>
	<script type="text/javascript" src="js/tt/items.js"></script>
</head>
<body>
<div id="content">
<div>
<div>
	<ul id="filter-terms">
		<li class="term search"><a href="access/login-form.php">Log out <?php echo $_SESSION['SESS_FIRST_NAME'];?></a></li>
		<li class="term search"><a href="#" onclick="searchTerms()">filter:</a></li>
		<li><input id="filter-input" type="text" name="months" autocomplete="array:tags"></li>
	</ul></div>
	<div id="projects"></div>
	<div id="add-project">
		<a href="#">
			<img src="img/add-graphic.png">
		</a>
	</div> 
	</div>
	</div>
	<div id="background-cover">
	</div>
</body>

<div id="project-template" style="display:none;">
	<div class='project'>
		 <div class='projecthead head'> 
			<div class='countdown background-hue-faded'>
				<div class='countdown-number'></div>
				<div class='countdown-string'></div>
			</div>
			<div class='bars'>
				<div class="bars-cover"></div>
				<div class='title'></div>
				<div class='progressbar background-gradient-hue'>
					<div class='achieved background-hue'></div>
				</div>
				<div class='moneybar'>
					<div class='achieved'></div>
				</div>
			</div>
			<div class='openadmin background-hue'>
				<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="40px" height="40px" viewBox="5 5 40 40" enable-background="new 5 5 40 40" xml:space="preserve">
<path fill="#ffffff" d="M21.687,10.511l1.709,3.585l3.333,0.015l1.74-3.571l2.166,0.71l-0.74,3.897l2.688,1.955l3.522-1.873
	l1.334,1.837l-2.908,2.722l1.016,3.15l3.958,0.54l-0.01,2.262l-3.963,0.506l-1.047,3.145l2.887,2.744l-1.351,1.823l-3.505-1.898
	l-2.707,1.93l0.707,3.905l-2.174,0.689l-1.71-3.584l-3.331-0.016l-1.742,3.571l-2.167-0.707l0.741-3.899l-2.687-1.956l-3.522,1.873
	l-1.332-1.837L15.5,29.31l-1.016-3.151l-3.957-0.539l0.01-2.265l3.963-0.506l1.044-3.143l-2.884-2.746l1.349-1.825l3.506,1.905
	l2.707-1.933l-0.705-3.906L21.687,10.511l1.709,3.585 M33.127,23.311c-0.691-4.445-4.882-7.497-9.359-6.812
	c-4.478,0.685-7.551,4.843-6.863,9.29c0.69,4.445,4.881,7.494,9.36,6.811C30.743,31.915,33.816,27.755,33.127,23.311z"/>
</svg>
			</div>
			<div class='additem background-hue'>
				<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="40px" height="40px" viewBox="5 5 40 40" enable-background="new 5 5 40 40" xml:space="preserve">
<path fill="#ffffff" d="M26.437,35.871c0,0.659-0.404,1.191-0.904,1.191h-0.189c-0.5,0-0.905-0.532-0.905-1.191V13.253
	c0-0.658,0.404-1.19,0.905-1.19h0.189c0.5,0,0.904,0.533,0.904,1.19V35.871z"/>
<path fill="#ffffff" d="M37.969,24.659c0,0.512-0.533,0.924-1.193,0.924H14.1c-0.66,0-1.194-0.412-1.194-0.924v-0.193
	c0-0.511,0.534-0.924,1.194-0.924h22.675c0.66,0,1.193,0.413,1.193,0.924V24.659z"/>
</svg>
			</div>
		 </div> 
		<div class='project-body'>
			<div class='project-admin'>
				<div class='admin-container'>
					<!-- <div class='title-tooltip'>Click to edit title 
						<div class='tooltip-svg'>
							<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='20px' height='20px' viewBox='0 0 20 20' style='stroke:none;fill:#fe9;'><polyline points='0, 0, 20, 0, 10, 20, 0, 0'/></svg>
						</div>
					</div> -->
					<div class='title title-edit'><input type="text" name="title-input" class="title-input" value="" placeholder="Edit Project Title"></div>
					<table cellpadding='0' cellspacing='0'>
						<tr style='vertical-align:top'>
							<td>
								<div class='side-bar'>
									<div class='dials-container border-hue'>
										<div class='date-open'>
											<div class='dial-title'>Set Deadline</div>
											<div id='d0' class='dial unselectable background-hue' style='top:40px;'>
												<div class='dial-img'>
													<img src='img/dial.png' />
												</div>
												<div class='dial-cover'></div>
												<div class='dial-value unselectable'></div>
												<div class='dial-subtitle'>day</div>
											</div>
											<div id='d1' class='dial unselectable background-hue' style='top:110px;'>
												<div class='dial-img'>
													<img src='img/dial.png' />
												</div>
												<div class='dial-cover'></div>
												<div class='dial-value unselectable'></div>
												<div class='dial-subtitle'>month</div>
											</div>
											<div id='d2' class='dial unselectable background-hue' style='top:180px;'>
												<div class='dial-img'>
													<img src='img/dial.png' />
												</div>
												<div class='dial-cover'></div>
												<div class='dial-value unselectable'></div>
												<div class='dial-subtitle'>year</div>
											</div>
											<div class="admin-date-clear clearbutton background-hue" style='top:250px;'>
												<a href="#">CLEAR</a>
											</div>
										</div>
										<div class='date-closed'>
											<div class='dial-title'>Set Deadline</div>
											<div class='date-cover'></div>
											<div class='date-total unselectable'>NOT SET</div>
										</div>
									</div>
									<div class='hue-container border-hue'>
										<div class='hue-open'>
											<div class='dial-title'>Set Colour</div>
											<div id='d3' class='dial unselectable'>	
												<div class='dial-img'>
													<img src='img/dial.png' />
												</div>
												<div class='dial-cover'></div>
												<div class='dial-value unselectable'></div>
												<div class='dial-subtitle'>hue</div>
												<div class='hue-selector-bg background-hue'></div>
												<div class='hue-selector-image'>
													<img src='img/hue-selector.png'/>
												</div>
											</div> 
										</div>
										<div class='hue-closed'>
											<div class='dial-title'>Set Colour</div> 
											<div class='hue-cover'></div>
										</div>
									</div>
								</div>
							</td>
							<td>
								<div class='tags background-gradient-hue' >
									<ul class='tag-terms'>
										<li class='term-search background-hue'>tags:</a></li>
										<li><input class='tag-input' type='text' name='tag-input' autocomplete='array:tags'></li>
									</ul>
								</div>
								<div class='notes background-gradient-hue'>
									<div class='notes-title background-hue'>notes:</div>
									<div class='notes-text'><textarea rows="10" cols="90"></textarea></div>
								</div> 
							</td>
							<td class="sidebuttons">
								<div class="admin-delete sidebutton background-hue"><a href="#">DELETE</a></div>
								<div class="admin-save sidebutton background-hue"><a href="#">SAVE</a></div>
								<div class="admin-cancel sidebutton background-hue"><a href="#">CANCEL</a></div>
							</td>
						</tr>
					</table>
				</div>
			</div>
			<div class="items-body">
				<div class='items'></div>
			</div>
		</div>
	</div>
</div>
<div id="item-template" style="display:none;">
	<div class="item">
		<div class='head'>
			<div class='bars'>
				<div class="bars-cover"></div>
				<div class='title'></div>
				<div class='title-edit'><input type="text" name="title-input" class="title-input" placeholder="Edit title"></div>
				<div class='progressbar background-gradient-hue'>
					<div class='achieved background-hue'></div>
				</div>
				<div class='moneybar'>
					<div class='achieved'></div>
				</div>
				<div class="item-check border-hue">
					<div class="item-check-cover"></div>
					<div class="item-completed">
						<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="23px" height="23px" viewBox="0 0 23 23" enable-background="new 0 0 23 23" xml:space="preserve">
							<g>
								<path d="M19,0c0,0-5.125,11.958-10,20c-2.117-2.719-6-10-6-10l-3,1.521C1.583,14.708,5.139,20.452,7,23h4c5.833-8.833,12-23,12-23 H19z"/>
							</g>
						</svg>
					</div>
				</div>
			</div>
		</div>
		<div class='openadmin background-hue'>
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="40px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">
<path fill="#ffffff" d="M30.5,8.5v23h-15l-10-11v-1l10.084-11H30.5z M27.5,28.5l0.045-17.045L16.5,11.5l-7,8v1l7,8H27.5z"/>
</svg>

		</div>
		<div class='additem background-hue'>
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="40px" height="40px" viewBox="5 5 40 40" enable-background="new 5 5 40 40" xml:space="preserve">
<path fill="#ffffff" d="M26.437,35.871c0,0.659-0.404,1.191-0.904,1.191h-0.189c-0.5,0-0.905-0.532-0.905-1.191V13.253
	c0-0.658,0.404-1.19,0.905-1.19h0.189c0.5,0,0.904,0.533,0.904,1.19V35.871z"/>
<path fill="#ffffff" d="M37.969,24.659c0,0.512-0.533,0.924-1.193,0.924H14.1c-0.66,0-1.194-0.412-1.194-0.924v-0.193
	c0-0.511,0.534-0.924,1.194-0.924h22.675c0.66,0,1.193,0.413,1.193,0.924V24.659z"/>
</svg>
		</div>
		<div class="item-body">
			<div class="admin-container">
				<div class="admin">
					<!-- <div class='title-tooltip'>Click to edit title 
						<div class='tooltip-svg'>
							<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='20px' height='20px' viewBox='0 0 20 20' style='stroke:none;fill:#fe9;'><polyline points='0, 0, 20, 0, 10, 20, 0, 0'/></svg>
						</div>
					</div> -->
					
					<div class="endclass-item">
						<div class="admin-controls border-hue">
							<div class="duration-container border-hue">
								
								<div id='d0' class='dial unselectable background-hue'>
									<div class='dial-img'>
										<img src='img/dial.png' />
									</div>
									<div class='dial-cover'></div>
									<div class="duration-title">duration</div>
								</div>
								
								<div class='duration-value background-hue'>
									<input type="text" value="0.00">
								</div>
								<div id='d1' class='dial unselectable background-hue'>
									<div class='dial-img'>
										<img src='img/dial.png' />
									</div>
									<div class='dial-cover'></div>
								</div>
								<div class="duration-units">
									<table cellspacing="5" cellpadding="0">
										<tr>
											<td class="background-hue" id="hours">
												<a href="#">hours</a>
											</td>
										</tr>
										<tr>
											<td class="background-hue" id="days">
												<a href="#">days</a>
											</td>
										</tr>
										<tr>
											<td class="background-hue" id="weeks">
												<a href="#">weeks</a>
											</td>
										</tr>
										<tr>
											<td class="background-hue" id="months">
												<a href="#">months</a>
											</td>
										</tr>
									</table>
								</div>
							</div>
							<div class="money-container border-hue">
								<div id='d2' class='dial unselectable background-hue'>
									<div class='dial-img'>
										<img src='img/dial.png' />
									</div>
									<div class='dial-cover'></div>
									<div class="money-title">cost</div>
								</div>
								
								<div class='money-value background-hue'>
									<input type="text" value="0.00">
								</div>
							</div>
						</div>
						<div class="admin-options">
							<div class="item-clear background-hue">
								<a href="#">reset</a>
							</div>
							<div class="item-delete background-hue">
								<a href="#">delete</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="subitems-body">
				<div class="subitems">
				</div>
			</div>
		</div>
	</div>		
</div>
</html>