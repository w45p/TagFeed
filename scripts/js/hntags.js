	/**
	 * @name hnTags
	 * Generates feed from HN based on tags defined by the user. jQuery + UI Required.
	 *
	 * @author Ryoku Weil (w45p) | http://www.ryoku-weil.biz
	 * @version 26-12-2012
	 * 
	 * @param debug Bool Show debugging output on console. Defaults to False
	 * @param verbose Bool Show detailed step information on console. Defaults to False
	 *
	 * Methods: create, showMe, hideMe, setContent, destroy, toggle
	 */
	function hnTags(params,debug,verbose) 
	{ 
		/*
		* Default params:
		*/
		this.defaultParams= {
				  container  : $('body')  	 // Where to render. Element pointer or jQuery Object.
				, style      : 'hntags'      // CSS Class Name Prefix. String.
				, autoLoad   : false   		 // Attempt to load cookie tags automatically? Boolean.
				, id    	 : 'autoHnTags'	 // Custom ID for the frame element. String.
		};
		
		/*
		 *	HN API - CONFIGURATION.
		 */
		this.url="http://api.thriftdb.com/api.hnsearch.com/items/";
		this.searchStr="_search";
		this.urlParams={
			 'filter[fields][type]':'submission'
			,'pretty_print':'false'
			,'highlight[markup_items]':'true'
		};
		
		/*
		 *	Initialize all vars.
		 */
		this.options=null;
		this.PNode=null;
		this.q='';
		this.news=null;
		this.oops=null;
		this.qArr=new Array();
		this.lastSearch=null;

		
		/*
		 * ----> Debugging Functions START<----
		 * Private Methods error(message); warning(message); notice(message).
		 * Will only trigger if verbose/debug are set to true.
		 * -- Parameters: message.
		 */
		var verbose = typeof verbose !== 'undefined' ? verbose : false;
		var debug = typeof debug !== 'undefined' ? debug : false;
		/**
		 * Prints error messages in console. ONLY with debug mode enabled.
		 * @param (string) message
		 * @return
		 */
		var error = function(message){
			if(debug)
				console.log("-- hnTags Class -FATAL ERROR- :: " + message);
			return;
		};
		/**
		 * Prints warning messages in console. ONLY with debug mode enabled.
		 * @param (string) message
		 * @return
		 */
		var warning = function(message){
			if(debug)
				console.log("-- hnTags Class -WARNING- :: " + message);
			return;
		};
		/**
		 * Prints notice messages in console. ONLY with verbose mode enabled.
		 * @param (string) message
		 * @return
		 */
		var notice = function(message){
			if(verbose)
				console.log("-- hnTags Class -NOTICE- :: " + message);
			return;
		};
		/*	----> Debugging Functions  END <----	*/
		 
		 
		
		
		
		
		/**
		 * Public Method setPNode()
		 * Renders and sets parent node (PNode),
		 */
		this.setPNode = function(){
			if($("#" + this.options.id).length == 0) {
				jQuery('<div/>', {
					id: this.options.id
				}).appendTo(this.options.container);
				notice("Parent created: #" + this.options.id);
			};
			$("#" + this.options.id).empty()
			this.PNode=$("#" + this.options.id);
			notice("Parent Node Set.");
		};

		
		/**
		 * Public Method fetchNews()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.fetchNews = function() {
			var _self=this, endUrl='', preUrl='';
			notice("Fetching HN news...");
			for (var i in _self.urlParams)
				preUrl+="&" + i + "=" + _self.urlParams[i];
			endUrl=_self.url + _self.searchStr + "?q=" + _self.q + preUrl;
			
			$.ajax({	
				url: endUrl,
				dataType: "jsonp",
				success: function(data,textStatus,jqXHR){	
					_self.news=data;
					_self.renderNews();
				},
				error: function(jqXHR,textStatus,errorThrown){
					_self.oops={jqXHR:jqXHR,textStatus:textStatus,errorThrown:errorThrown};
					_self.renderError();
				},
				statusCode: {
					404: function() {
						_self.oops={jqXHR:'',textStatus:"Woopsies! That thing you're looking for must have been eaten by monkeys.",errorThrown:404};
						_self.renderError();
					},
					500: function() {
						_self.oops={jqXHR:'',textStatus:"Oops! There was a problem with the server. Are you doing weird things with your query tags?",errorThrown:500};
						_self.renderError();
					},
					503: function() {
						_self.oops={jqXHR:'',textStatus:"I'm sorry, the service seems to be down. Please try again later.",errorThrown:503};
						_self.renderError();
					}
				},
			});	
		};
		
		
		/**
		 * Public Method fetchNews()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.renderNews = function() {
			this.lastSearch=this.news;
			console.debug(this.news);
			for (var i in this.news.results){
				jQuery('<div>' + this.news.results[i].item.title + '</div>', {
					id: this.news.results[i].item.id,
				}).appendTo(this.PNode);
			}
		};
		
		
		/**
		 * Public Method fetchNews()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.renderError = function() {
			this.options.container.html("Error: " + this.oops.errorThrown + " - " + this.oops.textStatus );
		};
		
		 
		/**
		 * Public Method checkParams()
		 * Validates parameters.
		 * Fixes misshapenings.
		 * @return true
		 */
		this.checkParams = function(){	

			if(typeof this.options.container == 'string'){
				this.options.container = $(this.options.container);
			} else if((this.options.container instanceof jQuery)===false){
				warning("container must be a string or a jQuery object. Resetting to default.");
				this.options.container=this.defaultParams.container;
				if(typeof this.options.container == 'string'){
					this.options.container = $(this.options.container);
				} else if((this.options.container instanceof jQuery)===false){
					warning("default container must be a string/jQuery Object. Setting to 'body'.");
					this.options.container=$('body');
				}
			}

			if (this.options.container.length <= 0)
				this.options.container.appendTo($('body'));
			
			if(typeof this.options.style != 'string'){
				warning("style must be a string. Resetting to default.");
				this.options.style=this.defaultParams.style;
				if(typeof this.options.style != 'string'){
					this.options.style='autoHNclass';
					warning("default style must be a string. Setting to 'autoHNclass'.");
				}
			}
				this.options.style = this.options.style.replace('.', '');
				this.options.style = this.options.style.replace('#', '');
			
			if(typeof this.options.id != 'string'){
				warning("id must be a string. Resetting to default.");
				this.options.id=this.defaultParams.id;
				if(typeof this.options.id != 'string'){
					this.options.id='autoHNid';
					warning("default id must be a string. Setting to 'autoHNid'.");
				}
			}
				this.options.id = this.options.id.replace('.', '');
				this.options.id = this.options.id.replace('#', '');
				
			if ($('#' + this.options.id).length > 0)
				warning("an element with the same id '" + this.options.id + "' already exists. Issues may arise.");
			
			return true;
		};
		
		
		/**
		 * Public Method init()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.init = function() {
			notice("Initializing...");
			if(this.options.autoLoad){
				this.fetchTags();
				this.setTags();
			}
			this.setPNode();
			this.fetchNews();
		};
		
		
		/*	
		 * 	Actually do stuff:
		 *	Check for integrity of received params and merge.
		 */
		 notice("Checking parameters...");
		if(typeof params !== 'object' && params !== null){
			warning("If Params are sent, they MUST be an Object-- Resetting to default.");
			params=this.defaultParams;
		}
		this.options = $.extend( {}, this.defaultParams, params);
		notice("User Params + Default Params merged.");
		
		if(!this.checkParams){
			warning("HERE");
			return false;
		}
		
		// Initialize.
		this.init();	
	}