function hasClass(ele, cls) {
	return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
function addClass(ele, cls) {
	if (!this.hasClass(ele, cls)) ele.className += " " + cls;
}
function removeClass(ele, cls) {
	if (hasClass(ele, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		ele.className = ele.className.replace(reg, ' ');
	}
}

function buttonInit() {
	setSelected("mapButton");
	setDeselected("graphButton");
	setVisible("domesticButton");
	setVisible("internationalButton");
	setVisible("allButton");
}

function buttonGraph(){
	setSelected("graphButton");
	setDeselected("mapButton");
	setHidden("domesticButton");
	setHidden("internationalButton");
	setHidden("allButton");
    setHidden("buttonLabel");
    
    map.unload(graph.load);
}
function buttonMap(){
	setSelected("mapButton");
	setDeselected("graphButton");
	setVisible("domesticButton");
	setVisible("internationalButton");
	setVisible("allButton");
    setVisible("buttonLabel");
    
    graph.unload(map.load);
}
function buttonAll(){
	map.showTotals();
}
function buttonDomestic(){
	map.showAllInternal();
}
function buttonInternational(){
	map.showInternational();
}
function setSelected(id){
	var el = document.getElementById(id);
	addClass(el, "button on")
}
function setDeselected(id){
	var el = document.getElementById(id);
	removeClass(el, "button on");
}
function setHidden(id){
	var el = document.getElementById(id);
	el.style.visibility = "hidden";
}
function setVisible(id){
	var el = document.getElementById(id);
	el.style.visibility = "visible";
}