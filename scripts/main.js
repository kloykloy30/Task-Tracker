var $ProjectClass;
var $ColorClass;
var $ItemClass;

var $projectData;
var $projects;
var firstLoad = true;

var PROJECT_WIDTH = 863;

define(['Project', 'Color', 'Item'], function(Project, Color, Item){
	$ProjectClass = Project;
	$ColorClass = Color;
	$ItemClass = Item;
	
	buildApp();
});

var currdate;

function buildApp(){
	
	var params = {cmd:"gp"};
	if (getParameterByName("tags") != ""){
		params.tags = getParameterByName("tags");
	}
	$.post("services.php", params, onProjectLoad);
	$.post("services.php",	{cmd:"gt"}, onTagsLoad);
}

function addProject(){
	var $project = new $ProjectClass(null, currdate.slice(), $ItemClass);
	$("#projects").append($project._html);
	$project.addItem();
}

function onProjectLoad(dataStr){
	$projectData = JSON.parse(dataStr);
	$projects = new Array();
	$("#projects").html("");
	currdate = [];
	if ($projectData.currdate != null){
		//TODO
		currdate = $projectData.currdate.split("-");
		for (var i = 0; i < currdate.length; i++){
			currdate[i] = parseInt(currdate[i], 10);
		}
	}
	for (var i = 0; i < $projectData.projects.length; i++){
		var $project = new $ProjectClass($projectData.projects[i], currdate.slice(), $ItemClass);
		$("#projects").append($project._html);
		$projects.push($project);
	}
	
	if (firstLoad){
		firstLoad = false;
		
		$('#filter-input').live('keydown', function(e) { 
			var keyCode = e.keyCode || e.which; 
			if (keyCode == 9 || keyCode == 13) { 
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
		
		$("#add-project").bind("click", addProject);
	}
}

function deleteLastSearchTerm(){
	var len = $("#filter-terms .term").length;
	if (len > 0){
		$($("#filter-terms .term")[len-1]).remove();
		searchTerms();
	}
}

function onTagsLoad(data){
	tags = data.split(",");
	cAutocomplete.init();
}

function createNewFilterTerm(term){
	if (term != ""){
		var str = "<li class='term'>"+term+"</li>";
		$(str).insertBefore("#filter-li");
		$("#filter-input").val("");
		searchTerms();
	}
}

function createNewTag(term){
	var str = "<li class='term'>"+term+"</li>";
	
}

function searchTerms(){
	var params = {cmd:"gp"};

	var tags = [];
	
	for (var i = 0; i <  $("#filter-terms .term").length; i++){
		tags.push($($("#filter-terms .term")[i]).text());
	}
	if (tags.length > 0){
		params.tags = tags.join(",");
	}
	$.post("services.php", params, onProjectLoad);
}