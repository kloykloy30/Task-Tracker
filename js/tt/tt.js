var tags;
var currdate;
var dataObj
define(['Color'], function(Color){
	var projects;
	
	$(function(){
		var params = {cmd:"gp"};
		if (getParameterByName("tags") != ""){
			params.tags = getParameterByName("tags");
		}
		$.post("services.php", params, onProjectLoad);
		$.post("services.php",	{cmd:"gt"}, onTagsLoad);
		
		$('#filter-input').live('keydown', function(e) { 
			var keyCode = e.keyCode || e.which; 
			if (keyCode == 9) { 
				e.preventDefault(); 
			    // call custom function here
			    createNewFilterTerm($("#filter-input").val());
			} else if (keyCode == 8){
				
				if ($("#filter-input").val() == ""){
					e.preventDefault(); 
					deleteLastSearchTerm();
				}
			}
		});
		$("#add-project a").mousedown(createNewProject);
	});

	function deleteLastSearchTerm(){
		var len = $("#filter-terms .term").length;
		$("#filter-terms li:eq("+len+")").remove();
		searchTerms();
	}
	
	function createNewFilterTerm(term){
		var str = "<li class='term'>"+term+"</li>";
		$(str).insertBefore("#filter-input");
		$("#filter-input").val("");
		searchTerms();
	}

	function createNewTag(term){
		var str = "<li class='term'>"+term+"</li>";
		
	}

	function showTitle(itemData, item){
		$(item).find(".projecthead > .bars .title").html(itemData["title"]);
		$(item).find(".projecthead > .title-input").val(itemData["title"]);
	}

	function showPercentages(itemData, item){
		var timePercent = 100;
		
		if (itemData.totaltime != null){
			timePercent = parseInt(parseFloat(itemData.achievedtime) / parseFloat(itemData.totaltime) * 100);
		}
		$(item).find(".progressbar .achieved").css("width", timePercent+"%");
		 
		var moneyPercent = 100;
		if (itemData.totalmoney!=null){
			moneyPercent = parseFloat(itemData.achievedmoney) / parseFloat(itemData.totalmoney) * 100;
		}
		$(item).find(".moneybar .achieved").css("width", moneyPercent+"%");
	}

	function setDueDate(itemData, item){
		var duedate = itemData.duedate;
		if (duedate == null) {
			itemData.rotations = [START_ROTATION, START_ROTATION, START_ROTATION];
			//return;
		} else {
			var date_components = duedate.split("-");
			itemData.rotations = new Array();
			var month = parseInt(date_components[1]-1);
			var numDays = MONTHS[month-1];
			itemData.rotations[0] = parseInt((date_components[2] / numDays) * ROTATION_SWEEP + START_ROTATION);
			itemData.rotations[1] = parseInt(month / 11 * ROTATION_SWEEP + START_ROTATION);
			itemData.rotations[2] = ((parseInt(date_components[0]) - 2012) / (TOTAL_YEARS - 1)) * ROTATION_SWEEP + START_ROTATION;
			
		}
		//360 - (rot - 270) = (parseInt(360 - rot));
		
		itemData.rotations[3] = 360 - (parseInt(itemData.hue)-270);
	
		$("#p"+itemData.id+" #d0 .dial-img").rotate(itemData.rotations[0]);
		$("#p"+itemData.id+" #d1 .dial-img").rotate(itemData.rotations[1]);
		$("#p"+itemData.id+" #d2 .dial-img").rotate(itemData.rotations[2]);
		$("#p"+itemData.id+" #d3 .dial-img").rotate(itemData.rotations[3]);
	}

	function searchTerms(){
		var params = {cmd:"gp"};

		var tags = [];
		
		for (var i = 1; i <  $("#filter-terms .term").length; i++){
			tags.push($("#filter-terms li:eq("+i+")").text());
		}
		if (tags.length > 0){
			params.tags = tags.join(",");
		}
		$.post("services.php", params, onProjectLoad);
	}

	function onTagsLoad(data){
		tags = data.split(",");
	}

	function onProjectLoad(data){
		data = data.substr(1, data.length-2);
		var projectsRaw = data.split("][");
		projects = new Array();
		$("#projects").html("");
		for (var i = 0; i < projectsRaw.length; i++){
			if (projectsRaw[i].indexOf("currdate") > -1){
				var pd = projectsRaw[i].split("=");
				currdate = pd[1].split("-");
				
				for (var j = 0; j < currdate.length; j++){
					currdate[j] = parseInt(currdate[j]);
				}
				continue;
			}
			var projectString = projectsRaw[i].substring(1,projectsRaw[i].length - 1);
			var projectArray = projectString.split("}{");
			var projectData = {};
			for (var j = 0; j < projectArray.length; j++){
				pd = projectArray[j].split("=");
				projectData[pd[0]] = pd[1];
			}
			if (projectData.tags == null || projectData.tags == "") {
				projectData.tags = new Array();
			} else {
				projectData.tags = projectData.tags.split(","); 
			}
			if (projectData.duedate == null) projectData.duedate = null;
			projects.push(projectData);
			var proj = $("#project-template .project").clone();
			$(proj).attr("id", "p"+projectData["id"]);
			$("#projects").append(proj);
			projectData.html = proj;
			
			showTitle(projectData, proj);
			showPercentages(projectData, proj);
			setNotes(projectData, proj);
			setTags(projectData, proj);
			setHue(projectData);
			setDueDate(projectData, proj);
			setDialValues(projectData);
			setCountdown(projectData);
			
			setProjectFunctions(projectData);
		}
		$(".project-admin .admin-container").css("display", "none");
		
		cAutocomplete.init();
	}
	
	function setNotes(projectData, proj){
		proj.find(".notes-text textarea").val(projectData.notes);
	}
	
	function setTags(projectData){
		
		var tags = projectData.tags;
		$("#p"+projectData.id+" .tag-terms li.term").remove();
		for (var i = 0; i < tags.length; i++){
			var str = "<li class='term'>"+tags[i]+"</li>";
			$(str).insertBefore("#p"+projectData.id+" .tag-terms li:last");
			var w = 0;
			for (var j = 0; j < $("#p"+projectData.id+" .term, #p"+projectData.id+" .term-search").length; j++){
				w += $($("#p"+projectData.id+" .term, #p"+projectData.id+" .term-search")[j]).width() + 20;
			}
			$("#p"+projectData.id+" .tag-input").css("width", $("#p"+projectData.id+" ul").width() - w);
		}
	}
	
	function getParameterByName(name)
	{
	  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	  var regexS = "[\\?&]" + name + "=([^&#]*)";
	  var regex = new RegExp(regexS);
	  var results = regex.exec(window.location.search);
	  if(results == null)
	    return "";
	  else
	    return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	

	var rotStart=0;
	var mouseStart;
	var rot;
	var rotatingDial;
	var rotations;
	var START_ROTATION = -120;
	var ROTATION_SWEEP = 240;
	var START_YEAR = 12;
	var TOTAL_YEARS = 8;
	var TOTAL_MONTHS = 12;
	var MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var currMonth = 0;
	var currId;
	var currProject;

	function startRotation(event){
		$(window).mousemove(rotateDial);
		rotatingDial = $(event.target).closest(".dial");
		currId = $(rotatingDial).attr("id").substring(1);
		currProjectId = $(event.target).closest(".project").attr("id").substring(1);
		for (var i = 0; i < projects.length; i++){
			if (currProjectId == projects[i].id){
				currProject = projects[i];
				break;
			}
		}
		if (currId < 3){
			if (currProject.duedate == null){
				currProject.duedate = "2012-1-1";
			}
		}
		rotations = currProject.rotations;
		event.preventDefault();
		mouseStart = [event.pageX, event.pageY];
		$(window).mouseup(stopRotateDial);
	}

	function stopRotateDial(event){
		$(window).unbind("mousemove");
		rotStart = -rot;
	}
	function rotateDial(event){
		var rot = rotations[currId];
		rot += ((event.pageX - mouseStart[0]) + (mouseStart[1] - event.pageY)) * 0.5;
		if (currId < 3){
			if (rot < START_ROTATION) rot = START_ROTATION;
			if (rot > (START_ROTATION + ROTATION_SWEEP)) rot = (START_ROTATION + ROTATION_SWEEP);
		}
		rotations[currId] = rot;
		$("#p"+currProject.id+" #d"+currId+" .dial-img").rotate(rot);
		mouseStart[0] = event.pageX;
		mouseStart[1] = event.pageY;
		
		if (currId < 3){
			setDialValues(currProject);
			setCountdown(currProject);
		} else {
			setHueFromDial();
		}
	}
	
	function makeUnselectable(node) {
	    if (node.nodeType == 1) {
	        node.unselectable = true;
	    }
	    var child = node.firstChild;
	    while (child) {
	        makeUnselectable(child);
	        child = child.nextSibling;
	    }
	}

	$(function(){
		//makeUnselectable(document.getElementById(".dial"));
	});

	function setProjectFunctions(itemData){
		$("#p"+itemData.id+" .dial-img").mousedown(startRotation);
		$("#p"+itemData.id+" .dial-cover").mousedown(startRotation);
		//$(".dial-img").rotate(START_ROTATION);
		rotations = new Array();
		
		$("#p"+itemData.id+" .date-cover").mouseover(mouseOverDate);
		$("#p"+itemData.id+" .date-cover").mouseout(mouseOutDate);
		$("#p"+itemData.id+" .date-cover").mousedown(openDate);
		
		$("#p"+itemData.id+" .admin-cancel").mousedown(cancelProjectAdmin);
		$("#p"+itemData.id+" .admin-delete").mousedown(deleteProject);
		$("#p"+itemData.id+" .admin-save").mousedown(saveProjectAdmin);
		$("#p"+itemData.id+" .admin-date-clear").mousedown(clearDate);

		$("#p"+itemData.id+" .hue-cover").mouseover(mouseOverHue);
		$("#p"+itemData.id+" .hue-cover").mouseout(mouseOutHue);
		$("#p"+itemData.id+" .hue-cover").mousedown(openHue);
		$("#p"+itemData.id+" .openadmin").mousedown(openProjectAdmin);
		$("#p"+itemData.id+" > .head .bars-cover").mousedown(onOpenProjectItems);
		$("#p"+itemData.id+" .additem").mousedown(addProjectItem);
		
		$("#p"+itemData.id+" .tag-input").live('keydown', function(e) {
			
			var projectID = $(e.target).closest(".project").attr("id").substring(1);
			for (var i = 0; i < projects.length; i++){
				if (projectID == projects[i].id){
					var projectData = projects[i];
					break;
				}
			}
			var keyCode = e.keyCode || e.which; 
			if (keyCode == 9) { 
				e.preventDefault();
				projectData.tags.push($(e.target).val());
			    var str = "<li class='term'>"+$(e.target).val()+"</li>";
				$(str).insertBefore("#p"+projectID+" .tag-terms li:last");
				$("#p"+projectID+" .tag-input").val("");
				var w = 0;
				for (var i = 0; i < $("#p"+projectID+" .term, #p"+projectID+" .term-search").length; i++){
					w += $($("#p"+projectID+" .term, #p"+projectID+" .term-search")[i]).width() + 20;
				}
				$("#p"+projectID+" .tag-input").css("width", $("#p"+projectID+" ul").width() - w);
				
			} else if (keyCode == 8){
				if ($(e.target).val() == ""){
					e.preventDefault();
					var tag = $(e.target).closest("ul").find(".term:last").html();
					for (var i = 0; i < projectData.tags.length; i++){
						if (projectData.tags[i] == tag){
							projectData.tags.splice(i, 1);
							break;
						}
					}
					$(e.target).closest("ul").find(".term:last").remove();
				}
			}
		});
	}
	
	function addProjectItem(event){
		var project = $(event.target).closest(".project");
		var id = project.attr("id").substring(1);
		for (var i = 0; i < projects.length; i++){
			if (id == projects[i].id){
				var projectData = projects[i];
				break;
			}
		}
		addItem(projectData.id, null);
	}
	
	function onOpenProjectItems(event){
		var project = $(event.target).closest(".project");
		openSubItemsProject(project);
	}
	
	function openProjectItems(project, override){
		if (project.find(".items-body").height() > 0 && !override ){ // items already displayed
			project.find(".items-body").animate({opacity:0}, 200, function(){$(this).animate({height:0}, 200);})
		} else {
			var id = project.attr("id").substring(1);
			for (var i = 0; i < projects.length; i++){
				if (id == projects[i].id){
					var projectData = projects[i];
					break;
				}
			}
			if (projectData.items == null){ // if items not loaded yet
				loadItems(id);
			} else {
				project.find(".items-body").animate({height: $("#p"+id+" .items").height()}, 200, function(){$(this).css("height", "auto"); $(this).animate({opacity:1},100);});
			}
		}
	}
	
	function clearDate(event){
		var project = $(event.target).closest(".project");
		var id = project.attr("id").substring(1);
		for (var i = 0; i < projects.length; i++){
			if (id == projects[i].id){
				var proj = projects[i];
				break;
			}
		}
		proj.duedate = null;
		proj.rotations[0] = proj.rotations[1] = proj.rotations[2] = START_ROTATION;
		
		$("#p"+proj.id+" #d0 .dial-img").rotate(proj.rotations[0]);
		$("#p"+proj.id+" #d1 .dial-img").rotate(proj.rotations[1]);
		$("#p"+proj.id+" #d2 .dial-img").rotate(proj.rotations[2]);
		setDialValues(proj);
		setCountdown(proj);
	}
	
	function deleteProject(event){
		var project = $(event.target).closest(".project");
		var id = project.attr("id").substring(1);
		project.remove();
		
		for (var i = 0; i < projects.length; i++){
			if (id == projects[i].id){
				projects.splice(i, 1);
				//projectData = projects[i];
				break;
			}
		}
		var data = {};
		data.cmd = "dp";
		data.id = id;
		$.post("services.php", data, onProjectDelete);
		
	}
	
	function onProjectDelete(){
		$.post("services.php",	{cmd:"gt"}, onTagsLoad);
	}
	
	function saveProjectAdmin(event){
		var project = $(event.target).closest(".project");
		var id = project.attr("id").substring(1);
		for (var i = 0; i < projects.length; i++){
			if (id == projects[i].id){
				currProject = projects[i];
				break;
			}
		}
		
		var data = {};
		data.id = currProject.id;
		data.title = currProject.title = $("#p"+id).find(".title-input").val();
		$("#p"+id).find(".projecthead .bars .title").html(currProject.title);
		
		data.notes = $("#p"+id).find(".notes-text textarea").val();
		data.tags = currProject.tags.join(",");
		data.hue = currProject.hue;
		data.duedate = currProject.duedate;
		data.cmd = "sp";
		$.post("services.php", data, onProjectSave);
		
	}
	
	function onProjectSave(data){
		if (data.indexOf("newid") > -1){
			var vals = data.split("&");
			var newId = vals[0].split("=")[1];
			var oldId = vals[1].split("=")[1];
			$("#p"+oldId).attr("id", "p"+newId);
			for (var i = 0; i < projects.length; i++){
				if (projects[i].id == oldId){
					projects[i].id = newId;
				}
			}
			$("#p"+newId).find(".project-admin .admin-container").animate({opacity:0}, 200, setAdminClosed);
		} else {
			var id = data.split("=")[1];
			$("#p"+id).find(".project-admin .admin-container").animate({opacity:0}, 200, setAdminClosed);
		}
		$.post("services.php",	{cmd:"gt"}, onTagsLoad);
	}
	
	function cancelProjectAdmin(){
		var project = $(event.target).closest(".project");
		var id = project.attr("id").substring(1);
		for (var i = 0; i < projects.length; i++){
			if (id == projects[i].id){
				projectData = projects[i];
				break;
			}
		}
		
		projectData.title = projectData.saved_title;
		projectData.hue = projectData.saved_hue;
		projectData.tags = projectData.saved_tags;
		projectData.notes = projectData.saved_notes;
		projectData.duedate = projectData.saved_duedate;
		
		showTitle(projectData, project);
		showPercentages(projectData, project);
		setNotes(projectData, project);
		setTags(projectData, project);
		setHue(projectData);
		setDueDate(projectData, project);
		setDialValues(projectData);
		setCountdown(projectData);
		
		$(project).find(".project-admin table").animate({opacity:0}, 200, setAdminClosed);
	}

	function openProjectAdmin(event){
		var project = $(event.target).closest(".project");
		//
		if ($(project).find(".project-admin .admin-container").css("display") == "block"){ // admin is open
			saveProjectAdmin(event);
			//$(project).find(".project-admin table").animate({opacity:0}, 200, setAdminClosed);
		} else { // admin is closed
			//$(project).find(" .project-admin").css("display", "block");
			//$(project).find(" .project-admin").css("height", "auto");
			//$(project).find(" .project-admin .admin-container").css("display", "block");
			console.log("here:"+$(project).find(".project-admin .admin-container").height());
			$(project).find(".project-admin").animate({height:$(project).find(".project-admin .admin-container").height()}, 200, setAdminOpen);
		}
	}

	function setAdminClosed(){
		var proj = $(this).closest(".project");
		//proj.find(".project-admin .admin-container").css("display", "none");
		proj.find(".projecthead .title").css("display", "inline");
		//proj.find(".project-body").css("height", $(this).closest(".project-admin").height());
		proj.find(".project-admin").stop();
		proj.find(".project-admin").animate({height:0}, 200, function(){proj.find(".admin-container").css("display", "none");});
	}
	
	function setAdminOpen(){
		console.log("setAdminOpen");
		//$(this).closest(".project-admin").css("display", "block");
		//$(this).css("height", "auto");
		var proj = $(this).closest(".project");
		var id = proj.attr("id").substring(1);
		for (var i = 0; i < projects.length; i++){
			if (id == projects[i].id){
				projectData = projects[i];
				break;
			}
		}
		
		projectData.saved_title = projectData.title;
		projectData.saved_tags = projectData.tags.slice();
		projectData.saved_hue = projectData.hue;
		projectData.saved_notes = projectData.notes;
		projectData.saved_duedate = projectData.duedate;
		
		$(this).siblings(".projecthead").find(".title").css("display", "none");
		$(this).css("height", "auto");
		$(this).find(".admin-container").css("display", "block");
		$(this).find(".admin-container").animate({opacity:1}, 200);
		
	}

	function mouseOverDate(event){
		
	}
	function mouseOutDate(event){
		
	}
	function openDate(event){
		var date_closed = $(event.target).closest(".date-closed");
		
		if (date_closed.css("opacity") > 0){
			date_closed.animate({opacity:0}, 100).closest(".dials-container").animate({height:275}, {duration:500, step:updateNotesHeight, complete:function(){$(this).find(".date-open").animate({opacity:1}, 500)}});
		} else {
			date_closed.siblings(".date-open").animate({opacity:0}, 100).closest(".dials-container").animate({height:50}, {duration:500, step:updateNotesHeight, complete:function(){$(this).find(".date-closed").animate({opacity:1}, 500)}});
		}
	}
	
	function updateNotesHeight(val, obj){
		dataObj = obj;
		var sidebar_height = $(obj.elem).closest(".side-bar").height() - 65;
		if (sidebar_height < 167) sidebar_height = 167;
		$(obj.elem).closest("table").find(".notes-text textarea").css("height", sidebar_height);
		
	}

	function setDialValues(itemData){
		var id = itemData.id;
		var p_rotations = itemData.rotations;
		if (itemData.duedate != null){
			var year = Math.floor(((p_rotations[2] - START_ROTATION) / ROTATION_SWEEP) * TOTAL_YEARS) + START_YEAR;
			$("#p"+id+" #d2 .dial-value").html(year);
			var month = Math.round(((p_rotations[1] - START_ROTATION) / ROTATION_SWEEP) * (TOTAL_MONTHS-1)) + 1;	
			$("#p"+id+" #d1 .dial-value").html(month);
			var day = Math.round(((p_rotations[0] - START_ROTATION) / ROTATION_SWEEP) * (MONTHS[month-1]-1)) + 1;
			$("#p"+id+" #d0 .dial-value").html(day);
			
			var dateString = ((day < 10) ? "0" : "") + String(day) + "/" + ((month < 10) ? "0" : "") + String(month) + "/" + String(year);
			$("#p"+id+" .date-total").html(dateString);
			itemData.duedate = "20"+year+"-"+month+"-"+day;
		} else {
			$("#p"+id+" #d2 .dial-value").html("");
			$("#p"+id+" #d1 .dial-value").html("");
			$("#p"+id+" #d0 .dial-value").html("");
			$("#p"+id+" .date-total").html("NOT SET");
		}
	}	
	
	function mouseOverHue(event){
		
	}
	
	function mouseOutHue(event){
		
	}

	function openHue(event){
		var hue_closed = $(event.target).closest(".hue-closed");
		if (hue_closed.css("opacity") > 0){
			hue_closed.animate({opacity:0}, 100).closest(".hue-container").animate({height:100}, {duration:500, step:updateNotesHeight, complete:function(){$(this).find(".hue-open").animate({opacity:1}, 500)}});
		} else {
			hue_closed.siblings(".hue-open").animate({opacity:0}, 100).closest(".hue-container").animate({height:30}, {duration:500, step:updateNotesHeight, complete:function(){$(this).find(".hue-closed").animate({opacity:1}, 500)}});
		}
	}
	
	function setHue(projectData){
		var projectId = projectData.id;
		
		var c = new Color("hsl("+ projectData.hue + ", 95%, 65%)");
		var c_fade_1 = new Color("hsl("+projectData.hue + ", 100%, 85%)");
		var c_fade_2 = new Color("hsl("+projectData.hue + ", 100%, 95%)");
		var c_fade_3 = new Color("hsl("+projectData.hue + ", 100%, 92%)");
		
		
		var hex = c.getHex();
		var hex_fade_1 = c_fade_1.getHex();
		var hex_fade_2 = c_fade_2.getHex();
		
		$("#p"+projectId+" .border-hue").css("border-color", hex);
		$("#p"+projectId+" .border-hue").css("color", hex);
		$("#p"+projectId+" .background-hue-faded").css("background-color", c_fade_3.getHex());
		$("#p"+projectId+" .background-hue, #p"+projectId+" .overdue").css("background-color", hex);
		
		
		$("#p"+projectId+" .background-gradient-hue").css("background-image", "-o-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
		$("#p"+projectId+" .background-gradient-hue").css("background-image", "-moz-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
		$("#p"+projectId+" .background-gradient-hue").css("background-image", "-webkit-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
		$("#p"+projectId+" .background-gradient-hue").css("background-image", "-ms-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
	}
	
	function setHueFromDial(){
		var rot = rotations[3] % 360;
		if (rot < 0) rot += 360;
		rot = (parseInt(360 - rot) + 270) % 360;
		
		currProject.hue = rot;
		setHue(currProject);
	}
	
	function setCountdown(itemData){
		if (itemData.duedate != null){
			$("#p"+itemData.id+" .countdown").css("display", "inline");
			var duedate = itemData.duedate.split("-");
			for (var i = 0; i < duedate.length; i++){
				duedate[i] = parseInt(duedate[i]);
			}
			var yeardiff = (duedate[0] - currdate[0]);
			if (yeardiff == 0){
				var daydiff = 0;
				if (duedate[1] == currdate[1]){
					daydiff += duedate[2] - currdate[2];
				} else if (duedate[1] > currdate[1]){
					for (var i = currdate[1]; i < (duedate[1]-1); i++){
						daydiff += MONTHS[i];
					}
					daydiff += (MONTHS[currdate[1]-1]) - currdate[2];
					daydiff += duedate[2];
				} else {
					daydiff = -1;
				}
			} else if (yeardiff > 0){
				daydiff = yeardiff * 365;
				for (i = currdate[1]; i < MONTHS.length; i++){
					daydiff += MONTHS[i];
				}
				for (i = 0; i < (duedate[1]-1); i++){
					daydiff += MONTHS[i];
				}
				daydiff += (MONTHS[currdate[1]-1]) - currdate[2];
				daydiff += duedate[2];
			} else {
				daydiff = -1;
			}
			$("#p"+itemData.id+" .countdown").removeClass("overdue");
			if (daydiff < 0){ // if negative days show overdue
				var displayNum = "!";
				var displayText = "overdue";
				$("#p"+itemData.id+" .countdown").addClass("overdue");
			} else if (daydiff < 21) { // if less than 3 weeks, show days
				displayNum = daydiff;
				displayText = "day" + ((displayNum == 1)?"":"s");
			} else if (daydiff < 49) { // if less than 7 weeks, show weeks
				displayNum = Math.ceil(daydiff / 7);
				displayText = "weeks";
			} else if (daydiff < 730) { // if less than 2 years, show months
				displayNum = Math.ceil(daydiff / 30);
				displayText = "months";
			} else { // else show years
				displayNum = Math.floor(daydiff / 365);
				displayText = "year" + ((displayNum > 1)?"s":"");
			}
			$("#p"+itemData.id+" .countdown-number").html(displayNum);
			$("#p"+itemData.id+" .countdown-string").html(displayText);
		} else {
			//itemData
			$("#p"+itemData.id+" .countdown").css("display", "none");
		}
		
		setHue(itemData);
	}
	
	function createNewProject(){
		var projectData = {title:"", hue:Math.floor(Math.random()*360), duedate:null};
		var proj = $("#project-template .project").clone();
		var id = 0;
		for (var i = 0; i < projects.length; i++){
			if (projects[i].id.substring(0,1)== "t"){
				if (parseInt(projects[i].id.substring(1)) >= id) id = parseInt(projects[i].id.substring(1)) + 1;
			} else {
				if (parseInt(projects[i].id) >= id) id = parseInt(projects[i].id) + 1;
			}
		}
		projects.push(projectData);
		projectData.id = "t"+id;
		projectData.tags = new Array();
		$(proj).attr("id", "p"+projectData.id);
		$("#projects").append(proj);
		
		showTitle(projectData, proj);
		showPercentages(projectData, proj);
		setHue(projectData);
		setDueDate(projectData, proj);
		setDialValues(projectData);
		setCountdown(projectData);
		setTags(projectData);
		setProjectFunctions(projectData);
		cAutocomplete.init();
	}
	
	/*   ------------------------------ ITEMS ----------------------------- */
	function loadItems(id){
		
		$.post("services.php",	{cmd:"gi", id:id}, onItemsLoad);
	}
	var items;
	var indent = 50;
	function onItemsLoad(data){
		data = data.substr(1, data.length-2);
		var itemsRaw = data.split("][");
		items = new Array();
		
		//$("#projects").html("");
		for (var i = 0; i < itemsRaw.length; i++){
			var itemString = itemsRaw[i].substring(1,itemsRaw[i].length - 1);
			var itemArray = itemString.split("}{");
			var itemData = {};
			for (var j = 0; j < itemArray.length; j++){
				itmd = itemArray[j].split("=");
				if (itmd[0] == "hours" || itmd[0] == "cost"){
					itemData[itmd[0]] = parseFloat(itmd[1]);
				} else if (itmd[0] == "complete"){
					itemData[itmd[0]] = parseInt(itmd[1]);
				} else {
					itemData[itmd[0]] = itmd[1];
				}
			}
			if (projectData == null){
				var id = itemData.projectid;
				for (i = 0; i < projects.length; i++){
					if (id == projects[i].id){
						var projectData = projects[i];
						break;
					}
				}
			}
			itemData.project = projectData;
			itemData.subitems = [];
			items.push(itemData);
			var item = $("#item-template .item").clone();
			item.attr("id", "i" + itemData["id"]);
			itemData.html = item;
			setTitle(itemData);
			setAdmin(itemData);
			setChecked(itemData);
			setFunctions(item); 
		}
		
		var proj = $("#p"+id+" .items");
		projectData.subitems = [];
		$("#p"+id+" .items-body").css("height", 0);
		for (i = 0; i < items.length; i++){
			itemData = items[i];
			if (itemData.linkid == null){
				proj.append(itemData.html);
				projectData.subitems.push(itemData);
			} else {
				for (var j = 0; j < items.length; j ++){
					if (items[j].id == itemData.linkid){
						items[j].html.find("> .item-body >.subitems-body > .subitems").append(itemData.html);
						items[j].subitems.push(itemData);
						break;
					}
				}
			}
		}
		$("#p"+id+" .items-body").animate({height: $("#p"+id+" .items").height()}, 200, function(){
							for (i = 0; i < items.length; i++){
								itemData = items[i];
								setBars(itemData);
							}
							$(this).css("height", "auto"); 
							$(this).animate({opacity:1},100);});
		//$("#p"+id+" .items-body").animate({height: $("#p"+id+" .items").height()}, 500, function(){$(this).css("height", "auto")});
		
		setSubitemWidths(proj.find("> .item"));
		setBars(projectData);
		setHue(projectData);
	}
	function setChecked(itemData){
		if (itemData.complete){
			itemData.html.find(".item-check input").attr("checked", true);
		}
	}

	function setAdmin(itemData){
		setDisplayDur(itemData);
		setDials(itemData);
		setCost(itemData);
		setSelectUnit(itemData);
		itemData.html.find("> .item-body > .admin-container .duration-units td#"+itemData.preferredduration).css("opacity", 1);
		itemData.html.find("> .item-body > .admin-container .money-input input").val(itemData.cost);
	}
	
	function setDials(itemData){
		itemData.html.find("> .item-body > .admin-container #d0 .dial-img").rotate(START_ROTATION);
	}

	function setDisplayDur(itemData){
		switch (itemData.preferredduration){
			case "months":
				itemData.displayDur = parseInt(((itemData.hours * 4)/ (24 * 30))) / 4;
				break;
			case "weeks":
				itemData.displayDur = parseInt(((itemData.hours * 4)/ (24 * 7))) / 4;
				break;
			case "days":
				itemData.displayDur = parseInt(((itemData.hours * 4)/ (24))) / 4;
				break;
			case "hours":
				itemData.displayDur = parseInt(((itemData.hours * 4))) / 4;
				break;
		}
		itemData.html.find("> .item-body > .admin-container .duration-value input").val(itemData.displayDur.toFixed(2));
	}
	
	function setCost(itemData){
		var cost = itemData.cost;
		if (cost==null) cost = 0;
		itemData.html.find("> .item-body > .admin-container .money-value input").val(cost.toFixed(2));
		itemData.html.find("> .item-body > .admin-container #d2 .dial-img").rotate(START_ROTATION);
	}

	function setTitle(itemData){
		itemData.html.find("> .head .title").html(itemData.title);
		itemData.html.find("> .head .title-input").val(itemData.title);
	}
	function setBars(item){
		if (item.subitems.length > 0){
			var barVals = getBarVals(item.subitems);
			var hoursComplete = ((barVals[0] / barVals[1]) * 100) + "%";
			var moneyComplete = ((barVals[2] / barVals[3]) * 100) + "%";
			if (item.html.find("> .projecthead").length == 0){
				item.html.find("> .head .bars-cover").unbind();
				item.html.find("> .head .bars-cover").bind("click", onOpenSubItems);
			}
			item.html.find("> .head .progressbar .achieved").css("margin-top", "0");
			item.html.find("> .head .progressbar .achieved").css("height", "100%");
			item.html.find("> .head .progressbar .achieved").stop();
			item.html.find("> .head .moneybar .achieved").stop();
			item.html.find("> .head .moneybar").css("opacity", 1);
			item.html.find("> .head .item-check").css("display", "none");
			item.html.find("> .head .title, > .head .title-edit").css("left", 14);
			
			item.html.css("margin-bottom", "10px");
			
			item.html.find("> .head > .bars .progressbar .achieved").animate({width:hoursComplete}, 400);//css("width", hoursComplete);
			item.html.find("> .head > .bars .moneybar .achieved").animate({width:moneyComplete}, 400);//css("width", moneyComplete);
		} else {
			////+"  :"+item.html.find("> .head .title").parent().parent().parent().html());
			var displayType = item.html.parent().css("display"); 
			item.html.parent().css("display", "block");
			var percent = (item.complete == 1) ? item.html.find("> .head .title").width()+30 : "0";
			item.html.parent().css("display", displayType);
			item.html.find("> .head .bars-cover").unbind();
			item.html.find("> .head .bars-cover").bind("click", onOpenItemAdmin);
			item.html.find("> .head .title, > .head .title-edit").css("left", 63);
			//item.html.find("> .item-body > .admin-container .title-input").css("left", 63);
			
			item.html.css("margin-bottom", "0px");
			
			item.html.find("> .head .item-completed").css("display", ((item.complete)?"block":"none"));
			
			
			item.html.find("> .head .progressbar .achieved").animate({width: percent}, 200);
			
			item.html.find("> .head .progressbar .achieved").css("left", "53px");
			item.html.find("> .head .progressbar .achieved").css("margin-top", "22px");
			item.html.find("> .head .progressbar .achieved").css("height", "10px");
			//item.html.find("> .bars .moneybar .achieved").css("width", 0);
			item.html.find("> .head .moneybar").css("opacity", 0);
		}
	}
	function getBarVals(subitems){
		var returnArray = [0,0,0,0];
		for (var i = 0; i < subitems.length; i++){
			var item = subitems[i];
			if (item.subitems.length > 0){
				var barVals = getBarVals(item.subitems);
				returnArray[0] += barVals[0];
				returnArray[1] += barVals[1];
				returnArray[2] += barVals[2];
				returnArray[3] += barVals[3];
			} else {
				returnArray[0] += (item.complete == 1) ? item.hours : 0;
				returnArray[1] += item.hours;
				if (item.cost != null){
					returnArray[2] += (item.complete == 1) ? item.cost : 0;
					returnArray[3] += item.cost;
				}
			}
		}
		return returnArray;
	}

	var itemnum = 3;
	function onAddItem(event){
		var itemId = $(event.target).closest(".item").attr("id").substring(1);
		var projectId = $(event.target).closest(".project").attr("id").substring(1);
		addItem(projectId, itemId);
	}
	function addItem(projectId, itemId){
		var item = $("#item-template .item").clone();
		var newId = "i" +"t"+(++itemnum);
		var itemData = {id:newId.substring(1), linkid:itemId, projectid:projectId, title:"", preferredduration:"hours", subitems:[], displayDur:0, hours:0, cost:0, complete:false};
		item.attr("id", newId);
		setFunctions(item); 
		
		itemData.html = item;
		items.push(itemData);
		if (itemId != null){
			$("#i"+itemId+" .subitems").prepend(item);
			for (var i = 0; i < items.length; i++){
				if (items[i].id == itemId){
					items[i].subitems.push(itemData);
					break;
				}
			}
			openItemAdmin(itemId);
		} else {
			console.log("add Project");
			$("#p"+projectId+" .items").prepend(item);
		}
		for (i = 0; i < projects.length; i++){
			if (projects[i].id == projectId){
				if (projects[i].items == null){
					projects[i].items = [];
					var projectData = projects[i];
				}
				projects[i].items.push(itemData);
			}
		}
		
		itemData.project = projectData;
		console.log("projectData:"+projectData);
		setSubitemWidths($(".items .item"));
		setDuration(itemData);
		itemData.html.find(".admin").css("display", "block");
		setAdmin(itemData);
		setBars(itemData);
		setHue(projectData);
		setBars(projectData);
		itemData.html.find(".admin").css("display", "none");
		openItemAdmin(newId.substring(1));
		/*
		if (itemId != null){
			openSubItems(itemId, true);
		} else {
			openProjectItems($("#p"+projectId), true);
		}
		for (i = 0; i < projects.length; i++){
			if (projects[i].id == projectId){
				setHue(projects[i]);
				break;
			}
		}*/
	}

	function setDuration(itemData){
		//itemData.html.find(
		console.log("preferred duration:"+itemData.preferredduration);
		itemData.html.find(".duration-units td").css("opacity", 0.4);
		itemData.html.find("#"+itemData.preferredduration).css("opacity", 1);
	}

	function setFunctions(item){
		item.find(".dial-img").mousedown(startItemRotation);
		item.find(".dial-cover").mousedown(startItemRotation);
		item.find(".duration-units a").bind("click", onSelectUnit);
		item.find(".background-hue").css("background-color", "red");
		item.find(".openadmin").mousedown(onTitleEdit);
		item.find(".additem").mousedown(onAddItem);
		item.find(".item-check-cover").bind("click", checkboxChange);
		item.find(".item-delete a").bind("click", onDeleteItem);
		item.find(".money-value input").bind("keyup", onMoneyChange);
		item.find(".duration-value input").bind("keyup", durationChange);
		item.find(".money-clear a").bind("click", onClearMoney);
		item.find(".head .title-edit input").bind("focusout", onTitleFocusLost);
	}
	
	function onTitleFocusLost(event){
		var itemId = $(event.target).closest(".item").attr("id").substring(1);
		saveItem(itemId);
		console.log("focus lost");
	}
	var editingTitle;
	function onTitleEdit(event){
		event.preventDefault();
		var itemId = $(event.target).closest(".item").attr("id").substring(1);
		console.log("item ID:"+itemId);
		for (var i = 0; i < items.length; i++){
			if (items[i].id == itemId){
				var itemData = items[i];
				break;
			}
		}
		editingTitle = itemData;
		console.log("itemData:"+itemData);
		if (itemData.html.find(" > .head .title").css("display") == "none"){
			itemData.html.find(" > .head .title").css("display", "block");
			itemData.html.find(" > .head .title").html(itemData.html.find("> .head .title-input").val());
			itemData.html.find(" > .head .title-edit").css("display", "none");
		} else {
			console.log("----");
			itemData.html.find("> .head .title").css("display", "none");
			itemData.html.find("> .head .title-edit").css("display", "block");
		}
		$("#background-cover").css("display", "inline");
		$("#background-cover").animate({opacity:1},200);
		itemData.html.find("> .head input:first").focus();
		itemData.html.find("> .head input:first").blur(clearTitleEdit)
		itemData.html.find("> .head .bars").css("z-index", 300);
	}
	
	function clearTitleEdit(){
		editingTitle.html.find(" > .head .title").css("display", "block");
		editingTitle.html.find(" > .head .title").html(editingTitle.html.find("> .head .title-input").val());
		editingTitle.html.find(" > .head .title-edit").css("display", "none");
		editingTitle.html.find("> .head .bars").css("z-index", "");
		$("#background-cover").animate({opacity:0},200, function(){
			$(this).css("display", "none");
		});
		
	}
	
	function durationChange(event){
		
	}

	function onClearMoney(event){
		itemId = $(event.target).closest(".item").attr("id").substring(1);
		for (var i = 0; i < items.length; i++){
			if (items[i].id == itemId){
				var itemData = items[i];
				break;
			}
		}
		itemData.cost = 0;
		itemData.html.find("> .item-body > .admin-container .money-input input").val("");
		for (i = 0; i < items.length; i++){
			itemData = items[i];
			setBars(itemData);
		}
		setBars(itemData.project);
	}

	function onMoneyChange(event){
		itemId = $(event.target).closest(".item").attr("id").substring(1);
		for (var i = 0; i < items.length; i++){
			if (items[i].id == itemId){
				var itemData = items[i];
				break;
			}
		}
		itemData.cost = parseFloat(itemData.html.find("> .item-body > .admin-container .money-value  input").val());
		moneyChange(itemData);
	}
	
	function moneyChange(itemData){
		for (i = 0; i < items.length; i++){
			setBars(items[i]);
		}
		setBars(itemData.project);
		for (i = 0; i < projects.length; i++){
			if (projects[i].id == itemData.projectid){
				var project = projects[i];
			}
		}
		itemData.html.find(".money-value  input").val(itemData.cost.toFixed(2));
		
		//project.totaltime = 
	}

	function onDeleteItem(event){
		event.preventDefault();
		if (!confirm("Are you sure you want to destroy your life's work?")){
			return;
		}
		var item = $(event.target).closest(".item");
		var itemId = item.attr("id").substring(1);
		for (var i = 0; i < items.length; i++){
			if (items[i].id == itemId){
				deleteItemData = items[i];
				break;
			}
		}
		deleteItemData.html.animate({opacity:0}, 200, deleteItem);
	}
	var deleteItemData;
	function deleteItem(){
		for (var i = 0; i < items.length; i++){
			if (items[i].id == deleteItemData.id){
				items.splice(i, 1);
				break;
			}
		}
		if (deleteItemData.linkid != null){
			for (i = 0; i < items.length; i++){
				if (items[i].id == deleteItemData.linkid){
					for (var j = 0; j < items[i].subitems.length; j++){
						if (items[i].subitems[j] === deleteItemData){
							items[i].subitems.splice(j, 1);
							break;
						}
					}
					break;
				}
			}
		}
		deleteItemData.html.remove();
		var deleteItem = {};
		deleteItem.id = deleteItemData.id;
		deleteItem.cmd = "di";
		$.post("services.php", deleteItem, itemDeleted);
		
	}
	function itemDeleted(data){
		for (i = 0; i < items.length; i++){
			itemData = items[i];
			setBars(itemData);
		}
		setBars(itemData.project);
	}

	function checkboxChange(event){
		event.preventDefault();
		//var checkboxState = $(event.target).parent().find(":checked").length > 0;
		var id = $(event.target).closest(".item").attr("id").substring(1);
		console.log("id:"+id);
		for (var i = 0; i < items.length; i++){
			if(items[i].id == id){
				var itemData = items[i];
				break;
			}
		}
		itemData.complete = !itemData.complete;
		for (i = 0; i < items.length; i++){
			itemData = items[i];
			setBars(itemData);
		}
		setBars(itemData.project);
		
	}

	function onOpenSubItems(event){
		if ($(event.target).closest(".item").length == 0){
			// it's project level
			var projectId = $(event.target).closest(".project").attr("id").substring(1);
			openSubItems(projectId);
		} else {
			var itemId = $(event.target).closest(".item").attr("id").substring(1);
			openSubItems(itemId);
		}
	}
	
	function openSubItemsProject(project, override){
		if (project.find(".items-body").height() > 0 && !override ){ // items already displayed
			project.find(".items-body").animate({opacity:0}, 200, function(){$(this).animate({height:0}, 200);})
			
		} else {
			var id = project.attr("id").substring(1);
			for (var i = 0; i < projects.length; i++){
				if (id == projects[i].id){
					var projectData = projects[i];
					break;
				}
			}
			
			if (projectData.subitems == null){ // if items not loaded yet
				loadItems(id);
			} else {
				project.find(".items-body").animate({height: $("#p"+id+" .items").height()}, 200, function(){$(this).css("height", "auto"); $(this).animate({opacity:1},100);});
			}
		}
	}
	
	function openSubItems(itemId, override){
		var subitems = $("#i"+itemId+" > .item-body > .subitems-body > .subitems");
		
		
		if (subitems.css("display")=="block" && override != true){ // items already expanded
			$("#i"+itemId).animate({marginBottom:10}, 200);
			subitems.animate({opacity:0}, 200, function (){$(this).parent().animate({height:0}, 200, function(){$(this).find("> .subitems").css("display", "none");});});
			//$("#i"+itemId+" .subitems-body").animate({height:0}, 200);
		} else {
			if (subitems.css("display")=="none"){
				subitems.css("display", "block");
				var goalHeight = subitems.height();
				//goalHeight
				subitems.css("display", "none");
			} else {
				goalHeight = subitems.height();
			}
			$("#i"+itemId).animate({marginBottom:0}, 200);
			
			$("#i"+itemId+" > .item-body > .subitems-body").animate({height:goalHeight, marginTop:10}, 200, function(){
																								$(this).find("> .subitems").css("display", "block");
																								$(this).find("> .subitems").animate({opacity:1}, 200);
																								$(this).css("height", "auto")});
		}
	}

	function onSelectUnit(event){
		var item = $(event.target).closest(".item");
		event.preventDefault();
		var preferredduration = $(event.target).closest("td").attr("id");
		for (var i = 0; i < items.length; i++){
			if (items[i].id == item.attr("id").substring(1)){
				var itemData = items[i];
				break;
			}
		}
		itemData.preferredduration = preferredduration;
		setSelectUnit(itemData);
	}
	
	function setSelectUnit(itemData){
		
		switch (itemData.preferredduration){
			case "hours":
				var rotMult = 0;
				break;
			case "days":
				rotMult = 1;
				break;
			case "weeks":
				rotMult = 2;
				break;
			case "months":
				rotMult = 3;
				break;
		}
		console.log("setSelectUnit:"+itemData.preferredduration+" :"+rotMult);
		var rot = 55 + (rotMult * 30);
		itemData.html.find("#d1 .dial-img").rotate(rot);
		
		setDisplayDur(itemData);
		itemData.html.find(".duration-units td").css("opacity", 0.4);
		itemData.html.find("#"+itemData.preferredduration).css("opacity", 1);
	}

	var currItemId;
	var currItemDialId;
	var currItem;
	var currProjectId;
	var rot = 0;
	var unitvalue = 0;
	function startItemRotation(event){
		$(window).mousemove(rotateItemDial);
		rotatingDial = $(event.target).closest(".dial");
		currItemDialId = rotatingDial.attr("id").substring(1);
		currItemId = $(event.target).closest(".item").attr("id").substring(1);
		for (var i = 0; i < items.length; i++){
			if (items[i].id == currItemId){
				currItem = items[i];
				break;
			}
		}
		currProjectId = $(event.target).closest(".project").attr("id").substring(1);
		oldRot = rot;
		//startVal = unitvalue;
		switch (parseInt(currItemDialId)){
			case 0: 
				startVal = currItem.displayDur;
				break;
			case 1:
				break;
			case 2:
				if (currItem.cost == null){
					startVal = 0;
				} else {
					startVal = currItem.cost;
				}
				break;
		}
		console.log("STARTVAL:"+startVal);
		event.preventDefault();
		mouseStart = [event.pageX, event.pageY];
		$(window).mouseup(stopRotateItemDial);
	}

	function onOpenItemAdmin(event){
		var itemId = $(event.target).closest(".item").attr("id").substring(1);
		openItemAdmin(itemId);
	}
	
	//$("#i"+itemId+" > .bars .title").css("display", "block");
	//$("#i"+itemId+" > .bars .title").html($("#i"+itemId+" > .item-body > .admin-container .title-input").val());
	
	//$("#i"+itemId+" > .bars .title").css("display", "none");
	//$(this).closest(".item").find("> .bars .title").css("display", "none");
	
	function openItemAdmin(itemId){
		//var projectId = $(event.target).closest(".project").attr("id").substring(1);
		if ($("#i"+itemId+" .admin").css("display") == "block"){ // admin is open
			$("#i"+itemId+" > .item-body .admin-container .admin").css("display", "none");
			//$("#i"+itemId+" > .bars .title").css("display", "block");
			$("#i"+itemId+" > .item-body .admin-container").animate({height:0}, 200);
			//$("#i"+itemId+" > .bars .title").html($("#i"+itemId+" > .item-body > .admin-container .title-input").val());
			saveItem(itemId);
		} else { // admin is closed
			if ($("#i"+itemId+" > .item-body > .subitems-body > .subitems").children().length > 0){
				$("#i"+itemId+" > .item-body > .admin-container .endclass-item").css("display", "none");
				//$("#i"+itemId+" > .bars .title").css("display", "none");
				$("#i"+itemId+" > .item-body > .admin-container .admin").css("display", "block");
			} else {
				$("#i"+itemId+" > .item-body .admin .endclass-item").css("display", "block");
				$("#i"+itemId+" > .item-body > .admin-container").animate({height:95}, 200, function(){
																				//$(this).closest(".item").find("> .bars .title").css("display", "none");
																				$(this).find(".admin").css("display", "block");
																				$(this).find(".admin").css("opacity", 0);
																				$(this).find(".admin").animate({opacity:1}, 200);});
			}
		}
	}

	function saveItem(itemId){
		for (var i = 0; i < items.length; i++){
			if (items[i].id == itemId){
				var itemData = items[i];
				break;
			}
		}
		
		itemData.title = itemData.html.find("> .head .title-input").val();
		
		var saveData = {};
		saveData.id = itemData.id;
		saveData.hours = itemData.hours;
		saveData.preferredduration = itemData.preferredduration;
		saveData.title = itemData.title;
		saveData.projectid = itemData.projectid;
		saveData.cost = itemData.cost;
		saveData.complete = itemData.complete;
		saveData.linkid = itemData.linkid;
		saveData.cmd = "si";
		$.post("services.php", saveData, onSaveItem);
	}

	function onSaveItem(data){
		if (data.indexOf("oldid") > 0){
			var ids = data.split("&");
			var newid = ids[0].split("=")[1];
			var oldid = ids[1].split("=")[1];
			$("#i"+oldid).attr("id", "i"+newid);
			for (var i = 0; i < items.length; i++){
				if (items[i].id == oldid){
					items[i].id = newid;
					break;
				}
			}
		}
	}

	function stopRotateItemDial(event){
		$(window).unbind("mousemove");
		rotStart = -rot;
		switch (parseInt(currItemDialId)){
			case 0:
				currItem.displayDur = unitvalue;
				break;
		}
		
	}
	function rotateItemDial(event){
		rot += ((event.pageX - mouseStart[0]) + (mouseStart[1] - event.pageY)) * 0.5;
		
		
		
		if (currItemDialId == 1){
			if (rot > 145) rot = 145;
			if (rot < 55) rot = 55;
			switch (parseInt(Math.floor((rot - 55) / 30))){
				case 0:
					currItem.preferredduration = "hours";
					break;
				case 1:
					currItem.preferredduration = "days";
					break;
				case 2:
					currItem.preferredduration = "weeks";
					break;
				case 3:
					currItem.preferredduration = "months";
					break;
			}
			$("#p"+currProjectId+" #i"+currItemId+" #d"+currItemDialId+" .dial-img").rotate(Math.floor((rot - 55) / 30) * 30 + 55);
			setDisplayDur(currItem);
			currItem.html.find(".duration-units td").css("opacity", 0.4);
			currItem.html.find("#"+currItem.preferredduration).css("opacity", 1);
		} else {
			$("#p"+currProjectId+" #i"+currItemId+" #d"+currItemDialId+" .dial-img").rotate(rot);
		}
		
		
		
		mouseStart[0] = event.pageX;
		mouseStart[1] = event.pageY;
		setDialValue(event.shiftKey);
		for (i = 0; i < items.length; i++){
			itemData = items[i];
			setBars(itemData);
		}
		setBars(itemData.project);
	}

	function makeUnselectable(node) {
	    if (node.nodeType == 1) {
	        node.unselectable = true;
	    }
	    var child = node.firstChild;
	    while (child) {
	        makeUnselectable(child);
	        child = child.nextSibling;
	    }
	}

	function setSubitemWidths(items){
		for (var i = 0; i < items.length; i++){
			
			var parentWidth = $(items[i]).width();
			$(items[i]).find("> .item-body > .subitems-body > .subitems").css("width", parentWidth - indent);
			$(items[i]).find("> .item-body > .subitems-body > .subitems").css("margin-left", indent);
			var currDisplayType = $(items[i]).find("> .item-body > .subitems-body > .subitems").css("display");
			$(items[i]).find("> .item-body > .subitems-body > .subitems").css("display", "block");
			setSubitemWidths($(items[i]).find("> .item-body > .subitems-body > .subitems > .item"));
			$(items[i]).find("> .item-body > .subitems-body > .subitems").css("display", currDisplayType);
		}
	}



	var oldRot = 0;
	var startVal;
	var oldShift = false;
	function setDialValue(shiftKey){
		if (oldShift != shiftKey){
			startVal = unitvalue;
			oldRot = rot;
			oldShift = shiftKey;
		}
		
		unitvalue = startVal + ((parseInt((rot - oldRot)/ 15) / 4)) * ((shiftKey)?10:1);
		if (unitvalue < 0) unitvalue = 0;
		switch (parseInt(currItemDialId)){
			case 0:
				$("#i"+currItemId+" .duration-value input").val(unitvalue.toFixed(2));
				switch(currItem.preferredduration){
					case "months":
						currItem.hours = unitvalue * (24 * 30);
						break;
					case "weeks":
						currItem.hours = unitvalue * (24 * 7);
						break;
					case "days":
						currItem.hours = unitvalue * 24;
						break;
					case "hours":
						currItem.hours = unitvalue;
						break;
				}
				break;
			case 1:
				setDuration(currItem);
				break;
			case 2:
				console.log("changing money"+unitvalue);
				currItem.cost = unitvalue;
				console.log("currItem:"+currItem.cost);
				moneyChange(currItem);
				break;
		}
		
	}
});