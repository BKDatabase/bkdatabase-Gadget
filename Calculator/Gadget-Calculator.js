/**
 * On-Wiki calculator script. See [[Template:Calculator]]. Created by [[User:Bawolff]]
 * License: Creative Commons Attribution-ShareAlike 3.0 and 4.0 International Public License
 * Canonical source: https://mdwiki.org/wiki/MediaWiki:Gadget-calculator.js
 *
 * This script is designed with security in mind. Possible security risks:
 *  * Having a formula that executes JS
 *  ** To prevent this we do not use eval(). Instead we parse the formula with our own parser into an abstract tree that we evaluate by walking through it
 *  * Form submission & DOM clobbering - we prefix the name (and id) attribute of all fields to prevent conflicts
 *  * Style injection - we take the style attribute from an existing element that was sanitized by MW. We do not take style from a data attribute.
 *  * Client-side DoS - Formulas aren't evaluated without user interaction. Formulas have a max length. Max number of widgets per page. Ultimately, easy to revert slow formulas just like any other vandalism.
 *  * Prototype pollution - We use objects with null prototypes and also reject fields named __proto__ just in case.
 *
 * Essentially the code works by replacing certain <span> tags with <input>, parsing a custom formula language, setting up a dependency graph based on identifiers, and re-evaluating formulas on change.
 */
