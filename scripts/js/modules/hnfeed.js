	/**
	 * @name hnFeed
	 * 	-> tagFeed Module @see tagFeed()
	 * Retrieves feed from HN based on Tags. jQuery + UI Required.
	 *
	 * @author Ryoku Weil (w45p) | http://www.ryoku-weil.biz
	 * @version 27-12-2012
	 * 
	 * @param debug Bool Show debugging output on console. Defaults to False
	 * @param verbose Bool Show detailed step information on console. Defaults to False
	 *
	 */
	function hnFeed(q,debug,verbose) 
	{ 
		/*
		* Default query:
		*/
		this.defaultQ= [];
		
		/*
		 *	HN API - CONFIGURATION.
		 */
		this.url="http://api.thriftdb.com/api.hnsearch.com/items/";
		this.autoUrl="http://news.ycombinator.com/item?id="
		this.searchStr="_search";
		this.urlParams={
			'limit':'50'
			,'filter[fields][type]':'submission'
			,'pretty_print':'false'
			,'highlight[markup_items]':'true'
			,'weights[title]':'1.1'
			,'weights[text]':'0.7'
			,'weights[domain]':'2.0'
			,'weights[username]':'0.1'
			,'weights[type]':'0.0'
			,'boosts[fields][points]':'0.15'
			,'boosts[fields][num_comments]':'0.15'
			,'boosts[functions][pow(2,div(div(ms(create_ts,NOW),3600000),72))]':'200.0'
		};
		
		/*
		 *	Initialize all vars.
		 */
		this.q=q;
		this.results=new Object();
		this.hits=0;
		
		
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
				console.log("-- hnFeed Class -FATAL ERROR- :: " + message);
			return;
		};
		/**
		 * Prints warning messages in console. ONLY with debug mode enabled.
		 * @param (string) message
		 * @return
		 */
		var warning = function(message){
			if(debug)
				console.log("-- hnFeed Class -WARNING- :: " + message);
			return;
		};
		/**
		 * Prints notice messages in console. ONLY with verbose mode enabled.
		 * @param (string) message
		 * @return
		 */
		var notice = function(message){
			if(verbose)
				console.log("-- hnFeed Class -NOTICE- :: " + message);
			return;
		};
		/*	----> Debugging Functions  END <----	*/
		
		
		/**
		 * Public Method fetchNews()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.fetchNews = function() {
			var _self=this, endUrl='', preUrl='', tags='', watcher=$('#watcher');
			notice("Fetching HN news...");
			
			for (var i = 0; i < _self.q.length; i++) {
				tags+=_self.q[i];
				if((i+1) < _self.q.length)
					tags+=" OR ";
			}

			for (var i in _self.urlParams)
				preUrl+="&" + i + "=" + _self.urlParams[i];
			endUrl=_self.url + _self.searchStr + "?q=" + tags + preUrl;
			
			$.ajax({	
				url: endUrl,
				dataType: "jsonp",
				success: function(data,textStatus,jqXHR){	
					_self.hits=data.hits;
					notice("Found hits: " + data.hits);
					for( var i in data.results){
						if(data.results[i].item.url==null)
							data.results[i].item.url=_self.autoUrl+data.results[i].item.id
						_self.results[i]=data.results[i].item;
					}
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
				complete: function(){
					watcher.change();
				}
			});	
		};		
		
		
		/**
		 * Public Method fetchNews()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.renderError = function() {
			this.hits=-1;
			this.results="Error: " + this.oops.errorThrown + " - " + this.oops.textStatus;
		};
		
		 
		/**
		 * Public Method checkParams()
		 * Validates parameters.
		 * Fixes misshapenings.
		 * @return true
		 */
		this.checkQ = function(){	
			notice("Checking query tags...");
			if(this.q.length === 0){
				warning("If a query is sent, it must be an Array. Resetting to default");
				if(this.defaultQ.length instanceof Array){
					warning("defaultQ must be an array. Setting queries to empty.");
					this.q=[];
					return
				}
				this.q=this.defaultQ;
			}
		};
		
		
		/**
		 * Public Method init()
		 * Merges user options with default parameters.
		 * Calls create().
		 */
		this.init = function() {
			notice("Initializing HN Feed Module...");
			this.checkQ();
			this.fetchNews();
		};
		
		
		/*	
		 * 	Actually do stuff:
		 *	Check for integrity of received params and merge.
		 */

		
		// Initialize.
		this.init();	
	}