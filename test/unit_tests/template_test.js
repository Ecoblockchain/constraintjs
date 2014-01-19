module("Templates");

dt("Static Templates", 7, function() {
	var empty_template = cjs.createTemplate("", {});
	equal(getTextContent(empty_template), "");
	cjs.destroyTemplate(empty_template);

	var hello_template = cjs.createTemplate("hello world", {});
	equal(getTextContent(hello_template), "hello world");
	cjs.destroyTemplate(hello_template);

	var div_template = cjs.createTemplate("<div>hi</div>", {});
	equal(div_template.tagName.toLowerCase(), "div");
	equal(getTextContent(div_template), "hi");
	cjs.destroyTemplate(div_template);

	var nested_div_template = cjs.createTemplate("<div>hi <strong>world</strong></div>", {});
	equal(nested_div_template.tagName.toLowerCase(), "div");
	var strong_content = nested_div_template.getElementsByTagName("strong")[0];
	equal(getTextContent(strong_content), "world");
	cjs.destroyTemplate(nested_div_template);

	var classed_template = cjs.createTemplate("<div class='my_class'>yo</div>", {});
	equal(classed_template.className || classed_template['class'], "my_class");
	cjs.destroyTemplate(classed_template);
});

dt("Dynamic Templates", 5, function() {
	var t1 = cjs.createTemplate("{{x}}", {x: "hello world"});
	equal(getTextContent(t1), "hello world");
	cjs.destroyTemplate(t1);

	var greet = cjs("hello");
	var city = cjs("pittsburgh");
	var tlate = document.createElement("div");
	tlate.setAttribute("type", "cjs/template");
	tlate.innerText = tlate.textContent = "{{greeting}}, {{city}}";
	var t2 = cjs.createTemplate(tlate, {greeting: greet, city: city});
	equal(getTextContent(t2), "hello, pittsburgh");
	greet.set("bye");
	equal(getTextContent(t2), "bye, pittsburgh");
	city.set("world");
	equal(getTextContent(t2), "bye, world");
	cjs.destroyTemplate(t2);
	greet.destroy();
	city.destroy();

	var create_template_fn = cjs.createTemplate("{{x}}");
	var template_instance = create_template_fn({x: 1});
	equal(getTextContent(template_instance), "1");
	cjs.destroyTemplate(template_instance);
});

dt("HTMLized Templates", 7, function() {
	var x = cjs("X"), y = cjs("Y");
	var t1 = cjs.createTemplate("{{{x}}}, {{y}}", {x: x, y: y});
	equal(getTextContent(t1), "X, Y");
	x.set("<strong>X</strong>");
	var strong_content = t1.getElementsByTagName("strong")[0];
	equal(getTextContent(t1), "X, Y");
	equal(getTextContent(strong_content), "X");
	y.set("<b>Y</b>");
	equal(getTextContent(t1), "X, <b>Y</b>");

	var t2 = cjs.createTemplate("<div>{{{x}}}, {{y}}</div>", {x: x, y: y});
	equal(getTextContent(t2), "X, <b>Y</b>");
	var strong_content = t2.getElementsByTagName("strong")[0];
	equal(getTextContent(strong_content), "X");
	equal(t2.tagName.toLowerCase(), "div");
});

dt("Attributes", 4, function() {
	var the_class = cjs("class1");
	var t1 = cjs.createTemplate("<span class={{x}}>yo</span>", {x: the_class});

	equal(t1.className, "class1");
	the_class.set("classX");
	equal(t1.className, "classX");

	var second_class = cjs("class2");
	var t2 = cjs.createTemplate("<span class='{{x}} {{y}} another_class'>yo</span>", {x: the_class, y: second_class});
	equal(t2.className, "classX class2 another_class");
	second_class.set("classY");
	equal(t2.className, "classX classY another_class");
});

dt("Each", 3, function() {
	var elems = cjs([1,2,3]);
	var t1 = cjs.createTemplate("<div>" +
		"{{#each elems}}" +
		"<span>{{this}}</span>" +
		"{{/each}}"+
	"</div>", {elems: elems});
	equal(t1.childNodes.length, 3);
	var elem0 = t1.childNodes[0];
	elems.push(4);
	equal(t1.childNodes.length, 4);
	equal(elem0, t1.childNodes[0]);
});