(function () {

	var mathFuncs = [ 'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt', 'ceil', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'hypot',
		'log', 'log10', 'log2', 'log1p', 'max', 'min', 'pow', 'random', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc', 'clz32' ];
	var otherFuncs = [
		'ifzero', 'coalesce', 'iffinite', 'ifnan', 'ifpositive', 'ifequal', 'round', 'jsround', 'not', 'and', 'or', 'bool', 'ifless', 'iflessorequal', 'ifgreater', 'ifgreaterorequal', 'ifbetween', 'xor',
		'index', 'switch', 'radiogroup', 'bitand', 'bitor', 'bitxor', 'bitnot', 'bitleftshift', 'bitlogicrightshift', 'bitarithrightshift', 'if', 'getclick', 'timer', 'timeriterations', 'timertime'
	];
	var allFuncs = mathFuncs.concat(otherFuncs);

	var convertFloat = function ( f ) {
		if ( typeof f === 'number' ) {
			return f;
		}
		f = f.replace( /×\s?10/, 'e' );
		return parseFloat( f.replace( /[×⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, function (m) {
			return ({'⁰': 0,'¹': 1,'²': 2,'³': 3,'⁴': 4,'⁵': 5,'⁶': 6,'⁷': 7,'⁸': 8,'⁹': 9, '⁻': "-", "×": "e"})[m];
		} ) );
	};

	// Start parser code.
	var Numb = function(n) {
		if ( typeof n === 'number' ) {
			this.value = n;
		}
		this.value = parseFloat(n);
	};
	Numb.prototype.toString = function () { return 'Number<' + this.value + '>'; };

	var Ident = function(n) {
		this.value = n;
	};
	Ident.prototype.toString = function () { return 'IDENT<' + this.value + '>'; };

	var Operator = function(val, args) {
		this.op = val;
		this.args = args;
	};
	
	var Null = function() { };

	var Parser = function( text ) {
		this.text = text;
	};

	var terminals = {
		'IDENT': /^[a-zA-Z_][a-zA-Z0-9_]*/,
		'NUMBER': /^-?[0-9]+(?:\.[0-9]+)?(?:[eE][0-9]+|×10⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)*/,
		'WS': /^\s*/,
		'PLUSMINUS': /^[+-]/,
		'pi': /^(?:pi|π)(?![A-z_0-9-])/i,
		'true': /^(?:true)(?![A-z_0-9-])/,
		'false': /^(?:false)(?![A-z_0-9-])/,
		'epsilon': /^EPSILON(?![A-z_0-9-])/,
		'Infinity': /^Infinity(?![A-z_0-9-])/i,
		'-Infinity': /^Infinity(?![A-z_0-9-])/i,
		'NaN': /^NaN(?![A-z_0-9-])/i,
		'MULTIPLYDIV': /^[*\/%×÷]/i,
	};

	Parser.prototype = {
		check: function(id) {
			if ( terminals[id] ) {
				return !!(this.text.match(terminals[id]));
			}
			return this.text.startsWith( id );
		},
		consume: function(id) {
			if ( terminals[id] ) {
				var res = this.text.match(terminals[id]);
				this.text = this.text.substring( res[0].length );
				return res[0];
			}
			if ( this.text.startsWith( id ) ) {
				this.text = this.text.substring(id.length);
				return id;
			}
			throw new Error( "Expected " + id + " near " + this.text.substring(0,15) );
		},

		parse: function () {
			if ( this.text === undefined || this.text === '' ) return new Null();
			this.consume( 'WS' );
			res = this.expression();
			if( this.text.length !== 0 ) {
				throw new Error( "Unexpected end of formula. Perhaps you forgot to close a parenthesis or are using an invalid function." );
			}
			return res;
		},

		expression: function () {
			var text2, res, res2;
			res = this.term();
			this.consume( 'WS' );
			while ( this.check( "PLUSMINUS" )) {
				var op = this.consume( "PLUSMINUS" );
				this.consume( 'WS' );
				res2 = this.term();
				this.consume( 'WS' );
				res = new Operator( op, [ res, res2 ] );
			}
			return res;
		},

		argList: function () {
			var args = [];
			this.consume( 'WS' );
			if ( this.check( ')' ) ) {
				this.consume( ')' );
				return args;
			}
			args[args.length] = this.expression();
			this.consume( 'WS' );

			while ( this.check( ',' ) ) {
				this.consume( ',' );
				this.consume( 'WS' );
				args[args.length] = this.expression();
			}
			this.consume( 'WS' );
			this.consume( ')' );
			return args;
		},
		term: function () {
			var text2, res, res2;
			res = this.factor();
			this.consume( 'WS' );
			while ( this.check( "MULTIPLYDIV" )) {
				var op = this.consume( "MULTIPLYDIV" );
				if ( op === '×' ) op = '*';
				if ( op === '÷' ) op = '/';
				this.consume( 'WS' );
				res2 = this.factor();
				this.consume( 'WS' );
				res = new Operator( op, [ res, res2 ] );
			}
			return res;
		},
		factor: function () {
			this.consume( 'WS' );
			var res;
			if ( this.check( 'pi' ) ) {
				this.consume( 'pi' );
				return new Numb( Math.PI );
			}
			if ( this.check( 'true' ) ) {
				this.consume( 'true' );
				return new Numb( 1 );
			}
			if ( this.check( 'false' ) ) {
				this.consume( 'false' );
				return new Numb( 0 );
			}
			if ( this.check( 'Infinity' ) ) {
				this.consume( 'Infinity'  );
				return new Numb( Infinity );
			}
			if ( this.check( '-Infinity' ) ) {
				this.consume( '-Infinity'  );
				return new Numb( -Infinity );
			}
			if ( this.check( 'NaN' ) ) {
				this.consume( 'NaN'  );
				return new Numb( NaN );
			}
			if ( this.check( 'epsilon' ) ) {
				this.consume( 'epsilon' );
				return new Numb( Number.EPSILON );
			}

			for ( var i in allFuncs ) {
				if ( this.check( allFuncs[i] + '(' ) ) {
					this.consume(allFuncs[i] + '(');
					var argList = this.argList();
					return new Operator( allFuncs[i], argList );
				}
			}

			if ( this.check( 'IDENT' ) ) {
				return new Ident( this.consume( 'IDENT' ) );
			}
			if ( this.check( 'NUMBER' ) ) {
				return new Numb( convertFloat( this.consume( 'NUMBER' ) ) );
			}

			if ( this.check( '(' ) ) {
				this.consume( '(' );
				this.consume( 'WS' );
				res = this.expression();
				this.consume( 'WS' );
				this.consume( ')' );
				return res;
			}
			// unary minus
			if ( this.check( '-' ) ) {
				this.consume( '-' );
				this.consume( 'WS' );
				if ( this.check( '-' ) ) {
					throw new Error( "Double unary minus without parenthesis not allowed near " + this.text.substring(0,15));
				}
				res = this.factor();
				return new Operator( '*', [new Numb(-1), res] );
			}
			throw new Error( "Expected to see a term (e.g. an identifier, number, function, opening parenthesis, etc) near " + this.text.substring(0,15));
		},
	};
	// End parser code.

	// Based on https://floating-point-gui.de/errors/comparison/
	var almostEquals = function( a, b ) {
		var absA = Math.abs(a);
		var absB = Math.abs(b);
		var diff = Math.abs(a-b);
		var epsilon = Number.EPSILON; /// Not sure if this is a good value for epsilon
		var minNormal = Math.pow( 2, -1022 );
		if ( a===b) {
			return true;
		}
		// Min normal of double = 2^-1022
		if ( a==0 || b==0 || absA+absB < minNormal ) {
			return diff < epsilon * minNormal;
		}

		return diff / Math.min((absA + absB), Number.MAX_VALUE) < epsilon;
	};

	// elm: Element to get value of
	// Mapping to process value with (usually this.mappingInput[element item id])
	var getValueOfElm = function (elm, mapping) {
		var val;
		if ( elm.hasAttribute( 'data-calculator-real-value' ) ) {
			// We have a non-formatted value set. Use that and skip any mappings.
			return parseFloat( elm.getAttribute( 'data-calculator-real-value' ) );
		} else if ( elm.tagName === 'INPUT' || elm.tagName === 'SELECT' ) {
			if ( elm.type === 'radio' || elm.type === 'checkbox' ) {
				// Radio/checkboxes are not allowed to have mappings
				return elm.checked ? convertFloat( elm.value ) : 0;
			}
			val = elm.value;
		} else {
			val = elm.textContent;
		}
		if ( typeof val === 'string' ) {
			val = val.trim();
			var mapVals = [ val, val.toLowerCase() ];
			for ( var k = 0; k < mapVals.length; k++ ) {
				if (mapping && typeof mapping[mapVals[k]] === 'number' ) {
					return mapping[mapVals[k]];
				} else if ( mapping && [ 'Infinity', '-Infinity', 'NaN' ].indexOf( mapping[mapVals[k]] ) !== -1 ) {
					return parseFloat( mapping[mapVals[k]] );
				}
			}
		}

		return convertFloat( val );
	};

	// Evaluate the value of an AST at runtime.
	var evaluate = function( ast ) {
		var that = this;
		var elmList = this.elmList;
		var i, then, ielse, res, elm;
		if ( ast instanceof Numb ) {
			return ast.value;
		}
		if ( ast instanceof Ident ) {
			elm = elmList[ast.value];
			if ( elm === undefined ) {
				console.log( "Calculator: Reference to '" + ast.value + "' but there is no field by that name" );
				return NaN;
			}
			return getValueOfElm( elm, this.mappingInput[elm.id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' )] );
		}
		if ( ast instanceof Operator ) {
			// Special case, index() does not directly eval first arg
			// index() is like an array index operator (sort of)
			// It evaluates its second argument and concats that to the first identifier
			if ( 'index' === ast.op ) {
				if ( ast.args.length < 2 || !( ast.args[0] instanceof Ident ) ) {
					return NaN;
				}
				var indexValue = Math.floor(this.evaluate( ast.args[1] ));
				if ( !Number.isSafeInteger( indexValue ) || indexValue < 0 ) {
					return NaN;
				}
				res = elmList[ast.args[0].value + indexValue];
				if ( res === undefined ) {
					return ast.args.length >= 3 ? this.evaluate( ast.args[2] ) : NaN;
				}
				return getValueOfElm( res, this.mappingInput[res.id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' )] );
			}
			// Get the value of the checked element of a radio group or NaN if none checked
			// Unlike most things, first args identifies the radio group name and not an id.
			if ( ast.op === 'radiogroup' ) {
				if ( ast.args.length < 1 || !( ast.args[0] instanceof Ident ) ) {
					return NaN;
				}
				var radioName = ast.args[0].value;
				elm = this.parent.querySelector( 'input:checked[type=radio][name=' + CSS.escape( 'calcgadget-' + this.rand + '-' + radioName ) + ']' );
				if ( !elm ) {
					return NaN;
				}
				return this.evaluate( new Ident( elm.id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' ) ) );
			}
			if ( ast.op === 'getclick' ) {
				if ( ast.args.length < 1 || !( ast.args[0] instanceof Ident ) ) {
					return NaN;
				}
				switch( ast.args[0].value.toLowerCase() ) {
					case 'x':
						return this.clickX;
					case 'prevx':
						return this.clickPrevX;
					case 'prevpercentx':
						return this.clickPrevPercentX;
					case 'startpercentx':
						return this.clickStartPercentX;
					case 'startx':
						return this.clickStartX;
					case 'percentx':
						return this.clickPercentX;
					case 'y':
						return this.clickY;
					case 'percenty':
						return this.clickPercentY;
					case 'prevy':
						return this.clickPrevY;
					case 'prevpercenty':
						return this.clickPrevPercentY;
					case 'starty':
						return this.clickStartY;
					case 'startpercenty':
						return this.clickStartPercentY;
					case 'inprogress':
						return this.clickInProgress;
					case 'type':
						// 1 = start, 2 - move, 3 = done, 4 = cancel
						return this.clickType;
					default:
						return NaN;
				}
			}
			// Check if a specific timer is running.
			// timer() returns 0 or 1 if any timer
			// timer( timerName) checks for that sepcific timer
			// timer(timerName, trueValue, falseValue ) returns specific value.
			if ( ast.op === 'timer' ) {
				if (!this.repeatInfo) {
					return ast.args.length >= 3 ? this.evaluate( ast.args[2] ) : 0;
				}
				if (ast.args.length < 1 || (ast.args[0] instanceof Ident && ast.args[0].value === this.repeatInfo.id) ) {
					return ast.args.length >= 2 ? this.evaluate( ast.args[1] ) : 1;
				}
				return ast.args.length >= 3 ? this.evaluate( ast.args[2] ) : 0;
			}
			if ( ast.op === 'timeriterations' ) {
				if (!this.repeatInfo) {
					return NaN;
				}
				if (ast.args.length < 1 || (ast.args[0] instanceof Ident && ast.args[0].value === this.repeatInfo.id) ) {
					return this.repeatInfo.iterationsSoFar;
				}
				return NaN;
			}
			if ( ast.op === 'timertime' ) {
				if (!this.repeatInfo) {
					return NaN;
				}
				if (ast.args.length < 1 || (ast.args[0] instanceof Ident && ast.args[0].value === this.repeatInfo.id) ) {
					return (Date.now() - this.repeatInfo.timeStart)/1000;
				}
				return NaN;
			}
			// Start of functions that evaluate their arguments.
			evaledArgs = ast.args.map( function (i) { return that.evaluate( i ) } );
			if ( mathFuncs.indexOf(ast.op) !== -1 ) {
				return Math[ast.op].apply( Math, evaledArgs );
			}
			if ( 'coalesce' === ast.op ) {
				for ( var k = 0; k < evaledArgs.length; k++ ) {
					if ( !isNaN( evaledArgs[k] ) ) {
						return evaledArgs[k];
					}
				}
				return NaN;
			}
			if ( 'ifzero' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				then = evaledArgs.length < 2 ? 1 : evaledArgs[1];
				ielse = evaledArgs.length < 3 ? 0 : evaledArgs[2]; 
				return almostEquals( evaledArgs[0], 0 ) ? then : ielse;
			}
			// Opposite of ifzero
			if ( 'if' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				then = evaledArgs.length < 2 ? 1 : evaledArgs[1];
				ielse = evaledArgs.length < 3 ? 0 : evaledArgs[2]; 
				return !almostEquals( evaledArgs[0], 0 ) ? then : ielse;
			}
			if ( 'ifequal' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				then = evaledArgs.length < 3 ? 1 : evaledArgs[2];
				ielse = evaledArgs.length < 4 ? 0 : evaledArgs[3]; 
				return almostEquals( evaledArgs[0], evaledArgs[1] ) ? then : ielse;
			}
			if ( 'iffinite' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				then = evaledArgs.length < 2 ? 1 : evaledArgs[1];
				ielse = evaledArgs.length < 3 ? 0 : evaledArgs[2]; 
				return isFinite( evaledArgs[0] ) ? then : ielse;
			}
			if ( 'ifnan' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				then = evaledArgs.length < 2 ? 1 : evaledArgs[1];
				ielse = evaledArgs.length < 3 ? 0 : evaledArgs[2]; 
				return isNaN( evaledArgs[0] ) ? then : ielse;
			}
			if ( 'ifpositive' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				then = evaledArgs.length < 2 ? 1 : evaledArgs[1];
				ielse = evaledArgs.length < 3 ? 0 : evaledArgs[2]; 
				return evaledArgs[0] >= 0 ? then : ielse;
			}

			// I am a bit unsure what the proper thing to do about floating point rounding issues here
			// These will err on the side of returning true given rounding error. People can use ifpositive() if they
			// need precise.
			if ( 'ifless' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				then = evaledArgs.length < 3 ? 1 : evaledArgs[2];
				ielse = evaledArgs.length < 4 ? 0 : evaledArgs[3]; 
				return evaledArgs[0] < evaledArgs[1] && !almostEquals( evaledArgs[0], evaledArgs[1] ) ? then : ielse;
			}
			if ( 'ifgreater' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				then = evaledArgs.length < 3 ? 1 : evaledArgs[2];
				ielse = evaledArgs.length < 4 ? 0 : evaledArgs[3]; 
				return evaledArgs[0] > evaledArgs[1] && !almostEquals( evaledArgs[0], evaledArgs[1] ) ? then : ielse;
			}
			if ( 'iflessorequal' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				then = evaledArgs.length < 3 ? 1 : evaledArgs[2];
				ielse = evaledArgs.length < 4 ? 0 : evaledArgs[3]; 
				return evaledArgs[0] <= evaledArgs[1] || almostEquals( evaledArgs[0], evaledArgs[1] ) ? then : ielse;
			}
			if ( 'ifgreaterorequal' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				then = evaledArgs.length < 3 ? 1 : evaledArgs[2];
				ielse = evaledArgs.length < 4 ? 0 : evaledArgs[3]; 
				return evaledArgs[0] >= evaledArgs[1] || almostEquals( evaledArgs[0], evaledArgs[1] ) ? then : ielse;
			}
			// Should this use almostEquals???
			if ( 'ifbetween' === ast.op ) {
				if ( evaledArgs.length < 3 ) {
					return NaN;
				}
				then = evaledArgs.length < 4 ? 1 : evaledArgs[3];
				ielse = evaledArgs.length < 5 ? 0 : evaledArgs[4]; 
				return evaledArgs[0] >= evaledArgs[1] && evaledArgs[0] <= evaledArgs[2] ? then : ielse;
			}
			if ( 'bool' === ast.op ) {
				if ( evaledArgs.length !== 1 ) {
					return NaN;
				}
				return isNaN( evaledArgs[0] ) || almostEquals( evaledArgs[0], 0.0 ) ? 0 : 1;
			}
			if ( 'not' === ast.op ) {
				if ( evaledArgs.length !== 1 ) {
					return NaN;
				}
				return isNaN( evaledArgs[0] ) || almostEquals( evaledArgs[0], 0.0 ) ? 1 : 0;
			}
			if ( 'xor' === ast.op ) {
				if ( evaledArgs.length !== 2 ) {
					return NaN;
				}
				if (
					( ( isNaN( evaledArgs[0] ) || almostEquals( evaledArgs[0], 0.0 ) ) && !( isNaN( evaledArgs[1] ) || almostEquals( evaledArgs[1], 0.0 ) ) ) ||
					( ( isNaN( evaledArgs[1] ) || almostEquals( evaledArgs[1], 0.0 ) ) && !( isNaN( evaledArgs[0] ) || almostEquals( evaledArgs[0], 0.0 ) ) )
				) {
					return 1;
				} else {
					return 0;
				}
			}
			// Short circuit like in lua
			if ( 'and' === ast.op ) {
				for ( i = 0; i < evaledArgs.length; i++ ) {
					if ( isNaN( evaledArgs[i] ) || almostEquals( evaledArgs[i], 0.0 ) ) {
						return evaledArgs[i];
					}
				}
				return evaledArgs.length >= 1 ? evaledArgs[evaledArgs.length-1] : 1;
			}
			if ( 'or' === ast.op ) {
				for ( i = 0; i < evaledArgs.length; i++ ) {
					if ( !isNaN( evaledArgs[i] ) && !almostEquals( evaledArgs[i], 0.0 ) ) {
						return evaledArgs[i];
					}
				}
				return evaledArgs.length >= 1 ? evaledArgs[evaledArgs.length-1] : 0;
			}

			// Bitwise operators (numbers treated like 32bit integer). The binary ones can take any number of args.
			if ( 'bitand' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				res = evaledArgs[0];
				for ( i = 1; i < evaledArgs.length; i++ ) {
					res = res & evaledArgs[i];
				}
				return res;
			}
			if ( 'bitor' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				res = evaledArgs[0];
				for ( i = 1; i < evaledArgs.length; i++ ) {
					res = res | evaledArgs[i];
				}
				return res;
			}
			if ( 'bitxor' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				res = evaledArgs[0];
				for ( i = 1; i < evaledArgs.length; i++ ) {
					res = res ^ evaledArgs[i];
				}
				return res;
			}
			// Bitwise operators that don't take infinite amount of ops.
			if ( 'bitnot' === ast.op ) {
				if ( evaledArgs.length < 1 ) {
					return NaN;
				}
				return ~evaledArgs[0];
			}
			if ( 'bitleftshift' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				return evaledArgs[0] << evaledArgs[1];
			}
			if ( 'bitlogicrightshift' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				return evaledArgs[0] >>> evaledArgs[1];
			}
			if ( 'bitarithrightshift' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				return evaledArgs[0] >> evaledArgs[1];
			}
			// switch(value,2,valueFor2,5,valueFor5,...,valueIfNoneMatch)
			// select the arg where the test <= value.
			if ( 'switch' === ast.op ) {
				if ( evaledArgs.length < 2 ) {
					return NaN;
				}
				var defaultVal = NaN;
				if ( evaledArgs.length % 2 === 0 ) {
					// Last arg is default if even number of args.
					defaultVal = evaledArgs[evaledArgs.length-1];
				}
				for ( i = 1; i < evaledArgs.length-1; i+=2 ) {
					if ( evaledArgs[0] <= evaledArgs[i] || almostEquals( evaledArgs[i], evaledArgs[0] ) ) {
						return evaledArgs[i+1];
					}
				}
				return defaultVal;
			}

			// js Math.round is weird. Do our own version. Based on https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
			// This does round-half away from zero, with floating point error correction.
			if ( 'round' === ast.op ) {
				var decimals = evaledArgs.length >= 2 ? evaledArgs[1] : 0;
				var p = Math.pow( 10,  decimals );
				var n = (evaledArgs[0] * p) * (1 + Number.EPSILON);
				return Math.round(n)/p;
			}

			// In case anyone wants normal js round.
			if ( ast.op === 'jsround' ) {
				return Math.round.apply( Math, evaledArgs );
			}

			if ( evaledArgs.length !== 2 ) {
				throw new Error( "Unexpected number of args for " + ast.op );
			}
			if ( ast.op === '*' ) return evaledArgs[0]*evaledArgs[1];
			if ( ast.op === '/' ) return evaledArgs[0]/evaledArgs[1];
			if ( ast.op === '+' ) return evaledArgs[0]+evaledArgs[1];
			if ( ast.op === '-' ) return evaledArgs[0]-evaledArgs[1];
			if ( ast.op === '%' ) return evaledArgs[0]%evaledArgs[1];
			throw new Error( "Unrecognized operator " + ast.op );
		}
		return NaN;
	};

	// Start dependency graph code

	var getIdentifiers = function( tree ) {
		if ( tree instanceof Ident ) {
			return new Set([tree.value]);
		}
		if ( tree instanceof Operator ) {
			var res = new Set([]);
			var i = 0;
			if ( tree.op === 'index' && tree.args.length > 0 ) {
				// Special case - index allows indirect references decided at runtime
				// A future version might handle this more dynamically.
				i++;
				getIdentifiers( tree.args[0] ).forEach( function (x) { res.add(x + '*') } );
			} else if ( (tree.op === 'radiogroup' ) && tree.args.length > 0 && tree.args[0] instanceof Ident ) {
				i++;
				res.add( '--radio-' + tree.args[0].value );
			} else if ( (tree.op === 'timer' ) ) {
				if ( tree.args.length > 0 && tree.args[0] instanceof Ident ) {
					i++;
					res.add( '--timer-active-' + tree.args[0].value );
				} else {
					res.add( '--timer-active' );
				}
			} else if ( tree.op === 'timertime' || tree.op === 'timeriterations' ) {
				res.add( '--timer-iteration' );
				if ( tree.args.length > 0 && tree.args[0] instanceof Ident ) {
					res.add( '--timer-iteration-' + tree.args[0].value );
				} else {
					res.add( '--timer-iteration' );
				}
				return res;
			} else if ( tree.op === 'getclick' ) {
				res.add( '--click' );
				return res;
			}
			for ( ; i < tree.args.length; i++ ) {
				getIdentifiers( tree.args[i] ).forEach( function (x) { res.add(x) } );
			}
			return res;
		}
		return new Set();
	};

	// e.g. if a=foo+1 then backlinks['foo'] = ['a',...]
	var buildBacklinks = function (items, radioGroups) {
		var backlinks = Object.create(null);
		for ( var item in items ) {
			var idents = getIdentifiers( items[item] );
			// Set does not do for..in loops, and this version MW forbids for..of
			idents.forEach( function (ident) {
				if ( !backlinks[ident] ) {
						backlinks[ident] = [];
				}
				backlinks[ident].push( item );
			} );
		}
		// We use identifiers starting with -- as special purpose
		// Each radio item should depend on each other, since if one gets checked the others get unchecked.
		var identPrefix = '--radio-';
		for ( var groupName in radioGroups ) {
			if ( backlinks[identPrefix + groupName] == undefined ) {
				backlinks[identPrefix + groupName] = [];
			}
			for ( var i = 0; i < radioGroups[groupName].length; i++ ) {
				backlinks[identPrefix + groupName].push( radioGroups[groupName][i] );
				if ( backlinks[radioGroups[groupName][i]] == undefined ) {
					backlinks[radioGroups[groupName][i]] = [];
				}
				backlinks[radioGroups[groupName][i]].push( identPrefix + groupName );
			}
		}
		return backlinks;
	};

	// End dependency graph code

	// Start code that does setup and HTML interaction.

	var setup = function ( $content ) {
		// We allow users to group calculator widgets inside a <div class="calculator-container"> to scope
		// ids just to that group. That way you can use a specific template multiple times on the same page.
		// (Perhaps we should turn it into a <fieldset>?).
		var containers = Array.from( $content.find( '.calculator-container' ) );
		for ( var i = 0; i < containers.length; i++ ) {
			var calc = new CalculatorWidgets( Array.from( containers[i].getElementsByClassName( 'calculator-field' ) ), containers[i] );
		}
		// Anything not in a container is scoped to the page.
		var elms = Array.from( $content.find( '.calculator-field' ) );
		new CalculatorWidgets( elms, $content[0] );

		$content.find( '.calculator-field-label').replaceWith( function() {
			var l = $( '<label>' );
			// For accessibility reasons with codex, we sometimes have to make a label with no for attribute (e.g. radiogroups)
			if ( this.dataset.for !== undefined ) {
				if (  !this.dataset.for.match( /^(?:calcdisambig-\d+-)?calculator-field-[a-zA-Z_][a-zA-Z0-9_]*$/ ) || !$content.find( '#' + $.escapeSelector( this.dataset.for ) ).length ) {
					return this;
				}
				l.attr( 'for', this.dataset.for );
			}
			if ( this.id ) {
				l.attr( 'id', this.id );
			}
			if ( this.title ) {
				l.attr( 'title', this.title );
			}
			if ( this.style.cssText ) {
				l.attr( 'style', this.style.cssText );
			}
			if ( this.classList.contains( 'cdx-label__label' ) ) {
				mw.loader.load( '@wikimedia/codex' );
			}
			if ( this.className !== 'calculator-field-label' ) {
				var extraClass = this.dataset.calculatorClass === undefined ? '' : ' ' + this.dataset.calculatorClass;
				l.attr( 'class', this.className.replace( /(^| )calculator-field-label( |$)/g, ' ' ) + extraClass );
			}

			l.append( this.childNodes );
			return l;
		} );
	};

	var doStats = function () {
		if ( window.calculatorStatsAlreadyDone !== true ) {
			window.calculatorStatsAlreadyDone = true;
			mw.track( 'stats.mediawiki_gadget_calculator_total' );
			mw.track( 'stats.mediawiki_gadget_calculator_wiki_total', 1, { wiki: mw.config.get( 'wgDBname' ) } );
			var pageName = encodeURIComponent( mw.config.get( 'wgTitle' ).replace( / /g, '_' ) );
			// alphanumeric and underscore only.
			pageName = pageName.replace( /[^a-zA-Z0-9_]/g, '_' );
			mw.track( 'stats.mediawiki_gadget_calculator_page_total', 1, { wiki: mw.config.get( 'wgDBname' ), page: pageName, NS: mw.config.get( 'wgNamespaceNumber' ) } );
		}
	};

	var createSelect = function( elm ) {
		var sel = document.createElement( 'select' );
		var mapping;
		try {
			mapping = JSON.parse( elm.dataset.calculatorMapping );
		} catch(e) {
			console.log( "Calculator: Error processing mapping of " + elm.id + ". " + e.message );
			return sel;
		}
		if ( typeof mapping !== 'object' ) {
			console.log( "Calculator: Error processing mapping of " + elm.id + ". unexpected type" );
			return sel;
		}
		var opt;
		for ( var i in mapping ) {
			if ( typeof mapping[i] === 'object' ) {
				var optgroup = document.createElement( 'optgroup' );
				optgroup.label = i;
				sel.appendChild( optgroup );
				// Note: optgroup cannot be nested.
				for ( var j in mapping[i] ) {
					if ( typeof mapping[i][j] === 'number' || [ 'Infinity', '-Infinity', 'NaN' ].indexOf( mapping[i][j] ) !== -1 )  {
						opt = document.createElement( 'option' );
						opt.value = mapping[i][j];
						opt.appendChild( document.createTextNode( j ) );
						optgroup.appendChild( opt );
					}
				}
			} else if ( typeof mapping[i] === 'number' || [ 'Infinity', '-Infinity', 'NaN' ].indexOf( mapping[i] ) !== -1 )  {
				opt = document.createElement( 'option' );
				opt.value = mapping[i];
				opt.appendChild( document.createTextNode( i ) );
				sel.appendChild( opt );
			}
		}
		return sel;
	};

	var CalculatorWidgets = function( elms, parent ) {
		this.parent = parent;
		this.rand = Math.floor(Math.random()*1000000000);
		this.itemList = Object.create(null);
		this.elmList = Object.create(null);
		this.backlinks = Object.create(null);
		this.inProgressRefresh = undefined;
		this.clickX = this.clickY = this.clickPercentX = this.clickPercentY = NaN;
		this.clickPrevX = this.clickPrevY = this.clickPrevPercentX = this.clickPrevPercentY = NaN;
		this.clickStartX = this.clickStartY = this.clickStartPercentX = this.clickStartPercentY = NaN;
		this.clickType = NaN;
		this.clickInProgress = 0;
		this.repeatInfo = null;
		var that = this;
		var radioGroups = Object.create(null);
		this.buttonInfo = Object.create(null);
		this.mappingInput = Object.create(null);
		this.mappingOutput = Object.create(null);
		this.repeatInfo = null;

		if (elms.length > 200) {
			console.log( "Too many calculator widgets on page" );
			return;
		}
		for ( var i in elms ) {
			var elm = elms[i];
			var formula = elm.dataset.calculatorFormula;
			if ( formula && formula.length > 2000 ) {
				console.log( "Skipping element with too long formula" );
				continue;
			}
			var type = elm.dataset.calculatorType;
			var readonly = !!elm.dataset.calculatorReadonly;
			var id = elm.id.toString();
			if ( id.match( /^(?:calcdisambig-\d+-)?calculator-field-__proto__$/ ) || elm.dataset.calculatorName === '__proto__' ) {
				// be paranoid
				throw new Error( "Invalid calculator id: " + id );
			}
			if ( !id ) {
				id = 'calculator-field-auto' + Math.floor( Math.random()*10000000 ) + 'unnamed';
			}
			if ( this.parent.classList.contains( 'calculator-container' ) && document.getElementById( id ) !== elm ) {
				// There is a duplicate id, and we are not at the top level.
				// This is not ideal, as you can't reference it using other attributes (e.g. aria-labelledby, aria-describedby) or link targets, but at least we won't label the wrong thing.
				var labelsToUpdate = this.parent.querySelectorAll( ":scope .calculator-field-label[data-for=\"" + CSS.escape( id ) + "\"]" );
				id = 'calcdisambig-' + this.rand + '-' + id;
				for ( var l = 0; l < labelsToUpdate.length; l++ ) {
					labelsToUpdate[l].dataset.for = id;
				}
			}
			var defaultVal = ("" + elm.textContent).trim();
			if ( type === undefined || !id.match( /^(?:calcdisambig-\d+-)?calculator-field-[a-zA-Z_][a-zA-Z0-9_]*$/ ) ) {
				console.log( "Skipping " + id );
				continue;
			}

			var formulaAST;
			try {
				formulaAST = (new Parser( formula )).parse();
			} catch( e ) {
				console.log( "Error parsing formula of " + id + ": " + e.message + ". Formula given:" + formula );
				continue;
			}
			if ( elm.className.match( /(^| )cdx-/ ) || ( elm.dataset.calculatorClass && elm.dataset.calculatorClass.match( /(^| )cdx-/ ) ) ) {
				// The input is using CSS-only codex modules. Unfortunately i think we have to load the whole thing.
				// we are going to have a flash of unstyled content no matter what we do since we are converting elements at load time, so don't worry about that.
				mw.loader.load( '@wikimedia/codex' );
			}
			if ( type !== 'plain' && type !== 'passthru' ) {
				var input = type === 'select' ? createSelect( elm ) : document.createElement( 'input' );
				input.className = 'calculator-field-live';
				if ( elm.className !== 'calculator-field' ) input.className += ' ' + elm.className.replace( /(^| )calculator-field($| )/g, ' ' );
				input.readOnly = readonly;
				// If defaultVal is empty, we start the textbox value out as empty instead of NaN.
				if ( defaultVal !== '' ) {
					input.value = convertFloat(defaultVal);
				}
				input.style.cssText = elm.style.cssText; // This should be safe because elm's css was sanitized by MW
				if ( elm.dataset.calculatorSize ) {
					var size = parseInt( elm.dataset.calculatorSize );
					input.size = size;
					// Browsers are pretty inconsistent so also set as css
					// Firefox shows a number selector that seems to always be 20px wide regardless of font.
					// Chrome shows the selector only on hover.
					input.style.width = type === 'number' ? "calc( " + size + 'ch' + ' + 20px)': size + 'ch';
				}
				// Add css class, but only if the gadget is enabled.
				if ( elm.dataset.calculatorClass ) input.className += ' ' + elm.dataset.calculatorClass;
				if ( elm.dataset.calculatorSize ) input.size = elm.dataset.calculatorSize;
				if ( elm.dataset.calculatorMax ) input.max = elm.dataset.calculatorMax;
				if ( elm.dataset.calculatorMin ) input.min = elm.dataset.calculatorMin;
				if ( elm.dataset.calculatorPlaceholder ) input.placeholder = elm.dataset.calculatorPlaceholder;
				if ( elm.dataset.calculatorStep ) input.step = elm.dataset.calculatorStep;
				if ( elm.dataset.calculatorPrecision ) input.dataset.calculatorPrecision = elm.dataset.calculatorPrecision;
				if ( elm.dataset.calculatorExponentialPrecision ) input.dataset.calculatorExponentialPrecision = elm.dataset.calculatorExponentialPrecision;
				if ( elm.dataset.calculatorDecimals ) input.dataset.calculatorDecimals = elm.dataset.calculatorDecimals;
				if ( elm.dataset.calculatorNanText ) input.dataset.calculatorNanText = elm.dataset.calculatorNanText;
				if ( type === 'radio' ) {
					// Name is primarily for radio groups. Prefix to prevent dom clobbering or in case it ends up in a form somehow. Add rand to make unique between scoping containers
					if ( elm.dataset.calculatorName ) input.name = 'calcgadget-' + this.rand + '-' + elm.dataset.calculatorName;
					if ( radioGroups[elm.dataset.calculatorName] === undefined ) {
						radioGroups[elm.dataset.calculatorName] = [];
					}
					radioGroups[elm.dataset.calculatorName][radioGroups[elm.dataset.calculatorName].length] = id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' );
				}
				if ( elm.dataset.calculatorInputmode ) input.inputMode = elm.dataset.calculatorInputmode;
				if ( elm.dataset.calculatorEnterkeyhint ) input.enterKeyHint = elm.dataset.calculatorEnterkeyhint;
				if ( elm.getAttribute( 'aria-describedby' ) !== null ) input.setAttribute( 'aria-describedby', elm.getAttribute( 'aria-describedby' ) );
				if ( elm.getAttribute( 'aria-labelledby' ) !== null ) input.setAttribute( 'aria-labelledby', elm.getAttribute( 'aria-labelledby' ) );
				if ( elm.getAttribute( 'aria-label' ) !== null ) input.setAttribute( 'aria-label', elm.getAttribute( 'aria-label' ) );
				if ( elm.getAttribute( 'aria-owns' ) !== null ) input.setAttribute( 'aria-owns', elm.getAttribute( 'aria-owns' ) );
				if ( elm.getAttribute( 'aria-flowto' ) !== null ) input.setAttribute( 'aria-flowto', elm.getAttribute( 'aria-flowto' ) );
				if ( elm.getAttribute( 'role' ) !== null ) input.setAttribute( 'role', elm.getAttribute( 'role' ) );
				// To support only setting the role if gadget is enabled
				if ( elm.dataset.calculatorAriaRole ) input.setAttribute( 'role', elm.dataset.calculatorAriaRole );
				if ( ['true', 'false'].indexOf( elm.dataset.calculatorAriaAtomic ) !== -1 ) input.setAttribute( 'aria-atomic', elm.dataset.calculatorAriaAtomic );
				if ( elm.dataset.calculatorAriaRelevant ) input.setAttribute( 'aria-relevant', elm.dataset.calculatorAriaRelevant );


				if ( ['off', 'polite', 'assertive'].indexOf( elm.dataset.calculatorAriaLive ) !== -1 ) {
					input.setAttribute( 'aria-live', elm.dataset.calculatorAriaLive );
				} else {
					// We treat invalid values as set nothing, which inherits from parent which is different than setting off. This allows user to override
					// We also set a default of polite for cells with a formula
					if ( formula ) {
						input.setAttribute( 'aria-live', 'polite' );
					}
				}
				if ( type === 'number' || type === 'text' || type === 'radio' || type === 'checkbox' || type === "hidden" || type === "range" ) {
					input.type = type;
				}
				if ( type === 'select' ) {
					if ( elm.dataset.calculatorValue ) {
						// Allow people to override the default value for select with attribute, as the value might not be a good non-js fallback.
						input.value = elm.dataset.calculatorValue;
					}
				}
				if ( type === 'radio' || type === 'checkbox' ) {
					input.onchange = this.changeHandler.bind(this); // some browsers dont fire oninput for checkboxes/radio
					if ( elm.dataset.calculatorChecked === 'true' || elm.dataset.calculatorChecked === '1' ) {
						input.checked = true;
					} else if ( elm.dataset.calculatorChecked === 'false' || elm.dataset.calculatorChecked === '0' ) {
						input.checked = false;
					} else if ( !isNaN( defaultVal ) && !almostEquals( defaultVal, 0 ) ) {
						// If all else fails, use the default value to decide if it is checked
						input.checked = true;
					}
					// Allow user to set a different checked value other than 1. This will be the value when checked by human, but not neccesarily if by formula
					// We use a specific data-calculator-value if set and true, otherwise we use the defaultVal (text firstChild) if true, and 1 as a last resort.
					var checkValue = convertFloat( elm.dataset.calculatorValue || '' );
					if ( !isNaN( checkValue ) && !almostEquals( checkValue, 0 ) ) {
						input.value = checkValue;
						input.dataset.calculatorValue = checkValue;
					} else if ( !isNaN( defaultVal ) && !almostEquals( defaultVal, 0 ) ) {
						input.value = defaultVal;
						input.dataset.calculatorValue = defaultVal;
					} else {
						input.value = 1;
						input.dataset.calculatorValue = 1;
					}
				}
				if ( elm.dataset.calculatorMapping && type === 'text') {
					this.processMapping( elm.dataset.calculatorMapping, id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' ) );
				}

				input.id = id;
				elm.replaceWith( input );
				elm = input;
				input.addEventListener( 'input', this.changeHandler.bind(this) );
			} else {
				elm.classList.remove( 'calculator-field' );
				elm.classList.add( 'calculator-field-live' );
				if ( elm.dataset.calculatorClass ) elm.className += ' ' + elm.dataset.calculatorClass;
				if ( ['off', 'polite', 'assertive' ].indexOf( elm.dataset.calculatorAriaLive ) !== -1 ) {
					elm.setAttribute( 'aria-live', elm.dataset.calculatorAriaLive );
				} else if ( formula && type !== 'passthru' && !elm.dataset.calculatorAriaLive ) {
					// Announce plain outputs by default, but allow user to override. Treat invalid value as do not set, since not setting is slightly different then the value off.
					elm.setAttribute( 'aria-live', 'polite' );
				}
				if ( ['true', 'false'].indexOf( elm.dataset.calculatorAriaAtomic ) !== -1 ) elm.setAttribute( 'aria-atomic', elm.dataset.calculatorAriaAtomic );
				// Support either directly setting role or using data attribute, in case people only want to set the role in the JS case.
				if ( elm.dataset.calculatorAriaRole ) elm.setAttribute( 'role', elm.dataset.calculatorAriaRole );
				if ( elm.dataset.calculatorAriaRelevant ) elm.setAttribute( 'aria-relevant', elm.dataset.calculatorAriaRelevant );

				if ( elm.id === '' ) {
					elm.id = id;
				}
				if ( elm.dataset.calculatorMapping && type === 'plain') {
					this.processMapping( elm.dataset.calculatorMapping, id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' ) );
				}
			}
			var itemId = id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' );
			this.itemList[itemId] = formulaAST;
			this.elmList[itemId] = elm;
		}
		this.backlinks = buildBacklinks( this.itemList, radioGroups );
		if ( this.parent.dataset.calculatorRefreshOnLoad && this.parent.dataset.calculatorRefreshOnLoad === 'true' ) {
			this.inProgressRefresh = Object.create(null);
			var unsetBusy = this.setBusy();
			this.refresh( Object.keys( this.itemList ).filter( function (a) { return !(that.itemList[a] instanceof Null); } ) );
			this.inProgressRefresh = undefined;
			unsetBusy();
		}
		this.setupButtons();
	};

	// MappingText is a json blob of {"some string": number}
	// Used to map between numbers <-> strings during input/output.
	CalculatorWidgets.prototype.processMapping = function ( mappingText, itemId ) {
		var mapping;
		try {
			mapping = JSON.parse( mappingText );
		} catch(e) {
			console.log( "Calculator: Error processing mapping of " + itemId + ". " + e.message );
			return;
		}
		if ( typeof mapping !== 'object' ) {
			console.log( "Calculator: Error processing mapping of " + itemId + ". unexpected type" );
			return;
		}

		this.mappingInput[itemId] = mapping;
		var mapOut = Object.create(null);
		for (var i in mapping) {
			if ( typeof mapping[i] === 'number' || [ 'default', 'Infinity', '-Infinity', 'NaN' ].indexOf( mapping[i] ) !== -1 ) {
				mapOut[mapping[i]] = i;
			}
		}
		this.mappingOutput[itemId] = mapOut;
	};

	CalculatorWidgets.prototype.stopRepeat = function () {
		if ( this.repeatInfo ) {
			if ( this.repeatInfo.cancelIdentifier ) {
				// If until param is immediately true, the interval may not have been set yet.
				window.clearInterval( this.repeatInfo.cancelIdentifier );
			}
			var id = this.repeatInfo.id;
			this.repeatInfo = null;
			this.inProgressRefresh = Object.create(null);
			var unsetBusy = this.setBusy();
			this.refresh( [ '--timer-active', '--timer-active-' + id, '--timer-iteration', '--timer-iteration-' + id ] );
			this.inProgressRefresh = undefined;
			unsetBusy();
		}
		this.repeatInfo = null;
	};

	CalculatorWidgets.prototype.startRepeat = function (maxIterations, id) {
		if ( this.repeatInfo ) {
			console.log( "Calculator: Trying to start a repeat when one is already in progress. This should not happen" );
		}
		this.repeatInfo = {
			maxIterations: maxIterations,
			iterationsSoFar: 0,
			cancelIdentifier: null,
			timeStart: Date.now(),
			id: id
		};
		// Not 100% clear if we should immediately refresh or wait for after first iteration.
		if ( this.inProgressRefresh ) {
			console.log( "Calculator: Refresh already in progress. This probably indicates a bug" );
		} else {
			this.inProgressRefresh = Object.create(null);
		}
		var unsetBusy = this.setBusy();
		this.refresh( [ '--timer-active', '--timer-active-' + id, '--timer-iteration', '--timer-iteration-' + id ] );
		this.inProgressRefresh = undefined;
		unsetBusy();
	};

	CalculatorWidgets.prototype.incrementRepeatIteration = function (until) {
		this.repeatInfo.iterationsSoFar++;
		if ( this.repeatInfo.iterationsSoFar > this.repeatInfo.maxIterations ) {
			this.stopRepeat();
			return false;
		}
		if ( until ) {
			var untilRes = this.evaluate( until );
			if ( !isNaN( untilRes ) && !almostEquals( untilRes, 0 ) ) {
				this.stopRepeat();
				return false;
			}
		}
		// Update fields that depend on the iteration number
		var id = this.repeatInfo.id;
		if ( this.inProgressRefresh ) {
			console.log( "Calculator: Refresh already in progress. This probably indicates a bug" );
		} else {
			this.inProgressRefresh = Object.create(null);
		}
		var unsetBusy = this.setBusy();
		this.refresh( [ '--timer-iteration', '--timer-iteration-' + id ] );
		this.inProgressRefresh = undefined;
		unsetBusy();
		return true;
	};

	var convertEventTypeToNumber = function ( type ) {
		switch( type ) {
			case 'pointerdown':
				return 1;
			case 'pointermove':
				return 2;
			case 'pointerup':
			case 'click':
				return 3;
			case 'pointerleave':
				return 4;
			default:
				throw new Error( "Unrecognized event type: " + type );
		}
	};

	var updateClick = function(calc) {
		if ( calc.inProgressRefresh ) {
			console.log( "Calculator: Refresh already in progress. This probably indicates a bug" );
		} else {
			calc.inProgressRefresh = Object.create(null);
		}
		var unsetBusy = calc.setBusy();
		calc.refresh( [ '--click' ] );
		calc.inProgressRefresh = undefined;
		unsetBusy();
	};

	// Handler for click events on button.
	var makeButtonCallback  = function ( calc, forElms, formulaASTs, repeat, maxIterations, toggle, until ) {
		return function buttonCallback (event) {
			if ( event.type !== 'click' ) {
				if ( !event.isPrimary || ( !calc.clickInProgress && event.type !== 'pointerdown' ) ) {
					return; // Skip secondary pointers.
				}
			}
			event.preventDefault();
			doStats();
			var unsetBusy = calc.setBusy(); // stopping previous repeats might have side effects so set busy.
			if ( toggle && calc.repeatInfo && calc.repeatInfo.id === event.currentTarget.id ) {
				// If we click a toggle button a second time, all we do is stop the repeat.
				calc.stopRepeat();
				unsetBusy();
				return;
			}
			if ( maxIterations !== undefined || repeat !== undefined ) {
				// Only one repeating callback allowed at a time.
				calc.stopRepeat();
				if ( maxIterations > 1 ) {
					// Start a new repeat
					calc.startRepeat( maxIterations, event.currentTarget.id );
				}
			}
			var doStuff = function(event) {
				var unsetBusyInner = calc.setBusy();
				var stillGoing = true;
				if ( calc.repeatInfo ) {
					stillGoing = calc.incrementRepeatIteration(until);
				}
				if ( stillGoing ) {
					for ( var i = 0; i < forElms.length; i++ ) {
						if ( !formulaASTs[i] || !forElms[i] ) {
							console.log( "Skipping button update due to invalid formula or for attribute" );
							continue;
						}
						var res = calc.evaluate( formulaASTs[i] );
						calc.setValue( forElms[i], res );
						forElms[i].dispatchEvent( new InputEvent( 'input' ) );
					}
				}
				unsetBusyInner();
			};
			if ( maxIterations === undefined || maxIterations >= 1 ) {
				// click coordinates can be negative or > 100% if user clicked border
				if ( calc.clickInProgress ) {
					calc.clickPrevX = calc.clickX;
					calc.clickPrevY = calc.clickY;
					calc.clickPrevPercentX = calc.clickPercentX;
					calc.clickPrevPercentY = calc.clickPercentY;
				}
				if ( event.type === 'pointerdown' ) {
					// This ensures better consistency between mouse and touchscreen.
					event.currentTarget.setPointerCapture( event.pointerId );
				}
				if ( event.type !== 'pointerleave' ) {
					// The coordinates returned for pointerleave events are inconsistent.
					// Especially in firefox when a context menu is opened from right click.
					calc.clickX = event.offsetX; 
					calc.clickY = event.offsetY;
					calc.clickPercentX = 100*event.offsetX/event.currentTarget.clientWidth;
					calc.clickPercentY = 100*event.offsetY/event.currentTarget.clientHeight;
					calc.clickInProgress = 1;
				}
				calc.clickType = convertEventTypeToNumber( event.type );
				if ( event.type === 'click' || event.type === 'pointerdown' ) {
					calc.clickPrevX = calc.clickStartX = calc.clickX;
					calc.clickPrevY = calc.clickStartY = calc.clickY;
					calc.clickPrevPercentX = calc.clickStartPercentX = calc.clickPercentX;
					calc.clickPrevPercentY = calc.clickStartPercentY = calc.clickPercentY;
				}
				updateClick(calc);
				doStuff();
				// We are done with the click events.
				if ( calc.clickType >= 3 ) {
					calc.clickX = calc.clickY = calc.clickPercentX = calc.clickPercentY = NaN;
					calc.clickPrevX = calc.clickPrevY = calc.clickPrevPercentX = calc.clickPrevPercentY = NaN;
					calc.clickStartX = calc.clickStartY = calc.clickStartPercentX = calc.clickStartPercentY = NaN;
					calc.clickInProgress = 0;
					calc.clickType = NaN;
					updateClick(calc);
				}
			}
			unsetBusy();
			// repeatInfo will be null if until formula evaluates to true on first iteration
			if ( calc.repeatInfo && maxIterations > 1 && repeat >= 500 ) {
				calc.repeatInfo.cancelIdentifier = window.setInterval( doStuff, repeat );
			}
		};
	};

	var connectButtonToFormula = function ( calc, $button, forAttr, formulaAttr, repeatDuration, maxIterations, toggle, untilAttr, draggable ) {
		// The intended use case for repeats is something like a chess board that automatically plays the next move.
		// We don't want it to be used for animation or otherwise harm performance, so we limit to once per 500ms and
		// only allow one repeat per container to be active at a time.
		if ( repeatDuration !== undefined ) {
			repeatDuration = Math.max( 500, Math.ceil(parseFloat( repeatDuration )*1000 ) );
			if ( isNaN( repeatDuration ) ) {
				repeatDuration = undefined;
			}
		}
		if ( toggle === 'false' ) {
			toggle = false;
		}
		// If neither repeatDuration or maxIterations is set then the button is normal and does not repeat but does not cancel
		// if repeatDuration is set and no maxIterations, then maxIterations is infinite
		// If maxIterations is 0, then this cancels the current repeat without doing anything
		// If maxIterations is 1, then cancel but do normal button op (but don't repeat)
		if ( maxIterations !== undefined ) {
			maxIterations = parseInt( maxIterations );
		} else if( repeatDuration ) {
			maxIterations = Infinity;
		}
		if ( typeof forAttr !== 'string' || typeof formulaAttr !== 'string' ) {
			// Nothing to do. Skip.
			return;
		}
		if ( formulaAttr.length > 2000 ||  (untilAttr && untilAttr.length > 2000 ) ) {
			console.log( "Skipping button with too long formula" );
			return;
		}
		var until = null;
		try {
			until = (new Parser( untilAttr )).parse();
		} catch( e ) {
				console.log( "Calculator: Error parsing until formula of button " + $button[0].id + ": " + e.message );
		}
		var forList = forAttr.split( ';' );
		var formulaList = formulaAttr.split( ';' );
		var forElms = [];
		var formulaASTs = [];
		for ( var i = 0; i < forList.length; i++ ) {
			if (formulaList[i] === undefined) {
				break;
			}
			forElms[i] = calc.elmList[forList[i]];
			try {
				formulaASTs[i] = (new Parser( formulaList[i] )).parse();
			} catch( e ) {
				formulaASTs[i] = null;
				console.log( "Calculator: Error parsing formula of button " + $button[0].id + " for " + forList[i] + ": " + e.message );
			}
		}
		if ( draggable ) {
			$button[0].addEventListener( 'pointerdown', makeButtonCallback( calc, forElms, formulaASTs, repeatDuration, maxIterations, toggle, until ) );
			$button[0].addEventListener( 'pointerup', makeButtonCallback( calc, forElms, formulaASTs, repeatDuration, maxIterations, toggle, until ) );
			$button[0].addEventListener( 'pointerleave', makeButtonCallback( calc, forElms, formulaASTs, repeatDuration, maxIterations, toggle, until ) );
			$button[0].addEventListener( 'pointermove', makeButtonCallback( calc, forElms, formulaASTs, repeatDuration, maxIterations, toggle, until ) );
		} else {
			$button[0].addEventListener( 'click', makeButtonCallback( calc, forElms, formulaASTs, repeatDuration, maxIterations, toggle, until ) );
		}
	};

	CalculatorWidgets.prototype.connectButtonDisable = function ( button, formula ) {
		if ( formula === '' || formula === '0' || formula === 'false' ) {
			return;
		}
		if ( formula.length > 2000 ) {
			console.log( "Calculator: Disable formula for button " + button.id + " is too long" );
			return;
		}
		var formulaAST;
		try {
			formulaAST = (new Parser( formula )).parse();
		} catch( e ) {
			console.log( "Error parsing disable formula of button " + button.id + ": " + e.message );
			return;
		}
		this.buttonInfo[button.id] = {
			elm: button,
			formula: formulaAST,
		};
		// Add disabled formula's dependencies to the dependency tree.
		var idents = getIdentifiers( formulaAST );
		var that = this;
		var item = '--button-disable-' + button.id;
		idents.forEach( function (ident) {
			if ( !that.backlinks[ident] ) {
				that.backlinks[ident] = [];
			}
			that.backlinks[ident].push( item );
		} );

		// Now set the initial value.
		var curValue = this.evaluate( formulaAST );
		if ( !isNaN( curValue ) && !almostEquals( curValue, 0 ) ) {
			button.disabled = true;
		}
	};

	CalculatorWidgets.prototype.setupButtons = function() {
		var calc = this;
		$( this.parent ).find( '.calculator-field-button' ).replaceWith( function () {
			var b = $( '<button type="button">' );
			if ( this.id && this.id !== '__proto__' ) {
				b.attr( 'id', this.id );
			} else {
				b.attr( 'id', 'calculator-button-' + Math.ceil(Math.random()*100000000000) );
			}
			if ( this.title ) {
				b.attr( 'title', this.title );
			}
			if ( this.style.cssText ) {
				b.attr( 'style', this.style.cssText );
			}
			if ( this.classList.contains( 'cdx-button' ) ) {
				mw.loader.load( '@wikimedia/codex' );
			}
			if ( this.className !== 'calculator-field-button' ) {
				var extraClass = this.dataset.calculatorClass === undefined ? '' : ' ' + this.dataset.calculatorClass;
				b.attr( 'class', this.className.replace( /(^| )calculator-field-button( |$)/g, ' ' ) + extraClass );
			}
			if ( this.dataset.calculatorAlt ) {
				b.attr( 'aria-label', this.dataset.calculatorAlt );
			}
			if ( this.dataset.calculatorAriaLive ) {
				b.attr( 'aria-live', this.dataset.calculatorAriaLive );
			}
			if ( this.getAttribute( 'role' ) ) {
				b.attr( 'role', this.getAttribute( 'role' ) );
			}
			if ( this.getAttribute( 'aria-owns' ) ) {
				b.attr( 'aria-owns', this.getAttribute( 'aria-owns' ) );
			}
			if ( this.getAttribute( 'aria-flowto' ) ) {
				b.attr( 'aria-flowto', this.getAttribute( 'aria-flowto' ) );
			}
			if ( this.dataset.calculatorDisabled !== undefined ) {
				// TODO: Would be cool if this was a formula.
				if ( this.dataset.calculatorDisabled === 'true' || this.dataset.calculatorDisabled === '1' ) {
					// Simple case
					b.attr( 'disabled', true );
				} else {
					calc.connectButtonDisable( b[0], this.dataset.calculatorDisabled );
				}
			}
			// This will be a no-op if no formula or for specified.
			connectButtonToFormula(
				calc,
				b,
				this.dataset.calculatorFor,
				this.dataset.calculatorFormula,
				this.dataset.calculatorDelay,
				this.dataset.calculatorMaxIterations,
				this.dataset.calculatorToggle,
				this.dataset.calculatorUntil
			);

			b.append( this.childNodes );
			return b;
		} );
		// This is meant to allow image map type things.
		$( this.parent ).find( '.calculator-field-buttonraw' ).each( function () {
			if (!this.id || this.id === '__proto__') {
				this.id = 'calculator-button-' + Math.ceil(Math.random()*100000000000);
			}
			connectButtonToFormula(
				calc,
				$(this),
				this.dataset.calculatorFor,
				this.dataset.calculatorFormula,
				this.dataset.calculatorDelay,
				this.dataset.calculatorMaxIterations,
				this.dataset.calculatorToggle,
				this.dataset.calculatorUntil,
				this.classList.contains( 'calculator-field-buttondraggable' )
			);
		} );
	};

	CalculatorWidgets.prototype.changeHandler = function(e) {
		this.inProgressRefresh = Object.create(null);
		var unsetBusy = this.setBusy();
		doStats();
		e.target.removeAttribute( 'data-calculator-real-value' );
		var itemId = e.target.id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' );
		var itemsToRefresh = [ this.backlinks[itemId] ];
		this.inProgressRefresh[itemId] = true;
		this.setValueProperties( e.target, getValueOfElm( e.target, this.mappingInput[e.target.id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' )] ) );

		var staritem = itemId.replace( /[0-9]+$/, '*' );
		if ( itemId.match( /[0-9]+$/ ) && this.backlinks[staritem]  ) {
			this.inProgressRefresh[staritem] = true;
			itemsToRefresh.push( this.backlinks[staritem] );
		}

		this.refresh( itemsToRefresh.flat() );
		this.inProgressRefresh = undefined;
		unsetBusy();
	};

	// The subset of formatting that still returns a float-like thing.
	// input type=number generally expects something that looks like a float (However if given "1.200" it will preserve the 0's)
	var formatNumeric = function( n, options ) {
		if ( typeof n !== "number" ) {
			return n;
		}
		if ( !isNaN( parseInt( options.calculatorDecimals ) ) ) {
			return n.toFixed( parseInt( options.calculatorDecimals ) );
		}
		if ( !isNaN( parseInt( options.calculatorPrecision ) ) ) {
			return n.toPrecision( parseInt( options.calculatorPrecision ) );
		}
		if ( !isNaN( parseInt( options.calculatorExponentialPrecision ) ) ) {
			return n.toExponential( parseInt( options.calculatorExponentialPrecision ) );
		}
		return n;
	};
	var format = function ( n, options, mapping ) {
		var res = n.toString();
		if ( typeof n !== "number" ) {
			return res;
		}
		if ( mapping && mapping[n] ) {
			return mapping[n];
		}
		if ( mapping && mapping['default'] !== undefined ) {
			return mapping['default'];
		}
		if ( isNaN( n ) ) {
			return options.calculatorNanText ? options.calculatorNanText : '?';
		}
		if ( !isNaN( parseInt( options.calculatorDecimals ) ) ) {
			res = n.toFixed( parseInt( options.calculatorDecimals ) );
		}
		if ( !isNaN( parseInt( options.calculatorPrecision ) ) ) {
			res = n.toPrecision( parseInt( options.calculatorPrecision ) );
		}
		if ( !isNaN( parseInt( options.calculatorExponentialPrecision ) ) ) {
			res = n.toExponential( parseInt( options.calculatorExponentialPrecision ) );
		}

		res = res.replace( /e([+-])([0-9]+)$/, function (m, sign, exp) {
			var tmp = "×10";
			if ( sign === '-' ) {
				tmp += '⁻';
			}
			tmp += exp.replace( /[0-9]/g, function (m) {
				return [ '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹' ][m];
			} );
			return tmp;
		} );
		return res;
	};

	CalculatorWidgets.prototype.setValuePropertiesSpecialPurpose = function( id ) {
		// Maybe in future we should set CSS variables for each special purpose item. Not sure if that would be useful.
		if ( id.match( /^--button-disable-.+/ ) ) {
			var buttonId = id.substring(17);
			if ( this.buttonInfo[buttonId] ) {
				var res = this.evaluate( this.buttonInfo[buttonId].formula );
				this.buttonInfo[buttonId].elm.disabled = !isNaN( res ) && !almostEquals( res, 0 );
			} else {
				console.log( 'Tried to refresh disable status for ' + buttonId + ' but there is no such button.' );
			}
		}
		return;
	};

	// Set a data attribute, classes, etc. For ease of targeting via CSS.
	CalculatorWidgets.prototype.setValueProperties = function ( elm, value ) {
			var itemId = elm.id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' );
			elm.dataset.calculatorFieldValue = value.toFixed(5);
			if ( !itemId.match( /^auto\d\d\d\d+unnamed$/ ) ) {
				this.parent.style.setProperty( '--calculator-' + itemId, value );
			}
			if ( !isNaN( value ) && !almostEquals( value, 0 ) ) {
				elm.classList.remove( 'calculator-value-false' );
				elm.classList.add( 'calculator-value-true' );
			} else {
				elm.classList.remove( 'calculator-value-true' );
				elm.classList.add( 'calculator-value-false' );
			}
	};

	CalculatorWidgets.prototype.refresh = function (itemIds) {
		var i;
		// Based on https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
		var permMarks = Object.create(null);
		var tempMarks =  Object.create(null);
		var topList = [];
		var that = this;
		if ( !itemIds ) {
			return;
		}
		var visit = function( item ) {
			var i;
			if ( permMarks[item] ) {
				return;
			}
			if ( tempMarks[item] ) {
				if ( !item.match( /^--radio-/ ) ) {
					// Loops are expected for radio buttons.
					console.log( "Loop detected in calculator. '" + item + "' may not be updated properly. (This is expected for radio buttons)" );
				}
				return;
			}
			tempMarks[item] = true;
			for ( i = 0; that.backlinks[item] && i < that.backlinks[item].length; i++ ) {
				visit(that.backlinks[item][i]);
			}
			// Special case for index()
			if ( item.match( /[0-9]+$/ ) ) {
				var staritem = item.replace( /[0-9]+$/, '*' );
				for (  i = 0; that.backlinks[staritem] && i < that.backlinks[staritem].length; i++ ) {
					visit(that.backlinks[staritem][i]);
				}
			}
			permMarks[item] = true;
			topList.push(item); // later we iterate backwards through this list.
		};
		for ( i = 0; i < itemIds.length; i++ ) {
			if ( itemIds[i] !== undefined ) {
				visit( itemIds[i] );
			}
		}

		for ( i = topList.length - 1; i >= 0; i-- ) {
			var itemId = topList[i];
			if ( this.inProgressRefresh[itemId] ) {
				// It is expected radio buttons loop, since they are depend on each other. If you check one, the others uncheck.
				if ( this.elmList[itemId].type !== 'radio' ) {
					console.log( "Loop Detected! Skipping " + itemId );
				}
				continue;
			}
			if ( itemId.match( /^--/ ) ) {
				// A special purpose identifier
				this.setValuePropertiesSpecialPurpose( itemId );
				this.inProgressRefresh[itemId] = true;
				continue;
			} else if ( !this.itemList[itemId] || this.itemList[itemId] instanceof Null ) {
				// This mostly should not happen but might if refresh on page load is set or with radio buttons.
				var elm = this.elmList[itemId];
				this.setValueProperties( elm, getValueOfElm( elm, this.mappingInput[itemId] ) );
				if ( this.elmList[itemId].type !== 'radio' ) {
					console.log( "Tried to refresh field " + itemId + " with no formula" );
				}
				continue;
			}
			this.inProgressRefresh[itemId] = true;
			var elm = this.elmList[itemId];
			// Special handling for radio buttons to prevent loops from indirect clicks.
			// If someone clicked a different radio button, we want to refresh dependencies of the unclicked button that is now deselected
			// but we don't want to re-evaluate its formula which might reselect it.
			if ( elm.type === 'radio' && this.inProgressRefresh['--radio-' + elm.name.replace( /^calcgadget-\d+-/, '' )] ) {
				this.setValueProperties( elm, getValueOfElm( elm, this.mappingInput[itemId] ) );
				continue;
			}

			var res = this.evaluate( this.itemList[itemId] );
			this.setValue( elm, res );
		}
	};

	CalculatorWidgets.prototype.setValue = function( elm, res ) {
		this.setValueProperties( elm, res );
		var mappingOut = this.mappingOutput[elm.id.replace( /^(?:calcdisambig-\d+-)?calculator-field-/, '' )]
		if ( elm.tagName === 'INPUT' ) {
			if ( elm.type === 'range' ) {
				elm.value = res;
			} else if ( elm.type === 'number' ) {
				// We support some formatting types but not others
				// as browser still expects this to be a number.
				elm.setAttribute( 'data-calculator-real-value', res );
				elm.value = formatNumeric( res, elm.dataset );
			} else if ( elm.type === 'radio' || elm.type === 'checkbox' ) {
				elm.checked = !isNaN( res ) && !almostEquals( res, 0 );
				if ( !elm.checked && elm.dataset.calculatorValue ) {
					// If we are unchecking this box, set its value back to the default
					// so that if a human rechecks it, the value of the control is the default
					// value and not the last value of the formula.
					elm.value = elm.dataset.calculatorValue;
				}
			} else {
				elm.setAttribute( 'data-calculator-real-value', res );
				elm.value = format( res, elm.dataset, mappingOut );
			}
		} else if ( elm.tagName === 'SELECT' ) {
			elm.value = res;
		} else if ( elm.dataset.calculatorType !== 'passthru' ) {
			// plain type.
			elm.setAttribute( 'data-calculator-real-value', res );
			elm.textContent = format( res, elm.dataset, mappingOut );
		}
	}

	// Set a calculator container to busy, which pauses some screen readers until everything is updated.
	// Returns a callback to unset to busy.
	CalculatorWidgets.prototype.setBusy = function () {
		var curVal = this.parent.getAttribute( 'aria-busy' );
		if ( curVal === 'true' ) {
			return function () {};
		}
		this.parent.setAttribute( 'aria-busy', 'true' );
		var that = this;
		return function () {
			that.parent.setAttribute( 'aria-busy', 'false' );
		};
	}

	CalculatorWidgets.prototype.evaluate = evaluate;

	mw.hook( 'wikipage.content' ).add( setup );
} )();
