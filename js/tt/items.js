var indent = 100;
$(function(){
	//$.post("services.php",	{cmd:"gi", id:1}, onItemsLoad);
	/*
	setSubitemWidths($(".items .item"));
	$(".dial-img").mousedown(startRotation);
	$(".dial-cover").mousedown(startRotation);
	$(".duration-units a").bind("click", onSelectUnit);
	$(".background-hue").css("background-color", "red");
	$(".openadmin").mousedown(openItemAdmin);
	$(".additem").mousedown(addItem);
	$(".bars-cover").mousedown(openSubItems);
	*/
});
function loadItems(id){
	$.post("services.php",	{cmd:"gi", id:id}, onItemsLoad);
}
var items;
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
			console.log("itemArray:"+j+" :"+itemArray[j]);
			itmd = itemArray[j].split("=");
			if (itmd[0] == "hours" || itmd[0] == "cost"){
				itemData[itmd[0]] = parseFloat(itmd[1]);
			} else if (itmd[0] == "complete"){
				itemData[itmd[0]] = parseInt(itmd[1]);
			} else {
				itemData[itmd[0]] = itmd[1];
			}
		}
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
	var proj = $("#p1 .items");
	for (i = 0; i < items.length; i++){
		itemData = items[i];
		console.log("itemData.id:"+itemData.id);
		if (itemData.linkid == null){
			proj.append(itemData.html);
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
	console.log('height:'+$("#p1 .items").height());
	$("#p1 .items-body").animate({height: $("#p1 .items").height()}, 500, function(){$(this).css("height", "auto")});
	for (i = 0; i < items.length; i++){
		itemData = items[i];
		setBars(itemData);
	}
	setSubitemWidths(proj.find("> .item"));
	var id = items[0].projectid;
	console.log("id:"+projects.length)
	for (i = 0; i < projects.length; i++){
		if (id == projects[i].id){
			var projectData = projects[i];
			break;
		}
	}
	setHue(projectData);
}

function setChecked(itemData){
	if (itemData.complete){
		itemData.html.find(".item-check input").attr("checked", true);
	}
}

function setAdmin(itemData){
	setDisplayDur(itemData);
	
	itemData.html.find("> .item-body > .admin-container .duration-units td#"+itemData.preferredduration).css("opacity", 1);
	itemData.html.find("> .item-body > .admin-container .money-input input").val(itemData.cost);
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
	itemData.html.find("> .item-body > .admin-container .dial-value").html(itemData.displayDur);
}

function setTitle(itemData){
	itemData.html.find("> .bars .title").html(itemData.title);
	itemData.html.find("> .item-body > .admin-container .title-input").val(itemData.title);
}
function setBars(item){
	console.log("setBars:"+item+" ;"+item.title);
	if (item.subitems.length > 0){
		var barVals = getBarVals(item.subitems);
		console.log("barsVals:"+barVals);
		var hoursComplete = ((barVals[0] / barVals[1]) * 100) + "%";
		var moneyComplete = ((barVals[2] / barVals[3]) * 100) + "%";
		item.html.find("> .bars .progressbar .achieved").stop();
		item.html.find("> .bars .moneybar .achieved").stop();
		item.html.find("> .bars .progressbar .achieved").animate({width:hoursComplete}, 400);//css("width", hoursComplete);
		item.html.find("> .bars .moneybar .achieved").animate({width:moneyComplete}, 400);//css("width", moneyComplete);
	} else {
		var percent = (item.complete == 1) ? "100%" : "0";
		item.html.find("> .bars .progressbar .achieved").css("width", percent);
		item.html.find("> .bars .moneybar .achieved").css("width", percent);
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
			returnArray[2] += (item.complete == 1) ? item.cost : 0;
			returnArray[3] += item.cost;
		}
	}
	console.log("returnArray[1]:"+returnArray[1]);
	return returnArray;
}

