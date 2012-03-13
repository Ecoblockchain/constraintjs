/*global document:true */
(function(cjs) {if(!cjs._is_node) {
cjs.binding.mixin({
	val: function(elems, constraint) {
		if(arguments.length === 1) {
			//Return a constraint whose value is my val
			return cjs.create("input_value_constraint", _.first(elems));
		} else {
			return cjs.binding.bind(elem, "value", constraint);
		}
	}
});
}}(cjs));
