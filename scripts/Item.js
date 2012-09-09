define(function(){
	
	var SUBITEMS_WIDTH_START = 860;
	var INDENT = 40;
	var START_ROTATION = -120;
	var ROTATION_SWEEP = 240;
	var START_YEAR = 12;
	var TOTAL_YEARS = 8;
	var TOTAL_MONTHS = 12;
	var MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
	
	function Item(itemData, project, itemClass, parentItem){
		this._project = project;
		this._parentitem = parentItem;
		this.ItemClass = itemClass;
		this.parse(itemData);
	}
	
	Item.prototype.ItemClass;
	Item.prototype._project		= null;
	Item.prototype._subitems	= [];
	
	Item.prototype._html		= "";
	Item.prototype._htmladmin 	= "";
	Item.prototype._htmlitems	= "";
	Item.prototype._htmladmincontainer = "";
	Item.prototype._htmlitemscontainer = "";
	
	Item.prototype._id				= null;
	Item.prototype._title			= "no title";
	Item.prototype._hours 			= 0;
	Item.prototype._cost 			= 0;
	Item.prototype._complete 		= false;
	Item.prototype._linkid			= null;
	Item.prototype._preferred		= null;
	Item.prototype._displayDur		= null;
	Item.prototype._itemopen 		= false;
	Item.prototype._rot				= 0;
	Item.prototype._rotatingDial	= null;
	Item.prototype._rotations		= [START_ROTATION, START_ROTATION, START_ROTATION];
	Item.prototype._rotstart 		= 0;
	Item.prototype._currDialId		= null;
	Item.prototype._startVal		= null;
	Item.prototype._mouseStart 		= null;
	Item.prototype._oldRot 			= null;
	Item.prototype._oldShift 		= null;
	Item.prototype._unitvalue		= null;
	Item.prototype._parentitem		= null;
	
	Item.prototype.parse = function(itemData){
		
		this._html 					= $("#templates .item").clone();
		this._htmlhead				= this._html.find(".item-head");
		this._htmladmincontainer 	= this._html.find(".admin-container");
		this._htmladmin 			= this._html.find(".item-admin");
		this._htmlitems 			= this._html.find(".items");
		this._htmlitemscontainer	= this._html.find(".items-container");
		
		this._id 					= itemData["i_id"];
		this._title 				= itemData["i_title"];
		this._hours					= itemData["i_hours"];
		this._cost					= parseFloat(itemData["i_cost"]);
		this._complete 				= (itemData["i_complete"] == 1);
		this._linkid				= itemData["i_linkid"];
		this._preferred				= itemData["i_preferredduration"];
		
		this._subitems = new Array();
		
		this.setTitle();
		this.setAdmin();
		this.setFunctions();
		this.setBars();
		
		this._htmladmin.css("display", "none");
		this._htmlitems.css("display", "none");
		this._htmlitemscontainer.css("height", 0);
		this._htmlitemscontainer.css("opacity", 0);
	}
	
	Item.prototype.setWidth = function(){
		var level = this.getLevel();
		this._html.css("width", SUBITEMS_WIDTH_START - (INDENT * level));
	}
	
	Item.prototype.getLevel = function(){
		if (this._parentitem == null){
			return 1;
		} else {
			return this._parentitem.getLevel() + 1;
		}
	}
	
	Item.prototype.setTitle = function (){
		this._htmlhead.find(".title").html(this._title);
	}
	
	Item.prototype.setAdmin = function (){
		this.setDials();
		this.setCost();
		this.setSelectUnit();
		this._htmladmin.find(".duration-units td#"+this._preferred).css("opacity", 1);
		this._htmladmin.find(".money-input input").val(this._cost);
	}
	
	Item.prototype.setDials = function(){
		this._htmladmin.find("#d0 .dial-img, #d2 .dial-img").rotate(START_ROTATION);
	}
	
	Item.prototype.setDisplayDur = function(){
		switch (this._preferred){
			case "months":
				this._displayDur = parseInt(((this._hours * 4)/ (24 * 30))) / 4;
				break;
			case "weeks":
				this._displayDur = parseInt(((this._hours * 4)/ (24 * 7))) / 4;
				break;
			case "days":
				this._displayDur = parseInt(((this._hours * 4)/ (24))) / 4;
				break;
			case "hours":
				this._displayDur = parseInt(((this._hours * 4))) / 4;
				break;
		}
		this._htmladmin.find(".duration-value input").val(this._displayDur.toFixed(2));
	}
	
	Item.prototype.setCost = function(){
		this._htmladmin.find(".money-value input").val(this._cost);
	}
	
	Item.prototype.setBars = function(){
		var barVals = {totaltime:0, totalmoney:0, achievedtime:0, achievedmoney:0};
		if (this._subitems.length > 0){
			for (var i = 0; i < this._subitems.length; i++){
				var itemBarVals = this._subitems[i].setBars();
				barVals.totaltime 		+= parseFloat(itemBarVals.totaltime);
				barVals.totalmoney 		+= parseFloat(itemBarVals.totalmoney);
				barVals.achievedtime 	+= parseFloat(itemBarVals.achievedtime);
				barVals.achievedmoney	+= parseFloat(itemBarVals.achievedmoney);
			}
			var hoursPercent = (barVals.totaltime > 0) ? ((barVals.achievedtime / barVals.totaltime) * 100) : 0;
			var hoursComplete = hoursPercent + "%";
			var moneyPercent = (barVals.totalmoney > 0) ? ((barVals.achievedmoney / barVals.totalmoney) * 100) : 0;
			var moneyComplete = moneyPercent + "%";
			
			var achievedBar = this._htmlhead.find(".progressbar .achieved");
			achievedBar.css("margin-top", "0");
			achievedBar.css("height", "100%");
			achievedBar.css("left", "0px");
			achievedBar.stop();
			this._htmlhead.find(".moneybar .achieved").stop();
			this._htmlhead.find(".moneybar").css("opacity", 1);
			this._htmlhead.find(".item-check").css("display", "none");
			this._htmlhead.find(".title").css("left", 14);
			this._htmlhead.find(".title-edit").css("left", 15);
			
			this._htmlhead.css("margin-bottom", "10px");
			
			this._htmlhead.find(".item-completed").css("display", "none");
			
			this._htmlhead.find(".progressbar .achieved").animate({width:hoursComplete}, 400);//css("width", hoursComplete);
			this._htmlhead.find(".moneybar .achieved").animate({width:moneyComplete}, 400);//css("width", moneyComplete);
		} else {
			barVals = this.getBarVals();
			this._html.closest(".items").css("display", "block");
			var percent = (this._complete) ? ((this._htmlhead.find(".title").width() == 0) ? "0" : this._htmlhead.find(".title").width()+30) : "0";
			var achievedBar = this._htmlhead.find(".progressbar .achieved");
			achievedBar.stop();
			achievedBar.animate({width: percent}, 200);
			achievedBar.css("left", "53px");
			achievedBar.css("margin-top", "22px");
			achievedBar.css("height", "10px");
			
			this._htmlhead.find(".title").css("left", 63);
			this._htmlhead.find(".title-edit").css("left", 64);
			this._htmlhead.find(".item-check").css("display", "block");
			this._htmlhead.css("margin-bottom", "0px");
			this._htmlhead.find(".item-completed").css("display", ((this._complete)?"block":"none"));
			this._htmlhead.find(".moneybar").css("opacity", 0);
		}
		return barVals;
	}
	
	Item.prototype.getBarVals = function(){
		returnArray = {};
		returnArray.achievedtime 	= (this._complete == 1) ? this._hours : 0;
		returnArray.totaltime 		=  this._hours;
		returnArray.achievedmoney 	= (this._complete == 1) ? this._cost : 0;
		returnArray.totalmoney 		=  this._cost;
		return returnArray;
	}
	
	Item.prototype.setDuration = function(){
		this._htmladmin.find(".duration-units td").css("opacity", 0.4);
		this._htmladmin.find("#"+this._preferred).css("opacity", 1);
	}

	Item.prototype.setFunctions = function(){
		
		var that = this;
		this._htmladmin.find(".dial-img").mousedown(startRotation);
		this._htmladmin.find(".dial-cover").mousedown(startRotation);
		this._htmladmin.find(".duration-units a").bind("click", onSelectUnit);
		this._htmlhead.find(".edit-title-button").mousedown(onTitleEdit);
		this._htmlhead.find(".additem").mousedown(onAddItem);
		this._htmlhead.find(".item-check-cover").bind("click", checkboxChange);
		this._htmladmin.find(".item-delete a").bind("click", deleteItem);
		this._htmladmin.find(".money-value input").bind("keyup", onMoneyChange);
		//this._htmladmin.find(".duration-value input").bind("keyup", durationChange);
		//this._htmladmin.find(".money-clear a").bind("click", onClearMoney);
		//this._htmlhead.find(".title-edit input").bind("focusout", onTitleFocusLost);
		this._htmlhead.find(".bars-cover").bind("click", onItemAction);
		
		function onItemAction(){
			that.onItemAction();
		}
		
		//function onTitleFocusLost(event){
		//	that.saveItem();
		//}
		
		function onTitleEdit(event){
			event.preventDefault();
			that.editTitle();
		}
		
		function onMoneyChange(){
			that._cost = parseFloat(that._htmladmin.find(".money-value  input").val());
			that.moneyChange();
		}
		
		function stopRotateDial(event){
			$(window).unbind("mousemove");
			$(window).unbind("mouseup");
			that._rotStart = -that._rot;
			that._rotations[that._currDialId] = that._rot;
			
		}
		
		function startRotation(event){
			event.preventDefault();
			
			$(window).mousemove(rotateDial);
			that._rotatingDial = $(event.target).closest(".dial");
			that._currDialId = parseInt(that._rotatingDial.attr("id").substring(1), 10);
			that._rot = that._rotations[that._currDialId];
			that._oldRot = that._rot;
			//startVal = unitvalue;
			switch (that._currDialId){
				case 0: 
					that._startVal = that._displayDur;
					break;
				case 1:
					break;
				case 2:
					that._startVal = that._cost;
					break;
			}
			that._mouseStart = [event.pageX, event.pageY];
			$(window).mouseup(stopRotateDial);
		}
		
		function rotateDial(event){
			that._rot += ((event.pageX - that._mouseStart[0]) + (that._mouseStart[1] - event.pageY)) * 0.5;
			if (that._currDialId == 1){
				if (that._rot > 145) that._rot = 145;
				if (that._rot < 55) that._rot = 55;
				switch (parseInt(Math.floor((that._rot - 55) / 30))){
					case 0:
						that._preferred = "hours";
						break;
					case 1:
						that._preferred = "days";
						break;
					case 2:
						that._preferred = "weeks";
						break;
					case 3:
						that._preferred = "months";
						break;
				}
				that._htmladmin.find("#d"+that._currDialId+" .dial-img").rotate(Math.floor((that._rot - 55) / 30) * 30 + 55);
				that.setDisplayDur();
				that._htmladmin.find(".duration-units td").css("opacity", 0.4);
				that._htmladmin.find("#"+that._preferred).css("opacity", 1);
			} else {
				that._htmladmin.find("#d"+that._currDialId+" .dial-img").rotate(that._rot);
			}
			
			that._mouseStart[0] = event.pageX;
			that._mouseStart[1] = event.pageY;
			that.setDialValue(event.shiftKey);
			that._project.setBars();
		}
		
		function onSelectUnit(event){
			event.preventDefault();
			
			var preferredduration = $(event.target).closest("td").attr("id");
			
			that._preferred = preferredduration;
			that.setSelectUnit();
		}
		
		function onAddItem(event){
			that.addItem();
		}
		
		function checkboxChange(event){
			event.preventDefault();
			that._complete = !that._complete;
			that._project.setBars();
			that._project.saveBars();
			that.saveItem();
		}
		
		function deleteItem(){
			event.preventDefault();
			if (that._linkid == null){
				that._project.removeItem(that._id);
			} else {
				that._parentitem.removeItem(that._id);
			}
			var deletedItem = {};
			deletedItem.id = that._id;
			deletedItem.cmd = "di";
			$.post("services.php", deletedItem, itemDeleted);
		}
		
		function itemDeleted(){ that._html.animate({height:0}, 200, removeItem);}
		function removeItem(){
			that._html.remove();
			that._project.setBars();
			that._project.saveBars();
		}
	}
	
	Item.prototype.editTitle = function(){
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
			that.saveItem();
			$("#background-cover").animate({opacity:0},200, function(){
				$(this).css("display", "none");
			});
			that.setBars();
		}
	}
	
	Item.prototype.removeItem = function(id){
		for (var i = 0; i < this._subitems.length; i++){
			if (this._subitems[i]._id == id){
				this._subitems.splice(i, 1);
				break;
			}
		}
		if (this._subitems.length == 0){
			this._itemopen = false;
		}
	}
	
	Item.prototype.pushItem = function(item){
		this._subitems.push(item);
		this._htmlitems.append(item._html);
		item._parentitem = this;
		
	}
	
	Item.prototype.addItem = function(){
		var itemData = {i_id				:"new", 
						i_linkid			:this._id,
						i_title				:"", 
						i_preferredduration	:"hours", 
						i_hours				:0,
						i_cost				:0, 
						i_complete			:false};
		
		var $item = new this.ItemClass(itemData, this._project, this.ItemClass, this);
		
		if (this._subitems.length == 0){
			$item._hours 		= this._hours;
			$item._complete 	= this._complete;
			$item._cost 		= this._cost;
			$item._preferred 	= this._preferred;
			$item.setAdmin();
			if (this._itemopen){
				this._htmladmincontainer.stop();
				this._htmladmincontainer.animate({opacity:0}, 100, closeAdmin)
				var that = this;
				function closeAdmin(){
					that._htmladmin.css("display", "none");
					that._htmladmincontainer.animate({height:0}, 100);
				}
			}
			
			this._hours = 0;
			this._complete = false;
			this._cost = 0;
			this._preferred = "hours";
		}
		
		this._subitems.push($item);
		this._htmlitems.prepend($item._html);
		this._project.setHue();
		
		
		$item.setWidth();
		this._itemopen = false;
		this.onItemAction();
		$item.onItemAction(true);
		this._project.setBars();
	}
	
	Item.prototype.setDialValue = function(shiftKey){
		if (this._oldShift != shiftKey){
			this._startVal = this._unitvalue;
			this._oldRot = this._rot;
			this._oldShift = shiftKey;
		}
		
		this._unitvalue = this._startVal + ((parseInt((this._rot - this._oldRot)/ 15) / 4)) * ((shiftKey)?10:1);
		if (this._unitvalue < 0) this._unitvalue = 0;
		switch (this._currDialId){
			case 0:
				this._htmladmin.find(".duration-value input").val(this._unitvalue.toFixed(2));
				switch(this._preferred){
					case "months":
						this._hours = this._unitvalue * (24 * 30);
						break;
					case "weeks":
						this._hours = this._unitvalue * (24 * 7);
						break;
					case "days":
						this._hours = this._unitvalue * 24;
						break;
					case "hours":
						this._hours = this._unitvalue;
						break;
				}
				this._displayDur = this._unitvalue;
				break;
			case 1:
				this.setDuration();
				break;
			case 2:
				this._cost = this._unitvalue;
				this.moneyChange();
				break;
		}
		
	}
	
	Item.prototype.moneyChange = function(){
		this._project.setBars();
		this._htmladmin.find(".money-value  input").val(this._cost.toFixed(2)); 
	}
	
	Item.prototype.setSelectUnit = function(){
		switch (this._preferred){
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
		var rot = 55 + (rotMult * 30);
		this._htmladmin.find("#d1 .dial-img").rotate(rot);
		
		this.setDisplayDur();
		
		this._htmladmin.find(".duration-units td").css("opacity", 0.4);
		this._htmladmin.find("#"+this._preferred).css("opacity", 1);
		
	}
	
	Item.prototype.saveItem = function (){
		var saveData = {};
		saveData.id 				= this._id;
		saveData.hours 				= this._hours;
		saveData.preferredduration 	= this._preferred;
		saveData.title 				= this._title;
		saveData.projectid 			= this._project._id;
		saveData.cost 				= this._cost;
		saveData.complete 			= (this._complete)?1:0;
		saveData.linkid 			= (this._linkid != null)?this._linkid:"NULL";
		saveData.cmd 				= "si";
		
		$.post("services.php", saveData, onSaveItem);
		
		var that = this;
		function onSaveItem(dataStr){
			var $data = JSON.parse(dataStr);
			that._id = $data.id;
			that._project.saveBars();
		}
	}
	
	Item.prototype.setChecked = function(){
		
	}
	
	Item.prototype.onItemAction = function(editOnFinish){
		var that = this;
		if (this._itemopen){
			this._itemopen = false;
			if (this._subitems.length > 0){ // sub items open
				this._htmlitemscontainer.animate({opacity:0}, 200, closeSubitems)
				var that = this;
				function closeSubitems(){
					that._htmlitemscontainer.animate({height:0}, 200, setSubitemsClosed);
				}
				function setSubitemsClosed(){
					that._htmlitems.css("display", "none");
				}
			} else { // if admin open save admin settings
				this.saveItem();
				this._htmladmincontainer.animate({opacity:0}, 200, closeAdmin)
				var that = this;
				function closeAdmin(){
					that._htmladmin.css("display", "none");
					that._htmladmincontainer.animate({height:0}, 200);
				}
			}
		} else { // item is closed
			this._itemopen = true;
			if (this._subitems.length > 0){ // show subitems
				this._htmlitemscontainer.animate({height:this._htmlitems.height()}, 200, setItemsOpen);
				var that = this;
				function setItemsOpen(){
					that._htmlitems.css("display", "block");
					that._htmlitemscontainer.animate({opacity:1}, 200);
					that._htmlitemscontainer.css("height", "auto");
				}
			} else { // show admin
			
				this._htmladmincontainer.animate({height:95}, 200, setAdminOpen);
				var that = this;
				function setAdminOpen(){
					that._htmladmin.css("display", "block");
					that._htmladmincontainer.animate({opacity:1}, 200, (editOnFinish)?editTitle:null );
				}
			}
		}
		function editTitle(){
			that.editTitle();
		}
	}
	
	return Item;
});