var itemnum = 3;
function addItem(event){
	var itemId = $(event.target).closest(".item").attr("id").substring(1);
	var projectId = $(event.target).closest(".project").attr("id").substring(1);
	var item = $("#item-template .item").clone();
	var newId = "i" +"t"+(++itemnum);
	var itemData = {id:newId.substring(1), linkid:itemId, projectid:projectId, title:"", preferredduration:"hours", subitems:[], displayDur:0, hours:0, complete:false};
	
	item.attr("id", newId);
	setFunctions(item); 
	$($("#i"+itemId+" .subitems")[0]).append(item);
	itemData.html = item;
	items.push(itemData);
	for (var i = 0; i < items.length; i++){
		if (items[i].id == itemId){
			items[i].subitems.push(itemData);
			break;
		}
	}	
	setSubitemWidths($(".items .item"));
	setDuration(itemData);
	setBars(itemData);
	openItemAdmin(itemId);
	openItemAdmin(newId.substring(1));
	
	
	openSubItems(itemId, true);
}

function setDuration(itemData){	893646508633
	//itemData.html.find(
	itemData.html.find(".duration-units td").css("opacity", 0.4);
	itemData.html.find("#"+itemData.preferredduration).css("opacity", 1);
}

function setFunctions(item){
	item.find(".dial-img").mousedown(startRotation);
	item.find(".dial-cover").mousedown(startRotation);
	item.find(".duration-units a").bind("click", onSelectUnit);
	item.find(".background-hue").css("background-color", "red");
	item.find(".openadmin").mousedown(onOpenItemAdmin);
	item.find(".additem").mousedown(addItem);
	item.find(".bars-cover").mousedown(onOpenSubItems);
	item.find(".item-check input").bind("change", checkboxChange);
	item.find(".item-delete a").bind("click", onDeleteItem);
	item.find(".money-input input").bind("keyup", moneyChange);
	item.find(".money-clear a").bind("click", onClearMoney);
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
}

function moneyChange(event){
	console.log("moneyChange");
	itemId = $(event.target).closest(".item").attr("id").substring(1);
	for (var i = 0; i < items.length; i++){
		if (items[i].id == itemId){
			var itemData = items[i];
			break;
		}
	}
	itemData.cost = parseFloat(itemData.html.find("> .item-body > .admin-container .money-input input").val());
	for (i = 0; i < items.length; i++){
		itemData = items[i];
		setBars(itemData);
	}
}

function onDeleteItem(event){
	var item = $(event.target).closest(".item");
	var itemId = item.attr("id").substring(1);
	for (var i = 0; i < items.length; i++){
		if (items[i].id == itemId){
			itemData = items[i];
			items.splice(i,1);
			break;
		}
	}
	
	if (itemData.linkid != null){
		for (i = 0; i < items.length; i++){
			if (items[i].id == itemData.linkid){
				for (var j = 0; j < items[i].subitems.length; j++){
					if (items[i].subitems[j] === itemData){
						items[i].subitems.splice(j, 1);
						break;
					}
				}
				break;
			}
		}
	}
	item.remove();
	var deleteItem = {};
	deleteItem.id = itemId;
	deleteItem.cmd = "di";
	$.post("services.php", deleteItem, itemDeleted);
	
}
function itemDeleted(data){
	console.log("item deleted:"+data);
	for (i = 0; i < items.length; i++){
		itemData = items[i];
		setBars(itemData);
	}
}

function checkboxChange(event){
	
	var checkboxState = $(event.target).parent().find(":checked").length > 0;
	var id = $(event.target).closest(".item").attr("id").substring(1);
	for (var i = 0; i < items.length; i++){
		if(items[i].id == id){
			var itemData = items[i];
			break;
		}
	}
	itemData.complete = checkboxState;
	for (i = 0; i < items.length; i++){
		itemData = items[i];
		setBars(itemData);
	}
	
}

function onOpenSubItems(event){
	var itemId = $(event.target).closest(".item").attr("id").substring(1);
	var projectId = $(event.target).closest(".project").attr("id").substring(1);
	openSubItems(itemId);
}