dt("Conditionals", 21, function() {
	var cond = cjs(true);
	var t1 = cjs.createTemplate("<div>" +
		"{{#if cond}}" +
		"1" +
		"{{#else}}" +
		"2" +
		"{{/if}}"+
	"</div>", {cond: cond});
	equal(getTextContent(t1), "1")
	cond.set(false);
	equal(getTextContent(t1), "2")
	cond.set(true);
	equal(getTextContent(t1), "1")

	var cond2 = cjs(true);
	t1 = cjs.createTemplate("<div>" +
		"{{#if cond}}" +
		"1" +
		"{{#elif cond2}}" +
		"2" +
		"{{/if}}"+
	"</div>", {cond: cond, cond2: cond2});
	equal(getTextContent(t1), "1")
	cond.set(false);
	equal(getTextContent(t1), "2")
	cond.set(true);
	equal(getTextContent(t1), "1")
	cond2.set(true);
	equal(getTextContent(t1), "1")
	cond.set(false);
	equal(getTextContent(t1), "2")
	cond2.set(false);
	equal(getTextContent(t1), "")
	cond2.set(true);
	equal(getTextContent(t1), "2")
	cond.set(true);
	equal(getTextContent(t1), "1")


	var t2 = cjs.createTemplate("<div>" +
		"{{#if cond}}" +
		"<span>A</span>" +
		"{{#elif cond2}}" +
		"<span>B</span>" +
		"{{#else}}" +
		"<span>C</span>" +
		"{{/if}}"+
	"</div>", {cond: cond, cond2: cond2});
	var cna1 = t2.childNodes[0];
	equal(getTextContent(cna1), "A")
	cond.set(false);
	var cnb1 = t2.childNodes[0];
	equal(getTextContent(cnb1), "B")
	cond.set(true);
	var cna2 = t2.childNodes[0];
	equal(getTextContent(cna2), "A")
	cond.set(false);
	var cnb2 = t2.childNodes[0];
	equal(getTextContent(cnb2), "B")
	equal(cna1, cna2);
	equal(cnb1, cnb2);
	cond2.set(false);
	var cnc2 = t2.childNodes[0];
	equal(getTextContent(cnc2), "C")

	var cond2 = cjs(true);
	var t3 = cjs.createTemplate("<div>" +
		"{{#unless cond}}" +
		"1" +
		"{{/unless}}"+
	"</div>", {cond: cond2});
	equal(getTextContent(t3), "")
	cond2.set(false);
	equal(getTextContent(t3), "1")
	cond2.set(true);
	equal(getTextContent(t3), "")
});

dt("FSM", 3, function() {
	var my_fsm = cjs.fsm("s1", "s2")
					.startsAt("s1");
	var s1s2 = my_fsm.addTransition("s1", "s2");
	var s2s1 = my_fsm.addTransition("s2", "s1");
	var t1 = cjs.createTemplate("<div>" +
		"{{#fsm my_fsm}}" +
		"{{#state s1}}" +
		"1" +
		"{{#state s2}}" +
		"2" +
		"{{/fsm}}"+
	"</div>", {my_fsm: my_fsm});
	equal(getTextContent(t1), "1")
	s1s2();
	equal(getTextContent(t1), "2")
	s2s1();
	equal(getTextContent(t1), "1")
});

dt("Provided Parent", 4, function() {
	var elem = document.createElement("div");
	var x = cjs(1);
	var template = cjs.createTemplate("{{this}}", x, elem);
	equal(template, elem);
	equal(getTextContent(template), "1");
	x.set(2);
	equal(getTextContent(template), "2");
	equal(template, elem);
});

dt("FN Calls", 2, function() {
	var abc = cjs.createTemplate("{{#each x}}{{plus_one(this)}}{{/each}}", {x: [1,2,3], plus_one: function(x){ return x+1; }});
	equal(abc.childNodes.length, 3);
	equal(getTextContent(abc), "234");
});

dt("Nested Templates", 2, function() {
	var hi_template = cjs.createTemplate("Hello, {{this}}");
	cjs.registerPartial("hello", hi_template);
	var abc = cjs.createTemplate("{{> hello this}}", "world");
	equal(abc.childNodes.length, 1);
	equal(getTextContent(abc), "Hello, world");
});

dt("Template Comments", 2, function() {
	var tmplate = cjs.createTemplate("{{! comment 1 }}{{!comment2}}{{#each num}}<!--some html comment-->{{/each}}", {num: [1,2,3]});
	equal(tmplate.childNodes.length, 3);
	equal(tmplate.childNodes[0].nodeType, 8);
});

