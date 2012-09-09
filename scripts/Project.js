define(function(){
	
	var START_ROTATION 	= -120;
	var ROTATION_SWEEP 	= 240;
	var START_YEAR 		= 12;
	var TOTAL_YEARS 	= 8;
	var TOTAL_MONTHS 	= 12;
	var MONTHS 			= [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
	function Project(value, currdate, itemClass){
		//this._listeners = {};
		//this.subscribe(Events.INT_UPDATED, this._INTUpdated);
		this._currdate = currdate;
		this.ItemClass = itemClass;
		if (value == null){
			this.getID();
		}
		this.parse(value);	
	}
	
	
	
	Project.prototype.ItemClass;
	Project.prototype._title = "no title";
	
	Project.prototype._html = "";
	Project.prototype._htmlhead;
	Project.prototype._htmlbody;
	Project.prototype._htmladmin;
	Project.prototype._htmlitems;
	Project.prototype._htmladmincontainer;
	Project.prototype._htmlitemscontainer;
	
	Project.prototype._achievedmoney 	= 0;
	Project.prototype._achievedtime 	= 0;
	Project.prototype._adminopen 		= false;
	Project.prototype._currdate 		= null;
	Project.prototype._currId			= null;
	Project.prototype._currMonth 		= 0;
	Project.prototype._data 			= null;
	Project.prototype._daterotations 	= null;
	Project.prototype._duedate 			= null;
	Project.prototype._id 				= null;
	Project.prototype._itemsopen 		= false;
	Project.prototype._mouseStart 		= null;
	Project.prototype._notes 			= "";
	Project.prototype._rot				= 0;
	Project.prototype._rotatingDial		= null;
	Project.prototype._rotations		= null;
	Project.prototype._rotstart 		= 0;
	Project.prototype._subitems			= [];
	Project.prototype._tags 			= [];
	Project.prototype._totalmoney 		= 0;
	Project.prototype._totaltime 		= 0;
	Project.prototype._editingtitle		= false;
	
	Project.prototype._saved_title;
	Project.prototype._saved_tags;
	Project.prototype._saved_hue;
	Project.prototype._saved_notes;
	Project.prototype._saved_duedate;
	
	Project.prototype.parse = function(projectData){
		
		this._html = $("<div></div>");
		this._html.addClass("project");
		this._htmlhead = $("#templates .project-head").clone();
		this._htmlbody = $("#templates .project-body").clone();
		this._htmladmincontainer = this._htmlbody.find(".admin-container");
		this._htmlitemscontainer = this._htmlbody.find(".items-container");
		this._htmladmin = this._htmlbody.find(".project-admin");
		this._htmlitems = this._htmlbody.find(".items");
		
		this._html.append(this._htmlhead);
		this._html.append(this._htmlbody);
		
		if (projectData != null){
			this._id 			= projectData["p_id"];
			this._title 		= projectData["p_title"];
			this._totaltime 	= parseFloat(projectData["p_totaltime"]);
			this._achievedtime 	= parseFloat(projectData["p_achievedtime"]);
			this._totalmoney 	= parseFloat(projectData["p_totalmoney"]);
			this._achievedmoney = parseFloat(projectData["p_achievedmoney"]);
			this._hue			= parseInt(projectData["p_hue"]);
			this._notes 		= projectData["p_notes"];
			this._tags 			= projectData["tags"];
			if (projectData["p_duedate"] != "NULL"){
				this._duedate 		= projectData["p_duedate"].split("-");
			
				for (var i = 0; i < this._duedate.length; i++){
					this._duedate[i] = parseInt(this._duedate[i]);
				}
			}
			
			
		} else { // set values for new project
			this._hue = parseInt(Math.random()*255);
		}
		
		this.showTitle();
		this.showPercentages();
		this.setHue();
		this.setNotes();
		
		this.setTags();
		this.setDueDate();
		this.setDialValues();
		this.setCountdown();
		this.setProjectFunctions();
		
		this._htmladmin.css("display", "none");
		//this._htmlhead.find(".admin-button").css("opacity", 0);
		
		return this;
	};
	
	Project.prototype.getID = function(){
		$.post("services.php", {cmd:"mnp"}, onProjectID);
		var that = this;
		function onProjectID($dataStr){
			$data = JSON.parse($dataStr);
			that._id = $data.id;
		}
	}
	
	Project.prototype.setDialValues = function(){
		var p_rotations = this._daterotations;
		if (this._duedate != null){
			var year = Math.floor(((p_rotations[2] - START_ROTATION) / ROTATION_SWEEP) * TOTAL_YEARS) + START_YEAR;
			this._htmladmin.find("#d2 .dial-value").html(year);
			var month = Math.round(((p_rotations[1] - START_ROTATION) / ROTATION_SWEEP) * (TOTAL_MONTHS-1)) + 1;	
			this._htmladmin.find("#d1 .dial-value").html(month);
			var day = Math.round(((p_rotations[0] - START_ROTATION) / ROTATION_SWEEP) * (MONTHS[month-1]-1)) + 1;
			this._htmladmin.find("#d0 .dial-value").html(day);
			
			var dateString = ((day < 10) ? "0" : "") + String(day) + "/" + ((month < 10) ? "0" : "") + String(month) + "/" + String(year);
			this._htmladmin.find(".date-total").html(dateString);
			this._duedate = [year,month-1,day-1];
		} else {
			this._htmladmin.find("#d2 .dial-value").html("");
			this._htmladmin.find("#d1 .dial-value").html("");
			this._htmladmin.find("#d0 .dial-value").html("");
			this._htmladmin.find(".date-total").html("NOT SET");
		}
	}
	
	Project.prototype.setCountdown = function(){
		var $countdown = this._htmlhead.find(".countdown");
		$countdown.css("display", "inline");
		if (this._duedate != null){
			
			var yeardiff = (this._duedate[0] - this._currdate[0]);
			if (yeardiff == 0){
				var daydiff = 0;
				if (this._duedate[1] == this._currdate[1]){
					daydiff += this._duedate[2] - this._currdate[2];
				} else if (this._duedate[1] > this._currdate[1]){
					for (var i = this._currdate[1]; i < (this._duedate[1]-1); i++){
						daydiff += MONTHS[i];
					}
					daydiff += (MONTHS[this._currdate[1]-1]) - this._currdate[2];
					daydiff += this._duedate[2];
				} else {
					daydiff = -1;
				}
			} else if (yeardiff > 0){
				daydiff = yeardiff * 365;
				for (i = this._currdate[1]; i < MONTHS.length; i++){
					daydiff += MONTHS[i];
				}
				for (i = 0; i < (this._duedate[1]-1); i++){
					daydiff += MONTHS[i];
				}
				daydiff += (MONTHS[this._currdate[1]-1]) - this._currdate[2];
				daydiff += this._duedate[2];
			} else {
				daydiff = -1;
			}
			$countdown.removeClass("overdue");
			if (daydiff < 0){ // if negative days show overdue
				var displayNum = "!";
				var displayText = "overdue";
				$countdown.addClass("overdue");
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
			this._htmlhead.find(".countdown-number").html(displayNum);
			this._htmlhead.find(".countdown-string").html(displayText);
		} else {
			//itemData
			//$countdown.css("display", "none");
		}
		
		this.setHue();
	}
	
	Project.prototype.setProjectFunctions = function(){
		var that = this;
		
		function stopRotateDial(event){
			$(window).unbind("mousemove");
			$(window).unbind("mouseup");
			that._rotStart = -that._rot;
		}
		
		function startRotation(event){
			$(window).mousemove(rotateDial);
			$(window).mouseup(stopRotateDial);
			that._rotatingDial = $(event.target).closest(".dial");
			that._currId = $(that._rotatingDial).attr("id").substring(1);
			
			if (that._currId < 3){
				if (that._duedate == null){
					that._duedate = [12,0,0];
				}
			}
			that._daterotations;
			event.preventDefault();
			that._mouseStart = [event.pageX, event.pageY];
		}
		
		function rotateDial(event){
			var rot = that._daterotations[that._currId];
			rot += ((event.pageX - that._mouseStart[0]) + (that._mouseStart[1] - event.pageY)) * 0.5;
			if (that._currId < 3){
				if (rot < START_ROTATION) rot = START_ROTATION;
				if (rot > (START_ROTATION + ROTATION_SWEEP)) rot = (START_ROTATION + ROTATION_SWEEP);
			}
			that._daterotations[that._currId] = rot;
			that._htmladmin.find("#d"+that._currId+" .dial-img").rotate(rot);
			that._mouseStart[0] = event.pageX;
			that._mouseStart[1] = event.pageY;
			
			if (that._currId < 3){
				that.setDialValues();
				that.setCountdown();
			} else {
				that.setHueFromDial();
			}
		}
		
		function mouseOverDate(event){}
		function mouseOutDate(event){}
		
		function openDate(event){
			var date_closed = that._htmladmin.find(".date-closed");
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
		
		this._htmladmin.find(".dial-img").mousedown(startRotation);
		this._htmladmin.find(".dial-cover").mousedown(startRotation);
		
		this._htmladmin.find(".date-cover").mouseover(mouseOverDate);
		this._htmladmin.find(".date-cover").mouseout(mouseOutDate);
		this._htmladmin.find(".date-cover").mousedown(openDate);
		
		function mouseOverHue(event){}
		function mouseOutHue(event){}
		function openHue(event){
			var hue_closed = that._htmladmin.find(".hue-closed");
			if (hue_closed.css("opacity") > 0){
				hue_closed.animate({opacity:0}, 100).closest(".hue-container").animate({height:100}, {duration:500, step:updateNotesHeight, complete:function(){that._htmladmin.find(".hue-open").animate({opacity:1}, 500)}});
			} else {
				hue_closed.siblings(".hue-open").animate({opacity:0}, 100).closest(".hue-container").animate({height:30}, {duration:500, step:updateNotesHeight, complete:function(){that._htmladmin.find(".hue-closed").animate({opacity:1}, 500)}});
			}
		}
		
		function clearDate(event){
			that._duedate = null;
			that._daterotations = [START_ROTATION, START_ROTATION, START_ROTATION];
			
			that._htmladmin.find("#d0 .dial-img").rotate(that._daterotations[0]);
			that._htmladmin.find("#d1 .dial-img").rotate(that._daterotations[1]);
			that._htmladmin.find("#d2 .dial-img").rotate(that._daterotations[2]);
			that.setDialValues();
			that.setCountdown();
		}
		
		function setAdminOpen(){that.setAdminOpen();}
		function setAdminClosed(){that.setAdminClosed();}
		function saveProjectAdmin(){that.saveProjectAdmin();}
		
		function openProjectAdmin(event){
			if (that._adminopen){ // admin is open
				that._adminopen = false;
				that.saveProjectAdmin(event);
			} else { // admin is closed
				that._adminopen = true;
				//that._htmladmincontainer.css("overflow", "hidden");
				that._htmladmincontainer.animate({height:that._htmladmin.height()}, 200, setAdminOpen);
			}
		}
		
		function cancelProjectAdmin(){
			event.preventDefault();
			
			that._title 		= that._saved_title;
			that._hue 			= that._saved_hue;
			that._tags 			= that._saved_tags;
			that._notes 		= that._saved_notes;
			that._duedate 		= that._saved_duedate.slice();
			
			that.showTitle();
			that.showPercentages();
			that.setNotes();
			that.setTags();
			that.setHue();
			that.setDueDate();
			that.setDialValues();
			that.setCountdown();
			
			that._adminopen = false;
			that._htmladmincontainer.animate({opacity:0}, 200, setAdminClosed);
		}
		
		function onOpenProjectItems(event){
			if (that._itemsopen){
				that._itemsopen = false;
				that.closeItems();
			} else {
				that._itemsopen = true;
				that.openItems();
			}
		}
		
		function deleteProject(event){
			
			var data = {};
			data.cmd = "dp";
			data.id = that._id;
			$.post("services.php", data, onProjectDelete);
			
			that._html.animate({opacity:0}, 200).animate({height:0}, 200, removeProject);
		}
		
		function removeProject(){
			that._html.remove();
		}
		
		function onProjectDelete(){
			$.post("services.php",	{cmd:"gt"}, that.onTagsLoad);
		}
		
		function addItem(){
			that.addItem();
		}
		
		function adminMouseOver(){}
		function adminMouseOut(){}
		
		function onTitleEdit(event){
			event.preventDefault();
			that.editTitle();
		}
		
		this._html.find(".hue-cover").mouseover(mouseOverHue);
		this._html.find(".hue-cover").mouseout(mouseOutHue);
		this._html.find(".hue-cover").mousedown(openHue);
		
		this._html.find(".admin-cancel").mousedown(cancelProjectAdmin);
		this._html.find(".admin-delete").mousedown(deleteProject);
		this._html.find(".admin-save").mousedown(saveProjectAdmin);
		this._html.find(".admin-date-clear").mousedown(clearDate);
		
		
		this._html.find(".admin-button").mousedown(openProjectAdmin);
		this._htmlhead.find(".bars-cover").mousedown(onOpenProjectItems);
		this._html.find(".additem").mousedown(addItem);
		this._htmlhead.find(".admin-button").mouseover(adminMouseOver);
		this._htmlhead.find(".admin-button").mouseout(adminMouseOut);
		this._htmlhead.find(".edit-title-button").mousedown(onTitleEdit);
		
		
		
		this._htmladmin.find(".tag-input").live('keydown', function(e) {
			var keyCode = e.keyCode || e.which;
			if (keyCode == 9 || keyCode == 13) { 
				e.preventDefault();
				that._tags.push($(e.target).val());
				$tag = $("<li class='term'>"+$(e.target).val()+"</li>");
				that._htmladmin.find(".terms").append($tag);
				that._htmladmin.find(".tag-input").val("");
				//var w = 0;
				//var terms = that._htmladmin.find(".term");
				//for (var j = 0; j < terms.length; j++){
				//	w += $(terms[j]).width() + 20;
				//}
				//this._htmladmin.find(".terms").css("display", ((this._tags.length == 0)?"none":"block")); 
				that._htmladmin.find(".tag-input").css("width", that._htmladmin.find(".tags").width() - 
						(that._htmladmin.find(".term-search").width() + that._htmladmin.find(".terms").width()+30) );
				
			} else if (keyCode == 8){
				if ($(e.target).val() == ""){
					e.preventDefault();
					that._tags.pop();
					that._htmladmin.find(".term:last").remove();
				}
			}
		});
	}
	
	Project.prototype.editTitle = function(){
		if (!this._editingtitle){
			this._editingtitle = true;
			this._htmlhead.find(".title").css("display", "none");
			this._htmlhead.find(".title-edit input").val(this._htmlhead.find(".title").html());
			this._htmlhead.find(".title-edit").css("display", "block");
			
			$("#background-cover").css("display", "inline");
			$("#background-cover").animate({opacity:1},200);
			this._htmlhead.find("input:first").focus();
			this._htmlhead.find("input:first").blur(clearTitleEdit)
			this._htmlhead.find(".bars").css("z-index", 300);
			this._htmlhead.find(".title-edit").css("z-index", 301);
			
			this._htmlhead.find(".title-edit").live('keydown', function(e){
				var keyCode = e.keyCode || e.which;
				if (keyCode == 13){
					clearTitleEdit();
				}
			});
		} else {
			clearTitleEdit();
		}
		
		var that = this;
		function clearTitleEdit(){
			that._editingtitle = false;
			that._htmlhead.find(".title").css("display", "block");
			that._htmlhead.find(".title").html(that._htmlhead.find(".title-edit input").val());
			that._htmlhead.find(".title-edit").css("display", "none");
			that._htmlhead.find(".title-edit").css("z-index", "");
			that._htmlhead.find(".bars").css("z-index", "");
			that._title = that._htmlhead.find(".title-edit input").val();
			that.saveProjectAdmin();
			$("#background-cover").animate({opacity:0},200, function(){
				$(this).css("display", "none");
			});
			that.setBars();
		}
		
	}
	
	Project.prototype.saveBars = function(){
		var $data = {};
		$data.cmd 				= "sb"; // save bars
		$data.id 				= this._id;
		$data.totaltime 		= this._totaltime; 
		$data.achievedtime 		= this._achievedtime; 
		$data.totalmoney		= this._totalmoney;
		$data.achievedmoney		= this._achievedmoney;
		$.post("services.php", $data, onData);
		
		function onData(data){
			//console.log ("bars saved");
		}
	}
	
	Project.prototype.addItem = function(){
		var itemData = {i_id				:"new", 
						i_linkid			:null,
						i_title				:"", 
						i_preferredduration	:"hours", 
						i_hours				:0,
						i_cost				:0, 
						i_complete			:false};
		
		var $item = new this.ItemClass(itemData, this, this.ItemClass);
		
		this._subitems.push($item);
		this._htmlitems.prepend($item._html);
		this.setHue();
		
		$item.setWidth();
		$item.onItemAction(true);
		if (!this.itemsopen){
			this._itemsopen = true;
			this.openItems();
		}
		//this.setBars();
	}
	
	Project.prototype.closeItems = function(){
		
		this._htmlitemscontainer.animate({opacity:0}, 200, closeItems);//function(){$(this).animate({height:0}, 200);})
		var that = this;
		function closeItems(){
			that._htmlitemscontainer.animate({height:0}, 200);
		}
	}
	
	Project.prototype.openItems = function(){
		event.preventDefault();
		if (this._subitems.length == 0){ // if items not loaded yet
			this.loadItems();
		} else {
			this._htmlitemscontainer.animate({height: this._htmlitems.height()}, 200, openItems);
		}
		var that = this;
		function openItems(){
			that._htmlitemscontainer.css("height", "auto");
			that._htmlitemscontainer.animate({opacity:1},100);
		}
	}
	
	Project.prototype.loadItems = function(){
		$.post("services.php",	{cmd:"gi", id:this._id}, onItemsLoad);
		var that = this;
		function onItemsLoad(dataStr){
			$itemsData = JSON.parse(dataStr);;
			that._htmlitemscontainer.css("height", 0);
			that._subitems = [];
			$items = [];
			for (var i = 0; i < $itemsData.length; i++){
				$item = new that.ItemClass($itemsData[i], that, that.ItemClass);
				$items.push($item);
			}
			for (i = 0; i < $items.length; i++){
				$item = $items[i];
				if ($item._linkid == null){
					that._htmlitems.append($item._html);
					that._subitems.push($item);
				} else {
					
					for (var j = 0; j < $items.length; j ++){
						if ($items[j]._id == $item._linkid){
							$items[j].pushItem($item);
							break;
						}
					}
				}
			}
			
			for (i = 0; i < $items.length; i++){
				$item = $items[i];
				$item.setWidth();
			}
			
			that._htmlitemscontainer.animate({height: that._htmlitems.height()}, 200, setItemsOpen);
			that.setBars();
			that.setHue();
		}
		
		function setItemsOpen(){
			that.setItemsOpen();
		}
	}
	
	Project.prototype.removeItem = function(id){
		for (var i = 0; i < this._subitems.length; i++){
			if (this._subitems[i]._id == id){
				this._subitems.splice(i, 1);
				break;
			}
		}
	}
	
	Project.prototype.setBars = function(){
		if (this._subitems.length > 0){
			var totalVals = {totaltime:0, totalmoney:0, achievedtime:0, achievedmoney:0};
			
			for (var i = 0; i < this._subitems.length; i++){
				var item = this._subitems[i];
				var barVals = item.setBars();
				totalVals.totaltime 		+= parseFloat(barVals.totaltime);
				totalVals.totalmoney 		+= parseFloat(barVals.totalmoney);
				totalVals.achievedtime 		+= parseFloat(barVals.achievedtime);
				totalVals.achievedmoney		+= parseFloat(barVals.achievedmoney);
			}
			this._achievedmoney 	= totalVals["achievedmoney"];
			this._achievedtime 		= totalVals["achievedtime"];
			this._totalmoney 		= totalVals["totalmoney"];
			this._totaltime 		= totalVals["totaltime"];
			this.showPercentages();
		} else {
			// TODO make project completable without any sub items
		}
	}
	
	Project.prototype.saveProjectAdmin = function(){
		this._htmlhead.find(".bars .title").html(this._title);
	
		var data = {};
		data.id = this._id;
		data.title = this._title = this._htmlhead.find(".title-input").val();
		
		data.notes = this._htmladmin.find(".notes-text textarea").val();
		data.tags = this._tags.join(",");
		data.hue = this._hue;
		if (this._duedate != null){
			data.duedate = this._duedate.join("-");
		} else {
			data.duedate = "NULL";
		}
		data.cmd = "sp";
		var that = this;
		$.post("services.php", data, onProjectSave);
		
		function onProjectSave(dataStr){
			$data = JSON.parse(dataStr);
			if ($data["newid"] != null){
				that._id = $data["newid"];
				that._htmladmincontainer.animate({opacity:0}, 200, setAdminClosed);
			} else {
				that._htmladmincontainer.animate({opacity:0}, 200, setAdminClosed);
			}
			$.post("services.php",	{cmd:"gt"}, onTagsLoad);
		}
		function onTagsLoad(data){
			that.onTagsLoad(data);
		}
		function setAdminClosed(){
			that.setAdminClosed();
		}
	}
	
	Project.prototype.onTagsLoad = function(data){
		var tags = data.split(",");
	}
	
	Project.prototype.setItemsOpen = function(){
		this._htmlitemscontainer.css("height", "auto");
		this._htmlitems.css("display", "block");
		this._htmlitemscontainer.animate({opacity:1}, 200);
	}
	
	Project.prototype.setAdminOpen = function(){
		this._saved_title = this._title;
		this._saved_tags = this._tags.slice();
		this._saved_hue = this._hue;
		this._saved_notes = this._notes;
		if (this._duedate != null){
			this._saved_duedate = this._duedate.slice();
		}
		
		//this._htmlhead.find(".title").css("display", "none");
		this._htmladmincontainer.css("height", "auto");
		this._htmladmin.css("display", "block");
		this.setTags();
		this._htmladmincontainer.animate({opacity:1}, 200);
	}
	
	Project.prototype.setAdminClosed = function(){
		//this._htmlhead.find(".title").css("display", "inline");
		this._adminopen = false;
		this._htmladmin.stop();
		var that = this;
		this._htmladmincontainer.animate({height:0}, 200, function(){that._htmladmin.css("display", "none");});
	}
	
	Project.prototype.showTitle = function (){
		this._htmlhead.find(".title").html(this._title);
		this._htmlhead.find(".title-input").val(this._title);
	}
	
	Project.prototype.showPercentages = function(){
		var timePercent = 100;
		
		var timePercent = (this._totaltime > 0) ? ((this._achievedtime / this._totaltime) * 100) : 0;
		
		var achievedBar = this._htmlhead.find(".progressbar .achieved");
		achievedBar.stop();
		achievedBar.animate({width:timePercent+"%"}, 300)
		
		var moneyPercent = (this._totalmoney > 0) ? ((this._achievedmoney / this._totalmoney) * 100) : 0;
		
		achievedBar = this._htmlhead.find(".moneybar .achieved");
		achievedBar.stop();
		achievedBar.animate({width:moneyPercent+"%"}, 300);
	}
	
	Project.prototype.setNotes = function(){
		this._htmladmin.find(".notes-text textarea").val(this._notes);
	}
	
	Project.prototype.setHue = function (){
		var c = new $ColorClass("hsl("+ this._hue + ", 95%, 65%)");
		var c_fade_1 = new $ColorClass("hsl("+this._hue + ", 100%, 85%)");
		var c_fade_2 = new $ColorClass("hsl("+this._hue + ", 100%, 95%)");
		var c_fade_3 = new $ColorClass("hsl("+this._hue + ", 100%, 92%)");
		
		var hex = c.getHex();
		var hex_fade_1 = c_fade_1.getHex();
		var hex_fade_2 = c_fade_2.getHex();
		
		this._html.find(".border-hue").css("border-color", hex);
		this._html.find(".border-hue").css("color", hex);
		this._html.find(".background-hue-faded").css("background-color", c_fade_3.getHex());
		this._html.find(".background-hue, .overdue").css("background-color", hex);
		
		this._html.find(".background-gradient-hue").css("background-image", "-o-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
		this._html.find(".background-gradient-hue").css("background-image", "-moz-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
		this._html.find(".background-gradient-hue").css("background-image", "-webkit-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
		this._html.find(".background-gradient-hue").css("background-image", "-ms-linear-gradient(bottom, "+ hex_fade_2+" 5%, "+hex_fade_1+" 80%)");
	}
	
	Project.prototype.setHueFromDial = function(){
		var rot = this._daterotations[3] % 360;
		if (rot < 0) rot += 360;
		rot = (parseInt(360 - rot) + 270) % 360;
		
		this._hue = rot;
		this.setHue();
	}
	
	Project.prototype.setTags = function(){
		this._htmladmin.find(".terms li.term").remove();
		for (var i = 0; i < this._tags.length; i++){
			$tag = $("<li class='term'>"+this._tags[i]+"</li>");
			this._htmladmin.find(".terms").append($tag);
			var w = 0;
			var terms = this._htmladmin.find(".term, .term-search");
			for (var j = 0; j < terms.length; j++){
				w += $(terms[j]).width() + 20;
			}
			this._htmladmin.find(".terms").css("display", ((this._tags.length == 0)?"none":"block")); 
			
			this._htmladmin.find(".tag-input").css("width", this._htmladmin.find(".tags").width() - 
					(this._htmladmin.find(".term-search").width() + this._htmladmin.find(".terms").width()+30) );
		}
	}
	
	Project.prototype.setDueDate = function(){
		
		if (this._duedate == null) {
			this._daterotations = [START_ROTATION, START_ROTATION, START_ROTATION];
			//return;
		} else {
			this._daterotations = new Array();
			var month = this._duedate[1];
			var numDays = MONTHS[month];
			this._daterotations[0] = parseInt((this._duedate[2] / numDays) * ROTATION_SWEEP + START_ROTATION);
			this._daterotations[1] = parseInt((month) / 11 * ROTATION_SWEEP + START_ROTATION);
			this._daterotations[2] = parseInt((this._duedate[0] - 12) / (TOTAL_YEARS - 1)) * ROTATION_SWEEP + START_ROTATION;
			
		}
		//360 - (rot - 270) = (parseInt(360 - rot));
		
		this._daterotations[3] = 360 - (parseInt(this._hue)-270);
	
		this._htmladmin.find("#d0 .dial-img").rotate(this._daterotations[0]);
		this._htmladmin.find("#d1 .dial-img").rotate(this._daterotations[1]);
		this._htmladmin.find("#d2 .dial-img").rotate(this._daterotations[2]);
		this._htmladmin.find("#d3 .dial-img").rotate(this._daterotations[3]);
	}
	
	Project.prototype._listeners = null;
	Project.prototype._isSubscribed = function(type){
		return this._listeners[type] != null;
	};
	
	Project.prototype.subscribe = function(type, callback){
		if(!this._isSubscribed(type)) {
			this._listeners[type] = [];
		};
		this._listeners[type].push(callback);
	};	
	
	Project.prototype.unsubscribe = function(type, callback){
		if(!this._isSubscribed(type)) {
			return;
		};
		var stack = this._listeners[type];
		for(var i = 0, l = stack.length; i < l; i++){
			if(stack[i] === callback){
				stack.splice(i, 1);
				return this.unsubscribe(type, callback);
			};
		};
	};	
	
	Project.prototype.broadcast = function(type, params){
		if(!this._isSubscribed(type)) {
			return;
		}
		var stack = this._listeners[type];
		var l = stack.length;
		for(var i = 0; i < l; i++) {
			stack[i].apply(this, params);
		}
	};	
	
	
	Project.prototype.bind = function(object, property){
		var ref = this;
		this.subscribe('updated', function(){
			object[property] = ref.toString();
		});
	};	
	
	
	
	Project.Events = Events;
	return Project;
});