function openSubItems(itemId, override){
	console.log("opensub items:"+itemId);
	var subitems = $("#i"+itemId+" > .item-body > .subitems-body > .subitems");
	if (subitems.css("display")=="block" && override != true){ // items already expanded
		subitems.css("display", "none");
		$("#i"+itemId+" .subitems-body").animate({height:0}, 200);
	} else {
		if (subitems.css("display")=="none"){
			subitems.css("display", "block");
			var goalHeight = subitems.height();
			//goalHeight
			subitems.css("display", "none");
		} else {
			goalHeight = subitems.height();
		}
		$("#i"+itemId+" > .item-body > .subitems-body").animate({height:goalHeight}, 200, function(){
																							$(this).find("> .subitems").css("display", "block");
																							$(this).css("height", "auto")});
	}
}

function onSelectUnit(event){
	//alert ($(event.target).closest(".project").attr("id"));
	var item = $(event.target).closest(".item");
	var preferredduration = $(event.target).closest("td").attr("id");
	for (var i = 0; i < items.length; i++){
		if (items[i].id == item.attr("id").substring(1)){
			var itemData = items[i];
			break;
		}
	}
	itemData.preferredduration = preferredduration;
	setDisplayDur(itemData);
	item.find(".duration-units td").css("opacity", 0.4);
	item.find("#"+itemData.preferredduration).css("opacity", 1);
	//$(event.target).closest("td").css("opacity", 1);
	
}

var currItemId;
var currItem;
var currProjectId;
var rot = 0;
var unitvalue = 0;
function startRotation(event){
	$(window).mousemove(rotateDial);
	rotatingDial = $(event.target).closest(".dial");
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
	startVal = currItem.displayDur;
	event.preventDefault();
	mouseStart = [event.pageX, event.pageY];
	$(window).mouseup(stopRotateDial);
}

function onOpenItemAdmin(event){
	var itemId = $(event.target).closest(".item").attr("id").substring(1);
	openItemAdmin(itemId);
}

function openItemAdmin(itemId){
	//var projectId = $(event.target).closest(".project").attr("id").substring(1);
	if ($("#i"+itemId+" .admin").css("display") == "block"){ // admin is open
		$("#i"+itemId+" > .item-body .admin-container .admin").css("display", "none");
		$("#i"+itemId+" > .bars .title").css("display", "block");
		$("#i"+itemId+" > .item-body .admin-container").animate({height:0}, 200);
		$("#i"+itemId+" > .bars .title").html($("#i"+itemId+" > .item-body > .admin-container .title-input").val());
		saveItem(itemId);
	} else { // admin is closed
		if ($("#i"+itemId+" > .item-body > .subitems-body > .subitems").children().length > 0){
			$("#i"+itemId+" > .item-body > .admin-container .endclass-item").css("display", "none");
			$("#i"+itemId+" > .bars .title").css("display", "none");
			$("#i"+itemId+" > .item-body > .admin-container .admin").css("display", "block");
		} else {
			$("#i"+itemId+" > .item-body .admin .endclass-item").css("display", "block");
			$("#i"+itemId+" > .item-body > .admin-container").animate({height:60}, 200, function(){
																			$(this).closest(".item").find("> .bars .title").css("display", "none");
																			$(this).find(".admin").css("display", "block");});
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
	itemData.title = itemData.html.find("> .item-body > .admin-container .title-input").val();
	
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
	console.log("item saved"+data.id);
}

function stopRotateDial(event){
	$(window).unbind("mousemove");
	rotStart = -rot;
	currItem.displayDur = unitvalue;
}
function rotateDial(event){
	rot += ((event.pageX - mouseStart[0]) + (mouseStart[1] - event.pageY)) * 0.5;
	$("#p"+currProjectId+" #i"+currItemId+" .dial-img").rotate(rot);
	mouseStart[0] = event.pageX;
	mouseStart[1] = event.pageY;
	setDialValue(event.shiftKey);
	for (i = 0; i < items.length; i++){
		itemData = items[i];
		setBars(itemData);
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
	$("#i"+currItemId+" .dial-value").html(unitvalue);
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
	console.log("currItem.hours:"+currItem.hours);
}