dt("With", 1, function() {
	var tmplate = cjs.createTemplate("{{#with x}}{{a}}{{b}}{{../y}}{{/with}}", {x: {a: "a", b: "b"}, y: "y"});
	equal(getTextContent(tmplate), "aby");
});

dt("Each/Else", 5, function() {
	var x = cjs([1,2]);
	var tmplate = cjs.createTemplate("{{#each x}}{{this}}{{#else}}nothing{{/each}}", {x: x});
	equal(getTextContent(tmplate), "12");
	x.splice(0, 1);
	equal(getTextContent(tmplate), "2");
	x.splice(0, 1);
	equal(getTextContent(tmplate), "nothing");
	x.splice(0, 0, 2, 3);
	equal(getTextContent(tmplate), "23");
	x.splice(0, 2);
	equal(getTextContent(tmplate), "nothing");
});

dt("Parser test", 1, function() {
	var tmplate = cjs.createTemplate("{{'{}'}}{{\"}{\"}}", {});
	equal(getTextContent(tmplate), "{}}{");
});

dt("Each key/index", 6, function() {
	var arr = cjs(["a", "b"]);
	var obj = cjs({x: "x_val", y: "y_val"});
	var tmplate = cjs.createTemplate("{{#each arr}}{{@index}}{{/each}}", {arr: arr});
	equal(getTextContent(tmplate), "01");
	arr.splice(0, 1);
	equal(getTextContent(tmplate), "0");
	
	tmplate = cjs.createTemplate("{{#each obj}}{{@key}}{{/each}}", {obj: obj});
	equal(getTextContent(tmplate), "xy");

	var key1 = {},
		key2 = {};
	var dynamic_map = cjs.map({
		keys: [key1, key2],
		values: [1, 2]
	});
	var expected;
	var func = function(key, val) {
		equal(dynamic_map.get(key), val);
		return val;
	};
	var tmplate = cjs.createTemplate("{{#each obj}}{{ this }}{{ func(@key, this) }}{{/each}}", {obj: dynamic_map, func: func});
	equal(getTextContent(tmplate), "1122");
});

dt("Template out", 2, function() {
	var context = {};
	var tmplate = cjs.createTemplate("<input type='text' data-cjs-out='x' />", context);
	equal(context.x.get(), "");
	tmplate.value = "hello";
	context.x.invalidate();
	equal(context.x.get(), "hello");
});

dt("Pause/Resume/Destroy templates", 7, function() {
	var x = cjs(1);
	var tmplate = cjs.createTemplate("{{x}}", {x: x});
	equal(getTextContent(tmplate), "1");
	x.set(2);
	equal(getTextContent(tmplate), "2");
	cjs.pauseTemplate(tmplate);
	equal(getTextContent(tmplate), "2");
	x.set(3);
	cjs.resumeTemplate(tmplate);
	equal(getTextContent(tmplate), "3");
	x.set(4);
	equal(getTextContent(tmplate), "4");
	cjs.destroyTemplate(tmplate);
	equal(getTextContent(tmplate), "4");
	x.set(5);
	equal(getTextContent(tmplate), "4");
});

dt("Condition/State Combo", 7, function() {
	var cond = cjs(false),
		fsm = cjs	.fsm("state1", "state2")
					.startsAt("state1");
	var onetwo = fsm.addTransition("state1", "state2"),
		twoone = fsm.addTransition("state2", "state1");
	var tmplate = cjs.createTemplate(
		"{{#fsm my_fsm}}" +
			"{{#state state1}}" +
				"{{#if cond}}" +
					"A" +
				"{{/if}}" +
			"{{#state state2}}" +
				"{{#unless cond}}" +
					"B" +
				"{{/unless}}" +
		"{{/fsm}}", {
			cond: cond,
			my_fsm: fsm
		});

	equal(getTextContent(tmplate), "");
	cond.set(true);
	equal(getTextContent(tmplate), "A");
	onetwo();
	equal(getTextContent(tmplate), "");
	cond.set(false);
	equal(getTextContent(tmplate), "B");
	cond.set(true);
	equal(getTextContent(tmplate), "");
	twoone();
	equal(getTextContent(tmplate), "A");
	cond.set(false);
	equal(getTextContent(tmplate), "");

});
